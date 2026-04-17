/**
 * pivotFieldRegistry.js
 *
 * 피봇 테이블에서 사용하는 모든 필드의 메타데이터 레지스트리.
 *
 * 필드 타입:
 *   - dimension  : 차원 필드 (행/열 그룹화 기준)
 *   - raw        : 원천 지표 (SUM 집계)
 *   - calculated : 계산 지표 (deriveFn으로 계산, SUM 금지)
 *   - ref        : REF 필드 (별도 API에서 가져옴, SUM 집계)
 *
 * 포맷 타입:
 *   - text     : 문자열
 *   - date     : 날짜
 *   - number   : 정수 (콤마 구분)
 *   - currency : 원화 (콤마 + 원)
 *   - percent  : % (소수점 2자리)
 */

// ---------------------------------------------------------------------------
// 차원 필드 (11개)
// ---------------------------------------------------------------------------
const DIMENSION_FIELD_DEFS = [
  { key: 'date',          label: '날짜',       type: 'dimension', format: 'date',   tooltip: '광고 DB가 유입된 날짜 (KST 기준)' },
  { key: 'hospital_name', label: '병원명',     type: 'dimension', format: 'text',   tooltip: '병원명' },
  { key: 'platform',      label: '광고플랫폼', type: 'dimension', format: 'text',   tooltip: '광고 플랫폼 (GDN, 메타, 틱톡 등)' },
  { key: 'ad_title',      label: '광고제목',   type: 'dimension', format: 'text',   tooltip: '광고 소재 제목 (URL 코드 설정의 광고제목)' },
  { key: 'campaign_name', label: '캠페인명',   type: 'dimension', format: 'text',   tooltip: '매체 API의 캠페인명' },
  { key: 'ad_group_name', label: '광고그룹명', type: 'dimension', format: 'text',   tooltip: '매체 API의 광고그룹명' },
  { key: 'event_name',    label: '이벤트명',   type: 'dimension', format: 'text',   tooltip: '이벤트명' },
  { key: 'url_code',      label: 'URL코드',    type: 'dimension', format: 'text',   tooltip: '내부 랜딩 URL 코드' },
  { key: 'marketer',      label: '마케터',     type: 'dimension', format: 'text',   tooltip: '담당 마케터' },
  { key: 'content_type',  label: '소재유형',   type: 'dimension', format: 'text',   tooltip: '소재 유형' },
  { key: 'account_name',  label: '계정명',     type: 'dimension', format: 'text',   tooltip: '광고 계정명 (E계정, D계정 등)' },
  { key: 'creator',       label: '제작자',     type: 'dimension', format: 'text',   tooltip: '소재 제작자' },
  { key: 'region',        label: '지역',       type: 'dimension', format: 'text',   tooltip: '지역' },
  { key: 'operation_status', label: '운영상태', type: 'dimension', format: 'text',
    tooltip: '오늘 노출수 기준 운영 상태\nON: 오늘 노출수 1 이상\nOFF: 오늘 노출수 0\n미확인: ad_title 없음',
    aggFn: (vals) => vals.includes('ON') ? 'ON' : vals.includes('OFF') ? 'OFF' : '미확인' },
  { key: 'judgment_result', label: '판단결과', type: 'dimension', format: 'text',
    tooltip: '목표단가 대비 효율 판단\n이미 OFF: 오늘 노출 없음\n테스트중: 광고비 < 목표단가\nOFF 필요: 7일/3일 단가 모두 초과\n회복중: 7일 초과, 3일 이하\n하락세: 7일 이하, 3일 초과\n증액: 7일/3일 단가 모두 이하' },
];

// ---------------------------------------------------------------------------
// 원천 지표 (11개 공개 + 2개 hidden)
// ---------------------------------------------------------------------------
const RAW_FIELD_DEFS = [
  { key: 'impressions',    label: '노출수',          type: 'raw', format: 'number',   tooltip: '광고 노출 횟수' },
  { key: 'clicks',         label: '클릭수',          type: 'raw', format: 'number',   tooltip: '광고 클릭 횟수' },
  { key: 'ad_spend',          label: '광고비',          type: 'raw', format: 'currency', tooltip: '광고비 (수동 입력 또는 자동 동기화)\nMySQL ad_spending 테이블 기준' },
  { key: 'ad_spend_platform', label: '매체비(플랫폼)',  type: 'raw', format: 'currency', tooltip: '매체 API 기준 광고비\nMeta/TikTok: spend, Google: cost' },
  { key: 'db_valid',       label: 'DB수량(유효)',    type: 'raw', format: 'number',   tooltip: '유효 DB 수량\ndata_status = 1 인 고객' },
  { key: 'db_total',       label: 'DB수량(중복포함)', type: 'raw', format: 'number',  tooltip: '중복 포함 DB 수량\ndata_status IN (0, 1) 인 고객' },
  { key: 'db_duplicate',   label: '중복수량',        type: 'raw', format: 'number',   tooltip: '중복 DB 수량\ndata_status = 0 인 고객' },
  { key: 'reservation',    label: '예약수',          type: 'raw', format: 'number',   tooltip: '예약 수\ncall_history IN (예약, 재예약)' },
  { key: 'visit',          label: '내원수',          type: 'raw', format: 'number',   tooltip: '내원 수\nvisit_status IN (결제, 상담)' },
  { key: 'consultation',   label: '상담동의수',      type: 'raw', format: 'number',   tooltip: '상담동의 수\nvisit_status = 결제' },
  { key: 'payment_amount', label: '결제금액',        type: 'raw', format: 'currency', tooltip: '결제 금액 합계\nvisit_status = 결제 인 고객의 total_payment 합계' },
  { key: 'db_invalid',     label: '무효DB수량',      type: 'raw', format: 'number',   tooltip: '무효 DB 수량\ncall_history = 무효디비' },

  // 약속이행률 전용 - 집계는 되지만 값 목록에는 노출 안함
  { key: 'promise_visit',       label: '약속이행_내원',  type: 'raw', format: 'number', hidden: true },
  { key: 'promise_reservation', label: '약속이행_예약',  type: 'raw', format: 'number', hidden: true },
];

