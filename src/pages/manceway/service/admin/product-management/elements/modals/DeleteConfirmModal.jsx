import React from "react";
import Button from "../../../../../components/ui/Button";

function DeleteConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content confirm-delete-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>삭제 확인</h3>
          <button className="modal-close-btn" onClick={onCancel}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <Button variant="secondary" size="medium" onClick={onCancel}>
            취소
          </Button>
          <Button variant="danger" size="medium" onClick={onConfirm}>
            삭제
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
