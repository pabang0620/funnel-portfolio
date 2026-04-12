// PORTFOLIO: Mock API
const genInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const mockCSData = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  date: `2025-${String(Math.floor(i / 2) % 12 + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
  orderId: `ORD-${String(10000 + i).padStart(6, '0')}`,
  customerName: ['홍길동', '김철수', '이영희', '박민준'][i % 4],
  product: ['알파덴탈', '베타케어', '감마헬스'][i % 3],
  marketplace: ['쿠팡', '스마트스토어', '11번가'][i % 3],
  status: ['처리중', '완료', '취소'][i % 3],
  amount: genInt(30000, 150000),
}));
export const getCSData = async () => ({ success: true, data: mockCSData });
export const uploadCSData = async (data) => ({ success: true, message: '업로드 완료' });
export const getShippingData = async () => ({ success: true, data: mockCSData.slice(0, 10) });
export const updateCSStatus = async (id, status) => ({ success: true });
export const getMappingData = async () => ({ success: true, data: [] });
export const saveMappingData = async (data) => ({ success: true });
