import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint, faFilePdf } from "@fortawesome/free-solid-svg-icons";

import TotalRevenue from "./components/TotalRevenue";
import SectionPerformance from "./components/SectionPerformance";
import FilterComponent from "./components/FilterComponent";
import MediaPerformance from "./components/MediaPerformance";
import EventMetricSummary from "./components/EventMetricSummary";
import PerformanceComparisonModal from "./components/PerformanceComparisonModal";
import AllHospitalsTable from "./components/AllHospitalsTable";
import TitleBox from "../shared/TitleBox";
import AlertModal from "../shared/AlertModal";

import {
  getAdvertisingCompanies,
  searchMainReport,
} from "@/data/portfolio-solution/mockService";

import "./mainReport.css";

// Demo: always logged in as admin
const DEMO_LOGIN_USER = { role: 1, name: '관리자' };

const MainReport = () => {
  const loginUser = DEMO_LOGIN_USER;

  const [data, setData] = useState(null);
  const [hospital_name_id, setHospital_name_id] = useState("전체");
  const [name, setName] = useState("전체");
  const [dateType, setDateType] = useState("receipt");

  const [daysInCohort, setDaysInCohort] = useState(0);
  const [previousDate, setPreviousDate] = useState(0);

  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  // 기수 리스트
  const [cohortList, setCohortList] = useState([]);

  // 'cohort'는 기수 선택, 'recent'는 최근 날짜 선택, 'manual'은 수동 날짜
  const [dateSelectionMode, setDateSelectionMode] = useState("cohort");

  // 기수 선택
  const [selectedCohort, setSelectedCohort] = useState(null);

  // 병원 전체 선택 시 날짜 모드
  const [allHospitalsDateMode, setAllHospitalsDateMode] = useState("latest_cohort");

  // 매체
  const [mediaOptions, setMediaOptions] = useState([]);
  const [main_media, setMain_media] = useState([]);
  const [sub_media, setSub_media] = useState([]);

  // 광고사 리스트 초기 로드
  useEffect(() => {
    const companies = getAdvertisingCompanies();
    setMediaOptions(companies || []);
  }, []);

  // mediaStats에서 매체 목록 초기 설정
  useEffect(() => {
    if (data?.mediaStats?.length > 0) {
      const mainList = data.mediaStats
        .filter((m) => m.type === "main" && m.id > 0)
        .map((m) => m.id);
      setMain_media(mainList);
      const subList = data.mediaStats
        .filter((m) => m.type === "sub" && m.id > 0)
        .map((m) => m.id);
      setSub_media(subList);
    }
  }, [data]);

  // daysInCohort, previousDate 계산
  useEffect(() => {
    if (!customDateRange.startDate || !customDateRange.endDate) return;

    const calculateDays = (start, end) => {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffTime = Math.abs(endDate - startDate);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    const days = calculateDays(customDateRange.startDate, customDateRange.endDate);
    setDaysInCohort(days);

    const today = new Date();
    const start = new Date(customDateRange.startDate);
    const passedDays = Math.max(
      0,
      Math.min(days, Math.ceil((today - start) / (1000 * 60 * 60 * 24)) + 1)
    );
    setPreviousDate(passedDays);
  }, [customDateRange]);

  // 데이터 전송
  const [loading, setLoading] = useState(false);
  const isFirstRender = useRef(true);

  const mainMediaStr = useMemo(() => main_media.join(","), [main_media]);
  const subMediaStr = useMemo(() => sub_media.join(","), [sub_media]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // 병원 전체 선택 시에는 AllHospitalsTable에서 자체적으로 데이터를 가져옴
    if (hospital_name_id === "전체") {
      setData(null);
      return;
    }

    const allSelected =
      hospital_name_id && customDateRange.startDate && customDateRange.endDate;

    if (!allSelected) {
      setData(null);
      return;
    }

    // 데이터 조회 (mock)
    setLoading(true);

    const formData = {
      hospital_name_id: hospital_name_id,
      startDate: customDateRange.startDate,
      endDate: customDateRange.endDate,
      date_field: dateType === "receipt" ? 1 : 2,
      main_media: mainMediaStr,
      sub_media: subMediaStr,
      ...(selectedCohort && { cohort: selectedCohort }),
    };

    // Simulate network delay
    setTimeout(() => {
      const result = searchMainReport(formData);
      setData(result);
      setLoading(false);
    }, 300);
  }, [
    hospital_name_id,
    customDateRange.startDate,
    customDateRange.endDate,
    mainMediaStr,
    subMediaStr,
    dateType,
    selectedCohort,
  ]);

  // 숫자 포맷팅 함수
  const formatNumber = useCallback((value, unit = "") => {
    if (typeof value !== "number") return value;

    const rounded = Math.round(value);

    if (unit === "₩") {
      return `${unit} ${rounded.toLocaleString()}`;
    } else if (unit === "%") {
      return `${rounded.toLocaleString()}${unit}`;
    } else if (unit === "ROAS") {
      const roasValue = Math.round(value * 100);
      return `${roasValue.toLocaleString()}%`;
    }

    return `${rounded.toLocaleString()}${unit}`;
  }, []);

  // 실적 비교하기 모달
  const [performanceComparisonModal, setPerformanceComparisonModal] = useState(false);

  const togglePerformanceComparisonModal = useCallback(() => {
    setPerformanceComparisonModal((prev) => !prev);
  }, []);

  // 병원이 선택되지 않고 다른 항목을 먼저 선택했을 시
  const [showHospitalSelectionModal, setShowHospitalSelectionModal] = useState(false);

  useEffect(() => {
    if (
      (customDateRange.startDate ||
        customDateRange.endDate ||
        main_media.length > 0 ||
        sub_media.length > 0) &&
      hospital_name_id === "병원을 선택하세요." &&
      !showHospitalSelectionModal
    ) {
      setShowHospitalSelectionModal(true);
      setMain_media([]);
      setSub_media([]);
    }
  }, [customDateRange, main_media, sub_media, hospital_name_id, showHospitalSelectionModal]);

  const handleConfirmHospitalDateModal = useCallback(() => {
    setCustomDateRange({
      startDate: null,
      endDate: null,
    });
    setShowHospitalSelectionModal(false);
  }, []);

  // 검색 값 저장 (demo: no-op)
  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false);

  const handleConfirmSaveSearch = useCallback(() => {
    // Demo: just close the modal
    setShowSaveSearchModal(false);
  }, []);

  const toggleSaveSearchModal = useCallback(() => {
    setShowSaveSearchModal((prev) => !prev);
  }, []);

  // 인쇄
  const handleDirectPrint = useCallback(() => {
    if (!data) {
      alert("먼저 데이터를 조회해주세요.");
      return;
    }
    window.print();
  }, [data]);

  // PDF 저장 (demo: disabled)
  const handleSaveAsPDF = useCallback(() => {
    alert("PDF 저장 기능은 데모에서 비활성화됩니다.");
  }, []);

  // 병원명 클릭 시 해당 병원으로 필터링
  const handleHospitalClick = useCallback((hospitalNameId, hospitalName) => {
    setHospital_name_id(hospitalNameId);
    setName(hospitalName);
  }, []);

  return (
    <div className={`main_report container_flex ${dateType === "receipt" ? "receipt-mode" : "visit-mode"}`}>
      <div
        className="container_left main_reportPrint"
        id="main_reportPrint"
        style={!data ? { position: "relative" } : undefined}
      >
        {performanceComparisonModal && (
          <PerformanceComparisonModal
            formatNumber={formatNumber}
            performanceComparisonModal={performanceComparisonModal}
            togglePerformanceComparisonModal={togglePerformanceComparisonModal}
            dateType={dateType}
            selectedCohort={selectedCohort}
            setSelectedCohort={setSelectedCohort}
            cohortList={cohortList}
            selectedHospital={hospital_name_id}
            mainMediaStr={mainMediaStr}
            subMediaStr={subMediaStr}
          />
        )}

        {loading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#979797',
            fontSize: '18px',
          }}>
            데이터를 불러오는 중...
          </div>
        )}

        {data && data.tmStats ? (
          <>
            <div className="page_section">
              <TitleBox
                mainmenu={name}
                submenu={dateType === "receipt" ? "접수일 기준" : "방문일 기준"}
              />
              {dateSelectionMode === "cohort" && (
                <TotalRevenue
                  tmStats={data.tmStats}
                  goal={data.financeStats.targetRevenue}
                  customDateRange={customDateRange}
                  selectedCohort={selectedCohort}
                  total_payment={data.tmStats.total_payment}
                  prev_cohort_payment={data.tmStats.prev_cohort_payment}
                  two_prev_cohort_payment={data.tmStats.two_prev_cohort_payment}
                  finalExpectedRevenue={data.finalExpectedRevenue}
                  endROAS={data.endROAS}
                  formatNumber={formatNumber}
                  dbAdBudget={data.financeStats.dbAdBudget}
                  displayAdBudget={data.financeStats.displayAdBudget}
                  depositAmount={data.financeStats.depositAmount}
                  consultPaidCount={data.tmStats.consultPaidCount}
                  total_ad_spend={data.adSpendingStats.total_ad_spend}
                  dbUnitPrice={data.dbUnitPrice}
                  first_reservation_rate={data.tmStats.first_reservation_rate}
                  first_reservation_rate_for_budget={data.tmStats.first_reservation_rate_for_budget}
                  promise_fulfillment_rate={data.tmStats.promise_fulfillment_rate}
                  pending_reservation_count={data.tmStats.pending_reservation_count}
                  dateType={dateType}
                />
              )}
              <SectionPerformance
                loginUser={loginUser}
                tmStats={data.tmStats}
                total_ad_spend={data.adSpendingStats.total_ad_spend}
                reservation_count={data.tmStats.reservation_count}
                consultPaidCount={data.tmStats.consultPaidCount}
                promise_fulfillment_rate={data.tmStats.promise_fulfillment_rate}
                consult_consent_rate={data.tmStats.consult_consent_rate}
                dbUnitPrice={data.dbUnitPrice}
                formatNumber={formatNumber}
                togglePerformanceComparisonModal={togglePerformanceComparisonModal}
                dateType={dateType}
              />
            </div>
            <div className="page-break" />
            <div className="page_section">
              <TitleBox
                mainmenu={name}
                submenu={dateType === "receipt" ? "접수일 기준" : "방문일 기준"}
              />
              <MediaPerformance
                dbAdBudget={data.financeStats.dbAdBudget}
                displayAdBudget={data.financeStats.displayAdBudget}
                goal={data.financeStats.targetRevenue}
                selectedHospital={hospital_name_id}
                mediaOptions={mediaOptions}
                main_media={main_media}
                sub_media={sub_media}
                mediaStats={data.mediaStats}
                formatNumber={formatNumber}
                daysInCohort={daysInCohort}
                previousDate={previousDate}
                dateType={dateType}
                dateSelectionMode={dateSelectionMode}
              />
            </div>
            <div className="page-break" />
            <div className="page_section">
              <TitleBox
                mainmenu={name}
                submenu={dateType === "receipt" ? "접수일 기준" : "방문일 기준"}
              />
              <EventMetricSummary
                eventStats={data.eventStats.byEventName}
                formatNumber={formatNumber}
              />
            </div>
          </>
        ) : hospital_name_id === "전체" ? (
          <AllHospitalsTable
            dateType={dateType}
            formatNumber={formatNumber}
            onHospitalClick={handleHospitalClick}
            dateMode={allHospitalsDateMode}
            customDateRange={customDateRange}
          />
        ) : (
          <p className="pre-search-text">검색 값을 입력 후 조회하세요</p>
        )}
      </div>

      <div className="container_right">
        <FilterComponent
          loginUser={loginUser}
          cohortList={cohortList}
          setCohortList={setCohortList}
          selectedCohort={selectedCohort}
          setSelectedCohort={setSelectedCohort}
          dateSelectionMode={dateSelectionMode}
          setDateSelectionMode={setDateSelectionMode}
          dateType={dateType}
          setDateType={setDateType}
          selectedHospital={hospital_name_id}
          setSelectedHospital={setHospital_name_id}
          setName={setName}
          customDateRange={customDateRange}
          setCustomDateRange={setCustomDateRange}
          allHospitalsDateMode={allHospitalsDateMode}
          setAllHospitalsDateMode={setAllHospitalsDateMode}
          mediaOptions={mediaOptions}
          main_media={main_media}
          setMain_media={setMain_media}
          sub_media={sub_media}
          setSub_media={setSub_media}
        />

        {showHospitalSelectionModal && (
          <AlertModal
            message="병원 선택 후 날짜를 설정해 주세요."
            onConfirm={handleConfirmHospitalDateModal}
          />
        )}

        {showSaveSearchModal && (
          <AlertModal
            message={`현재 설정한 검색 값을 저장하시겠습니까?\n⚠️ 저장 시 모든 계정에 동일하게 적용됩니다.`}
            onConfirm={handleConfirmSaveSearch}
            onCancel={toggleSaveSearchModal}
          />
        )}

        <div className="buttons">
          <button className="saveSearchBtn no-print" onClick={toggleSaveSearchModal}>
            검색 값 저장
          </button>

          <div className="printBtns">
            <button className="printBtn no-print" onClick={handleDirectPrint}>
              <FontAwesomeIcon icon={faPrint} />
              인쇄하기
            </button>
            <button className="pdfBtn no-print" onClick={handleSaveAsPDF}>
              <FontAwesomeIcon icon={faFilePdf} />
              PDF로 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainReport;
