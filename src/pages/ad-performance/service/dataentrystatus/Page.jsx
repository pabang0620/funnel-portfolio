import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import Breadcrumb from "../../components/Breadcrumb";
import CustomSelect from "../../components/ui/CustomSelect";
import CalendarDateFilter from "../executiveReport/elements/CalendarDateFilter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory } from "@fortawesome/free-solid-svg-icons";
import { getEntryStatusByDateRange } from "./api";
import { getTeamMediaAssignments, getMediaList, getProductList } from "../marketingreport/api";
import { useStickyTableHeader } from "./hooks/useStickyTableHeader";
import "./DataEntryStatus.css";

/**
 * 데이터 입력 현황 페이지
 * 날짜 범위별로 매체별/날짜별 데이터 입력 현황을 표시
 *
 * 테이블 구조:
 * - 행: 날짜
 * - 열(헤더): 매체 (adMedia)
 * - 셀: 해당 날짜 + 매체 조합에 데이터 입력 여부
 */
function DataEntryStatus() {
  const navigate = useNavigate();

  // Sticky 테이블 헤더 활성화
  useStickyTableHeader(null, true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API 데이터 상태
  const [dates, setDates] = useState([]); // 날짜 배열 (행)
  const [adMediaList, setAdMediaList] = useState([]); // 매체 목록 (열)
  const [parentTeams, setParentTeams] = useState([]); // 상위 팀 (team 테이블)
  const [childTeams, setChildTeams] = useState([]); // 하위 팀 (team 테이블)
  const [parentAdMedia, setParentAdMedia] = useState([]); // 부모 매체 (adMedia 테이블)
  const [childMedia, setChildMedia] = useState([]); // 자식 매체 (adMedia 테이블)
  const [products, setProducts] = useState([]);
  const [entryStatus, setEntryStatus] = useState({}); // { "2025-01-15": { 1: true, 2: false } }
  const [summary, setSummary] = useState({ totalCells: 0, enteredCells: 0 });
  const [teamMediaAssignments, setTeamMediaAssignments] = useState({}); // 팀별 mediaIds

  // 필터 옵션용 전체 목록 (마케팅 리포트와 동일)
  const [allMediaOptions, setAllMediaOptions] = useState([]); // 전체 매체 목록
  const [allParentAdMedia, setAllParentAdMedia] = useState([]); // 전체 부모 매체
  const [allChildMedia, setAllChildMedia] = useState([]); // 전체 자식 매체
  const [allProducts, setAllProducts] = useState([]); // 전체 제품 목록

  // 필터 상태
  const [customDateRange, setCustomDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [selectedPeriod, setSelectedPeriod] = useState("어제");
  const [selectedTeamIds, setSelectedTeamIds] = useState([]); // 팀 필터 (빈 배열 = 전체)
  const [selectedAdMediaIds, setSelectedAdMediaIds] = useState([]); // 매체 필터 (빈 배열 = 전체)
  const [selectedProductId, setSelectedProductId] = useState(0); // 제품 필터 (0 = 전체)
  const [productTypeFilters, setProductTypeFilters] = useState({ inHouse: true, agency: true }); // 제품 유형 필터 (자사/대행) - 기본값: 둘 다 체크
  const [entryFilterMode, setEntryFilterMode] = useState("all"); // "all", "entered", "not-entered"

  // 초기 데이터 로드: 팀, 매체, 제품 목록 (마케팅 리포트와 동일)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [teamResponse, mediaResponse, productResponse] = await Promise.all([
          getTeamMediaAssignments(),
          getMediaList(),
          getProductList()
        ]);

        // 팀 매체 할당 정보 + 팀 목록 설정
        if (teamResponse.success && teamResponse.data) {
          const teamsData = teamResponse.data;
          const assignments = {};
          const parentTeamsList = [];
          const childTeamsList = [];

          teamsData.forEach((parentTeam) => {
            // 부모 팀
            parentTeamsList.push({
              id: parentTeam.id,
              name: parentTeam.name,
              parentId: null
            });
            assignments[parentTeam.id] = parentTeam.mediaIds || [];

            // 자식 팀
            if (parentTeam.children && parentTeam.children.length > 0) {
              parentTeam.children.forEach((childTeam) => {
                childTeamsList.push({
                  id: childTeam.id,
                  name: childTeam.name,
                  parentId: parentTeam.id
                });
                assignments[childTeam.id] = childTeam.mediaIds || [];
              });
            }
          });

          setTeamMediaAssignments(assignments);
          setParentTeams(parentTeamsList);
          setChildTeams(childTeamsList);
          console.log('🔍 팀 목록 로드:', {
            parentTeams: parentTeamsList.length,
            childTeams: childTeamsList.length,
            assignments: Object.keys(assignments).length
          });
        }

        // 전체 매체 목록
        if (mediaResponse.data) {
          const allMedia = mediaResponse.data;
          // parentId가 없거나(undefined) null인 경우 부모 매체
          const parentMedia = allMedia.filter(m => !m.parentId);
          const childMedia = allMedia.filter(m => m.parentId);

          console.log('🔍 [초기 로드] 매체 목록:', {
            totalMedia: allMedia.length,
            parentMedia: parentMedia.length,
            childMedia: childMedia.length,
            sampleParent: parentMedia.slice(0, 3).map(m => ({ id: m.id, name: m.name })),
            sampleChild: childMedia.slice(0, 3).map(m => ({ id: m.id, name: m.name, parentId: m.parentId }))
          });

          setAllParentAdMedia(parentMedia);
          setAllChildMedia(childMedia);
        }

        // 전체 제품 목록
        if (productResponse.data) {
          setAllProducts(productResponse.data);
        }
      } catch (error) {
        console.error('초기 데이터 로드 실패:', error);
      }
    };

    loadInitialData();
  }, []);

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      if (!customDateRange.startDate || !customDateRange.endDate) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 선택된 팀의 매체 ID 수집 (마케팅 리포트 방식)
        let allowedMediaIds = [];
        if (selectedTeamIds.length > 0 && Object.keys(teamMediaAssignments).length > 0 && parentTeams.length > 0) {
          const allMediaIds = new Set();

          selectedTeamIds.forEach(teamId => {
            const isParentTeam = parentTeams.some(p => p.id === teamId);

            if (isParentTeam) {
              // 부모 팀: 부모 + 모든 자식 팀의 매체 수집
              const parentMediaIds = teamMediaAssignments[teamId] || [];
              parentMediaIds.forEach(id => allMediaIds.add(id));

              const childTeamIds = childTeams
                .filter(ct => ct.parentId === teamId)
                .map(ct => ct.id);

              childTeamIds.forEach(childId => {
                const childMediaIds = teamMediaAssignments[childId] || [];
                childMediaIds.forEach(id => allMediaIds.add(id));
              });
            } else {
              // 자식 팀: 해당 팀의 매체만
              const teamMediaIds = teamMediaAssignments[teamId] || [];
              teamMediaIds.forEach(id => allMediaIds.add(id));
            }
          });

          allowedMediaIds = Array.from(allMediaIds);
        }

        // 사용자가 추가로 매체를 선택한 경우
        let finalMediaIds = [];
        if (selectedAdMediaIds.length > 0) {
          const childMediaIds = selectedAdMediaIds.filter(id => {
            return allChildMedia.some(m => m.id === id);
          });

          if (allowedMediaIds.length > 0) {
            finalMediaIds = childMediaIds.filter(id => allowedMediaIds.includes(id));
          } else {
            finalMediaIds = childMediaIds;
          }
        } else {
          finalMediaIds = allowedMediaIds;
        }

        const adMediaIdsParam = finalMediaIds.length > 0 ? finalMediaIds.join(',') : null;

        console.log('📊 데이터 입력 현황 필터:', {
          selectedTeamIds,
          allowedMediaIds: allowedMediaIds.slice(0, 10),
          finalMediaIds: finalMediaIds.slice(0, 10)
        });

        const response = await getEntryStatusByDateRange({
          startDate: customDateRange.startDate,
          endDate: customDateRange.endDate,
          teamId: 0,
          adMediaIds: adMediaIdsParam,
          productId: selectedProductId
        });

        if (response.success) {
          setDates(response.data.dates);
          setAdMediaList(response.data.adMediaList);
          setEntryStatus(response.data.entryStatus);
          setSummary(response.data.summary);
          // 팀/매체/제품 목록은 초기 로드에서 가져온 전체 목록 유지
          // (필터 옵션용 - API 응답의 필터링된 목록으로 덮어쓰지 않음)
          setParentAdMedia(response.data.parentAdMedia);
          setChildMedia(response.data.childMedia);
          setProducts(response.data.products);
        }
      } catch (err) {
        console.error("데이터 로드 실패:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [customDateRange, selectedTeamIds, selectedAdMediaIds, selectedProductId, productTypeFilters]);

  // 팀 목록에 parentName과 플래그 추가 (계층 구조 표시용)
  const teamsWithParentName = useMemo(() => {
    const parentMap = new Map();
    parentTeams.forEach(parent => {
      const childIds = childTeams
        .filter(child => child.parentId === parent.id)
        .map(child => child.id);
      parentMap.set(parent.id, { ...parent, isParent: true, childIds });
    });

    return childTeams.map(team => ({
      ...team,
      parentName: parentTeams.find(p => p.id === team.parentId)?.name || '',
      isChild: true
    }));
  }, [childTeams, parentTeams]);

  // 팀 옵션 (부모 + 자식)
  const teamOptions = useMemo(() => {
    const result = [];

    parentTeams.forEach(parent => {
      const childIds = childTeams
        .filter(child => child.parentId === parent.id)
        .map(child => child.id);

      // 부모 항목 추가
      result.push({
        id: parent.id,
        name: parent.name,
        isParent: true,
        childIds
      });

      // 자식 항목들 추가
      childTeams
        .filter(child => child.parentId === parent.id)
        .forEach(child => {
          result.push({
            ...child,
            parentName: parent.name,
            isChild: true
          });
        });
    });

    return result;
  }, [childTeams, parentTeams]);

  // 팀 specialOptions 생성 (부모 팀별 그룹)
  const teamSpecialOptions = useMemo(() => {
    // 자식이 없는 독립 부모 팀 찾기
    const standaloneParentTeams = parentTeams.filter(parent => {
      const hasChildren = childTeams.some(child => child.parentId === parent.id);
      return !hasChildren;
    });

    const options = {
      // "전체": 자식 팀 + 독립 부모 팀
      "전체": [
        ...childTeams.map(t => t.id),
        ...standaloneParentTeams.map(t => t.id)
      ]
    };

    // 각 부모 팀별로 자식 팀 ID 그룹 생성
    parentTeams.forEach(parent => {
      const childIds = childTeams
        .filter(child => child.parentId === parent.id)
        .map(child => child.id);
      if (childIds.length > 0) {
        options[parent.name] = childIds;
      }
    });

    return options;
  }, [childTeams, parentTeams]);

  // 매체 목록에 parentName과 플래그 추가 (계층 구조 표시용)
  const mediaWithParentName = useMemo(() => {
    return childMedia.map(media => ({
      ...media,
      parentName: parentAdMedia.find(p => p.id === media.parentId)?.name || '',
      isChild: true
    }));
  }, [childMedia, parentAdMedia]);

  // 팀 선택에 따라 허용되는 매체 ID 계산
  const allowedMediaIds = useMemo(() => {
    if (selectedTeamIds.length === 0 || Object.keys(teamMediaAssignments).length === 0) {
      return null; // 전체 매체 허용
    }

    const allMediaIds = new Set();

    selectedTeamIds.forEach(teamId => {
      const isParentTeam = parentTeams.some(p => p.id === teamId);

      if (isParentTeam) {
        // 부모 팀: 부모 + 모든 자식 팀의 매체 수집
        const parentMediaIds = teamMediaAssignments[teamId] || [];
        parentMediaIds.forEach(id => allMediaIds.add(id));

        const childTeamIds = childTeams
          .filter(ct => ct.parentId === teamId)
          .map(ct => ct.id);

        childTeamIds.forEach(childId => {
          const childMediaIds = teamMediaAssignments[childId] || [];
          childMediaIds.forEach(id => allMediaIds.add(id));
        });
      } else {
        // 자식 팀: 해당 팀의 매체만
        const teamMediaIds = teamMediaAssignments[teamId] || [];
        teamMediaIds.forEach(id => allMediaIds.add(id));
      }
    });

    return Array.from(allMediaIds);
  }, [selectedTeamIds, teamMediaAssignments, parentTeams, childTeams]);

  // 매체 옵션 (부모 + 자식) - 팀 선택에 따라 필터링
  const mediaOptions = useMemo(() => {
    console.log('🔍 [mediaOptions] 계산 시작:', {
      allParentAdMedia: allParentAdMedia.length,
      allChildMedia: allChildMedia.length,
      allowedMediaIds: allowedMediaIds ? allowedMediaIds.length : 'null (전체)',
      selectedTeamIds: selectedTeamIds.length
    });

    // 팀이 선택된 경우 해당 팀의 매체만 표시
    const filteredParentMedia = allowedMediaIds
      ? allParentAdMedia.filter(parent => {
          const childIds = allChildMedia
            .filter(child => child.parentId === parent.id)
            .map(child => child.id);
          // 부모의 자식 중 하나라도 허용된 매체라면 부모도 표시
          return childIds.some(childId => allowedMediaIds.includes(childId));
        })
      : allParentAdMedia;

    const filteredChildMedia = allowedMediaIds
      ? allChildMedia.filter(child => allowedMediaIds.includes(child.id))
      : allChildMedia;

    console.log('🔍 [mediaOptions] 필터링 후:', {
      filteredParentMedia: filteredParentMedia.length,
      filteredChildMedia: filteredChildMedia.length
    });

    const result = [];

    filteredParentMedia.forEach(parent => {
      const childIds = filteredChildMedia
        .filter(child => child.parentId === parent.id)
        .map(child => child.id);

      // 자식이 있는 경우만 부모 항목 추가
      if (childIds.length > 0) {
        result.push({
          id: parent.id,
          name: parent.name,
          isParent: true,
          childIds
        });

        // 자식 항목들 추가
        filteredChildMedia
          .filter(child => child.parentId === parent.id)
          .forEach(child => {
            result.push({
              ...child,
              parentName: parent.name,
              isChild: true
            });
          });
      }
    });

    console.log('🔍 [mediaOptions] 최종 결과:', {
      resultCount: result.length,
      sampleOptions: result.slice(0, 3).map(r => ({ id: r.id, name: r.name, isParent: r.isParent }))
    });

    return result;
  }, [allChildMedia, allParentAdMedia, allowedMediaIds, selectedTeamIds]);

  // 매체 specialOptions 생성 (부모 매체별 그룹) - 필터링된 목록 사용
  const mediaSpecialOptions = useMemo(() => {
    // mediaOptions에서 자식 매체 ID만 추출
    const filteredChildMediaIds = mediaOptions
      .filter(opt => opt.isChild)
      .map(opt => opt.id);

    const options = {
      "전체": filteredChildMediaIds
    };

    // mediaOptions에서 부모 매체별로 그룹 생성
    mediaOptions
      .filter(opt => opt.isParent && opt.childIds && opt.childIds.length > 0)
      .forEach(parent => {
        options[parent.name] = parent.childIds;
      });

    return options;
  }, [mediaOptions]);

  // 매체 → 팀 매핑
  const mediaToTeamMapping = useMemo(() => {
    const mapping = {};
    Object.entries(teamMediaAssignments).forEach(([teamId, mediaIds]) => {
      (mediaIds || []).forEach(mediaId => {
        if (!mapping[mediaId]) mapping[mediaId] = [];
        mapping[mediaId].push(parseInt(teamId));
      });
    });
    return mapping;
  }, [teamMediaAssignments]);

  // 테이블 셀 클릭 핸들러 - 마케팅 리포트로 이동
  const handleRowClick = (date, mediaId = null) => {
    console.log('============================================');
    console.log('🔍 [데이터 입력현황] 셀 클릭');
    console.log('============================================');
    console.log('📅 클릭한 날짜:', date);
    console.log('📡 클릭한 매체 ID:', mediaId);
    console.log('👥 선택된 팀 IDs:', selectedTeamIds);
    console.log('📡 선택된 매체 IDs:', selectedAdMediaIds);
    console.log('🗺️ 팀-매체 할당:', teamMediaAssignments);

    // 날짜 설정
    const dateRange = {
      startDate: date,
      endDate: date
    };
    localStorage.setItem("marketingReportDateRange", JSON.stringify(dateRange));
    localStorage.setItem("marketingReportPeriod", "사용자지정");

    console.log('💾 localStorage에 저장할 데이터:');
    console.log('  - dateRange:', dateRange);
    console.log('  - selectedAdMediaIds:', selectedAdMediaIds);
    console.log('  - selectedTeamIds:', selectedTeamIds);
    console.log('  - 클릭한 매체 ID:', mediaId);

    // 선택된 매체 ID 배열 전달
    // 셀 클릭 시: 해당 매체만 선택
    // 날짜 셀 클릭 시: 전체 또는 현재 필터된 매체
    let mediaIdsToSave;
    if (mediaId !== null) {
      // 특정 매체 셀 클릭 → 해당 매체만 선택
      mediaIdsToSave = [mediaId];
      console.log('  → 특정 매체 셀 클릭: 매체 ID', mediaId, '만 선택');
    } else {
      // 날짜 셀 클릭 → 빈 배열이면 [0] (전체)
      mediaIdsToSave = selectedAdMediaIds.length > 0 ? selectedAdMediaIds : [0];
      console.log('  → 날짜 셀 클릭: 현재 필터 유지');
    }
    localStorage.setItem("marketingReport_selectedMedia", JSON.stringify(mediaIdsToSave));
    console.log('✅ marketingReport_selectedMedia 저장 완료:', mediaIdsToSave);

    // 선택된 팀 ID 배열 전달 (빈 배열이면 [0] = 전체)
    const teamIdsToSave = selectedTeamIds.length > 0 ? selectedTeamIds : [0];
    localStorage.setItem("marketingReport_selectedTeam", JSON.stringify(teamIdsToSave));
    console.log('✅ marketingReport_selectedTeam 저장 완료:', teamIdsToSave);

    console.log('============================================');
    console.log('✅ localStorage 저장 완료, 마케팅 리포트로 이동');
    console.log('============================================');

    navigate('/marketing-report');
  };

  // 제품 유형 필터링 (자사/대행)
  const filteredProducts = useMemo(() => {
    const inHouseChecked = productTypeFilters.inHouse;
    const agencyChecked = productTypeFilters.agency;

    // 둘 다 체크 안 됨 또는 둘 다 체크됨 → 전체 표시
    if ((!inHouseChecked && !agencyChecked) || (inHouseChecked && agencyChecked)) {
      return allProducts;
    }

    // 자사만 체크 → 대행_ 제외
    if (inHouseChecked && !agencyChecked) {
      return allProducts.filter(p => !p.name.startsWith('대행_'));
    }

    // 대행만 체크 → 대행_만 표시
    if (!inHouseChecked && agencyChecked) {
      return allProducts.filter(p => p.name.startsWith('대행_'));
    }

    return allProducts;
  }, [allProducts, productTypeFilters]);

  // 입력/미입력 토글에 따른 열 필터링
  const filteredMediaColumns = useMemo(() => {
    if (entryFilterMode === "all") {
      return adMediaList;
    }

    return adMediaList.filter(media => {
      const hasAnyEntry = dates.some(date => entryStatus[date]?.[media.id] === true);

      if (entryFilterMode === "entered") {
        return hasAnyEntry;  // 하나라도 입력된 매체
      } else {
        return !hasAnyEntry;  // 하나도 입력되지 않은 매체 (= 모든 날짜가 미입력)
      }
    });
  }, [adMediaList, dates, entryStatus, entryFilterMode]);

  // 오른쪽 필터 패널
  const rightPanel = (
    <div className="data-entry-status-container">
      <div className="filter-panel-container">
        {/* 팀/제품/매체 필터 박스 */}
        <div className="filter-box">
          {/* 팀 필터 */}
          <div className="filter-field horizontal">
            <label>팀</label>
            <CustomSelect
              options={[
                { id: -1, name: "전체" },
                ...teamOptions
              ]}
              selectedValues={selectedTeamIds}
              onSelectionChange={(values) => {
                setSelectedTeamIds(values);
              }}
              placeholder="팀"
              multiple={true}
              useIdAsValue={true}
              collapsible={true}
              searchable={true}
              globalSpecialOptions={["전체"]}
              specialOptions={teamSpecialOptions}
            />
          </div>

          {/* 제품 필터 */}
          <div className="filter-field horizontal">
            <label>제품</label>
            <div style={{ flex: 1, position: 'relative' }}>
              <CustomSelect
                options={[
                  { id: 0, name: "전체" },
                  ...filteredProducts
                    .filter(p => p.name !== "전체") // "전체" 중복 제거
                    .map(p => ({ id: p.id, name: p.name }))
                ]}
                selectedValues={selectedProductId === 0 ? [0] : [selectedProductId]}
                onSelectionChange={(values) => {
                  const selectedId = values.length > 0 ? values[0] : 0;
                  setSelectedProductId(selectedId === 0 || selectedId === "전체" ? 0 : parseInt(selectedId));
                }}
                placeholder="제품"
                multiple={false}
                useIdAsValue={true}
                searchable={true}
              />
              {/* 제품 유형 체크박스 (자사/대행) - 아래 줄 */}
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                marginTop: '0.5rem',
                paddingLeft: '0.5rem'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    checked={productTypeFilters.inHouse}
                    onChange={(e) => setProductTypeFilters(prev => ({ ...prev, inHouse: e.target.checked }))}
                    style={{ marginRight: '0.25rem' }}
                  />
                  자사
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    checked={productTypeFilters.agency}
                    onChange={(e) => setProductTypeFilters(prev => ({ ...prev, agency: e.target.checked }))}
                    style={{ marginRight: '0.25rem' }}
                  />
                  대행
                </label>
              </div>
            </div>
          </div>

          {/* 매체 필터 */}
          <div className="filter-field horizontal">
            <label>매체</label>
            <div style={{ flex: 1, position: 'relative' }}>
              <CustomSelect
              options={[
                { id: -1, name: "전체" },
                ...mediaOptions
              ]}
              selectedValues={selectedAdMediaIds}
              onSelectionChange={(values) => {
                setSelectedAdMediaIds(values);
              }}
              placeholder="매체"
              multiple={true}
              useIdAsValue={true}
              collapsible={true}
              searchable={true}
              globalSpecialOptions={["전체"]}
              specialOptions={mediaSpecialOptions}
            />
            </div>
          </div>
        </div>

        {/* 달력 박스 */}
        <div className="filter-box">
          <CalendarDateFilter
            customDateRange={customDateRange}
            setCustomDateRange={setCustomDateRange}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
          />
        </div>

        {/* 히스토리 버튼 */}
        <div className="history-button-box">
          <button className="history-btn" onClick={() => navigate('/data-entry-history')}>
            <FontAwesomeIcon icon={faHistory} />
            <span>데이터 입력 히스토리</span>
          </button>
        </div>
      </div>
    </div>
  );

  // 테이블 렌더링
  const renderTable = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>데이터를 불러오는 중...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <p>오류: {error}</p>
        </div>
      );
    }

    if (!customDateRange.startDate || !customDateRange.endDate) {
      return (
        <div className="no-data-container">
          <p>날짜 범위를 선택해주세요.</p>
        </div>
      );
    }

    if (selectedTeamIds.length > 0 && allowedMediaIds !== null && allowedMediaIds.length === 0) {
      return (
        <div className="no-data-container">
          <p>선택한 팀에 할당된 매체가 없습니다.</p>
        </div>
      );
    }

    if (dates.length === 0 || filteredMediaColumns.length === 0) {
      return (
        <div className="no-data-container">
          <p>표시할 데이터가 없습니다.</p>
        </div>
      );
    }

    // 여러 팀 선택 시 팀 정보 표시
    const showTeamInfo = selectedTeamIds.length > 1;

    return (
      <div className="entry-status-table-wrapper">
        <table className="entry-status-table">
          <thead>
            <tr>
              <th className="first-col">날짜</th>
              {filteredMediaColumns.map(media => {
                // 해당 매체가 속한 팀들 찾기
                const teamIds = mediaToTeamMapping[media.id] || [];
                const teamNames = teamIds
                  .map(teamId => {
                    const parentTeam = parentTeams.find(t => t.id === teamId);
                    const childTeam = childTeams.find(t => t.id === teamId);
                    return parentTeam?.name || childTeam?.name;
                  })
                  .filter(Boolean)
                  .join(', ');

                return (
                  <th
                    key={media.id}
                    title={showTeamInfo && teamNames ? `팀: ${teamNames}` : media.name}
                  >
                    <div>{media.name}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {dates.map(date => (
              <tr key={date}>
                <td
                  className="first-col"
                  onClick={() => handleRowClick(date, null)}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                >
                  {date}
                </td>
                {filteredMediaColumns.map(media => {
                  const hasEntry = entryStatus[date]?.[media.id] === true;
                  return (
                    <td
                      key={media.id}
                      className={hasEntry ? "cell-has-entry" : "cell-no-entry"}
                      onClick={() => handleRowClick(date, media.id)}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                    >
                      ●
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Layout rightPanel={rightPanel}>
      <div className="data-entry-status-page">
        <Breadcrumb />

        {/* 타이틀 영역 */}
        <div className="page-title-section">
          <h1 className="page-title">데이터 입력 현황</h1>
          {customDateRange.startDate && customDateRange.endDate && (
            <div className="today-info">
              <span className="today-date">
                기간: {customDateRange.startDate} ~ {customDateRange.endDate}
              </span>
              <span className="entry-summary">
                입력됨: {summary.enteredCells}개 | 미입력: {summary.totalCells - summary.enteredCells}개
              </span>
            </div>
          )}
        </div>

        {/* 범례 및 필터 버튼 */}
        <div className="legend-section">
          <div className="legend-filter-group">
            <button
              className={`legend-filter-btn ${entryFilterMode === "all" ? "active" : ""}`}
              onClick={() => setEntryFilterMode("all")}
            >
              전체 보기
            </button>
            <button
              className={`legend-filter-btn ${entryFilterMode === "entered" ? "active" : ""}`}
              onClick={() => setEntryFilterMode("entered")}
            >
              <span className="legend-dot has-entry">●</span>
              입력됨만 보기
            </button>
            <button
              className={`legend-filter-btn ${entryFilterMode === "not-entered" ? "active" : ""}`}
              onClick={() => setEntryFilterMode("not-entered")}
            >
              <span className="legend-dot no-entry">○</span>
              미입력만 보기
            </button>
          </div>
        </div>

        {/* 테이블 */}
        <div className="table-container">
          {renderTable()}
        </div>
      </div>
    </Layout>
  );
}

export default DataEntryStatus;
