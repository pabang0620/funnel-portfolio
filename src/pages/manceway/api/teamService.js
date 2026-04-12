// PORTFOLIO: Mock API
export const getTeams = async () => ({ success: true, data: [
  { id: 1, name: '경영팀', parentId: null },
  { id: 2, name: '영업1팀', parentId: 1 },
  { id: 3, name: '마케팅팀', parentId: 1 },
]});
