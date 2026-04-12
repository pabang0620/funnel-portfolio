import { useState, useCallback, useMemo } from 'react';
import DataTable from '../../../../components/common/DataTable';
import CustomSelect from '../../../../components/ui/CustomSelect';

/**
 * 4번 테이블: 팀별 실적 현황
 * 선택된 팀별로 매출과 비율을 표시
 */
const TeamPerformanceTable = ({
  columns,
  data,
  isAdmin,
  selectedTeams,
  onTeamChange,
  teamList,
  teamSpecialOptions,
  isLoading,
  onCellClick,
  isExpanded,
  onExpandChange,
}) => {

  // 팀 목록 옵션 생성 (계층 구조로 정렬)
  const teamOptions = useMemo(() => {
    if (!teamList || teamList.length === 0) {
      return [{ id: 0, name: "전체" }];
    }

    // 상위 팀 (parentId가 없는 팀)
    const parentTeams = teamList.filter(t => !t.parentId);
    // 하위 팀 (parentId가 있는 팀)
    const childTeams = teamList.filter(t => t.parentId);

    // 계층 구조로 정렬된 배열 생성
    const sortedTeams = [];
    parentTeams.forEach(parent => {
      // 상위 팀 추가
      sortedTeams.push(parent);
      // 해당 상위 팀의 하위 팀들 추가
      const children = childTeams.filter(c => c.parentId === parent.id);
      children.forEach(child => sortedTeams.push(child));
    });

    return [
      { id: 0, name: "전체" },
      ...sortedTeams
    ];
  }, [teamList]);

  // 상위/하위 팀 연동 선택 핸들러
  const handleTeamChange = useCallback((newSelectedTeams) => {
    if (!teamList || teamList.length === 0) {
      onTeamChange(newSelectedTeams);
      return;
    }

    // 새로 추가된 팀 ID 찾기
    const addedTeams = newSelectedTeams.filter(id => !selectedTeams.includes(id));
    // 제거된 팀 ID 찾기
    const removedTeams = selectedTeams.filter(id => !newSelectedTeams.includes(id));

    let result = [...newSelectedTeams];

    // 추가된 팀 처리
    addedTeams.forEach(teamId => {
      const team = teamList.find(t => t.id === teamId);
      if (!team) return;

      // 1. 하위 팀 선택 시 → 상위 팀도 선택
      if (team.parentId && !result.includes(team.parentId)) {
        result.push(team.parentId);
      }

      // 2. 상위 팀 선택 시 → 하위 팀들도 선택
      if (!team.parentId) {
        const childTeamIds = teamList
          .filter(t => t.parentId === teamId)
          .map(t => t.id);
        childTeamIds.forEach(childId => {
          if (!result.includes(childId)) {
            result.push(childId);
          }
        });
      }
    });

    // 제거된 팀 처리
    removedTeams.forEach(teamId => {
      const team = teamList.find(t => t.id === teamId);
      if (!team) return;

      // 상위 팀 제거 시 → 하위 팀들도 제거
      if (!team.parentId) {
        const childTeamIds = teamList
          .filter(t => t.parentId === teamId)
          .map(t => t.id);
        result = result.filter(id => !childTeamIds.includes(id));
      }
    });

    onTeamChange(result);
  }, [teamList, selectedTeams, onTeamChange]);

  return (
    <div className={`product-section accordion-section ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div
        className="accordion-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isExpanded ? '1rem' : 0, marginTop: '2rem' }}
      >
        <div
          className="accordion-title-wrapper"
          onClick={() => onExpandChange(!isExpanded)}
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flex: 1 }}
        >
          <span className={`accordion-icon ${isExpanded ? 'expanded' : ''}`}>▶</span>
          <h2 className="section-title" style={{ margin: 0 }}>
            4. 팀별 실적현황
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} onClick={(e) => e.stopPropagation()}>
          <div style={{ width: '180px' }}>
            <CustomSelect
              options={teamOptions}
              selectedValues={selectedTeams}
              onSelectionChange={handleTeamChange}
              placeholder="팀 선택"
              alwaysShowPlaceholder={true}
              useIdAsValue={true}
              specialOptions={teamSpecialOptions}
            />
          </div>
        </div>
      </div>

      <div className={`accordion-content ${isExpanded ? 'expanded' : ''}`}>
        <div className="table-container">
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              데이터를 불러오는 중...
            </div>
          ) : (
            <DataTable
              isAdmin={isAdmin}
              columns={columns}
              data={data}
              onCellClick={onCellClick}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamPerformanceTable;
