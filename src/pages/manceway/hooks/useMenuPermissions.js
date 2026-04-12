import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissionsContext } from '../contexts/PermissionsContext';

/**
 * 메뉴별 pageId 매핑 (DB의 실제 pageId와 일치해야 함)
 */
const MENU_PATH_TO_PAGE_ID = {
  '/executive-report': 'executive-report-sales',
  '/marketing-report': 'marketing-report',
  '/media-operations': 'media-operations',
  '/data-entry-status': 'data-entry-status',
  '/data-entry-history': 'data-entry-status', // history는 status와 같은 권한 사용
  '/customer-management': 'customer-management', // DB에 없으면 추가 필요
  '/cs-management/data': 'cs-data',
  '/cs-management/shipping': 'cs-data',
  '/management-resources/account-creation': 'admin-account',
  '/management-resources/permission-settings': 'admin-permissions',
  '/management-resources/product-management': 'admin-product-management',
  '/management-resources/marketplace-admedia': 'admin-marketplace-admedia',
  '/management-resources/daily-quotes': 'admin-daily-quotes',
};

/**
 * 사이드바 메뉴 권한 관리 훅 (캐시된 데이터 사용)
 * 모든 페이지의 page-access 권한을 캐시에서 가져와 메뉴 표시 여부를 결정
 */
export const useMenuPermissions = () => {
  const { userRole, teamId, parentTeamId } = useAuth();
  const { permissionsCache, isLoading } = usePermissionsContext();

  // 캐시된 권한 데이터에서 메뉴 권한 추출
  const menuPermissions = useMemo(() => {
    if (isLoading) return {};

    const permissions = {};

    // S등급은 모든 메뉴 허용
    if (userRole === 'S') {
      Object.keys(MENU_PATH_TO_PAGE_ID).forEach(menuPath => {
        permissions[menuPath] = true;
      });
      return permissions;
    }

    // 각 메뉴별 page-access 권한 체크
    Object.entries(MENU_PATH_TO_PAGE_ID).forEach(([menuPath, pageId]) => {
      const pagePerms = permissionsCache[pageId] || {};
      const pageAccessKey = `${pageId}_page-access_page-view`;

      // 권한이 없으면 customer-management는 기본 허용 (하위 호환성)
      if (pageId === 'customer-management' && !pagePerms[pageAccessKey]) {
        permissions[menuPath] = true;
      } else {
        permissions[menuPath] = pagePerms[pageAccessKey] === true;
      }
    });

    return permissions;
  }, [permissionsCache, isLoading, userRole]);

  /**
   * 특정 메뉴 경로에 대한 접근 권한 확인
   */
  const hasMenuAccess = useMemo(() => {
    return (menuPath) => {
      // 로딩 중이면 일시적으로 허용 (깜빡임 방지)
      if (isLoading) return true;

      // S등급은 항상 허용
      if (userRole === 'S') return true;

      // CS 관리 메뉴는 teamId === 4 또는 parentTeamId === 4인 팀만 접근 가능
      if (menuPath === '/cs-management/data' || menuPath === '/cs-management/shipping') {
        return teamId === 4 || parentTeamId === 4;
      }

      // 나머지 메뉴는 DB 기반 페이지 접근 권한으로 제어
      return menuPermissions[menuPath] === true;
    };
  }, [menuPermissions, isLoading, userRole, teamId, parentTeamId]);

  /**
   * 부모 메뉴 표시 여부 (서브메뉴 중 하나라도 접근 가능하면 표시)
   */
  const shouldShowParentMenu = useMemo(() => {
    return (menuItem) => {
      if (!menuItem.subItems || menuItem.subItems.length === 0) {
        return hasMenuAccess(menuItem.path);
      }

      // 최소 하나의 서브메뉴에 접근 가능하면 부모 메뉴 표시
      return menuItem.subItems.some((subItem) => hasMenuAccess(subItem.path));
    };
  }, [hasMenuAccess]);

  /**
   * 접근 가능한 서브메뉴만 필터링
   */
  const filterAccessibleSubItems = useMemo(() => {
    return (subItems) => {
      if (!subItems) return [];
      return subItems.filter((subItem) => hasMenuAccess(subItem.path));
    };
  }, [hasMenuAccess]);

  return {
    hasMenuAccess,
    shouldShowParentMenu,
    filterAccessibleSubItems,
    isLoading,
  };
};
