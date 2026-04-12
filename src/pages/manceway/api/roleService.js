// PORTFOLIO: Mock API
export const getRoles = async () => ({ success: true, data: [
  { id: 1, code: 'S', name: '최고관리자' },
  { id: 2, code: 'A', name: '팀장' },
  { id: 3, code: 'B', name: '담당자' },
  { id: 4, code: 'C', name: '일반' },
]});
