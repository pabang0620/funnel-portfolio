import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronUp, GripVertical, HelpCircle, Settings2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useSheetMasterData } from '../../hooks/useSheetMasterData';
import { useSheetState } from '../../hooks/useSheetState';
import { useSheetKeyboard } from '../../hooks/useSheetKeyboard';
import { SheetSidebar } from './SheetSidebar';
import { SheetChangePanel } from './SheetChangePanel';
import { SheetTable } from './SheetTable';
import { Badge } from '../ui/badge';
import { cn, getProductColor } from '../../lib/utils';
import { COLS, COL_LABELS } from '../../types/sheet';
import type { CellPos, RangeSelection, ColKey } from '../../types/sheet';

export function SheetContainer() {
  const {
    masterData,
    getSidebarItems,
    getLandingOptions,
    getEmployeeOptions,
    getMediaOptions,
    getContentTypeOptions,
    getPlacementOptions,
  } = useSheetMasterData();

  const {
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
    sequenceLoadingIds,
    saveError,
    saveSuccess,
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
  } = useSheetState();

  const [rangeSelection, setRangeSelection] = useState<RangeSelection | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [openDropdownRequest, setOpenDropdownRequest] = useState<CellPos | null>(null);
  const dropdownOpenRef = useRef(false);
  const shortcutsBtnRef = useRef<HTMLButtonElement>(null);
  const colOrderRef = useRef<{ orderedCols: ColKey[]; setOrderedCols: React.Dispatch<React.SetStateAction<ColKey[]>> } | null>(null);
  const [isColOrderOpen, setIsColOrderOpen] = useState(false);
  const [tempColOrder, setTempColOrder] = useState<ColKey[]>([]);
  const colModalDragIdx = useRef<number | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartWidthRef = useRef(240);

  function handleResizerMouseDown(e: React.MouseEvent) {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartWidthRef.current = sidebarWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    function onMouseMove(ev: MouseEvent) {
      if (!isDraggingRef.current) return;
      const delta = ev.clientX - dragStartXRef.current;
      setSidebarWidth(Math.max(160, Math.min(400, dragStartWidthRef.current + delta)));
    }

    function onMouseUp() {
      isDraggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  // masterData ref 동기화
  useEffect(() => {
    if (!masterData.loading) {
      setMasterDataRef(masterData);
    }
  }, [masterData, setMasterDataRef]);

  // 초기 로드 후 자동 선택: 즐겨찾기 우선, 없으면 첫 번째 항목
  useEffect(() => {
    if (!masterData.loading && masterData.productsList.length > 0 && masterData.mediaList.length > 0 && !activeProductId) {
      const allItems = getSidebarItems();
      const favItem = allItems.find(i => favorites.has(i.key));
      if (favItem) {
        selectContext(favItem.productId, favItem.mediaId);
      } else {
        const firstProduct = masterData.productsList[0];
        const firstMedia = masterData.mediaList[0];
        selectContext(firstProduct.id, firstMedia.id);
      }
    }
  }, [masterData.loading]);

  // 빈 행 보충
  useEffect(() => {
    ensureTrailingEmptyRows();
  }, []);

  // 저장 메시지 자동 소거
  useEffect(() => {
    if (saveSuccess) {
      const t = setTimeout(() => setSaveSuccess(null), 3000);
      return () => clearTimeout(t);
    }
  }, [saveSuccess]);

  useEffect(() => {
    if (saveError) {
      const t = setTimeout(() => setSaveError(null), 5000);
      return () => clearTimeout(t);
    }
  }, [saveError]);

  function handleCloseDropdown() {
    // SheetTable 내부에서 관리하므로 외부에서는 불필요
  }

  function handleOpenDropdown(pos: CellPos) {
    if (dropdownOpenRef.current) return;
    dropdownOpenRef.current = true;
    setOpenDropdownRequest({ ...pos });
  }

  function handleDropdownChange(open: boolean) {
    dropdownOpenRef.current = open;
  }

  // 역인덱스: initial → employee (O(1) 조회)
  const employeeByInitial = useMemo(() => {
    const map = new Map<string, { name: string; initial?: string | null }>();
    for (const [, emp] of masterData.employees) {
      if (emp.initial) map.set(emp.initial, { name: emp.name, initial: emp.initial });
    }
    return map;
  }, [masterData.employees]);

  // 셀 표시값 반환 (Ctrl+C용)
  function getCellDisplayValue(pos: CellPos): string {
    const row = allRows[pos.rowIndex];
    if (!row) return '';
    if (row.kind === 'existing') {
      const r = row;
      switch (pos.colKey) {
        case 'product': return r.productName;
        case 'marketer':
        case 'planner':
        case 'creator': {
          const initial = pos.colKey === 'marketer' ? r.marketerInitial
            : pos.colKey === 'planner' ? r.plannerInitial
            : r.creatorInitial;
          const fallbackName = pos.colKey === 'marketer' ? r.marketerName
            : pos.colKey === 'planner' ? r.plannerName
            : r.creatorName;
          if (initial) {
            const emp = employeeByInitial.get(initial);
            if (emp) return emp.initial ? `${emp.name.trim()} (${emp.initial})` : emp.name.trim();
          }
          return fallbackName;
        }
        case 'media': return r.mediaName;
        case 'contentType': return r.contentTypeName;
        case 'placement': return r.placementName;
        case 'landing': {
          if (!r.utmCode) return '';
          const code = r.utmCode.startsWith('ue_') ? r.utmCode.slice(3) : r.utmCode;
          const mediaInitial = r.mediaInitial || '';
          const afterMedia = mediaInitial && code.startsWith(mediaInitial) ? code.slice(mediaInitial.length) : code;
          const product = activeProductId ? masterData.products.get(activeProductId) : undefined;
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
      const r = row;
      switch (pos.colKey) {
        case 'product':
          return r.productId ? (masterData.products.get(r.productId)?.name || '') : '';
        case 'marketer':
          return r.marketerId ? (masterData.employees.get(r.marketerId)?.name || '') : '';
        case 'planner':
          return r.plannerId ? (masterData.employees.get(r.plannerId)?.name || '') : '';
        case 'creator':
          return r.creatorId ? (masterData.employees.get(r.creatorId)?.name || '') : '';
        case 'media':
          return r.mediaId ? (masterData.media.get(r.mediaId)?.name || '') : '';
        case 'contentType':
          return r.contentTypeId ? (masterData.contentTypes.get(r.contentTypeId)?.name || '') : '';
        case 'placement':
          return r.placementId ? (masterData.placements.get(r.placementId)?.name || '') : '';
        case 'landing': {
          if (!r.landingId) return '';
          const product = masterData.products.get(r.productId || activeProductId || '');
          const ln = (product?.landing_numbers || []).find(l => l.id === r.landingId);
          return ln ? ln.number : '';
        }
        case 'sequence': return r.sequence;
        case 'utmCode': return '';
        case 'adUrl': return '';
      }
    }
    return '';
  }

  // label → id 변환 함수 (붙여넣기용)
  function getDisplayValueToId(col: ColKey, label: string): string | null {
    if (!label) return '';
    const nameOnly = label.includes(' (') ? label.split(' (')[0] : label;
    const initialInLabel = label.match(/ \(([^)]+)\)$/)?.[1] ?? null;
    switch (col) {
      case 'marketer':
      case 'planner':
      case 'creator': {
        if (initialInLabel) {
          const emp = employeeByInitial.get(initialInLabel);
          if (emp) {
            for (const [id, e] of masterData.employees) {
              if (e.initial === initialInLabel) return id;
            }
          }
        }
        let initialMatch: string | null = null;
        for (const [id, emp] of masterData.employees) {
          if (emp.name.trim() === label || emp.name.trim() === nameOnly) return id;
          if (!initialMatch && initialInLabel && emp.initial === initialInLabel) initialMatch = id;
        }
        return initialMatch;
      }
      case 'media': {
        for (const [id, m] of masterData.media) {
          if (m.name === label || m.name === nameOnly) return id;
        }
        return null;
      }
      case 'contentType': {
        for (const [id, ct] of masterData.contentTypes) {
          if (ct.name === label || ct.name === nameOnly) return id;
        }
        return null;
      }
      case 'placement': {
        for (const [id, pl] of masterData.placements) {
          if (pl.name === label || pl.name === nameOnly) return id;
        }
        return null;
      }
      case 'landing': {
        const numberOnly = label.includes(' (') ? label.split(' (')[0] : label;
        const product = activeProductId ? masterData.products.get(activeProductId) : undefined;
        if (product) {
          const ln = (product.landing_numbers || []).find(
            l => l.number === label || l.number === numberOnly
          );
          if (ln) return ln.id;
        }
        return null;
      }
      case 'sequence': return label;
      default: return null;
    }
  }

  useSheetKeyboard({
    rows: allRows,
    selectedCell,
    rangeSelection,
    onSelectCell: (pos: CellPos | null) => selectCell(pos),
    onSetRangeSelection: setRangeSelection,
    onSave: saveNewRows,
    onCloseDropdown: handleCloseDropdown,
    onOpenDropdown: handleOpenDropdown,
    onClearCells: clearCells,
    onGetCellDisplayValue: getCellDisplayValue,
    onPasteCells: (anchor, data) => pasteCells(anchor, data, getDisplayValueToId, colOrderRef.current?.orderedCols),
    onUndo: undo,
    onRedo: redo,
    onFillDown: fillDown,
    orderedCols: colOrderRef.current?.orderedCols,
  });


  const sidebarItems = getSidebarItems();
  const activeItem = sidebarItems.find(
    i => i.productId === activeProductId && i.mediaId === activeMediaId
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Sidebar + right pane row */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* masterData 전체 로딩 스피너 */}
        {masterData.loading && (
          <div
            style={{
              position: 'absolute', inset: 0, zIndex: 30,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.9)',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 28, height: 28, borderRadius: '50%',
                border: '3px solid #e0e0e0',
                borderTopColor: '#1a73e8',
                animation: 'sheet-spin 0.7s linear infinite',
              }}
            />
            <span style={{ fontSize: 12, color: '#9aa0a6' }}>로딩 중...</span>
          </div>
        )}

        {/* Sidebar */}
        <SheetSidebar
          items={sidebarItems}
          activeProductId={activeProductId}
          activeMediaId={activeMediaId}
          favorites={favorites}
          width={sidebarWidth}
          onSelectContext={selectContext}
          onToggleFavorite={toggleFavorite}
        />

        {/* Resizer */}
        <div
          style={{
            width: 4,
            background: 'var(--border)',
            cursor: 'col-resize',
            flexShrink: 0,
            transition: 'background 0.15s',
          }}
          onMouseDown={handleResizerMouseDown}
          onMouseEnter={e => (e.currentTarget.style.background = '#1a73e8')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--border)')}
        />

        {/* Right pane */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'white' }}>
          {/* Toolbar */}
          <div
            style={{
              height: 38,
              minHeight: 38,
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid var(--border)',
              padding: '0 10px',
              gap: 6,
            }}
          >
            {/* Breadcrumb */}
            <div style={{ fontSize: 13, color: '#5f6368', display: 'flex', alignItems: 'center', gap: 4 }}>
              {activeItem ? (
                <>
                  <span style={{ color: '#1a73e8' }}>{activeItem.brandName}</span>
                  <span style={{ color: '#bdbdbd' }}> / {activeItem.mediaName}</span>
                  <span style={{ color: '#bdbdbd' }}> › </span>
                  <Badge className={cn(getProductColor(activeItem.productId).bg, getProductColor(activeItem.productId).text)}>{activeItem.productName}</Badge>
                </>
              ) : (
                <span>제품과 매체를 선택하세요</span>
              )}
            </div>

            <div style={{ flex: 1 }} />

            {/* Load more button */}
            <button
              onClick={loadMoreRows}
              disabled={loading || !hasMoreRows}
              style={{
                fontSize: 12, padding: '3px 12px',
                border: '1px solid #dadce0', borderRadius: 4,
                background: 'white', cursor: (loading || !hasMoreRows) ? 'default' : 'pointer',
                color: !hasMoreRows ? '#9aa0a6' : '#1a73e8', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 4,
                opacity: !hasMoreRows ? 0.5 : 1,
              }}
            >
              <ChevronUp className="w-3 h-3" />
              이전 5개 더 보기
              {loading && (
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  border: '1.5px solid #dadce0',
                  borderTopColor: '#1a73e8',
                  animation: 'sheet-spin 0.7s linear infinite',
                  flexShrink: 0,
                }} />
              )}
            </button>

            {/* 열 순서 설정 버튼 */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  if (isColOrderOpen) {
                    setIsColOrderOpen(false);
                  } else {
                    setTempColOrder(colOrderRef.current?.orderedCols ? [...colOrderRef.current.orderedCols] : [...COLS]);
                    setIsColOrderOpen(true);
                  }
                }}
                title="열 순서 변경"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 28, height: 28,
                  border: '1px solid #dadce0', borderRadius: 4,
                  background: 'white', cursor: 'pointer', color: '#5f6368',
                }}
              >
                <Settings2 className="w-4 h-4" />
              </button>
              {isColOrderOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] z-50 bg-card border rounded-lg shadow-xl p-3 w-48">
                  <div className="space-y-1">
                    {tempColOrder.map((colKey, idx) => (
                      <div
                        key={colKey}
                        draggable
                        onDragStart={e => {
                          e.dataTransfer.effectAllowed = 'move';
                          e.dataTransfer.setData('text/plain', String(idx));
                          colModalDragIdx.current = idx;
                          (e.currentTarget as HTMLElement).style.opacity = '0.4';
                        }}
                        onDragEnter={e => {
                          e.preventDefault();
                          (e.currentTarget as HTMLElement).style.outline = '2px dashed hsl(var(--primary))';
                          (e.currentTarget as HTMLElement).style.outlineOffset = '-2px';
                        }}
                        onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                        onDragLeave={e => {
                          (e.currentTarget as HTMLElement).style.outline = '';
                          (e.currentTarget as HTMLElement).style.outlineOffset = '';
                        }}
                        onDrop={e => {
                          e.preventDefault();
                          (e.currentTarget as HTMLElement).style.outline = '';
                          const from = Number(e.dataTransfer.getData('text/plain'));
                          if (isNaN(from) || from === idx) return;
                          setTempColOrder(prev => {
                            const next = [...prev];
                            const [item] = next.splice(from, 1);
                            next.splice(idx, 0, item);
                            return next;
                          });
                          colModalDragIdx.current = null;
                        }}
                        onDragEnd={e => {
                          (e.currentTarget as HTMLElement).style.opacity = '';
                          colModalDragIdx.current = null;
                        }}
                        className="flex items-center gap-2 rounded px-3 py-2 text-sm cursor-grab select-none bg-muted/40 hover:bg-muted/70"
                      >
                        <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span>{COL_LABELS[colKey]}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setTempColOrder([...COLS])}>초기화</Button>
                    <Button size="sm" className="flex-1" onClick={() => {
                      const LS_KEY = 'utm-sheet-column-order';
                      colOrderRef.current?.setOrderedCols(tempColOrder);
                      localStorage.setItem(LS_KEY, JSON.stringify(tempColOrder));
                      setIsColOrderOpen(false);
                    }}>적용</Button>
                  </div>
                </div>
              )}
            </div>

            {/* 단축키 안내 버튼 */}
            <div style={{ position: 'relative' }}>
              <button
                ref={shortcutsBtnRef}
                onClick={() => setShowShortcuts(v => !v)}
                title="단축키 안내"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 28, height: 28,
                  border: '1px solid #dadce0', borderRadius: 4,
                  background: showShortcuts ? '#e8f0fe' : 'white', cursor: 'pointer',
                  color: showShortcuts ? '#1a73e8' : '#5f6368',
                }}
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              {showShortcuts && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={() => setShowShortcuts(false)} />
                  <div
                    style={{
                      position: 'absolute', right: 0, top: '100%', marginTop: 4,
                      zIndex: 9999, background: 'white',
                      border: '1px solid #e0e0e0', borderRadius: 8,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                      padding: '12px 16px', minWidth: 260, fontSize: 12, color: '#444',
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 13, color: '#1a1a1a' }}>단축키 안내</div>
                    <div style={{ height: 1, background: '#e0e0e0', marginBottom: 10 }} />
                    {[
                      ['방향키', '셀 이동'], ['Shift+방향키', '범위 선택'],
                      ['Tab', '다음 셀'], ['Enter', '아래 셀'],
                      ['Ctrl+C', '복사'], ['Ctrl+X', '잘라내기'], ['Ctrl+V', '붙여넣기'],
                      ['Ctrl+Z', '실행취소'], ['Ctrl+Y', '다시실행'],
                      ['Ctrl+D', '아래로 채우기'], ['Delete', '내용 지우기'],
                      ['Ctrl+A', '전체 선택'], ['Ctrl+Home', '첫 셀로'],
                      ['Ctrl+End', '마지막 셀로'], ['Ctrl+Enter', '저장'],
                    ].map(([key, desc]) => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', gap: 16 }}>
                        <code style={{ background: '#f1f3f4', border: '1px solid #e0e0e0', borderRadius: 4, padding: '1px 6px', fontSize: 11, fontFamily: 'monospace', color: '#1a73e8', whiteSpace: 'nowrap' }}>{key}</code>
                        <span style={{ color: '#5f6368', flex: 1, textAlign: 'right' }}>{desc}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sheet area */}
          <div
            style={{ flex: 1, overflow: 'auto', position: 'relative' }}
            onClick={() => selectCell(null)}
            onMouseDown={e => {
              if (!(e.target as HTMLElement).closest('input, textarea')) {
                e.preventDefault();
              }
            }}
          >
            {loading && (
              <div
                style={{
                  position: 'absolute', inset: 0, zIndex: 20,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.8)',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    border: '3px solid #e0e0e0',
                    borderTopColor: '#1a73e8',
                    animation: 'sheet-spin 0.7s linear infinite',
                  }}
                />
                <span style={{ fontSize: 12, color: '#9aa0a6' }}>로딩 중...</span>
              </div>
            )}
            {!masterData.loading && (
              <SheetTable
                rows={allRows}
                selectedCell={selectedCell}
                onSelectCell={pos => { selectCell(pos); setRangeSelection(null); }}
                onUpdateNewRowField={updateNewRowField}
                onUpdateFromUtmCode={updateFromUtmCode}
                onApplyFill={applyFill}
                onApplyFillRange={applyFillRange}
                masterData={masterData}
                activeProductId={activeProductId}
                getLandingOptions={getLandingOptions}
                getEmployeeOptions={getEmployeeOptions}
                getMediaOptions={getMediaOptions}
                getContentTypeOptions={getContentTypeOptions}
                getPlacementOptions={getPlacementOptions}
                rangeSelection={rangeSelection}
                onSetRangeSelection={setRangeSelection}
                openDropdownRequest={openDropdownRequest}
                sequenceLoadingIds={sequenceLoadingIds}
                onDropdownChange={handleDropdownChange}
                totalCount={totalCount}
                onToggleSimpleUrl={toggleSimpleUrl}
                colOrderRef={colOrderRef}
              />
            )}
          </div>
        </div>
      </div>

      {/* Full-width change panel */}
      <SheetChangePanel
        pendingRows={pendingNewRows}
        masterData={masterData}
        saving={saving}
        onSave={saveNewRows}
        activeProductId={activeProductId}
        existingUtmCodes={new Set([
          ...existingRows.map(r => r.utmCode).filter(Boolean),
          ...knownExistingUtmCodes,
        ])}
        totalCount={totalCount}
        newRows={newRows}
      />

      {/* Toast notifications */}
      {(saveSuccess || saveError) && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {saveSuccess && (
            <div
              style={{
                padding: '10px 16px',
                borderRadius: 6,
                fontSize: 13,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                maxWidth: 320,
                background: '#1a73e8',
                color: 'white',
              }}
            >
              <span>✓</span>
              <span>{saveSuccess}</span>
            </div>
          )}
          {saveError && (
            <div
              style={{
                padding: '10px 16px',
                borderRadius: 6,
                fontSize: 13,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                maxWidth: 320,
                background: '#ef4444',
                color: 'white',
              }}
            >
              <span>✕</span>
              <span>{saveError}</span>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes sheet-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
