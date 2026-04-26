// conditional-format.js
// 조건부 포맷 평가 로직 및 색상 팔레트

export const DEFAULT_COLORS = [
  "#fee2e2", // light red
  "#ffedd5", // light orange
  "#fef9c3", // light yellow
  "#dcfce7", // light green
  "#ccfbf1", // light teal
  "#dbeafe", // light blue
  "#e0e7ff", // light indigo
  "#ede9fe", // light purple
  "#fce7f3", // light pink
  "#f3f4f6", // light gray
]

/**
 * 조건부 포맷 규칙 평가
 * @param {number|null} value
 * @param {{ operator: string, value: string }} rule
 * @returns {boolean}
 */
export function evaluateConditionalFormat(value, rule) {
  if (value === null || value === undefined) return false
  const target = Number(rule.value)
  if (isNaN(target)) return false
  switch (rule.operator) {
    case ">=": return value >= target
    case ">":  return value > target
    case "=":  return value === target
    case "<":  return value < target
    case "<=": return value <= target
    case "!=": return value !== target
    default:   return false
  }
}

/**
 * 조건부 포맷 배경색 반환
 * @param {number|null} value
 * @param {string} fieldKey
 * @param {Array} rules
 * @returns {string|undefined}
 */
export function getConditionalBgColor(value, fieldKey, rules) {
  for (const rule of rules) {
    if (rule.field === fieldKey && evaluateConditionalFormat(value, rule)) {
      return rule.color
    }
  }
  return undefined
}
