import { useEffect, useRef } from 'react';
import { COLS } from '../types/sheet';
import type { CellPos, ColKey, SheetRow, RangeSelection } from '../types/sheet';

function copyViaExecCommand(text: string) {
  const ta = document.createElement('textarea');
  ta.value = text;
  Object.assign(ta.style, { position: 'fixed', opacity: '0', top: '0', left: '0' });
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try { document.execCommand('copy'); } catch {}
  document.body.removeChild(ta);
}

const DROPDOWN_COLS: ColKey[] = ['marketer', 'planner', 'creator', 'contentType', 'placement', 'landing'];

interface UseSheetKeyboardProps {
  rows: SheetRow[];
  selectedCell: CellPos | null;
  rangeSelection: RangeSelection | null;
  onSelectCell: (pos: CellPos | null) => void;
  onSetRangeSelection: (r: RangeSelection | null) => void;
  onSave: () => void;
  onCloseDropdown: () => void;
  onOpenDropdown: (pos: CellPos) => void;
  onClearCells: (range: RangeSelection) => void;
  onGetCellDisplayValue: (pos: CellPos) => string;
  onPasteCells: (anchor: CellPos, data: string[][]) => void;
  onUndo: () => void;
  onRedo: () => void;
  onFillDown: (range: RangeSelection) => void;
  orderedCols?: ColKey[];
}

