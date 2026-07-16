import React, { useMemo } from 'react';
import '../CSData.css';

/**
 * 출고 관리 대시보드 컴포넌트
 * 매출 통계 정보를 표시합니다.
 *
 * @param {object} stats - API에서 받은 통계 데이터
 */
const ShippingDashboard = ({ stats }) => {
  // 오늘 매출 / 전체 매출 통합 카드
  const revenueCard = useMemo(() => ({
    key: 'revenue',
    label: '오늘 매출 / 전체 매출',
    todayRevenue: stats?.todayRevenue?.toLocaleString() || '0',
    totalRevenue: stats?.totalRevenue?.toLocaleString() || '0',
  }), [stats]);

  // 오늘 출고 / 전체 출고 통합 카드
  const countCard = useMemo(() => ({
    key: 'count',
    label: '오늘 출고 / 전체 출고',
    todayCount: stats?.todayCount || 0,
    totalCount: stats?.totalCount || 0,
  }), [stats]);

  return (
    <div className="shipping-dashboard">
      {/* 매출 카드 */}
      <div className="dashboard-card">
        <div className="dashboard-card-inner">
          <div className="dashboard-item revenue">
            <div className="dashboard-label">
              <div className="dashboard-color"></div>
              <h4>{revenueCard.label}</h4>
            </div>
            <div className="dashboard-value">
              <span className="today-value">{revenueCard.todayRevenue}</span>
              <span className="separator">/</span>
              <span className="total-value">{revenueCard.totalRevenue}</span> 원
            </div>
          </div>
        </div>
      </div>

      {/* 출고 건수 카드 */}
      <div className="dashboard-card">
        <div className="dashboard-card-inner">
          <div className="dashboard-item count">
            <div className="dashboard-label">
              <div className="dashboard-color"></div>
              <h4>{countCard.label}</h4>
            </div>
            <div className="dashboard-value">
              <span className="today-value">{countCard.todayCount}</span>
              <span className="separator">/</span>
              <span className="total-value">{countCard.totalCount}</span> 건
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingDashboard;
