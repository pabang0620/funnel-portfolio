// PORTFOLIO: Mock API - uses mockData.js
export const getMediaOperations = async () => ({ success: true, data: [] });
export const updateMediaOperation = async (id, data) => ({ success: true });
export const getOperationData = async () => ({ success: true, data: [] });
export const getProducts = async () => ({ success: true, data: [] });
export const getMedias = async () => ({ success: true, data: [] });
export const getTeams = async () => ({ success: true, data: [] });
export const toggleOperationStatus = async (id) => ({ success: true });
export const getOperationHistory = async () => ({ success: true, data: [] });
export const canEditTeamData = () => true;
export const getStatusText = (status) => status;
