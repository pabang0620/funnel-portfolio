// 1. React 및 React 내장 훅 (가장 먼저 로드)
import React, { useState, useEffect, useCallback } from "react";

// 2. 외부 라이브러리
import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";

// 3. CSS
import "react-datepicker/dist/react-datepicker.css";

// 날짜 범위 선택 컴포넌트
const DateRangePicker = React.memo(({
  customDateRange,
  setCustomDateRange,
  closePicker,
}) => {
  const [dateRange, setDateRange] = useState([
    new Date(customDateRange.startDate),
    new Date(customDateRange.endDate),
  ]);

  useEffect(() => {
    setDateRange([
      new Date(customDateRange.startDate),
      new Date(customDateRange.endDate),
    ]);
  }, [customDateRange.startDate, customDateRange.endDate]);

  const handleChange = useCallback((update) => {
    setDateRange(update);
    if (update[0] && update[1]) {
      setCustomDateRange({
        startDate: update[0],
        endDate: update[1],
      });
      closePicker();
    }
  }, [setCustomDateRange, closePicker]);

  return (
    <DatePicker
      selectsRange={true}
      startDate={dateRange[0]}
      endDate={dateRange[1]}
      onChange={handleChange}
      dateFormat="yyyy/MM/dd"
      maxDate={new Date()}
      inline
      locale={ko}
    />
  );
});

export default DateRangePicker;
