import React, { useState, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

function MediaFilter({
  checkedMedias = [],
  setCheckedMedias,
  otherCheckedMedias = [],
  mediaOptions = [],
  mediaInput = "",
  setMediaInput,
  filterType, // "main" 또는 "sub"
}) {
  const filteredMediaOptions = useMemo(() => mediaOptions.filter(
    (media) =>
      media &&
      typeof media.name === "string" &&
      media.name.toLowerCase().includes(mediaInput.toLowerCase())
  ), [mediaOptions, mediaInput]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleDropdownClick = useCallback((e) => {
    e.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
  }, []);

  const handleCheckboxChange = useCallback((id) => {
    setCheckedMedias((prev = []) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  }, [setCheckedMedias]);

  return (
    <div className="company-filter">
      <div className="company-custom-select" onClick={handleDropdownClick}>
        <div>
          {filterType === "main"
            ? "DB 광고 실적 조회할 매체를 선택하세요"
            : "노출 외 기타 광고 실적 조회할 매체를 선택하세요"}
        </div>
        <FontAwesomeIcon icon={faChevronDown} className="dropdown-icon" />
      </div>

      {isDropdownOpen && (
        <ul className="custom-options">
          {filteredMediaOptions.map((media, index) => {
            const isChecked = checkedMedias.includes(media.id);
            const isDisabled = otherCheckedMedias.includes(media.id);

            return (
              <li
                key={index}
                className={`option-item ${isChecked ? "selected" : ""} ${
                  isDisabled ? "disabled" : ""
                }`}
                onClick={() => {
                  if (!isDisabled) {
                    handleCheckboxChange(media.id);
                  }
                }}
              >
                <input
                  className="mediaCheckBox"
                  type="checkbox"
                  checked={isChecked}
                  disabled={isDisabled}
                  readOnly
                />
                <span>{media.name}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default React.memo(MediaFilter);
