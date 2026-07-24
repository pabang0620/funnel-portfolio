import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronRight, faSearch, faTimes, faStar as faSolidStar } from "@fortawesome/free-solid-svg-icons";
// @fortawesome/free-regular-svg-icons not available - using inline SVG for outline star
const StarOutlineIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="1em" height="1em" fill="currentColor">
    <path d="M287.9 0c9.2 0 17.6 5.2 21.6 13.5l68.6 141.3 153.2 22.6c9 1.3 16.5 7.6 19.3 16.3s.5 18.1-5.9 24.5L437.5 328.4l26.2 155.6c1.5 9-2.2 18.1-9.7 23.5s-17.3 6-25.3 1.7l-137-73.2-137 73.2c-8 4.3-17.9 3.7-25.3-1.7s-11.2-14.5-9.7-23.5l26.2-155.6L31.2 218.2c-6.5-6.4-8.7-15.9-5.9-24.5s10.3-14.9 19.3-16.3l153.2-22.6L266.3 13.5C270.4 5.2 278.7 0 287.9 0zm0 79L235.4 187.2c-3.5 7.1-10.2 12.1-18.1 13.3L99 217.9l85.9 85.1c5.5 5.5 8.1 13.3 6.8 21L171.4 443.7l105.2-56.2c7.1-3.8 15.6-3.8 22.6 0l105.2 56.2-20.3-120.7c-1.3-7.7 1.2-15.5 6.8-21l85.9-85.1-118.3-17.5c-7.9-1.2-14.6-6.1-18.1-13.3L287.9 79z"/>
  </svg>
);
import "./CustomSelect.css";

