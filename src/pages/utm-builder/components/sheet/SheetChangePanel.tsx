import { useState, useRef, useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { NewRow } from '../../types/sheet';
import type { MasterData } from '../../hooks/useSheetMasterData';

interface SheetChangePanelProps {
  pendingRows: NewRow[];
  masterData: MasterData;
  saving: boolean;
  activeProductId: string | null;
  onSave: () => void;
  existingUtmCodes: Set<string>;
  totalCount: number;
  newRows: NewRow[];
}

const MIN_HEIGHT = 80;
const MAX_HEIGHT = 600;
const DEFAULT_HEIGHT = 200;

export function SheetChangePanel({
  pendingRows,
  masterData,
  saving,
  activeProductId,
  onSave,
  existingUtmCodes,
  totalCount,
  newRows,
}: SheetChangePanelProps) {
  const [open, setOpen] = useState(true);
  const [panelHeight, setPanelHeight] = useState(DEFAULT_HEIGHT);
  const dragStartYRef = useRef(0);
  const dragStartHeightRef = useRef(DEFAULT_HEIGHT);

  const handleResizerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragStartYRef.current = e.clientY;
    dragStartHeightRef.current = panelHeight;

    function onMove(me: MouseEvent) {
      const delta = dragStartYRef.current - me.clientY;
      setPanelHeight(Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, dragStartHeightRef.current + delta)));
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [panelHeight]);

  const count = pendingRows.length;

  function isComplete(row: NewRow): boolean {
    return !!(
      row.marketerId && row.plannerId && row.creatorId &&
      row.mediaId && row.contentTypeId && row.placementId &&
      row.landingId && row.sequence &&
      (row.productId || activeProductId)
    );
  }

  const seenUtmCodes = new Set<string>();
  const duplicateIds = new Set<string>();
  for (const row of pendingRows) {
    const code = computeUtmCode(row);
    if (!code) continue;
    if (seenUtmCodes.has(code) || existingUtmCodes.has(code)) {
      duplicateIds.add(row.id);
    } else {
      seenUtmCodes.add(code);
    }
  }

  const saveableCount = pendingRows.filter(
    row => isComplete(row) && !duplicateIds.has(row.id) && !!computeUtmCode(row)
  ).length;

  const duplicateCount = duplicateIds.size;
  const unmatchedCount = pendingRows.length - saveableCount - duplicateCount;

  type RowStatus =
    | { type: 'ok'; label: '저장 가능' }
    | { type: 'duplicate'; label: '중복' }
    | { type: 'invalid'; label: '미매칭' };

  function getRowStatus(row: NewRow, utmCode: string): RowStatus {
    if (duplicateIds.has(row.id)) return { type: 'duplicate', label: '중복' };
    if (!isComplete(row) || !utmCode) return { type: 'invalid', label: '미매칭' };
    return { type: 'ok', label: '저장 가능' };
  }

  function getNameWithInitial(map: Map<string, { name: string; initial?: string | null }>, id: string): string {
    if (!id) return '';
    const item = map.get(id);
    if (!item) return id;
    return item.initial ? `${item.name} (${item.initial})` : item.name;
  }

  function computeUtmCode(row: NewRow): string {
    const product = masterData.products.get(row.productId || activeProductId || '');
    const media = masterData.media.get(row.mediaId);
    const ct = masterData.contentTypes.get(row.contentTypeId);
    const pl = masterData.placements.get(row.placementId);
    const ln = row.landingId ? (product?.landing_numbers || []).find(l => l.id === row.landingId) : null;
    const planner = masterData.employees.get(row.plannerId);
    const marketer = masterData.employees.get(row.marketerId);
    const creator = masterData.employees.get(row.creatorId);
    const base = `${media?.initial || ''}${ln?.initial || ''}${ct?.initial || ''}${pl?.initial || ''}${product?.initial || ''}${planner?.initial || ''}${marketer?.initial || ''}${creator?.initial || ''}`;
    if (!base) return '';
    return `ue_${base}${row.sequence}`;
  }

  function computeAdUrl(row: NewRow): string {
    const product = masterData.products.get(row.productId || activeProductId || '');
    const media = masterData.media.get(row.mediaId);
    const ct = masterData.contentTypes.get(row.contentTypeId);
    const pl = masterData.placements.get(row.placementId);
    const ln = row.landingId ? (product?.landing_numbers || []).find(l => l.id === row.landingId) : null;
    const utmCode = computeUtmCode(row);
    if (!utmCode || !product?.base_url) return '';
    const src = media?.display_name || '';
    const medium = ct?.display_name || '';
    const campaign = pl?.display_name || '';
    const isCriteo = media?.name === '크리테오' || media?.display_name?.toLowerCase() === 'criteo';
    const criteoParam = isCriteo ? '&utm_id={{adsetid}}' : '';
    if (row.simpleUrl) {
      const origin = (() => { try { return new URL(product.base_url!).origin; } catch { return product.base_url; } })();
      return `${origin}?utm_source=${src}&utm_medium=${medium}&utm_campaign=${campaign}&utm_content=${utmCode}${criteoParam}`;
    }
    if (!ln) return '';
    return `${product.base_url}/P/${ln.number}?utm_source=${src}&utm_medium=${medium}&utm_campaign=${campaign}&utm_content=${utmCode}${criteoParam}`;
  }

  return (
    <div
      style={{
        borderTop: '1px solid #dadce0',
        background: '#fff',
        flexShrink: 0,
        height: open ? panelHeight : 36,
        minHeight: 36,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'height 0.15s ease',
      }}
    >
      {open && (
        <div
          onMouseDown={handleResizerMouseDown}
          style={{
            height: 4, cursor: 'row-resize', flexShrink: 0,
            background: 'transparent', transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1a73e8')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        />
      )}

      <div
        className="flex items-center gap-2 px-3 bg-[#f8f9fa] cursor-pointer text-xs font-semibold shrink-0"
        style={{ height: 36, borderBottom: open ? '1px solid #dadce0' : 'none' }}
        onClick={() => setOpen(o => !o)}
      >
        {open ? <ChevronDown className="w-3.5 h-3.5 text-[#5f6368]" /> : <ChevronUp className="w-3.5 h-3.5 text-[#5f6368]" />}
        <span>변경 사항 미리보기</span>
        <div className="flex-1" />
        {count > 0 && (
          <div className="flex items-center gap-2 mr-2" onClick={e => e.stopPropagation()}>
            <span className="text-[11px] px-1.5 py-0.5 rounded font-medium" style={{ color: '#5f6368', background: '#f1f3f4' }}>총 {count}</span>
            {saveableCount > 0 && <span className="text-[11px] px-1.5 py-0.5 rounded font-medium" style={{ color: '#1e8e3e', background: '#e6f4ea' }}>저장 가능 {saveableCount}</span>}
            {duplicateCount > 0 && <span className="text-[11px] px-1.5 py-0.5 rounded font-medium" style={{ color: '#5f6368', background: '#f1f3f4' }}>중복 {duplicateCount}</span>}
            {unmatchedCount > 0 && <span className="text-[11px] px-1.5 py-0.5 rounded font-medium" style={{ color: '#5f6368', background: '#f1f3f4' }}>미매칭 {unmatchedCount}</span>}
          </div>
        )}
        <button
          disabled={saveableCount === 0 || saving}
          onClick={e => {
            e.stopPropagation();
            onSave();
          }}
          className="px-3 py-0.5 text-[11px] rounded border-none cursor-pointer text-white"
          style={{
            background: saveableCount === 0 || saving ? '#9aa0a6' : '#1a73e8',
            cursor: saveableCount === 0 || saving ? 'default' : 'pointer',
            opacity: saveableCount === 0 || saving ? 0.7 : 1,
          }}
        >
          {saving ? '저장 중...' : `저장 (${saveableCount})`}
        </button>
      </div>

      {open && (
        <div className="overflow-auto flex-1">
          {count === 0 ? (
            <div className="p-3 text-center text-[#9aa0a6] text-xs">변경 사항 없음</div>
          ) : (
            <table className="border-collapse text-xs w-full" style={{ whiteSpace: 'nowrap' }}>
              <thead>
                <tr>
                  <th className="bg-[#f1f3f4] px-2.5 py-1 text-left sticky top-0 font-medium text-[#5f6368] text-[11px]">#</th>
                  <th className="bg-[#f1f3f4] px-2.5 py-1 text-left sticky top-0 font-medium text-[#5f6368] text-[11px]">상태</th>
                  <th className="bg-[#f1f3f4] px-2.5 py-1 text-left sticky top-0 font-medium text-[#5f6368] text-[11px]">매체</th>
                  <th className="bg-[#f1f3f4] px-2.5 py-1 text-left sticky top-0 font-medium text-[#5f6368] text-[11px]">랜딩</th>
                  <th className="bg-[#f1f3f4] px-2.5 py-1 text-left sticky top-0 font-medium text-[#5f6368] text-[11px]">콘텐츠</th>
                  <th className="bg-[#f1f3f4] px-2.5 py-1 text-left sticky top-0 font-medium text-[#5f6368] text-[11px]">지면</th>
                  <th className="bg-[#f1f3f4] px-2.5 py-1 text-left sticky top-0 font-medium text-[#5f6368] text-[11px]">제품</th>
                  <th className="bg-[#f1f3f4] px-2.5 py-1 text-left sticky top-0 font-medium text-[#5f6368] text-[11px]">기획자</th>
                  <th className="bg-[#f1f3f4] px-2.5 py-1 text-left sticky top-0 font-medium text-[#5f6368] text-[11px]">마케터</th>
                  <th className="bg-[#f1f3f4] px-2.5 py-1 text-left sticky top-0 font-medium text-[#5f6368] text-[11px]">제작자</th>
                  <th className="bg-[#f1f3f4] px-2.5 py-1 text-left sticky top-0 font-medium text-[#5f6368] text-[11px]">시퀀스</th>
                  <th className="bg-[#f1f3f4] px-2.5 py-1 text-left sticky top-0 font-medium text-[#5f6368] text-[11px]">UTM 코드</th>
                  <th className="bg-[#f1f3f4] px-2.5 py-1 text-left sticky top-0 font-medium text-[#5f6368] text-[11px]">광고 URL</th>
                  <th className="bg-[#f1f3f4] px-2.5 py-1 text-left sticky top-0 font-medium text-[#5f6368] text-[11px]">상태</th>
                </tr>
              </thead>
              <tbody>
                {pendingRows.map((row, idx) => {
                  const utmCode = computeUtmCode(row);
                  const adUrl = computeAdUrl(row);
                  const status = getRowStatus(row, utmCode);
                  const newRowIndex = newRows.findIndex(r => r.id === row.id);
                  const rowNumber = newRowIndex >= 0 ? totalCount + newRowIndex + 1 : idx + 1;
                  const isOk = status.type === 'ok';
                  const statusStyle = isOk
                    ? { color: '#1e8e3e', background: '#e6f4ea' }
                    : { color: '#5f6368', background: '#f1f3f4' };
                  const cellColor = isOk ? '#202124' : '#9aa0a6';
                  return (
                    <tr key={row.id} className="border-b border-[#f1f3f4]">
                      <td className="px-2.5 py-1 text-center font-semibold text-[#5f6368]">{rowNumber}</td>
                      <td className="px-2.5 py-1">
                        <span className="text-[11px] font-medium px-1.5 py-0.5 rounded" style={statusStyle}>{status.label}</span>
                      </td>
                      <td className="px-2.5 py-1 font-medium" style={{ color: cellColor }}>
                        {getNameWithInitial(masterData.media, row.mediaId)}
                      </td>
                      <td className="px-2.5 py-1 font-medium" style={{ color: cellColor }}>
                        {row.landingId
                          ? ((): string => { const product = masterData.products.get(row.productId || activeProductId || ''); const ln = (product?.landing_numbers || []).find(l => l.id === row.landingId); if (!ln) return ''; const s = [ln.initial, ln.description].filter(Boolean).join('-'); return s ? `${ln.number} (${s})` : ln.number; })()
                          : ''}
                      </td>
                      <td className="px-2.5 py-1 font-medium" style={{ color: cellColor }}>
                        {getNameWithInitial(masterData.contentTypes, row.contentTypeId)}
                      </td>
                      <td className="px-2.5 py-1 font-medium" style={{ color: cellColor }}>
                        {getNameWithInitial(masterData.placements, row.placementId)}
                      </td>
                      <td className="px-2.5 py-1 font-medium" style={{ color: cellColor }}>
                        {getNameWithInitial(masterData.products, row.productId || activeProductId || '')}
                      </td>
                      <td className="px-2.5 py-1 font-medium" style={{ color: cellColor }}>
                        {getNameWithInitial(masterData.employees, row.plannerId)}
                      </td>
                      <td className="px-2.5 py-1 font-medium" style={{ color: cellColor }}>
                        {getNameWithInitial(masterData.employees, row.marketerId)}
                      </td>
                      <td className="px-2.5 py-1 font-medium" style={{ color: cellColor }}>
                        {getNameWithInitial(masterData.employees, row.creatorId)}
                      </td>
                      <td className="px-2.5 py-1 font-medium" style={{ color: cellColor }}>{row.sequence}</td>
                      <td className="px-2.5 py-1 font-mono" style={{ color: cellColor }}>{utmCode}</td>
                      <td className="px-2.5 py-1" style={{ color: cellColor }}>{adUrl}</td>
                      <td className="px-2.5 py-1">
                        <span
                          className="text-[11px] font-medium px-1.5 py-0.5 rounded"
                          style={statusStyle}
                        >
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
