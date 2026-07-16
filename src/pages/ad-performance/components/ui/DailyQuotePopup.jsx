import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuoteLeft, faQuoteRight } from "@fortawesome/free-solid-svg-icons";
import "./DailyQuotePopup.css";

const DailyQuotePopup = ({ quote, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // 마운트 시 페이드인
    setTimeout(() => setIsVisible(true), 10);

    // 3초 후 자동 닫힘
    const timer = setTimeout(() => {
      handleClose();
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 450); // 페이드아웃 애니메이션 시간
  };

  if (!quote) return null;

  return (
    <div
      className={`daily-quote-overlay ${isVisible ? "visible" : ""} ${
        isClosing ? "closing" : ""
      }`}
      onClick={handleClose}
    >
      <div className="daily-quote-popup" onClick={(e) => e.stopPropagation()}>
        <div className="quote-content">
          <FontAwesomeIcon icon={faQuoteLeft} className="quote-icon" />
          <p className="quote-text">{quote.content}</p>
          <FontAwesomeIcon icon={faQuoteRight} className="quote-icon" />
        </div>
        <p className="quote-author">- {quote.author} -</p>
      </div>
    </div>
  );
};

export default DailyQuotePopup;
