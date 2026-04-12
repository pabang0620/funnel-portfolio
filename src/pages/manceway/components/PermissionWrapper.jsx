import { usePermissions } from '../hooks/usePermissions';
import { useAuth } from '../contexts/AuthContext';

const PermissionWrapper = ({
  pageId,
  groupName,
  displayName,
  hideIfDenied = true,
  fallback = null,
  children
}) => {
  const { userRole } = useAuth();
  const { hasPermission, isLoading } = usePermissions(pageId);

  const isAdmin = userRole === 'S';
  const permissionKey = `${pageId}_${groupName}_${displayName}`;
  const hasAccess = isLoading || isAdmin || hasPermission(permissionKey);

  if (isLoading) return null;

  if (!hasAccess) {
    return hideIfDenied ? null : fallback;
  }

  return children;
};

export default PermissionWrapper;
