/**
 * Code Generation 관련 상수 및 Mock 데이터
 */

// Mock 데이터 - 히든 목록 (신규 생성 관리에서 관리)
export const hiddenList = [
  { id: 1, number: "17", name: "카카오" },
  { id: 2, number: "21", name: "쿠팡" },
  { id: 3, number: "25", name: "네이버" },
  { id: 4, number: "30", name: "구글" },
];

// Mock 데이터 - 제품 목록 (히든 번호 포함)
export const products = [
  {
    id: 1,
    name: "알파덴탈",
    hiddenNumbers: [{ id: 1, number: "17", name: "카카오" }],
  },
  {
    id: 2,
    name: "베타케어",
    hiddenNumbers: [{ id: 1, number: "21", name: "쿠팡" }],
  },
  {
    id: 3,
    name: "감마헬스",
    hiddenNumbers: [
      { id: 1, number: "17", name: "카카오" },
      { id: 2, number: "25", name: "네이버" },
    ],
  },
  {
    id: 4,
    name: "델타치과",
    hiddenNumbers: [],
  },
  {
    id: 5,
    name: "엡실론임플",
    hiddenNumbers: [],
  },
  {
    id: 6,
    name: "제타메드",
    hiddenNumbers: [],
  },
];

// 판매처 목록
export const channelOptions = [
  { id: 1, name: "카페24" },
  { id: 2, name: "쿠팡" },
  { id: 3, name: "스마트스토어" },
  { id: 4, name: "ARS" },
];

// Mock 데이터 - 제품+판매처별 히든 연결 (tb_product_channel_hidden)
export const productChannelHiddens = [
  { productId: 1, productName: "알파덴탈", channelId: 1, channelName: "카페24", hiddenId: 1, hiddenNumber: "17", hiddenName: "카카오" },
  { productId: 1, productName: "알파덴탈", channelId: 2, channelName: "쿠팡", hiddenId: 2, hiddenNumber: "21", hiddenName: "쿠팡" },
  { productId: 1, productName: "알파덴탈", channelId: 2, channelName: "쿠팡", hiddenId: 3, hiddenNumber: "25", hiddenName: "네이버" },
  { productId: 2, productName: "베타케어", channelId: 1, channelName: "카페24", hiddenId: 2, hiddenNumber: "21", hiddenName: "쿠팡" },
  { productId: 2, productName: "베타케어", channelId: 3, channelName: "스마트스토어", hiddenId: 3, hiddenNumber: "25", hiddenName: "네이버" },
  { productId: 3, productName: "감마헬스", channelId: 1, channelName: "카페24", hiddenId: 1, hiddenNumber: "17", hiddenName: "카카오" },
  { productId: 3, productName: "감마헬스", channelId: 2, channelName: "쿠팡", hiddenId: 3, hiddenNumber: "25", hiddenName: "네이버" },
  { productId: 3, productName: "감마헬스", channelId: 3, channelName: "스마트스토어", hiddenId: 1, hiddenNumber: "17", hiddenName: "카카오" },
  { productId: 3, productName: "감마헬스", channelId: 3, channelName: "스마트스토어", hiddenId: 4, hiddenNumber: "30", hiddenName: "구글" },
];

// 판매처별 색상 매핑
export const channelColors = {
  "카페24": { bg: "#e3f2fd", text: "#1565c0", border: "#90caf9" },
  "쿠팡": { bg: "#fff3e0", text: "#e65100", border: "#ffcc80" },
  "스마트스토어": { bg: "#e8f5e9", text: "#2e7d32", border: "#a5d6a7" },
  "ARS": { bg: "#f3e5f5", text: "#7b1fa2", border: "#ce93d8" },
};

// 박스 갯수 옵션 (1-5 + 직접입력)
export const boxCountOptions = [
  { id: 1, name: "1" },
  { id: 2, name: "2" },
  { id: 3, name: "3" },
  { id: 4, name: "4" },
  { id: 5, name: "5" },
  { id: 999, name: "직접입력" },
];

