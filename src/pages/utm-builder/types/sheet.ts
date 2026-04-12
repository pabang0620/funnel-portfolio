export type ColKey =
  | 'product'
  | 'marketer'
  | 'planner'
  | 'creator'
  | 'media'
  | 'contentType'
  | 'placement'
  | 'landing'
  | 'sequence'
  | 'utmCode'
  | 'adUrl';

// UTM 코드 생성 순서: ue_[매체][랜딩][콘텐츠타입][지면/구좌][제품][기획자][마케터][제작자][시퀀스]
export const COLS: ColKey[] = [
  'media', 'landing', 'contentType', 'placement',
  'product', 'planner', 'marketer', 'creator',
  'sequence', 'utmCode', 'adUrl',
];

export const COL_LABELS: Record<ColKey, string> = {
  product: '제품',
  marketer: '마케터',
  planner: '기획자',
  creator: '제작자',
  media: '매체',
  contentType: '콘텐츠타입',
  placement: '지면/구좌',
  landing: '랜딩번호',
  sequence: '시퀀스',
  utmCode: 'UTM 코드',
  adUrl: '광고 URL',
};

export const COL_WIDTHS: Record<ColKey, number> = {
  product: 96,
  marketer: 88,
  planner: 88,
  creator: 88,
  media: 80,
  contentType: 96,
  placement: 96,
  landing: 64,
  sequence: 56,
  utmCode: 200,
  adUrl: 260,
};

// 기존 행 (mock에서 로드, 읽기 전용)
export interface ExistingRow {
  kind: 'existing';
  id: string;
  productName: string;
  brandName: string;
  marketerName: string;
  plannerName: string;
  creatorName: string;
  mediaName: string;
  contentTypeName: string;
  placementName: string;
  landingNumber: string;
  sequence: string;
  utmCode: string;
  adUrl: string;
  createdAt: string;
  mediaInitial: string;
  contentTypeInitial: string;
  placementInitial: string;
  plannerInitial: string;
  marketerInitial: string;
  creatorInitial: string;
}

// 신규 행 (사용자 입력 중)
export interface NewRow {
  kind: 'new';
  id: string; // 로컬 임시 ID
  productId: string | null;
  marketerId: string;
  plannerId: string;
  creatorId: string;
  mediaId: string;
  contentTypeId: string;
  placementId: string;
  landingId: string;
  sequence: string;
  simpleUrl?: boolean;
}

export type SheetRow = ExistingRow | NewRow;

export interface CellPos {
  rowIndex: number;
  colKey: ColKey;
}

export interface RangeSelection {
  anchor: CellPos;
  current: CellPos;
}

export function getRangeBounds(range: RangeSelection, cols: ColKey[]): {
  minRow: number; maxRow: number; minColIdx: number; maxColIdx: number;
} {
  const anchorColIdx = cols.indexOf(range.anchor.colKey);
  const currentColIdx = cols.indexOf(range.current.colKey);
  return {
    minRow: Math.min(range.anchor.rowIndex, range.current.rowIndex),
    maxRow: Math.max(range.anchor.rowIndex, range.current.rowIndex),
    minColIdx: Math.min(anchorColIdx, currentColIdx),
    maxColIdx: Math.max(anchorColIdx, currentColIdx),
  };
}

export function isCellInRange(pos: CellPos, range: RangeSelection, cols: ColKey[]): boolean {
  const bounds = getRangeBounds(range, cols);
  const colIdx = cols.indexOf(pos.colKey);
  return (
    pos.rowIndex >= bounds.minRow &&
    pos.rowIndex <= bounds.maxRow &&
    colIdx >= bounds.minColIdx &&
    colIdx <= bounds.maxColIdx
  );
}

export interface DropdownOption {
  value: string;
  label: string;
  colorKey?: string;
}

export interface SidebarItem {
  key: string; // `${productId}:${mediaId}`
  productId: string;
  productName: string;
  brandName: string;
  mediaId: string;
  mediaName: string;
}
