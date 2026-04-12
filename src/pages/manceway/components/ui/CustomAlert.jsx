import { useEffect } from "react";
import "./CustomAlert.css";

function CustomAlert({ message, onClose }) {
  useEffect(() => {
    // ESC 키로 닫기
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="custom-alert-overlay" onClick={onClose}>
      <div className="custom-alert-box" onClick={(e) => e.stopPropagation()}>
        <div className="custom-alert-message">{message}</div>
        <button className="custom-alert-btn" onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
}

export default CustomAlert;
