import React, { useMemo } from "react";

const EventMetricSummary = ({
  eventStats = [],
  formatNumber,
}) => {
  const fixedRows = useMemo(() => [
    { label: "예약자 수", key: "reservedCount" },
    { label: "예약자 비율", key: "reservedRate" },
    { label: "약속 이행률", key: "fulfillmentRate" },
    { label: "신환 객단가", key: "unitPayment" },
    { label: "상담 동의율", key: "consultAgreeRate" },
    { label: "총 결제 예정 금액", key: "eventPayment" },
    { label: "전체 매출 내 비율", key: "eventPaymentRatio" },
  ], []);

  // 5개씩 그룹핑
  const grouped = useMemo(() => {
    if (!Array.isArray(eventStats)) return [];

    const groups = [];
    const chunkSize = 5;
    for (let i = 0; i < eventStats.length; i += chunkSize) {
      groups.push(eventStats.slice(i, i + chunkSize));
    }
    return groups;
  }, [eventStats]);

  if (!Array.isArray(eventStats)) return null;

  return (
    <div className="event-metric-summary">
      <div className="section-header">
        <h3>4. 이벤트별 주요 지표</h3>
      </div>
      <div className="table-wrapper">
        {grouped.map((group, groupIdx) => (
          <table key={`table-${groupIdx}`}>
            <thead>
              <tr>
                <th>분류</th>
                {Array.from({ length: 5 }).map((_, i) => {
                  const event = group[i];
                  return (
                    <th
                      key={`th-${groupIdx}-${i}`}
                      className={`th ${
                        event?.eventName === "total" ? "total" : ""
                      }`}
                    >
                      {event
                        ? event.eventName === "total"
                          ? "TOTAL"
                          : event.eventName
                        : "-"}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {fixedRows.map(({ label, key }) => (
                <tr key={`row-${groupIdx}-${key}`}>
                  <td>{label}</td>
                  {Array.from({ length: 5 }).map((_, i) => {
                    const event = group[i];
                    const value = event?.[key];

                    let unit = "";
                    if (key === "unitPayment" || key === "eventPayment")
                      unit = "₩";
                    else if (
                      key === "reservedRate" ||
                      key === "fulfillmentRate" ||
                      key === "consultAgreeRate" ||
                      key === "eventPaymentRatio"
                    )
                      unit = "%";

                    return (
                      <td
                        key={`cell-${groupIdx}-${i}-${key}`}
                        className={`td ${
                          event?.eventName === "total" ? "total" : ""
                        }`}
                      >
                        {value != null && value !== ""
                          ? formatNumber(value, unit)
                          : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
    </div>
  );
};

export default React.memo(EventMetricSummary);
