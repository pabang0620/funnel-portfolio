import { useState, useEffect, useMemo } from 'react';
import { getMarketPlaces, getProducts, getAdMediaList, getTableData, getSalesData, getTeamList, getAgencySalesData } from '../../api';
import { getChildMarketPlaces } from '../../../admin/marketplace-admedia/api';
import { useAuth } from '../../../../contexts/AuthContext';

/**
 * ExecutiveReport 데이터 관리 Custom Hook
 * 모든 state 및 데이터 fetch 로직을 관리합니다
 */
export const useExecutiveReportData = () => {
  // localStorage 버전 체크 — 구 데이터 자동 초기화
  const STORAGE_VERSION = 'v2-2026apr';
  const storedVersion = localStorage.getItem('executive-report-version');
  if (storedVersion !== STORAGE_VERSION) {
    ['executive-report-date-range', 'executive-report-selected-period',
     'executive-report-single-product', 'executive-report-product-type-filter',
     'executive-report-table-product-type-filter'].forEach(key => localStorage.removeItem(key));
    localStorage.setItem('executive-report-version', STORAGE_VERSION);
  }

  const { userRole, userId } = useAuth();

  // UI State
  const [showFeeDetail, setShowFeeDetail] = useState(false);
  const [showChannelDetail, setShowChannelDetail] = useState(false);

  // Date Range State
  const [customDateRange, setCustomDateRange] = useState(() => {
    // localStorage에서 저장된 날짜 범위 불러오기
    const savedDateRange = localStorage.getItem("executive-report-date-range");
    if (savedDateRange) {
      return JSON.parse(savedDateRange);
    }

    // 기본값: 2026년 4월 1일~30일
    return {
      startDate: '2026-04-01',
      endDate: '2026-04-30',
    };
  });

  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    // localStorage에서 저장된 기간 불러오기
    const savedPeriod = localStorage.getItem("executive-report-selected-period");
    if (savedPeriod) {
      return savedPeriod;
    }

    // 기본값: 2026년 4월
    return '4월';
  });

  // Selection State
  const [selectedOptions1, setSelectedOptions1] = useState([]);
  const [selectedOptions2, setSelectedOptions2] = useState([]); // 제품 ID 배열
  const [selectedSingleProduct, setSelectedSingleProduct] = useState(() => {
    // localStorage에서 저장된 우측 패널 제품 선택값 불러오기 (ID)
    const savedSingleProduct = localStorage.getItem("executive-report-single-product");
    if (savedSingleProduct) {
      const parsed = JSON.parse(savedSingleProduct);
      // 숫자가 아닌 값(기존 이름 방식)이면 null로 초기화
      if (parsed.length > 0 && typeof parsed[0] !== 'number') {
        return [null]; // "전체" 의미
      }
      return parsed;
    }
    return [null]; // "전체" 의미 (null = 전체)
  });

  // 자사/대행/통합 탭 필터 상태 ('inHouse' | 'agency' | 'combined')
  const [productTypeFilter, setProductTypeFilter] = useState(() => {
    const saved = localStorage.getItem("executive-report-product-type-filter");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 기존 객체 형태면 문자열로 변환
        if (typeof parsed === 'object') {
          return 'inHouse'; // 기본값: 자사
        }
        return parsed;
      } catch {
        return 'inHouse';
      }
    }
    return 'inHouse'; // 기본값: 자사
  });

  // 자사/대행 필터 체크박스 상태 (테이블 위 ProductFilter용)
  const [tableProductTypeFilter, setTableProductTypeFilter] = useState(() => {
    const saved = localStorage.getItem("executive-report-table-product-type-filter");
    if (saved) {
      return JSON.parse(saved);
    }
    return { inHouse: true, agency: true }; // 기본값: 둘 다 체크
  });

  // 데이터 없는 행 숨기기 체크박스 상태
  const [hideEmptyRows, setHideEmptyRows] = useState(() => {
    const saved = localStorage.getItem("executive-report-hide-empty-rows");
    if (saved) {
      return JSON.parse(saved);
    }
    return false; // 기본값: 숨기지 않음
  });
  const [selectedMedia, setSelectedMedia] = useState(() => {
    // 로컬스토리지에서 저장된 매체 선택값 불러오기 (ID 배열)
    const savedMedia = localStorage.getItem("executive-report-media");
    if (savedMedia) {
      const parsed = JSON.parse(savedMedia);
      // 숫자가 아닌 값(기존 이름 방식)이면 빈 배열로 초기화 (API 로드 후 설정)
      if (parsed.length > 0 && typeof parsed[0] !== 'number') {
        return [];
      }
      return parsed;
    }
    return []; // API에서 데이터 로드 후 설정
  });


  // Loading State
  const [isLoading, setIsLoading] = useState(true);

  // Data State
  const [salesChannelList, setSalesChannelList] = useState([]);
  const [salesChannelListWithSpecial, setSalesChannelListWithSpecial] = useState([]);
  const [productList, setProductList] = useState([]);
  const [mediaList, setMediaList] = useState([]);
  const [allMediaList, setAllMediaList] = useState([]); // 전체 부모 매체 (자사 제품용)
  const [teamList, setTeamList] = useState([]);
  const [salesChannelSpecialOptions, setSalesChannelSpecialOptions] = useState({});
  const [productSpecialOptions, setProductSpecialOptions] = useState({});
  const [mediaSpecialOptions, setMediaSpecialOptions] = useState({});
  const [teamSpecialOptions, setTeamSpecialOptions] = useState({});
  const [tableData, setTableData] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);

  // 팀 선택 상태
  const [selectedTeams, setSelectedTeams] = useState(() => {
    const savedTeams = localStorage.getItem("executive-report-teams");
    if (savedTeams) {
      const parsed = JSON.parse(savedTeams);
      // 숫자 ID만 필터링 (문자열 이름 제거)
      return parsed.filter(id => typeof id === 'number');
    }
    return []; // API에서 데이터 로드 후 설정
  });

  // 자식 판매처 (파일 판매처명) State
  const [childSalesChannelList, setChildSalesChannelList] = useState([]);
  const [childSalesChannelSpecialOptions, setChildSalesChannelSpecialOptions] = useState({});
  const [selectedChildSalesChannels, setSelectedChildSalesChannels] = useState(() => {
    // localStorage에서 저장된 파일 판매처명 선택값 불러오기
    const savedChildChannels = localStorage.getItem("executive-report-child-channels");
    if (savedChildChannels) {
      return JSON.parse(savedChildChannels);
    }
    return [];
  });

  // 테이블 보기 모드: 'channel' (판매처별) | 'fileChannel' (파일판매처별)
  const [tableViewMode, setTableViewMode] = useState(() => {
    const savedMode = localStorage.getItem("executive-report-view-mode");
    return savedMode || 'channel';
  });

  // 제품 상세 뷰용 보기 모드 (1번, 3번 테이블)
  const [productDetailViewMode, setProductDetailViewMode] = useState(() => {
    const savedMode = localStorage.getItem("executive-report-product-detail-view-mode");
    return savedMode || 'channel';
  });

  // 대행 보기 모드: 'team' (팀별) | 'media' (매체별)
  const [agencyViewMode, setAgencyViewMode] = useState(() => {
    const savedMode = localStorage.getItem("executive-report-agency-view-mode");
    return savedMode || 'team'; // 기본값: 팀별
  });

  // 대행 테이블 데이터
  const [agencyTableData, setAgencyTableData] = useState([]);


  // Data Loading Effect
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [channelsResponse, productsResponse, mediaResponse, teamsResponse] = await Promise.all([
          getMarketPlaces(),
          getProducts(),
          getAdMediaList(),
          getTeamList(true), // 부모 팀만 가져오기
        ]);

        const channels = channelsResponse.data;
        setSalesChannelList(channels);

        // "간소화"와 "전체" 옵션 추가
        const channelsWithSpecial = [
          { id: 0, name: "간소화" },
          { id: -1, name: "전체" },
          ...channels
        ];
        setSalesChannelListWithSpecial(channelsWithSpecial);

        // 특수 옵션 매핑 설정
        const allChannelNames = channels.map(ch => ch.name);
        // "간소화"는 사방넷, 쿠팡만 선택
        const simplifiedChannels = allChannelNames.filter(name =>
          name === "사방넷" || name === "쿠팡"
        );
        setSalesChannelSpecialOptions({
          "간소화": simplifiedChannels.length > 0 ? simplifiedChannels : allChannelNames.slice(0, 2),
          "전체": allChannelNames
        });

        // 제품 특수 옵션 매핑 설정 (ID 배열, "전체" 옵션 제외)
        const allProductIds = productsResponse.data
          .filter(p => p.name !== "전체")
          .map(p => p.id);

        // "자사" 제품: "대행_"으로 시작하지 않는 제품
        const inHouseProductIds = productsResponse.data
          .filter(p => p.name !== "전체" && !p.name.startsWith("대행_"))
          .map(p => p.id);

        // "대행" 제품: "대행_"으로 시작하는 제품
        const agencyProductIds = productsResponse.data
          .filter(p => p.name.startsWith("대행_"))
          .map(p => p.id);

        // productList 설정 ("자사", "대행" 옵션 제외)
        setProductList(productsResponse.data);

        setProductSpecialOptions({
          "전체": allProductIds,
          "자사": inHouseProductIds,
          "대행": agencyProductIds
        });

        // 매체 목록 설정 (마스터 매체만 표시, 자식 매체는 데이터 합산용으로만 사용)
        const mediaData = mediaResponse.data || [];
        const flatMediaList = [];
        const allFlatMediaList = [];

        // 대행 모드에서 표시할 매체 목록 (DB 확인 완료)
        const ALLOWED_AGENCY_MEDIA = ['구글', '메타', '네이버', '크리테오', '타불라', '카카오모먼트', '틱톡'];

        mediaData.forEach(parentMedia => {
          const hasChildren = parentMedia.adMediaDetails && parentMedia.adMediaDetails.length > 0;

          const mediaItem = {
            id: parentMedia.id,
            name: parentMedia.name,
            fee: parentMedia.fee,
            // 자식 매체 ID 목록 저장 (API 호출용)
            childIds: hasChildren
              ? parentMedia.adMediaDetails.map(child => child.id)
              : [],
            // 자식 매체 이름 목록 저장 (표시용)
            childNames: hasChildren
              ? parentMedia.adMediaDetails.map(child => child.name)
              : []
          };

          // 모든 부모 매체를 allMediaList에 추가 (자사 제품용)
          allFlatMediaList.push(mediaItem);

          // 대행 모드에서는 특정 매체만 추가
          if (ALLOWED_AGENCY_MEDIA.includes(parentMedia.name)) {
            flatMediaList.push(mediaItem);
          }
        });

        setMediaList(flatMediaList);
        setAllMediaList(allFlatMediaList);

        // 매체 특수 옵션 매핑 설정 (ID 배열)
        // - "전체": 모든 마스터 매체 ID 선택 (자사/대행 모두 포함)
        // - "간소화": 대행 매체 6개만 선택
        const allMediaIds = allFlatMediaList.map(m => m.id);
        const agencyMediaIds = flatMediaList.map(m => m.id);
        setMediaSpecialOptions({
          "전체": allMediaIds,
          "간소화": agencyMediaIds
        });

        // 로컬스토리지에서 저장된 선택값 불러오기
        const savedChannels = localStorage.getItem("executive-report-channels");
        const savedProducts = localStorage.getItem("executive-report-products");
        const savedAgencyMedia = localStorage.getItem("executive-report-agency-media");

        if (savedChannels) {
          const parsedChannels = JSON.parse(savedChannels);
          // 유효한 판매처만 필터링
          const validChannels = parsedChannels.filter(ch => allChannelNames.includes(ch));
          if (validChannels.length > 0) {
            setSelectedOptions1(validChannels);
          } else {
            // 저장된 값이 모두 무효하면 전체 선택
            setSelectedOptions1(allChannelNames);
          }
        } else {
          // 기본값: 모든 판매처 선택
          setSelectedOptions1(allChannelNames);
        }

        // 제품 선택값 설정 (ID 배열)
        if (savedProducts) {
          const parsedProducts = JSON.parse(savedProducts);
          // 숫자(ID)가 아닌 값(기존 이름 방식)이면 전체 선택
          if (parsedProducts.length > 0 && typeof parsedProducts[0] !== 'number') {
            setSelectedOptions2(allProductIds);
            localStorage.setItem("executive-report-products", JSON.stringify(allProductIds));
          } else {
            // 유효한 제품 ID만 필터링
            const validProducts = parsedProducts.filter(id => allProductIds.includes(id));
            if (validProducts.length > 0) {
              setSelectedOptions2(validProducts);
            } else {
              setSelectedOptions2(allProductIds);
            }
          }
        } else {
          // 기본값: 모든 판매상품 선택 (ID 배열)
          setSelectedOptions2(allProductIds);
        }

        // 매체 선택값 설정 - 대행 모드 전용 키에서 로드
        if (savedAgencyMedia) {
          const parsedMedia = JSON.parse(savedAgencyMedia);
          // 유효한 매체 ID만 필터링
          const validMedia = parsedMedia.filter(id =>
            typeof id === 'number' && allMediaIds.includes(id)
          );
          if (validMedia.length > 0) {
            setSelectedMedia(validMedia);
          } else {
            // 저장된 값이 모두 무효하면 전체 선택
            setSelectedMedia(allMediaIds);
          }
        } else {
          // 저장된 값이 없으면 전체 매체 선택
          setSelectedMedia(allMediaIds);
        }

        // 팀 목록 설정 (부모 팀만)
        const teams = teamsResponse.data || [];
        setTeamList(teams);

        // 팀 특수 옵션 매핑 설정 (ID 배열)
        const allTeamIds = teams.map(t => t.id);
        const teamSpecialOpts = {
          "전체": allTeamIds
        };

        setTeamSpecialOptions(teamSpecialOpts);

        // 팀 선택값 설정 - 대행 모드 전용 키에서 로드
        const savedAgencyTeams = localStorage.getItem("executive-report-agency-teams");
        if (savedAgencyTeams) {
          const parsedTeams = JSON.parse(savedAgencyTeams);
          // 숫자 타입이면서 부모 팀 ID에 포함된 것만 필터링
          const validTeams = parsedTeams.filter(id =>
            typeof id === 'number' && allTeamIds.includes(id)
          );
          if (validTeams.length > 0) {
            setSelectedTeams(validTeams);
          } else {
            // 저장된 값이 모두 무효하면 전체 선택
            setSelectedTeams(allTeamIds);
          }
        } else {
          // 저장된 값이 없으면 전체 팀 선택
          setSelectedTeams(allTeamIds);
        }

      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      }
    };

    loadData();
  }, []);

  // 매체 선택 변경 시 로컬스토리지 저장 (제거 - 대행 모드 전용 키로 통합)
  // useEffect(() => {
  //   if (selectedMedia.length > 0) {
  //     localStorage.setItem("executive-report-media", JSON.stringify(selectedMedia));
  //   }
  // }, [selectedMedia]);

  // 팀 선택 변경 시 로컬스토리지 저장
  useEffect(() => {
    if (selectedTeams.length > 0) {
      localStorage.setItem("executive-report-agency-teams", JSON.stringify(selectedTeams));
    }
  }, [selectedTeams]);

  // 모든 자식 판매처(파일 판매처명) 목록 로드 - 부모 판매처와 독립적으로
  useEffect(() => {
    const loadAllChildChannels = async () => {
      try {
        if (salesChannelList.length === 0) return;

        // 부모 판매처 ID → 이름 매핑
        const parentIdToName = {};
        salesChannelList.forEach(channel => {
          parentIdToName[channel.id] = channel.name;
        });

        // 모든 부모 판매처의 자식 판매처 목록 조회
        const allParentIds = salesChannelList.map(channel => channel.id);
        const childPromises = allParentIds.map(parentId =>
          getChildMarketPlaces(parentId)
        );
        const childResponses = await Promise.all(childPromises);

        // 모든 자식 판매처를 하나의 배열로 합치기 (부모 이름 포함)
        const allChildren = childResponses.flatMap((response) => {
          if (response.success && response.data) {
            return response.data.map(child => ({
              id: child.id,
              name: child.name,
              parentId: child.parentId,
              parentName: parentIdToName[child.parentId] || child.parentName || ''
            }));
          }
          return [];
        });

        setChildSalesChannelList(allChildren);

        // 자식 판매처 특수 옵션 설정 ("전체")
        const allChildIds = allChildren.map(child => child.id);
        setChildSalesChannelSpecialOptions({
          "전체": allChildIds
        });

        // 로컬스토리지에서 저장된 선택값 검증
        const savedChildChannels = localStorage.getItem("executive-report-child-channels");
        if (savedChildChannels) {
          const parsed = JSON.parse(savedChildChannels);
          const validChildIds = allChildren.map(child => child.id);
          const validSelectedChildren = parsed.filter(id => validChildIds.includes(id));
          setSelectedChildSalesChannels(validSelectedChildren);
        } else {
          // 저장된 값이 없으면 전체 선택
          setSelectedChildSalesChannels(allChildIds);
        }

      } catch (error) {
        console.error("자식 판매처 목록 로딩 실패:", error);
        setChildSalesChannelList([]);
      }
    };

    // 판매처 목록이 로드된 후에 실행
    if (salesChannelList.length > 0) {
      loadAllChildChannels();
    }
  }, [salesChannelList]);

  // 순서 변경만으로 재호출 방지: 정렬된 값으로 의존성 비교
  const sortedChannels = useMemo(() => JSON.stringify([...selectedOptions1].sort()), [selectedOptions1]);
  const sortedProducts = useMemo(() => JSON.stringify([...selectedOptions2].sort()), [selectedOptions2]);
  const sortedChildChannels = useMemo(() => JSON.stringify([...selectedChildSalesChannels].sort()), [selectedChildSalesChannels]);

  // Table Data Loading Effect
  useEffect(() => {
    const loadTableData = async () => {
      try {
        setIsLoading(true);
        // 모든 판매처 이름 가져오기
        const allMarketPlaceNames = salesChannelList.map(ch => ch.name);

        // 모든 제품 ID 가져오기
        const allProductIds = productList.map(p => p.id);

        // 기본 파라미터로 호출 - 모든 판매처와 제품 전달
        const params = {
          startDate: customDateRange.startDate,
          endDate: customDateRange.endDate,
          marketPlaces: allMarketPlaceNames, // 모든 판매처
          productIds: allProductIds, // 모든 제품
          userRole: userRole || 'C'
        };
        const response = await getTableData(params);
        setTableData(response.data);
      } catch (error) {
        console.error("테이블 데이터 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // tableData 로드 조건: 자사 모드 또는 자사+대행 통합 탭
    const isAgencyMode = !tableProductTypeFilter.inHouse && tableProductTypeFilter.agency;
    const selectedProductId = selectedSingleProduct.length > 0 ? selectedSingleProduct[0] : null;
    const isProductDetailMode = selectedProductId !== null;
    const isCombinedMode = productTypeFilter === 'combined'; // 자사+대행 통합 탭

    // combined 모드일 때도 tableData 로드
    if (salesChannelList.length > 0 && productList.length > 0 && customDateRange.startDate) {
      if ((!isAgencyMode && !isProductDetailMode) || isCombinedMode) {
        loadTableData();
      } else if (isProductDetailMode) {
        setIsLoading(false);
      }
    }
  }, [customDateRange, userRole, salesChannelList, productList, tableProductTypeFilter, selectedSingleProduct, productTypeFilter]);

  // Dashboard Data Loading Effect - 모든 데이터를 한번에 로드
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        // 모든 판매처 이름 가져오기
        const allMarketPlaceNames = salesChannelList.map(ch => ch.name);

        // 모든 제품 ID 가져오기
        const allProductIds = productList.map(p => p.id);

        const params = {
          startDate: customDateRange.startDate,
          endDate: customDateRange.endDate,
          marketPlaces: allMarketPlaceNames, // 모든 판매처
          productIds: allProductIds // 모든 제품
        };
        const response = await getSalesData(params);
        setDashboardData(response.data);
      } catch (error) {
        console.error("대시보드 데이터 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // 대행 모드가 아니고, 제품 상세보기가 아닐 때만 getSalesData 호출
    const isAgencyMode = !tableProductTypeFilter.inHouse && tableProductTypeFilter.agency;
    const selectedProductId = selectedSingleProduct.length > 0 ? selectedSingleProduct[0] : null;
    const isProductDetailMode = selectedProductId !== null;

    if (!isAgencyMode && !isProductDetailMode && salesChannelList.length > 0 && productList.length > 0 && customDateRange.startDate) {
      loadDashboardData();
    } else if (isProductDetailMode) {
      // 제품 상세보기 모드일 때는 로딩 상태 해제
      setIsLoading(false);
    }
  }, [customDateRange, salesChannelList, productList, tableProductTypeFilter, selectedSingleProduct]);

  // 팀/매체 선택 항목의 내용만 추적 (순서 변경 무시)
  const sortedTeamsKey = useMemo(() =>
    [...selectedTeams].sort((a, b) => a - b).join(','),
    [selectedTeams]
  );

  const sortedMediaKey = useMemo(() =>
    [...selectedMedia].sort((a, b) => a - b).join(','),
    [selectedMedia]
  );

  // 대행 데이터 로딩 Effect - 모든 데이터를 한번에 로드
  useEffect(() => {
    const loadAgencyData = async () => {
      const isCombinedMode = productTypeFilter === 'combined';

      // combined 모드가 아닐 때만 대행 전용 체크
      if (!isCombinedMode) {
        // tableProductTypeFilter가 대행만 선택된 경우에만 로드
        if (!tableProductTypeFilter.agency || tableProductTypeFilter.inHouse) {
          return;
        }
      }

      try {
        setIsLoading(true);

        // 모든 대행 제품 ID 가져오기
        const allAgencyProductIds = productList
          .filter(p => p.name.startsWith('대행_'))
          .map(p => p.id);

        // 모든 팀/매체 데이터를 한 번에 가져옴 (프론트엔드에서 필터링)
        const allTeamIds = teamList.map(t => t.id);
        const allMediaIds = mediaList.map(m => m.id);

        const params = {
          startDate: customDateRange.startDate,
          endDate: customDateRange.endDate,
          productIds: allAgencyProductIds, // 모든 대행 제품
          viewMode: agencyViewMode,
          teamIds: agencyViewMode === 'team' ? allTeamIds : undefined,
          mediaIds: agencyViewMode === 'media' ? allMediaIds : undefined
        };

        const response = await getAgencySalesData(params);
        if (response.success) {
          setAgencyTableData(response.data);
        }
      } catch (error) {
        console.error('대행 데이터 로드 실패:', error);
        setAgencyTableData([]);
      } finally {
        setIsLoading(false);
      }
    };

    // agencyTableData 로드 조건: 대행 모드 또는 자사+대행 통합 탭
    const isAgencyMode = !tableProductTypeFilter.inHouse && tableProductTypeFilter.agency;
    const selectedProductId = selectedSingleProduct.length > 0 ? selectedSingleProduct[0] : null;
    const isProductDetailMode = selectedProductId !== null;
    const isCombinedMode = productTypeFilter === 'combined'; // 자사+대행 통합 탭
    const hasRequiredData = agencyViewMode === 'team'
      ? teamList.length > 0 && selectedTeams.length > 0
      : mediaList.length > 0 && selectedMedia.length > 0;

    // combined 모드일 때도 agencyTableData 로드
    if (hasRequiredData && productList.length > 0 && customDateRange.startDate) {
      if ((isAgencyMode && !isProductDetailMode) || isCombinedMode) {
        loadAgencyData();
      } else if (isProductDetailMode) {
        setIsLoading(false);
      }
    } else if ((isAgencyMode && !isProductDetailMode) || isCombinedMode) {
      // 선택된 팀/매체가 없으면 데이터를 비움
      setAgencyTableData([]);
      setIsLoading(false);
    }
  }, [
    customDateRange,
    agencyViewMode,
    tableProductTypeFilter,
    productList,
    teamList,
    mediaList,
    selectedSingleProduct,
    productTypeFilter
    // sortedTeamsKey, sortedMediaKey 제거 - 체크박스 변경 시 API 호출 안 함
  ]);

  // LocalStorage Sync Effects
  useEffect(() => {
    if (customDateRange.startDate && customDateRange.endDate) {
      localStorage.setItem("executive-report-date-range", JSON.stringify(customDateRange));
    }
  }, [customDateRange]);

  useEffect(() => {
    if (selectedPeriod) {
      localStorage.setItem("executive-report-selected-period", selectedPeriod);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    if (productTypeFilter) {
      localStorage.setItem("executive-report-product-type-filter", JSON.stringify(productTypeFilter));
    }
  }, [productTypeFilter]);

  useEffect(() => {
    if (selectedOptions1.length > 0) {
      localStorage.setItem("executive-report-channels", JSON.stringify(selectedOptions1));
    }
  }, [selectedOptions1]);

  useEffect(() => {
    if (selectedOptions2.length > 0) {
      localStorage.setItem("executive-report-products", JSON.stringify(selectedOptions2));
    }
  }, [selectedOptions2]);

  // 매체 선택 저장 - 모든 모드에서 저장 (빈 배열도 저장하여 선택 해제 상태 유지)
  useEffect(() => {
    // 초기 로드 중에는 저장하지 않음 (mediaList가 로드된 후에만 저장)
    if (mediaList.length > 0 || allMediaList.length > 0) {
      localStorage.setItem("executive-report-agency-media", JSON.stringify(selectedMedia));
    }
  }, [selectedMedia, mediaList, allMediaList]);

  useEffect(() => {
    localStorage.setItem("executive-report-single-product", JSON.stringify(selectedSingleProduct));
  }, [selectedSingleProduct]);

  useEffect(() => {
    localStorage.setItem("executive-report-child-channels", JSON.stringify(selectedChildSalesChannels));
  }, [selectedChildSalesChannels]);

  useEffect(() => {
    localStorage.setItem("executive-report-view-mode", tableViewMode);
  }, [tableViewMode]);

  useEffect(() => {
    localStorage.setItem("executive-report-product-detail-view-mode", productDetailViewMode);
  }, [productDetailViewMode]);

  // 팀 선택 저장 - 대행 모드 전용
  useEffect(() => {
    if (!tableProductTypeFilter.inHouse && tableProductTypeFilter.agency) {
      localStorage.setItem("executive-report-agency-teams", JSON.stringify(selectedTeams));
    }
  }, [selectedTeams, tableProductTypeFilter]);

  // 팀 선택 저장 - 제품상세 페이지용 (기존 유지)
  useEffect(() => {
    localStorage.setItem("executive-report-teams", JSON.stringify(selectedTeams));
  }, [selectedTeams]);

  useEffect(() => {
    localStorage.setItem("executive-report-product-type-filter", JSON.stringify(productTypeFilter));
  }, [productTypeFilter]);

  useEffect(() => {
    localStorage.setItem("executive-report-table-product-type-filter", JSON.stringify(tableProductTypeFilter));
  }, [tableProductTypeFilter]);

  useEffect(() => {
    localStorage.setItem("executive-report-hide-empty-rows", JSON.stringify(hideEmptyRows));
  }, [hideEmptyRows]);

  useEffect(() => {
    localStorage.setItem("executive-report-agency-view-mode", agencyViewMode);
  }, [agencyViewMode]);

  return {
    // Loading State
    isLoading,

    // UI State
    showFeeDetail,
    setShowFeeDetail,
    showChannelDetail,
    setShowChannelDetail,
    userRole,
    userId,

    // Date State
    customDateRange,
    setCustomDateRange,
    selectedPeriod,
    setSelectedPeriod,

    // Selection State
    selectedOptions1,
    setSelectedOptions1,
    selectedOptions2,
    setSelectedOptions2,
    selectedSingleProduct,
    setSelectedSingleProduct,
    selectedMedia,
    setSelectedMedia,

    // Data State
    salesChannelList,
    salesChannelListWithSpecial,
    productList,
    mediaList,
    allMediaList, // 전체 부모 매체 리스트 (자사 제품용)
    teamList,
    salesChannelSpecialOptions,
    productSpecialOptions,
    mediaSpecialOptions,
    teamSpecialOptions,
    tableData,
    dashboardData,

    // 팀 선택 State
    selectedTeams,
    setSelectedTeams,

    // 자식 판매처 State
    childSalesChannelList,
    childSalesChannelSpecialOptions,
    selectedChildSalesChannels,
    setSelectedChildSalesChannels,

    // 테이블 보기 모드
    tableViewMode,
    setTableViewMode,

    // 제품 상세 뷰용 보기 모드
    productDetailViewMode,
    setProductDetailViewMode,

    // 자사/대행 필터 (우측 패널)
    productTypeFilter,
    setProductTypeFilter,

    // 자사/대행 필터 (테이블 위 ProductFilter)
    tableProductTypeFilter,
    setTableProductTypeFilter,

    // 데이터 없는 행 숨기기
    hideEmptyRows,
    setHideEmptyRows,

    // 대행 모드
    agencyViewMode,
    setAgencyViewMode,
    agencyTableData,
  };
};
