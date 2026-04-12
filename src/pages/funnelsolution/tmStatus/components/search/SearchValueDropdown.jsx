import React, { useMemo, useCallback } from "react";
import Dropdown from "../common/Dropdown";

const SearchValueDropdown = React.memo(({
  searchField,
  searchKeyword,
  handleDropdownChange,
  handleSearch,
  setHasActiveSearch,
  advertisingCompanyList = [],
}) => {
  const dropdownOptions = useMemo(() => {
    const optionsMap = {
      call_history: [
        { id: "", name: "콜내역 선택" },
        { id: "예약", name: "예약" },
        { id: "부재", name: "부재" },
        { id: "무효디비", name: "무효디비" },
        { id: "취소요청", name: "취소요청" },
        { id: "당일재통화", name: "당일재통화" },
        { id: "재통화요청", name: "재통화요청" },
        { id: "본인연락", name: "본인연락" },
        { id: "중복", name: "중복" },
        { id: "치과전달", name: "치과전달" },
        { id: "장기부재", name: "장기부재" },
        { id: "잠재고객", name: "잠재고객" },
        { id: "구환", name: "구환" },
        { id: "재예약", name: "재예약" },
      ],
      visit_status: [
        { id: "", name: "방문상태 선택" },
        { id: "결제", name: "결제" },
        { id: "상담", name: "상담" },
        { id: "노쇼", name: "노쇼" },
        { id: "재통화요청", name: "재통화요청" },
        { id: "개인일정취소", name: "개인일정취소" },
        { id: "상담종료", name: "상담종료" },
      ],
      advertising_company_name: [
        { id: "", name: "매체 선택" },
        ...advertisingCompanyList.map(company => ({
          id: company.name,
          name: company.name
        }))
      ]
    };

    return optionsMap[searchField] || [];
  }, [searchField, advertisingCompanyList]);

  const handleDropdownChangeWithSearch = useCallback((value) => {
    handleDropdownChange(value);

    if (handleSearch && (value || ["call_history", "visit_status", "advertising_company_name"].includes(searchField))) {
      handleSearch(1, value);
    }
  }, [handleDropdownChange, handleSearch, searchField]);

  return (
    <Dropdown
      label="searchValueDropdown"
      selectedValue={searchKeyword}
      setSelectedValue={handleDropdownChangeWithSearch}
      dataList={dropdownOptions}
      placeholder="옵션 선택"
    />
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.searchField === nextProps.searchField &&
    prevProps.advertisingCompanyList === nextProps.advertisingCompanyList &&
    prevProps.searchKeyword === nextProps.searchKeyword
  );
});

export default SearchValueDropdown;
