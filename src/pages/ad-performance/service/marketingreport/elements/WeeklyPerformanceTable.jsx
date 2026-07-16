import React, { useMemo, useState } from "react";
import {
  calculateCPC,
  calculateCTR,
  calculateCVR,
  calculateROAS,
} from "./utils/metricsUtils";
import "./WeeklyPerformanceTable.css";

// 컬럼 메타데이터
const COLUMN_METADATA = {
  clicks: { label: '클릭수' },
  adCost: { label: '광고비' },
  cpc: { label: 'CPC' },
  ctr: { label: 'CTR' },
  conversions: { label: '구매건수' },
  revenue: { label: '직접매출' },
  cvr: { label: '전환율' },
  roas: { label: 'ROAS' },
};

const WeeklyPerformanceTable = ({
  weekStartDay,
  customDateRange,
  selectedMedia,
  selectedProduct,
  userRole,
  userTeam,
  weeklyData,
  loading,
  error,
  onColumnReorder,
  columnOrder = ['clicks', 'adCost', 'cpc', 'ctr', 'conversions', 'revenue', 'cvr', 'roas'],
}) => {

  // 컬럼 드래그 상태
  const [draggedColumn, setDraggedColumn] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // 합계 계산 (hooks는 early return 전에 정의되어야 함)
  const totals = useMemo(() => {
    if (!weeklyData || weeklyData.length === 0) {
      return null;
    }

    const totalAdCost = weeklyData.reduce((sum, week) => sum + week.adCost, 0);
    const totalRevenue = weeklyData.reduce(
      (sum, week) => sum + week.revenue,
      0
    );
    const totalConversions = weeklyData.reduce(
      (sum, week) => sum + week.conversions,
      0
    );
    const totalClicks = weeklyData.reduce((sum, week) => sum + week.clicks, 0);
    const totalImpressions = weeklyData.reduce(
      (sum, week) => sum + week.impressions,
      0
    );

    return {
      adCost: totalAdCost,
      revenue: totalRevenue,
      roas: calculateROAS(totalRevenue, totalAdCost),
      conversions: totalConversions,
      cvr: calculateCVR(totalConversions, totalClicks),
      cpc: calculateCPC(totalAdCost, totalClicks),
      ctr: calculateCTR(totalClicks, totalImpressions),
      clicks: totalClicks,
    };
  }, [weeklyData]);

  // 컬럼 드래그 핸들러
  const handleColumnDragStart = (e, columnKey) => {
    setDraggedColumn(columnKey);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', columnKey);
  };

  const handleColumnDragOver = (e, columnKey) => {
    if (!draggedColumn) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnKey) {
      setDragOverColumn(columnKey);
    }
  };

  const handleColumnDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleColumnDrop = (e, columnKey) => {
    e.preventDefault();
    if (!draggedColumn || draggedColumn === columnKey) {
      setDraggedColumn(null);
      setDragOverColumn(null);
      return;
    }

    // 부모로 순서 변경 알림
    if (onColumnReorder) {
      onColumnReorder(draggedColumn, columnKey);
    }

    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  const handleColumnDragEnd = () => {
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  // 주간 마케팅 성과가 표시되어야 하는지 확인 (C등급 제외, S/A/B등급만 표시)
  const shouldShow = userRole !== "C";

  if (!shouldShow) {
    return null;
  }

  if (loading) {
    return (
      <div className="weekly-performance">
        <h3 className="section-title">주간 마케팅 성과</h3>
        <div className="loading">데이터를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weekly-performance">
        <h3 className="section-title">주간 마케팅 성과</h3>
        <div className="error">오류: {error}</div>
      </div>
    );
  }

  // 컬럼별 값 렌더링 함수
  const renderCellValue = (columnKey, week) => {
    if (!week) return '-';
    const value = week[columnKey];
    if (value === null || value === undefined) return '-';

    if (columnKey === 'ctr' || columnKey === 'cvr' || columnKey === 'roas') {
      return `${value}%`;
    }
    return typeof value === 'number' ? value.toLocaleString() : (value || '-');
  };

  return (
    <div className="weekly-performance">
      <h3 className="section-title">주간 마케팅 성과</h3>
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>주차</th>
              {(columnOrder || []).filter(key => COLUMN_METADATA[key]).map((columnKey) => {
                const meta = COLUMN_METADATA[columnKey];
                return (
                  <th
                    key={columnKey}
                    draggable={true}
                    onDragStart={(e) => handleColumnDragStart(e, columnKey)}
                    onDragOver={(e) => handleColumnDragOver(e, columnKey)}
                    onDragLeave={handleColumnDragLeave}
                    onDrop={(e) => handleColumnDrop(e, columnKey)}
                    onDragEnd={handleColumnDragEnd}
                    className={`draggable-header ${draggedColumn === columnKey ? 'dragging' : ''} ${dragOverColumn === columnKey ? 'drag-over' : ''}`}
                    style={{ cursor: 'move' }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      width: '100%',
                    }}>
                      <span style={{ whiteSpace: 'nowrap' }}>{meta.label}</span>
                      <span className="drag-handle">⋮⋮</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {weeklyData.length > 0 ? (
              <>
                {weeklyData.map((week, index) => (
                  <tr key={index}>
                    <td>
                      {week.week}{" "}
                      <span className="week-date-range">{week.period}</span>
                    </td>
                    {(columnOrder || []).filter(key => COLUMN_METADATA[key]).map((columnKey) => (
                      <td key={columnKey}>
                        {renderCellValue(columnKey, week)}
                      </td>
                    ))}
                  </tr>
                ))}
                {totals && (
                  <tr className="total-row">
                    <td>합계</td>
                    {(columnOrder || []).filter(key => COLUMN_METADATA[key]).map((columnKey) => (
                      <td key={columnKey}>
                        {renderCellValue(columnKey, totals)}
                      </td>
                    ))}
                  </tr>
                )}
              </>
            ) : (
              <tr>
                <td colSpan={(columnOrder || []).filter(key => COLUMN_METADATA[key]).length + 1}>데이터가 없습니다</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeeklyPerformanceTable;
