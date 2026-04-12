import React, { useRef, useEffect, useState } from "react";
import "./DataTable.css";

const DataTable = ({ columns, data, className = "", isAdmin = false, onCellClick, channelCount, onColumnReorder, sortConfig, onSort }) => {
  const containerRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [draggedCol, setDraggedCol] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsScrolled(container.scrollLeft > 0);
    };

    // 초기 체크
    handleScroll();

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // S등급이고 판매처가 2개 이하일 때 특별한 클래스 적용
  const viewClass = isAdmin
    ? (channelCount && channelCount <= 2 ? 'admin-view-small' : 'admin-view')
    : 'basic-view';

  // 드래그 핸들러
  const handleDragStart = (e, colIndex, col) => {
    if (!onColumnReorder || !col.isParent) return;
    setDraggedCol({ index: colIndex, col });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', colIndex.toString());
  };

  const handleDragOver = (e, colIndex, col) => {
    if (!onColumnReorder || !col.isParent || !draggedCol) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colIndex) {
      setDragOverCol(colIndex);
    }
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e, colIndex, col) => {
    e.preventDefault();
    if (!onColumnReorder || !col.isParent || !draggedCol) return;

    const fromIndex = draggedCol.index;
    const toIndex = colIndex;

    if (fromIndex !== toIndex) {
      // 드래그한 컬럼의 채널 이름과 드롭된 위치의 채널 이름으로 순서 변경 알림
      onColumnReorder(draggedCol.col.title, col.title);
    }

    setDraggedCol(null);
    setDragOverCol(null);
  };

  const handleDragEnd = () => {
    setDraggedCol(null);
    setDragOverCol(null);
  };

  // 실제 데이터 컬럼 인덱스 계산 함수
  const calculateDataColumnIndex = (rowIndex, colIndex) => {
    if (rowIndex === 0) {
      // 1행: colSpan을 고려하여 이전 컬럼들의 실제 너비 합산
      let dataIndex = 0;
      for (let i = 0; i < colIndex; i++) {
        const prevCol = columns[0][i];
        dataIndex += prevCol.colSpan || 1;
      }
      return dataIndex;
    } else if (rowIndex === 1) {
      // 2행: 1행의 rowSpan === 2인 컬럼 수 + 현재까지의 2행 컬럼 수
      let firstRowSingleColumns = 0;
      for (let i = 0; i < columns[0].length; i++) {
        if (columns[0][i].rowSpan === 2) {
          firstRowSingleColumns++;
        } else {
          break; // 부모 판매처가 시작되면 중단
        }
      }
      return firstRowSingleColumns + colIndex;
    }
    return colIndex;
  };

  return (
    <div
      ref={containerRef}
      className={`data-table-container ${className} ${isScrolled ? 'scrolled' : ''} ${viewClass}`}
    >
      <table className="data-table">
        <thead>
          {columns.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((col, colIndex) => {
                // 부모 판매처 헤더와 셀에 클래스 추가
                const isDraggable = onColumnReorder && col.isParent;
                const isDragging = draggedCol?.index === colIndex && rowIndex === 0;
                const isDragOver = dragOverCol === colIndex && rowIndex === 0 && draggedCol?.index !== colIndex;

                const headerClasses = [
                  col.tooltip ? 'has-tooltip' : '',
                  col.isParent ? 'parent-channel-header' : '',
                  col.isParentCell ? 'parent-channel-cell' : '',
                  isDraggable ? 'draggable-header' : '',
                  isDragging ? 'dragging' : '',
                  isDragOver ? 'drag-over' : ''
                ].filter(Boolean).join(' ');

                // 정렬 가능 여부 확인
                // - rowSpan === 2인 헤더 (단일 행 헤더)
                // - 2번째 행(rowIndex === 1)의 헤더 (판매처별 보기의 "매출", "비율" 등)
                const isSortable = onSort && (col.rowSpan === 2 || rowIndex === 1);

                // 실제 데이터 컬럼 인덱스 계산
                const dataColumnIndex = calculateDataColumnIndex(rowIndex, colIndex);
                const isSorted = sortConfig && sortConfig.columnIndex === dataColumnIndex;
                const sortDirection = isSorted ? sortConfig.direction : null;

                return (
                  <th
                    key={colIndex}
                    rowSpan={col.rowSpan}
                    colSpan={col.colSpan}
                    title={col.tooltip || undefined}
                    className={`${headerClasses} ${isSortable ? 'sortable' : ''} ${isSorted ? 'sorted' : ''}`}
                    style={{
                      ...(col.style || {}),
                      cursor: isSortable ? 'pointer' : (isDraggable ? 'move' : 'default'),
                    }}
                    draggable={isDraggable}
                    onDragStart={(e) => handleDragStart(e, colIndex, col)}
                    onDragOver={(e) => handleDragOver(e, colIndex, col)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, colIndex, col)}
                    onDragEnd={handleDragEnd}
                    onClick={() => {
                      if (isSortable) {
                        onSort(dataColumnIndex);
                      }
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isDraggable ? 'space-between' : 'center',
                      width: '100%',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        flex: isDraggable ? 1 : 'none',
                      }}>
                        <span style={{ whiteSpace: 'nowrap' }}>{col.title}</span>
                        {isSortable && (
                          <span className="sort-icon">
                            {!isSorted && '⇅'}
                            {isSorted && sortDirection === 'asc' && '↓'}
                            {isSorted && sortDirection === 'desc' && '↑'}
                          </span>
                        )}
                      </div>
                      {isDraggable && <span className="drag-handle">⋮⋮</span>}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={row.isTotal ? "total-row" : ""}
              data-retired={row.isRetired || undefined}
            >
              {row.cells.map((cell, cellIndex) => {
                // cell이 객체인 경우 value와 tooltip, clickable, className 분리
                const isObjectCell = cell && typeof cell === 'object' && cell.value !== undefined;
                const cellValue = isObjectCell ? cell.value : cell;
                const cellTooltip = isObjectCell ? cell.tooltip : undefined;
                const isClickable = isObjectCell && cell.clickable;
                const cellClassFromData = isObjectCell ? cell.className : undefined;
                const hasTooltip = !!cellTooltip;

                // 클릭 가능한 셀: 날짜 열(첫번째) 또는 clickable 플래그가 있는 셀
                const clickableClass = (onCellClick && cellIndex === 0 && !row.isTotal) || isClickable
                  ? "clickable-cell"
                  : "";

                // 모든 클래스 합치기
                const cellClass = [clickableClass, cellClassFromData, hasTooltip ? 'has-cell-tooltip' : '']
                  .filter(Boolean)
                  .join(' ');

                return (
                  <td
                    key={cellIndex}
                    onClick={() => onCellClick && onCellClick(rowIndex, cellIndex, cell, row)}
                    className={cellClass}
                    title={cellTooltip}
                  >
                    {cellValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;