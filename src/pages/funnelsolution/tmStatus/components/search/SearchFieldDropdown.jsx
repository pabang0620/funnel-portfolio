import React from "react";
import Dropdown from "../common/Dropdown";

const SearchFieldDropdown = React.memo(({
  searchField,
  setSearchField,
  searchList,
}) => {
  return (
    <Dropdown
      label="searchField"
      selectedValue={searchField}
      setSelectedValue={setSearchField}
      dataList={searchList}
      placeholder="검색어 선택"
    />
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.searchList === nextProps.searchList &&
    prevProps.searchField === nextProps.searchField
  );
});

export default SearchFieldDropdown;
