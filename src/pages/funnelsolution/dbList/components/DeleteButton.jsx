// 1. React 및 React 내장 훅 (가장 먼저 로드)
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

// 삭제 버튼 컴포넌트 - DB 삭제 기능
const DeleteButton = React.memo(({ handleUpdateStatus }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="delete-button"
      >
        <FontAwesomeIcon icon={faTrash} />
        <span>삭제</span>
      </button>

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.4)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "28px 32px",
              minWidth: "300px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#111827", textAlign: "center" }}>
              어디로 이동할까요?
            </p>
            <button
              style={{
                padding: "10px 0",
                background: "#4880ff",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
              onClick={() => { handleUpdateStatus(3); setShowModal(false); }}
            >
              허수 삭제
            </button>
            <button
              style={{
                padding: "10px 0",
                background: "#f59e0b",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
              onClick={() => { handleUpdateStatus(0); setShowModal(false); }}
            >
              중복 삭제
            </button>
            <button
              style={{
                padding: "10px 0",
                background: "none",
                color: "#6b7280",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
              }}
              onClick={() => setShowModal(false)}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </>
  );
});

export default DeleteButton;
