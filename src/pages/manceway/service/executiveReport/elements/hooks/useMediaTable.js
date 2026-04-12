import { useMemo, useState, useEffect, useCallback } from 'react';
import { generateMediaColumns, generateMediaDataFromApi } from '../utils/tableColumnGenerators';
import { getMediaPerformance } from '../../api';

/**
 * 2번 테이블 (매체별 실적현황) 데이터 관리 훅
 * @param {Object} customDateRange - 날짜 범위
 * @param {number[]} selectedMedia - 선택된 부모 매체 ID 목록
 * @param {number} selectedProductId - 선택된 제품 ID
 * @param {Array} mediaList - 전체 매체 목록
 */
const useMediaTable = (customDateRange, selectedMedia, selectedProductId, mediaList, isExpanded = true) => {
  const [apiData, setApiData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [marketPlaceAsMedia, setMarketPlaceAsMedia] = useState([]);
  const [parentMediaList, setParentMediaList] = useState([]); // 백엔드에서 받은 실제 매체 목록 (ID + 이름)
  const [hasLoaded, setHasLoaded] = useState(false); // 데이터 로드 여부 추적

  // API 호출 함수 - 모든 매체 데이터를 한번에 로드
  const fetchData = useCallback(async () => {
    // 제품이 없으면 조회하지 않음
    if (!selectedProductId || !customDateRange?.startDate || !customDateRange?.endDate) {
      setApiData([]);
      return;
    }

    // mediaList가 없으면 조회하지 않음
    if (!mediaList || mediaList.length === 0) {
      setApiData([]);
      return;
    }

    setIsLoading(true);
    try {
      // 모든 매체 ID를 전달하여 한번에 데이터 로드
      const allMediaIds = mediaList.map(m => m.id);

      const response = await getMediaPerformance({
        startDate: customDateRange.startDate,
        endDate: customDateRange.endDate,
        productId: selectedProductId,
        mediaIds: allMediaIds, // 모든 매체 ID 전달
      });

      if (response.data) {
        setApiData(response.data);
        setHasLoaded(true); // 데이터 로드 성공
      }
      // 백엔드에서 받은 실제 매체 목록 저장 (ID + 이름)
      if (response.parentMediaList) {
        setParentMediaList(response.parentMediaList);
      }
      // 판매처이면서 매체로 처리된 목록 저장
      if (response.marketPlaceAsMedia) {
        setMarketPlaceAsMedia(response.marketPlaceAsMedia);
      }
    } catch (error) {
      console.error('매체별 실적현황 데이터 조회 오류:', error);
      setApiData([]);
      setMarketPlaceAsMedia([]);
    } finally {
      setIsLoading(false);
    }
  }, [customDateRange, selectedProductId, mediaList]);

  // 의존성 변경 시 hasLoaded 리셋 (selectedMedia는 제외 - 필터링만)
  useEffect(() => {
    setHasLoaded(false);
  }, [customDateRange, selectedProductId, mediaList]);

  // 열려있을 때 + 아직 로드하지 않았을 때만 API 호출
  useEffect(() => {
    if (isExpanded && !hasLoaded) {
      fetchData();
    }
  }, [isExpanded, hasLoaded, fetchData]);

  // 선택된 매체 정보 (ID + 이름) - 컬럼 생성용
  const activeMediaList = useMemo(() => {
    // 선택된 매체가 없으면 빈 배열 반환
    if (selectedMedia.length === 0) return [];

    // 백엔드 응답의 parentMediaList가 있으면 우선 사용 (실제 데이터가 있는 매체만, 이름 포함)
    if (parentMediaList && parentMediaList.length > 0) {
      return parentMediaList.filter(media => selectedMedia.includes(media.id));
    }

    // parentMediaList가 없으면 기존 로직 사용 (mediaList에서 찾기)
    if (!mediaList || mediaList.length === 0) return [];

    // selectedMedia(ID 배열)에서 {id, name} 객체 배열로 변환
    return selectedMedia.map(mediaId => {
      const media = mediaList.find(m => m.id === mediaId);
      return media ? { id: media.id, name: media.name } : null;
    }).filter(item => item !== null);
  }, [selectedMedia, mediaList, parentMediaList]);

  const columns = useMemo(
    () => generateMediaColumns(activeMediaList, marketPlaceAsMedia),
    [activeMediaList, marketPlaceAsMedia]
  );

  // 데이터 생성 - 백엔드에서 이미 부모 매체 기준으로 합산됨
  const data = useMemo(
    () => generateMediaDataFromApi(apiData, activeMediaList, marketPlaceAsMedia),
    [apiData, activeMediaList, marketPlaceAsMedia]
  );

  return { columns, data, isLoading };
};

export default useMediaTable;
