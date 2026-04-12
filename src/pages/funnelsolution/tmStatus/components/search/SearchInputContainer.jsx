import React, { useCallback } from "react";

const SearchInputContainer = React.memo(({
  searchField,
  searchInputType,
  searchKeyword,
  setSearchKeyword,
  setSearchDateTime,
  searchDateRange,
  setSearchDateRange,
  handleSearch,
}) => {
  const handleKeywordChange = useCallback((e) => {
    setSearchKeyword(e.target.value);
  }, [setSearchKeyword]);

  const handlePhoneChange = useCallback((e) => {
    setSearchKeyword(e.target.value.replace(/[^0-9]/g, ''));
  }, [setSearchKeyword]);

  const handleDateChange = useCallback((e) => {
    const dateValue = e.target.value;
    setSearchDateTime(dateValue ? new Date(dateValue) : null);
    setSearchKeyword(dateValue);
  }, [setSearchDateTime, setSearchKeyword]);

  const handleDateRangeChange = useCallback((field, value) => {
    setSearchDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  }, [setSearchDateRange]);

  const handleSearchClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    handleSearch();
  }, [handleSearch]);

  return (
    <div className="input-container">
      {searchInputType === "text" && (
        <input
          type={searchField === "phone_or_reserver" ? "tel" : "text"}
          value={searchKeyword}
          onChange={searchField === "phone_or_reserver" ? handlePhoneChange : handleKeywordChange}
          placeholder="검색어 입력"
        />
      )}

      {searchInputType === "datetime" && (
        <input
          type="date"
          value={searchKeyword}
          onChange={handleDateChange}
          placeholder="날짜 선택"
        />
      )}

      {searchInputType === "daterange" && (
        <>
          <input
            type="date"
            value={searchDateRange.startDate}
            onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
            placeholder="시작날짜"
          />
          <span>~</span>
          <input
            type="date"
            value={searchDateRange.endDate}
            onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
            placeholder="종료날짜"
          />
        </>
      )}

      <button type="button" onClick={handleSearchClick}>검색</button>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.searchInputType === nextProps.searchInputType &&
    prevProps.searchKeyword === nextProps.searchKeyword &&
    prevProps.searchDateRange?.startDate === nextProps.searchDateRange?.startDate &&
    prevProps.searchDateRange?.endDate === nextProps.searchDateRange?.endDate
  );
});

export default SearchInputContainer;
