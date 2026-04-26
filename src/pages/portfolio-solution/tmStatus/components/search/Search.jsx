import React, { useCallback, useMemo, useState } from "react";

import SearchFieldDropdown from "./SearchFieldDropdown";
import SearchValueDropdown from "./SearchValueDropdown";
import SearchInputContainer from "./SearchInputContainer";

import { getAdvertisingCompaniesTm } from "@/data/portfolio-solution/mockService";

import "./Search.css";

const Search = ({
  searchField,
  setSearchField,
  searchKeyword,
  setSearchKeyword,
  searchDateTime,
  setSearchDateTime,
  searchDateRange,
  setSearchDateRange,
  searchList,
  handleSearch,
  setHasActiveSearch,
}) => {
  // 포트폴리오: mockService에서 매체 목록 가져오기
  const [advertisingCompanyList] = useState(() => getAdvertisingCompaniesTm());

  const currentSearchField = useMemo(() => {
    return searchList.find(item => item.id === searchField);
  }, [searchList, searchField]);

  const searchConfig = useMemo(() => ({
    showOptionDropdown: currentSearchField?.type === "select",
    searchInputType: currentSearchField?.type || null,
  }), [currentSearchField?.type]);

  const handleDropdownChange = useCallback((value) => {
    setSearchKeyword(value);
  }, [setSearchKeyword]);

  return (
    <div className="searchBox">
      <SearchFieldDropdown
        searchField={searchField}
        setSearchField={setSearchField}
        searchList={searchList}
      />

      {searchConfig.showOptionDropdown && (
        <SearchValueDropdown
          searchField={searchField}
          searchKeyword={searchKeyword}
          handleDropdownChange={handleDropdownChange}
          handleSearch={handleSearch}
          setHasActiveSearch={setHasActiveSearch}
          advertisingCompanyList={advertisingCompanyList}
        />
      )}

      {!searchConfig.showOptionDropdown && (
        <SearchInputContainer
          searchField={searchField}
          searchInputType={searchConfig.searchInputType}
          searchKeyword={searchKeyword}
          setSearchKeyword={setSearchKeyword}
          setSearchDateTime={setSearchDateTime}
          searchDateRange={searchDateRange}
          setSearchDateRange={setSearchDateRange}
          handleSearch={handleSearch}
        />
      )}
    </div>
  );
};

export default Search;
