import React, { useEffect } from "react";
import Button from "../../../../components/ui/Button";
import CustomSelectWithAdd from "./CustomSelectWithAdd";

function SalesChannelTab({
  // 상태
  salesChannels,
  salesChannelForm,
  setSalesChannelForm,
  editingSalesChannelId,
  editingSalesChannelData,
  setEditingSalesChannelData,
  categoryFilter,
  setCategoryFilter,
  categoryDropdownOpen,
  setCategoryDropdownOpen,
  channels,
  pagination,
  openMenuId,

  // 핸들러
  fetchData,
  handleSubmit,
  handleEdit,
  handleSave,
  handleEditCancel,
  handleDelete,
  handleSelectCategory,
  handleAddChannel,
  handleEditChannel,
  handleDeleteChannel,
  toggleMenu,
}) {
  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoryDropdownOpen !== null &&
        !event.target.closest(".category-dropdown") &&
        !event.target.closest("[data-category-trigger]")
      ) {
        setCategoryDropdownOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [categoryDropdownOpen, setCategoryDropdownOpen]);

  // 필터링된 채널
  const getFilteredChannels = () => {
    let filteredChannels = salesChannels;
    if (categoryFilter !== "all") {
      if (categoryFilter === "none") {
        filteredChannels = salesChannels.filter(
          (ch) => ch.realChannelId === null
        );
      } else {
        filteredChannels = salesChannels.filter(
          (ch) => ch.realChannelId === categoryFilter
        );
      }
    }
    return filteredChannels;
  };

  // 정렬된 채널
  const getSortedChannels = () => {
    const filtered = getFilteredChannels();
    return [...filtered].sort((a, b) => {
      return a.uploadedName.localeCompare(b.uploadedName);
    });
  };

  // 그룹핑 정보 계산
  const getGroupInfo = (sorted) => {
    const groupInfo = [];
    if (editingSalesChannelId === null) {
      let i = 0;
      while (i < sorted.length) {
        const currentName = sorted[i].uploadedName;
        let groupSize = 1;

        while (
          i + groupSize < sorted.length &&
          sorted[i + groupSize].uploadedName === currentName
        ) {
          groupSize++;
        }

        groupInfo.push({
          isGroupStart: true,
          rowSpan: groupSize,
        });
        for (let j = 1; j < groupSize; j++) {
          groupInfo.push({
            isGroupStart: false,
            rowSpan: 0,
          });
        }

        i += groupSize;
      }
    } else {
      sorted.forEach(() => {
        groupInfo.push({ isGroupStart: true, rowSpan: 1 });
      });
    }
    return groupInfo;
  };

  const sorted = getSortedChannels();
  const groupInfo = getGroupInfo(sorted);

  return (
    <div className="tab-content">
      {/* 판매처 등록 폼 */}
      <div className="registration-form sales-channel-registration-form">
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="channel-real-name">판매처명</label>
            <CustomSelectWithAdd
              options={channels}
              value={salesChannelForm.realChannelId}
              onChange={(id) =>
                setSalesChannelForm({
                  ...salesChannelForm,
                  realChannelId: id,
                })
              }
              onAdd={handleAddChannel}
              onEdit={handleEditChannel}
              onDelete={handleDeleteChannel}
              placeholder="선택하세요"
              addPlaceholder="새 판매처명 입력"
              addLabel="새 판매처 추가"
              requireSGrade={true}
            />
          </div>
          <div className="form-field">
            <label htmlFor="channel-uploaded-name">파일 판매처명</label>
            <input
              id="channel-uploaded-name"
              type="text"
              className="form-input"
              placeholder="파일 판매처명을 입력하세요"
              value={salesChannelForm.uploadedName}
              onChange={(e) =>
                setSalesChannelForm({
                  ...salesChannelForm,
                  uploadedName: e.target.value,
                })
              }
            />
          </div>
        </div>
        <div className="form-actions">
          <Button variant="primary" size="large" onClick={handleSubmit}>
            판매처 등록하기
          </Button>
        </div>
      </div>

      {/* 판매처 리스트 */}
      <div className="list-section">
        {/* 판매처 선택 */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "1rem",
          }}
        >
          <div style={{ width: "180px" }}>
            <select
              className="table-select"
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value === "all"
                    ? "all"
                    : e.target.value === "none"
                    ? "none"
                    : parseInt(e.target.value)
                )
              }
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                background: "white",
                fontSize: "0.875rem",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="all">전체 ({salesChannels.length})</option>
              {channels.map((rc) => (
                <option key={rc.id} value={rc.id}>
                  {rc.name} (
                  {
                    salesChannels.filter((ch) => ch.realChannelId === rc.id)
                      .length
                  }
                  )
                </option>
              ))}
              <option value="none">
                분류안함 (
                {salesChannels.filter((ch) => ch.realChannelId === null).length}
                )
              </option>
            </select>
          </div>
        </div>

        <div className="list-table-wrapper">
          <table className="list-table">
            <thead>
              <tr>
                <th>판매처명</th>
                <th>파일 판매처명</th>
                <th>상태</th>
                <th>등록일</th>
                <th>수정일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {salesChannels.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    등록된 판매처가 없습니다.
                  </td>
                </tr>
              ) : (
                sorted.map((channel, index) => {
                  const isEditing = editingSalesChannelId === channel.id;
                  const groupData = groupInfo[index];

                  return (
                    <tr
                      key={channel.id}
                      style={
                        channel.isUnassigned
                          ? {
                              background: "#fffbeb",
                              borderLeft: "3px solid #f59e0b",
                            }
                          : {}
                      }
                    >
                      {groupData.isGroupStart && (
                        <td
                          style={{
                            position: "relative",
                            verticalAlign: "middle",
                          }}
                          rowSpan={groupData.rowSpan}
                        >
                          {isEditing ? (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                position: "relative",
                                width: "100%",
                                maxWidth: "200px",
                              }}
                            >
                              <button
                                data-category-trigger
                                onClick={() =>
                                  setCategoryDropdownOpen(
                                    categoryDropdownOpen === channel.id
                                      ? null
                                      : channel.id
                                  )
                                }
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  width: "100%",
                                  padding: "1rem 1.25rem",
                                  borderRadius: "12px",
                                  background:
                                    categoryDropdownOpen === channel.id
                                      ? "white"
                                      : "#f8fafc",
                                  border:
                                    categoryDropdownOpen === channel.id
                                      ? "2px solid #3b82f6"
                                      : "2px solid transparent",
                                  cursor: "pointer",
                                  outline: "none",
                                  fontSize: "1rem",
                                  transition: "all 0.3s ease",
                                  boxShadow:
                                    categoryDropdownOpen === channel.id
                                      ? "0 0 0 3px rgba(59, 130, 246, 0.1)"
                                      : "none",
                                  minHeight: "3.25rem",
                                  boxSizing: "border-box",
                                }}
                                onMouseEnter={(e) => {
                                  if (categoryDropdownOpen !== channel.id) {
                                    e.currentTarget.style.background = "white";
                                    e.currentTarget.style.borderColor =
                                      "#3b82f6";
                                    e.currentTarget.style.boxShadow =
                                      "0 0 0 3px rgba(59, 130, 246, 0.1)";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (categoryDropdownOpen !== channel.id) {
                                    e.currentTarget.style.background =
                                      "#f8fafc";
                                    e.currentTarget.style.borderColor =
                                      "transparent";
                                    e.currentTarget.style.boxShadow = "none";
                                  }
                                }}
                              >
                                <span
                                  style={{
                                    color: "#1e293b",
                                    flex: 1,
                                    textAlign: "left",
                                  }}
                                >
                                  {editingSalesChannelData.realChannelId
                                    ? channels.find(
                                        (rc) =>
                                          rc.id ===
                                          editingSalesChannelData.realChannelId
                                      )?.name
                                    : "판매처명 선택"}
                                </span>
                                <span
                                  style={{
                                    fontSize: "0.875rem",
                                    color: "#6b7280",
                                    transform:
                                      categoryDropdownOpen === channel.id
                                        ? "rotate(180deg)"
                                        : "rotate(0deg)",
                                    transition: "transform 0.2s ease",
                                    display: "inline-block",
                                  }}
                                >
                                  ▼
                                </span>
                              </button>

                              {categoryDropdownOpen === channel.id && (
                                <div className="category-dropdown notion-style-dropdown">
                                  <div className="category-dropdown-content">
                                    <div className="category-dropdown-header">
                                      판매처명 선택
                                    </div>
                                    <div className="category-options">
                                      <button
                                        onClick={() =>
                                          handleSelectCategory(null)
                                        }
                                        className={`category-option-btn ${
                                          editingSalesChannelData.realChannelId ===
                                          null
                                            ? "selected"
                                            : ""
                                        }`}
                                        style={{
                                          color: "#787774",
                                          fontSize: "0.875rem",
                                        }}
                                      >
                                        -
                                      </button>
                                      {channels.map((rc) => (
                                        <button
                                          key={rc.id}
                                          onClick={() =>
                                            handleSelectCategory(rc.id)
                                          }
                                          className={`category-option-btn ${
                                            editingSalesChannelData.realChannelId ===
                                            rc.id
                                              ? "selected"
                                              : ""
                                          }`}
                                          style={{
                                            color: "#1e293b",
                                            fontSize: "0.875rem",
                                          }}
                                        >
                                          {rc.name}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <span
                                style={{
                                  color: "#1e293b",
                                  fontSize: "0.875rem",
                                }}
                              >
                                {channel.uploadedName}
                              </span>
                            </div>
                          )}
                        </td>
                      )}
                      <td>
                        {channel.fileMarketPlaceName ? (
                          <span>{channel.fileMarketPlaceName}</span>
                        ) : (
                          <span
                            style={{
                              color: "#94a3b8",
                              fontSize: "0.875rem",
                            }}
                          >
                            -
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "0.25rem 0.75rem",
                            borderRadius: "12px",
                            fontSize: "0.75rem",
                            border:
                              channel.fileMarketPlaceName &&
                              !channel.isUnassigned
                                ? "1.5px solid #d1fae5"
                                : "1.5px solid #fde68a",
                            background:
                              channel.fileMarketPlaceName &&
                              !channel.isUnassigned
                                ? "#d1fae5"
                                : "#fef3c7",
                            color:
                              channel.fileMarketPlaceName &&
                              !channel.isUnassigned
                                ? "#065f46"
                                : "#92400e",
                          }}
                        >
                          {channel.fileMarketPlaceName && !channel.isUnassigned
                            ? "지정"
                            : "미지정"}
                        </span>
                      </td>
                      <td>{channel.registeredDate}</td>
                      <td>{channel.modifiedDate}</td>
                      <td>
                        {isEditing ? (
                          <div className="action-buttons">
                            <Button
                              variant="primary"
                              size="small"
                              onClick={handleSave}
                            >
                              저장
                            </Button>
                            <Button
                              variant="secondary"
                              size="small"
                              onClick={handleEditCancel}
                            >
                              취소
                            </Button>
                          </div>
                        ) : (
                          <div className="dropdown-menu-container">
                            <button
                              className="menu-trigger-btn"
                              onClick={() => toggleMenu(channel.id)}
                            >
                              ⋯
                            </button>
                            {openMenuId === channel.id && (
                              <div className="dropdown-menu">
                                <button
                                  className="dropdown-item"
                                  onClick={() => {
                                    handleEdit(channel);
                                  }}
                                >
                                  수정
                                </button>
                                <button
                                  className="dropdown-item"
                                  onClick={() => {
                                    handleDelete(channel.id);
                                  }}
                                >
                                  삭제
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 판매처 페이지네이션 */}
        {pagination.totalCount > 0 && (
          <div
            className="pagination-wrapper"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "1.5rem",
            }}
          >
            <button
              className="pagination-btn"
              onClick={() =>
                fetchData(1, categoryFilter !== "all" ? categoryFilter : null)
              }
              disabled={pagination.page === 1}
              style={{
                padding: "0.5rem 0.75rem",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                background: pagination.page === 1 ? "#f1f5f9" : "white",
                cursor: pagination.page === 1 ? "not-allowed" : "pointer",
                color: pagination.page === 1 ? "#94a3b8" : "#1e293b",
              }}
            >
              «
            </button>
            <button
              className="pagination-btn"
              onClick={() =>
                fetchData(
                  pagination.page - 1,
                  categoryFilter !== "all" ? categoryFilter : null
                )
              }
              disabled={pagination.page === 1}
              style={{
                padding: "0.5rem 0.75rem",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                background: pagination.page === 1 ? "#f1f5f9" : "white",
                cursor: pagination.page === 1 ? "not-allowed" : "pointer",
                color: pagination.page === 1 ? "#94a3b8" : "#1e293b",
              }}
            >
              ‹
            </button>
            <span
              style={{
                padding: "0.5rem 1rem",
                color: "#64748b",
                fontSize: "0.875rem",
              }}
            >
              {pagination.page} / {pagination.totalPages} 페이지 (총{" "}
              {pagination.totalCount}건)
            </span>
            <button
              className="pagination-btn"
              onClick={() =>
                fetchData(
                  pagination.page + 1,
                  categoryFilter !== "all" ? categoryFilter : null
                )
              }
              disabled={pagination.page === pagination.totalPages}
              style={{
                padding: "0.5rem 0.75rem",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                background:
                  pagination.page === pagination.totalPages
                    ? "#f1f5f9"
                    : "white",
                cursor:
                  pagination.page === pagination.totalPages
                    ? "not-allowed"
                    : "pointer",
                color:
                  pagination.page === pagination.totalPages
                    ? "#94a3b8"
                    : "#1e293b",
              }}
            >
              ›
            </button>
            <button
              className="pagination-btn"
              onClick={() =>
                fetchData(
                  pagination.totalPages,
                  categoryFilter !== "all" ? categoryFilter : null
                )
              }
              disabled={pagination.page === pagination.totalPages}
              style={{
                padding: "0.5rem 0.75rem",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                background:
                  pagination.page === pagination.totalPages
                    ? "#f1f5f9"
                    : "white",
                cursor:
                  pagination.page === pagination.totalPages
                    ? "not-allowed"
                    : "pointer",
                color:
                  pagination.page === pagination.totalPages
                    ? "#94a3b8"
                    : "#1e293b",
              }}
            >
              »
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SalesChannelTab;
