import React, {
  useState,
  useEffect,
  useCallback,
} from "react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";

import "./DateRangePicker.css";

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
      if (closePicker) {
        closePicker();
      }
    }
  }, [setCustomDateRange, closePicker]);

  return (
    <div className="workstatus-date-picker">
      <DatePicker
        selectsRange={true}
        startDate={dateRange[0]}
        endDate={dateRange[1]}
        onChange={handleChange}
        dateFormat="yyyy/MM/dd"
        maxDate={new Date()}
        inline
        locale={ko}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
      />
    </div>
  );
});

export default DateRangePicker;
