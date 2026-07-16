// PORTFOLIO: All permissions granted (S-grade mock user)
import { createContext, useContext, useCallback } from 'react';

const PermissionsContext = createContext(null);

export const PermissionsProvider = ({ children }) => {
  const permissionsCache = {};
  const isLoading = false;
  const isInitialized = true;

  const getPagePermissions = useCallback(() => ({}), []);
  const hasPermission = useCallback(() => true, []);
  const refreshPermissions = useCallback(() => {}, []);

  const value = {
    permissionsCache,
    isLoading,
    isInitialized,
    getPagePermissions,
    hasPermission,
    refreshPermissions,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissionsContext = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissionsContext must be used within PermissionsProvider');
  }
  return context;
};
