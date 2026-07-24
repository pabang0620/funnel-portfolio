import React, { useRef, useState, useCallback, useEffect } from 'react';
import { COLS, COL_LABELS, COL_WIDTHS, isCellInRange, getRangeBounds } from '../../types/sheet';
import type { SheetRow, ExistingRow, NewRow, CellPos, ColKey, DropdownOption, RangeSelection } from '../../types/sheet';
import { Badge } from '../ui/badge';
import { cn, getProductColor } from '../../lib/utils';
import { Copy, Check } from 'lucide-react';
import { SheetDropdown } from './SheetDropdown';
import type { MasterData } from '../../hooks/useSheetMasterData';

const BADGE_COL_KEYS: ColKey[] = ['media', 'landing', 'contentType', 'placement', 'planner', 'marketer', 'creator'];

interface SheetTableProps {
  rows: SheetRow[];
  selectedCell: CellPos | null;
  onSelectCell: (pos: CellPos | null) => void;
  onUpdateNewRowField: (id: string, field: keyof NewRow, value: string) => void;
  onUpdateFromUtmCode: (id: string, utmCode: string) => void;
  onApplyFill: (srcIndex: number, targetIndex: number, colKey: ColKey) => void;
  onApplyFillRange: (srcRowStart: number, srcRowEnd: number, srcColStart: number, srcColEnd: number, targetRowEnd: number) => void;
  masterData: MasterData;
  activeProductId: string | null;
  getLandingOptions: (productId: string | null) => DropdownOption[];
  getEmployeeOptions: () => DropdownOption[];
  getMediaOptions: () => DropdownOption[];
  getContentTypeOptions: () => DropdownOption[];
  getPlacementOptions: () => DropdownOption[];
  rangeSelection: RangeSelection | null;
  onSetRangeSelection: (r: RangeSelection | null) => void;
  openDropdownRequest?: CellPos | null;
  sequenceLoadingIds?: Set<string>;
  onDropdownChange?: (open: boolean) => void;
  totalCount: number;
  onToggleSimpleUrl: (id: string, value: boolean) => void;
  colOrderRef?: React.MutableRefObject<{ orderedCols: ColKey[]; setOrderedCols: React.Dispatch<React.SetStateAction<ColKey[]>> } | null>;
}

function UtmCodeInput({
  computedValue,
  rowId,
  onUpdateFromUtmCode,
}: {
  computedValue: string;
  rowId: string;
  onUpdateFromUtmCode: (id: string, utmCode: string) => void;
}) {
  const [localValue, setLocalValue] = useState<string | null>(null);
  const displayValue = localValue ?? computedValue;

  return (
    <input
      type="text"
      value={displayValue}
      onChange={e => setLocalValue(e.target.value)}
      onBlur={() => {
        if (localValue !== null) {
          onUpdateFromUtmCode(rowId, localValue);
          setLocalValue(null);
        }
      }}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          onUpdateFromUtmCode(rowId, localValue ?? computedValue);
          setLocalValue(null);
          (e.target as HTMLInputElement).blur();
        }
        if (e.key === 'Escape') {
          setLocalValue(null);
          (e.target as HTMLInputElement).blur();
        }
      }}
      onClick={e => e.stopPropagation()}
      data-native-paste="true"
      style={{
        width: '100%', height: '100%',
        border: 'none', outline: 'none',
        background: 'transparent',
        fontSize: 11, padding: '0 6px',
        fontFamily: "'Courier New', monospace",
        color: '#1a73e8',
        cursor: 'text',
      }}
    />
  );
}

function CopyIconButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  }
  return (
    <button
      onClick={handleCopy}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 20, height: '100%',
        border: 'none', background: copied ? 'rgba(34,197,94,0.15)' : 'transparent',
        cursor: 'pointer', padding: '0 2px',
        color: copied ? '#22c55e' : hovered ? '#1a73e8' : '#bdbdbd',
        transition: 'color 0.15s, background 0.15s',
      }}
      title="복사"
    >
      {copied ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />}
    </button>
  );
}

function CopyableCell({ value, colKey }: { value: string; colKey: ColKey }) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  }

  const bgColor = copied ? 'rgba(34,197,94,0.15)' : hovered ? 'rgba(26,115,232,0.07)' : 'transparent';

  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 4px',
        gap: 4,
        background: bgColor,
        transition: 'background 0.15s',
        height: '100%',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {value && (
        <button
          onClick={handleCopy}
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 18,
            height: 18,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: 0,
            color: copied ? '#22c55e' : hovered ? '#1a73e8' : '#bdbdbd',
            opacity: 1,
            transition: 'color 0.15s',
          }}
          title="복사"
        >
          {copied ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />}
        </button>
      )}
      <span
        style={{
          flex: 1,
          fontSize: 11,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: colKey === 'utmCode' ? '#1a73e8' : '#5f6368',
          fontFamily: "'Courier New', monospace",
        }}
      >
        {value || ''}
      </span>
    </span>
  );
}

interface DropdownState {
  rowId: string;
  colKey: ColKey;
  options: DropdownOption[];
  anchorEl: HTMLElement | null;
  currentValue: string;
}

const DROPDOWN_COLS: ColKey[] = ['marketer', 'planner', 'creator', 'contentType', 'placement', 'landing'];

const LS_COL_ORDER_KEY = 'utm-sheet-column-order';

