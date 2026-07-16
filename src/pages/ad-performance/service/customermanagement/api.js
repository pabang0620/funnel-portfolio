// PORTFOLIO: Mock API
const mockCustomers = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  name: `고객${i + 1}`,
  phone: `010-${String(1000 + i).padStart(4, '0')}-${String(2000 + i).padStart(4, '0')}`,
  email: `customer${i + 1}@example.com`,
  grade: ['VIP', '일반', '신규'][i % 3],
  totalOrders: Math.floor(Math.random() * 20) + 1,
  totalAmount: Math.floor(Math.random() * 1000000) + 50000,
}));
export const getCustomers = async () => ({ success: true, data: mockCustomers });
export const getCustomerById = async (id) => ({ success: true, data: mockCustomers.find(c => c.id === id) });
export const updateCustomer = async (id, data) => ({ success: true, data: { ...data, id } });
