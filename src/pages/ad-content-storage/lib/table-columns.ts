// 공통 테이블 컬럼 설정
export const DEFAULT_COLUMN_WIDTHS: Record<string, number> = {
  checkbox: 40,
  labeling: 64,
  thumbnail: 80,
  name: 180,
  labels: 300,
  attributes: 150,
  adCode: 150,
  memo: 80,
  size: 64,
  created: 100,
  type: 64,
}

export const COLUMN_LABELS: Record<string, string> = {
  checkbox: '',
  status: '상태',
  labeling: '라벨링',
  thumbnail: '썸네일',
  name: '파일명',
  labels: '라벨',
  attributes: '속성',
  adCode: '광고코드',
  memo: '메모',
  size: '크기',
  created: '생성일',
  type: '유형',
}

export function loadColumnWidths(storageKey: string): Record<string, number> {
  try {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      return { ...DEFAULT_COLUMN_WIDTHS, ...JSON.parse(saved) }
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_COLUMN_WIDTHS
}

export function saveColumnWidths(storageKey: string, widths: Record<string, number>) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(widths))
  } catch (e) {
    // ignore
  }
}
