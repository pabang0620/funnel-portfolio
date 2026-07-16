import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faCheckCircle, faInfoCircle, faTimesCircle, faSpinner } from "@fortawesome/free-solid-svg-icons";
import Modal from "./Modal";
import "./AlertModal.css";

const AlertModal = ({
  isOpen,
  onClose,
  title = "알림",
  message,
  type = "warning", // warning, error, success, info
  confirmText = "확인",
  showCancel = false,
  cancelText = "취소",
  onConfirm,
  onCancel,
  isLoading = false // 로딩 상태 추가
}) => {
  const getIcon = () => {
    if (isLoading) {
      return faSpinner;
    }
    switch (type) {
      case "error":
        return faTimesCircle;
      case "success":
        return faCheckCircle;
      case "info":
        return faInfoCircle;
      case "warning":
      default:
        return faExclamationTriangle;
    }
  };

  const getIconColor = () => {
    return "#6b7280";
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else if (onClose) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={isLoading ? undefined : onClose} title={title}>
      <div className="alert-modal-content">
        <div className="alert-modal-header">
          <div className={`alert-modal-icon ${isLoading ? 'loading' : type}`}>
            <FontAwesomeIcon icon={getIcon()} spin={isLoading} />
          </div>
          <h3 className="alert-modal-title">{title}</h3>
        </div>
        <p className="alert-modal-message">{message}</p>
        {!isLoading && (
          <div className="alert-modal-actions">
            {showCancel && (
              <button
                className="modal-btn modal-btn-cancel"
                onClick={handleCancel}
              >
                {cancelText}
              </button>
            )}
            <button
              className="modal-btn modal-btn-confirm"
              onClick={handleConfirm}
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AlertModal;