import { useMemo, useCallback } from 'react';
import { usePermissionsContext } from '../contexts/PermissionsContext';
import { useAuth } from '../contexts/AuthContext';

/**
 * 권한 관리 Hook (캐시된 데이터 사용)
 * 현재 사용자의 권한을 조회하고 체크하는 기능 제공
 *
 * @param {string} pageId - 조회할 페이지 ID
 * @returns {Object} { permissions, hasPermission, isLoading, roleCode, roleName }
 */
export const usePermissions = (pageId = null) => {
  const { userRole } = useAuth();
  const { getPagePermissions, isLoading, refreshPermissions } = usePermissionsContext();

  // 페이지별 권한 가져오기 (캐시에서)
  const permissions = useMemo(() => {
    if (!pageId) return {};
    return getPagePermissions(pageId);
  }, [pageId, getPagePermissions]);

  // 역할 정보 (토큰에서 추출)
  const roleInfo = useMemo(() => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return { roleCode: '', roleName: '' };

      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        roleCode: payload.roleCode || '',
        roleName: payload.roleName || '',
      };
    } catch (error) {
      return { roleCode: '', roleName: '' };
    }
  }, []);

  /**
   * 특정 권한이 있는지 체크
   * @param {string} permissionId - 권한 ID (예: "executive-report-sales_page-access_page-view")
   * @returns {boolean} 권한 여부
   */
  const hasPermission = useCallback((permissionId) => {
    // S등급은 항상 허용
    if (userRole === 'S') return true;

    // A등급은 새계정 생성 관련만 허용
    if (userRole === 'A' && (
      permissionId === 'admin-account_create-account_create-btn' ||
      permissionId === 'admin-account_create-account_account-form'
    )) return true;

    return permissions[permissionId] === true;
  }, [permissions, userRole]);

  /**
   * 여러 권한 중 하나라도 있는지 체크
   * @param {string[]} permissionIds - 권한 ID 배열
   * @returns {boolean} 하나라도 권한이 있으면 true
   */
  const hasAnyPermission = useCallback((permissionIds) => {
    // S등급은 항상 허용
    if (userRole === 'S') return true;

    return permissionIds.some(id => permissions[id] === true);
  }, [permissions, userRole]);

  /**
   * 모든 권한이 있는지 체크
   * @param {string[]} permissionIds - 권한 ID 배열
   * @returns {boolean} 모든 권한이 있으면 true
   */
  const hasAllPermissions = useCallback((permissionIds) => {
    // S등급은 항상 허용
    if (userRole === 'S') return true;

    return permissionIds.every(id => permissions[id] === true);
  }, [permissions, userRole]);

  return {
    permissions,
    roleCode: roleInfo.roleCode,
    roleName: roleInfo.roleName,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading,
    error: null,
    refetch: refreshPermissions,
  };
};

export default usePermissions;
