// 1. React 및 React 내장 훅 (가장 먼저 로드)
import React, { useCallback, useRef, useEffect, useState } from "react";

// 통계 카드 컴포넌트 - DB 수 표시 및 클릭 처리
const StatCard = React.memo(({ label, value, id, setNewCompany, dataFilterClean, color, newCompany }) => {
  const labelRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const handleClick = useCallback((e) => {
    e.stopPropagation();

    if (dataFilterClean) {
      dataFilterClean();
    } else if (setNewCompany && id !== undefined) {
      if (newCompany === String(id)) {
        setNewCompany("");
      } else {
        setNewCompany(String(id));
      }
    }
  }, [dataFilterClean, id, setNewCompany, newCompany]);

  useEffect(() => {
    if (labelRef.current) {
      const isTextOverflowing = labelRef.current.scrollWidth > labelRef.current.clientWidth;
      setIsOverflowing(isTextOverflowing);
    }
  }, [label]);

  const isActive = newCompany === String(id);

  return (
    <div className={`stat-card ${isActive ? 'active' : ''}`} onClick={handleClick}>
      <div className="stat-label" data-tooltip={label}>
        {color && (
          <div
            className="media-color"
            style={{ backgroundColor: color }}
          ></div>
        )}
        <span
          ref={labelRef}
          className={`label-text ${isOverflowing ? 'overflowing' : ''}`}
        >
          {label}
        </span>
      </div>
      <div className="stat-value">
        {value}
        <span>건</span>
      </div>
    </div>
  );
});

export default StatCard;
