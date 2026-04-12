import { useState, useCallback, useRef, useEffect } from 'react';
import * as mockService from '@/data/utm-builder/mockService';
import type { UTMCode, UTMBulkCreateItem } from '../types/utm_codes';
import type { ExistingRow, NewRow, SheetRow, CellPos, ColKey, RangeSelection } from '../types/sheet';
import { COLS, getRangeBounds } from '../types/sheet';
import type { MasterData } from './useSheetMasterData';

const MAX_UNDO_STACK = 50;

function toExistingRow(u: UTMCode): ExistingRow {
  return {
    kind: 'existing',
    id: u.id,
    productName: u.product_name || '',
    brandName: u.brand_name || '',
    marketerName: u.marketer_name || '',
    plannerName: u.planner_name || '',
    creatorName: u.creator_name || '',
    mediaName: u.media_name || '',
    contentTypeName: u.content_type_name || '',
    placementName: u.placement_name || '',
    landingNumber: u.landing_display || '',
    sequence: u.sequence || '',
    utmCode: u.utm_code || '',
    adUrl: u.ad_url || '',
    createdAt: u.created_at,
    mediaInitial: u.media_initial || '',
    contentTypeInitial: u.content_type_initial || '',
    placementInitial: u.placement_initial || '',
    plannerInitial: u.planner_initial || '',
    marketerInitial: u.marketer_initial || '',
    creatorInitial: u.creator_initial || '',
  };
}

export function makeNewRow(): NewRow {
  return {
    kind: 'new',
    id: (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36)),
    productId: null,
    marketerId: '',
    plannerId: '',
    creatorId: '',
    mediaId: '',
    contentTypeId: '',
    placementId: '',
    landingId: '',
    sequence: '',
    simpleUrl: false,
  };
}

function isNewRowEmpty(row: NewRow): boolean {
  return !row.marketerId && !row.plannerId && !row.creatorId &&
    !row.mediaId && !row.contentTypeId && !row.placementId;
}

function isRowComplete(row: NewRow, activeProductId: string | null): boolean {
  return !!(
    row.marketerId && row.plannerId && row.creatorId &&
    row.mediaId && row.contentTypeId && row.placementId &&
    row.landingId && row.sequence &&
    (row.productId || activeProductId)
  );
}

const INITIAL_EMPTY_ROWS = 25;

function createInitialNewRows(): NewRow[] {
  return Array.from({ length: INITIAL_EMPTY_ROWS }, makeNewRow);
}

