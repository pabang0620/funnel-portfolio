// PORTFOLIO: Mock daily quote - no real API calls

export const getTodayQuote = async () => {
  return { success: false, data: null };
};

export const getAllQuotes = async () => {
  return { success: true, data: [] };
};

export const createQuote = async (data) => {
  return { success: true, data: { ...data, id: Date.now() } };
};

export const updateQuote = async (id, data) => {
  return { success: true, data: { ...data, id } };
};

export const deleteQuote = async (id) => {
  return { success: true };
};
