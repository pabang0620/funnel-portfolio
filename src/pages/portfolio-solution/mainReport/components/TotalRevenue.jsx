import React, { useMemo } from "react";

import "../mainReport.css";

const TotalRevenue = ({
  selectedCohort,
  tmStats,
  customDateRange,
  total_payment, // 현재 총 매출
  prev_cohort_payment, // 이전 기수 매출
  two_prev_cohort_payment, // 전전 기수 매출
  finalExpectedRevenue, // 이번기수 예상 매출
  goal,
  endROAS, // 마감 ROAS
  formatNumber,
  dbAdBudget, // DB 광고 예산
  displayAdBudget, // 노출 광고 예산
  depositAmount, // 병원 입금액
  consultPaidCount, // 현재 내원자 수 (상담+결제)
  total_ad_spend, // 광고비 지출
  dbUnitPrice, // DB 단가 (접수일 기준)
  first_reservation_rate, // 예약률 (화면 표시용)
  first_reservation_rate_for_budget, // 예약률 (예산 계산용 - 접수일 기준)
  promise_fulfillment_rate, // 약속 이행률
  pending_reservation_count, // 내원 예정 수
  dateType, // 날짜 기준 (receipt: 접수일, payment: 방문일)
}) => {

  // 그래프용 라벨 (마감 ROAS 제외)
  const graphLabels = useMemo(() => [
    {
      key: "two_prev_cohort_payment",
      label:
        two_prev_cohort_payment.cohort &&
        `${two_prev_cohort_payment.cohort}기수`,
    },
    {
      key: "prev_cohort_payment",
      label: prev_cohort_payment.cohort && `${prev_cohort_payment.cohort}기수`,
    },
    { key: "total_payment", label: `${selectedCohort}기수 (진행중)` },
    { key: "finalExpectedRevenue", label: `${selectedCohort}기수 예상 매출` },
  ], [two_prev_cohort_payment.cohort, prev_cohort_payment.cohort, selectedCohort]);

  // 표2용 라벨 (마감 ROAS 포함)
  const table2Labels = useMemo(() => [
    {
      key: "two_prev_cohort_payment",
      label:
        two_prev_cohort_payment.cohort &&
        `${two_prev_cohort_payment.cohort}기수`,
    },
    {
      key: "prev_cohort_payment",
      label: prev_cohort_payment.cohort && `${prev_cohort_payment.cohort}기수`,
    },
    { key: "total_payment", label: `${selectedCohort}기수 (진행중)` },
    { key: "finalExpectedRevenue", label: `${selectedCohort}기수 예상 매출` },
    { key: "endROAS", label: "마감 ROAS" },
  ], [two_prev_cohort_payment.cohort, prev_cohort_payment.cohort, selectedCohort]);

  // 표1 항목 라벨
  const table1Labels = useMemo(() => [
    { key: "budgetAllocation", label: "편성 예산" },
    { key: "marginRate", label: "마진율" },
    { key: "targetVisitors", label: "목표 내원자 수" },
    { key: "currentVisitors", label: "현재 내원자 수" },
    { key: "achievementRate", label: "목표 달성률" },
  ], []);

  // 그래프용 매출 데이터
  const graphValue = useMemo(() => [
    {
      name: "two_prev_cohort_payment",
      sales: Math.round(two_prev_cohort_payment.sum) || 0,
    },
    {
      name: "prev_cohort_payment",
      sales: Math.round(prev_cohort_payment.sum) || 0,
    },
    {
      name: "total_payment",
      sales: Math.round(total_payment) || 0,
    },
    {
      name: "finalExpectedRevenue",
      sales: Math.round(finalExpectedRevenue) || 0,
    },
  ], [two_prev_cohort_payment.sum, prev_cohort_payment.sum, total_payment, finalExpectedRevenue]);

  // 표2용 매출 데이터 (마감 ROAS 포함)
  const table2Value = useMemo(() => [
    {
      name: "two_prev_cohort_payment",
      sales: Math.round(two_prev_cohort_payment.sum) || 0,
    },
    {
      name: "prev_cohort_payment",
      sales: Math.round(prev_cohort_payment.sum) || 0,
    },
    {
      name: "total_payment",
      sales: Math.round(total_payment) || 0,
    },
    {
      name: "finalExpectedRevenue",
      sales: Math.round(finalExpectedRevenue) || 0,
    },
    {
      name: "endROAS",
      sales: endROAS || 0,
    },
  ], [two_prev_cohort_payment.sum, prev_cohort_payment.sum, total_payment, finalExpectedRevenue, endROAS]);

  // 편성 예산 = DB 광고 예산 + 노출 광고 예산
  const budgetAllocation = (dbAdBudget || 0) + (displayAdBudget || 0);

  // 마진율 = (입금액 - 편성예산) / 입금액 * 100
  const marginRate = depositAmount > 0
    ? ((depositAmount - budgetAllocation) / depositAmount) * 100
    : 0;

  // 목표 내원자 수 = 입금액 / 1000만 * 25
  const targetVisitors = (depositAmount || 0) / 10000000 * 25;

  // 현재 내원자 수 = consultPaidCount (상담+결제)
  const currentVisitors = consultPaidCount || 0;

  // 목표 달성률 = 현재 내원자 수 / 목표 내원자 수 * 100
  const achievementRate = targetVisitors > 0
    ? (currentVisitors / targetVisitors) * 100
    : 0;

  const table1Value = [
    { key: "budgetAllocation", value: formatNumber(budgetAllocation, "₩") },
    { key: "marginRate", value: `${marginRate.toFixed(1)}%` },
    { key: "targetVisitors", value: `${Math.round(targetVisitors)}명` },
    { key: "currentVisitors", value: `${currentVisitors}명` },
    { key: "achievementRate", value: `${achievementRate.toFixed(1)}%` },
  ];

  // 예상 테이블 계산 로직
  const remainingBudget = budgetAllocation - (total_ad_spend || 0);
  const additionalDbCount = dbUnitPrice > 0 ? remainingBudget / dbUnitPrice : 0;
  const reservationRateForCalc = first_reservation_rate_for_budget || first_reservation_rate || 0;

  const additionalVisitors =
    ((pending_reservation_count || 0) * ((promise_fulfillment_rate || 0) / 100)) +
    (additionalDbCount * (reservationRateForCalc / 100) * ((promise_fulfillment_rate || 0) / 100));

  const finalVisitors = currentVisitors + additionalVisitors;
  const finalAchievementRate = targetVisitors > 0 ? (Math.round(finalVisitors) / targetVisitors) * 100 : 0;

  const tableExpectedLabels = useMemo(() => [
    {
      key: "remainingBudget",
      label: "남은 예산",
      tooltip: "편성 예산 - 광고비 지출"
    },
    {
      key: "additionalDbCount",
      label: dateType === "payment" ? "추가 DB 수량*" : "추가 DB 수량",
      tooltip: "남은 예산 / DB 단가"
    },
    {
      key: "additionalVisitors",
      label: dateType === "payment" ? "예상 내원 수(기존 대기자 포함)*" : "예상 내원 수(기존 대기자 포함)",
      tooltip: "(내원 예정 수 × 약속 이행률) + (추가 DB 수량 × 예약률 × 약속 이행률)"
    },
    {
      key: "finalVisitors",
      label: "최종 내원자 수",
      tooltip: "현재 내원자 수 + 예상 내원 수(기존 대기자 포함)"
    },
    {
      key: "finalAchievementRate",
      label: "최종 목표 달성률",
      tooltip: "(최종 내원자 수 / 목표 내원자 수) × 100%"
    },
  ], [dateType]);

  const tableExpectedValue = [
    { key: "remainingBudget", value: formatNumber(remainingBudget, "₩") },
    { key: "additionalDbCount", value: `${Math.round(additionalDbCount)}개` },
    { key: "additionalVisitors", value: `${Math.round(additionalVisitors)}명` },
    { key: "finalVisitors", value: `${Math.round(finalVisitors)}명` },
    { key: "finalAchievementRate", value: `${finalAchievementRate.toFixed(1)}%` },
  ];

  // 최대값 계산 및 Y축 눈금 구성
  const { maxSales, ticks } = useMemo(() => {
    const maxSales = Math.max(...graphValue.map((item) => item.sales));
    const ticks = [0, maxSales / 3, (maxSales / 3) * 2, maxSales];
    return { maxSales, ticks };
  }, [graphValue]);

  return (
    <div className="total-revenue-container">
      <div className="section-header">
        <h3>1. {selectedCohort}기수 총 매출 실적</h3>
        <h3 className="goal">
          기수 목표 매출 :{" "}
          <span>
            <b style={{ fontWeight: 400 }}>₩</b> {(goal || 0).toLocaleString()}
          </span>
        </h3>
      </div>

      <div className="graph-wrapper">
        <h4>기수별 신환 매출 및 이번달 예상 매출</h4>
        <div className="graph-container">
          <div className="y-axis-labels">
            {[...ticks].reverse().map((tick, idx) => (
              <div key={idx} className="y-label">
                ₩ {Math.round(tick).toLocaleString()}
              </div>
            ))}
          </div>
          <div className="bar-container">
            {graphLabels.map(({ key, label }, index) => {
              const salesItem = graphValue.find(
                (item) => item.name === key
              );
              const sales = salesItem ? salesItem.sales : 0;
              const heightPercent =
                maxSales > 0 ? Math.min((sales / maxSales) * 100, 100) : 0;

              return (
                <div
                  key={key}
                  className={`bar-group ${sales > (goal || 0) && "overHeight"} ${
                    sales <= ticks[1] * 0.4 && "rowHeight"
                  } `}
                  style={{ height: `${heightPercent}%` }}
                >
                  <div className="bar" />
                  <span className="value">₩ {sales.toLocaleString()}</span>
                  <span className="label">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <h4>현재</h4>
        <table>
          <thead>
            <tr>
              {table1Labels.map((row) => {
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
                <td key={row.key}>{row.value}</td>
              ))}
            </tr>
          </tbody>
        </table>

        <h4>예상</h4>
        <table>
          <thead>
            <tr>
              {tableExpectedLabels.map((row) => {
                const isWrapped = row.label.includes("(");
                const [first, second] = row.label.split("(");
                return (
                  <th
                    key={row.key}
                    className={isWrapped ? "has-bracket" : ""}
                    title={row.tooltip}
                    style={{ cursor: 'help' }}
                  >
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
              {tableExpectedValue.map((row) => (
                <td key={row.key}>
                  {row.value}
                  {row.key === "finalAchievementRate" && dateType === "payment" && (
                    <span>* DB 단가 및 예약률은 접수일 기준</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        <h4>매출</h4>
        <table>
          <thead>
            <tr>
              {table2Labels.map((row) => (
                <th key={row.key}>{row.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {table2Value.map((row) => (
                <td
                  style={
                    row.name === "finalExpectedRevenue" ||
                    row.name === "endROAS"
                      ? { color: "#FF0000" }
                      : {}
                  }
                  key={row.name}
                >
                  {row.name === "endROAS"
                    ? `${Math.round(row.sales * 100).toLocaleString()}%`
                    : `₩ ${row.sales.toLocaleString()}`}
                  {row.name === "finalExpectedRevenue" && (
                    <span>확정매출+대기매출+추가발생매출</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(TotalRevenue);