const CustomSelect = ({
  options = [],
  selectedValues = [],
  onSelectionChange,
  placeholder = "선택하십시오",
  multiple = true,
  label = "",
  horizontal = false,
  alwaysShowPlaceholder = false,
  specialOptions = null, // { optionName: [values to select] } 형식
  globalSpecialOptions = ["전체", "간소화"], // 맨 위에 분리해서 표시할 특수 옵션들
  useIdAsValue = false, // true면 ID로 값 관리, false면 기존 이름 방식
  groupByParent = false, // true면 부모별로 그룹화해서 표시
  disabled = false, // true면 선택 불가능
  collapsible = false, // true면 부모-자식 관계를 펼치기/접기 가능하도록
  searchable = false, // true면 검색 기능 활성화
  enableFavorites = false, // true면 즐겨찾기 기능 활성화
  favoriteItems = [], // 즐겨찾기된 항목들의 ID 배열
  onToggleFavorite = null // 즐겨찾기 토글 함수
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  const [expandedParents, setExpandedParents] = useState(new Set()); // 펼쳐진 부모 항목 ID 관리
  const [searchQuery, setSearchQuery] = useState(""); // 입력 중인 검색어
  const [appliedSearchQuery, setAppliedSearchQuery] = useState(""); // 실제 적용된 검색어
  const searchInputRef = useRef(null); // 검색 입력 필드 ref
  const [isComposing, setIsComposing] = useState(false); // 한글 입력 중 여부

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery(""); // 드롭다운 닫을 때 입력 중인 검색어 초기화
        setAppliedSearchQuery(""); // 적용된 검색어도 초기화
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // 드롭다운이 열릴 때 검색 입력 필드에 포커스
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, searchable]);

  // 값 추출 함수: useIdAsValue가 true면 id, false면 name 반환
  const getOptionValue = (option) => {
    return useIdAsValue ? option.id : option.name;
  };

  const handleCheckboxChange = (option) => {
    const value = getOptionValue(option);

    // collapsible 모드에서 부모 항목 처리
    if (collapsible && option.isParent && option.childIds && option.childIds.length > 0) {
      const childIds = option.childIds;
      const allChildrenSelected = childIds.every(childId => selectedValues.includes(childId));

      // 자동으로 펼치기
      setExpandedParents(prev => new Set([...prev, option.id]));

      if (allChildrenSelected) {
        // 모든 자식이 선택되어 있으면 부모 + 자식 모두 해제
        const newSelection = selectedValues.filter(val =>
          val !== value && !childIds.includes(val)
        );
        onSelectionChange(newSelection);
      } else {
        // 일부만 선택되어 있거나 없으면 부모 + 자식 모두 선택
        const newSelection = [...new Set([...selectedValues, value, ...childIds])];
        onSelectionChange(newSelection);
      }
      return;
    }

    // collapsible 모드에서 자식 항목 처리
    if (collapsible && option.isChild && option.parentId) {
      const isCurrentlySelected = selectedValues.includes(value);
      let newSelection;

      if (isCurrentlySelected) {
        // 자식 해제 → 부모도 해제
        newSelection = selectedValues.filter(val => val !== value && val !== option.parentId);
      } else {
        // 자식 선택
        newSelection = [...selectedValues, value];

        // 모든 형제가 선택되었는지 확인
        const parentOption = options.find(opt => opt.id === option.parentId);
        if (parentOption && parentOption.childIds) {
          const allSiblingsSelected = parentOption.childIds.every(siblingId =>
            newSelection.includes(siblingId)
          );
          // 모든 형제가 선택되었으면 부모도 선택
          if (allSiblingsSelected && !newSelection.includes(option.parentId)) {
            newSelection.push(option.parentId);
          }
        }
      }

      onSelectionChange(newSelection);
      return;
    }

    // 특수 옵션 처리 (specialOptions에 해당 옵션이 있는 경우)
    if (specialOptions && specialOptions[option.name]) {
      const requiredValues = specialOptions[option.name];

      // "전체", "간소화", "자사", "대행" 옵션: 상호 배타적 선택
      if (option.name === "전체" || option.name === "간소화" || option.name === "자사" || option.name === "대행") {
        const isCurrentSelected = requiredValues.length > 0 &&
                                  requiredValues.every(val => selectedValues.includes(val)) &&
                                  selectedValues.length === requiredValues.length;
        if (isCurrentSelected) {
          // 이미 선택되어 있으면 해제
          onSelectionChange([]);
        } else {
          // 선택되지 않았으면 해당 옵션의 값들로 교체 (상호 배타적)
          // 빈 배열이어도 선택 상태 유지 (대행 제품이 없는 경우 등)
          onSelectionChange(requiredValues);
        }
        return;
      }

      // 부모 매체 옵션: 토글 방식 (기존 선택에 추가/제거)
      const allChildrenSelected = requiredValues.every(val => selectedValues.includes(val));

      if (allChildrenSelected) {
        // 모든 자식이 선택되어 있으면 해당 자식들만 제거
        const newSelection = selectedValues.filter(val => !requiredValues.includes(val));
        onSelectionChange(newSelection);
      } else {
        // 일부만 선택되어 있거나 없으면 해당 자식들 추가
        const newSelection = [...new Set([...selectedValues, ...requiredValues])];
        onSelectionChange(newSelection);
      }
      return;
    }

    if (multiple) {
      let newSelection = selectedValues.includes(value)
        ? selectedValues.filter(item => item !== value)
        : [...selectedValues, value];

      // 선택 후 options의 원래 순서대로 정렬 (열 순서 유지)
      if (!selectedValues.includes(value)) {
        const optionOrder = options.map(opt => getOptionValue(opt));
        newSelection = newSelection.sort((a, b) => {
          const indexA = optionOrder.indexOf(a);
          const indexB = optionOrder.indexOf(b);
          return indexA - indexB;
        });
      }

      onSelectionChange(newSelection);
    } else {
      onSelectionChange([value]);
      setIsOpen(false);
    }
  };

  // 부모 항목 펼치기/접기 토글
  const toggleParent = (parentId) => {
    const newExpanded = new Set(expandedParents);
    if (newExpanded.has(parentId)) {
      newExpanded.delete(parentId);
    } else {
      newExpanded.add(parentId);
    }
    setExpandedParents(newExpanded);
  };

  // appliedSearchQuery 변경 시 expandedParents 업데이트 (렌더링 외부에서)
  useEffect(() => {
    if (!appliedSearchQuery.trim() || !collapsible) return;

    const query = appliedSearchQuery.toLowerCase();
    const parentIds = new Set();

    options.forEach(option => {
      const name = option.name?.toLowerCase() || "";
      const parentName = option.parentName?.toLowerCase() || "";

      // 매칭된 자식의 부모 ID 수집
      if ((name.includes(query) || parentName.includes(query)) && option.parentId) {
        parentIds.add(option.parentId);
      }
    });

    if (parentIds.size > 0) {
      setExpandedParents(new Set(parentIds));
    }
  }, [appliedSearchQuery, collapsible, options]);

  // 검색어로 옵션 필터링
  const filterOptions = (opts) => {
    if (!appliedSearchQuery.trim()) return opts;

    const query = appliedSearchQuery.toLowerCase();
    const filtered = new Set();
    const parentIds = new Set();

    opts.forEach(option => {
      const name = option.name?.toLowerCase() || "";
      const parentName = option.parentName?.toLowerCase() || "";

      // 옵션 이름 또는 부모 이름에 검색어가 포함되면 추가
      if (name.includes(query) || parentName.includes(query)) {
        // ID가 있는 경우에만 추가 (안전성)
        if (option.id !== undefined && option.id !== null) {
          filtered.add(option.id);
        }

        // 자식이 매칭되면 부모도 포함
        if (option.parentId !== undefined && option.parentId !== null) {
          parentIds.add(option.parentId);
        }
      }
    });

    // 부모 ID도 필터링 결과에 포함
    parentIds.forEach(id => filtered.add(id));

    return opts.filter(opt => opt.id !== undefined && opt.id !== null && filtered.has(opt.id));
  };

  // 즐겨찾기 토글 핸들러
  const handleFavoriteToggle = (e, optionId) => {
    e.stopPropagation(); // 체크박스 클릭 이벤트 전파 방지
    if (onToggleFavorite) {
      onToggleFavorite(optionId);
    }
  };

  // 즐겨찾기 항목과 일반 항목 분리
  const separateFavorites = (opts) => {
    if (!enableFavorites) return { favorites: [], regular: opts };

    const favorites = [];
    const regular = [];

    opts.forEach(opt => {
      // 특수 옵션 (전체, 간소화 등)은 즐겨찾기 대상에서 제외
      if (globalSpecialOptions.includes(opt.name)) {
        regular.push(opt);
      } else if (favoriteItems.includes(opt.id)) {
        favorites.push(opt);
      } else {
        regular.push(opt);
      }
    });

    return { favorites, regular };
  };

  // 체크 상태 계산 함수
  const isOptionChecked = (option) => {
    const value = getOptionValue(option);

    // 선택된 값에 해당 값이 직접 포함된 경우
    if (selectedValues.includes(value)) {
      return true;
    }

    // 특수 옵션인 경우: 해당 특수 옵션의 모든 항목이 선택되어 있는지 확인
    if (specialOptions && specialOptions[option.name]) {
      const requiredValues = specialOptions[option.name];

      // "전체", "간소화", "자사", "대행" 옵션: 모든 값이 선택되어 있고 개수도 일치해야 함
      if (option.name === "전체" || option.name === "간소화" || option.name === "자사" || option.name === "대행") {
        // 빈 배열인 경우 (대행 제품이 없는 경우 등): selectedValues도 빈 배열이면 체크
        if (requiredValues.length === 0) {
          return selectedValues.length === 0;
        }
        return requiredValues.every(val => selectedValues.includes(val)) &&
               selectedValues.length === requiredValues.length;
      }

      // 부모 매체 옵션: 자식들이 모두 선택되어 있으면 체크
      // useIdAsValue일 때는 value(ID)로, 아닐 때는 이름으로 필터링
      const selfValue = useIdAsValue ? option.id : option.name;
      const childValues = requiredValues.filter(val => val !== selfValue);
      if (childValues.length > 0) {
        return childValues.every(val => selectedValues.includes(val));
      }
    }

    return false;
  };

  // ID로 이름 조회 함수 (자식 매체일 경우 부모 이름도 포함)
  const getNameById = (id) => {
    const option = options.find(opt => opt.id === id);
    if (!option) return String(id);
    // 자식 매체이고 parentName이 있으면 함께 표시
    if (option.isChild && option.parentName) {
      return `${option.parentName} - ${option.name}`;
    }
    return option.name;
  };

  // 선택된 값을 표시용 텍스트로 변환
  const getDisplayValue = (value) => {
    if (useIdAsValue) {
      return getNameById(value);
    }
    return value;
  };

  const getDisplayText = () => {
    if (alwaysShowPlaceholder) return placeholder;
    if (selectedValues.length === 0) return placeholder;

    // 특수 옵션 체크: 선택된 값들이 특수 옵션과 일치하는지 확인 (useIdAsValue가 false일 때만)
    if (!useIdAsValue && specialOptions) {
      for (const [optionName, optionValues] of Object.entries(specialOptions)) {
        // 정렬해서 비교
        const sortedSelected = [...selectedValues].sort();
        const sortedOption = [...optionValues].sort();

        if (sortedSelected.length === sortedOption.length &&
            sortedSelected.every((val, idx) => val === sortedOption[idx])) {
          // 특수 옵션과 일치하면 특수 옵션 이름 표시
          if (horizontal || (!horizontal && label)) {
            return optionName;
          }
          const prefix = label ? `${label} : ` : "";
          return `${prefix}${optionName}`;
        }
      }
    }

    const displayValue = getDisplayValue(selectedValues[0]);

    if (horizontal || (!horizontal && label)) {
      // horizontal이거나 vertical(label이 별도로 표시됨)일 때는 라벨 없이 값만 표시
      if (selectedValues.length === 1) return displayValue;
      return `${displayValue} 외 ${selectedValues.length - 1}개`;
    }
    const prefix = label ? `${label} : ` : "";
    if (selectedValues.length === 1) return `${prefix}${displayValue}`;
    return `${prefix}${displayValue} 외 ${selectedValues.length - 1}개`;
  };

  if (horizontal && label) {
    // 글로벌 특수 옵션만 분리 (전체, 간소화 등)
    const globalOpts = options.filter(opt => globalSpecialOptions.includes(opt.name));
    const normalOpts = filterOptions(options.filter(opt => !globalSpecialOptions.includes(opt.name)));

    // 즐겨찾기 분리
    const { favorites: favoriteOpts, regular: regularOpts } = separateFavorites(normalOpts);

    return (
      <div className="filter-field horizontal">
        <label>{label}</label>
        <div className={`custom-select ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''} ${enableFavorites ? 'with-favorites' : ''}`} ref={selectRef}>
          <div
            className="custom-select-trigger"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
          >
            <span>{getDisplayText()}</span>
            <FontAwesomeIcon
              icon={faChevronDown}
              className={`select-arrow ${isOpen ? "open" : ""}`}
            />
          </div>
          {isOpen && (
            <div className="custom-options">
              {/* 검색 입력 필드 */}
              {searchable && (
                <div className="search-input-container">
                  <FontAwesomeIcon icon={faSearch} className="search-icon" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="search-input"
                    placeholder="검색 후 Enter..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onCompositionStart={() => setIsComposing(true)}
                    onCompositionEnd={() => setIsComposing(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isComposing) {
                        setAppliedSearchQuery(searchQuery);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {searchQuery && (
                    <FontAwesomeIcon
                      icon={faTimes}
                      className="search-clear"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery("");
                        setAppliedSearchQuery("");
                        searchInputRef.current?.focus();
                      }}
                    />
                  )}
                </div>
              )}
              {!appliedSearchQuery && globalOpts.map((option, index) => (
                <div
                  key={option.id}
                  className={`custom-option ${index === globalOpts.length - 1 && normalOpts.length > 0 ? 'special-option-last' : ''}`}
                  onClick={() => handleCheckboxChange(option)}
                  title={option.name}
                >
                  <input
                    type={multiple ? "checkbox" : "radio"}
                    id={`option-${option.id}`}
                    name={multiple ? undefined : "custom-select"}
                    checked={isOptionChecked(option)}
                    onChange={() => {}}
                    readOnly
                  />
                  <label>
                    {option.name}
                  </label>
                </div>
              ))}
              {normalOpts.length === 0 && appliedSearchQuery ? (
                <div className="no-results">No search results.</div>
              ) : (
                <>
                  {/* 즐겨찾기 항목 */}
                  {!appliedSearchQuery && enableFavorites && favoriteOpts.length > 0 && (
                    <>
                      {favoriteOpts.map((option) => {
                        const isParent = option.isParent === true;
                        const isChild = option.isChild === true;
                        const hasChildren = option.childIds && option.childIds.length > 0;
                        const childCount = hasChildren ? option.childIds.length : 0;
                        const displayText = isChild
                          ? (option.parentName ? `${option.parentName} - ${option.name}` : option.name)
                          : (isParent && hasChildren ? `${option.name} (${childCount})` : option.name);

                        // 즐겨찾기 항목은 접힘 상태와 관계없이 항상 표시

                        return (
                          <div
                            key={option.id}
                            className={`custom-option ${isChild ? 'child-option' : ''} ${isParent ? 'parent-option' : ''} favorite-option`}
                            title={displayText}
                          >
                            <div
                              style={{ display: 'flex', alignItems: 'center', flex: 1, cursor: 'pointer', overflow: 'visible' }}
                              onClick={() => {
                                handleCheckboxChange(option);
                              }}
                            >
                              <input
                                type={multiple ? "checkbox" : "radio"}
                                id={`option-${option.id}`}
                                name={multiple ? undefined : "custom-select"}
                                checked={isOptionChecked(option)}
                                onChange={() => {}}
                                readOnly
                              />
                              <label>
                                {displayText}
                              </label>
                            </div>
                            <FontAwesomeIcon
                              icon={faSolidStar}
                              className="favorite-icon active"
                              onClick={(e) => handleFavoriteToggle(e, option.id)}
                              title="즐겨찾기 해제"
                            />
                          </div>
                        );
                      })}
                      <div className="favorites-divider"></div>
                    </>
                  )}

                  {/* 일반 항목 */}
                  {regularOpts.map((option) => {
                    const isParent = option.isParent === true;
                    const isChild = option.isChild === true;
                    const hasChildren = option.childIds && option.childIds.length > 0;
                    const childCount = hasChildren ? option.childIds.length : 0;
                    const displayText = isChild
                      ? (option.parentName ? `${option.parentName} - ${option.name}` : option.name)
                      : (isParent && hasChildren ? `${option.name} (${childCount})` : option.name);

                    if (collapsible && isChild && option.parentId && !expandedParents.has(option.parentId)) {
                      return null;
                    }

                    return (
                      <div
                        key={option.id}
                        className={`custom-option ${isChild ? 'child-option' : ''} ${isParent ? 'parent-option' : ''}`}
                        title={displayText}
                      >
                        <div
                          style={{ display: 'flex', alignItems: 'center', flex: 1, cursor: 'pointer', overflow: 'visible' }}
                          onClick={() => {
                            // 부모 항목(자식 있음)은 텍스트 클릭 시 펼치기/접기만
                            if (collapsible && isParent && hasChildren) {
                              toggleParent(option.id);
                            } else {
                              // 자식 항목이나 독립 항목은 체크박스 토글
                              handleCheckboxChange(option);
                            }
                          }}
                        >
                          <input
                            type={multiple ? "checkbox" : "radio"}
                            id={`option-${option.id}`}
                            name={multiple ? undefined : "custom-select"}
                            checked={isOptionChecked(option)}
                            onChange={() => {}}
                            onClick={(e) => {
                              // 부모 항목의 체크박스는 별도 처리
                              if (collapsible && isParent && hasChildren) {
                                e.stopPropagation(); // 부모 div의 onClick 방지
                                handleCheckboxChange(option);
                              }
                            }}
                            readOnly
                          />
                          <label>
                            {displayText}
                          </label>
                        </div>
                        {enableFavorites && !globalSpecialOptions.includes(option.name) && (
                          <span
                            className="favorite-icon"
                            onClick={(e) => handleFavoriteToggle(e, option.id)}
                            title="즐겨찾기 추가"
                          ><StarOutlineIcon /></span>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!horizontal && label) {
    // 글로벌 특수 옵션만 분리 (전체, 간소화 등)
    const globalOpts = options.filter(opt => globalSpecialOptions.includes(opt.name));
    const normalOpts = filterOptions(options.filter(opt => !globalSpecialOptions.includes(opt.name)));

    // 즐겨찾기 분리
    const { favorites: favoriteOpts, regular: regularOpts } = separateFavorites(normalOpts);

    return (
      <div className="filter-field vertical">
        <label>{label}</label>
        <div className={`custom-select ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''} ${enableFavorites ? 'with-favorites' : ''}`} ref={selectRef}>
          <div
            className="custom-select-trigger"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
          >
            <span>{getDisplayText()}</span>
            <FontAwesomeIcon
              icon={faChevronDown}
              className={`select-arrow ${isOpen ? "open" : ""}`}
            />
          </div>
          {isOpen && (
            <div className="custom-options">
              {/* 검색 입력 필드 */}
              {searchable && (
                <div className="search-input-container">
                  <FontAwesomeIcon icon={faSearch} className="search-icon" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="search-input"
                    placeholder="검색 후 Enter..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onCompositionStart={() => setIsComposing(true)}
                    onCompositionEnd={() => setIsComposing(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isComposing) {
                        setAppliedSearchQuery(searchQuery);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {searchQuery && (
                    <FontAwesomeIcon
                      icon={faTimes}
                      className="search-clear"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery("");
                        setAppliedSearchQuery("");
                        searchInputRef.current?.focus();
                      }}
                    />
                  )}
                </div>
              )}
              {!appliedSearchQuery && globalOpts.map((option, index) => (
                <div
                  key={option.id}
                  className={`custom-option ${index === globalOpts.length - 1 && normalOpts.length > 0 ? 'special-option-last' : ''}`}
                  onClick={() => handleCheckboxChange(option)}
                  title={option.name}
                >
                  <input
                    type={multiple ? "checkbox" : "radio"}
                    id={`option-${option.id}`}
                    name={multiple ? undefined : "custom-select"}
                    checked={isOptionChecked(option)}
                    onChange={() => {}}
                    readOnly
                  />
                  <label>
                    {option.name}
                  </label>
                </div>
              ))}
              {normalOpts.length === 0 && appliedSearchQuery ? (
                <div className="no-results">No search results.</div>
              ) : (
                <>
                  {/* 즐겨찾기 항목 */}
                  {!appliedSearchQuery && enableFavorites && favoriteOpts.length > 0 && (
                    <>
                      {favoriteOpts.map((option) => {
                        const isParent = option.isParent === true;
                        const isChild = option.isChild === true;
                        const hasChildren = option.childIds && option.childIds.length > 0;
                        const childCount = hasChildren ? option.childIds.length : 0;
                        const displayText = isChild
                          ? (option.parentName ? `${option.parentName} - ${option.name}` : option.name)
                          : (isParent && hasChildren ? `${option.name} (${childCount})` : option.name);

                        // 즐겨찾기 항목은 접힘 상태와 관계없이 항상 표시

                        return (
                          <div
                            key={option.id}
                            className={`custom-option ${isChild ? 'child-option' : ''} ${isParent ? 'parent-option' : ''} favorite-option`}
                            title={displayText}
                          >
                            <div
                              style={{ display: 'flex', alignItems: 'center', flex: 1, cursor: 'pointer', overflow: 'visible' }}
                              onClick={() => {
                                handleCheckboxChange(option);
                              }}
                            >
                              <input
                                type={multiple ? "checkbox" : "radio"}
                                id={`option-${option.id}`}
                                name={multiple ? undefined : "custom-select"}
                                checked={isOptionChecked(option)}
                                onChange={() => {}}
                                readOnly
                              />
                              <label>
                                {displayText}
                              </label>
                            </div>
                            <FontAwesomeIcon
                              icon={faSolidStar}
                              className="favorite-icon active"
                              onClick={(e) => handleFavoriteToggle(e, option.id)}
                              title="즐겨찾기 해제"
                            />
                          </div>
                        );
                      })}
                      <div className="favorites-divider"></div>
                    </>
                  )}

                  {/* 일반 항목 */}
                  {regularOpts.map((option) => {
                    const isParent = option.isParent === true;
                    const isChild = option.isChild === true;
                    const hasChildren = option.childIds && option.childIds.length > 0;
                    const childCount = hasChildren ? option.childIds.length : 0;
                    const displayText = isChild
                      ? (option.parentName ? `${option.parentName} - ${option.name}` : option.name)
                      : (isParent && hasChildren ? `${option.name} (${childCount})` : option.name);

                    if (collapsible && isChild && option.parentId && !expandedParents.has(option.parentId)) {
                      return null;
                    }

                    return (
                      <div
                        key={option.id}
                        className={`custom-option ${isChild ? 'child-option' : ''} ${isParent ? 'parent-option' : ''}`}
                        title={displayText}
                      >
                        <div
                          style={{ display: 'flex', alignItems: 'center', flex: 1, cursor: 'pointer', overflow: 'visible' }}
                          onClick={() => {
                            // 부모 항목(자식 있음)은 텍스트 클릭 시 펼치기/접기만
                            if (collapsible && isParent && hasChildren) {
                              toggleParent(option.id);
                            } else {
                              // 자식 항목이나 독립 항목은 체크박스 토글
                              handleCheckboxChange(option);
                            }
                          }}
                        >
                          <input
                            type={multiple ? "checkbox" : "radio"}
                            id={`option-${option.id}`}
                            name={multiple ? undefined : "custom-select"}
                            checked={isOptionChecked(option)}
                            onChange={() => {}}
                            onClick={(e) => {
                              // 부모 항목의 체크박스는 별도 처리
                              if (collapsible && isParent && hasChildren) {
                                e.stopPropagation(); // 부모 div의 onClick 방지
                                handleCheckboxChange(option);
                              }
                            }}
                            readOnly
                          />
                          <label>
                            {displayText}
                          </label>
                        </div>
                        {enableFavorites && !globalSpecialOptions.includes(option.name) && (
                          <span
                            className="favorite-icon"
                            onClick={(e) => handleFavoriteToggle(e, option.id)}
                            title="즐겨찾기 추가"
                          ><StarOutlineIcon /></span>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 글로벌 특수 옵션만 분리 (전체, 간소화 등)
  const globalOpts = options.filter(opt => globalSpecialOptions.includes(opt.name));
  const normalOpts = filterOptions(options.filter(opt => !globalSpecialOptions.includes(opt.name)));

  // 부모별로 그룹화된 옵션 생성
  const getGroupedOptions = (opts) => {
    if (!groupByParent) return null;

    // 부모별로 그룹화
    const groups = {};
    const orphans = []; // 부모가 없는 항목

    opts.forEach(opt => {
      if (opt.parentId && opt.parentName) {
        if (!groups[opt.parentName]) {
          groups[opt.parentName] = [];
        }
        groups[opt.parentName].push(opt);
      } else {
        orphans.push(opt);
      }
    });

    return { groups, orphans };
  };

  // 그룹화된 옵션 렌더링
  const renderGroupedOptions = (opts) => {
    const grouped = getGroupedOptions(opts);
    if (!grouped) return null;

    const { groups, orphans } = grouped;
    const result = [];

    // 부모가 없는 항목 먼저 렌더링
    orphans.forEach((option, index) => {
      result.push(
        <div
          key={option.id ?? `orphan-${index}`}
          className="custom-option"
          onClick={() => handleCheckboxChange(option)}
          title={option.name}
        >
          <input
            type={multiple ? "checkbox" : "radio"}
            id={`option-${option.id ?? 'null'}`}
            name={multiple ? undefined : "custom-select"}
            checked={isOptionChecked(option)}
            onChange={() => {}}
            readOnly
          />
          <label>
            {option.name}
          </label>
        </div>
      );
    });

    // 부모별 그룹 렌더링
    Object.entries(groups).forEach(([parentName, children]) => {
      // 부모 헤더 (선택 불가)
      result.push(
        <div
          key={`parent-header-${parentName}`}
          className="custom-option parent-header"
          title={parentName}
        >
          <label>
            {parentName}
          </label>
        </div>
      );

      // 자식 항목들
      children.forEach((option, index) => {
        result.push(
          <div
            key={option.id ?? `child-${parentName}-${index}`}
            className="custom-option child-option"
            onClick={() => handleCheckboxChange(option)}
            title={option.name}
          >
            <input
              type={multiple ? "checkbox" : "radio"}
              id={`option-${option.id ?? 'null'}`}
              name={multiple ? undefined : "custom-select"}
              checked={isOptionChecked(option)}
              onChange={() => {}}
              readOnly
            />
            <label>
              {option.name}
            </label>
          </div>
        );
      });
    });

    return result;
  };

  return (
    <div className={`custom-select ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`} ref={selectRef}>
      <div
        className="custom-select-trigger"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
      >
        <span>{getDisplayText()}</span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`select-arrow ${isOpen ? "open" : ""}`}
        />
      </div>
      {isOpen && (
        <div className="custom-options">
          {/* 검색 입력 필드 */}
          {searchable && (
            <div className="search-input-container">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                className="search-input"
                placeholder="검색 후 Enter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isComposing) {
                    setAppliedSearchQuery(searchQuery);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
              {searchQuery && (
                <FontAwesomeIcon
                  icon={faTimes}
                  className="search-clear"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery("");
                    setAppliedSearchQuery("");
                    searchInputRef.current?.focus();
                  }}
                />
              )}
            </div>
          )}
          {!appliedSearchQuery && globalOpts.map((option, index) => (
            <div
              key={option.id ?? `null-${index}`}
              className={`custom-option ${index === globalOpts.length - 1 && normalOpts.length > 0 ? 'special-option-last' : ''}`}
              onClick={() => handleCheckboxChange(option)}
              title={option.name}
            >
              <input
                type={multiple ? "checkbox" : "radio"}
                id={`option-${option.id ?? 'null'}`}
                name={multiple ? undefined : "custom-select"}
                checked={isOptionChecked(option)}
                onChange={() => {}}
                readOnly
              />
              <label>
                {option.name}
              </label>
            </div>
          ))}
          {normalOpts.length === 0 && appliedSearchQuery ? (
            <div className="no-results">No search results.</div>
          ) : groupByParent ? (
            renderGroupedOptions(normalOpts)
          ) : (
            normalOpts.map((option, index) => {
              const isParent = option.isParent === true;
              const isChild = option.isChild === true;
              const hasChildren = option.childIds && option.childIds.length > 0;
              const childCount = hasChildren ? option.childIds.length : 0;
              const displayText = isChild
                ? (option.parentName ? `${option.parentName} - ${option.name}` : option.name)
                : (isParent && hasChildren ? `${option.name} (${childCount})` : option.name);

              // collapsible 모드에서 자식 항목은 부모가 펼쳐진 경우에만 표시
              if (collapsible && isChild && option.parentId && !expandedParents.has(option.parentId)) {
                return null;
              }

              return (
                <div
                  key={option.id ?? `normal-null-${index}`}
                  className={`custom-option ${isChild ? 'child-option' : ''} ${isParent ? 'parent-option' : ''}`}
                  title={displayText}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', flex: 1, cursor: 'pointer', overflow: 'visible' }}
                    onClick={() => {
                      // 부모 항목(자식 있음)은 텍스트 클릭 시 펼치기/접기만
                      if (collapsible && isParent && hasChildren) {
                        toggleParent(option.id);
                      } else {
                        // 자식 항목이나 독립 항목은 체크박스 토글
                        handleCheckboxChange(option);
                      }
                    }}
                  >
                    <input
                      type={multiple ? "checkbox" : "radio"}
                      id={`option-${option.id ?? 'null'}`}
                      name={multiple ? undefined : "custom-select"}
                      checked={isOptionChecked(option)}
                      onChange={() => {}}
                      onClick={(e) => {
                        // 부모 항목의 체크박스는 별도 처리
                        if (collapsible && isParent && hasChildren) {
                          e.stopPropagation(); // 부모 div의 onClick 방지
                          handleCheckboxChange(option);
                        }
                      }}
                      readOnly
                    />
                    <label>
                      {displayText}
                    </label>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
