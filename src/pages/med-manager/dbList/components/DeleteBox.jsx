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
            *Deleting from trash permanently removes the DB record - it cannot be recovered
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
