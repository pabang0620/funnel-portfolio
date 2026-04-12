import { useMemo, useState, useEffect, useCallback } from 'react';
import { generateTeamColumns, generateTeamDataFromApi } from '../utils/tableColumnGenerators';
import { getTeamPerformance } from '../../api';

/**
 * 4번 테이블 (팀별 실적 현황) 데이터 관리 훅
 * @param {Object} customDateRange - 날짜 범위
 * @param {number[]} selectedTeams - 선택된 팀 ID 목록
 * @param {boolean} isAdmin - 관리자 여부
 * @param {number} selectedProductId - 선택된 제품 ID
 * @param {Array} teamList - 전체 팀 목록 (동적 컬럼 생성용)
 */
const useTeamTable = (customDateRange, selectedTeams, isAdmin, selectedProductId, teamList, isExpanded = true) => {
  const [apiData, setApiData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false); // 데이터 로드 여부 추적

  // API 호출 함수 - 모든 팀 데이터를 한번에 로드
  const fetchData = useCallback(async () => {
    // selectedProductId가 null이면 '전체' 선택 상태
    if (!selectedProductId || !customDateRange?.startDate || !customDateRange?.endDate) {
      setApiData([]);
      return;
    }

    // teamList가 없으면 조회하지 않음
    if (!teamList || teamList.length === 0) {
      setApiData([]);
      return;
    }

    setIsLoading(true);
    try {
      // 모든 팀 ID를 전달하여 한번에 데이터 로드
      const allTeamIds = teamList.map(t => t.id);

      const params = {
        startDate: customDateRange.startDate,
        endDate: customDateRange.endDate,
        productId: selectedProductId,
        teamIds: allTeamIds, // 모든 팀 ID 전달
        userRole: isAdmin ? 'S' : 'C',
      };

      const response = await getTeamPerformance(params);

      if (response.data) {
        setApiData(response.data);
        setHasLoaded(true); // 데이터 로드 성공
      }
    } catch (error) {
      console.error('팀별 실적 현황 데이터 조회 오류:', error);
      setApiData([]);
    } finally {
      setIsLoading(false);
    }
  }, [customDateRange, isAdmin, selectedProductId, teamList]);

  // 의존성 변경 시 hasLoaded 리셋 (selectedTeams는 제외 - 필터링만)
  useEffect(() => {
    setHasLoaded(false);
  }, [customDateRange, isAdmin, selectedProductId, teamList]);

  // 열려있을 때 + 아직 로드하지 않았을 때만 API 호출
  useEffect(() => {
    if (isExpanded && !hasLoaded) {
      fetchData();
    }
  }, [isExpanded, hasLoaded, fetchData]);

  // 선택된 팀 정보 (ID → 이름 매핑)
  const activeTeamInfo = useMemo(() => {
    if (!teamList || teamList.length === 0) {
      return { names: [], ids: selectedTeams };
    }
    // selectedTeams가 ID 배열이므로, teamList에서 해당 ID를 찾아 이름과 ID 매핑
    const filtered = teamList.filter(team => selectedTeams.includes(team.id));
    return {
      names: filtered.map(team => team.name),
      ids: filtered.map(team => team.id),
    };
  }, [selectedTeams, teamList]);

  const columns = useMemo(
    () => generateTeamColumns(activeTeamInfo.names, isAdmin),
    [activeTeamInfo.names, isAdmin]
  );

  const data = useMemo(
    () => generateTeamDataFromApi(apiData, activeTeamInfo.names, isAdmin, activeTeamInfo.ids, customDateRange),
    [apiData, activeTeamInfo.names, isAdmin, activeTeamInfo.ids, customDateRange]
  );

  return { columns, data, isLoading };
};

export default useTeamTable;
