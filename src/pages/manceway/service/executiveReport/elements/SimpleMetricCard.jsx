/**
 * 간단한 메트릭 카드 컴포넌트
 * S등급 사용자용 - 차트 없이 숫자만 표시
 */
const SimpleMetricCard = ({
  title,
  value,
  unit = "원",
  variant = "primary", // primary(파란색), secondary(흰색)
}) => {
  const isPrimary = variant === "primary";

  // 숫자인 경우 toLocaleString, 문자열인 경우 그대로 표시
  const displayValue = typeof value === "number" ? value.toLocaleString() : value;

  return (
    <div className={`simple-metric-card ${isPrimary ? "primary" : "secondary"}`}>
      <h3 className="simple-metric-label">{title}</h3>
      <div className="simple-metric-value">
        <span className="simple-metric-number">{displayValue}</span>
        <span className="simple-metric-unit">{unit}</span>
      </div>
    </div>
  );
};

export default SimpleMetricCard;
