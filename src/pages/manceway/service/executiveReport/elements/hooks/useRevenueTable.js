import { useMemo, useState, useEffect, useCallback } from 'react';
import { generateRevenueColumns, generateRevenueDataFromApi } from '../utils/tableColumnGenerators';
import { getRevenuePerformance } from '../../api';

/**
 * 1번 테이블 (매출 실적 현황) 데이터 관리 훅
 * @param {Object} customDateRange - 날짜 범위
 * @param {string[]|number[]} selectedChannels - 선택된 판매처 목록 (channel: 이름 배열, fileChannel: ID 배열)
 * @param {boolean} isAdmin - 관리자 여부
 * @param {number} selectedProductId - 선택된 제품 ID
 * @param {Array} salesChannelList - 전체 판매처 목록 (동적 컬럼 생성용)
 * @param {string} viewMode - 보기 모드 ('channel' | 'fileChannel')
 * @param {Function} hasPermission - 권한 체크 함수
 * @param {string} pageId - 페이지 ID (권한 체크용)
 * @param {string} groupName - 그룹 이름 (권한 체크용, 기본값: 'table-columns')
 */
const useRevenueTable = (customDateRange, selectedChannels, isAdmin, selectedProductId, salesChannelList, viewMode = 'channel', hasPermission = () => true, pageId = 'executive-report-sales', groupName = 'table-columns', isExpanded = true) => {
  const [apiData, setApiData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false); // 데이터 로드 여부 추적

  // API 호출 함수 - 모든 판매처 데이터를 한번에 로드
  const fetchData = useCallback(async () => {
    // selectedProductId가 null이면 '전체' 선택 상태
    if (!selectedProductId || !customDateRange?.startDate || !customDateRange?.endDate) {
      setApiData([]);
      return;
    }

    // salesChannelList가 없으면 조회하지 않음
    if (!salesChannelList || salesChannelList.length === 0) {
      setApiData([]);
      return;
    }

    setIsLoading(true);
    try {
      // viewMode에 따라 API 파라미터 구성
      const params = {
        startDate: customDateRange.startDate,
        endDate: customDateRange.endDate,
        productId: selectedProductId,
        userRole: isAdmin ? 'S' : 'C',
      };

      if (viewMode === 'fileChannel') {
        // 파일판매처별 모드: 모든 ID 전달
        const allChannelIds = salesChannelList.map(ch => ch.id);
        params.marketPlaceIds = allChannelIds;
        params.viewMode = 'fileChannel';
      } else {
        // 판매처별 모드: 모든 이름 전달
        const allChannelNames = salesChannelList.map(ch => ch.name);
        params.marketPlaces = allChannelNames;
      }

      const response = await getRevenuePerformance(params);

      if (response.data) {
        setApiData(response.data);
        setHasLoaded(true); // 데이터 로드 성공
      }
    } catch (error) {
      console.error('매출 실적 현황 데이터 조회 오류:', error);
      setApiData([]);
    } finally {
      setIsLoading(false);
    }
  }, [customDateRange, isAdmin, selectedProductId, viewMode, salesChannelList]);

  // 의존성 변경 시 hasLoaded 리셋 (selectedChannels는 제외 - 필터링만)
  useEffect(() => {
    setHasLoaded(false);
  }, [customDateRange, isAdmin, selectedProductId, viewMode, salesChannelList]);

  // 열려있을 때 + 아직 로드하지 않았을 때만 API 호출
  useEffect(() => {
    if (isExpanded && !hasLoaded) {
      fetchData();
    }
  }, [isExpanded, hasLoaded, fetchData]);

  // 선택된 채널 정보 (viewMode에 따라 다름)
  // channel 모드: { names: string[], ids: null }
  // fileChannel 모드: { names: string[], ids: number[] }
  const activeChannelInfo = useMemo(() => {
    if (viewMode === 'fileChannel') {
      // 파일판매처별 모드: ID 배열이 들어오고, salesChannelList에서 이름/ID 매핑
      if (!salesChannelList || salesChannelList.length === 0) {
        return { names: [], ids: selectedChannels };
      }
      // selectedChannels가 ID 배열이므로, salesChannelList에서 해당 ID를 찾아 이름과 ID 매핑
      const filtered = salesChannelList.filter(ch => selectedChannels.includes(ch.id));
      return {
        names: filtered.map(ch => ch.name),
        ids: filtered.map(ch => ch.id),
      };
    } else {
      // 판매처별 모드: 이름 배열
      if (!salesChannelList || salesChannelList.length === 0) {
        return { names: selectedChannels, ids: null };
      }
      if (selectedChannels.length === 0) {
        return { names: salesChannelList.map(ch => ch.name), ids: null };
      }
      return { names: selectedChannels, ids: null };
    }
  }, [selectedChannels, salesChannelList, viewMode]);

  const columns = useMemo(
    () => generateRevenueColumns(activeChannelInfo.names, isAdmin, hasPermission, pageId, groupName),
    [activeChannelInfo.names, isAdmin, hasPermission, pageId, groupName]
  );

  const data = useMemo(
    () => generateRevenueDataFromApi(apiData, activeChannelInfo.names, isAdmin, viewMode, activeChannelInfo.ids, hasPermission, pageId, groupName),
    [apiData, activeChannelInfo.names, isAdmin, viewMode, activeChannelInfo.ids, hasPermission, pageId, groupName]
  );

  return { columns, data, isLoading };
};

export default useRevenueTable;
