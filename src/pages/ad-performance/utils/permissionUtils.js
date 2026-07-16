/**
 * 권한 키 생성
 */
export const createPermissionKey = (pageId, groupName, displayName) => {
  return `${pageId}_${groupName}_${displayName}`;
};

/**
 * 컬럼 정의에서 권한 기반으로 필터링
 */
export const filterColumnsByPermission = (
  columnDefs,
  hasPermission,
  pageId,
  isAdmin = false,
  groupName = 'table-columns'
) => {
  return columnDefs.filter(col => {
    // className이 없으면 항상 표시
    if (!col.className) return true;

    // S등급은 모든 컬럼 표시
    if (isAdmin) return true;

    // 권한 체크: className을 displayName으로 사용
    const permKey = `${pageId}_${groupName}_${col.className}`;
    return hasPermission(permKey);
  });
};

/**
 * 권한 키 파싱
 */
export const parsePermissionKey = (permissionKey) => {
  const parts = permissionKey.split('_');
  return {
    pageId: parts[0],
    groupName: parts[1],
    displayName: parts.slice(2).join('_')
  };
};
