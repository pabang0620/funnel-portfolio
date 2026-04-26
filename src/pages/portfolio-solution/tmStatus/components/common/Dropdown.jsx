import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ko from "date-fns/locale/ko";

import "./Dropdown.css";

const Dropdown = React.memo(({
  label,
  selectedValue,
  setSelectedValue,
  fetchData,
  dataList,
  placeholder,
  isDatePicker = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setIsDatePickerOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const calendarIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <rect x="2.5" y="5" width="15" height="12.5" rx="2" stroke="#868686" />
      <path
        d="M2.5 8.33333C2.5 7.08718 2.5 6.4641 2.76795 6C2.94349 5.69596 3.19596 5.44349 3.5 5.26795C3.9641 5 4.58718 5 5.83333 5H14.1667C15.4128 5 16.0359 5 16.5 5.26795C16.804 5.44349 17.0565 5.69596 17.2321 6C17.5 6.4641 17.5 7.08718 17.5 8.33333H2.5Z"
        fill="#868686"
      />
      <path d="M5.83325 2.5L5.83325 5" stroke="#868686" strokeLinecap="round" />
      <path d="M14.1667 2.5L14.1667 5" stroke="#868686" strokeLinecap="round" />
      <rect x="5.83325" y="10" width="3.33333" height="1.66667" rx="0.5" fill="#868686" />
      <rect x="5.83325" y="13.334" width="3.33333" height="1.66667" rx="0.5" fill="#868686" />
      <rect x="10.8333" y="10" width="3.33333" height="1.66667" rx="0.5" fill="#868686" />
      <rect x="10.8333" y="13.334" width="3.33333" height="1.66667" rx="0.5" fill="#868686" />
    </svg>
  );

  const predefinedDateOptions = useMemo(() => [
    { label: "오늘", value: "today", range: [new Date(), new Date()] },
    {
      label: "최근 7일",
      value: "lastWeek",
      range: [
        new Date(new Date().setDate(new Date().getDate() - 7)),
        new Date(),
      ],
    },
    {
      label: "최근 30일",
      value: "lastMonth",
      range: [
        new Date(new Date().setDate(new Date().getDate() - 30)),
        new Date(),
      ],
    },
    {
      label: "어제",
      value: "yesterday",
      range: [
        new Date(new Date().setDate(new Date().getDate() - 1)),
        new Date(new Date().setDate(new Date().getDate() - 1)),
      ],
    },
    {
      label: "전체 기간",
      value: "all",
      range: [new Date("2000-01-01"), new Date()],
    },
  ], []);

  useEffect(() => {
    if (isDatePicker) {
      setDateRange([
        new Date(selectedValue.startDate),
        new Date(selectedValue.endDate),
      ]);
    }
  }, [selectedValue, isDatePicker]);

  const matchDateOption = useCallback((startDate, endDate) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setDate(today.getDate() - 30);

    if (
      startDate.toDateString() === today.toDateString() &&
      endDate.toDateString() === today.toDateString()
    ) {
      return "today";
    }
    if (
      startDate.toDateString() === yesterday.toDateString() &&
      endDate.toDateString() === yesterday.toDateString()
    ) {
      return "yesterday";
    }
    if (
      startDate.toDateString() === lastWeek.toDateString() &&
      endDate.toDateString() === today.toDateString()
    ) {
      return "lastWeek";
    }
    if (
      startDate.toDateString() === lastMonth.toDateString() &&
      endDate.toDateString() === today.toDateString()
    ) {
      return "lastMonth";
    }
    return "custom";
  }, []);

  const formatKoreanDate = useCallback((date) => {
    if (!date || !(date instanceof Date)) return "";
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  }, []);

  const handleDateChange = useCallback((update) => {
    setDateRange(update);

    if (update[0] && update[1]) {
      setSelectedValue({
        startDate: update[0],
        endDate: update[1],
      });
      setIsDropdownOpen(false);
      setIsDatePickerOpen(false);
    }
  }, [setSelectedValue]);

  return (
    <div className={`dropdown-container ${label}`} ref={dropdownRef}>
      <div
        className="dropdown-header"
        onClick={() => {
          if (!isDatePicker && fetchData) fetchData();
          setIsDropdownOpen(!isDropdownOpen);
          setIsDatePickerOpen(false);
        }}
      >
        {label === "date" && calendarIcon}
        {label === "date" && isDatePicker
          ? predefinedDateOptions.find(
              (opt) =>
                opt.value ===
                matchDateOption(selectedValue.startDate, selectedValue.endDate)
            )?.label || "직접 선택"
          : !isDatePicker && selectedValue
          ? dataList.find((item) => item.id === selectedValue)?.name ||
            placeholder
          : placeholder}
        <span className="dropdown-arrow">{isDropdownOpen ? "▲" : "▼"}</span>
      </div>
      {label === "date" && (
        <p
          className="selectedDate"
          onClick={() => {
            setIsDatePickerOpen((prev) => !prev);
            setIsDropdownOpen(false);
          }}
        >
          {`${formatKoreanDate(selectedValue.startDate)} ~ ${formatKoreanDate(
            selectedValue.endDate
          )}`}
        </p>
      )}
      {isDatePickerOpen && (
        <DatePicker
          selectsRange={true}
          startDate={dateRange[0]}
          endDate={dateRange[1]}
          onChange={handleDateChange}
          dateFormat="yyyy/MM/dd"
          locale={ko}
          inline
        />
      )}
      {isDropdownOpen && (
        <div className="dropdown-list">
          {isDatePicker ? (
            <>
              {predefinedDateOptions.map((option) => (
                <div
                  key={option.value}
                  className="dropdown-item"
                  onClick={() => {
                    setSelectedValue({
                      startDate: option.range[0],
                      endDate: option.range[1],
                    });
                    setIsDropdownOpen(false);
                  }}
                >
                  {option.label}
                </div>
              ))}
            </>
          ) : (
            dataList.map((item) => (
              <div
                key={item.id}
                className="dropdown-item"
                onClick={() => {
                  setSelectedValue(item.id);
                  setIsDropdownOpen(false);
                }}
              >
                {item.name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
});

export default Dropdown;
