// PORTFOLIO: Mock API
const mockProducts = [
  { id: 1, name: '알파덴탈', code: 'YD-001', type: 'own', status: 'active', price: 49000 },
  { id: 2, name: '베타케어', code: 'AT-001', type: 'own', status: 'active', price: 39000 },
  { id: 3, name: '감마헬스', code: 'DW-001', type: 'own', status: 'active', price: 55000 },
  { id: 4, name: '엡실론임플', code: 'IP-001', type: 'agency', status: 'active', price: 89000 },
];
export const getProducts = async () => ({ success: true, data: mockProducts });
export const createProduct = async (data) => ({ success: true, data: { ...data, id: Date.now() } });
export const updateProduct = async (id, data) => ({ success: true, data: { ...data, id } });
export const deleteProduct = async (id) => ({ success: true });
export const getProductCodes = async () => ({ success: true, data: mockProducts });
export const getChannels = async () => ({ success: true, data: [] });
export const getMediaList = async () => ({ success: true, data: [] });
export const getBoxPrices = async () => ({ success: true, data: [] });
export const saveBoxPrice = async (data) => ({ success: true });
export const getProductById = async (id) => ({ success: true, data: mockProducts.find(p => p.id === id) || null });
