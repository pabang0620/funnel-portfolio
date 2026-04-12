import React from "react";

function DeleteBox({ message, pendingStatus, onCancel, onConfirm }) {
  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="delete-box-overlay" onClick={handleBackgroundClick}>
      <div className="delete-box">
        <div className="delete-box-icon">
          <span>!</span>
        </div>
        <p>{message}</p>
        {pendingStatus === 2 && (
          <p
            className="warning-text"
            style={{
              color: "#FF0000",
              marginTop: "-8px",
              marginBottom: "10px",
              fontSize: "14px",
            }}
          >
            *휴지통에서 삭제 시 DB는 영구 삭제되어 복구할 수 없습니다
          </p>
        )}
        <div className="delete-box-buttons">
          <button className="cancel-button" onClick={onCancel}>
            취소
          </button>
          <button className="confirm-button" onClick={onConfirm}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteBox;
