/**
 * 권한 및 팀 기반 접근 제어 유틸리티
 */

/**
 * 사용자 팀이 온라인 팀 계열인지 확인 (부모팀 기반)
 * @param {string} userTeam - 사용자 팀명 (사용하지 않음, 호환성 유지)
 * @returns {boolean} - 온라인 팀 계열 여부
 */
const isOnlineTeamMember = (parentTeam) => {
  return parentTeam === '온라인';
};

/**
 * 사용자 팀이 퍼포먼스 팀 계열인지 확인 (부모팀 기반)
 * @param {string} userTeam - 사용자 팀명 (사용하지 않음, 호환성 유지)
 * @returns {boolean} - 퍼포먼스 팀 계열 여부
 */
const isPerformanceTeamMember = (parentTeam) => {
  return parentTeam === '퍼포먼스';
};

/**
 * 퍼포먼스 팀의 C등급인지 확인
 * @param {string} userRole - 사용자 권한
 * @param {string} userTeam - 사용자 팀명
 * @returns {boolean} - 퍼포먼스 C등급 여부
 */
export const isPerformanceCLevel = (userRole, parentTeam) => {
  return userRole === 'C' && isPerformanceTeamMember(parentTeam);
};

/**
 * 사용자가 특정 메뉴에 접근 가능한지 확인
 * @param {string} menuPath - 메뉴 경로
 * @param {string} userRole - 사용자 권한 (S, A, B, C)
 * @param {string} parentTeam - 부모팀명
 * @returns {boolean} - 접근 가능 여부
 */
export const hasMenuAccess = (menuPath, userRole, parentTeam) => {
  // S 권한(임원)은 팀 구분 없이 모든 페이지 접근 가능
  if (userRole === "S") {
    return true;
  }


  // 메뉴별 접근 제어 규칙
  const accessRules = {
    "/executive-report": {
      roles: ["S", "A", "B", "C"], // 모든 등급 접근 가능
      teams: null, // 모든 팀
    },
    "/marketing-report": {
      roles: ["S", "A", "B", "C"], // 모든 등급 접근 가능
      teams: null, // 모든 팀
    },
    "/media-operations": {
      roles: ["S", "A", "B"], // C 등급 제외
      teams: null, // 모든 팀
    },
    "/data-entry-status": {
      roles: ["S", "A"], // S, A 등급만
      teams: null, // 모든 팀
    },
    "/data-entry-history": {
      roles: ["S", "A"], // S, A 등급만
      teams: null, // 모든 팀
    },
    "/customer-management": {
      roles: null, // 모든 등급
      teams: null, // 모든 팀
    },
    "/management-resources/account-creation": {
      roles: ["S", "A", "B", "C"], // 모든 등급 (생성/수정 권한은 Page에서 별도 체크)
      teams: null, // 모든 팀
    },
    "/management-resources/permission-settings": {
      roles: ["S", "A", "B", "C"], // 모든 등급 접근 가능 (페이지 내에서 버튼 동작 제어)
      teams: null,
    },
    "/management-resources/product-management": {
      roles: ["S", "A"], // S, A 등급만
      teams: null, // 모든 팀
    },
    "/management-resources/marketplace-admedia": {
      roles: ["S", "A", "B"],
      teams: null,
    },
  };

  const rule = accessRules[menuPath];

  // 규칙이 정의되지 않은 경우 접근 허용 (기본 동작)
  if (!rule) {
    return true;
  }

  // 권한 체크
  if (rule.roles !== null && !rule.roles.includes(userRole)) {
    return false;
  }

  // 팀 체크
  if (rule.teams !== null && !rule.teams.includes(userTeam)) {
    return false;
  }

  return true;
};

/**
 * 부모 메뉴가 표시되어야 하는지 확인 (서브메뉴 기반)
 * @param {Object} menuItem - 메뉴 항목 (subItems 포함 가능)
 * @param {string} userRole - 사용자 권한
 * @param {string} parentTeam - 부모팀명
 * @returns {boolean} - 부모 메뉴 표시 여부
 */
export const shouldShowParentMenu = (menuItem, userRole, parentTeam) => {
  if (!menuItem.subItems || menuItem.subItems.length === 0) {
    return hasMenuAccess(menuItem.path, userRole, parentTeam);
  }

  // 최소 하나의 서브메뉴에 접근 가능하면 부모 메뉴 표시
  return menuItem.subItems.some((subItem) =>
    hasMenuAccess(subItem.path, userRole, parentTeam)
  );
};

/**
 * 접근 가능한 서브메뉴만 필터링
 * @param {Array} subItems - 서브메뉴 배열
 * @param {string} userRole - 사용자 권한
 * @param {string} parentTeam - 부모팀명
 * @returns {Array} - 필터링된 서브메뉴 배열
 */
export const filterAccessibleSubItems = (subItems, userRole, parentTeam) => {
  if (!subItems) return [];

  return subItems.filter((subItem) =>
    hasMenuAccess(subItem.path, userRole, parentTeam)
  );
};
