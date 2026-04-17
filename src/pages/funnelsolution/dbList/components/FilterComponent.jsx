// 1. React 및 React 내장 훅 (가장 먼저 로드)
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";

// 2. 외부 라이브러리
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

// 3. mock service (axios 대체)
import {
  getHospitalsForFilter,
  getAdvertisingCompaniesForFilter,
} from "@/data/funnelsolution/mockService";

// 4. 내부 컴포넌트
import DateRangePicker from "./DateRangePicker";

// 필터 컴포넌트 - 병원, 날짜, 매체 필터링 관리
const FilterComponent = React.memo(({
  filters,
  onFilterChange,
  checkedCompanies,
  setCheckedCompanies,
  companyOptions,
  setCompanyOptions,
  isCompanyDropdownOpen,
  setIsCompanyDropdownOpen,
  customDateRange,
  setCustomDateRange,
  hospitalOptions,
  setHospitalOptions,
  selectedHospital,
  setSelectedHospital,
  datePickerStatus,
  setDatePickerStatus,
  setAccordionComponent,
  get_status,
  loginUser,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [selectedDateOption, setSelectedDateOption] = useState("오늘");
  const [companyInput, setCompanyInput] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hospitalSearchTerm, setHospitalSearchTerm] = useState("");
  const hospitalDropdownRef = useRef(null);

  const formatKoreanDate = useCallback((date) => {
    return (
      date.getFullYear() +
      "년 " +
      (date.getMonth() + 1) +
      "월 " +
      date.getDate() +
      "일"
    );
  }, []);

  const handleCompanyDropdownClick = useCallback((e) => {
    e.stopPropagation();
    setIsCompanyDropdownOpen(!isCompanyDropdownOpen);
    setIsDropdownOpen(false);
    setIsDateDropdownOpen(false);
    setDatePickerStatus(false);
  }, [isCompanyDropdownOpen, setDatePickerStatus, setIsCompanyDropdownOpen]);

  const handleDropdownClick = useCallback(() => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsDateDropdownOpen(false);
    setIsCompanyDropdownOpen(false);
    setDatePickerStatus(false);
  }, [isDropdownOpen, setDatePickerStatus, setIsCompanyDropdownOpen]);

  const handleOptionClick = useCallback((hospital) => {
    setSelectedHospital(hospital.id);
    setIsDropdownOpen(false);
    setHospitalSearchTerm("");

    onFilterChange({
      ...filters,
      hospital_name: hospital.name,
      selected_hospital_id: hospital.id,
    });
  }, [filters, onFilterChange, setSelectedHospital]);

  const filteredHospitals = useMemo(() => {
    if (!hospitalOptions) return [];
    return hospitalOptions.filter((hospital) =>
      hospital.name.toLowerCase().includes(hospitalSearchTerm.toLowerCase())
    );
  }, [hospitalOptions, hospitalSearchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (hospitalDropdownRef.current && !hospitalDropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setHospitalSearchTerm("");
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const dateOptions = useMemo(() => [
    { label: "오늘", value: "today" },
    { label: "최근 7일", value: "last7days" },
    { label: "최근 30일", value: "last30days" },
    { label: "어제", value: "yesterday" },
    { label: "지난주 (오늘 제외)", value: "lastweek" },
    { label: "전체기간", value: "all" },
  ], []);

  const filteredCompanyOptions = useMemo(() => {
    return companyOptions.filter(
      (company) =>
        company &&
        typeof company.name === "string" &&
        company.name.toLowerCase().includes(companyInput.toLowerCase())
    );
  }, [companyOptions, companyInput]);

  const updateDateRange = useCallback((option) => {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (option) {
      case "today":
        startDate = endDate = new Date();
        break;
      case "yesterday":
        startDate = endDate = new Date(today.setDate(today.getDate() - 1));
        break;
      case "last7days":
        startDate = new Date(today.setDate(today.getDate() - 6));
        endDate = new Date();
        break;
      case "last30days":
        startDate = new Date(today.setDate(today.getDate() - 29));
        endDate = new Date();
        break;
      case "lastweek":
        startDate = new Date(new Date().setDate(today.getDate() - 7));
        endDate = new Date(new Date().setDate(today.getDate() - 1));
        break;
      case "all":
        // Mock: 전체 기간은 2026-04-01 ~ 오늘
        startDate = new Date("2026-04-01");
        endDate = new Date();
        break;
      default:
        startDate = endDate = new Date();
        break;
    }

    setCustomDateRange({ startDate, endDate });
    setAccordionComponent(null);
  }, [setCustomDateRange, setAccordionComponent]);

  const handleDateDropdownClick = useCallback(() => {
    setIsDateDropdownOpen(!isDateDropdownOpen);
    setIsDropdownOpen(false);
    setIsCompanyDropdownOpen(false);
    setDatePickerStatus(false);
  }, [isDateDropdownOpen, setDatePickerStatus, setIsCompanyDropdownOpen]);

  const handleDateOptionClick = useCallback((option, value) => {
    setSelectedDateOption(option);
    setIsDateDropdownOpen(false);
    setIsCompanyDropdownOpen(false);
    updateDateRange(value);
    setDatePickerStatus(false);
  }, [setDatePickerStatus, updateDateRange, setIsCompanyDropdownOpen]);

  const handleCompanyOptionClick = useCallback((e, company) => {
    e.stopPropagation();
    setSelectedCompany(company);
    setIsCompanyDropdownOpen(false);
    onFilterChange({
      ...filters,
      company_name: company,
    });
  }, [filters, onFilterChange, setIsCompanyDropdownOpen]);

  // 체크박스 클릭 핸들러
  const handleCheckboxChange = useCallback((companyId) => {
    let companiesArray = [];
    if (Array.isArray(checkedCompanies)) {
      companiesArray = checkedCompanies;
    } else if (typeof checkedCompanies === "string" && checkedCompanies.trim() !== "") {
      companiesArray = checkedCompanies.split(",").map(Number);
    }

    const updatedCheckedCompanies = companiesArray.includes(companyId)
      ? companiesArray.filter((id) => id !== companyId)
      : [...companiesArray, companyId];

    const resultString = updatedCheckedCompanies.sort((a, b) => a - b).join(",");
    setCheckedCompanies(resultString);
  }, [checkedCompanies, setCheckedCompanies]);

  // 초기 데이터 로드 (axios 대신 mockService 사용)
  useEffect(() => {
    const hospitalsResult = getHospitalsForFilter();
    if (hospitalsResult.success) {
      setHospitalOptions(hospitalsResult.data.items);
    }

    const companiesResult = getAdvertisingCompaniesForFilter();
    if (companiesResult.success) {
      setCompanyOptions(companiesResult.data.items);
      // 데모: 기본적으로 모든 매체 선택
      const allIds = companiesResult.data.items.map(c => c.id).join(",");
      setCheckedCompanies(allIds);
    }

    setTimeout(() => setIsInitialLoad(false), 100);
  }, [setHospitalOptions, setCompanyOptions, setCheckedCompanies]);

  const shiftDateRange = (direction) => {
    const startTimestamp = new Date(customDateRange.startDate).getTime();
    const endTimestamp = new Date(customDateRange.endDate).getTime();
    const diffTime = endTimestamp - startTimestamp;

    let newStartTimestamp, newEndTimestamp;
    if (direction === "prev") {
      newStartTimestamp = startTimestamp - diffTime - 86400000;
      newEndTimestamp = endTimestamp - diffTime - 86400000;
    } else {
      newStartTimestamp = startTimestamp + diffTime + 86400000;
      newEndTimestamp = endTimestamp + diffTime + 86400000;
    }

    setCustomDateRange({
      startDate: new Date(newStartTimestamp),
      endDate: new Date(newEndTimestamp),
    });
    setIsDropdownOpen(false);
    setIsDateDropdownOpen(false);
    setIsCompanyDropdownOpen(false);
    setDatePickerStatus(false);
  };

  const DatePickerHandler = () => {
    setDatePickerStatus(!datePickerStatus);
    setIsDropdownOpen(false);
    setIsDateDropdownOpen(false);
    setIsCompanyDropdownOpen(false);
  };

  return (
    <div className="filter-container">
      <div className="filter-group">
        {/* 병원 필터 */}
        <div className="hospital-filter" ref={hospitalDropdownRef}>
          <div className="hospital-custom-select" onClick={handleDropdownClick}>
            {selectedHospital === "all" ? "전체 병원" :
              selectedHospital !== undefined && selectedHospital !== null
                ? hospitalOptions.find((hospital) => hospital.id === selectedHospital)?.name
                : "병원 전체 목록"}
            <span className="dropdown-arrow">▼</span>
          </div>

          {isDropdownOpen && (
            <ul className="custom-options">
              <li className="search-input-wrapper">
                <input
                  type="text"
                  value={hospitalSearchTerm}
                  onChange={(e) => setHospitalSearchTerm(e.target.value)}
                  placeholder="병원 검색..."
                  className="hospital-search-input"
                  onClick={(e) => e.stopPropagation()}
                />
              </li>
              <li
                key="all-hospitals"
                onClick={() => handleOptionClick({ id: null, name: "병원 전체 목록" })}
                className={`option-item ${selectedHospital === null ? "selected" : ""}`}
              >
                병원 전체 목록
              </li>
              {filteredHospitals.map((hospital) => (
                <li
                  key={hospital.id}
                  onClick={() => handleOptionClick(hospital)}
                  className={`option-item ${selectedHospital === hospital.id ? "selected" : ""}`}
                >
                  {hospital.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 날짜 필터 */}
        <div className="date-filter-container">
          <div className="date-filter-box">
            <div className="date-filter">
              <div className="custom-select" onClick={handleDateDropdownClick}>
                <FontAwesomeIcon icon={faCalendarAlt} className="calendar-icon" />
                <span>{selectedDateOption}</span>
              </div>
              <span className="lineSeper">|</span>
              {isDateDropdownOpen && (
                <ul className="custom-options">
                  {dateOptions.map((option, index) => (
                    <li
                      key={index}
                      onClick={() => handleDateOptionClick(option.label, option.value)}
                      className={`option-item ${selectedDateOption === option.label ? "selected" : ""}`}
                    >
                      {option.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="date-display">
              <span className="date-text" onClick={DatePickerHandler}>
                {formatKoreanDate(customDateRange.startDate)} ~
                {formatKoreanDate(customDateRange.endDate)}
              </span>
              <div className="divider large"></div>
              <div className="arrow-group">
                <span className="arrow-icon" onClick={() => shiftDateRange("prev")}>&lt;</span>
                <span className="arrow-icon" onClick={() => shiftDateRange("next")}>&gt;</span>
              </div>
            </div>
          </div>
          <div className="dateRangePicker-box">
            {datePickerStatus && (
              <DateRangePicker
                customDateRange={customDateRange}
                setCustomDateRange={setCustomDateRange}
                closePicker={() => {
                  setDatePickerStatus(false);
                  setSelectedDateOption("사용자 지정");
                }}
                setSelectedDateOption={setSelectedDateOption}
              />
            )}
          </div>
        </div>
      </div>

      {/* 회사(매체) 필터 */}
      {get_status === 1 && (
        <div className="company-filter">
          <div
            className="company-custom-select"
            onClick={(e) => {
              e.stopPropagation();
              handleCompanyDropdownClick(e);
            }}
          >
            <input
              type="text"
              placeholder="조회할 매체 선택"
              value={companyInput}
              onChange={(e) => setCompanyInput(e.target.value)}
            />
            <span className="dropdown-arrow">▼</span>
          </div>

          {isCompanyDropdownOpen === true && (
            <ul className="custom-options">
              <li className="search-input-wrapper">
                <input
                  type="text"
                  value={companyInput}
                  onChange={(e) => setCompanyInput(e.target.value)}
                  placeholder="매체 검색..."
                  className="company-search-input"
                  onClick={(e) => e.stopPropagation()}
                />
              </li>
              {filteredCompanyOptions.map((company, index) => (
                <li
                  key={index}
                  className={`option-item ${checkedCompanies.includes(company.id) ? "selected" : ""}`}
                  onClick={(e) => {
                    handleCheckboxChange(company.id);
                    handleCompanyOptionClick(e, company);
                  }}
                >
                  <input
                    className="companyCheckBox"
                    type="checkbox"
                    checked={checkedCompanies.includes(company.id)}
                    onChange={() => {}}
                  />
                  <span>{company.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
});

export default FilterComponent;