// ---------------------------------------------------------------------------
// 계산 지표 (15개)
// 분모가 0이거나 null이면 null 반환 → 렌더링에서 "-" 표시
// deriveFn(totals): totals는 해당 셀의 raw 지표 합계 객체
// ---------------------------------------------------------------------------
const CALCULATED_FIELD_DEFS = [
  {
    key: 'cpc',
    label: 'CPC',
    type: 'calculated',
    format: 'currency',
    tooltip: 'CPC (클릭당 비용)\n= 광고비 ÷ 클릭수',
    /** @param {{ ad_spend: number, clicks: number }} t */
    deriveFn: (t) => (t.clicks > 0 ? t.ad_spend / t.clicks : null),
  },
  {
    key: 'ctr',
    label: 'CTR',
    type: 'calculated',
    format: 'percent',
    tooltip: 'CTR (클릭률)\n= 클릭수 ÷ 노출수 × 100 (%)',
    /** @param {{ clicks: number, impressions: number }} t */
    deriveFn: (t) => (t.impressions > 0 ? (t.clicks / t.impressions) * 100 : null),
  },
  {
    key: 'cvr',
    label: 'CVR',
    type: 'calculated',
    format: 'percent',
    tooltip: 'CVR (전환율)\n= DB수량(중복포함) ÷ 클릭수 × 100 (%)',
    /** @param {{ db_total: number, clicks: number }} t */
    deriveFn: (t) => (t.clicks > 0 ? (t.db_total / t.clicks) * 100 : null),
  },
  {
    key: 'db_cost_valid',
    label: 'DB단가(유효)',
    type: 'calculated',
    format: 'currency',
    tooltip: 'DB단가 (유효)\n= 광고비 ÷ DB수량(유효)',
    /** @param {{ ad_spend: number, db_valid: number }} t */
    deriveFn: (t) => (t.db_valid > 0 ? t.ad_spend / t.db_valid : null),
  },
  {
    key: 'db_cost_total',
    label: 'DB단가(중복포함)',
    type: 'calculated',
    format: 'currency',
    tooltip: 'DB단가 (중복포함)\n= 광고비 ÷ DB수량(중복포함)',
    /** @param {{ ad_spend: number, db_total: number }} t */
    deriveFn: (t) => (t.db_total > 0 ? t.ad_spend / t.db_total : null),
  },
  {
    key: 'reservation_rate',
    label: '예약률',
    type: 'calculated',
    format: 'percent',
    tooltip: '예약률\n= 예약수 ÷ DB수량(유효) × 100 (%)',
    /** @param {{ reservation: number, db_valid: number }} t */
    deriveFn: (t) => (t.db_valid > 0 ? (t.reservation / t.db_valid) * 100 : null),
  },
  {
    key: 'promise_rate',
    label: '약속이행률',
    type: 'calculated',
    format: 'percent',
    tooltip: '약속이행률\n= 약속내원 ÷ 약속예약 × 100 (%)',
    /** @param {{ promise_visit: number, promise_reservation: number }} t */
    deriveFn: (t) =>
      t.promise_reservation > 0 ? (t.promise_visit / t.promise_reservation) * 100 : null,
  },
  {
    key: 'visit_rate',
    label: 'DB당 내원율',
    type: 'calculated',
    format: 'percent',
    tooltip: 'DB당 내원율\n= 내원수 ÷ DB수량(유효) × 100 (%)',
    /** @param {{ visit: number, db_valid: number }} t */
    deriveFn: (t) => (t.db_valid > 0 ? (t.visit / t.db_valid) * 100 : null),
  },
  {
    key: 'payment_rate',
    label: 'DB당 결제율',
    type: 'calculated',
    format: 'percent',
    tooltip: 'DB당 결제율\n= 상담동의수 ÷ DB수량(유효) × 100 (%)',
    /** @param {{ consultation: number, db_valid: number }} t */
    deriveFn: (t) => (t.db_valid > 0 ? (t.consultation / t.db_valid) * 100 : null),
  },
  {
    key: 'consultation_rate',
    label: '상담동의율',
    type: 'calculated',
    format: 'percent',
    tooltip: '상담동의율\n= 상담동의수 ÷ 내원수 × 100 (%)',
    /** @param {{ consultation: number, visit: number }} t */
    deriveFn: (t) => (t.visit > 0 ? (t.consultation / t.visit) * 100 : null),
  },
  {
    key: 'roas',
    label: 'ROAS',
    type: 'calculated',
    format: 'percent',
    tooltip: 'ROAS (광고비 대비 매출)\n= 결제금액 ÷ 광고비 × 100 (%)',
    /** @param {{ payment_amount: number, ad_spend: number }} t */
    deriveFn: (t) => (t.ad_spend > 0 ? (t.payment_amount / t.ad_spend) * 100 : null),
  },
  {
    key: 'cost_per_reservation',
    label: '예약당 단가',
    type: 'calculated',
    format: 'currency',
    tooltip: '예약당 단가\n= 광고비 ÷ 예약수',
    /** @param {{ ad_spend: number, reservation: number }} t */
    deriveFn: (t) => (t.reservation > 0 ? t.ad_spend / t.reservation : null),
  },
  {
    key: 'cost_per_visit',
    label: '내원당 단가',
    type: 'calculated',
    format: 'currency',
    tooltip: '내원당 단가\n= 광고비 ÷ 내원수',
    /** @param {{ ad_spend: number, visit: number }} t */
    deriveFn: (t) => (t.visit > 0 ? t.ad_spend / t.visit : null),
  },
  {
    key: 'invalid_rate',
    label: '무효비율',
    type: 'calculated',
    format: 'percent',
    tooltip: '무효 비율\n= 무효DB수량 ÷ DB수량(유효) × 100 (%)',
    /** @param {{ db_invalid: number, db_valid: number }} t */
    deriveFn: (t) => (t.db_valid > 0 ? (t.db_invalid / t.db_valid) * 100 : null),
  },
  {
    key: 'duplicate_rate',
    label: '중복비율',
    type: 'calculated',
    format: 'percent',
    tooltip: '중복 비율\n= 중복수량 ÷ DB수량(중복포함) × 100 (%)',
    /** @param {{ db_duplicate: number, db_total: number }} t */
    deriveFn: (t) => (t.db_total > 0 ? (t.db_duplicate / t.db_total) * 100 : null),
  },
];

