import React, {
  useState,
  useEffect,
  useCallback,
} from "react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";

import "./DateTimePicker.css";

const DateTimePicker = React.memo(({
  selectedDateTime,
  onDateTimeChange,
  closePicker,
}) => {
  const [dateTime, setDateTime] = useState(
    selectedDateTime ? new Date(selectedDateTime) : new Date()
  );

  useEffect(() => {
    if (selectedDateTime) {
      setDateTime(new Date(selectedDateTime));
    }
  }, [selectedDateTime]);

  const handleChange = useCallback((date) => {
    setDateTime(date);

    if (onDateTimeChange) {
      onDateTimeChange(date);
    }

    if (closePicker) {
      closePicker();
    }
  }, [onDateTimeChange, closePicker]);

  return (
    <div className="workstatus-datetime-picker">
      <DatePicker
        selected={dateTime}
        onChange={handleChange}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        dateFormat="yyyy/MM/dd HH:mm"
        timeCaption="시간"
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

export default DateTimePicker;