export function useSheetState() {
  const [existingRows, setExistingRows] = useState<ExistingRow[]>([]);
  const [newRows, setNewRows] = useState<NewRow[]>(createInitialNewRows);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [activeMediaId, setActiveMediaId] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<CellPos | null>(null);
  const [existingPage, setExistingPage] = useState(0);
  const [hasMoreRows, setHasMoreRows] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sequenceLoadingIds, setSequenceLoadingIds] = useState<Set<string>>(new Set());
  const [knownExistingUtmCodes, setKnownExistingUtmCodes] = useState<Set<string>>(new Set());
  const [saveError, setSaveError] = useState<string | null>(null);

  function computeUtmCodeFromRow(row: NewRow, md: MasterData, activeProdId: string | null): string {
    const productId = row.productId || activeProdId || '';
    const product = md.products.get(productId);
    const media = md.media.get(row.mediaId);
    const ct = md.contentTypes.get(row.contentTypeId);
    const pl = md.placements.get(row.placementId);
    const ln = row.landingId ? (product?.landing_numbers || []).find(l => l.id === row.landingId) : null;
    const planner = md.employees.get(row.plannerId);
    const marketer = md.employees.get(row.marketerId);
    const creator = md.employees.get(row.creatorId);
    const base = `${media?.initial || ''}${ln?.initial || ''}${ct?.initial || ''}${pl?.initial || ''}${product?.initial || ''}${planner?.initial || ''}${marketer?.initial || ''}${creator?.initial || ''}`;
    if (!base || !row.sequence) return '';
    return `ue_${base}${row.sequence}`;
  }

  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // favorites: Set<string> (localStorage 영속)
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('sheet-favorites');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const masterDataRef = useRef<MasterData | null>(null);
  const checkedUtmCodesRef = useRef<Set<string>>(new Set());

  // Undo/Redo 스택
  const undoStack = useRef<NewRow[][]>([]);
  const redoStack = useRef<NewRow[][]>([]);

  const pushUndo = useCallback((currentRows: NewRow[]) => {
    undoStack.current.push([...currentRows]);
    if (undoStack.current.length > MAX_UNDO_STACK) {
      undoStack.current.shift();
    }
    redoStack.current = [];
  }, []);

  const setMasterDataRef = useCallback((md: MasterData) => {
    masterDataRef.current = md;
  }, []);

  const toggleFavorite = useCallback((key: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      localStorage.setItem('sheet-favorites', JSON.stringify([...next]));
      return next;
    });
  }, []);

  const loadExistingRows = useCallback(async (productId: string, mediaId: string, limit: number = 5) => {
    const md = masterDataRef.current;
    if (!md) return;

    const product = md.products.get(productId);
    const media = md.media.get(mediaId);
    if (!product || !media) return;

    setLoading(true);
    try {
      // mockService로 교체: product_initials, media_initials 필터
      const response = await mockService.getUTMCodes({
        product_initials: [product.initial],
        media_initials: [media.initial],
        limit,
        page: 1,
        sort_key: 'created_at',
        sort_dir: 'desc',
      });
      const rows = response.items.map(toExistingRow).reverse();
      setExistingRows(rows);
      setExistingPage(1);
      setHasMoreRows(response.total > limit);
      setTotalCount(response.total);
    } catch (err) {
      console.error('Failed to load existing rows:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectContext = useCallback((productId: string, mediaId: string) => {
    setActiveProductId(productId);
    setActiveMediaId(mediaId);
    setNewRows(createInitialNewRows());
    setKnownExistingUtmCodes(new Set());
    checkedUtmCodesRef.current = new Set();
    setSelectedCell(null);
    setExistingRows([]);
    setExistingPage(0);
    setHasMoreRows(true);
    setTotalCount(0);
  }, []);

  const ensureTrailingEmptyRows = useCallback(() => {
    setNewRows(prev => {
      let lastDataIdx = -1;
      for (let i = prev.length - 1; i >= 0; i--) {
        if (!isNewRowEmpty(prev[i])) { lastDataIdx = i; break; }
      }
      const needed = Math.max(INITIAL_EMPTY_ROWS, lastDataIdx + 3) - prev.length;
      if (needed <= 0) return prev;
      const extras = Array.from({ length: needed }, makeNewRow);
      return [...prev, ...extras];
    });
  }, []);

  // 시퀀스에 영향을 주는 필드 목록
  const SEQUENCE_AFFECTING_FIELDS: (keyof NewRow)[] = [
    'mediaId', 'landingId', 'contentTypeId', 'placementId',
    'productId', 'plannerId', 'marketerId', 'creatorId',
  ];

  const updateNewRowField = useCallback((id: string, field: keyof NewRow, value: string) => {
    setNewRows(prev => {
      pushUndo(prev);
      const next = prev.map(row => {
        if (row.id !== id) return row;
        const updated = { ...row, [field]: value };
        if (!updated.productId && value && field !== 'productId') {
          updated.productId = activeProductId;
        }
        if (!updated.mediaId && value && field !== 'mediaId') {
          updated.mediaId = activeMediaId ?? '';
        }
        if (SEQUENCE_AFFECTING_FIELDS.includes(field) && updated.sequence) {
          updated.sequence = '';
        }
        return updated;
      });

      const updatedRow = next.find(r => r.id === id);
      if (updatedRow && updatedRow.kind === 'new' && !(field === 'sequence' && value === '')) {
        const r = updatedRow;
        const productId = r.productId || activeProductId || '';
        if (
          !r.sequence &&
          r.mediaId && r.landingId && r.contentTypeId && r.placementId &&
          productId && r.plannerId && r.marketerId && r.creatorId
        ) {
          setSequenceLoadingIds(s => new Set(s).add(id));
          // mockService로 교체
          mockService.suggestSequence({
            media_id: r.mediaId,
            landing_number_id: r.landingId,
            content_type_id: r.contentTypeId,
            placement_id: r.placementId,
            product_id: productId,
            planner_id: r.plannerId,
            marketer_id: r.marketerId,
            creator_id: r.creatorId,
          }).then(result => {
            setNewRows(rows => {
              const target = rows.find(rr => rr.id === id);
              if (!target) return rows;
              const targetProductId = target.productId || activeProductId || '';
              const pad = result.next_available.length;
              const usedSeqs = new Set<number>();
              rows.forEach(row => {
                if (row.id === id || !row.sequence) return;
                if (
                  row.mediaId === target.mediaId &&
                  row.landingId === target.landingId &&
                  row.contentTypeId === target.contentTypeId &&
                  row.placementId === target.placementId &&
                  (row.productId || activeProductId || '') === targetProductId &&
                  row.plannerId === target.plannerId &&
                  row.marketerId === target.marketerId &&
                  row.creatorId === target.creatorId
                ) {
                  usedSeqs.add(parseInt(row.sequence, 10));
                }
              });
              let seqNum = parseInt(result.next_available, 10);
              while (usedSeqs.has(seqNum)) seqNum++;
              const finalSeq = String(seqNum).padStart(pad, '0');
              return rows.map(row => row.id === id ? { ...row, sequence: finalSeq } : row);
            });
          }).catch(() => {
            // 실패 시 무시
          }).finally(() => {
            setSequenceLoadingIds(s => { const ns = new Set(s); ns.delete(id); return ns; });
          });
        }
      }

      return next;
    });
    setTimeout(ensureTrailingEmptyRows, 0);
  }, [activeProductId, activeMediaId, ensureTrailingEmptyRows, pushUndo]);

  const toggleSimpleUrl = useCallback((id: string, value: boolean) => {
    setNewRows(prev => prev.map(row => row.id === id ? { ...row, simpleUrl: value } : row));
  }, []);

  const selectCell = useCallback((pos: CellPos | null) => {
    setSelectedCell(pos);
  }, []);

  const loadMoreRows = useCallback(async () => {
    const md = masterDataRef.current;
    if (!md || !activeProductId || !activeMediaId) return;
    const product = md.products.get(activeProductId);
    const media = md.media.get(activeMediaId);
    if (!product || !media) return;

    const nextPage = existingPage + 1;
    setLoading(true);
    try {
      // mockService로 교체
      const response = await mockService.getUTMCodes({
        product_initials: [product.initial],
        media_initials: [media.initial],
        limit: 5,
        page: nextPage,
        sort_key: 'created_at',
        sort_dir: 'desc',
      });
      const moreRows = response.items.map(toExistingRow).reverse();
      setExistingRows(prev => [...moreRows, ...prev]);
      setExistingPage(nextPage);
      setHasMoreRows(response.total > nextPage * 5);
      setTotalCount(response.total);
    } finally {
      setLoading(false);
    }
  }, [existingPage, activeProductId, activeMediaId]);

  const applyFill = useCallback((srcIndex: number, targetIndex: number, colKey: ColKey) => {
    const allRows = [...newRows];
    const srcRow = allRows[srcIndex];
    if (!srcRow || srcRow.kind !== 'new') return;

    const start = Math.min(srcIndex, targetIndex);
    const end = Math.max(srcIndex, targetIndex);

    setNewRows(prev => {
      pushUndo(prev);
      const next = [...prev];

      if (colKey === 'product') {
        for (let i = start; i <= end; i++) {
          if (i === srcIndex) continue;
          const row = next[i];
          if (!row || row.kind !== 'new') continue;
          if (row.productId) continue;
          next[i] = { ...row, productId: srcRow.productId };
        }
        return next;
      }

      if (colKey === 'utmCode' || colKey === 'adUrl') {
        const srcSeqNum = parseInt(srcRow.sequence || '1', 10);
        const seqPad = (srcRow.sequence || '001').length;
        const copyFields: (keyof NewRow)[] = [
          'marketerId', 'plannerId', 'creatorId',
          'mediaId', 'contentTypeId', 'placementId', 'landingId',
        ];
        for (let i = start; i <= end; i++) {
          if (i === srcIndex) continue;
          const row = next[i];
          if (!row || row.kind !== 'new') continue;
          const rowCopy = { ...row };
          copyFields.forEach(f => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (rowCopy as any)[f] = (srcRow as any)[f] || '';
          });
          const newSeq = srcSeqNum + (i - srcIndex);
          rowCopy.sequence = String(Math.max(1, newSeq)).padStart(seqPad, '0');
          if (!rowCopy.productId) rowCopy.productId = srcRow.productId;
          next[i] = rowCopy;
        }
        return next;
      }

      if (colKey === 'sequence') {
        const srcVal = srcRow.sequence;
        const numVal = parseFloat(srcVal);
        const isNumeric = srcVal !== '' && !isNaN(numVal);
        const padLen = (isNumeric && /^0\d/.test(srcVal)) ? srcVal.length : 0;

        for (let i = start; i <= end; i++) {
          if (i === srcIndex) continue;
          const row = next[i];
          if (!row || row.kind !== 'new') continue;
          let newVal: string;
          if (isNumeric) {
            const offset = i - srcIndex;
            const newNum = numVal + offset;
            newVal = padLen > 0
              ? String(Math.max(1, newNum)).padStart(padLen, '0')
              : String(newNum);
          } else {
            newVal = srcVal;
          }
          next[i] = { ...row, sequence: newVal };
        }
        return next;
      }

      const fieldMap: Partial<Record<ColKey, keyof NewRow>> = {
        marketer: 'marketerId',
        planner: 'plannerId',
        creator: 'creatorId',
        media: 'mediaId',
        contentType: 'contentTypeId',
        placement: 'placementId',
        landing: 'landingId',
      };
      const field = fieldMap[colKey];
      if (!field) return next;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const srcVal = (srcRow as any)[field] as string;

      for (let i = start; i <= end; i++) {
        if (i === srcIndex) continue;
        const row = next[i];
        if (!row || row.kind !== 'new') continue;
        next[i] = { ...row, [field]: srcVal };
      }
      return next;
    });

    setTimeout(ensureTrailingEmptyRows, 0);
  }, [newRows, ensureTrailingEmptyRows, pushUndo]);

  const fieldMap: Partial<Record<ColKey, keyof NewRow>> = {
    marketer: 'marketerId',
    planner: 'plannerId',
    creator: 'creatorId',
    media: 'mediaId',
    contentType: 'contentTypeId',
    placement: 'placementId',
    landing: 'landingId',
    sequence: 'sequence',
  };

  const applyFillRange = useCallback((
    srcRowStart: number,
    srcRowEnd: number,
    srcColStart: number,
    srcColEnd: number,
    targetRowEnd: number
  ) => {
    setNewRows(prev => {
      pushUndo(prev);
      const visibleExistingCount = existingRows.length;
      const next = [...prev];

      const goingDown = targetRowEnd > srcRowEnd;
      const targetStart = goingDown ? srcRowEnd + 1 : targetRowEnd;
      const targetEnd = goingDown ? targetRowEnd : srcRowStart - 1;

      for (let ci = srcColStart; ci <= srcColEnd; ci++) {
        const col = COLS[ci];
        if (col === 'utmCode' || col === 'adUrl' || col === 'product' || col === 'media') continue;

        const srcValues: string[] = [];
        for (let ri = srcRowStart; ri <= srcRowEnd; ri++) {
          const newRowIdx = ri - visibleExistingCount;
          if (newRowIdx < 0 || newRowIdx >= prev.length) continue;
          const row = prev[newRowIdx];
          if (!row || row.kind !== 'new') continue;

          if (col === 'sequence') {
            srcValues.push(row.sequence);
          } else {
            const f = fieldMap[col];
            srcValues.push(f ? (row[f] as string) || '' : '');
          }
        }

        if (srcValues.length === 0) continue;

        const numericValues = srcValues.map(v => parseFloat(v));
        const allNumeric = srcValues.every(v => v !== '' && !isNaN(parseFloat(v)));
        const padLen = allNumeric && /^0\d/.test(srcValues[0]) ? srcValues[0].length : 0;

        let step = 1;
        if (allNumeric && srcValues.length >= 2) {
          step = numericValues[1] - numericValues[0];
        }

        for (let ri = targetStart; ri <= targetEnd; ri++) {
          const newRowIdx = ri - visibleExistingCount;
          if (newRowIdx < 0 || newRowIdx >= prev.length) continue;
          const row = next[newRowIdx];
          if (!row || row.kind !== 'new') continue;

          const offset = goingDown ? ri - srcRowEnd : ri - srcRowStart;
          const cycleIdx = Math.abs(offset - 1) % srcValues.length;

          let newVal: string;

          if (allNumeric) {
            const lastSrc = numericValues[numericValues.length - 1];
            const newNum = lastSrc + (goingDown ? offset : offset + srcValues.length - 1) * step;
            newVal = padLen > 0
              ? String(Math.max(1, Math.round(newNum))).padStart(padLen, '0')
              : String(newNum);
          } else {
            newVal = srcValues[cycleIdx];
          }

          if (col === 'sequence') {
            next[newRowIdx] = { ...row, sequence: newVal };
          } else {
            const f = fieldMap[col];
            if (f) next[newRowIdx] = { ...row, [f]: newVal };
          }
        }
      }

      return next;
    });

    setTimeout(ensureTrailingEmptyRows, 0);
  }, [existingRows, ensureTrailingEmptyRows, pushUndo]);

  const clearCells = useCallback((range: RangeSelection) => {
    const bounds = getRangeBounds(range, COLS);
    const visibleExistingCount = existingRows.length;

    setNewRows(prev => {
      pushUndo(prev);
      const next = [...prev];
      for (let ri = bounds.minRow; ri <= bounds.maxRow; ri++) {
        const newRowIdx = ri - visibleExistingCount;
        if (newRowIdx < 0 || newRowIdx >= prev.length) continue;
        const row = prev[newRowIdx];
        if (!row || row.kind !== 'new') continue;

        const cleared = { ...row };
        for (let ci = bounds.minColIdx; ci <= bounds.maxColIdx; ci++) {
          const col = COLS[ci];
          if (col === 'product' || col === 'media' || col === 'utmCode' || col === 'adUrl') continue;
          if (col === 'sequence') {
            cleared.sequence = '';
          } else {
            const f = fieldMap[col];
            if (f && f !== 'sequence') (cleared as Record<string, unknown>)[f] = '';
          }
        }
        next[newRowIdx] = cleared;
      }
      return next;
    });
  }, [existingRows, pushUndo]);

  const pasteCells = useCallback((
    anchor: CellPos,
    data: string[][],
    getDisplayValueToId: (col: ColKey, label: string) => string | null,
    colOrder?: ColKey[]
  ) => {
    const visibleExistingCount = existingRows.length;

    if (anchor.colKey === 'utmCode') {
      setNewRows(prev => {
        for (let dr = 0; dr < data.length; dr++) {
          const newRowIdx = (anchor.rowIndex + dr) - visibleExistingCount;
          if (newRowIdx < 0 || newRowIdx >= prev.length) continue;
          const row = prev[newRowIdx];
          if (row?.kind === 'new' && data[dr][0]) {
            const rowId = row.id;
            const code = data[dr][0];
            setTimeout(() => updateFromUtmCode(rowId, code), 0);
          }
        }
        return prev;
      });
      return;
    }

    const effectiveOrder = colOrder ?? COLS;
    const anchorColIdx = effectiveOrder.indexOf(anchor.colKey);

    const rowsToSuggest: NewRow[] = [];

    setNewRows(prev => {
      pushUndo(prev);
      const next = [...prev];

      for (let dr = 0; dr < data.length; dr++) {
        const ri = anchor.rowIndex + dr;
        const newRowIdx = ri - visibleExistingCount;
        if (newRowIdx < 0 || newRowIdx >= prev.length) continue;
        const row = prev[newRowIdx];
        if (!row || row.kind !== 'new') continue;

        const PASTE_SKIP_COLS = new Set(['product', 'media', 'utmCode', 'adUrl', 'sequence']);
        const hasMeaningfulData = data[dr].some((rawVal, dc) => {
          const ci = anchorColIdx + dc;
          if (ci >= effectiveOrder.length) return false;
          return !PASTE_SKIP_COLS.has(effectiveOrder[ci]) && rawVal.trim() !== '';
        });
        if (!hasMeaningfulData) continue;

        const updated = { ...row };
        for (let dc = 0; dc < data[dr].length; dc++) {
          const ci = anchorColIdx + dc;
          if (ci >= effectiveOrder.length) continue;
          const col = effectiveOrder[ci];
          const rawVal = data[dr][dc];

          if (col === 'sequence' || col === 'product' || col === 'media' || col === 'utmCode' || col === 'adUrl') {
            continue;
          } else {
            const f = fieldMap[col];
            if (!f) continue;
            const resolvedId = getDisplayValueToId(col, rawVal);
            if (resolvedId !== null) {
              (updated as Record<string, unknown>)[f] = resolvedId;
            }
          }
        }
        if (!updated.productId && activeProductId) updated.productId = activeProductId;
        if (!updated.mediaId && activeMediaId) updated.mediaId = activeMediaId;
        next[newRowIdx] = updated;

        if (
          !updated.sequence &&
          updated.mediaId && updated.landingId && updated.contentTypeId && updated.placementId &&
          (updated.productId || activeProductId) && updated.plannerId && updated.marketerId && updated.creatorId
        ) {
          rowsToSuggest.push(updated);
        }
      }

      return next;
    });

    setTimeout(() => {
      rowsToSuggest.forEach(row => {
        const productId = row.productId || activeProductId || '';
        setSequenceLoadingIds(s => new Set(s).add(row.id));
        // mockService로 교체
        mockService.suggestSequence({
          media_id: row.mediaId,
          landing_number_id: row.landingId,
          content_type_id: row.contentTypeId,
          placement_id: row.placementId,
          product_id: productId,
          planner_id: row.plannerId,
          marketer_id: row.marketerId,
          creator_id: row.creatorId,
        }).then(result => {
          setNewRows(rows => {
            const target = rows.find(r => r.id === row.id);
            if (!target) return rows;
            const targetProductId = target.productId || activeProductId || '';
            const pad = result.next_available.length;
            const usedSeqs = new Set<number>();
            rows.forEach(r => {
              if (r.id === row.id || !r.sequence) return;
              if (
                r.mediaId === target.mediaId &&
                r.landingId === target.landingId &&
                r.contentTypeId === target.contentTypeId &&
                r.placementId === target.placementId &&
                (r.productId || activeProductId || '') === targetProductId &&
                r.plannerId === target.plannerId &&
                r.marketerId === target.marketerId &&
                r.creatorId === target.creatorId
              ) {
                usedSeqs.add(parseInt(r.sequence, 10));
              }
            });
            let seqNum = parseInt(result.next_available, 10);
            while (usedSeqs.has(seqNum)) seqNum++;
            const finalSeq = String(seqNum).padStart(pad, '0');
            return rows.map(r => r.id === row.id ? { ...r, sequence: finalSeq } : r);
          });
        }).catch(() => {
          // 실패 시 무시
        }).finally(() => {
          setSequenceLoadingIds(s => { const ns = new Set(s); ns.delete(row.id); return ns; });
        });
      });
    }, 0);

    setTimeout(ensureTrailingEmptyRows, 0);
  }, [existingRows, activeProductId, activeMediaId, ensureTrailingEmptyRows, pushUndo]);

  const undo = useCallback(() => {
    const prev = undoStack.current.pop();
    if (!prev) return;
    setNewRows(current => {
      redoStack.current.push([...current]);
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    const next = redoStack.current.pop();
    if (!next) return;
    setNewRows(current => {
      undoStack.current.push([...current]);
      if (undoStack.current.length > MAX_UNDO_STACK) {
        undoStack.current.shift();
      }
      return next;
    });
  }, []);

  const fillDown = useCallback((range: RangeSelection) => {
    const bounds = getRangeBounds(range, COLS);
    const visibleExistingCount = existingRows.length;

    setNewRows(prev => {
      pushUndo(prev);
      const next = [...prev];

      const srcRowIdx = bounds.minRow - visibleExistingCount;
      if (srcRowIdx < 0 || srcRowIdx >= prev.length) return prev;
      const srcRow = prev[srcRowIdx];
      if (!srcRow || srcRow.kind !== 'new') return prev;

      for (let ri = bounds.minRow + 1; ri <= bounds.maxRow; ri++) {
        const newRowIdx = ri - visibleExistingCount;
        if (newRowIdx < 0 || newRowIdx >= prev.length) continue;
        const row = next[newRowIdx];
        if (!row || row.kind !== 'new') continue;

        const updated = { ...row };
        for (let ci = bounds.minColIdx; ci <= bounds.maxColIdx; ci++) {
          const col = COLS[ci];
          if (col === 'utmCode' || col === 'adUrl' || col === 'product' || col === 'media') continue;
          if (col === 'sequence') {
            updated.sequence = srcRow.sequence;
          } else {
            const colFieldMap: Partial<Record<ColKey, keyof NewRow>> = {
              marketer: 'marketerId',
              planner: 'plannerId',
              creator: 'creatorId',
              media: 'mediaId',
              contentType: 'contentTypeId',
              placement: 'placementId',
              landing: 'landingId',
            };
            const f = colFieldMap[col];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (f) (updated as any)[f] = (srcRow as any)[f];
          }
        }
        if (!updated.productId && activeProductId) updated.productId = activeProductId;
        if (!updated.mediaId && activeMediaId) updated.mediaId = activeMediaId;
        next[newRowIdx] = updated;
      }

      return next;
    });

    setTimeout(ensureTrailingEmptyRows, 0);
  }, [existingRows, ensureTrailingEmptyRows, pushUndo, activeProductId, activeMediaId]);

  // knownExistingUtmCodes 동기화: 신규 행 UTM 코드 중복 확인 (mockService로 교체)
  useEffect(() => {
    const md = masterDataRef.current;
    if (!md) return;

    newRows.forEach(row => {
      if (!isRowComplete(row, activeProductId)) return;
      const utmCode = computeUtmCodeFromRow(row, md, activeProductId);
      if (!utmCode) return;
      if (checkedUtmCodesRef.current.has(utmCode)) return;
      checkedUtmCodesRef.current.add(utmCode);

      // mockService로 교체
      mockService.getUTMCodes({ utm_code: utmCode, limit: 1 }).then(result => {
        if (result.total > 0) {
          setKnownExistingUtmCodes(prev => {
            if (prev.has(utmCode)) return prev;
            const next = new Set(prev);
            next.add(utmCode);
            return next;
          });
        }
      }).catch(() => {});
    });
  }, [newRows, activeProductId]);

  const updateFromUtmCode = useCallback((id: string, utmCode: string) => {
    const md = masterDataRef.current;
    if (!md) return;

    const code = utmCode.startsWith('ue_') ? utmCode.slice(3) : utmCode;

    function greedyMatch(remaining: string, items: { id: string; initial?: string | null }[]) {
      const sorted = items
        .filter(i => i.initial)
        .sort((a, b) => (b.initial!.length) - (a.initial!.length));
      for (const item of sorted) {
        if (item.initial && remaining.startsWith(item.initial)) {
          return { id: item.id, initial: item.initial };
        }
      }
      return null;
    }

    let remaining = code;
    const updates: {
      mediaId?: string;
      landingId?: string;
      contentTypeId?: string;
      placementId?: string;
      productId?: string;
      plannerId?: string;
      marketerId?: string;
      creatorId?: string;
      sequence?: string;
    } = {};

    const mediaMatch = greedyMatch(remaining, md.mediaList);
    if (mediaMatch) { updates.mediaId = mediaMatch.id; remaining = remaining.slice(mediaMatch.initial.length); }

    const landingSource = activeProductId
      ? (md.products.get(activeProductId)?.landing_numbers || []).map(ln => ({ id: ln.id, initial: ln.initial }))
      : [...md.products.values()].flatMap(p => (p.landing_numbers || []).map(ln => ({ id: ln.id, initial: ln.initial })));
    const landingMatch = greedyMatch(remaining, landingSource);
    if (landingMatch) { updates.landingId = landingMatch.id; remaining = remaining.slice(landingMatch.initial!.length); }

    const ctMatch = greedyMatch(remaining, md.contentTypesList);
    if (ctMatch) { updates.contentTypeId = ctMatch.id; remaining = remaining.slice(ctMatch.initial!.length); }

    const plMatch = greedyMatch(remaining, md.placementsList);
    if (plMatch) { updates.placementId = plMatch.id; remaining = remaining.slice(plMatch.initial!.length); }

    const productMatch = greedyMatch(remaining, md.productsList);
    if (productMatch) { updates.productId = productMatch.id; remaining = remaining.slice(productMatch.initial!.length); }

    const plannerMatch = greedyMatch(remaining, md.employeesList);
    if (plannerMatch) { updates.plannerId = plannerMatch.id; remaining = remaining.slice(plannerMatch.initial!.length); }

    const marketerMatch = greedyMatch(remaining, md.employeesList);
    if (marketerMatch) { updates.marketerId = marketerMatch.id; remaining = remaining.slice(marketerMatch.initial!.length); }

    const creatorMatch = greedyMatch(remaining, md.employeesList);
    if (creatorMatch) { updates.creatorId = creatorMatch.id; remaining = remaining.slice(creatorMatch.initial!.length); }

    const trailingSeq = remaining.match(/(\d+)$/);
    if (trailingSeq) updates.sequence = trailingSeq[1];

    if (Object.keys(updates).length === 0) return;

    const resolvedProductId = updates.productId || activeProductId || '';
    if (updates.landingId && resolvedProductId) {
      const product = md.products.get(resolvedProductId);
      const validLanding = (product?.landing_numbers || []).find(ln => ln.id === updates.landingId);
      if (!validLanding) {
        delete updates.landingId;
      }
    }

    setNewRows(prev => prev.map(row => {
      if (row.id !== id) return row;
      const updated = { ...row, ...updates };
      if (!updated.productId) updated.productId = activeProductId;
      return updated;
    }));
  }, [activeProductId]);

  const saveNewRows = useCallback(async () => {
    const md = masterDataRef.current;
    const completeRows = newRows.filter(row => isRowComplete(row, activeProductId));

    const seenUtmCodes = new Set<string>([
      ...existingRows.map(r => r.utmCode).filter(Boolean),
      ...knownExistingUtmCodes,
    ]);
    const rowsToSave = completeRows.filter(row => {
      const utmCode = md ? computeUtmCodeFromRow(row, md, activeProductId) : '';
      if (utmCode) {
        if (seenUtmCodes.has(utmCode)) return false;
        seenUtmCodes.add(utmCode);
      }
      return true;
    });

    if (rowsToSave.length === 0) return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const items: UTMBulkCreateItem[] = rowsToSave.map(row => {
        const media = md?.media.get(row.mediaId);
        const isCriteo = media?.name === '크리테오' || media?.display_name?.toLowerCase() === 'criteo';
        return {
          media_id: row.mediaId,
          content_type_id: row.contentTypeId,
          placement_id: row.placementId,
          product_id: row.productId || activeProductId || '',
          landing_number_id: row.landingId,
          planner_id: row.plannerId,
          marketer_id: row.marketerId,
          creator_id: row.creatorId,
          sequence: row.sequence,
          simple_url: row.simpleUrl || undefined,
          criteo: isCriteo || undefined,
        };
      });

      // mockService로 교체
      const result = await mockService.bulkCreateUTMCodes(items);

      setSaveSuccess(`${result.success_count}개 저장 완료${result.fail_count > 0 ? `, ${result.fail_count}개 실패` : ''}`);
      setNewRows(createInitialNewRows());

      if (activeProductId && activeMediaId) {
        await loadExistingRows(activeProductId, activeMediaId, result.success_count);
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : '저장 실패');
    } finally {
      setSaving(false);
    }
  }, [newRows, existingRows, knownExistingUtmCodes, activeProductId, activeMediaId, loadExistingRows]);

  // selectContext 이후 loadExistingRows 자동 실행
  useEffect(() => {
    if (activeProductId && activeMediaId && masterDataRef.current) {
      loadExistingRows(activeProductId, activeMediaId, 5);
    }
  }, [activeProductId, activeMediaId]);

  const allRows: SheetRow[] = [
    ...existingRows,
    ...newRows,
  ];

  const pendingNewRows = newRows.filter(row => !isNewRowEmpty(row));

  return {
    existingRows,
    newRows,
    allRows,
    activeProductId,
    activeMediaId,
    selectedCell,
    favorites,
    hasMoreRows,
    totalCount,
    loading,
    saving,
    saveError,
    saveSuccess,
    sequenceLoadingIds,
    pendingNewRows,
    setMasterDataRef,
    toggleFavorite,
    selectContext,
    updateNewRowField,
    selectCell,
    loadMoreRows,
    applyFill,
    applyFillRange,
    clearCells,
    pasteCells,
    saveNewRows,
    ensureTrailingEmptyRows,
    undo,
    redo,
    fillDown,
    setSaveSuccess,
    setSaveError,
    updateFromUtmCode,
    toggleSimpleUrl,
    knownExistingUtmCodes,
  };
}
