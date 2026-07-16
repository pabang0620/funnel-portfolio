import { useMemo } from 'react';

import { FIELDS, getField } from '../lib/pivotFieldRegistry';

// ---------------------------------------------------------------------------
// 상수
// ---------------------------------------------------------------------------
const GRAND_TOTAL_KEY = '(합계)';
const UNCLASSIFIED = '(미분류)';

// ---------------------------------------------------------------------------
// 내부 유틸
// ---------------------------------------------------------------------------

/**
 * 차원 값 정규화: null / undefined / 빈 문자열 → "(미분류)"
 * @param {*} value
 * @returns {string}
 */
function normalizeDimValue(value) {
  if (value === null || value === undefined || value === '') {
    return UNCLASSIFIED;
  }
  return String(value);
}

/**
 * raw 지표 목록 추출 (hidden 포함 - 집계에는 모두 필요)
 * @returns {string[]}
 */
function getAllRawKeys() {
  return FIELDS.filter((f) => f.type === 'raw').map((f) => f.key);
}

/**
 * ref 지표 목록 추출
 * @returns {string[]}
 */
function getAllRefKeys() {
  return FIELDS.filter((f) => f.type === 'ref').map((f) => f.key);
}

/**
 * 빈 raw/ref 합계 객체 생성
 * @param {string[]} rawKeys
 * @param {string[]} refKeys
 * @returns {object}
 */
function createEmptyTotals(rawKeys, refKeys) {
  const totals = {};
  for (const k of rawKeys) totals[k] = 0;
  for (const k of refKeys) totals[k] = 0;
  return totals;
}

/**
 * row에서 raw/ref 지표를 totals 객체에 누산 (SUM)
 * @param {object} totals - 누적 대상 객체 (직접 변이)
 * @param {object} row    - 원천 row
 * @param {string[]} rawKeys
 * @param {string[]} refKeys
 */
function accumulateRow(totals, row, rawKeys, refKeys) {
  for (const k of rawKeys) {
    const v = row[k];
    if (v !== null && v !== undefined) {
      totals[k] += Number(v) || 0;
    }
  }
  for (const k of refKeys) {
    const v = row[k];
    if (v !== null && v !== undefined) {
      totals[k] += Number(v) || 0;
    }
  }
}

/**
 * 집계된 raw totals에 계산 지표 deriveFn 적용 후 최종 값 맵 반환
 * @param {object}   rawTotals   - raw + ref SUM 결과
 * @param {string[]} valueFields - 표시할 지표 key 배열
 * @returns {object} { [metricKey]: value }
 */
function applyDerived(rawTotals, valueFields) {
  const result = { ...rawTotals };

  for (const key of valueFields) {
    const field = getField(key);
    if (!field) continue;
    if (field.type === 'calculated') {
      result[key] = field.deriveFn(rawTotals);
    }
    // raw / ref 는 이미 rawTotals에 있음
  }

  return result;
}

/**
 * dimension 타입 valueField의 텍스트 값을 rows에서 추출한다.
 * 모든 rows의 값이 동일하면 그 값을, 혼합이면 null 반환.
 * @param {object[]} rows
 * @param {string[]} valueFields
 * @returns {object} { [dimFieldKey]: string|null }
 */
