import React, { useEffect, useState, useMemo } from "react";
import { getAllHospitalsData } from "@/data/med-manager/mockService";
import "./AllHospitalsTable.css";

const AllHospitalsTable = ({
  dateType,
  formatNumber,
  onHospitalClick,
  dateMode = "latest_cohort",
  customDateRange,
}) => {
  const [allHospitalsData, setAllHospitalsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [teamFilter, setTeamFilter] = useState("전체");

  useEffect(() => {
    const fetchAllHospitalsData = () => {
      if (dateMode === "custom_date" && (!customDateRange?.startDate || !customDateRange?.endDate)) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = getAllHospitalsData({
          date_field: dateType === "receipt" ? 1 : 2,
          startDate: customDateRange?.startDate,
          endDate: customDateRange?.endDate,
        });
        setAllHospitalsData(data);
      } catch (err) {
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllHospitalsData();
  }, [dateType, dateMode, customDateRange]);

  // 접수일 기준 컬럼
  const receiptColumns = [
    { key: "hospital_name", label: "병원명" },
    { key: "start_date", label: "시작일" },
    { key: "end_date", label: "종료일" },
    { key: "total_ad_spend", label: "광고비", format: "₩" },
    { key: "customer_count", label: "DB 수량" },
    { key: "dbUnitPrice", label: "DB단가", format: "₩" },
    { key: "first_reservation_rate", label: "예약률", format: "%" },
    { key: "promise_fulfillment_rate", label: "약속 이행률", format: "%" },
    { key: "consult_consent_rate", label: "상담 동의율", format: "%" },
    { key: "new_customer_unit_price", label: "신환 객단가", format: "₩" },
    { key: "consultPaidCount", label: "내원수" },
    { key: "total_payment", label: "총 진료비", format: "₩" },
    { key: "finalExpectedRevenue", label: "예상 매출", format: "₩" },
    { key: "endROAS", label: "마감 ROAS", format: "ROAS" },
  ];

  // 방문일 기준 컬럼
  const visitColumns = [
    { key: "hospital_name", label: "병원명" },
    { key: "start_date", label: "시작일" },
    { key: "end_date", label: "종료일" },
    { key: "promise_fulfillment_rate", label: "약속 이행률", format: "%" },
    { key: "consult_consent_rate", label: "상담 동의율", format: "%" },
    { key: "new_customer_unit_price", label: "신환 객단가", format: "₩" },
    { key: "consultPaidCount", label: "내원수" },
    { key: "total_payment", label: "총 진료비", format: "₩" },
    { key: "finalExpectedRevenue", label: "예상 매출", format: "₩" },
    { key: "endROAS", label: "마감 ROAS", format: "ROAS" },
  ];

  const columns = dateType === "receipt" ? receiptColumns : visitColumns;

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key !== key) {
        return { key, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      if (prev.direction === 'desc') {
        return { key: null, direction: null };
      }
      return { key, direction: 'asc' };
    });
  };

  // 팀 필터에 따라 데이터 필터링
  const filteredData = useMemo(() => {
    if (!allHospitalsData || allHospitalsData.length === 0) return [];

    if (teamFilter === "브랜드팀") {
      return allHospitalsData.filter((hospital) =>
        hospital.hospital_name?.endsWith("(브)")
      );
    } else if (teamFilter === "DB팀") {
      return allHospitalsData.filter((hospital) =>
        !hospital.hospital_name?.endsWith("(브)")
      );
    }

    return allHospitalsData;
  }, [allHospitalsData, teamFilter]);

  // 합계 행 계산
  const totalRow = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return null;

    const allFinalExpectedRevenueNull = filteredData.every(
      h => h.finalExpectedRevenue === null || h.finalExpectedRevenue === undefined
    );
    const allEndROASNull = filteredData.every(
      h => h.endROAS === null || h.endROAS === undefined
    );

    const sums = filteredData.reduce((acc, hospital) => {
      if (dateType === "receipt") {
        acc.total_ad_spend += hospital.total_ad_spend || 0;
        acc.customer_count += hospital.customer_count || 0;
        acc.reservation_count += hospital.reservation_count || 0;
      }
      acc.consultPaidCount += hospital.consultPaidCount || 0;
      acc.paid_count += hospital.paid_count || 0;
      acc.total_payment += hospital.total_payment || 0;

      if (hospital.finalExpectedRevenue !== null && hospital.finalExpectedRevenue !== undefined) {
        acc.finalExpectedRevenue += hospital.finalExpectedRevenue || 0;
      }
      acc.depositAmount += hospital.depositAmount || 0;

      return acc;
    }, {
      total_ad_spend: 0,
      customer_count: 0,
      reservation_count: 0,
      consultPaidCount: 0,
      paid_count: 0,
      total_payment: 0,
      finalExpectedRevenue: 0,
      depositAmount: 0,
    });

    const calculated = {
      hospital_name: "합계",
      start_date: "-",
      end_date: "-",
      dbUnitPrice: sums.customer_count > 0
        ? Math.round(sums.total_ad_spend / sums.customer_count)
        : 0,
      first_reservation_rate: sums.customer_count > 0
        ? Number(((sums.reservation_count / sums.customer_count) * 100).toFixed(2))
        : 0,
      promise_fulfillment_rate: (dateType === "receipt" && sums.reservation_count > 0)
        ? Number(((sums.consultPaidCount / sums.reservation_count) * 100).toFixed(2))
        : 0,
      consult_consent_rate: sums.consultPaidCount > 0
        ? Number(((sums.paid_count / sums.consultPaidCount) * 100).toFixed(2))
        : 0,
      new_customer_unit_price: sums.paid_count > 0
        ? Math.round(sums.total_payment / sums.paid_count)
        : 0,
      endROAS: allEndROASNull
        ? null
        : (sums.depositAmount > 0
          ? Number((sums.finalExpectedRevenue / sums.depositAmount).toFixed(2))
          : 0),
      total_ad_spend: sums.total_ad_spend,
      customer_count: sums.customer_count,
      consultPaidCount: sums.consultPaidCount,
      total_payment: sums.total_payment,
      finalExpectedRevenue: allFinalExpectedRevenueNull
        ? null
        : Math.round(sums.finalExpectedRevenue),
    };

    return calculated;
  }, [filteredData, dateType]);

  // 정렬된 데이터
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue);
      const bStr = String(bValue);
      return sortConfig.direction === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    return sorted;
  }, [filteredData, sortConfig]);

  const headerTitle = dateMode === "custom_date" && customDateRange?.startDate && customDateRange?.endDate
    ? "전체 병원 현황"
    : "전체 병원 최근 기수 현황";

  if (loading) {
    return (
      <div className="all-hospitals-table-container">
        <div className="section-header">
          <h3>{headerTitle}</h3>
        </div>
        <div className="loading-message">데이터를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="all-hospitals-table-container">
        <div className="section-header">
          <h3>{headerTitle}</h3>
        </div>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!allHospitalsData || allHospitalsData.length === 0) {
    return (
      <div className="all-hospitals-table-container">
        <div className="section-header">
          <h3>{headerTitle}</h3>
        </div>
        <div className="no-data-message">표시할 데이터가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="all-hospitals-table-container">
      <div className="section-header">
        <h3>{headerTitle}</h3>
        <div className="right-controls">
          <div className="team-filter-container">
            <label>
              <input
                type="radio"
                name="teamFilter"
                value="전체"
                checked={teamFilter === "전체"}
                onChange={(e) => setTeamFilter(e.target.value)}
              />
              전체
            </label>
            <label>
              <input
                type="radio"
                name="teamFilter"
                value="DB팀"
                checked={teamFilter === "DB팀"}
                onChange={(e) => setTeamFilter(e.target.value)}
              />
              DB팀
            </label>
            <label>
              <input
                type="radio"
                name="teamFilter"
                value="브랜드팀"
                checked={teamFilter === "브랜드팀"}
                onChange={(e) => setTeamFilter(e.target.value)}
              />
              브랜드팀
            </label>
          </div>
          <span className="date-type-badge">
            {dateType === "receipt" ? "접수일 기준" : "방문일 기준"}
          </span>
        </div>
      </div>

      <div
        className={`table-wrapper all-hospitals-wrapper ${dateType === "payment" ? "visit-mode" : "receipt-mode"}`}
      >
        <div className="table-scroll-container all-hospitals-scroll">
          <table
            className={`all-hospitals-main-table ${dateType === "payment" ? "visit-mode" : "receipt-mode"}`}
          >
            <thead className="all-hospitals-thead">
              <tr className="all-hospitals-tr">
                {columns.map((col) => (
                  <th key={col.key} className="all-hospitals-th">
                    <div className="sortable-header">
                      <span>{col.label}</span>
                      <div className="sort-arrows">
                        <span
                          className={`sort-arrow ${
                            sortConfig.key === col.key && sortConfig.direction === 'asc' ? 'active' : ''
                          }`}
                          onClick={() => handleSort(col.key)}
                        >
                          ▲
                        </span>
                        <span
                          className={`sort-arrow ${
                            sortConfig.key === col.key && sortConfig.direction === 'desc' ? 'active' : ''
                          }`}
                          onClick={() => handleSort(col.key)}
                        >
                          ▼
                        </span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="all-hospitals-tbody">
              {sortedData.map((hospital) => (
                <tr key={`${hospital.hospital_name_id}-${hospital.cohort}`} className="all-hospitals-tr">
                  {columns.map((col) => {
                    if (col.key === "hospital_name") {
                      return (
                        <td
                          key={col.key}
                          className="all-hospitals-td hospital-name-cell"
                          onClick={() => {
                            if (onHospitalClick) {
                              onHospitalClick(hospital.hospital_name_id, hospital.hospital_name);
                            }
                          }}
                        >
                          {hospital.hospital_name ?? "-"}
                        </td>
                      );
                    }

                    if (col.format) {
                      return (
                        <td key={col.key} className="all-hospitals-td">
                          {hospital[col.key] === null || hospital[col.key] === undefined
                            ? "-"
                            : formatNumber(hospital[col.key], col.format)}
                        </td>
                      );
                    }

                    return (
                      <td key={col.key} className="all-hospitals-td">
                        {hospital[col.key] ?? "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* 합계 행 */}
              {totalRow && (
                <tr className="all-hospitals-tr total-row">
                  {columns.map((col) => {
                    if (col.key === "hospital_name") {
                      return (
                        <td key={col.key} className="all-hospitals-td total-cell">
                          {totalRow.hospital_name}
                        </td>
                      );
                    }

                    if (col.format) {
                      return (
                        <td key={col.key} className="all-hospitals-td total-cell">
                          {totalRow[col.key] === null || totalRow[col.key] === undefined
                            ? "-"
                            : formatNumber(totalRow[col.key], col.format)}
                        </td>
                      );
                    }

                    return (
                      <td key={col.key} className="all-hospitals-td total-cell">
                        {totalRow[col.key] ?? "-"}
                      </td>
                    );
                  })}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllHospitalsTable;