// ---------------------------------------------------------------------------
// REF 필드 (35개 = 7구간 × 5지표)
// url_code 단위로 이미 계산된 값. 집계 방식은 SUM.
// ---------------------------------------------------------------------------
const REF_PERIODS = [
  { prefix: 'today',     label: '금일' },
  { prefix: 'yesterday', label: '전일' },
  { prefix: 'last3d',    label: '3일' },
  { prefix: 'last7d',    label: '7일' },
  { prefix: 'last14d',   label: '14일' },
  { prefix: 'last30d',   label: '30일' },
  { prefix: 'all',       label: '전체' },
];

const REF_METRICS = [
  { suffix: 'cpc',           metricLabel: 'CPC',           format: 'currency' },
  { suffix: 'ctr',           metricLabel: 'CTR',           format: 'percent' },
  { suffix: 'db_cost_valid', metricLabel: 'DB단가(유효)',  format: 'currency' },
  { suffix: 'db_cost_total', metricLabel: 'DB단가(중복포함)', format: 'currency' },
  { suffix: 'cvr',           metricLabel: 'CVR',           format: 'percent' },
];

const REF_FIELD_DEFS = REF_PERIODS.flatMap(({ prefix, label: periodLabel }) =>
  REF_METRICS.map(({ suffix, metricLabel, format }) => ({
    key: `ref_${prefix}_${suffix}`,
    label: `[${periodLabel}] ${metricLabel}`,
    type: 'ref',
    format,
  }))
);

// ---------------------------------------------------------------------------
// 전체 필드 배열
// ---------------------------------------------------------------------------
export const FIELDS = [
  ...DIMENSION_FIELD_DEFS,
  ...RAW_FIELD_DEFS,
  ...CALCULATED_FIELD_DEFS,
  ...REF_FIELD_DEFS,
];

// ---------------------------------------------------------------------------
// 편의 필터 exports
// ---------------------------------------------------------------------------

/** 차원 필드 목록 */
export const DIMENSION_FIELDS = FIELDS.filter((f) => f.type === 'dimension');

/** 원천 지표 목록 (hidden 제외) */
export const RAW_FIELDS = FIELDS.filter((f) => f.type === 'raw' && !f.hidden);

/** 계산 지표 목록 */
export const CALCULATED_FIELDS = FIELDS.filter((f) => f.type === 'calculated');

/** REF 필드 목록 */
export const REF_FIELDS = FIELDS.filter((f) => f.type === 'ref');

/**
 * key로 필드 메타데이터 조회
 * @param {string} key
 * @returns {object|undefined}
 */
export const getField = (key) => FIELDS.find((f) => f.key === key);

/**
 * key로 필드 툴팁 조회
 * @param {string} key
 * @returns {string}
 */
export function getFieldTooltip(key) {
  const field = FIELDS.find(f => f.key === key)
  return field?.tooltip || ''
}
