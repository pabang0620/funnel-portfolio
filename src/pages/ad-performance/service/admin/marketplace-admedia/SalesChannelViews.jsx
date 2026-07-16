import Button from "../../../components/ui/Button";

// 방법1: 그룹 테이블 뷰 (아코디언 기능 포함)
export const GroupedTableView = ({ salesChannels, onEdit, onDelete }) => {
  const [openGroups, setOpenGroups] = React.useState({});

  const getGroupedChannels = () => {
    const grouped = {};
    salesChannels.forEach(channel => {
      const groupKey = channel.realName || "미연동";
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(channel);
    });
    return grouped;
  };

  const toggleGroup = (groupName) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const grouped = getGroupedChannels();
  // 미연동을 제일 먼저, 나머지는 알파벳 순으로 정렬
  const groupKeys = Object.keys(grouped).sort((a, b) => {
    if (a === "미연동") return -1;
    if (b === "미연동") return 1;
    return a.localeCompare(b);
  });

  // 초기에 모든 그룹 열기
  React.useEffect(() => {
    const initialOpen = {};
    groupKeys.forEach(key => {
      initialOpen[key] = true;
    });
    setOpenGroups(initialOpen);
  }, []);

  return (
    <div className="grouped-table-view">
      {groupKeys.map(groupName => (
        <div key={groupName} className={`channel-group ${openGroups[groupName] ? 'open' : ''}`}>
          <div className="group-header" onClick={() => toggleGroup(groupName)}>
            <h4 className="group-name">
              <span className="group-toggle-icon">{openGroups[groupName] ? '▼' : '▶'}</span>
              {groupName}
              <span className="group-count">({grouped[groupName].length}개)</span>
            </h4>
          </div>
          {openGroups[groupName] && (
            <div className="group-table-wrapper">
              <table className="list-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>번호</th>
                    <th style={{ width: '200px' }}>업로드된 이름</th>
                    <th style={{ width: '140px', whiteSpace: 'nowrap' }}>등록일</th>
                    <th style={{ width: '150px' }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped[groupName].map((channel, index) => (
                    <tr key={channel.id}>
                      <td>{index + 1}</td>
                      <td>{channel.uploadedName}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{channel.registeredDate}</td>
                      <td>
                        <div className="action-buttons">
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() => onEdit(channel)}
                          >
                            수정
                          </Button>
                          <Button
                            variant="danger"
                            size="small"
                            onClick={() => onDelete(channel.id)}
                          >
                            삭제
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// 방법2: 카드 뷰
export const CardView = ({ salesChannels, onEdit, onDelete }) => {
  const getGroupedChannels = () => {
    const grouped = {};
    salesChannels.forEach(channel => {
      const groupKey = channel.realName || "미연동";
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(channel);
    });
    return grouped;
  };

  const grouped = getGroupedChannels();
  // 미연동을 제일 먼저, 나머지는 알파벳 순으로 정렬
  const groupKeys = Object.keys(grouped).sort((a, b) => {
    if (a === "미연동") return -1;
    if (b === "미연동") return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="card-view">
      {groupKeys.map(groupName => (
        <div key={groupName} className="channel-group-card">
          <div className="card-group-header">
            <h4 className="card-group-name">
              {groupName}
              <span className="card-group-count">{grouped[groupName].length}개</span>
            </h4>
          </div>
          <div className="card-grid">
            {grouped[groupName].map(channel => (
              <div key={channel.id} className="channel-card">
                <div className="card-header">
                  <div className="card-title">{channel.uploadedName}</div>
                  <span className={`card-status ${channel.linkStatus === 'linked' ? 'status-linked' : 'status-unlinked'}`}>
                    {channel.linkStatus === 'linked' ? '✓' : '✗'}
                  </span>
                </div>
                <div className="card-body">
                  <div className="card-info">
                    <span className="card-label">등록일</span>
                    <span className="card-value">{channel.registeredDate}</span>
                  </div>
                </div>
                <div className="card-actions">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => onEdit(channel)}
                  >
                    수정
                  </Button>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => onDelete(channel.id)}
                  >
                    삭제
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 방법3: 아코디언 뷰
export const AccordionView = ({ salesChannels, onEdit, onDelete }) => {
  const [openGroups, setOpenGroups] = React.useState({});

  const getGroupedChannels = () => {
    const grouped = {};
    salesChannels.forEach(channel => {
      const groupKey = channel.realName || "미연동";
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(channel);
    });
    return grouped;
  };

  const toggleGroup = (groupName) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const grouped = getGroupedChannels();
  // 미연동을 제일 먼저, 나머지는 알파벳 순으로 정렬
  const groupKeys = Object.keys(grouped).sort((a, b) => {
    if (a === "미연동") return -1;
    if (b === "미연동") return 1;
    return a.localeCompare(b);
  });

  // 초기에 모든 그룹 열기
  React.useEffect(() => {
    const initialOpen = {};
    groupKeys.forEach(key => {
      initialOpen[key] = true;
    });
    setOpenGroups(initialOpen);
  }, []);

  return (
    <div className="accordion-view">
      {groupKeys.map(groupName => (
        <div key={groupName} className={`accordion-group ${openGroups[groupName] ? 'open' : ''}`}>
          <div className="accordion-header" onClick={() => toggleGroup(groupName)}>
            <div className="accordion-title">
              <span className="accordion-icon">{openGroups[groupName] ? '▼' : '▶'}</span>
              <h4 className="accordion-group-name">{groupName}</h4>
              <span className="accordion-count">{grouped[groupName].length}개</span>
            </div>
          </div>
          {openGroups[groupName] && (
            <div className="accordion-content">
              <div className="accordion-items">
                {grouped[groupName].map(channel => (
                  <div key={channel.id} className="accordion-item">
                    <div className="accordion-item-info">
                      <div className="accordion-item-name">{channel.uploadedName}</div>
                      <div className="accordion-item-meta">
                        <span className="accordion-item-date">{channel.registeredDate}</span>
                      </div>
                    </div>
                    <div className="accordion-item-actions">
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => onEdit(channel)}
                      >
                        수정
                      </Button>
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => onDelete(channel.id)}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// React import 추가
import React from "react";
