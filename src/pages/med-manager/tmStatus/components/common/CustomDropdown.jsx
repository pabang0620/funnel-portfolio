import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";

import "./CustomDropdown.css";

const CustomDropdown = React.memo(({
  selectedValue,
  options,
  onChange,
  bigDrop,
  search,
  optionChecked,
  ischeckedopen,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [checkedOptions, setCheckedOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (optionChecked) {
      const normalizedSelectedValue = Array.isArray(selectedValue)
        ? selectedValue.map((val) => Number(val))
        : [];
      setCheckedOptions(normalizedSelectedValue);
    } else {
      const currentOption = options.find(
        (option) => option.value === Number(selectedValue)
      );
      if (currentOption) {
        setSelectedOption(currentOption.label);
      }
    }
  }, [selectedValue, options, optionChecked]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCheckboxChange = (value) => {
    let updatedCheckedOptions;
    if (checkedOptions.includes(value)) {
      updatedCheckedOptions = checkedOptions.filter((item) => item !== value);
    } else {
      updatedCheckedOptions = [...checkedOptions, value];
    }
    setCheckedOptions(updatedCheckedOptions);
    onChange(updatedCheckedOptions);
  };

  const handleOptionClick = (option) => {
    if (!optionChecked) {
      setSelectedOption(option.label);
      onChange(String(option.value));
      setIsOpen(false);
    }
  };

  const filteredOptions = useMemo(() =>
    options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    ), [options, searchTerm]);

  const headerText = useMemo(() => {
    if (optionChecked) {
      return checkedOptions.length > 0
        ? options
            .filter((option) => checkedOptions.includes(option.value))
            .map((option) => option.label)
            .join(", ")
        : "선택";
    }
    return selectedOption || "선택";
  }, [optionChecked, checkedOptions, options, selectedOption]);

  return (
    <div
      className={`custom-dropdown ${bigDrop === 1 ? "big-dropdown" : ""}`}
      ref={dropdownRef}
    >
      <div className="custom-dropdown-header" onClick={() => setIsOpen(!isOpen)}>
        {headerText}
        <span className={`custom-dropdown-arrow ${isOpen ? "open" : ""}`}>▼</span>
      </div>

      {isOpen && (
        <div className="custom-dropdown-options">
          {search === 1 && (
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="검색"
              className="custom-dropdown-search"
            />
          )}

          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className={`${
                  bigDrop === 1 ? "custom-dropdown-option-set" : "custom-dropdown-option"
                } ${optionChecked ? "ellipsis" : ""}`}
                onClick={
                  optionChecked
                    ? () => handleCheckboxChange(option.value)
                    : () => handleOptionClick(option)
                }
                style={optionChecked ? { textAlign: "left" } : {}}
              >
                {optionChecked && (
                  <input
                    style={
                      !ischeckedopen
                        ? { height: "12px", width: "12px" }
                        : undefined
                    }
                    className="custom-dropdown-checkbox"
                    type="checkbox"
                    checked={checkedOptions.includes(option.value)}
                    onChange={() => handleCheckboxChange(option.value)}
                  />
                )}
                {option.label}
              </div>
            ))
          ) : (
            <div className="no-options">옵션이 없습니다.</div>
          )}
        </div>
      )}
    </div>
  );
});

export default CustomDropdown;