function extractDimTextValues(rows, valueFields) {
  const result = {};
  for (const vf of valueFields) {
    const field = getField(vf);
    if (!field || field.type !== 'dimension') continue;
    const uniq = [...new Set(rows.map(r => normalizeDimValue(r[vf])))];
    if (uniq.length === 1) {
      result[vf] = uniq[0];
    } else if (field.aggFn) {
      result[vf] = field.aggFn(uniq);
    } else {
      result[vf] = null;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// colKey 생성
// ---------------------------------------------------------------------------

/**
 * colFields 조합으로 열 키 배열 생성
 * @param {object[]} rows
 * @param {string[]} colFields
 * @returns {string[]} 고유 열 키 배열 (정렬) + "(합계)"
 */
function buildColKeys(rows, colFields) {
  if (!colFields || colFields.length === 0) {
    return [GRAND_TOTAL_KEY];
  }

  const seen = new Set();
  for (const row of rows) {
    const colKey = colFields.map((f) => normalizeDimValue(row[f])).join(' | ');
    seen.add(colKey);
  }

  const sorted = Array.from(seen).sort();
  return [...sorted, GRAND_TOTAL_KEY];
}

// ---------------------------------------------------------------------------
// 그룹화 & 집계
// ---------------------------------------------------------------------------

/**
 * rowKey × colKey 단위로 raw/ref를 SUM한 맵 생성
 *
 * 반환 구조:
 *   Map< rowKey, Map< colKey, totalsObject > >
 *
 * @param {object[]} rows
 * @param {string[]} rowFields
 * @param {string[]} colFields
 * @param {string[]} rawKeys
 * @param {string[]} refKeys
 * @returns {Map}
 */
function buildGroupMap(rows, rowFields, colFields, rawKeys, refKeys) {
  /** @type {Map<string, Map<string, object>>} */
  const groupMap = new Map();

  for (const row of rows) {
    const rowKey =
      rowFields.length > 0
        ? rowFields.map((f) => normalizeDimValue(row[f])).join('\u0000')
        : GRAND_TOTAL_KEY;

    const colKey =
      colFields.length > 0
        ? colFields.map((f) => normalizeDimValue(row[f])).join(' | ')
        : GRAND_TOTAL_KEY;

    if (!groupMap.has(rowKey)) {
      groupMap.set(rowKey, new Map());
    }
    const colMap = groupMap.get(rowKey);

    // 열 소계
    if (!colMap.has(colKey)) {
      colMap.set(colKey, createEmptyTotals(rawKeys, refKeys));
    }
    accumulateRow(colMap.get(colKey), row, rawKeys, refKeys);

    // 행 합계 열
    if (!colMap.has(GRAND_TOTAL_KEY)) {
      colMap.set(GRAND_TOTAL_KEY, createEmptyTotals(rawKeys, refKeys));
    }
    accumulateRow(colMap.get(GRAND_TOTAL_KEY), row, rawKeys, refKeys);
  }

  return groupMap;
}

/**
 * 전체 합계 행(totals) 계산
 * @param {object[]} rows
 * @param {string[]} rawKeys
 * @param {string[]} refKeys
 * @param {string[]} valueFields
 * @param {string[]} colKeys
 * @param {string[]} colFields
 * @returns {object} { [colKey]: { [metricKey]: value } }
 */
function buildGrandTotals(rows, rawKeys, refKeys, valueFields, colKeys, colFields) {
  const colTotalsMap = {};

  for (const colKey of colKeys) {
    colTotalsMap[colKey] = createEmptyTotals(rawKeys, refKeys);
  }

  for (const row of rows) {
    const colKey =
      colFields.length > 0
        ? colFields.map((f) => normalizeDimValue(row[f])).join(' | ')
        : GRAND_TOTAL_KEY;

    if (colTotalsMap[colKey]) {
      accumulateRow(colTotalsMap[colKey], row, rawKeys, refKeys);
    }
    if (colKey !== GRAND_TOTAL_KEY) {
      accumulateRow(colTotalsMap[GRAND_TOTAL_KEY], row, rawKeys, refKeys);
    }
  }

  const result = {};
  for (const colKey of colKeys) {
    const colRows = colKey === GRAND_TOTAL_KEY
      ? rows
      : rows.filter(r => colFields.map(f => normalizeDimValue(r[f])).join(' | ') === colKey);
    const dimTexts = extractDimTextValues(colRows, valueFields);
    result[colKey] = { ...applyDerived(colTotalsMap[colKey], valueFields), ...dimTexts };
  }
  return result;
}

// ---------------------------------------------------------------------------
// 트리 빌드
// ---------------------------------------------------------------------------

/**
 * rowFields 계층에 따라 중첩 트리 노드 배열 생성
 *
 * @param {object[]} rows         - 원천 row 배열
 * @param {string[]} rowFields    - 행 차원 key 배열 (계층 순서)
 * @param {string[]} colFields    - 열 차원 key 배열
 * @param {string[]} colKeys      - 유효한 열 키 목록
 * @param {string[]} valueFields  - 표시할 지표 key 배열
 * @param {string[]} rawKeys      - 집계용 raw key 전체 (hidden 포함)
 * @param {string[]} refKeys      - 집계용 ref key 전체
 * @param {number}   depth        - 현재 깊이 (0-based)
 * @returns {object[]}
 */
function buildTree(rows, rowFields, colFields, colKeys, valueFields, rawKeys, refKeys, depth = 0) {
  if (rowFields.length === 0) return [];

  const [currentField, ...remainingFields] = rowFields;

  // 현재 차원의 고유 값 수집 (입력 순서 유지 후 정렬)
  const uniqueValues = Array.from(
    new Set(rows.map((r) => normalizeDimValue(r[currentField])))
  ).sort();

  return uniqueValues.map((dimValue) => {
    // 이 값에 해당하는 rows 필터
    const filteredRows = rows.filter(
      (r) => normalizeDimValue(r[currentField]) === dimValue
    );

    // 이 노드의 colKey별 집계값 계산
    const values = {};
    for (const colKey of colKeys) {
      if (colKey === GRAND_TOTAL_KEY) {
        // 합계: filteredRows 전체 SUM
        const rawTotals = createEmptyTotals(rawKeys, refKeys);
        for (const r of filteredRows) {
          accumulateRow(rawTotals, r, rawKeys, refKeys);
        }
        const derived = applyDerived(rawTotals, valueFields);
        const dimTexts = extractDimTextValues(filteredRows, valueFields);
        values[GRAND_TOTAL_KEY] = { ...derived, ...dimTexts };
      } else {
        // 특정 열: colFields 조합으로 필터
        const colFilteredRows = filteredRows.filter((r) => {
          const rColKey = colFields.map((f) => normalizeDimValue(r[f])).join(' | ');
          return rColKey === colKey;
        });
        const rawTotals = createEmptyTotals(rawKeys, refKeys);
        for (const r of colFilteredRows) {
          accumulateRow(rawTotals, r, rawKeys, refKeys);
        }
        const derived = applyDerived(rawTotals, valueFields);
        const dimTexts = extractDimTextValues(colFilteredRows, valueFields);
        values[colKey] = { ...derived, ...dimTexts };
      }
    }

    // 재귀적으로 자식 노드 생성
    const children =
      remainingFields.length > 0
        ? buildTree(
            filteredRows,
            remainingFields,
            colFields,
            colKeys,
            valueFields,
            rawKeys,
            refKeys,
            depth + 1
          )
        : [];

    return {
      key: dimValue,
      field: currentField,
      depth,
      values,
      children,
    };
  });
}

// ---------------------------------------------------------------------------
// 커스텀 훅
// ---------------------------------------------------------------------------

/**
 * usePivotEngine
 *
 * raw rows를 받아 피봇 트리 구조, 전체 합계, 열 키 목록을 반환하는 훅.
 *
 * 핵심 원칙: raw 지표를 먼저 SUM → 이후 deriveFn 적용 (계산 지표 직접 SUM 금지)
 *
 * @param {object}   params
 * @param {object[]} params.rawRows     - API에서 받은 flat row 배열
 * @param {string[]} params.rowFields   - 행으로 사용할 차원 필드 key 배열 (계층 순서)
 * @param {string[]} params.colFields   - 열로 사용할 차원 필드 key 배열
 * @param {string[]} params.valueFields - 표시할 지표 key 배열 (raw + calculated + ref)
 *
 * @returns {{
 *   tree: object[],
 *   totals: object,
 *   colKeys: string[]
 * }}
 *
 * @example
 * const { tree, totals, colKeys } = usePivotEngine({
 *   rawRows,
 *   rowFields: ['hospital_name', 'platform'],
 *   colFields: ['date'],
 *   valueFields: ['impressions', 'clicks', 'cpc', 'ctr'],
 * });
 */
function usePivotEngine({ rawRows, rowFields, colFields, valueFields }) {
  const result = useMemo(() => {
    // 입력 방어
    const rows = Array.isArray(rawRows) ? rawRows : [];
    const rFields = Array.isArray(rowFields) ? rowFields : [];
    const cFields = Array.isArray(colFields) ? colFields : [];
    const vFields = Array.isArray(valueFields) ? valueFields : [];

    if (rows.length === 0) {
      return {
        tree: [],
        totals: {},
        colKeys: cFields.length > 0 ? [GRAND_TOTAL_KEY] : [GRAND_TOTAL_KEY],
      };
    }

    // 집계에 필요한 raw / ref key 전체 목록 (hidden 포함)
    const rawKeys = getAllRawKeys();
    const refKeys = getAllRefKeys();

    // 1. 열 키 목록 생성
    const colKeys = buildColKeys(rows, cFields);

    // 2. 행 트리 생성
    const tree = buildTree(rows, rFields, cFields, colKeys, vFields, rawKeys, refKeys, 0);

    // 3. 전체 합계 행 생성
    const totals = buildGrandTotals(rows, rawKeys, refKeys, vFields, colKeys, cFields);

    return { tree, totals, colKeys };
  }, [rawRows, rowFields, colFields, valueFields]);

  return result;
}

export default usePivotEngine;
