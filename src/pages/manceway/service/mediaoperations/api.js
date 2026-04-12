// PORTFOLIO: Mock API - uses mockData.js in same directory
export const getMediaOperationsData = async () => ({ success: true, data: [] });
export const getOperationHistory = async () => ({ success: true, data: [] });
export const updateOperationStatus = async (id, data) => ({ success: true });
export const getFilterOptions = async () => ({ success: true, data: { media: [], products: [], teams: [] } });
