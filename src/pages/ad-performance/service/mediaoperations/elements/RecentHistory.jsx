function RecentHistory({ historyLogs, onViewDetails }) {
  // 최근 10개만 표시
  const recentLogs = historyLogs.slice(0, 10);

  // 팀명 축약 함수
  const abbreviateTeam = (teamName) => {
    return teamName
      .replace('퍼포먼스', '퍼포')
      .replace('온라인', '온라');
  };

  // 날짜 형식 변경 (년도 제거)
  const formatDate = (datetime) => {
    // 형식: "25.11.19 14:30" -> "11.19 14:30"
    const parts = datetime.split(' ');
    if (parts.length === 2) {
      const datePart = parts[0]; // "25.11.19"
      const timePart = parts[1]; // "14:30"
      const dateSegments = datePart.split('.'); // ["25", "11", "19"]
      if (dateSegments.length === 3) {
        return `${dateSegments[1]}.${dateSegments[2]} ${timePart}`;
      }
    }
    return datetime;
  };

  return (
    <div className="recent-history-container">
      <div className="recent-history-header">
        <h3>최근 히스토리</h3>
        <button className="view-details-btn" onClick={onViewDetails}>
          상세히 보기
        </button>
      </div>
      <div className="recent-history-list">
        {recentLogs.length === 0 ? (
          <div className="no-history">No history.</div>
        ) : (
          recentLogs.map((log, index) => (
            <div key={index} className="history-item">
              <span className="history-team">{abbreviateTeam(log.team)}</span>
              <span className="history-product">{log.product}</span>
              <span className={`history-action ${log.action === 'ON' ? 'action-on' : 'action-off'}`}>
                {log.action}
              </span>
              <span className="history-datetime">{formatDate(log.datetime)}</span>
              <span className="history-editor">{log.editor}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RecentHistory;
