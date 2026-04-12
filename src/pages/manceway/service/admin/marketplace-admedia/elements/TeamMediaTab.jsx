import React, { useState, useEffect } from "react";
import "./TeamMediaTab.css";

function TeamMediaTab({
  // 상태
  teams,
  medias,
  selectedTeam,
  loading,
  saving,
  hasChanges,

  // 핸들러
  handleTeamSelect,
  handleMediaToggle,
  handleParentMediaToggle,
  handleSave,
  isMediaAssignedToSelectedTeam,
  isMediaFromParent,
  isMediaReadOnly,
  isParentMediaFullySelected,
  isParentMediaPartiallySelected,
  getChildTeamsWithMedia,
}) {
  const [expandedTeams, setExpandedTeams] = useState({});
  const [expandedMedias, setExpandedMedias] = useState({});

  // 팀 데이터 로드 시 모든 팀을 펼친 상태로 초기화
  useEffect(() => {
    if (teams.length > 0) {
      const allExpanded = {};
      teams.forEach(team => {
        if (team.hasChildren) {
          allExpanded[team.id] = true;
        }
      });
      setExpandedTeams(allExpanded);
    }
  }, [teams]);

  // 매체 데이터 로드 시 모든 매체를 펼친 상태로 초기화
  useEffect(() => {
    if (medias.length > 0) {
      const allExpanded = {};
      medias.forEach(media => {
        if (media.children && media.children.length > 0) {
          allExpanded[media.id] = true;
        }
      });
      setExpandedMedias(allExpanded);
    }
  }, [medias]);

  // 팀 펼치기/접기 토글
  const toggleExpandTeam = (teamId) => {
    setExpandedTeams(prev => ({
      ...prev,
      [teamId]: !prev[teamId]
    }));
  };

  // 매체 펼치기/접기 토글
  const toggleExpandMedia = (mediaId) => {
    setExpandedMedias(prev => ({
      ...prev,
      [mediaId]: !prev[mediaId]
    }));
  };

  if (loading) {
    return (
      <div className="tab-content">
        <div className="loading-container">
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <div className="team-media-management">
        {/* 왼쪽: 팀 목록 (트리 구조) */}
        <div className="team-list-section">
          <h3>팀 선택</h3>
          <div className="team-list">
            {teams.map((parentTeam) => (
              <div key={parentTeam.id} className="team-group">
                {/* 부모팀 */}
                <div className="team-item parent-team">
                  <label className="team-radio">
                    <input
                      type="radio"
                      name="selectedTeam"
                      value={parentTeam.id}
                      checked={selectedTeam?.id === parentTeam.id && selectedTeam?.isParent}
                      onChange={() => handleTeamSelect(parentTeam, true)}
                    />
                    <span className="team-name">
                      {parentTeam.name}
                      {!parentTeam.hasChildren && (
                        <span className="no-children-label">(세부팀 없음)</span>
                      )}
                    </span>
                  </label>
                  {parentTeam.hasChildren && (
                    <button
                      type="button"
                      className="expand-btn"
                      onClick={() => toggleExpandTeam(parentTeam.id)}
                    >
                      {expandedTeams[parentTeam.id] ? '▼' : '▶'}
                    </button>
                  )}
                </div>

                {/* 자식팀 목록 */}
                {parentTeam.hasChildren && expandedTeams[parentTeam.id] && (
                  <div className="children-teams">
                    {parentTeam.children.map((childTeam) => (
                      <div key={childTeam.id} className="team-item child-team">
                        <label className="team-radio">
                          <input
                            type="radio"
                            name="selectedTeam"
                            value={childTeam.id}
                            checked={selectedTeam?.id === childTeam.id && !selectedTeam?.isParent}
                            onChange={() => handleTeamSelect(childTeam, false)}
                          />
                          <span className="team-name">{childTeam.name}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽: 매체 할당 */}
        <div className="media-assignment-section">
          <h3>매체 할당</h3>
          {selectedTeam ? (
            <>
              <div className="selected-team-info">
                <p>
                  선택된 팀: <strong>{selectedTeam.name}</strong>
                  {selectedTeam.isParent && selectedTeam.hasChildren && (
                    <span className="parent-team-badge">(부모팀)</span>
                  )}
                </p>
              </div>

              <div className="media-list">
                {medias.map((parentMedia) => {
                  const hasChildren = parentMedia.children && parentMedia.children.length > 0;
                  const isFullySelected = hasChildren && isParentMediaFullySelected(parentMedia.id);
                  const isPartiallySelected = hasChildren && isParentMediaPartiallySelected(parentMedia.id);

                  return (
                    <div key={parentMedia.id} className="media-group">
                      {/* 부모 매체 */}
                      <div className="media-item parent-media">
                        <label className={`media-checkbox ${saving ? 'disabled' : ''}`}>
                          <input
                            type="checkbox"
                            checked={isFullySelected}
                            ref={el => {
                              if (el) el.indeterminate = isPartiallySelected && !isFullySelected;
                            }}
                            disabled={saving || !hasChildren}
                            onChange={() => handleParentMediaToggle(parentMedia.id)}
                          />
                          <span className="media-name parent-media-name">{parentMedia.name}</span>
                          {hasChildren && (
                            <span className="media-count">({parentMedia.children.length})</span>
                          )}
                        </label>
                        {hasChildren && (
                          <button
                            type="button"
                            className="expand-btn"
                            onClick={() => toggleExpandMedia(parentMedia.id)}
                          >
                            {expandedMedias[parentMedia.id] ? '▼' : '▶'}
                          </button>
                        )}
                      </div>

                      {/* 세부 매체 목록 */}
                      {hasChildren && expandedMedias[parentMedia.id] && (
                        <div className="children-medias">
                          {parentMedia.children.map((childMedia) => {
                            const mediaInfo = isMediaAssignedToSelectedTeam(childMedia.id);
                            const isFromParent = isMediaFromParent(childMedia.id);
                            const isReadOnly = isMediaReadOnly(childMedia.id);
                            const isDisabled = saving || isReadOnly;

                            // 배지 및 스타일 클래스 결정
                            let badgeText = '';
                            let badgeClass = '';
                            let itemClass = '';

                            if (selectedTeam?.isParent) {
                              // 부모팀 선택 시
                              if (mediaInfo.source === 'parent') {
                                badgeText = '부모팀 설정';
                                badgeClass = 'parent';
                                itemClass = 'parent-assigned';
                              } else if (mediaInfo.source === 'child') {
                                badgeText = `${mediaInfo.childTeams?.join(', ')} 선택`;
                                badgeClass = 'child';
                                itemClass = 'child-assigned';
                              } else if (mediaInfo.source === 'both') {
                                badgeText = `부모팀 + ${mediaInfo.childTeams?.join(', ')}`;
                                badgeClass = 'both';
                                itemClass = 'both-assigned';
                              }
                            } else {
                              // 자식팀 선택 시 (기존 로직)
                              if (isFromParent) {
                                badgeText = '부모팀 할당';
                                badgeClass = 'parent';
                                itemClass = 'parent-assigned';
                              } else if (mediaInfo.source === 'own') {
                                badgeText = '개별 선택';
                                badgeClass = 'own';
                              }
                            }

                            return (
                              <div key={childMedia.id} className="media-item child-media">
                                <label className={`media-checkbox ${isDisabled ? 'disabled' : ''} ${itemClass}`}>
                                  <input
                                    type="checkbox"
                                    checked={mediaInfo.assigned}
                                    disabled={isDisabled}
                                    onChange={() => handleMediaToggle(childMedia.id)}
                                  />
                                  <span className="media-name">{childMedia.name}</span>
                                  {badgeText && (
                                    <span className={`media-source-badge ${badgeClass}`}>{badgeText}</span>
                                  )}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="save-section">
                <button
                  type="button"
                  className="save-button"
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                >
                  {saving ? '저장 중...' : '저장'}
                </button>
              </div>
            </>
          ) : (
            <div className="no-team-selected">
              <p>팀을 선택해주세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeamMediaTab;
