import React from "react";
import Button from "../../../../../components/ui/Button";

function QuestionModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content question-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "700px" }}
      >
        <div className="modal-header">
          <h3>기획 질문사항 - 판매처 선택 방식</h3>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div
            style={{
              background: "#fffbeb",
              padding: "1.25rem",
              borderRadius: "8px",
              border: "1px solid #fbbf24",
              marginBottom: "1rem",
            }}
          >
            <h4
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: "#92400e",
                marginBottom: "0.75rem",
              }}
            >
              🤔 판매처 선택 방식에 대한 의문
            </h4>
            <p
              style={{
                fontSize: "0.9375rem",
                color: "#78350f",
                lineHeight: "1.8",
                marginBottom: "1rem",
              }}
            >
              코드 등록 시 판매처를 꼭 선택해야 하는지 의문이 생겼습니다.
            </p>
            <div
              style={{
                background: "white",
                padding: "1rem",
                borderRadius: "6px",
              }}
            >
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#475569",
                  lineHeight: "1.8",
                  margin: 0,
                }}
              >
                <strong>제안:</strong>
                <br />
                • 판매처 등록을 안 할 경우 → 박스별 가격에서 금액을 기입하지
                않으면 됨
                <br />
                • 금액이 기입되어 있는 경우에만 해당 판매처를 사용
                <br />
                <br />
                즉, 판매처 선택을 별도로 하지 않고{" "}
                <strong>박스별 가격 입력 여부</strong>로 판매처 사용 여부를
                결정하는 방식
              </p>
            </div>
          </div>

          <div
            style={{
              background: "#dbeafe",
              padding: "1.25rem",
              borderRadius: "8px",
              border: "1px solid #3b82f6",
            }}
          >
            <h4
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: "#1e40af",
                marginBottom: "0.75rem",
              }}
            >
              📋 하단 리스트 판매처의 의미 변경
            </h4>
            <p
              style={{
                fontSize: "0.875rem",
                color: "#1e40af",
                lineHeight: "1.8",
                margin: 0,
              }}
            >
              판매처 선택을 제거하면, 하단 리스트에 표시되는 판매처는
              <br />→{" "}
              <strong>해당 박스 갯수에 가격이 기입되어 있는지 여부</strong>를
              보여주는 역할로 변경됨
              <br />
              <br />
              (가격 입력 O = 해당 판매처 사용 / 가격 입력 X = 해당 판매처
              미사용)
            </p>
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

export default QuestionModal;