// Mock 데이터 - 박스별 가격 목록
export const initialBoxPriceList = [
  {
    id: 1,
    product: "알파덴탈",
    channel: "카페24",
    fee: 5,
    registeredDate: "2025-11-15",
    lastModifiedDate: "2025-11-20",
    boxPrices: [
      { boxCount: 1, price: 50000, shippingFee: 3000 },
      { boxCount: 2, price: 95000, shippingFee: 3000 },
      { boxCount: 3, price: 140000, shippingFee: 0 },
    ],
    hiddenPrices: {
      "1_카카오": { price: 48000, shippingFee: 3000 },
      "2_카카오": { price: 92000, shippingFee: 3000 },
    },
    priceHistory: [
      {
        id: 1,
        startDate: "2025-11-15",
        endDate: "2025-11-19",
        fee: 5,
        boxPrices: [
          { boxCount: 1, price: 48000, shippingFee: 3000 },
          { boxCount: 2, price: 90000, shippingFee: 3000 },
        ],
        hiddenPrices: {
          "1_카카오": { price: 46000, shippingFee: 3000 },
        },
      },
      {
        id: 2,
        startDate: "2025-11-20",
        endDate: null,
        fee: 5,
        boxPrices: [
          { boxCount: 1, price: 50000, shippingFee: 3000 },
          { boxCount: 2, price: 95000, shippingFee: 3000 },
          { boxCount: 3, price: 140000, shippingFee: 0 },
        ],
        hiddenPrices: {
          "1_카카오": { price: 48000, shippingFee: 3000 },
          "2_카카오": { price: 92000, shippingFee: 3000 },
        },
      },
    ],
  },
  {
    id: 2,
    product: "감마헬스",
    channel: "쿠팡",
    fee: 7,
    registeredDate: "2025-11-16",
    lastModifiedDate: null,
    boxPrices: [
      { boxCount: 1, price: 52000, shippingFee: 2500 },
      { boxCount: 2, price: 100000, shippingFee: 2500 },
    ],
    hiddenPrices: {
      "1_카카오": { price: 50000, shippingFee: 2500 },
      "1_네이버": { price: 51000, shippingFee: 2500 },
      "2_카카오": { price: 96000, shippingFee: 2500 },
      "2_네이버": { price: 98000, shippingFee: 2500 },
    },
    priceHistory: [
      {
        id: 1,
        startDate: "2025-11-16",
        endDate: null,
        fee: 7,
        boxPrices: [
          { boxCount: 1, price: 52000, shippingFee: 2500 },
          { boxCount: 2, price: 100000, shippingFee: 2500 },
        ],
        hiddenPrices: {
          "1_카카오": { price: 50000, shippingFee: 2500 },
          "1_네이버": { price: 51000, shippingFee: 2500 },
          "2_카카오": { price: 96000, shippingFee: 2500 },
          "2_네이버": { price: 98000, shippingFee: 2500 },
        },
      },
    ],
  },
];

// Mock 데이터 - 초기 등록된 코드 목록
export const initialCodeList = [
  {
    id: 1,
    code: "UD4EA1E01",
    product: "알파덴탈",
    channels: ["카페24", "쿠팡"],
    boxCount: 10,
    selectedHiddens: ["카카오", "쿠팡"],
    registeredDate: "2025-11-15",
    lastModifiedDate: null,
  },
  {
    id: 2,
    code: "IT2BC3F02",
    product: "베타케어",
    channels: ["스마트스토어"],
    boxCount: 5,
    selectedHiddens: ["네이버"],
    registeredDate: "2025-11-16",
    lastModifiedDate: null,
  },
  {
    id: 3,
    code: "DW5FA2G03",
    product: "감마헬스",
    channels: ["쿠팡"],
    boxCount: 8,
    selectedHiddens: ["카카오", "네이버"],
    registeredDate: "2025-11-18",
    lastModifiedDate: null,
  },
];

export const productOptions = products;
