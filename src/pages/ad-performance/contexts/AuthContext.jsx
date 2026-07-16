// PORTFOLIO: Auth replaced with mock - no real API calls
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

// Mock user for portfolio demo
const MOCK_USER = {
  userId: 1,
  username: 'admin',
  name: '관리자',
  teamName: '경영팀',
  parentTeamName: '본사',
  roleCode: 'S',
  roleId: 1,
  roleName: '최고관리자',
  teamId: 1,
  parentTeamId: null,
};

/**
 * AuthContext Provider - Portfolio mock version
 */
export const AuthProvider = ({ children }) => {
  const [user] = useState(MOCK_USER);

  const login = () => {};
  const logout = () => {};
  const checkTokenExpiry = () => true;

  const value = {
    user,
    loading: false,
    login,
    logout,
    checkTokenExpiry,
    userId: MOCK_USER.userId,
    userName: MOCK_USER.name,
    userRole: MOCK_USER.roleCode,
    roleId: MOCK_USER.roleId,
    roleName: MOCK_USER.roleName,
    teamId: MOCK_USER.teamId,
    userTeam: MOCK_USER.teamName,
    parentTeamId: MOCK_USER.parentTeamId,
    parentTeam: MOCK_USER.parentTeamName,
    isAuthenticated: true,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * AuthContext를 사용하는 Hook
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다');
  }
  return context;
};

export default AuthContext;