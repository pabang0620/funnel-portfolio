import React, { useMemo } from "react";

// 구간별 실적
const SectionPerformance = ({
  loginUser,
  tmStats,
  total_ad_spend,
  dbUnitPrice,
  reservation_count,
  promise_fulfillment_rate,
  consult_consent_rate,
  consultPaidCount,
  formatNumber,
  togglePerformanceComparisonModal,
  dateType,
}) => {
  const table1Lable = useMemo(() => [
    { key: "total_ad_spend", label: "광고비 지출" },
    { key: "dbUnitPrice", label: "DB 단가" },
    { key: "customer_count", label: "DB 수량" },
    { key: "total_payment", label: "총 진료비 합계" },
    { key: "roas", label: "현재 ROAS" },
  ].filter((item) =>
    loginUser?.role === 5 || loginUser?.role === 6
      ? !["total_ad_spend", "dbUnitPrice", "roas"].includes(item.key)
      : true
  ), [loginUser?.role]);

  const table2Lable = useMemo(() => [
    { key: "reservation_count", label: "예약 건수" },
    { key: "first_reservation_rate", label: "예약률" },
    { key: "consultPaidCount", label: "방문 수" },
    { key: "promise_fulfillment_rate", label: "약속 이행률" },
    { key: "DBdangConsultRate", label: "DB당 내원율" },
  ], []);

  const table3Lable = useMemo(() => [
    { key: "paid_count", label: "상담 동의 (결제자 기준)" },
    { key: "consult_consent_rate", label: "상담 동의율" },
    { key: "new_customer_unit_price", label: "신환 객단가 (결제자 기준)" },
    { key: "pending_reservation_count", label: "내원 예정 수" },
    { key: "payment_rate_per_db", label: "DB당 결제율" },
  ], []);

  const table1Value = [
    {
      key: "total_ad_spend",
      value: dateType === "payment" ? "-" : formatNumber(total_ad_spend, "₩")
    },
    {
      key: "dbUnitPrice",
      value: dateType === "payment" ? "-" : formatNumber(dbUnitPrice, "₩"),
    },
    {
      key: "customer_count",
      value: dateType === "payment" ? "-" : tmStats.customer_count
    },
    { key: "total_payment", value: formatNumber(tmStats.total_payment, "₩") },
    {
      key: "roas",
      value: dateType === "payment" ? "-" : formatNumber((tmStats.total_payment / total_ad_spend) * 100, "%"),
    },
  ].filter((item) =>
    loginUser?.role === 5 || loginUser?.role === 6
      ? !["total_ad_spend", "dbUnitPrice", "roas"].includes(item.key)
      : true
  );

  const table2Value = [
    { key: "reservation_count", value: reservation_count },
    {
      key: "first_reservation_rate",
      value: dateType === "payment" ? "-" : formatNumber(tmStats.first_reservation_rate, "%"),
    },
    { key: "consultPaidCount", value: consultPaidCount },
    {
      key: "promise_fulfillment_rate",
      value: formatNumber(promise_fulfillment_rate, "%"),
    },
    {
      key: "DBdangConsultRate",
      value: dateType === "payment" ? "-" : formatNumber(tmStats.DBdangConsultRate, "%"),
    },
  ];

  const table3Value = [
    { key: "paid_count", value: tmStats.paid_count },
    {
      key: "consult_consent_rate",
      value: formatNumber(consult_consent_rate, "%"),
    },
    {
      key: "new_customer_unit_price",
      value: formatNumber(tmStats.new_customer_unit_price, "₩"),
    },
    {
      key: "pending_reservation_count",
      value: tmStats.pending_reservation_count,
    },
    {
      key: "payment_rate_per_db",
      value: dateType === "payment" ? "-" : `${formatNumber(
        (tmStats.paid_count / tmStats.customer_count) * 100,
        "%"
      )}`,
    },
  ];

  // 기대매출 = 현재 총 진료비 합계 + ( 방문대기자예약자 * 약속이행률 * 상담동의율 * 신환객단가)
  const expectedRevenue = useMemo(() =>
    tmStats.total_payment +
    tmStats.pending_reservation_count *
      (promise_fulfillment_rate / 100) *
      (consult_consent_rate / 100) *
      tmStats.new_customer_unit_price
  , [tmStats.total_payment, tmStats.pending_reservation_count, promise_fulfillment_rate, consult_consent_rate, tmStats.new_customer_unit_price]);

  return (
    <div className="section-performance-container">
      <div className="section-header">
        <h3>2. 퍼널 구간별 실적</h3>
      </div>
      <div className="table-wrapper">
        {/* 테이블1 */}
        <table>
          <thead>
            <tr>
              {table1Lable.map((row) => {
                const isWrapped = row.label.includes("(");
                const [first, second] = row.label.split("(");
                return (
                  <th key={row.key} className={isWrapped ? "has-bracket" : ""}>
                    {isWrapped ? (
                      <>
                        {first}
                        <br className="print-only" />({second}
                      </>
                    ) : (
                      row.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr>
              {table1Value.map((row) => (
                <td key={row.key}>
                  {row.value}
                  {row.key === "ad_spend" && <span>vat 제외</span>}
                  {row.key === "roas" && <span>vat 제외, ROAS 조정 필요</span>}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        {/* 테이블2 */}
        <table>
          <thead>
            <tr>
              {table2Lable.map((row) => (
                <th key={row.key}>{row.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {table2Value.map((row) => (
                <td key={row.key}>{row.value}</td>
              ))}
            </tr>
          </tbody>
        </table>
        {/* 테이블3 */}
        <table>
          <thead>
            <tr>
              {table3Lable.map((row) => (
                <th key={row.key}>{row.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {table3Value.map((row) => (
                <td key={row.key}>
                  {row.value}{" "}
                  {row.key === "payment_rate_per_db" && (
                    <span>기대매출 : {formatNumber(expectedRevenue, "₩")}</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        {(loginUser?.role !== 5 && loginUser?.role !== 6) && togglePerformanceComparisonModal && (
          <button
            className="no-print"
            onClick={togglePerformanceComparisonModal}
          >
            실적 비교하기
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(SectionPerformance);
