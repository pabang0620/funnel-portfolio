// PORTFOLIO: Mock API
const mockOrders = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  orderId: `SO-${String(20250000 + i).padStart(8, '0')}`,
  date: `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
  customerName: ['홍길동', '김철수', '이영희', '박민준'][i % 4],
  product: ['알파덴탈', '베타케어', '감마헬스'][i % 3],
  marketplace: ['쿠팡', '스마트스토어', '11번가'][i % 3],
  quantity: Math.floor(Math.random() * 5) + 1,
  amount: Math.floor(Math.random() * 200000) + 30000,
  status: ['처리중', '완료', '취소'][i % 3],
}));
export const getSalesOrders = async () => ({ success: true, data: mockOrders });
export const getSalesOrderById = async (id) => ({ success: true, data: mockOrders.find(o => o.id === id) });
export const updateSalesOrder = async (id, data) => ({ success: true, data: { ...data, id } });
export const deleteSalesOrder = async (id) => ({ success: true });
export const bulkDeleteSalesOrders = async (ids) => ({ success: true });
export const getSalesBatches = async () => ({ success: true, data: [] });
export const deleteSalesBatch = async (id) => ({ success: true });
