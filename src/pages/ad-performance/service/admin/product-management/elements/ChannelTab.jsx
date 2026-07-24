import React, { useState } from "react";
import Button from "../../../../components/ui/Button";

function ChannelTab({
  channelList,
  channelForm,
  setChannelForm,
  editingChannelId,
  editingChannelData,
  setEditingChannelData,
  openMenuId,
  loading,
  handleChannelSubmit,
  handleChannelEdit,
  handleChannelSave,
  handleChannelEditCancel,
  handleChannelDelete,
  toggleMenu,
}) {
  const [expandedIds, setExpandedIds] = useState([]);

  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="tab-content">
      {/* 판매처 등록 폼 */}
      <div className="registration-form">
        <div className="form-row">
          <div className="form-field" style={{ maxWidth: "400px" }}>
            <label htmlFor="channel-name">판매처명</label>
            <input
              id="channel-name"
              type="text"
              className="form-input"
              placeholder="판매처명을 입력하세요 (예: 카페24)"
              value={channelForm.name}
              onChange={(e) => setChannelForm({ ...channelForm, name: e.target.value })}
              onKeyPress={(e) => e.key === "Enter" && handleChannelSubmit()}
            />
          </div>
        </div>
        <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.5rem" }}>
          * 판매처는 엑셀 업로드 시 코드와 매칭됩니다.
        </p>
        <div className="form-actions">
          <Button variant="primary" size="large" onClick={handleChannelSubmit}>
            판매처 등록하기
          </Button>
        </div>
      </div>

      {/* 판매처 리스트 */}
      <div className="list-section">
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
            로딩 중...
          </div>
        ) : (
          <div className="list-table-wrapper">
            <table className="list-table">
              <thead>
                <tr>
                  <th style={{ width: "40%" }}>판매처명</th>
                  <th style={{ width: "15%" }}>파일 판매처</th>
                  <th style={{ width: "25%" }}>등록일</th>
                  <th style={{ width: "20%" }}>관리</th>
                </tr>
              </thead>
              <tbody>
                {channelList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="no-data">
                      No sellers registered.
                    </td>
                  </tr>
                ) : (
                  channelList.map((channel) => {
                    const isEditing = editingChannelId === channel.id;
                    const isExpanded = expandedIds.includes(channel.id);
                    const hasFileMarketPlaces = channel.fileMarketPlaceCount > 0;

                    return (
                      <React.Fragment key={channel.id}>
                        <tr className={channel.isUnassigned ? "unassigned-row" : ""}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              {hasFileMarketPlaces && (
                                <button
                                  onClick={() => toggleExpand(channel.id)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: "0.25rem",
                                    fontSize: "0.75rem",
                                    color: "#6b7280",
                                    transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                                    transition: "transform 0.2s",
                                  }}
                                >
                                  ▶
                                </button>
                              )}
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingChannelData.name}
                                  onChange={(e) =>
                                    setEditingChannelData({ ...editingChannelData, name: e.target.value })
                                  }
                                  onKeyPress={(e) => e.key === "Enter" && handleChannelSave()}
                                  style={{
                                    width: "200px",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "4px",
                                    padding: "0.375rem 0.5rem",
                                    fontSize: "0.875rem",
                                    background: "white",
                                  }}
                                  autoFocus
                                />
                              ) : (
                                <span style={{ fontWeight: "500" }}>
                                  {channel.name}
                                  {channel.isUnassigned && (
                                    <span
                                      style={{
                                        marginLeft: "0.5rem",
                                        fontSize: "0.75rem",
                                        padding: "0.125rem 0.375rem",
                                        background: "#fef3c7",
                                        color: "#92400e",
                                        borderRadius: "4px",
                                      }}
                                    >
                                      시스템
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            {hasFileMarketPlaces ? (
                              <span
                                style={{
                                  background: "#e0f2fe",
                                  color: "#0369a1",
                                  padding: "0.125rem 0.5rem",
                                  borderRadius: "4px",
                                  fontSize: "0.8rem",
                                  cursor: "pointer",
                                }}
                                onClick={() => toggleExpand(channel.id)}
                              >
                                {channel.fileMarketPlaceCount}개
                              </span>
                            ) : (
                              <span style={{ color: "#9ca3af" }}>-</span>
                            )}
                          </td>
                          <td>{channel.registeredDate}</td>
                          <td>
                            {channel.isUnassigned ? (
                              <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>-</span>
                            ) : isEditing ? (
                              <div className="action-buttons">
                                <Button variant="primary" size="small" onClick={handleChannelSave}>
                                  저장
                                </Button>
                                <Button variant="secondary" size="small" onClick={handleChannelEditCancel}>
                                  취소
                                </Button>
                              </div>
                            ) : (
                              <div className="dropdown-menu-container">
                                <button className="menu-trigger-btn" onClick={() => toggleMenu(channel.id)}>
                                  ⋯
                                </button>
                                {openMenuId === channel.id && (
                                  <div className="dropdown-menu">
                                    <button
                                      className="dropdown-item"
                                      onClick={() => handleChannelEdit(channel)}
                                    >
                                      수정
                                    </button>
                                    <button
                                      className="dropdown-item"
                                      onClick={() => handleChannelDelete(channel.id)}
                                    >
                                      삭제
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                        {/* 파일 판매처 (자식) 목록 */}
                        {isExpanded && hasFileMarketPlaces && (
                          channel.fileMarketPlaces.map((fileMP) => (
                            <tr key={fileMP.id} className="file-marketplace-row">
                              <td style={{ paddingLeft: "2.5rem" }}>
                                <span style={{ color: "#6b7280" }}>└</span>{" "}
                                <span style={{ fontSize: "0.875rem" }}>{fileMP.name}</span>
                                {fileMP.status === "미지정" && (
                                  <span
                                    style={{
                                      marginLeft: "0.5rem",
                                      fontSize: "0.7rem",
                                      padding: "0.1rem 0.3rem",
                                      background: "#fef3c7",
                                      color: "#92400e",
                                      borderRadius: "3px",
                                    }}
                                  >
                                    미지정
                                  </span>
                                )}
                              </td>
                              <td></td>
                              <td style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                                {fileMP.createdAt ? new Date(fileMP.createdAt).toISOString().split("T")[0] : "-"}
                              </td>
                              <td></td>
                            </tr>
                          ))
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChannelTab;
