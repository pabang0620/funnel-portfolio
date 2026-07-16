import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faUser,
  faChevronDown,
  faChevronRight,
  faBuilding,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";
import "./TeamStatusTable.css";

function TeamStatusTable({ teams, users }) {
  // 각 팀/팀원의 토글 상태 (세부팀은 항상 펼쳐짐)
  const [expandedTeams, setExpandedTeams] = useState({});
  const [expandedMembers, setExpandedMembers] = useState({});

  // 등급 텍스트 변환
  const getGradeText = (grade) => {
    const gradeMap = {
      S: "임원",
      A: "팀장",
      B: "중간관리자",
      C: "팀원",
    };
    return gradeMap[grade] || grade;
  };

  // 상태 텍스트 변환
  const getStatusText = (status) => {
    return status === 1 ? "재직" : "퇴사";
  };

  // 등급 순서
  const gradeOrder = { S: 0, A: 1, B: 2, C: 3 };

  // 사용자 정렬 (등급순)
  const sortUsersByGrade = (userList) => {
    return [...userList].sort((a, b) => {
      const gradeCompare = gradeOrder[a.roleCode] - gradeOrder[b.roleCode];
      if (gradeCompare !== 0) return gradeCompare;
      return a.name.localeCompare(b.name);
    });
  };

  // 팀별로 사용자 그룹화 - 팀 이름으로 매칭
  const groupUsersByTeam = () => {
    const teamGroups = {};
    const teamNameToId = {}; // 팀 이름 → ID 매핑

    // 모든 팀 초기화
    teams.hierarchy?.forEach((parentTeam) => {
      teamGroups[parentTeam.id] = {
        teamInfo: {
          id: parentTeam.id,
          name: parentTeam.name,
          parentId: null,
          isParent: true,
        },
        users: [],
        subTeams: [],
      };
      teamNameToId[parentTeam.name] = parentTeam.id;

      // 자식팀들
      parentTeam.children?.forEach((childTeam) => {
        teamGroups[childTeam.id] = {
          teamInfo: {
            id: childTeam.id,
            name: childTeam.name,
            parentId: parentTeam.id,
            parentName: parentTeam.name,
            isParent: false,
          },
          users: [],
        };
        teamNameToId[childTeam.name] = childTeam.id;

        teamGroups[parentTeam.id].subTeams.push({
          id: childTeam.id,
          name: childTeam.name,
        });
      });
    });

    // 디버깅
    console.log('=== TeamStatusTable 디버깅 ===');
    console.log('users:', users);
    console.log('users 첫번째:', users?.[0]);
    console.log('teamNameToId:', teamNameToId);
    console.log('teamGroups:', teamGroups);

    // 사용자들을 팀별로 분류 - 팀 이름으로 매칭
    users?.forEach((user) => {
      console.log('user:', user, 'team:', user.team, 'subTeam:', user.subTeam);

      // subTeam이 있으면 세부팀에, 없으면 부모팀에 할당
      const targetTeamName = user.subTeam || user.team;
      const targetTeamId = teamNameToId[targetTeamName];

      if (targetTeamId && teamGroups[targetTeamId]) {
        teamGroups[targetTeamId].users.push(user);
        console.log('✓ 사용자 추가됨:', user.name, '→ 팀:', targetTeamName, '(ID:', targetTeamId, ')');
      } else {
        console.log('✗ 사용자 추가 안됨:', user.name, 'team:', user.team, 'subTeam:', user.subTeam, '→ targetTeamName:', targetTeamName);
      }
    });

    console.log('최종 teamGroups:', teamGroups);

    return teamGroups;
  };

  const teamGroups = groupUsersByTeam();

  // 토글 함수들
  const toggleTeam = (teamId) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }));
  };

  const toggleMembers = (key) => {
    setExpandedMembers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // 부모팀만 필터링
  const parentTeams = Object.values(teamGroups).filter(
    (group) => group.teamInfo.isParent
  );

  // 재직 중인 팀원 수 계산
  const getActiveUserCount = (userList) => {
    return userList.filter((u) => u.status === 1).length;
  };

  return (
    <div className="team-status-table">
      <div className="org-chart-header">
        <h1 className="org-chart-title">Ad Performance</h1>
      </div>
      <div className="org-chart">
        {parentTeams.map((parentGroup) => {
          const sortedDirectMembers = sortUsersByGrade(parentGroup.users);
          const activeDirectMembers = getActiveUserCount(parentGroup.users);
          const directMembersKey = `parent-${parentGroup.teamInfo.id}`;
          const directMembersExpanded = expandedMembers[directMembersKey];

          return (
            <div key={parentGroup.teamInfo.id} className="org-team">
              {/* 팀 헤더 */}
              <div className="org-team-header">
                <FontAwesomeIcon icon={faBuilding} className="org-icon team-icon" />
                <div className="org-team-info">
                  <span className="org-team-name">{parentGroup.teamInfo.name}</span>
                </div>
              </div>

              {/* 팀 내용 (항상 표시) */}
              <div className="org-team-content">
                  {/* 직속 팀원 */}
                  {sortedDirectMembers.length > 0 && (
                    <div className="org-members-section">
                      <div
                        className="members-header"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMembers(directMembersKey);
                        }}
                      >
                        <FontAwesomeIcon
                          icon={directMembersExpanded ? faChevronDown : faChevronRight}
                          className="toggle-icon-sm"
                        />
                        <span className="members-title">직속 팀원 ({activeDirectMembers})</span>
                      </div>

                      {directMembersExpanded && (
                        <div className="org-members-list">
                          {sortedDirectMembers.map((user) => (
                            <div key={user.id} className="org-member-item">
                              <span className="member-name">{user.name}</span>
                              <span className={`grade-badge grade-${user.roleCode?.toLowerCase()}`}>
                                {user.roleCode}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 세부팀들 - 항상 펼쳐진 상태 */}
                  {parentGroup.subTeams.map((subTeam) => {
                    const subGroup = teamGroups[subTeam.id];
                    if (!subGroup) return null;

                    const sortedSubMembers = sortUsersByGrade(subGroup.users);
                    const activeSubMembers = getActiveUserCount(subGroup.users);
                    const subMembersKey = `sub-${subTeam.id}`;
                    const subMembersExpanded = expandedMembers[subMembersKey];

                    return (
                      <div key={subTeam.id} className="org-sub-team">
                        <div className="org-sub-header">
                          <FontAwesomeIcon icon={faUsers} className="org-icon" />
                          <span className="org-sub-name">{subTeam.name}</span>
                          <span className="member-count">{activeSubMembers}명</span>
                        </div>

                        {/* 팀원 목록 토글 */}
                        {sortedSubMembers.length > 0 && (
                          <div className="org-members-section">
                            <div
                              className="members-header"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMembers(subMembersKey);
                              }}
                            >
                              <FontAwesomeIcon
                                icon={subMembersExpanded ? faChevronDown : faChevronRight}
                                className="toggle-icon-sm"
                              />
                              <span className="members-title">팀원 ({activeSubMembers})</span>
                            </div>

                            {subMembersExpanded && (
                              <div className="org-members-list">
                                {sortedSubMembers.map((user) => (
                                  <div key={user.id} className="org-member-item">
                                    <span className="member-name">{user.name}</span>
                                    <span className={`grade-badge grade-${user.roleCode?.toLowerCase()}`}>
                                      {user.roleCode}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TeamStatusTable;
