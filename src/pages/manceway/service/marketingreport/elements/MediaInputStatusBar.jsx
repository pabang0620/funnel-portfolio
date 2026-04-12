import { useState, useEffect, useRef } from "react";
import { getTeamMediaInputStatus } from "../api";
import "./MediaInputStatusBar.css";

/**
 * 팀별 매체 입력 현황 대시보드 컴포넌트
 * 상단에 한 줄로 표시: 미기재, 광고중단, 미운영 상태 요약
 */
const MediaInputStatusBar = ({ selectedTeam, onMediaSelect }) => {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openedStatus, setOpenedStatus] = useState(null);
  const containerRef = useRef(null);

  // 상태 항목 클릭 핸들러 (툴팁 토글)
  const handleStatusClick = (e, status) => {
    e.stopPropagation();
    setOpenedStatus(openedStatus === status ? null : status);
  };

  // 매체 클릭 핸들러
  const handleMediaClick = (e, media) => {
    e.stopPropagation();
    if (onMediaSelect) {
      onMediaSelect(media.mediaId, media.productId || null);
    }
    setOpenedStatus(null); // 툴팁 닫기
  };

  // 외부 클릭 시 툴팁 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpenedStatus(null);
      }
    };

    if (openedStatus) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openedStatus]);

  useEffect(() => {
    const fetchStatus = async () => {
      // 팀이 선택되지 않았거나, 빈 배열이거나, "전체"(0)가 포함된 경우
      if (!selectedTeam || selectedTeam.length === 0 || selectedTeam.includes(0)) {
        setStatusData(null);
        return;
      }

      setLoading(true);
      try {
        // 여러 팀 ID 배열을 그대로 전달
        const response = await getTeamMediaInputStatus(selectedTeam);
        if (response.success) {
          setStatusData(response.data);
        }
      } catch (error) {
        console.error("매체 입력 현황 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [selectedTeam]);

  // 팀 선택하지 않았거나 "전체"가 선택된 경우 보여주지 않음
  if (!selectedTeam || selectedTeam.length === 0 || selectedTeam.includes(0)) {
    return null;
  }

  if (loading) {
    return (
      <div className="media-input-status-bar">
        <div className="status-bar-content">
          <span className="status-label">매체 운영 현황:</span>
          <span className="status-loading">로딩 중...</span>
        </div>
      </div>
    );
  }

  // 데이터가 없는 경우 (팀에 매체 할당 안 됨)
  if (!statusData || statusData.summary.total === 0) {
    return (
      <div className="media-input-status-bar">
        <div className="status-bar-content">
          <span className="status-label">매체 운영 현황:</span>
          <span className="status-text-info">할당된 매체가 없습니다</span>
        </div>
      </div>
    );
  }

  const { mediaStatus, summary } = statusData;

  // 상태별로 매체 그룹화
  const groupedMedia = {
    기재됨: mediaStatus.filter((m) => m.status === "정상"),
    미기재: mediaStatus.filter((m) => m.status === "미기재"),
    광고중단: mediaStatus.filter((m) => m.status === "광고중단"),
    미운영: mediaStatus.filter((m) => m.status === "미운영"),
  };

  return (
    <div className="media-input-status-bar" ref={containerRef}>
      <div className="status-bar-content">
        <span className="status-label">매체 운영 현황:</span>

        {/* 기재됨 (정상) */}
        {summary.normal > 0 && (
          <div
            className="status-item status-normal"
            onClick={(e) => handleStatusClick(e, "기재됨")}
          >
            <span className="status-icon">✓</span>
            <span className="status-text">
              기재됨 {summary.normal}건
            </span>
            {openedStatus === "기재됨" && (
              <div className="status-tooltip">
                <div className="tooltip-title">기재됨 (전날까지 입력 완료)</div>
                <ul className="tooltip-list">
                  {groupedMedia.기재됨.map((media) => (
                    <li
                      key={media.mediaId}
                      onClick={(e) => handleMediaClick(e, media)}
                      className="tooltip-list-item-clickable"
                    >
                      {media.mediaName} (최근: {media.lastInputDate})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 미기재 (1~3일) */}
        {summary.missing > 0 && (
          <div
            className="status-item status-missing"
            onClick={(e) => handleStatusClick(e, "미기재")}
          >
            <span className="status-icon">🔴</span>
            <span className="status-text">
              데이터 미기재 {summary.missing}건
            </span>
            {openedStatus === "미기재" && (
              <div className="status-tooltip">
                <div className="tooltip-title">데이터 미기재 (1~3일)</div>
                <ul className="tooltip-list">
                  {groupedMedia.미기재.map((media) => (
                    <li
                      key={media.mediaId}
                      onClick={(e) => handleMediaClick(e, media)}
                      className="tooltip-list-item-clickable"
                    >
                      {media.mediaName} ({media.missingDays}일)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 광고중단 (4일) */}
        {summary.paused > 0 && (
          <div
            className="status-item status-paused"
            onClick={(e) => handleStatusClick(e, "광고중단")}
          >
            <span className="status-icon">🟠</span>
            <span className="status-text">광고 중단 {summary.paused}건</span>
            {openedStatus === "광고중단" && (
              <div className="status-tooltip">
                <div className="tooltip-title">광고 중단 (4일)</div>
                <ul className="tooltip-list">
                  {groupedMedia.광고중단.map((media) => (
                    <li
                      key={media.mediaId}
                      onClick={(e) => handleMediaClick(e, media)}
                      className="tooltip-list-item-clickable"
                    >
                      {media.mediaName} ({media.missingDays}일)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 미운영 (5일 이상) */}
        {summary.inactive > 0 && (
          <div
            className="status-item status-inactive"
            onClick={(e) => handleStatusClick(e, "미운영")}
          >
            <span className="status-icon">⚫</span>
            <span className="status-text">미운영 {summary.inactive}건</span>
            {openedStatus === "미운영" && (
              <div className="status-tooltip">
                <div className="tooltip-title">미운영 (5일 이상)</div>
                <ul className="tooltip-list">
                  {groupedMedia.미운영.map((media) => (
                    <li
                      key={media.mediaId}
                      onClick={(e) => handleMediaClick(e, media)}
                      className="tooltip-list-item-clickable"
                    >
                      {media.mediaName} ({media.missingDays}일)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaInputStatusBar;
