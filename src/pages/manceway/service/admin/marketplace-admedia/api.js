// PORTFOLIO: Mock API
const mockMarketplaces = [
  { id: 1, name: '카페24', type: 'marketplace', status: 'active' },
  { id: 2, name: '쿠팡', type: 'marketplace', status: 'active' },
  { id: 3, name: '스마트스토어', type: 'marketplace', status: 'active' },
  { id: 4, name: '11번가', type: 'marketplace', status: 'active' },
];
const mockMedia = [
  { id: 1, name: '구글', type: 'media', status: 'active' },
  { id: 2, name: '메타', type: 'media', status: 'active' },
  { id: 3, name: '틱톡', type: 'media', status: 'active' },
  { id: 4, name: '네이버SA', type: 'media', status: 'active' },
];
export const getMarketplaces = async () => ({ success: true, data: mockMarketplaces });
export const getChildMarketPlaces = async () => ({ success: true, data: [] });
export const getMediaList = async () => ({ success: true, data: mockMedia });
export const createMarketplace = async (data) => ({ success: true, data: { ...data, id: Date.now() } });
export const updateMarketplace = async (id, data) => ({ success: true, data: { ...data, id } });
export const deleteMarketplace = async (id) => ({ success: true });
export const createMedia = async (data) => ({ success: true, data: { ...data, id: Date.now() } });
export const updateMedia = async (id, data) => ({ success: true, data: { ...data, id } });
export const deleteMedia = async (id) => ({ success: true });
export const getTeamMediaAssignments = async () => ({ success: true, data: [] });
export const saveTeamMediaAssignment = async (data) => ({ success: true });
