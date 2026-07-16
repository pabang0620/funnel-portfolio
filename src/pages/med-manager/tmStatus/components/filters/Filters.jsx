import React, {
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  faCalendarAlt,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ko from "date-fns/locale/ko";

import CustomDropdown from "../common/CustomDropdown";
import { getTmHospitals, getTmUsers } from "@/data/med-manager/mockService";

import "./Filters.css";

const shiftDateRange = (startDate, endDate, direction) => {
  const startTimestamp = new Date(startDate).getTime();
  const endTimestamp = new Date(endDate).getTime();
  const diffTime = endTimestamp - startTimestamp;

  let newStartTimestamp, newEndTimestamp;

  if (direction === "prev") {
    newStartTimestamp = startTimestamp - diffTime - 86400000;
    newEndTimestamp = endTimestamp - diffTime - 86400000;
  } else {
    newStartTimestamp = startTimestamp + diffTime + 86400000;
    newEndTimestamp = endTimestamp + diffTime + 86400000;
  }

  return {
    startDate: new Date(newStartTimestamp),
    endDate: new Date(newEndTimestamp),
  };
};

const Filters = ({
  selectedHospital,
  setSelectedHospital,
  selectedUserId,
  setSelectedUserId,
  selectedDate,
  setSelectedDate,
  dateFieldType,
  setDateFieldType,
  handleFilterChange,
  onUserListUpdate,
}) => {
  const [hospitalList, setHospitalList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isDateFieldDropdownOpen, setIsDateFieldDropdownOpen] = useState(false);
  const [selectedDateOption, setSelectedDateOption] = useState("오늘");
  const [datePickerStatus, setDatePickerStatus] = useState(false);
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);

  const dateOptions = [
    { label: "오늘", value: "today" },
    { label: "최근 7일", value: "last7days" },
    { label: "최근 30일", value: "last30days" },
    { label: "어제", value: "yesterday" },
    { label: "전체기간", value: "all" },
  ];

  const dateFieldOptions = [
    { value: "distribution_time", label: "분배날짜", tooltip: "담당자에게 데이터가 분배된 날짜" },
    { value: "customer_db_date", label: "유입날짜", tooltip: "고객이 처음 DB에 들어온 날짜" },
    { value: "reservation_date", label: "예약날짜", tooltip: "예약이 잡힌 날짜" },
    { value: "follow_up_time", label: "재통화날짜", tooltip: "재통화 예정 날짜" },
    { value: "call_memo_updated_at", label: "콜진행", tooltip: "마지막으로 콜 메모를 작성/수정한 날짜" },
  ];

  const selectedDateFieldLabel = dateFieldOptions.find(
    opt => opt.value === dateFieldType
  )?.label || "분배날짜";

  const formatKoreanDate = useCallback((date) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Seoul",
    };
    return new Intl.DateTimeFormat("ko-KR", options).format(date);
  }, []);

  // 포트폴리오: 실제 API 대신 mockService 사용
  useEffect(() => {
    const hospitals = getTmHospitals();
    const formattedHospitals = [
      { value: 0, label: "병원 전체" },
      ...hospitals,
    ];
    setHospitalList(formattedHospitals);

    const users = getTmUsers();
    setUserList(users);
    if (onUserListUpdate) {
      onUserListUpdate(users);
    }
  }, [onUserListUpdate]);

  const handleHospitalChange = useCallback((selectedValue) => {
    setSelectedHospital(selectedValue);
  }, [setSelectedHospital]);

  const handleManagerChange = useCallback((selectedValue) => {
    setSelectedUserId(selectedValue);
  }, [setSelectedUserId]);

  const handleDateDropdownClick = useCallback(() => {
    setIsDateDropdownOpen(prev => !prev);
    setIsDateFieldDropdownOpen(false);
  }, []);

  const handleDateFieldDropdownClick = useCallback(() => {
    setIsDateFieldDropdownOpen(prev => !prev);
    setIsDateDropdownOpen(false);
  }, []);

  const handleDateFieldOptionClick = useCallback((value) => {
    setDateFieldType(value);
    setIsDateFieldDropdownOpen(false);
  }, [setDateFieldType]);

  const updateDateRange = useCallback((option) => {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (option) {
      case "today":
        startDate = endDate = new Date();
        break;
      case "yesterday": {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = endDate = yesterday;
        break;
      }
      case "last7days": {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        startDate = sevenDaysAgo;
        endDate = new Date();
        break;
      }
      case "last30days": {
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
        startDate = thirtyDaysAgo;
        endDate = new Date();
        break;
      }
      case "all":
        startDate = new Date("2000-01-01");
        endDate = new Date();
        break;
      default:
        startDate = endDate = new Date();
        break;
    }

    setSelectedDate({ startDate, endDate });
  }, [setSelectedDate]);

  const handleDateOptionClick = useCallback((label, value) => {
    setSelectedDateOption(label);
    setIsDateDropdownOpen(false);
    updateDateRange(value);
  }, [updateDateRange]);

  const handleDateShift = useCallback((direction) => {
    const { startDate, endDate } = shiftDateRange(
      selectedDate.startDate,
      selectedDate.endDate,
      direction
    );
    setSelectedDate({ startDate, endDate });
    setSelectedDateOption("사용자 지정");
  }, [selectedDate.startDate, selectedDate.endDate, setSelectedDate]);

  const DatePickerHandler = useCallback(() => {
    setDatePickerStatus(prev => !prev);
    setIsDateDropdownOpen(false);
  }, []);

  const handleDatePickerChange = useCallback((update) => {
    setDateRange(update);
    if (update[0] && update[1]) {
      setSelectedDate({
        startDate: update[0],
        endDate: update[1],
      });
      setSelectedDateOption("사용자 지정");
      setDatePickerStatus(false);
    }
  }, [setSelectedDate]);

  useEffect(() => {
    setDateRange([selectedDate.startDate, selectedDate.endDate]);
  }, [selectedDate.startDate, selectedDate.endDate]);

  return (
    <div className="tmWorkStatus_filter">
      {/* 병원 선택 */}
      <CustomDropdown
        selectedValue={selectedHospital}
        options={hospitalList}
        onChange={handleHospitalChange}
        bigDrop={0}
        search={1}
        optionChecked={false}
        ischeckedopen={false}
      />
      {/* 담당자 선택 */}
      <CustomDropdown
        selectedValue={selectedUserId}
        options={userList}
        onChange={handleManagerChange}
        bigDrop={0}
        search={1}
        optionChecked={false}
        ischeckedopen={false}
      />
      {/* 날짜 선택 */}
      <div className="date-filter-section">
        {/* 날짜 기준 선택 */}
        <div className="date-field-filter">
          <div className="custom-select date-field-select" onClick={handleDateFieldDropdownClick}>
            <span>{selectedDateFieldLabel}</span>
            <span className={`dropdown-arrow ${isDateFieldDropdownOpen ? "open" : ""}`}></span>
          </div>
          {isDateFieldDropdownOpen && (
            <ul className="custom-options date-field-options">
              {dateFieldOptions.map((option) => (
                <li
                  key={option.value}
                  onClick={() => handleDateFieldOptionClick(option.value)}
                  className={`option-item ${dateFieldType === option.value ? "selected" : ""}`}
                  title={option.tooltip}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="date-filter-container">
          <div className="date-filter-box">
            <div className="date-filter">
              <div className="custom-select" onClick={handleDateDropdownClick}>
                <FontAwesomeIcon icon={faCalendarAlt} className="calendar-icon" />
                <span>{selectedDateOption}</span>
              </div>
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
                <span className="lineSeper">|</span>
                <div>
                  {formatKoreanDate(selectedDate.startDate)} ~{" "}
                  {formatKoreanDate(selectedDate.endDate)}
                </div>
                <div className="divider large"></div>
              </span>
              <div className="arrow-group">
                <FontAwesomeIcon
                  icon={faChevronLeft}
                  className="arrow-icon"
                  onClick={() => handleDateShift("prev")}
                />
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="arrow-icon"
                  onClick={() => handleDateShift("next")}
                />
              </div>
            </div>
          </div>

          <div className="dateRangePicker-box">
            {datePickerStatus && (
              <DatePicker
                selectsRange={true}
                startDate={dateRange[0]}
                endDate={dateRange[1]}
                onChange={handleDatePickerChange}
                dateFormat="yyyy/MM/dd"
                maxDate={new Date()}
                inline
                locale={ko}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
