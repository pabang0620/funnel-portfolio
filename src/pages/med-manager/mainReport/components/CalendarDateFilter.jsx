import React, { useEffect, useState, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

// Demo: always treat as admin (role 1) — no JWT needed
const DEMO_USER = { role: 1, name: '관리자' };

const CalendarDateFilter = ({
  loginUser,

  // 날짜||기수 선택 모드
  dateSelectionMode,
  setDateSelectionMode,

  // 기수 목록
  cohortList,

  // 선택된 기수
  selectedCohort,
  setSelectedCohort,

  // 날짜 관련
  customDateRange,
  setCustomDateRange,

  // 병원 선택
  selectedHospital,

  // 병원 전체 선택 시 날짜 모드
  allHospitalsDateMode,
  setAllHospitalsDateMode,
}) => {
  const currentUser = loginUser || DEMO_USER;

  // 달력 표시
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  // 날짜 선택
  const startDate = customDateRange.startDate
    ? new Date(customDateRange.startDate)
    : null;
  const endDate = customDateRange.endDate
    ? new Date(customDateRange.endDate)
    : null;

  // 달력 생성
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0);
    const days = [];
    const startDay = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    for (let day = 1; day <= totalDays; day++) {
      days.push(day);
    }

    return days;
  }, [year, month]);

  const handleMonthChange = useCallback((direction) => {
    let newMonth = month + direction;
    let newYear = year;

    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    } else if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }

    setYear(newYear);
    setMonth(newMonth);
  }, [month, year]);

  const formatToDateOnlyString = useCallback((dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  const handleDateClick = (day) => {
    if (!day || currentUser.role === 5 || currentUser.role === 6) return;

    const clickedDate = new Date(year, month - 1, day);
    const formattedClicked = formatToDateOnlyString(clickedDate);

    if (!startDate || (startDate && endDate)) {
      setCustomDateRange({ startDate: formattedClicked, endDate: null });
    } else if (formattedClicked < customDateRange.startDate) {
      setCustomDateRange({ startDate: formattedClicked, endDate: null });
    } else {
      setCustomDateRange({ startDate: customDateRange.startDate, endDate: formattedClicked });
    }

    setSelectedCohort(null);
    setDateSelectionMode("manual");

    if (selectedHospital === "전체" && setAllHospitalsDateMode) {
      setAllHospitalsDateMode("custom_date");
    }
  };

  // 기수 드롭박스
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleDropdownClick = useCallback(() => {
    if (currentUser.role === 5 || currentUser.role === 6) return;
    setIsDropdownOpen((prev) => !prev);
  }, [currentUser]);

  const handleOptionClick = (value) => {
    setSelectedCohort(value);
    setIsDropdownOpen(false);

    const todayDate = new Date();
    if (value === "최신 기수 기준") {
      if (selectedHospital === "전체" && setAllHospitalsDateMode) {
        setAllHospitalsDateMode("latest_cohort");
        setCustomDateRange({ startDate: "", endDate: "" });
        setDateSelectionMode("cohort");
      }
    } else if (value === "최근 30일") {
      const start = new Date();
      start.setDate(todayDate.getDate() - 29);
      setCustomDateRange({
        startDate: formatToDateOnlyString(start),
        endDate: formatToDateOnlyString(todayDate),
      });
      setDateSelectionMode("recent");
      if (selectedHospital === "전체" && setAllHospitalsDateMode) {
        setAllHospitalsDateMode("custom_date");
      }
    } else if (value === "최근 7일") {
      const start = new Date();
      start.setDate(todayDate.getDate() - 6);
      setCustomDateRange({
        startDate: formatToDateOnlyString(start),
        endDate: formatToDateOnlyString(todayDate),
      });
      setDateSelectionMode("recent");
      if (selectedHospital === "전체" && setAllHospitalsDateMode) {
        setAllHospitalsDateMode("custom_date");
      }
    } else if (value === "지난주(오늘제외)") {
      const end = new Date();
      end.setDate(todayDate.getDate() - 1);
      const start = new Date();
      start.setDate(todayDate.getDate() - 7);
      setCustomDateRange({
        startDate: formatToDateOnlyString(start),
        endDate: formatToDateOnlyString(end),
      });
      setDateSelectionMode("recent");
      if (selectedHospital === "전체" && setAllHospitalsDateMode) {
        setAllHospitalsDateMode("custom_date");
      }
    } else if (value === null) {
      setCustomDateRange({ startDate: null, endDate: null });
      setDateSelectionMode(null);
    } else {
      // 기수 선택
      const selected = cohortList.find((item) => item.cohort === value);
      if (selected) {
        setCustomDateRange({
          startDate: formatToDateOnlyString(new Date(selected.start_date)),
          endDate: formatToDateOnlyString(new Date(selected.end_date)),
        });
        setDateSelectionMode("cohort");
      }
    }
  };

  // 병원선택 후 기수 자동 선택되면, 달력에 날짜 표시
  useEffect(() => {
    if (
      !selectedCohort ||
      selectedCohort === "최근 30일" ||
      selectedCohort === "최근 7일" ||
      selectedCohort === "지난주(오늘제외)"
    ) {
      return;
    }

    const selected = cohortList.find((item) => item.cohort === selectedCohort);
    if (selected) {
      setCustomDateRange({
        startDate: formatToDateOnlyString(new Date(selected.start_date)),
        endDate: formatToDateOnlyString(new Date(selected.end_date)),
      });
      setDateSelectionMode("cohort");
    }
  }, [selectedCohort, cohortList]);

  // 기수(cohort) 선택 시 시작 날짜로 달력 이동
  useEffect(() => {
    if (dateSelectionMode === "cohort" && customDateRange.startDate) {
      const start = new Date(customDateRange.startDate);
      setYear(start.getFullYear());
      setMonth(start.getMonth() + 1);
    }
  }, [dateSelectionMode, customDateRange.startDate]);

  const formatDateToKorean = (isoDate) => {
    const date = new Date(isoDate);
    const y = String(date.getFullYear()).slice(2);
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return `${y}년 ${m}월 ${d}일`;
  };

  return (
    <div className="calendarDateFilter">
      <div className="calendar-title">
        <span className="year-month">{`${year}년 ${month
          .toString()
          .padStart(2, "0")}월`}</span>
        <div className="cohort-filter">
          <div className="cohort-custom-select" onClick={handleDropdownClick}>
            {dateSelectionMode === "manual"
              ? "선택 날짜"
              : selectedCohort ? (typeof selectedCohort === 'number' ? `${selectedCohort}기수` : selectedCohort) : "기수 선택"}
            {currentUser.role !== 5 && currentUser.role !== 6 && (
              <FontAwesomeIcon icon={faChevronDown} className="dropdown-icon" />
            )}
          </div>
          {currentUser.role !== 5 && isDropdownOpen && (
            <ul className="custom-options">
              {selectedHospital === "전체" && (
                <li
                  key="latest-cohort"
                  onClick={() => handleOptionClick("최신 기수 기준")}
                  className={`option-item ${
                    selectedCohort === "최신 기수 기준" ? "selected" : ""
                  }`}
                >
                  최신 기수 기준
                </li>
              )}
              <li
                key="last-30"
                onClick={() => handleOptionClick("최근 30일")}
                className={`option-item ${
                  selectedCohort === "최근 30일" ? "selected" : ""
                }`}
              >
                최근 30일
              </li>
              <li
                key="last-7"
                onClick={() => handleOptionClick("최근 7일")}
                className={`option-item ${
                  selectedCohort === "최근 7일" ? "selected" : ""
                }`}
              >
                최근 7일
              </li>
              <li
                key="last-week"
                onClick={() => handleOptionClick("지난주(오늘제외)")}
                className={`option-item ${
                  selectedCohort === "지난주(오늘제외)" ? "selected" : ""
                }`}
              >
                지난주(오늘제외)
              </li>

              {cohortList &&
                cohortList.map((item) => (
                  <li
                    key={item.cohort}
                    onClick={() => handleOptionClick(item.cohort)}
                    className={`option-item ${
                      selectedCohort === item.cohort ? "selected" : ""
                    }`}
                    title={`${formatDateToKorean(item.start_date)} - ${formatDateToKorean(item.end_date)}`}
                  >
                    {item.cohort}기수
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
      <div className="calendar">
        <div className="calendar-header">
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <div key={day} className="calendar-day">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-grid">
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={index} className="calendar-cell empty-cell" />;
            }

            const thisDateObj = new Date(year, month - 1, day);
            const thisDate = thisDateObj.setHours(0, 0, 0, 0);

            const sDate =
              startDate instanceof Date
                ? new Date(
                    startDate.getFullYear(),
                    startDate.getMonth(),
                    startDate.getDate()
                  ).getTime()
                : null;
            const eDate =
              endDate instanceof Date
                ? new Date(
                    endDate.getFullYear(),
                    endDate.getMonth(),
                    endDate.getDate()
                  ).getTime()
                : null;

            const isStartDate = thisDate === sDate;
            const isEndDate = thisDate === eDate;
            const isInRange =
              sDate && eDate && thisDate > sDate && thisDate < eDate;

            return (
              <div
                key={index}
                className={`calendar-cell
                  ${
                    day === today.getDate() &&
                    today.getMonth() + 1 === month &&
                    today.getFullYear() === year
                      ? "today"
                      : ""
                  }
                  ${isStartDate ? "selected start-date" : ""}
                  ${isEndDate ? "selected end-date" : ""}
                  ${isInRange ? "in-range" : ""}
                `}
                onClick={() => handleDateClick(day)}
              >
                <div className="calendar-date">{day}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="year-month-button">
        <button className="month-btn" onClick={() => handleMonthChange(-1)}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        <button className="month-btn" onClick={() => handleMonthChange(1)}>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );
};

export default CalendarDateFilter;
