import React from "react";
import Button from "../../../../../components/ui/Button";

function PriceCalculationRuleModal({ onClose }) {
  const sectionStyle = {
    background: "#f8fafc",
    padding: "1.25rem",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    marginBottom: "1rem",
  };

  const titleStyle = {
    fontSize: "0.9375rem",
    fontWeight: "600",
    color: "#334155",
    marginBottom: "0.75rem",
  };

  const contentStyle = {
    fontSize: "0.875rem",
    color: "#475569",
    lineHeight: "1.8",
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content question-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "700px" }}
      >
        <div className="modal-header">
          <h3>기획 확인 - 박스별 가격 계산 규칙</h3>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {/* 가격 조회 규칙 */}
          <div style={sectionStyle}>
            <h4 style={titleStyle}>박스별 가격 조회 규칙</h4>
            <div style={contentStyle}>
              <p style={{ margin: "0 0 0.5rem 0" }}>
                <strong>1. 가격 히스토리 로그에서 조회 (우선)</strong>
              </p>
              <ul style={{ margin: "0 0 0.75rem 0", paddingLeft: "1.25rem" }}>
                <li>boxPriceLog에서 해당 제품+판매처의 로그를 조회</li>
                <li>
                  주문일시가 startDate ~ endDate 범위에 포함되는 로그를 찾음
                </li>
                <li>endDate가 null이면 현재까지 적용 중인 가격</li>
                <li>같은 날 여러 번 수정 시 시간(createdAt) 기준으로 구분</li>
              </ul>
              <p style={{ margin: "0 0 0.5rem 0" }}>
                <strong>2. Fallback 처리 (로그가 없는 경우)</strong>
              </p>
              <ul style={{ margin: "0", paddingLeft: "1.25rem" }}>
                <li>
                  매칭되는 히스토리 로그가 없으면 현재 boxPrice 테이블의 가격
                  사용
                </li>
              </ul>
            </div>
          </div>

          {/* 예시 */}
          <div style={sectionStyle}>
            <h4 style={titleStyle}>예시</h4>
            <div style={contentStyle}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f1f5f9" }}>
                    <th
                      style={{
                        padding: "0.5rem",
                        border: "1px solid #e2e8f0",
                        textAlign: "left",
                        fontWeight: "500",
                      }}
                    >
                      상황
                    </th>
                    <th
                      style={{
                        padding: "0.5rem",
                        border: "1px solid #e2e8f0",
                        textAlign: "left",
                        fontWeight: "500",
                      }}
                    >
                      적용 가격
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}
                    >
                      주문일이 가격 로그 기간 내
                    </td>
                    <td
                      style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}
                    >
                      해당 기간의 로그 가격
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}
                    >
                      주문일에 맞는 로그가 없음
                    </td>
                    <td
                      style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}
                    >
                      현재 boxPrice 테이블 가격
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="primary" size="medium" onClick={onClose}>
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PriceCalculationRuleModal;
