import React, { useEffect, useState, useCallback } from "react";
import HospitalFilter from "./HospitalFilter";
import CalendarDateFilter from "./CalendarDateFilter";
import MediaFilter from "./MediaFilter";

function FilterComponent({
  loginUser,

  // 기수 관련
  cohortList,
  setCohortList,
  selectedCohort,
  setSelectedCohort,

  // 날짜||기수 선택 모드
  dateSelectionMode,
  setDateSelectionMode,

  // 날짜 기준(라디오타입)
  dateType,
  setDateType,

  // 병원 관련
  selectedHospital,
  setSelectedHospital,
  setName,

  // 날짜 관련
  customDateRange,
  setCustomDateRange,

  // 병원 전체 선택 시 날짜 모드
  allHospitalsDateMode,
  setAllHospitalsDateMode,

  // 매체 관련
  mediaOptions = [],
  main_media,
  setMain_media,
  sub_media,
  setSub_media,
}) {
  const [mediaInput, setMediaInput] = useState("");

  const handleDateTypeChange = useCallback((e) => {
    setDateType(e.target.value);
  }, [setDateType]);

  return (
    <div className="filter-container">
      {/* 날짜타입(라디오) */}
      <div className="date-type-selector">
        <label title="DB 유입된 기준">
          <input
            type="radio"
            name="dateType"
            value="receipt"
            checked={dateType === "receipt"}
            onChange={handleDateTypeChange}
          />
          접수일 기준
        </label>
        <label title="TM의 방문상태가 결제+상담 기준">
          <input
            type="radio"
            name="dateType"
            value="payment"
            checked={dateType === "payment"}
            onChange={handleDateTypeChange}
          />
          방문일 기준
        </label>
      </div>

      {/* 병원 필터 */}
      <HospitalFilter
        loginUser={loginUser}
        selectedHospital={selectedHospital}
        setSelectedHospital={setSelectedHospital}
        cohortList={cohortList}
        setCohortList={setCohortList}
        setName={setName}
        setCustomDateRange={setCustomDateRange}
        setSelectedCohort={setSelectedCohort}
        setDateSelectionMode={setDateSelectionMode}
        main_media={main_media}
        setMain_media={setMain_media}
        sub_media={sub_media}
        setSub_media={setSub_media}
      />

      {/* 날짜 필터 */}
      <CalendarDateFilter
        loginUser={loginUser}
        cohortList={cohortList}
        dateType={dateType}
        selectedCohort={selectedCohort}
        setSelectedCohort={setSelectedCohort}
        dateSelectionMode={dateSelectionMode}
        setDateSelectionMode={setDateSelectionMode}
        customDateRange={customDateRange}
        setCustomDateRange={setCustomDateRange}
        selectedHospital={selectedHospital}
        allHospitalsDateMode={allHospitalsDateMode}
        setAllHospitalsDateMode={setAllHospitalsDateMode}
      />

      {/* 매체 필터 1 */}
      {loginUser?.role !== 5 && loginUser?.role !== 6 && (
        <MediaFilter
          checkedMedias={main_media}
          setCheckedMedias={setMain_media}
          otherCheckedMedias={sub_media}
          mediaOptions={mediaOptions}
          mediaInput={mediaInput}
          setMediaInput={setMediaInput}
          filterType="main"
        />
      )}

      {/* 매체 필터 2 */}
      {loginUser?.role !== 5 && loginUser?.role !== 6 && (
        <MediaFilter
          checkedMedias={sub_media}
          setCheckedMedias={setSub_media}
          otherCheckedMedias={main_media}
          mediaOptions={mediaOptions}
          mediaInput={mediaInput}
          setMediaInput={setMediaInput}
          filterType="sub"
        />
      )}
    </div>
  );
}

export default FilterComponent;
