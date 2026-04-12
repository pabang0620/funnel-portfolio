import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faHammer } from '@fortawesome/free-solid-svg-icons';
import './ComingSoonOverlay.css';

const ComingSoonOverlay = ({ 
  title = "서비스 준비 중",
  subtitle = "현재 이 기능은 개발 중입니다.",
  icon = faCog 
}) => {
  return (
    <div className="coming-soon-overlay">
      <div className="coming-soon-backdrop" />
      <div className="coming-soon-content">
        <div className="coming-soon-icon">
          <FontAwesomeIcon icon={icon} />
        </div>
        <h2 className="coming-soon-title">{title}</h2>
        <p className="coming-soon-subtitle">{subtitle}</p>
      </div>
    </div>
  );
};

export default ComingSoonOverlay;