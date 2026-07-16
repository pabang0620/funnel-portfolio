// PORTFOLIO: Mock API
const mockPermissions = {
  'S': { 'executive-report-sales': { '*': true }, 'marketing-report': { '*': true } },
  'A': { 'executive-report-sales': { 'executive-report-sales_page-access_page-view': true } },
};
export const getPermissions = async (roleCode) => ({ success: true, data: mockPermissions[roleCode] || {} });
export const getAllPermissions = async () => ({ success: true, data: mockPermissions });
export const savePermissions = async (roleCode, permissions) => ({ success: true });
export const updatePermissions = async (roleCode, permissions) => ({ success: true });
export const getRolePermissions = async (pageId, roleId) => ({ success: true, data: { permissions: {} } });
export const saveRolePermissions = async (pageId, roleId, permissions) => ({ success: true });
export const getAllPages = async () => ({ success: true, data: [
  { id: 'executive-report-sales', name: '경영 리포트' },
  { id: 'marketing-report', name: '마케팅 리포트' },
]});