export function useSheetKeyboard(props: UseSheetKeyboardProps) {
  const r = useRef(props);
  r.current = props;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const { rows, selectedCell, rangeSelection,
        onSelectCell, onSetRangeSelection, onSave, onCloseDropdown, onOpenDropdown,
        onClearCells, onGetCellDisplayValue, onUndo, onRedo, onFillDown, orderedCols } = r.current;

      const tag = (document.activeElement?.tagName || '').toLowerCase();

      if (e.key === 'Escape') {
        onCloseDropdown();
        onSetRangeSelection(null);
        return;
      }

      if (e.ctrlKey && e.key === 'Enter') {
        onSave();
        e.preventDefault();
        return;
      }

      if (e.ctrlKey && e.key === 'a') {
        if (tag === 'input' || tag === 'textarea') return;
        if (rows.length > 0) {
          onSetRangeSelection({
            anchor: { rowIndex: 0, colKey: COLS[0] },
            current: { rowIndex: rows.length - 1, colKey: COLS[COLS.length - 1] },
          });
          e.preventDefault();
        }
        return;
      }

      if (e.ctrlKey && e.key === 'c') {
        if (tag === 'input' || tag === 'textarea') {
          const copyCell = rangeSelection?.anchor ?? selectedCell;
          const isExistingRow = copyCell && rows[copyCell.rowIndex]?.kind === 'existing';
          if (!isExistingRow) return;
        }
        const range = rangeSelection;
        const cell = selectedCell;
        if (!range && !cell) return;

        const anchor = range?.anchor ?? cell!;
        const current = range?.current ?? cell!;

        const colRef = orderedCols ?? COLS;
        const minRow = Math.min(anchor.rowIndex, current.rowIndex);
        const maxRow = Math.max(anchor.rowIndex, current.rowIndex);
        const minColIdx = Math.min(colRef.indexOf(anchor.colKey), colRef.indexOf(current.colKey));
        const maxColIdx = Math.max(colRef.indexOf(anchor.colKey), colRef.indexOf(current.colKey));

        const lines: string[] = [];
        for (let ri = minRow; ri <= maxRow; ri++) {
          const cells: string[] = [];
          for (let ci = minColIdx; ci <= maxColIdx; ci++) {
            cells.push(onGetCellDisplayValue({ rowIndex: ri, colKey: colRef[ci] as ColKey }));
          }
          lines.push(cells.join('\t'));
        }
        const text = lines.join('\n');
        copyViaExecCommand(text);
        navigator.clipboard?.writeText(text).catch(() => {});
        e.preventDefault();
        return;
      }

      if (e.ctrlKey && e.key === 'z') {
        onUndo();
        e.preventDefault();
        return;
      }

      if (e.ctrlKey && e.key === 'y') {
        onRedo();
        e.preventDefault();
        return;
      }

      if (e.ctrlKey && e.key === 'x') {
        if (tag === 'input' || tag === 'textarea') return;
        const range = rangeSelection;
        const cell = selectedCell;
        if (!range && !cell) return;

        const anchor = range?.anchor ?? cell!;
        const current = range?.current ?? cell!;

        const colRef2 = orderedCols ?? COLS;
        const minRow = Math.min(anchor.rowIndex, current.rowIndex);
        const maxRow = Math.max(anchor.rowIndex, current.rowIndex);
        const minColIdx = Math.min(colRef2.indexOf(anchor.colKey), colRef2.indexOf(current.colKey));
        const maxColIdx = Math.max(colRef2.indexOf(anchor.colKey), colRef2.indexOf(current.colKey));

        const lines: string[] = [];
        for (let ri = minRow; ri <= maxRow; ri++) {
          const cells: string[] = [];
          for (let ci = minColIdx; ci <= maxColIdx; ci++) {
            cells.push(onGetCellDisplayValue({ rowIndex: ri, colKey: colRef2[ci] as ColKey }));
          }
          lines.push(cells.join('\t'));
        }
        const cutText = lines.join('\n');
        copyViaExecCommand(cutText);
        navigator.clipboard?.writeText(cutText).catch(() => {});

        const cutRange = range ?? { anchor: cell!, current: cell! };
        onClearCells(cutRange);
        e.preventDefault();
        return;
      }

      if (e.ctrlKey && e.key === 'd') {
        const range = rangeSelection;
        const cell = selectedCell;
        if (!range && !cell) return;
        const fillRange = range ?? { anchor: cell!, current: cell! };
        onFillDown(fillRange);
        e.preventDefault();
        return;
      }

      const navCols = orderedCols ?? COLS;

      if (e.ctrlKey && e.key === 'Home') {
        if (rows.length > 0) {
          onSelectCell({ rowIndex: 0, colKey: navCols[0] });
          onSetRangeSelection(null);
          e.preventDefault();
        }
        return;
      }

      if (e.ctrlKey && e.key === 'End') {
        if (rows.length > 0) {
          onSelectCell({ rowIndex: rows.length - 1, colKey: navCols[navCols.length - 1] });
          onSetRangeSelection(null);
          e.preventDefault();
        }
        return;
      }

      if (e.ctrlKey) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
        const range = rangeSelection;
        if (range) {
          onClearCells(range);
          e.preventDefault();
          return;
        }
        if (selectedCell) {
          onClearCells({ anchor: selectedCell, current: selectedCell });
          e.preventDefault();
          return;
        }
        return;
      }

      if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
      if (!selectedCell) return;

      const { rowIndex, colKey } = selectedCell;
      const colIdx = navCols.indexOf(colKey);
      if (colIdx === -1) return;

      if (e.shiftKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        const currentAnchor = rangeSelection?.anchor ?? selectedCell;
        const currentEnd = rangeSelection?.current ?? selectedCell;
        const endColIdx = navCols.indexOf(currentEnd.colKey);

        let newEndRow = currentEnd.rowIndex;
        let newEndColIdx = endColIdx;

        if (e.key === 'ArrowDown') newEndRow = Math.min(currentEnd.rowIndex + 1, rows.length - 1);
        else if (e.key === 'ArrowUp') newEndRow = Math.max(currentEnd.rowIndex - 1, 0);
        else if (e.key === 'ArrowRight') newEndColIdx = Math.min(endColIdx + 1, navCols.length - 1);
        else if (e.key === 'ArrowLeft') newEndColIdx = Math.max(endColIdx - 1, 0);

        onSetRangeSelection({
          anchor: currentAnchor,
          current: { rowIndex: newEndRow, colKey: navCols[newEndColIdx] as ColKey },
        });
        e.preventDefault();
        return;
      }

      let newRowIndex = rowIndex;
      let newColIdx = colIdx;

      if (e.key === 'ArrowDown') {
        newRowIndex = Math.min(rowIndex + 1, rows.length - 1);
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        newRowIndex = Math.max(rowIndex - 1, 0);
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        newColIdx = Math.min(colIdx + 1, navCols.length - 1);
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        newColIdx = Math.max(colIdx - 1, 0);
        e.preventDefault();
      } else if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (colIdx > 0) {
            newColIdx = colIdx - 1;
          } else if (rowIndex > 0) {
            newRowIndex = rowIndex - 1;
            newColIdx = navCols.length - 1;
          }
        } else {
          if (colIdx < navCols.length - 1) {
            newColIdx = colIdx + 1;
          } else if (rowIndex < rows.length - 1) {
            newRowIndex = rowIndex + 1;
            newColIdx = 0;
          }
        }
        e.preventDefault();
      } else if (e.key === 'Enter') {
        const row = rows[rowIndex];
        if (row?.kind === 'new' && DROPDOWN_COLS.includes(colKey)) {
          onOpenDropdown({ rowIndex, colKey });
          e.preventDefault();
          return;
        }
        newRowIndex = Math.min(rowIndex + 1, rows.length - 1);
        e.preventDefault();
      }

      if (newRowIndex !== rowIndex || newColIdx !== colIdx) {
        const newCol = navCols[newColIdx] as ColKey;
        onSelectCell({ rowIndex: newRowIndex, colKey: newCol });
        onSetRangeSelection(null);
      }
    }

    function handlePaste(e: ClipboardEvent) {
      const { selectedCell, rangeSelection, onPasteCells } = r.current;
      const t = (document.activeElement?.tagName || '').toLowerCase();
      const isNativePasteTarget = t === 'textarea' ||
        (t === 'input' && (document.activeElement as HTMLElement)?.dataset?.nativePaste === 'true');
      if (isNativePasteTarget) return;

      const anchor = rangeSelection?.anchor ?? selectedCell;
      if (!anchor) return;

      e.preventDefault();
      const text = e.clipboardData?.getData('text') || '';
      const data = text.split(/\r?\n/)
        .map(line => line.split('\t').map(cell => cell.replace(/\r$/, '')))
        .filter(row => row.some(cell => cell.trim() !== ''));
      onPasteCells(anchor, data);
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('paste', handlePaste);
    };
  }, []);
}
