import React, { useState, useRef, useEffect } from "react";
import CustomSelect from "../../../../components/ui/CustomSelect";
import "./SearchFilterPanel.css";

// 검색 가능한 Select 컴포넌트 (SearchFilterPanel 전용)
function SearchableSelect({
  options = [],
  selectedValues = [],
  onSelectionChange,
  placeholder = "선택하세요",
  multiple = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const selectRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) {
      const selected = options.find(opt => opt.id === selectedValues[0] || opt.name === selectedValues[0]);
      return selected ? selected.name : placeholder;
    }
    const firstOption = options.find(opt => opt.id === selectedValues[0] || opt.name === selectedValues[0]);
    const firstName = firstOption ? firstOption.name : selectedValues[0];
    return `${firstName} 외 ${selectedValues.length - 1}개`;
  };

  const handleSelect = (option) => {
    const value = option.id || option.name;
    if (multiple) {
      const newSelection = selectedValues.includes(value)
        ? selectedValues.filter(item => item !== value)
        : [...selectedValues, value];
      onSelectionChange(newSelection);
    } else {
      onSelectionChange([value]);
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  return (
    <div ref={selectRef} className="searchable-select">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="searchable-select-trigger"
      >
        <span className={selectedValues.length > 0 ? "searchable-select-trigger-text" : "searchable-select-trigger-text placeholder"}>
          {getDisplayText()}
        </span>
        <span className="searchable-select-trigger-arrow">▼</span>
      </div>

      {isOpen && (
        <div className="searchable-select-dropdown">
          <div className="searchable-select-search">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="검색..."
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="searchable-select-options">
            {filteredOptions.length === 0 ? (
              <div className="searchable-select-no-result">
                No search results
              </div>
            ) : (
              filteredOptions.map((option) => {
                const value = option.id || option.name;
                const isSelected = selectedValues.includes(value);
                return (
                  <div
                    key={option.id || option.name}
                    onClick={() => handleSelect(option)}
                    className={`searchable-select-option ${isSelected ? 'selected' : ''}`}
                  >
                    {multiple && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        readOnly
                        className="searchable-select-checkbox"
                      />
                    )}
                    <span className="searchable-select-option-label">{option.name}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const SearchFilterPanel = ({
  activeTab,
  userRole,
  onSearchChange,
  productOptions = [],
  channelOptions = [],
  onLoadChildChannels = null,
  childChannelOptions = []
}) => {
  // 각 탭별 검색 상태
  const [searchFilters, setSearchFilters] = useState({
    code: {
      textSearch: "",
      selectedProducts: [],
      selectedChannels: [],
    },
    product: {
      selectedProducts: [],
    },
    boxPrice: {
      selectedProducts: [],
      selectedChannels: [],
    },
  });

  // 탭 변경 시 검색값 초기화
  useEffect(() => {
    const defaultFilters = {
      code: {
        textSearch: "",
        selectedProducts: [],
        selectedChannels: [],
      },
      product: {
        selectedProducts: [],
      },
      boxPrice: {
        selectedProducts: [],
        selectedChannels: [],
      },
    };

    setSearchFilters(defaultFilters);
  }, [activeTab]);


  // 현재 탭의 검색 필터 가져오기
  const currentFilters = searchFilters[activeTab] || {};

  // 검색 필터 업데이트 (검색 버튼 클릭 시에만 실제 검색 실행)
  const updateFilter = (key, value) => {
    const newFilters = {
      ...searchFilters,
      [activeTab]: {
        ...currentFilters,
        [key]: value,
      },
    };
    setSearchFilters(newFilters);
  };

  // 검색 초기화
  const resetFilters = () => {
    const defaultFilters = {
      code: {
        textSearch: "",
        selectedProducts: [],
        selectedChannels: [],
      },
      product: {
        selectedProducts: [],
      },
      boxPrice: {
        selectedProducts: [],
        selectedChannels: [],
      },
    };

    setSearchFilters(defaultFilters);
    if (onSearchChange) {
      onSearchChange(activeTab, defaultFilters[activeTab]);
    }
  };

  return (
    <div className="filter-box">
      {/* 코드등록 탭 필터 */}
      {activeTab === "code" && (
        <>
          <div className="filter-field">
            <label>코드</label>
            <input
              type="text"
              className="filter-input"
              placeholder="코드명 입력..."
              value={currentFilters.textSearch || ""}
              onChange={(e) => updateFilter("textSearch", e.target.value)}
            />
          </div>

          <div className="filter-field">
            <label>제품</label>
            <SearchableSelect
              options={productOptions}
              selectedValues={currentFilters.selectedProducts || []}
              onSelectionChange={(values) =>
                updateFilter("selectedProducts", values)
              }
              placeholder="제품 선택 (전체)"
              multiple={true}
            />
          </div>

          <div className="filter-field">
            <label>파일 판매처명</label>
            <SearchableSelect
              options={childChannelOptions}
              selectedValues={currentFilters.selectedChannels || []}
              onSelectionChange={(values) =>
                updateFilter("selectedChannels", values)
              }
              placeholder="파일 판매처명 선택 (전체)"
              multiple={true}
            />
          </div>
        </>
      )}

      {/* 제품등록 탭 필터 */}
      {activeTab === "product" && (
        <>
          <div className="filter-field">
            <label>제품명</label>
            <SearchableSelect
              options={productOptions}
              selectedValues={currentFilters.selectedProducts || []}
              onSelectionChange={(values) =>
                updateFilter("selectedProducts", values)
              }
              placeholder="제품 선택 (전체)"
              multiple={true}
            />
          </div>
        </>
      )}

      {/* 박스별 가격 탭 필터 */}
      {activeTab === "boxPrice" && (
        <>
          <div className="filter-field">
            <label>제품</label>
            <SearchableSelect
              options={productOptions}
              selectedValues={currentFilters.selectedProducts || []}
              onSelectionChange={(values) =>
                updateFilter("selectedProducts", values)
              }
              placeholder="제품 선택 (전체)"
              multiple={true}
            />
          </div>

          <div className="filter-field">
            <label>파일 판매처명</label>
            <SearchableSelect
              options={childChannelOptions}
              selectedValues={currentFilters.selectedChannels || []}
              onSelectionChange={(values) =>
                updateFilter("selectedChannels", values)
              }
              placeholder="파일 판매처명 선택 (전체)"
              multiple={true}
            />
          </div>

          {/* <div className="filter-field">
            <label title="지불하는 금액">수수료</label>
            <input
              type="number"
              className="filter-input range-input"
              placeholder="최소"
              value={currentFilters.feeRange?.min || ""}
              onChange={(e) =>
                updateFilter("feeRange", {
                  ...currentFilters.feeRange,
                  min: e.target.value,
                })
              }
              min="0"
              max="100"
              step="0.1"
            />
            <span className="range-separator">~</span>
            <input
              type="number"
              className="filter-input range-input"
              placeholder="최대"
              value={currentFilters.feeRange?.max || ""}
              onChange={(e) =>
                updateFilter("feeRange", {
                  ...currentFilters.feeRange,
                  max: e.target.value,
                })
              }
              min="0"
              max="100"
              step="0.1"
            />
          </div> */}

          {/* <div className="filter-field">
            <label>가격</label>
            <input
              type="number"
              className="filter-input range-input"
              placeholder="최소"
              value={currentFilters.priceRange?.min || ""}
              onChange={(e) =>
                updateFilter("priceRange", {
                  ...currentFilters.priceRange,
                  min: e.target.value,
                })
              }
              min="0"
            />
            <span className="range-separator">~</span>
            <input
              type="number"
              className="filter-input range-input"
              placeholder="최대"
              value={currentFilters.priceRange?.max || ""}
              onChange={(e) =>
                updateFilter("priceRange", {
                  ...currentFilters.priceRange,
                  max: e.target.value,
                })
              }
              min="0"
            />
          </div> */}
        </>
      )}


      {/* 검색 및 초기화 버튼 */}
      <div className="filter-actions">
        <button className="filter-reset-btn" onClick={resetFilters}>
          검색 초기화
        </button>
        <button
          className="filter-search-btn"
          onClick={() => {
            // 검색 실행 로직
            if (onSearchChange) {
              onSearchChange(activeTab, currentFilters);
            }
          }}
        >
          검색
        </button>
      </div>
    </div>
  );
};

export default SearchFilterPanel;
