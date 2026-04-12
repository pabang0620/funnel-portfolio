/**
 * 숫자 포맷 유틸리티 함수들
 */

// 숫자를 콤마 포맷으로 변환
export const formatNumber = (value) => {
  if (!value && value !== 0) return "";
  const num = String(value).replace(/[^\d]/g, "");
  if (!num) return "";
  return Number(num).toLocaleString();
};

// 콤마 제거하여 숫자만 반환
export const parseNumber = (value) => {
  if (!value) return "";
  return String(value).replace(/[^\d]/g, "");
};

// 숫자만 허용 (정수)
export const onlyNumbers = (value) => {
  return String(value).replace(/[^\d]/g, "");
};

// 소수점 포함 숫자 허용 (수수료용)
export const onlyDecimalNumbers = (value) => {
  const cleaned = String(value).replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length > 2) {
    return parts[0] + "." + parts.slice(1).join("");
  }
  return cleaned;
};
