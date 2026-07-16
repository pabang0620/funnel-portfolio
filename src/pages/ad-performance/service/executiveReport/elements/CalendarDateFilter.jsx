import { useEffect, useState, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import "./CalendarDateFilter.css";

const CalendarDateFilter = ({
  customDateRange,
  setCustomDateRange,
  selectedPeriod,
  setSelectedPeriod,
  datesWithData = [], // 데이터가 있는 날짜 배열
}) => {
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

  // 달력 생성 함수
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0);
    const calendarDays = [];
    const startDay = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    for (let i = 0; i < startDay; i++) {
      calendarDays.push(null);
    }

    for (let day = 1; day <= totalDays; day++) {
      calendarDays.push(day);
    }

    return calendarDays;
  }, [year, month]);

  const handleMonthChange = useCallback(
    (direction) => {
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
    },
    [month, year]
  );

  const formatToDateOnlyString = useCallback((dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const handleDateClick = (day) => {
    if (!day) return;

    const clickedDate = new Date(year, month - 1, day);
    const formattedClicked = formatToDateOnlyString(clickedDate);

    if (!startDate || (startDate && endDate)) {
      setCustomDateRange({ startDate: formattedClicked, endDate: null });
    } else if (formattedClicked < customDateRange.startDate) {
      setCustomDateRange({ startDate: formattedClicked, endDate: null });
    } else {
      setCustomDateRange({
        startDate: customDateRange.startDate,
        endDate: formattedClicked,
      });
    }

    setSelectedPeriod("선택 날짜");
  };

  // 기간 드롭박스
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 년도 드롭박스
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

  const handleDropdownClick = useCallback(() => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsYearDropdownOpen(false); // 월 드롭다운 열 때 년도 드롭다운 닫기
  }, [isDropdownOpen]);

  const handleYearDropdownClick = useCallback(() => {
    setIsYearDropdownOpen(!isYearDropdownOpen);
    setIsDropdownOpen(false); // 년도 드롭다운 열 때 월 드롭다운 닫기
  }, [isYearDropdownOpen]);

  const handleOptionClick = (value) => {
    setSelectedPeriod(value);
    setIsDropdownOpen(false);

    if (value === "어제") {
      // 어제 날짜로 설정
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      setCustomDateRange({
        startDate: formatToDateOnlyString(yesterday),
        endDate: formatToDateOnlyString(yesterday),
      });

      // 달력도 어제 날짜의 월로 이동
      setYear(yesterday.getFullYear());
      setMonth(yesterday.getMonth() + 1);
    } else if (value === "오늘") {
      // 오늘 날짜로 설정
      const today = new Date();

      setCustomDateRange({
        startDate: formatToDateOnlyString(today),
        endDate: formatToDateOnlyString(today),
      });

      // 달력도 현재 월로 이동
      setYear(today.getFullYear());
      setMonth(today.getMonth() + 1);
    } else if (value === "이번달") {
      // 이번달 1일 오늘까지 설정
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), 1);

      setCustomDateRange({
        startDate: formatToDateOnlyString(start),
        endDate: formatToDateOnlyString(today),
      });

      // 달력도 현재 월로 이동
      setYear(today.getFullYear());
      setMonth(today.getMonth() + 1);
    } else {
      // 월 이름에서 숫자 추출 (예: "1월" -> 1)
      const monthNumber = parseInt(value.replace("월", ""));

      // 선택된 월의 첫날과 마지막날 설정
      const start = new Date(year, monthNumber - 1, 1);
      const end = new Date(year, monthNumber, 0);

      setCustomDateRange({
        startDate: formatToDateOnlyString(start),
        endDate: formatToDateOnlyString(end),
      });

      // 달력도 해당 월로 이동
      setMonth(monthNumber);
    }
  };

  const handleYearSelect = (selectedYear) => {
    setYear(selectedYear);
    setIsYearDropdownOpen(false);
  };

  // 컴포넌트 마운트 시 selectedPeriod에 따라 자동으로 처리
  useEffect(() => {
    if (!customDateRange.startDate && !customDateRange.endDate) {
      if (selectedPeriod === "어제") {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        setCustomDateRange({
          startDate: formatToDateOnlyString(yesterday),
          endDate: formatToDateOnlyString(yesterday),
        });

        // 달력도 어제 날짜의 월로 이동
        setYear(yesterday.getFullYear());
        setMonth(yesterday.getMonth() + 1);
      } else if (selectedPeriod === "오늘") {
        const today = new Date();

        setCustomDateRange({
          startDate: formatToDateOnlyString(today),
          endDate: formatToDateOnlyString(today),
        });

        // 달력도 현재 월로 이동
        setYear(today.getFullYear());
        setMonth(today.getMonth() + 1);
      } else if (selectedPeriod === "이번달") {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), 1);

        setCustomDateRange({
          startDate: formatToDateOnlyString(start),
          endDate: formatToDateOnlyString(today),
        });

        // 달력도 현재 월로 이동
        setYear(today.getFullYear());
        setMonth(today.getMonth() + 1);
      }
    }
  }, [selectedPeriod, formatToDateOnlyString, customDateRange.startDate, customDateRange.endDate]);

  return (
    <div className="calendarDateFilter">
      <div className="calendar-title">
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <span
            className="year-month"
            onClick={handleYearDropdownClick}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            {`${year}년 ${month.toString().padStart(2, "0")}월`}
          </span>
          {isYearDropdownOpen && (
            <ul className="custom-options" style={{
              minWidth: '70px',
              width: 'auto',
              left: '-10px',
              right: 'auto'
            }}>
              {[today.getFullYear(), today.getFullYear() - 1, today.getFullYear() - 2].map((yearOption, index) => (
                <li
                  key={`year-${yearOption}`}
                  onClick={() => handleYearSelect(yearOption)}
                  className={`option-item ${year === yearOption ? "selected" : ""}`}
                  style={{
                    borderTop: index > 0 ? '1px solid #e5e7eb' : 'none',
                    padding: '8px 12px'
                  }}
                >
                  {yearOption}년
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="cohort-filter">
          <div className="cohort-custom-select" onClick={handleDropdownClick}>
            {selectedPeriod || "월선택"}
            <FontAwesomeIcon icon={faChevronDown} className="dropdown-icon" />
          </div>
          {isDropdownOpen && (
            <ul className="custom-options">
              <li
                key="yesterday"
                onClick={() => handleOptionClick("어제")}
                className={`option-item ${
                  selectedPeriod === "어제" ? "selected" : ""
                }`}
              >
                어제
              </li>
              <li
                key="today"
                onClick={() => handleOptionClick("오늘")}
                className={`option-item ${
                  selectedPeriod === "오늘" ? "selected" : ""
                }`}
              >
                오늘
              </li>
              <li
                key="current-month"
                onClick={() => handleOptionClick("이번달")}
                className={`option-item ${
                  selectedPeriod === "이번달" ? "selected" : ""
                }`}
              >
                이번달
              </li>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((monthNum) => (
                <li
                  key={`month-${monthNum}`}
                  onClick={() => handleOptionClick(`${monthNum}월`)}
                  className={`option-item ${
                    selectedPeriod === `${monthNum}월` ? "selected" : ""
                  }`}
                >
                  {monthNum}월
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

            const sDate = startDate
              ? new Date(
                  startDate.getFullYear(),
                  startDate.getMonth(),
                  startDate.getDate()
                ).getTime()
              : null;
            const eDate = endDate
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

            // 데이터가 없는 날짜인지 확인 (미래 날짜 제외, datesWithData가 제공된 경우만)
            const dateString = `${year}-${String(month).padStart(
              2,
              "0"
            )}-${String(day).padStart(2, "0")}`;
            const isFutureDate = thisDate > new Date().setHours(0, 0, 0, 0);
            const hasNoData =
              datesWithData.length > 0 &&
              !isFutureDate &&
              !datesWithData.includes(dateString);

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
                <div className="calendar-date">
                  {day}
                  {hasNoData && <span className="no-data-indicator">●</span>}
                </div>
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
