import React, { useMemo } from "react";
import "./StatusCounts.css";

const StatusCounts = React.memo(({ statusCounts }) => {
  const totalCount = useMemo(() => ({
    key: "totalItems",
    label: "콜 전체",
    count: statusCounts.totalItems,
  }), [statusCounts.totalItems]);

  const newCount = useMemo(() => ({
    key: "newCount",
    label: "신규",
    count: statusCounts.todayEmptyMemosCount,
    title: "해당 기간에 담당자에게 처음으로 분배된 신규 고객 수"
  }), [statusCounts.todayEmptyMemosCount]);

  const groupedCounts = useMemo(() => [
    {
      key: "reservationCount",
      label: "예약",
      count: statusCounts.reservationCount,
      title: "[콜내역]-예약/재예약 이면서 [방문상태]-노쇼/재통화요청/개인일정취소/상담종료가 아니면 됨"
    },
    {
      key: "absenceCount",
      label: "부재",
      count: statusCounts.absenceCount,
      title: "[콜내역]-부재/장기부재"
    },
    {
      key: "cancellationsCount",
      label: "취소",
      count: statusCounts.cancellationsCount,
      title: "[콜내역]-취소요청 / [방문상태]-개인일정취소/상담종료"
    },
  ], [statusCounts.reservationCount, statusCounts.absenceCount, statusCounts.cancellationsCount]);

  const reservationRate = useMemo(() => ({
    key: "reservationRate",
    label: "예약률",
    count: statusCounts.totalItems > 0
      ? ((statusCounts.reservationCount / statusCounts.totalItems) * 100).toFixed(1)
      : "0.0",
    title: "예약/콜 전체"
  }), [statusCounts.reservationCount, statusCounts.totalItems]);

  return (
    <div className="tmStatusCounts_container">
      {/* 콜 전체 박스 */}
      <div className="status-card">
        <div className="status-card-inner">
          <div className={`status-box-item ${totalCount.key}`}>
            <div className="status-name">
              <h4>{totalCount.label}</h4>
            </div>
            <div className="status-count">
              <span>{totalCount.count}</span>건
            </div>
          </div>
        </div>
      </div>

      {/* 신규 박스 */}
      <div className="status-card">
        <div className="status-card-inner">
          <div className={`status-box-item ${newCount.key}`}>
            <div className="status-name">
              <div className="status-color"></div>
              <h4 title={newCount.title}>{newCount.label}</h4>
            </div>
            <div className="status-count">
              <span>{newCount.count}</span>건
            </div>
          </div>
        </div>
      </div>

      {/* 예약 부재 취소 그룹 박스 */}
      <div className="status-card grouped">
        <div className="status-card-inner">
          {groupedCounts.map((item) => (
            <div key={item.key} className={`status-box-item ${item.key}`}>
              <div className="status-name">
                <div className="status-color"></div>
                <h4 title={item.title}>{item.label}</h4>
              </div>
              <div className="status-count">
                <span>{item.count}</span>건
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 예약률 박스 */}
      <div className="status-card">
        <div className="status-card-inner">
          <div className={`status-box-item ${reservationRate.key}`}>
            <div className="status-name">
              <h4 title={reservationRate.title}>{reservationRate.label}</h4>
            </div>
            <div className="status-count">
              <span>{reservationRate.count}</span>%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default StatusCounts;
