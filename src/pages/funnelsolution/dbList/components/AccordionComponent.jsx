// 1. React 및 React 내장 훅 (가장 먼저 로드)
import React, { useCallback } from "react";

// 선택된 매체 광고 컴포넌트
const AccordionComponent = React.memo(({
  recentSettings,
  setUrlCodeId,
  urlCodeId,
  setAccordionComponent,
}) => {
  const handleCardClick = useCallback((id) => {
    if (urlCodeId === id) {
      setUrlCodeId("");
      setAccordionComponent(null);
    } else {
      setUrlCodeId(id);
      setAccordionComponent(1);
    }
  }, [setUrlCodeId, setAccordionComponent, urlCodeId]);

  if (!recentSettings || recentSettings.length === 0) {
    return null;
  }

  return (
    <div className="media-cards-wrapper">
      {recentSettings.map((setting) => (
        <div
          key={setting.id}
          className={`media-card ${urlCodeId === setting.id ? 'active' : ''}`}
          onClick={() => handleCardClick(setting.id)}
        >
          <div className="media-card-title">{setting.ad_title} : {setting.count}건</div>
        </div>
      ))}
    </div>
  );
});

export default AccordionComponent;
