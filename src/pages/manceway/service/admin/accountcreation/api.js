// PORTFOLIO: Mock API
const mockAccounts = [
  { id: 1, username: 'admin', name: '관리자', roleCode: 'S', roleName: '최고관리자', teamId: 1, teamName: '경영팀', status: 'active' },
  { id: 2, username: 'user1', name: '김영업', roleCode: 'A', roleName: '팀장', teamId: 2, teamName: '영업1팀', status: 'active' },
  { id: 3, username: 'user2', name: '이마케팅', roleCode: 'B', roleName: '담당자', teamId: 3, teamName: '마케팅팀', status: 'active' },
];
export const getAccounts = async () => ({ success: true, data: mockAccounts });
export const createAccount = async (data) => ({ success: true, data: { ...data, id: Date.now() } });
export const updateAccount = async (id, data) => ({ success: true, data: { ...data, id } });
export const deleteAccount = async (id) => ({ success: true });
export const getTeams = async () => ({ success: true, data: [
  { id: 1, name: '경영팀' }, { id: 2, name: '영업1팀' }, { id: 3, name: '마케팅팀' }
]});
export const getRoles = async () => ({ success: true, data: [
  { id: 1, code: 'S', name: '최고관리자' }, { id: 2, code: 'A', name: '팀장' },
  { id: 3, code: 'B', name: '담당자' }, { id: 4, code: 'C', name: '일반' }
]});
export const resetPassword = async (id) => ({ success: true });
export const getTeamStatus = async () => ({ success: true, data: [] });
export const updateTeamStatus = async (data) => ({ success: true });