function loadColOrder(): ColKey[] {
  try {
    const stored = localStorage.getItem(LS_COL_ORDER_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ColKey[];
      if (parsed.length === COLS.length && COLS.every(c => parsed.includes(c))) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return [...COLS];
}

export function SheetTable({
  rows,
  selectedCell,
  onSelectCell,
  onUpdateNewRowField,
  onUpdateFromUtmCode,
  onApplyFill,
  onApplyFillRange,
  masterData,
  activeProductId,
  getLandingOptions,
  getEmployeeOptions,
  getMediaOptions,
  getContentTypeOptions,
  getPlacementOptions,
  rangeSelection,
  onSetRangeSelection,
  openDropdownRequest,
  sequenceLoadingIds,
  onDropdownChange,
  totalCount: _totalCount,
  onToggleSimpleUrl,
  colOrderRef,
}: SheetTableProps) {
  const [dropdown, setDropdown] = useState<DropdownState | null>(null);
  const MARK_STORAGE_KEY = 'utm-sheet-marked-cells';
  const [markedCells, setMarkedCells] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(MARK_STORAGE_KEY);
      return saved ? new Set(JSON.parse(saved) as string[]) : new Set();
    } catch { return new Set(); }
  });
  const [contextMenu, setContextMenu] = useState<{
    x: number; y: number; rowId: string; colKey: ColKey; simpleUrl?: boolean;
  } | null>(null);
  const [orderedCols, setOrderedCols] = useState<ColKey[]>(loadColOrder);

  useEffect(() => {
    if (colOrderRef) colOrderRef.current = { orderedCols, setOrderedCols };
  }, [colOrderRef, orderedCols]);

  const openDropdown = useCallback((state: DropdownState) => {
    onDropdownChange?.(true);
    setDropdown(state);
  }, [onDropdownChange]);

  const closeDropdown = useCallback(() => {
    onDropdownChange?.(false);
    setDropdown(null);
  }, [onDropdownChange]);

  useEffect(() => {
    if (!openDropdownRequest) return;
    const { rowIndex, colKey } = openDropdownRequest;
    const row = rows[rowIndex];
    if (!row || row.kind !== 'new') { onDropdownChange?.(false); return; }
    if (!DROPDOWN_COLS.includes(colKey)) { onDropdownChange?.(false); return; }
    const td = document.querySelector(
      `td[data-row-index="${rowIndex}"][data-col="${colKey}"]`
    ) as HTMLTableCellElement | null;
    if (!td) { onDropdownChange?.(false); return; }
    const newRow = row as NewRow;
    const options = getDropdownOptions(colKey, newRow);
    openDropdown({
      rowId: newRow.id,
      colKey,
      options,
      anchorEl: td,
      currentValue: getCurrentDropdownValue(newRow, colKey),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openDropdownRequest]);

  const fillDragRef = useRef<{
    srcRowStart: number;
    srcRowEnd: number;
    srcColStart: number;
    srcColEnd: number;
    targetRowEnd: number | null;
  } | null>(null);
  const [fillHighlightRange, setFillHighlightRange] = useState<{
    rowStart: number; rowEnd: number; colStart: number; colEnd: number;
  } | null>(null);

  const isDraggingRef = useRef(false);
  const wasAlreadySelectedRef = useRef(false);

  function withInitial(name: string, initial: string | null | undefined): string {
    const n = name.trim();
    return initial ? `${n} (${initial})` : n;
  }

  function withInitialSafe(name: string, initial: string | null | undefined): string {
    if (!name) return '';
    const n = name.trim();
    if (!initial) return n;
    if (n.includes(`(${initial})`)) return n;
    return `${n} (${initial})`;
  }

  function getCellDisplayValue(row: SheetRow, colKey: ColKey): string {
    if (row.kind === 'existing') {
      const r = row as ExistingRow;
      switch (colKey) {
        case 'product': { const pi = masterData.productsList?.find(p => p.name === r.productName)?.initial || [...masterData.products.values()].find(p => p.name === r.productName)?.initial; return r.productName ? withInitial(r.productName, pi) : ''; }
        case 'marketer': {
          const initial = r.marketerInitial || [...masterData.employees.values()].find(e => e.name === r.marketerName)?.initial;
          return r.marketerName ? withInitialSafe(r.marketerName, initial) : '';
        }
        case 'planner': {
          const initial = r.plannerInitial || [...masterData.employees.values()].find(e => e.name === r.plannerName)?.initial;
          return r.plannerName ? withInitialSafe(r.plannerName, initial) : '';
        }
        case 'creator': {
          const initial = r.creatorInitial || [...masterData.employees.values()].find(e => e.name === r.creatorName)?.initial;
          return r.creatorName ? withInitialSafe(r.creatorName, initial) : '';
        }
        case 'media': {
          const initial = r.mediaInitial || [...masterData.media.values()].find(m => m.name === r.mediaName)?.initial;
          return r.mediaName ? withInitialSafe(r.mediaName, initial) : '';
        }
        case 'contentType': {
          const initial = r.contentTypeInitial || [...masterData.contentTypes.values()].find(ct => ct.name === r.contentTypeName)?.initial;
          return r.contentTypeName ? withInitialSafe(r.contentTypeName, initial) : '';
        }
        case 'placement': {
          const initial = r.placementInitial || [...masterData.placements.values()].find(pl => pl.name === r.placementName)?.initial;
          return r.placementName ? withInitialSafe(r.placementName, initial) : '';
        }
        case 'landing': {
          if (!r.utmCode) return '';
          const code = r.utmCode.startsWith('ue_') ? r.utmCode.slice(3) : r.utmCode;
          const mediaBaseName = r.mediaName.replace(/\s*\([^)]+\)$/, '');
          const mediaItem = [...masterData.media.values()].find(m => m.name === mediaBaseName || m.name === r.mediaName);
          const mediaInitial = r.mediaInitial || mediaItem?.initial || '';
          const afterMedia = mediaInitial && code.startsWith(mediaInitial) ? code.slice(mediaInitial.length) : code;
          const productBaseName = r.productName.replace(/\s*\([^)]+\)$/, '');
          const product = [...masterData.products.values()].find(p => p.name === productBaseName || p.name === r.productName);
          const productLandings = (product?.landing_numbers || [])
            .filter(ln => ln.initial)
            .sort((a, b) => (b.initial?.length ?? 0) - (a.initial?.length ?? 0));
          const ln = productLandings.find(ln => ln.initial && afterMedia.startsWith(ln.initial));
          if (!ln) return '';
          const s = [ln.initial, ln.description].filter(Boolean).join('-');
          return s ? `${ln.number} (${s})` : String(ln.number);
        }
        case 'sequence': return r.sequence;
        case 'utmCode': return r.utmCode;
        case 'adUrl': return r.adUrl;
      }
    } else {
      const r = row as NewRow;
      const isRowEmpty = !r.marketerId && !r.plannerId && !r.creatorId && !r.mediaId && !r.contentTypeId && !r.placementId && !r.landingId && !r.sequence;
      switch (colKey) {
        case 'product': {
          if (isRowEmpty) return '';
          const prod = masterData.products.get(r.productId || activeProductId || '');
          return prod ? withInitial(prod.name, prod.initial) : '';
        }
        case 'marketer': {
          const e = masterData.employees.get(r.marketerId);
          return e ? withInitial(e.name, e.initial) : '';
        }
        case 'planner': {
          const e = masterData.employees.get(r.plannerId);
          return e ? withInitial(e.name, e.initial) : '';
        }
        case 'creator': {
          const e = masterData.employees.get(r.creatorId);
          return e ? withInitial(e.name, e.initial) : '';
        }
        case 'media': {
          const m = masterData.media.get(r.mediaId);
          return m ? withInitial(m.name, m.initial) : '';
        }
        case 'contentType': {
          const ct = masterData.contentTypes.get(r.contentTypeId);
          return ct ? withInitial(ct.name, ct.initial) : '';
        }
        case 'placement': {
          const pl = masterData.placements.get(r.placementId);
          return pl ? withInitial(pl.name, pl.initial) : '';
        }
        case 'landing': {
          if (!r.landingId) return '';
          const product = masterData.products.get(r.productId || activeProductId || '');
          const ln = (product?.landing_numbers || []).find(l => l.id === r.landingId);
          if (!ln) return ''; const s2 = [ln.initial, ln.description].filter(Boolean).join('-'); return s2 ? `${ln.number} (${s2})` : ln.number;
        }
        case 'sequence': return r.sequence;
        case 'utmCode': {
          if (isRowEmpty) return '';
          const product = masterData.products.get(r.productId || activeProductId || '');
          const media = masterData.media.get(r.mediaId);
          const ct = masterData.contentTypes.get(r.contentTypeId);
          const pl = masterData.placements.get(r.placementId);
          const ln = r.landingId ? (product?.landing_numbers || []).find(l => l.id === r.landingId) : null;
          const planner = masterData.employees.get(r.plannerId);
          const marketer = masterData.employees.get(r.marketerId);
          const creator = masterData.employees.get(r.creatorId);
          const base = `${media?.initial || ''}${ln?.initial || ''}${ct?.initial || ''}${pl?.initial || ''}${product?.initial || ''}${planner?.initial || ''}${marketer?.initial || ''}${creator?.initial || ''}`;
          if (!base) return '';
          return `ue_${base}${r.sequence}`;
        }
        case 'adUrl': {
          if (isRowEmpty) return '';
          const product = masterData.products.get(r.productId || activeProductId || '');
          const media = masterData.media.get(r.mediaId);
          const ct = masterData.contentTypes.get(r.contentTypeId);
          const pl = masterData.placements.get(r.placementId);
          const ln = r.landingId ? (product?.landing_numbers || []).find(l => l.id === r.landingId) : null;
          const planner = masterData.employees.get(r.plannerId);
          const marketer = masterData.employees.get(r.marketerId);
          const creator = masterData.employees.get(r.creatorId);
          const base = `${media?.initial || ''}${ln?.initial || ''}${ct?.initial || ''}${pl?.initial || ''}${product?.initial || ''}${planner?.initial || ''}${marketer?.initial || ''}${creator?.initial || ''}`;
          if (!base || !product?.base_url) return '';
          const utmCode = `ue_${base}${r.sequence}`;
          const src = media?.display_name || '';
          const medium = ct?.display_name || '';
          const campaign = pl?.display_name || '';
          const isCriteo = media?.name === '크리테오' || media?.display_name?.toLowerCase() === 'criteo';
          const criteoParam = isCriteo ? '&utm_id={{adsetid}}' : '';
          if (r.simpleUrl) {
            const origin = (() => { try { return new URL(product.base_url!).origin; } catch { return product.base_url; } })();
            return `${origin}?utm_source=${src}&utm_medium=${medium}&utm_campaign=${campaign}&utm_content=${utmCode}${criteoParam}`;
          }
          if (!ln) return '';
          return `${product.base_url}/P/${ln.number}?utm_source=${src}&utm_medium=${medium}&utm_campaign=${campaign}&utm_content=${utmCode}${criteoParam}`;
        }
      }
    }
    return '';
  }

  function getDropdownOptions(colKey: ColKey, row: NewRow): DropdownOption[] {
    switch (colKey) {
      case 'marketer':
      case 'planner':
      case 'creator':
        return getEmployeeOptions();
      case 'media':
        return getMediaOptions();
      case 'contentType':
        return getContentTypeOptions();
      case 'placement':
        return getPlacementOptions();
      case 'landing':
        return getLandingOptions(row.productId || activeProductId);
      default:
        return [];
    }
  }

  function getNewRowFieldForCol(colKey: ColKey): keyof NewRow | null {
    const map: Partial<Record<ColKey, keyof NewRow>> = {
      marketer: 'marketerId',
      planner: 'plannerId',
      creator: 'creatorId',
      media: 'mediaId',
      contentType: 'contentTypeId',
      placement: 'placementId',
      landing: 'landingId',
      sequence: 'sequence',
    };
    return map[colKey] || null;
  }

  function getCurrentDropdownValue(row: NewRow, colKey: ColKey): string {
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
    return field ? (row[field] as string) || '' : '';
  }

  const handleCellClick = useCallback((
    e: React.MouseEvent,
    rowIndex: number,
    colKey: ColKey,
    row: SheetRow,
    td: HTMLTableCellElement
  ) => {
    e.stopPropagation();
    if (e.shiftKey) return;
    onSelectCell({ rowIndex, colKey });

    if (row.kind === 'new' && DROPDOWN_COLS.includes(colKey)) {
      if (wasAlreadySelectedRef.current) {
        const newRow = row as NewRow;
        const options = getDropdownOptions(colKey, newRow);
        openDropdown({
          rowId: newRow.id,
          colKey,
          options,
          anchorEl: td,
          currentValue: getCurrentDropdownValue(newRow, colKey),
        });
      } else {
        closeDropdown();
      }
    } else {
      closeDropdown();
    }
  }, [onSelectCell, openDropdown, closeDropdown, getEmployeeOptions, getMediaOptions, getContentTypeOptions, getPlacementOptions, getLandingOptions, activeProductId]);

  const handleDropdownSelect = useCallback((value: string) => {
    if (!dropdown) return;
    const field = getNewRowFieldForCol(dropdown.colKey);
    if (!field) return;
    onUpdateNewRowField(dropdown.rowId, field, value);
    closeDropdown();
  }, [dropdown, onUpdateNewRowField, closeDropdown]);

  const handleDropdownClose = useCallback(() => {
    closeDropdown();
  }, [closeDropdown]);

  const handleTbodyMouseDown = useCallback((e: React.MouseEvent<HTMLTableSectionElement>) => {
    const td = (e.target as HTMLElement).closest('td[data-row-index]') as HTMLTableCellElement | null;
    if (!td) return;
    const rowIndex = parseInt(td.dataset.rowIndex!, 10);
    const colKey = td.dataset.col as ColKey;
    if (isNaN(rowIndex) || !colKey) return;

    if (e.shiftKey) {
      e.preventDefault();
      const anchor = rangeSelection?.anchor ?? selectedCell;
      if (anchor) {
        onSetRangeSelection({ anchor, current: { rowIndex, colKey } });
      }
      return;
    }

    wasAlreadySelectedRef.current = selectedCell?.rowIndex === rowIndex && selectedCell?.colKey === colKey;

    onSelectCell({ rowIndex, colKey });
    onSetRangeSelection({ anchor: { rowIndex, colKey }, current: { rowIndex, colKey } });
    isDraggingRef.current = true;

    function onMove(me: MouseEvent) {
      if (!isDraggingRef.current) return;
      const el = document.elementFromPoint(me.clientX, me.clientY);
      const moveTd = el?.closest('td[data-row-index]') as HTMLTableCellElement | null;
      if (!moveTd) return;
      const moveRow = parseInt(moveTd.dataset.rowIndex || '-1', 10);
      const moveCol = moveTd.dataset.col as ColKey;
      if (moveRow < 0 || !moveCol) return;
      onSetRangeSelection({ anchor: { rowIndex, colKey }, current: { rowIndex: moveRow, colKey: moveCol } });
    }

    function onUp() {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [rangeSelection, onSelectCell, onSetRangeSelection]);

  const handleFillMouseDown = useCallback((
    e: React.MouseEvent,
    srcRowStart: number,
    srcRowEnd: number,
    srcColStart: number,
    srcColEnd: number
  ) => {
    e.stopPropagation();
    e.preventDefault();
    fillDragRef.current = { srcRowStart, srcRowEnd, srcColStart, srcColEnd, targetRowEnd: null };
    setFillHighlightRange(null);

    function onMove(me: MouseEvent) {
      const el = document.elementFromPoint(me.clientX, me.clientY);
      const td = el?.closest('td[data-row-index]') as HTMLTableCellElement | null;
      if (!td) return;
      const targetIdx = parseInt(td.dataset.rowIndex || '-1', 10);
      if (targetIdx < 0) return;
      if (!fillDragRef.current) return;
      fillDragRef.current.targetRowEnd = targetIdx;
      const { srcRowStart: rs, srcRowEnd: re, srcColStart: cs, srcColEnd: ce } = fillDragRef.current;
      setFillHighlightRange({
        rowStart: Math.min(rs, targetIdx),
        rowEnd: Math.max(re, targetIdx),
        colStart: cs,
        colEnd: ce,
      });
    }

    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      const drag = fillDragRef.current;
      if (drag && drag.targetRowEnd !== null && drag.targetRowEnd !== drag.srcRowEnd) {
        onApplyFillRange(drag.srcRowStart, drag.srcRowEnd, drag.srcColStart, drag.srcColEnd, drag.targetRowEnd);
      }
      fillDragRef.current = null;
      setFillHighlightRange(null);
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [onApplyFill, onApplyFillRange]);

  const isFillHighlighted = (rowIndex: number, colIdx: number): boolean => {
    if (!fillHighlightRange) return false;
    return (
      rowIndex >= fillHighlightRange.rowStart &&
      rowIndex <= fillHighlightRange.rowEnd &&
      colIdx >= fillHighlightRange.colStart &&
      colIdx <= fillHighlightRange.colEnd
    );
  };

  const isSelected = (rowIndex: number, colKey: ColKey): boolean =>
    selectedCell?.rowIndex === rowIndex && selectedCell?.colKey === colKey;

  const isAnchorCell = (rowIndex: number, colKey: ColKey): boolean => {
    if (!rangeSelection) return false;
    return rangeSelection.anchor.rowIndex === rowIndex && rangeSelection.anchor.colKey === colKey;
  };

  const isCellRangeHighlighted = (rowIndex: number, colKey: ColKey): boolean => {
    if (!rangeSelection) return false;
    return isCellInRange({ rowIndex, colKey }, rangeSelection, orderedCols);
  };

  const getRangeCorner = (): { rowIndex: number; colKey: ColKey } | null => {
    if (rangeSelection) {
      const bounds = getRangeBounds(rangeSelection, orderedCols);
      return { rowIndex: bounds.maxRow, colKey: orderedCols[bounds.maxColIdx] as ColKey };
    }
    if (selectedCell) {
      return selectedCell;
    }
    return null;
  };

  const rangeCorner = getRangeCorner();

  const getRangeSrcBounds = () => {
    if (rangeSelection) {
      return getRangeBounds(rangeSelection, orderedCols);
    }
    if (selectedCell) {
      const ci = orderedCols.indexOf(selectedCell.colKey);
      return {
        minRow: selectedCell.rowIndex, maxRow: selectedCell.rowIndex,
        minColIdx: ci, maxColIdx: ci,
      };
    }
    return null;
  };

  const isColActive = (colKey: ColKey): boolean => {
    if (rangeSelection) {
      const bounds = getRangeBounds(rangeSelection, orderedCols);
      const ci = orderedCols.indexOf(colKey);
      return ci >= bounds.minColIdx && ci <= bounds.maxColIdx;
    }
    return selectedCell?.colKey === colKey;
  };

  return (
    <>
      <table
        style={{ tableLayout: 'auto', fontSize: 13, width: '100%', minWidth: 'fit-content', borderCollapse: 'separate' as const, borderSpacing: 0 }}
      >
        <thead>
          <tr>
            <th
              style={{
                position: 'sticky', top: 0, left: 0, zIndex: 11,
                width: 36, minWidth: 36, maxWidth: 36,
                textAlign: 'center', fontSize: 12, color: '#5f6368',
                userSelect: 'none', height: 24,
                border: '1px solid #e0e0e0',
                borderBottom: '2px solid #d0d0d0',
                background: '#f8f9fa',
              }}
            >
              #
            </th>
            {orderedCols.map(colKey => (
              <th
                key={colKey}
                style={{
                  position: 'sticky', top: 0, zIndex: 10,
                  width: COL_WIDTHS[colKey],
                  background: isColActive(colKey) ? '#d3e3fd' : '#f8f9fa',
                  fontSize: 12, fontWeight: 500, color: '#5f6368',
                  textAlign: 'center', height: 24,
                  borderTop: '1px solid #e0e0e0',
                  borderRight: '1px solid #e0e0e0',
                  borderBottom: '2px solid #d0d0d0',
                  userSelect: 'none',
                  overflow: 'visible',
                }}
              >
                {COL_LABELS[colKey]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody
          onMouseDown={handleTbodyMouseDown}
          style={{ userSelect: isDraggingRef.current ? 'none' : undefined }}
        >
          {(() => {
            return rows.map((row, rowIndex) => {
            const prevRow = rowIndex > 0 ? rows[rowIndex - 1] : null;
            const showSeparator = prevRow?.kind === 'existing' && row.kind === 'new';

            const isRowInRange = rangeSelection
              ? rowIndex >= Math.min(rangeSelection.anchor.rowIndex, rangeSelection.current.rowIndex) &&
                rowIndex <= Math.max(rangeSelection.anchor.rowIndex, rangeSelection.current.rowIndex)
              : false;

            const rowNumber = rowIndex + 1;

            return (
              <React.Fragment key={row.id}>
                {showSeparator && (
                  <tr style={{ height: 2 }}>
                    <td
                      colSpan={orderedCols.length + 1}
                      style={{
                        height: 2, padding: 0, background: 'transparent',
                        border: 'none',
                        borderTop: '2px dashed #1a73e8',
                      }}
                    />
                  </tr>
                )}
                <tr
                  onMouseEnter={e => {
                    if (row.kind === 'existing') {
                      (e.currentTarget as HTMLElement).style.background = '#f8f9fa';
                    } else {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(26,115,232,0.03)';
                    }
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = '';
                  }}
                >
                <td
                  style={{
                    position: 'sticky', left: 0, zIndex: 5,
                    width: 36, minWidth: 36, maxWidth: 36,
                    textAlign: 'center', fontSize: 11,
                    color: isRowInRange ? '#1a73e8' : '#5f6368',
                    userSelect: 'none', height: 24,
                    background: isRowInRange ? '#e8f0fe' : '#f8f9fa',
                    borderLeft: '1px solid #e0e0e0',
                    borderBottom: '1px solid #e0e0e0',
                    verticalAlign: 'middle',
                    fontWeight: isRowInRange ? 600 : undefined,
                  }}
                >
                  {rowNumber}
                </td>

                {orderedCols.map((colKey, colIdx) => {
                  const selected = isSelected(rowIndex, colKey);
                  const inRange = isCellRangeHighlighted(rowIndex, colKey);
                  const anchor = isAnchorCell(rowIndex, colKey);
                  const fillHL = isFillHighlighted(rowIndex, colIdx);
                  const displayValue = getCellDisplayValue(row, colKey);
                  const isCode = colKey === 'utmCode' || colKey === 'adUrl';

                  const showFillHandle = row.kind === 'new' &&
                    rangeCorner?.rowIndex === rowIndex &&
                    rangeCorner?.colKey === colKey;

                  let cellBackground: string = 'inherit';
                  let cellOutline: string | undefined = undefined;
                  let outlineOffset: number | undefined = undefined;

                  if (fillHL) {
                    cellBackground = 'rgba(26,115,232,0.12)';
                    cellOutline = '1px dashed #1a73e8';
                    outlineOffset = -1;
                  } else if (anchor && rangeSelection) {
                    cellBackground = 'white';
                    cellOutline = '2px solid #1a73e8';
                    outlineOffset = -2;
                  } else if (inRange) {
                    cellBackground = 'rgba(26,115,232,0.12)';
                  } else if (selected) {
                    cellOutline = '2px solid #1a73e8';
                    outlineOffset = -2;
                  } else if (row.kind === 'new' && (colKey === 'product' || colKey === 'media' || colKey === 'adUrl')) {
                    cellBackground = '#f1f3f4';
                  }

                  return (
                    <td
                      key={colKey}
                      data-row-index={rowIndex}
                      data-col={colKey}
                      onClick={e => handleCellClick(e, rowIndex, colKey, row, e.currentTarget as HTMLTableCellElement)}
                      onContextMenu={
                        (colKey === 'utmCode' || colKey === 'adUrl') ? (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setContextMenu({
                            x: e.clientX,
                            y: e.clientY,
                            rowId: row.id,
                            colKey,
                            simpleUrl: row.kind === 'new' ? !!(row as NewRow).simpleUrl : undefined,
                          });
                        } : undefined
                      }
                      style={{
                        height: 24,
                        verticalAlign: 'middle',
                        background: markedCells.has(`${row.id}:${colKey}`) ? 'rgba(249,115,22,0.18)' : cellBackground,
                        outline: cellOutline,
                        outlineOffset: outlineOffset,
                        whiteSpace: 'nowrap',
                        borderRight: '1px solid #e0e0e0',
                        borderBottom: '1px solid #e0e0e0',
                        position: 'relative',
                        cursor: row.kind === 'new' && DROPDOWN_COLS.includes(colKey) ? 'pointer' : 'default',
                        minWidth: COL_WIDTHS[colKey],
                      }}
                    >
                      {row.kind === 'existing' ? (
                        colKey === 'product' ? (
                          <span style={{ display: 'block', padding: '0 4px' }}>
                            {displayValue ? (() => {
                              const rawProductName = (row as ExistingRow).productName?.replace(/ \([^)]+\)$/, '') ?? '';
                              const productId = masterData.productsList?.find(p => p.name === rawProductName)?.id
                                ?? [...masterData.products.values()].find(p => p.name === rawProductName)?.id
                                ?? rawProductName;
                              const color = getProductColor(productId);
                              return <Badge className={cn('text-xs px-1.5 py-0', color.bg, color.text)}>{displayValue}</Badge>;
                            })() : '-'}
                          </span>
                        ) : isCode ? (
                          <CopyableCell value={displayValue} colKey={colKey} />
                        ) : BADGE_COL_KEYS.includes(colKey) ? (
                          <span style={{ display: 'block', padding: '0 4px' }}>
                            {displayValue ? (() => {
                              let colorKey = displayValue;
                              if (colKey === 'landing') {
                                const r = row as ExistingRow;
                                const code = r.utmCode?.startsWith('ue_') ? r.utmCode.slice(3) : r.utmCode || '';
                                const mediaBaseName = r.mediaName?.replace(/\s*\([^)]+\)$/, '');
                                const mediaItem = [...masterData.media.values()].find(m => m.name === mediaBaseName || m.name === r.mediaName);
                                const mediaInitial = r.mediaInitial || mediaItem?.initial || '';
                                const afterMedia = mediaInitial && code.startsWith(mediaInitial) ? code.slice(mediaInitial.length) : code;
                                const productBaseName = r.productName?.replace(/\s*\([^)]+\)$/, '');
                                const product = [...masterData.products.values()].find(p => p.name === productBaseName || p.name === r.productName);
                                const productLandings = (product?.landing_numbers || []).filter(l => l.initial).sort((a, b) => (b.initial?.length ?? 0) - (a.initial?.length ?? 0));
                                const ln = productLandings.find(l => l.initial && afterMedia.startsWith(l.initial));
                                if (ln?.id) colorKey = ln.id;
                              } else if (colKey === 'media') {
                                const r2 = row as ExistingRow;
                                const n = r2.mediaName?.replace(/ \([^)]+\)$/, '') ?? '';
                                colorKey = [...masterData.media.values()].find(m => m.name === n)?.id ?? displayValue;
                              } else if (colKey === 'contentType') {
                                const r2 = row as ExistingRow;
                                const n = r2.contentTypeName?.replace(/ \([^)]+\)$/, '') ?? '';
                                colorKey = [...masterData.contentTypes.values()].find(ct => ct.name === n)?.id ?? displayValue;
                              } else if (colKey === 'placement') {
                                const r2 = row as ExistingRow;
                                const n = r2.placementName?.replace(/ \([^)]+\)$/, '') ?? '';
                                colorKey = [...masterData.placements.values()].find(pl => pl.name === n)?.id ?? displayValue;
                              } else if (colKey === 'planner') {
                                const r2 = row as ExistingRow;
                                colorKey = r2.plannerInitial || [...masterData.employees.values()].find(e => e.name.trim() === r2.plannerName?.replace(/ \([^)]+\)$/, ''))?.initial || displayValue;
                              } else if (colKey === 'marketer') {
                                const r2 = row as ExistingRow;
                                colorKey = r2.marketerInitial || [...masterData.employees.values()].find(e => e.name.trim() === r2.marketerName?.replace(/ \([^)]+\)$/, ''))?.initial || displayValue;
                              } else if (colKey === 'creator') {
                                const r2 = row as ExistingRow;
                                colorKey = r2.creatorInitial || [...masterData.employees.values()].find(e => e.name.trim() === r2.creatorName?.replace(/ \([^)]+\)$/, ''))?.initial || displayValue;
                              }
                              const color = getProductColor(colorKey);
                              return <Badge className={cn('text-xs px-1.5 py-0', color.bg, color.text)}>{displayValue}</Badge>;
                            })() : <span style={{ color: '#bdbdbd' }}>-</span>}
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'block',
                              padding: '0 6px',
                              fontSize: 12,
                              whiteSpace: 'nowrap',
                              color: '#444',
                            }}
                          >
                            {displayValue || '-'}
                          </span>
                        )
                      ) : (
                        <>
                          {colKey === 'sequence' ? (
                            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
                              <input
                                type="text"
                                value={displayValue}
                                onChange={e => {
                                  const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                                  onUpdateNewRowField((row as NewRow).id, 'sequence', val);
                                }}
                                onFocus={() => onSelectCell({ rowIndex, colKey })}
                                onClick={e => e.stopPropagation()}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    (e.target as HTMLInputElement).blur();
                                    onSelectCell({ rowIndex: Math.min(rowIndex + 1, rows.length - 1), colKey });
                                  }
                                }}
                                data-native-paste="true"
                                style={{
                                  width: '100%', height: '100%',
                                  border: 'none', outline: 'none',
                                  background: 'transparent',
                                  fontSize: 12, padding: '0 6px',
                                  textAlign: 'center',
                                  fontFamily: 'inherit',
                                  color: 'var(--foreground)',
                                  cursor: 'text',
                                }}
                              />
                              {sequenceLoadingIds?.has((row as NewRow).id) && (
                                <div style={{
                                  position: 'absolute', inset: 0,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  background: 'rgba(255,255,255,0.85)',
                                }}>
                                  <div style={{
                                    width: 12, height: 12, borderRadius: '50%',
                                    border: '2px solid #e0e0e0',
                                    borderTopColor: '#1a73e8',
                                    animation: 'sheet-spin 0.7s linear infinite',
                                  }} />
                                </div>
                              )}
                            </div>
                          ) : colKey === 'product' ? (
                            <span style={{ display: 'block', padding: '0 6px' }}>
                              {displayValue ? (() => {
                                const productId = (row as NewRow).productId ?? activeProductId ?? displayValue;
                                const color = getProductColor(productId);
                                return <Badge className={cn(color.bg, color.text)}>{displayValue}</Badge>;
                              })() : <span style={{ color: '#bdbdbd' }}>-</span>}
                            </span>
                          ) : colKey === 'media' ? (
                            <span style={{ display: 'block', padding: '0 6px' }}>
                              {displayValue ? (() => {
                                const mediaId = (row as NewRow).mediaId || displayValue;
                                const color = getProductColor(mediaId);
                                return <Badge className={cn('text-xs px-1.5 py-0', color.bg, color.text)}>{displayValue}</Badge>;
                              })() : <span style={{ color: '#bdbdbd' }}>-</span>}
                            </span>
                          ) : colKey === 'utmCode' ? (
                            <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
                              {displayValue && <CopyIconButton value={displayValue} />}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <UtmCodeInput
                                  computedValue={displayValue}
                                  rowId={(row as NewRow).id}
                                  onUpdateFromUtmCode={onUpdateFromUtmCode}
                                />
                              </div>
                            </div>
                          ) : colKey === 'adUrl' ? (
                            displayValue
                              ? <CopyableCell value={displayValue} colKey={colKey} />
                              : <span style={{ display: 'block', padding: '0 6px', fontSize: 11, color: '#bdbdbd', fontFamily: "'Courier New', monospace" }}>-</span>
                          ) : DROPDOWN_COLS.includes(colKey) ? (
                            <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
                              <span style={{ flex: 1, padding: '0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {displayValue && BADGE_COL_KEYS.includes(colKey) ? (() => {
                                  const newRow = row as NewRow;
                                  let colorKey: string;
                                  if (colKey === 'landing') {
                                    colorKey = newRow.landingId || displayValue;
                                  } else if (colKey === 'contentType') {
                                    colorKey = newRow.contentTypeId || displayValue;
                                  } else if (colKey === 'placement') {
                                    colorKey = newRow.placementId || displayValue;
                                  } else if (colKey === 'planner') {
                                    colorKey = masterData.employees.get(newRow.plannerId)?.initial || displayValue;
                                  } else if (colKey === 'marketer') {
                                    colorKey = masterData.employees.get(newRow.marketerId)?.initial || displayValue;
                                  } else if (colKey === 'creator') {
                                    colorKey = masterData.employees.get(newRow.creatorId)?.initial || displayValue;
                                  } else {
                                    colorKey = displayValue;
                                  }
                                  const color = getProductColor(colorKey);
                                  return <Badge className={cn('text-xs px-1.5 py-0', color.bg, color.text)}>{displayValue}</Badge>;
                                })() : (
                                  <span style={{ fontSize: 12, color: displayValue ? 'var(--foreground)' : '#bdbdbd' }}>
                                    {displayValue || '선택'}
                                  </span>
                                )}
                              </span>
                              <span style={{ marginRight: 4, fontSize: 10, color: '#9aa0a6', flexShrink: 0 }}>▾</span>
                            </div>
                          ) : null}

                          {showFillHandle && (() => {
                            const srcBounds = getRangeSrcBounds();
                            if (!srcBounds) return null;
                            return (
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: -4,
                                  right: -4,
                                  width: 8,
                                  height: 8,
                                  background: '#1a73e8',
                                  border: '2px solid #fff',
                                  borderRadius: 1,
                                  cursor: 'crosshair',
                                  zIndex: 20,
                                }}
                                onMouseDown={e => handleFillMouseDown(
                                  e,
                                  srcBounds.minRow,
                                  srcBounds.maxRow,
                                  srcBounds.minColIdx,
                                  srcBounds.maxColIdx
                                )}
                              />
                            );
                          })()}
                        </>
                      )}
                    </td>
                  );
                })}
                </tr>
              </React.Fragment>
            );
          });
          })()}
        </tbody>
      </table>

      {dropdown && (
        <SheetDropdown
          anchorEl={dropdown.anchorEl}
          options={dropdown.options}
          currentValue={dropdown.currentValue}
          colKey={dropdown.colKey}
          onSelect={handleDropdownSelect}
          onClose={handleDropdownClose}
        />
      )}

      {contextMenu && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
            onClick={() => setContextMenu(null)}
            onContextMenu={e => { e.preventDefault(); setContextMenu(null); }}
          />
          <div
            style={{
              position: 'fixed',
              left: contextMenu.x,
              top: contextMenu.y,
              zIndex: 9999,
              background: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: 6,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              padding: '4px 0',
              minWidth: 180,
              fontSize: 13,
            }}
          >
            {(() => {
              const cellKey = `${contextMenu.rowId}:${contextMenu.colKey}`;
              const isMarked = markedCells.has(cellKey);
              return (
                <div
                  onClick={() => {
                    setMarkedCells(prev => {
                      const next = new Set(prev);
                      if (next.has(cellKey)) next.delete(cellKey);
                      else next.add(cellKey);
                      localStorage.setItem(MARK_STORAGE_KEY, JSON.stringify([...next]));
                      return next;
                    });
                    setContextMenu(null);
                  }}
                  style={{
                    padding: '7px 14px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                    color: isMarked ? '#f97316' : '#333',
                    background: 'transparent',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ width: 14, textAlign: 'center', fontSize: 11 }}>
                    {isMarked ? '✓' : ''}
                  </span>
                  <span style={{ color: '#f97316', marginRight: 4 }}>●</span>
                  {isMarked ? '색표시 해제' : '색표시'}
                </div>
              );
            })()}

            {contextMenu.colKey === 'adUrl' && contextMenu.simpleUrl !== undefined && (
              <>
                <div style={{ height: 1, background: '#e0e0e0', margin: '4px 0' }} />
                {[
                  { label: '메인 URL 사용안함', value: false },
                  { label: '메인 URL 사용함', value: true },
                ].map(option => (
                  <div
                    key={String(option.value)}
                    onClick={() => {
                      onToggleSimpleUrl(contextMenu.rowId, option.value);
                      setContextMenu(null);
                    }}
                    style={{
                      padding: '7px 14px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 8,
                      color: contextMenu.simpleUrl === option.value ? '#1a73e8' : '#333',
                      background: 'transparent',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ width: 14, textAlign: 'center', fontSize: 11 }}>
                      {contextMenu.simpleUrl === option.value ? '✓' : ''}
                    </span>
                    {option.label}
                  </div>
                ))}
              </>
            )}
          </div>
        </>
      )}

      <style>{`
        @keyframes sheet-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
