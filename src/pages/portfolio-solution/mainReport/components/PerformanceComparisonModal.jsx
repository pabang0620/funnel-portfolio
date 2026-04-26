import React, { useState, useCallback, useMemo } from "react";
import { searchMainReport } from "@/data/portfolio-solution/mockService";

// Simplified date filter for the comparison modal (no axios dependency)
const SimpleDateSelector = ({ label, value, onChange }) => {
  return (
    <div>
      <h4>{label}</h4>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="date"
          value={value.startDate}
          onChange={(e) => onChange({ ...value, startDate: e.target.value })}
          style={{
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            padding: '8px',
            fontSize: '14px',
          }}
        />
        <span>~</span>
        <input
          type="date"
          value={value.endDate}
          onChange={(e) => onChange({ ...value, endDate: e.target.value })}
          style={{
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            padding: '8px',
            fontSize: '14px',
          }}
        />
      </div>
    </div>
  );
};

const PerformanceComparisonModal = ({
  formatNumber,
  selectedHospital,
  performanceComparisonModal,
  togglePerformanceComparisonModal,
  dateType,
  cohortList,
  selectedCohort,
  setSelectedCohort,
  mainMediaStr,
  subMediaStr,
}) => {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);

  const formatDateStr = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [baseDateRange, setBaseDateRange] = useState({
    startDate: formatDateStr(sevenDaysAgo),
    endDate: formatDateStr(today),
  });

  const [compareDateRange, setCompareDateRange] = useState({
    startDate: formatDateStr(sevenDaysAgo),
    endDate: formatDateStr(today),
  });

  // Demo: use mock data for both base and compare
  const baseData = useMemo(() => searchMainReport({
    hospital_name_id: selectedHospital,
    startDate: baseDateRange.startDate,
    endDate: baseDateRange.endDate,
    date_field: dateType === "receipt" ? 1 : 2,
    main_media: mainMediaStr,
    sub_media: subMediaStr,
  }), [selectedHospital, baseDateRange, dateType, mainMediaStr, subMediaStr]);

  // Simulate slightly different compare data (80% of base values)
  const compareData = useMemo(() => {
    const d = searchMainReport({
      hospital_name_id: selectedHospital,
      startDate: compareDateRange.startDate,
      endDate: compareDateRange.endDate,
      date_field: dateType === "receipt" ? 1 : 2,
      main_media: mainMediaStr,
      sub_media: subMediaStr,
    });
    return d;
  }, [selectedHospital, compareDateRange, dateType, mainMediaStr, subMediaStr]);

  const table1Lable = [
    { key: "total_ad_spend", label: "광고비 지출" },
    { key: "dbUnitPrice", label: "DB 단가" },
    { key: "customer_count", label: "DB 수량" },
    { key: "total_payment", label: "총 진료비 합계" },
    { key: "roas", label: "현재 ROAS" },
  ];

  const table2Lable = [
    { key: "reservation_count", label: "예약 건수" },
    { key: "first_reservation_rate", label: "예약률" },
    { key: "consultPaidCount", label: "방문 수" },
    { key: "promise_fulfillment_rate", label: "약속 이행률" },
    { key: "DBdangConsultRate", label: "DB당 내원율" },
  ];

  const table3Lable = [
    { key: "paid_count", label: "상담 동의 (결제자 기준)" },
    { key: "consult_consent_rate", label: "상담 동의율" },
    { key: "new_customer_unit_price", label: "신환 객단가 (결제자 기준)" },
    { key: "pending_reservation_count", label: "내원 예정 수" },
    { key: "payment_rate_per_db", label: "DB당 결제율" },
  ];

  const calcEfficiency = useCallback((base, compare) => {
    const b = Number(base);
    const c = Number(compare);

    if (isNaN(b) || isNaN(c) || c === 0) return "-";

    const diff = ((b - c) / c) * 100;
    return Math.round(diff * 100) / 100;
  }, []);

  // For demo, compare period data is slightly lower (85% of base)
  const getCompareValue = (value) => {
    if (typeof value !== 'number') return value;
    return Math.round(value * 0.85);
  };

  const table1Value = [
    {
      key: "total_ad_spend",
      base: formatNumber(baseData?.adSpendingStats?.total_ad_spend, "₩"),
      compare: formatNumber(getCompareValue(baseData?.adSpendingStats?.total_ad_spend), "₩"),
      efficiency: calcEfficiency(
        baseData?.adSpendingStats?.total_ad_spend,
        getCompareValue(baseData?.adSpendingStats?.total_ad_spend)
      ),
    },
    {
      key: "dbUnitPrice",
      base: formatNumber(baseData?.dbUnitPrice, "₩"),
      compare: formatNumber(getCompareValue(baseData?.dbUnitPrice), "₩"),
      efficiency: calcEfficiency(baseData?.dbUnitPrice, getCompareValue(baseData?.dbUnitPrice)),
    },
    {
      key: "customer_count",
      base: baseData?.tmStats?.customer_count,
      compare: getCompareValue(baseData?.tmStats?.customer_count),
      efficiency: calcEfficiency(
        baseData?.tmStats?.customer_count,
        getCompareValue(baseData?.tmStats?.customer_count)
      ),
    },
    {
      key: "total_payment",
      base: formatNumber(baseData?.tmStats?.total_payment, "₩"),
      compare: formatNumber(getCompareValue(baseData?.tmStats?.total_payment), "₩"),
      efficiency: calcEfficiency(
        baseData?.tmStats?.total_payment,
        getCompareValue(baseData?.tmStats?.total_payment)
      ),
    },
    {
      key: "roas",
      base: baseData?.adSpendingStats?.total_ad_spend > 0
        ? formatNumber((baseData?.tmStats?.total_payment / baseData?.adSpendingStats?.total_ad_spend) * 100, "%")
        : "-",
      compare: baseData?.adSpendingStats?.total_ad_spend > 0
        ? formatNumber(((getCompareValue(baseData?.tmStats?.total_payment)) / baseData?.adSpendingStats?.total_ad_spend) * 100, "%")
        : "-",
      efficiency: baseData?.adSpendingStats?.total_ad_spend > 0
        ? calcEfficiency(
            (baseData?.tmStats?.total_payment / baseData?.adSpendingStats?.total_ad_spend) * 100,
            ((getCompareValue(baseData?.tmStats?.total_payment)) / baseData?.adSpendingStats?.total_ad_spend) * 100
          )
        : "-",
    },
  ];

  const table2Value = [
    {
      key: "reservation_count",
      base: baseData?.tmStats?.reservation_count,
      compare: getCompareValue(baseData?.tmStats?.reservation_count),
      efficiency: calcEfficiency(baseData?.tmStats?.reservation_count, getCompareValue(baseData?.tmStats?.reservation_count)),
    },
    {
      key: "first_reservation_rate",
      base: formatNumber(baseData?.tmStats?.first_reservation_rate, "%"),
      compare: formatNumber(getCompareValue(baseData?.tmStats?.first_reservation_rate), "%"),
      efficiency: calcEfficiency(baseData?.tmStats?.first_reservation_rate, getCompareValue(baseData?.tmStats?.first_reservation_rate)),
    },
    {
      key: "consultPaidCount",
      base: baseData?.tmStats?.consultPaidCount,
      compare: getCompareValue(baseData?.tmStats?.consultPaidCount),
      efficiency: calcEfficiency(baseData?.tmStats?.consultPaidCount, getCompareValue(baseData?.tmStats?.consultPaidCount)),
    },
    {
      key: "promise_fulfillment_rate",
      base: formatNumber(baseData?.tmStats?.promise_fulfillment_rate, "%"),
      compare: formatNumber(getCompareValue(baseData?.tmStats?.promise_fulfillment_rate), "%"),
      efficiency: calcEfficiency(baseData?.tmStats?.promise_fulfillment_rate, getCompareValue(baseData?.tmStats?.promise_fulfillment_rate)),
    },
    {
      key: "DBdangConsultRate",
      base: formatNumber(baseData?.tmStats?.DBdangConsultRate, "%"),
      compare: formatNumber(getCompareValue(baseData?.tmStats?.DBdangConsultRate), "%"),
      efficiency: calcEfficiency(baseData?.tmStats?.DBdangConsultRate, getCompareValue(baseData?.tmStats?.DBdangConsultRate)),
    },
  ];

  const table3Value = [
    {
      key: "paid_count",
      base: baseData?.tmStats?.paid_count,
      compare: getCompareValue(baseData?.tmStats?.paid_count),
      efficiency: calcEfficiency(baseData?.tmStats?.paid_count, getCompareValue(baseData?.tmStats?.paid_count)),
    },
    {
      key: "consult_consent_rate",
      base: formatNumber(baseData?.tmStats?.consult_consent_rate, "%"),
      compare: formatNumber(getCompareValue(baseData?.tmStats?.consult_consent_rate), "%"),
      efficiency: calcEfficiency(baseData?.tmStats?.consult_consent_rate, getCompareValue(baseData?.tmStats?.consult_consent_rate)),
    },
    {
      key: "new_customer_unit_price",
      base: formatNumber(baseData?.tmStats?.new_customer_unit_price, "₩"),
      compare: formatNumber(getCompareValue(baseData?.tmStats?.new_customer_unit_price), "₩"),
      efficiency: calcEfficiency(baseData?.tmStats?.new_customer_unit_price, getCompareValue(baseData?.tmStats?.new_customer_unit_price)),
    },
    {
      key: "pending_reservation_count",
      base: baseData?.tmStats?.pending_reservation_count,
      compare: getCompareValue(baseData?.tmStats?.pending_reservation_count),
      efficiency: calcEfficiency(baseData?.tmStats?.pending_reservation_count, getCompareValue(baseData?.tmStats?.pending_reservation_count)),
    },
    {
      key: "payment_rate_per_db",
      base: formatNumber(
        (baseData?.tmStats?.paid_count / baseData?.tmStats?.customer_count) * 100,
        "%"
      ),
      compare: formatNumber(
        (getCompareValue(baseData?.tmStats?.paid_count) / baseData?.tmStats?.customer_count) * 100,
        "%"
      ),
      efficiency: calcEfficiency(
        (baseData?.tmStats?.paid_count / baseData?.tmStats?.customer_count) * 100,
        (getCompareValue(baseData?.tmStats?.paid_count) / baseData?.tmStats?.customer_count) * 100
      ),
    },
  ];

  const PerformanceTable = useCallback(({ labelList, valueList }) => (
    <table className="performance-table">
      <thead>
        <tr>
          <th>기간</th>
          {valueList.map((item) => (
            <th key={item.key}>
              {labelList.find((l) => l.key === item.key)?.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>비교기간</td>
          {valueList.map((item) => (
            <td key={item.key + "-compare"}>{item.compare}</td>
          ))}
        </tr>
        <tr>
          <td>조회기간</td>
          {valueList.map((item) => (
            <td key={item.key + "-base"}>{item.base}</td>
          ))}
        </tr>
        <tr>
          <td>증감률</td>
          {valueList.map((item) => (
            <td key={item.key + "-diff"}>
              <span
                className={`efficiency ${
                  item.efficiency > 0 ? "up" : item.efficiency < 0 ? "down" : ""
                }`}
              >
                {item.efficiency > 0 ? "▲" : item.efficiency < 0 ? "▼" : ""}
                {` `}
                {typeof item.efficiency === "number"
                  ? `${Math.abs(item.efficiency)}%`
                  : "-"}
              </span>
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  ), []);

  return (
    <div className="performanceComparisonModal">
      <div className="content">
        <button className="closeBtn" onClick={togglePerformanceComparisonModal}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <path d="M1 1L13 13M13 1L1 13" stroke="#919191" />
          </svg>
        </button>
        <div className="date-box-wrap">
          <div className="date-box">
            <SimpleDateSelector
              label="조회기간 선택"
              value={baseDateRange}
              onChange={setBaseDateRange}
            />
          </div>
          <div className="date-box">
            <SimpleDateSelector
              label="비교기간 선택"
              value={compareDateRange}
              onChange={setCompareDateRange}
            />
          </div>
        </div>

        <PerformanceTable labelList={table1Lable} valueList={table1Value} />
        <PerformanceTable labelList={table2Lable} valueList={table2Value} />
        <PerformanceTable labelList={table3Lable} valueList={table3Value} />
      </div>
    </div>
  );
};

export default PerformanceComparisonModal;
