import React from "react";
import Button from "../../../../components/ui/Button";

function MediaTab({
  mediaList,
  mediaForm,
  setMediaForm,
  editingMediaId,
  editingMediaData,
  setEditingMediaData,
  openMenuId,
  detailDropdownOpen,
  detailForm,
  setDetailForm,
  editingDetailId,
  editingDetailData,
  setEditingDetailData,
  handleMediaSubmit,
  handleMediaEdit,
  handleMediaSave,
  handleMediaEditCancel,
  handleMediaDelete,
  toggleMenu,
  toggleDetailDropdown,
  handleAddDetail,
  handleEditDetail,
  handleSaveDetailEdit,
  handleCancelDetailEdit,
  handleDeleteDetail,
}) {
  return (
    <div className="tab-content">
      {/* 매체 등록 폼 */}
      <div className="registration-form">
        <div className="form-row">
          <div className="form-field" style={{ maxWidth: "300px" }}>
            <label htmlFor="media-name">매체명</label>
            <input
              id="media-name"
              type="text"
              className="form-input"
              placeholder="매체명을 입력하세요 (예: 구글)"
              value={mediaForm.name}
              onChange={(e) => setMediaForm({ ...mediaForm, name: e.target.value })}
              onKeyPress={(e) => e.key === "Enter" && handleMediaSubmit()}
            />
          </div>
          <div className="form-field" style={{ maxWidth: "150px" }}>
            <label htmlFor="media-fee" title="돌려받는 금액">대행료 (%)</label>
            <input
              id="media-fee"
              type="number"
              className="form-input"
              placeholder="예: 15"
              min="0"
              max="100"
              step="0.01"
              value={mediaForm.fee}
              onChange={(e) => setMediaForm({ ...mediaForm, fee: e.target.value })}
              onKeyPress={(e) => e.key === "Enter" && handleMediaSubmit()}
            />
          </div>
        </div>
        <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.5rem" }}>
          * 매체 상세 (구글1, 구글2 등)는 등록 후 "매체 상세"에서 추가할 수 있습니다.
        </p>
        <div className="form-actions">
          <Button variant="primary" size="large" onClick={handleMediaSubmit}>
            매체 등록하기
          </Button>
        </div>
      </div>

      {/* 매체 리스트 */}
      <div className="list-section">
        <div className="list-table-wrapper">
          <table className="list-table">
            <thead>
              <tr>
                <th>매체명</th>
                <th>대행료 (%)</th>
                <th>매체 상세</th>
                <th>등록일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {mediaList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">
                    No media channels registered.
                  </td>
                </tr>
              ) : (
                mediaList.map((media) => {
                  const isEditing = editingMediaId === media.id;
                  const displayDetails = isEditing ? editingMediaData.details : media.details;

                  return (
                    <tr key={media.id}>
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingMediaData.name}
                            onChange={(e) =>
                              setEditingMediaData({ ...editingMediaData, name: e.target.value })
                            }
                            style={{
                              width: "120px",
                              border: "1px solid #e2e8f0",
                              borderRadius: "4px",
                              padding: "0.375rem 0.5rem",
                              fontSize: "0.875rem",
                              background: "white",
                            }}
                            autoFocus
                          />
                        ) : (
                          <span style={{ fontWeight: "600" }}>{media.name}</span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editingMediaData.fee ?? ""}
                            onChange={(e) =>
                              setEditingMediaData({ ...editingMediaData, fee: e.target.value })
                            }
                            min="0"
                            max="100"
                            step="0.01"
                            style={{
                              width: "80px",
                              border: "1px solid #e2e8f0",
                              borderRadius: "4px",
                              padding: "0.375rem 0.5rem",
                              fontSize: "0.875rem",
                              background: "white",
                              textAlign: "right",
                            }}
                          />
                        ) : (
                          <span>{media.fee !== null && media.fee !== undefined ? `${media.fee}%` : "-"}</span>
                        )}
                      </td>
                      <td style={{ position: "relative" }}>
                        <MediaDetailCell
                          media={media}
                          isEditing={isEditing}
                          displayDetails={displayDetails}
                          detailDropdownOpen={detailDropdownOpen}
                          toggleDetailDropdown={toggleDetailDropdown}
                          detailForm={detailForm}
                          setDetailForm={setDetailForm}
                          editingDetailId={editingDetailId}
                          editingDetailData={editingDetailData}
                          setEditingDetailData={setEditingDetailData}
                          handleAddDetail={handleAddDetail}
                          handleEditDetail={handleEditDetail}
                          handleSaveDetailEdit={handleSaveDetailEdit}
                          handleCancelDetailEdit={handleCancelDetailEdit}
                          handleDeleteDetail={handleDeleteDetail}
                        />
                      </td>
                      <td>{media.registeredDate}</td>
                      <td>
                        {isEditing ? (
                          <div className="action-buttons">
                            <Button variant="primary" size="small" onClick={handleMediaSave}>
                              저장
                            </Button>
                            <Button variant="secondary" size="small" onClick={handleMediaEditCancel}>
                              취소
                            </Button>
                          </div>
                        ) : (
                          <div className="dropdown-menu-container">
                            <button className="menu-trigger-btn" onClick={() => toggleMenu(media.id)}>
                              ⋯
                            </button>
                            {openMenuId === media.id && (
                              <div className="dropdown-menu">
                                <button className="dropdown-item" onClick={() => handleMediaEdit(media)}>
                                  수정
                                </button>
                                <button className="dropdown-item" onClick={() => handleMediaDelete(media.id)}>
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
      </div>
    </div>
  );
}

// 매체 상세 셀 컴포넌트
function MediaDetailCell({
  media,
  isEditing,
  displayDetails,
  detailDropdownOpen,
  toggleDetailDropdown,
  detailForm,
  setDetailForm,
  editingDetailId,
  editingDetailData,
  setEditingDetailData,
  handleAddDetail,
  handleEditDetail,
  handleSaveDetailEdit,
  handleCancelDetailEdit,
  handleDeleteDetail,
}) {
  return (
    <>
      <div
        data-detail-trigger
        onClick={() => isEditing && toggleDetailDropdown(media.id)}
        style={{
          cursor: isEditing ? "pointer" : "default",
          minHeight: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "0.25rem",
          padding: "0.25rem",
        }}
      >
        {displayDetails && displayDetails.length > 0 ? (
          displayDetails.map((detail) => (
            <span
              key={detail.id}
              style={{
                padding: "0.25rem 0.5rem",
                backgroundColor: "#f0fdf4",
                color: "#166534",
                borderRadius: "4px",
                fontSize: "0.75rem",
                fontWeight: "500",
                border: "1px solid #bbf7d0",
              }}
            >
              {detail.name}
            </span>
          ))
        ) : (
          <span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
            {isEditing ? "클릭하여 추가" : "-"}
          </span>
        )}
      </div>

      {/* 노션 스타일 드롭다운 */}
      {isEditing && detailDropdownOpen === media.id && (
        <div className="notion-style-dropdown">
          <div className="notion-dropdown-content">
            {/* 기존 매체 상세 리스트 */}
            {displayDetails && displayDetails.length > 0 && (
              <>
                <div className="notion-list-section">
                  {displayDetails.map((detail) => {
                    const isEditingDetail = editingDetailId === detail.id;
                    return (
                      <div key={detail.id} className="notion-list-item">
                        {isEditingDetail ? (
                          <>
                            <div className="notion-edit-inputs">
                              <input
                                type="text"
                                value={editingDetailData.name}
                                onChange={(e) =>
                                  setEditingDetailData({ ...editingDetailData, name: e.target.value })
                                }
                                className="notion-input-small"
                                placeholder="매체 상세명"
                                onClick={(e) => e.stopPropagation()}
                                onKeyPress={(e) => e.key === "Enter" && handleSaveDetailEdit()}
                              />
                            </div>
                            <div className="notion-item-actions">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveDetailEdit();
                                }}
                                className="notion-save-btn"
                              >
                                저장
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelDetailEdit();
                                }}
                                className="notion-cancel-btn"
                              >
                                취소
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="notion-item-info">
                              <span className="notion-item-name">{detail.name}</span>
                            </div>
                            <div className="notion-item-actions">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditDetail(detail);
                                }}
                                className="notion-edit-btn"
                              >
                                수정
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteDetail(detail.id);
                                }}
                                className="notion-delete-btn"
                              >
                                삭제
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="notion-divider"></div>
              </>
            )}

            {/* 하단 추가 입력 */}
            <div className="notion-add-section">
              <div className="notion-add-label">새 매체 상세 추가</div>
              <div className="notion-add-inputs">
                <input
                  type="text"
                  placeholder="매체 상세명 (예: 구글1)"
                  value={detailForm.name}
                  onChange={(e) => setDetailForm({ ...detailForm, name: e.target.value })}
                  className="notion-input"
                  onClick={(e) => e.stopPropagation()}
                  onKeyPress={(e) => e.key === "Enter" && handleAddDetail(media.id)}
                />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddDetail(media.id);
                }}
                className="notion-add-btn"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MediaTab;
