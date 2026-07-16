// PORTFOLIO: Mock API
const mockMediaList = [
  { id: 1, name: '구글' }, { id: 2, name: '메타' }, { id: 3, name: '틱톡' },
  { id: 4, name: 'GFA' }, { id: 5, name: '쿠팡' }, { id: 6, name: '네이버SA' },
];
const mockProductList = [
  { id: 1, name: '알파덴탈' }, { id: 2, name: '베타케어' }, { id: 3, name: '감마헬스' },
];
const genBool = () => Math.random() > 0.3;
export const getDataEntryStatus = async (params) => {
  const dates = [];
  const start = new Date(params?.startDate || '2025-01-01');
  const end = new Date(params?.endDate || '2025-01-31');
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0]);
  }
  const data = mockMediaList.map(media => {
    const row = { mediaId: media.id, mediaName: media.name };
    mockProductList.forEach(product => {
      dates.forEach(date => {
        row[`${product.id}_${date}`] = genBool();
      });
    });
    return row;
  });
  return { success: true, data, dates, products: mockProductList, media: mockMediaList };
};
export const getDataEntryHistory = async () => ({ success: true, data: [] });
export const getEntryStatusByDateRange = async (params) => ({ success: true, data: [] });
export const getEntryHistory = async () => ({ success: true, data: [] });
export const getMediaList = async () => ({ success: true, data: mockMediaList });
export const getProductList = async () => ({ success: true, data: mockProductList });
