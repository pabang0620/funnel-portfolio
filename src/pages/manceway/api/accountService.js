// PORTFOLIO: Mock API
export const getAccountInfo = async () => ({ success: true, data: { id: 1, username: 'admin', name: '관리자', roleCode: 'S' } });
export const updateAccountInfo = async (data) => ({ success: true, data });
