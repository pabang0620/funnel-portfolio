import React, { useEffect, useState, useCallback, useMemo } from "react";

// 매체별 실적
const MediaPerformance = ({
  selectedHospital,
  mediaOptions = [],
  main_media = [],
  sub_media = [],
  mediaStats = [],
  dbAdBudget,
  displayAdBudget,
  daysInCohort,
  previousDate,
  dateType,
  dateSelectionMode,
  formatNumber: formatNumberProp,
}) => {

  const formatNumber = useCallback((num, decimalPlaces = 0) => {
    if (num === "-" || num === undefined || num === null || isNaN(num))
      return "-";
    return Number(num).toLocaleString("ko-KR", {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });
  }, []);

  const totalMainRow = useMemo(() => mediaStats.find((stat) => stat.id === -1) || null, [mediaStats]);
  const totalSubRow = useMemo(() => mediaStats.find((stat) => stat.id === -2) || null, [mediaStats]);

  // 방문일 기준 여부
  const isVisitMode = dateType === "payment";

  const fixedRows1 = useMemo(() => {
    if (isVisitMode) {
      return [
        { label: "DB 광고 예산", key: "dbAdBudget", tooltip: "해당 기수의 DB 광고 예산" },
        { label: "예약 수", key: "customer_count", tooltip: "선택한 기간 내 예약일(방문 예정일)이 있는 고유 고객 수" },
        { label: "방문수", key: "visit_count", tooltip: "방문 상태가 '상담' 또는 '결제'인 수" },
        { label: "상담동의(결제자 기준)", key: "paid_customer_count", tooltip: "방문 상태가 '결제'인 수" },
        { label: "총진료비 합계", key: "total_payment_sum", tooltip: "총 진료비 합계" },
        { label: "약속 이행률", key: "fulfillment_rate", tooltip: "(상담 수 + 결제 수) / 예약일이 오늘 이전인 예약 수 × 100%" },
        { label: "노쇼 or 예약 취소 비율", key: "noShowRate", tooltip: "노쇼 및 취소 수 / (예약 수 + 재예약 수) × 100%" },
        { label: "상담동의율", key: "consultation_agreement_rate", tooltip: "결제 수 / (상담 수 + 결제 수) × 100%" },
      ];
    }
    return [
      { label: "DB 광고 예산", key: "dbAdBudget", tooltip: "해당 기수의 DB 광고 예산" },
      { label: "DB 소진 광고비", key: "total_ad_spend", tooltip: "선택한 기간 동안 소진한 광고비" },
      { label: "DB 수량", key: "customer_count", tooltip: "선택한 기간 동안 유입된 고객 수" },
      { label: "DB 단가", key: "dbUnitPrice", tooltip: "광고비 / 고객 수" },
      { label: "총 결제 예정 금액 ROAS", key: "roas", tooltip: "총 결제 금액 / 광고비 × 100%" },
      { label: "방문수", key: "visit_count", tooltip: "방문 상태가 '상담' 또는 '결제'인 수" },
      { label: "상담동의(결제자 기준)", key: "paid_customer_count", tooltip: "방문 상태가 '결제'인 수" },
      { label: "총진료비 합계", key: "total_payment_sum", tooltip: "총 진료비 합계" },
      { label: "예약률", key: "reservation_rate", tooltip: "(예약 수 + 재예약 수) / DB 수량 × 100%" },
      { label: "약속 이행률", key: "fulfillment_rate", tooltip: "(상담 수 + 결제 수) / 예약일이 오늘 이전인 예약 수 × 100%" },
      { label: "노쇼 or 예약 취소 비율", key: "noShowRate", tooltip: "노쇼 및 취소 수 / (예약 수 + 재예약 수) × 100%" },
      { label: "상담동의율", key: "consultation_agreement_rate", tooltip: "결제 수 / (상담 수 + 결제 수) × 100%" },
      { label: "일평균 광고비", key: "daily_budget", tooltip: "광고비 / 누적 일수" },
      { label: "해당 기수 예상 지출", key: "estimated_spending", tooltip: "일평균 광고비 × 기수 전체 일수" },
      { label: "무효디비 수", key: "invalid_db_count", tooltip: "선택한 기간의 콜내역이 무효디비인 수" },
      { label: "무효디비 비율", key: "invalid_db_rate", tooltip: "무효디비 수 / DB 수량 × 100%" },
    ];
  }, [isVisitMode]);

  const fixedRows2 = useMemo(() => {
    if (isVisitMode) {
      return [
        { label: "노출 광고 예산", key: "displayAdBudget", tooltip: "해당 기수의 노출 광고 예산" },
        { label: "예약 수", key: "customer_count", tooltip: "선택한 기간 내 예약일(방문 예정일)이 있는 고유 고객 수" },
        { label: "약속 이행률", key: "fulfillment_rate", tooltip: "(상담 수 + 결제 수) / 예약일이 오늘 이전인 예약 수 × 100%" },
        { label: "노쇼 or 예약 취소 비율", key: "noShowRate", tooltip: "노쇼 및 취소 수 / (예약 수 + 재예약 수) × 100%" },
      ];
    }

    return [
      { label: "노출 광고 예산", key: "displayAdBudget", tooltip: "해당 기수의 노출 광고 예산" },
      { label: "DB 소진 광고비", key: "total_ad_spend", tooltip: "선택한 기간 동안 소진한 광고비" },
      { label: "DB 수량", key: "customer_count", tooltip: "선택한 기간 동안 유입된 고객 수" },
      { label: "DB 단가", key: "dbUnitPrice", tooltip: "광고비 / 고객 수" },
      { label: "총 결제 예정 금액 ROAS", key: "roas", tooltip: "총 결제 금액 / 광고비 × 100%" },
    ];
  }, [isVisitMode]);

  const [grouped1, setGrouped1] = useState([]);
  const [grouped2, setGrouped2] = useState([]);

  const groupChannels = useCallback((channelIds) => {
    if (!Array.isArray(channelIds) || !mediaOptions.length) return [];

    const names = channelIds
      .map((id) => {
        const media = mediaOptions.find((c) => c.id === id);
        return media ? media.name : null;
      })
      .filter(Boolean);

    const groups = [];
    const chunkSize = 5;
    if (names.length + 1 > chunkSize) {
      groups.push(names.slice(0, chunkSize));
      const remaining = names.slice(chunkSize);
      groups.push([...remaining, "total"]);
    } else {
      groups.push([...names, "total"]);
    }
    return groups;
  }, [mediaOptions]);

  useEffect(() => {
    if (selectedHospital) {
      setGrouped1(groupChannels(main_media));
      setGrouped2(groupChannels(sub_media));
    } else {
      setGrouped1([]);
      setGrouped2([]);
    }
  }, [selectedHospital, main_media, sub_media, mediaOptions]);

  const getStatValue = useCallback((key, mediaName, type) => {
    const getUnit = (key) => {
      if (
        key === "dbAdBudget" ||
        key === "displayAdBudget" ||
        key === "total_ad_spend" ||
        key === "dbUnitPrice" ||
        key === "daily_budget" ||
        key === "estimated_spending" ||
        key === "total_payment_sum"
      )
        return "₩";

      if (
        key === "roas" ||
        key === "reservation_rate" ||
        key === "fulfillment_rate" ||
        key === "noShowRate" ||
        key === "consultation_agreement_rate" ||
        key === "invalid_db_rate"
      )
        return "%";

      return "";
    };

    const unit = getUnit(key);

    const format = (value, unit) => {
      if (
        value === "-" ||
        value === undefined ||
        value === null ||
        isNaN(value)
      )
        return "-";
      if (unit === "₩") return `₩${formatNumber(Math.round(value))}`;
      if (unit === "%") return `${formatNumber(Math.round(value))}%`;
      return formatNumber(value);
    };

    let stat;
    if (mediaName === "total") {
      stat = type === "main" ? totalMainRow : totalSubRow;
    } else {
      stat = mediaStats.find(
        (item) => item.name === mediaName && item.type === type
      );
    }

    if (!stat) return "-";

    if (key === "dbAdBudget") {
      return mediaName === "total" ? format(dbAdBudget, unit) : "-";
    }

    if (key === "displayAdBudget") {
      return mediaName === "total" ? format(displayAdBudget, unit) : "-";
    }

    if (key === "daily_budget") {
      const spend = stat.total_ad_spend;
      return previousDate > 0 ? format(spend / previousDate, unit) : "-";
    }

    if (key === "estimated_spending") {
      const spend = stat.total_ad_spend;
      const daily = previousDate > 0 ? spend / previousDate : 0;
      const estimated = daily * previousDate;
      return format(estimated, unit);
    }

    const value = stat[key];
    return format(value, unit);
  }, [formatNumber, totalMainRow, totalSubRow, mediaStats, dbAdBudget, displayAdBudget, previousDate]);

  return (
    <div className="media-performance-container">
      <div className="section-header">
        <h3>3. 매체별 실적</h3>
      </div>
      <div className="table-wrapper">
        <h4>3-1. DB 광고 실적</h4>

        {grouped1.length === 0 ? (
          <p style={{ color: "#979797", fontSize: "14px" }}>매체를 선택하세요</p>
        ) : (
          grouped1.map((group, idx) => (
            <table key={idx}>
              <thead>
                <tr>
                  <th>분류</th>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <th key={i} className={group[i] === "total" ? "total" : ""}>
                      {group[i]
                        ? group[i] === "total"
                          ? "TOTAL"
                          : group[i]
                        : "-"}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fixedRows1.map((rowLabel, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={
                      !isVisitMode
                        ? [
                            (rowLabel.label === "DB 수량" ||
                              rowLabel.label === "DB 단가" ||
                              rowLabel.label === "총 결제 예정 금액 ROAS") &&
                              "highlight",
                            rowLabel.label === "DB 수량" && "first-highlight",
                            rowLabel.label === "총 결제 예정 금액 ROAS" &&
                              "last-highlight",
                          ]
                            .filter(Boolean)
                            .join(" ")
                        : ""
                    }
                  >
                    <td title={rowLabel.tooltip || ""}>{rowLabel.label}</td>
                    {Array.from({ length: 5 }).map((_, i) => {
                      const mediaName = group[i];
                      const isTotal = mediaName === "total";

                      return (
                        <td key={i} className={isTotal ? "total" : ""}>
                          {mediaName
                            ? getStatValue(rowLabel.key, mediaName, "main")
                            : "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ))
        )}

        <h4>3-2. 노출 외 기타 광고</h4>

        {grouped2.length === 0 ? (
          <p style={{ color: "#979797", fontSize: "14px" }}>매체를 선택하세요</p>
        ) : (
          grouped2.map((group, idx) => (
            <table key={idx}>
              <thead>
                <tr>
                  <th>분류</th>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <th key={i} className={group[i] === "total" ? "total" : ""}>
                      {group[i]
                        ? group[i] === "total"
                          ? "TOTAL"
                          : group[i]
                        : "-"}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fixedRows2.map((rowLabel, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={
                      !isVisitMode
                        ? [
                            (rowLabel.label === "DB 수량" ||
                              rowLabel.label === "DB 단가" ||
                              rowLabel.label === "총 결제 예정 금액 ROAS") &&
                              "highlight",
                            rowLabel.label === "DB 수량" && "first-highlight",
                            rowLabel.label === "총 결제 예정 금액 ROAS" &&
                              "last-highlight",
                          ]
                            .filter(Boolean)
                            .join(" ")
                        : ""
                    }
                  >
                    <td title={rowLabel.tooltip || ""}>{rowLabel.label}</td>
                    {Array.from({ length: 5 }).map((_, i) => {
                      const mediaName = group[i];
                      const isTotal = mediaName === "total";

                      return (
                        <td key={i} className={isTotal ? "total" : ""}>
                          {mediaName
                            ? getStatValue(rowLabel.key, mediaName, "sub")
                            : "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ))
        )}
      </div>
    </div>
  );
};

export default React.memo(MediaPerformance);
