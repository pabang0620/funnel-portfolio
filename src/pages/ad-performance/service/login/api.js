// PORTFOLIO: Mock login - always succeeds
export const loginUser = async (credentials) => {
  return {
    success: true,
    token: 'mock-token',
    user: { username: credentials.username, name: '관리자', roleCode: 'S' }
  };
};

export const logoutUser = async () => ({ success: true });
