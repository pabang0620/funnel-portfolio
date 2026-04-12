import React, { useEffect } from "react";
import Button from "../../../../components/ui/Button";
import CustomSelectWithAdd from "./CustomSelectWithAdd";

function MediaTab({
  // 상태
  mediaCategories,
  mediaDetails,
  products,
  mediaForm,
  setMediaForm,
  editingMediaId,
  editingMediaData,
  setEditingMediaData,
  mediaCategoryFilter,
  setMediaCategoryFilter,
  mediaCategoryDropdownOpen,
  setMediaCategoryDropdownOpen,
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
  handleAddCategory,
  handleEditCategory,
  handleDeleteCategory,
  toggleMenu,
}) {
  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mediaCategoryDropdownOpen !== null &&
        !event.target.closest(".category-dropdown") &&
        !event.target.closest("[data-media-category-trigger]")
      ) {
        setMediaCategoryDropdownOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mediaCategoryDropdownOpen, setMediaCategoryDropdownOpen]);

  // 정렬 (서버에서 이미 필터링된 데이터를 받음)
  const getSortedMedia = () => {
    return [...mediaDetails].sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
  };

  // 그룹핑 정보 계산
  const getGroupInfo = (sorted) => {
    const groupInfo = [];
    if (editingMediaId === null) {
      let i = 0;
      while (i < sorted.length) {
        const currentName = sorted[i].name;
        let groupSize = 1;
        while (
          i + groupSize < sorted.length &&
          sorted[i + groupSize].name === currentName
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

  const sorted = getSortedMedia();
  const groupInfo = getGroupInfo(sorted);

  return (
    <div className="tab-content">
      {/* 매체 상세 등록 폼 */}
      <div className="registration-form media-registration-form">
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="media-category">매체명</label>
            <CustomSelectWithAdd
              options={mediaCategories}
              value={mediaForm.mediaCategoryId}
              onChange={(id) =>
                setMediaForm({ ...mediaForm, mediaCategoryId: id })
              }
              onAdd={handleAddCategory}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
              placeholder="선택하세요"
              addPlaceholder="새 매체명 입력"
              addLabel="새 매체 추가"
              showFee={true}
              requireSGrade={true}
            />
          </div>
          <div className="form-field">
            <label htmlFor="media-detail-name">태그</label>
            <input
              id="media-detail-name"
              type="text"
              className="form-input"
              placeholder="태그를 입력하세요 (예: 구글1)"
              value={mediaForm.name}
              onChange={(e) =>
                setMediaForm({ ...mediaForm, name: e.target.value })
              }
            />
          </div>
        </div>
        <div className="form-actions">
          <Button variant="primary" size="large" onClick={handleSubmit}>
            매체 태그 등록하기
          </Button>
        </div>
      </div>

      {/* 매체 상세 리스트 */}
      <div className="list-section">
        {/* 매체 필터 */}
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
              value={mediaCategoryFilter}
              onChange={(e) => {
                const newFilter =
                  e.target.value === "all"
                    ? "all"
                    : e.target.value === "none"
                    ? "none"
                    : parseInt(e.target.value);
                setMediaCategoryFilter(newFilter);
                fetchData(1, newFilter !== "all" ? newFilter : null);
              }}
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
              <option value="all">전체</option>
              {mediaCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
              <option value="none">분류안함</option>
            </select>
          </div>
        </div>

        <div className="list-table-wrapper">
          <table className="list-table">
            <thead>
              <tr>
                <th>매체명</th>
                <th title="돌려받는 금액">대행료 (%)</th>
                <th>제품</th>
                <th>태그</th>
                <th>상태</th>
                <th>수정일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {mediaDetails.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    등록된 매체 상세가 없습니다.
                  </td>
                </tr>
              ) : (
                sorted.map((mediaItem, index) => {
                  const isEditing = editingMediaId === mediaItem.id;
                  const groupData = groupInfo[index];
                  const isStopped = mediaItem.status === 0;

                  return (
                    <tr
                      key={mediaItem.id}
                      className={
                        isStopped && !isEditing ? "media-row--stopped" : ""
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
                            <div className="media-category-trigger-wrapper">
                              <button
                                data-media-category-trigger
                                className={`media-category-trigger-btn ${
                                  mediaCategoryDropdownOpen === mediaItem.id
                                    ? "media-category-trigger-btn--open"
                                    : ""
                                }`}
                                onClick={() =>
                                  setMediaCategoryDropdownOpen(
                                    mediaCategoryDropdownOpen === mediaItem.id
                                      ? null
                                      : mediaItem.id
                                  )
                                }
                              >
                                <span className="media-category-trigger-btn__value">
                                  {editingMediaData.mediaCategoryId
                                    ? mediaCategories.find(
                                        (cat) =>
                                          cat.id ===
                                          editingMediaData.mediaCategoryId
                                      )?.name
                                    : "매체명 선택"}
                                </span>
                                <span
                                  className={`media-category-trigger-btn__arrow ${
                                    mediaCategoryDropdownOpen === mediaItem.id
                                      ? "media-category-trigger-btn__arrow--open"
                                      : ""
                                  }`}
                                >
                                  ▼
                                </span>
                              </button>

                              {mediaCategoryDropdownOpen === mediaItem.id && (
                                <div className="category-dropdown notion-style-dropdown">
                                  <div className="category-dropdown-content">
                                    <div className="category-dropdown-header">
                                      매체명 선택
                                    </div>
                                    <div className="category-options">
                                      <button
                                        onClick={() =>
                                          handleSelectCategory(null)
                                        }
                                        className={`category-option-btn ${
                                          editingMediaData.mediaCategoryId ===
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
                                      {mediaCategories.map((cat) => (
                                        <button
                                          key={cat.id}
                                          onClick={() =>
                                            handleSelectCategory(cat.id)
                                          }
                                          className={`category-option-btn ${
                                            editingMediaData.mediaCategoryId ===
                                            cat.id
                                              ? "selected"
                                              : ""
                                          }`}
                                          style={{
                                            color: "#1e293b",
                                            fontSize: "0.875rem",
                                          }}
                                        >
                                          {cat.name}
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
                                {mediaItem.name}
                              </span>
                            </div>
                          )}
                        </td>
                      )}
                      {groupData.isGroupStart && (
                        <td
                          style={{
                            verticalAlign: "middle",
                          }}
                          rowSpan={groupData.rowSpan}
                        >
                          {isEditing ? (
                            <input
                              type="number"
                              value={editingMediaData.fee}
                              onChange={(e) =>
                                setEditingMediaData({
                                  ...editingMediaData,
                                  fee: e.target.value,
                                })
                              }
                              placeholder="대행료 (%)"
                              min="0"
                              max="100"
                              step="0.1"
                              style={{
                                width: "80px",
                                border: "1px solid #e2e8f0",
                                borderRadius: "4px",
                                padding: "0.375rem 0.5rem",
                                fontSize: "0.8125rem",
                                background: "white",
                                color: "#1e293b",
                                outline: "none",
                                lineHeight: "1.5",
                                minHeight: "2rem",
                                boxSizing: "border-box",
                              }}
                              onFocus={(e) =>
                                (e.target.style.borderColor = "#3b82f6")
                              }
                              onBlur={(e) =>
                                (e.target.style.borderColor = "#e2e8f0")
                              }
                            />
                          ) : (
                            (() => {
                              const category = mediaCategories.find(
                                (cat) => cat.id === mediaItem.mediaCategoryId
                              );
                              return category?.fee != null
                                ? `${category.fee}%`
                                : "-";
                            })()
                          )}
                        </td>
                      )}
                      {/* 제품 컬럼 - 각 하위 매체마다 표시 */}
                      <td
                        style={{
                          verticalAlign: "middle",
                        }}
                      >
                        {isEditing ? (
                          <select
                            value={editingMediaData.productId || ""}
                            onChange={(e) =>
                              setEditingMediaData({
                                ...editingMediaData,
                                productId: e.target.value ? parseInt(e.target.value) : null,
                              })
                            }
                            style={{
                              width: "150px",
                              padding: "0.375rem 0.5rem",
                              border: "1px solid #e2e8f0",
                              borderRadius: "4px",
                              fontSize: "0.8125rem",
                              background: "white",
                              cursor: "pointer",
                              outline: "none",
                            }}
                            onFocus={(e) =>
                              (e.target.style.borderColor = "#3b82f6")
                            }
                            onBlur={(e) =>
                              (e.target.style.borderColor = "#e2e8f0")
                            }
                          >
                            <option value="">선택안함</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            style={{
                              color: "#1e293b",
                              fontSize: "0.875rem",
                            }}
                          >
                            {mediaItem.productName || "-"}
                          </span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingMediaData.adMediaDetailName}
                            onChange={(e) =>
                              setEditingMediaData({
                                ...editingMediaData,
                                adMediaDetailName: e.target.value,
                              })
                            }
                            placeholder="태그"
                            style={{
                              width: "120px",
                              border: "1px solid #e2e8f0",
                              borderRadius: "4px",
                              padding: "0.375rem 0.5rem",
                              fontSize: "0.8125rem",
                              background: "white",
                              color: "#1e293b",
                              outline: "none",
                              lineHeight: "1.5",
                              minHeight: "2rem",
                              boxSizing: "border-box",
                            }}
                            onFocus={(e) =>
                              (e.target.style.borderColor = "#3b82f6")
                            }
                            onBlur={(e) =>
                              (e.target.style.borderColor = "#e2e8f0")
                            }
                          />
                        ) : (
                          <span>{mediaItem.adMediaDetailName || "-"}</span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <select
                            value={editingMediaData.status}
                            onChange={(e) =>
                              setEditingMediaData({
                                ...editingMediaData,
                                status: parseInt(e.target.value, 10),
                              })
                            }
                            style={{
                              padding: "0.375rem 0.5rem",
                              border: "1px solid #e2e8f0",
                              borderRadius: "4px",
                              fontSize: "0.8125rem",
                              background: "white",
                              cursor: "pointer",
                              outline: "none",
                            }}
                          >
                            <option value="1">운영중</option>
                            <option value="0">중단</option>
                          </select>
                        ) : (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "0.25rem 0.75rem",
                              borderRadius: "12px",
                              fontSize: "0.75rem",
                              border:
                                mediaItem.status === 1
                                  ? "1.5px solid #d1fae5"
                                  : "1.5px solid #fecaca",
                              background:
                                mediaItem.status === 1 ? "#d1fae5" : "#fee2e2",
                              color:
                                mediaItem.status === 1 ? "#065f46" : "#991b1b",
                            }}
                          >
                            {mediaItem.status === 1 ? "운영중" : "중단"}
                          </span>
                        )}
                      </td>
                      <td>{mediaItem.modifiedDate || "-"}</td>
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
                              onClick={() => toggleMenu(mediaItem.id)}
                            >
                              ⋯
                            </button>
                            {openMenuId === mediaItem.id && (
                              <div className="dropdown-menu">
                                <button
                                  className="dropdown-item"
                                  onClick={() => {
                                    handleEdit(mediaItem);
                                  }}
                                >
                                  수정
                                </button>
                                <button
                                  className="dropdown-item"
                                  onClick={() => {
                                    handleDelete(mediaItem.id);
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

        {/* 매체 페이지네이션 */}
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
                fetchData(
                  1,
                  mediaCategoryFilter !== "all" ? mediaCategoryFilter : null
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
              «
            </button>
            <button
              className="pagination-btn"
              onClick={() =>
                fetchData(
                  pagination.page - 1,
                  mediaCategoryFilter !== "all" ? mediaCategoryFilter : null
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
                  mediaCategoryFilter !== "all" ? mediaCategoryFilter : null
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
                  mediaCategoryFilter !== "all" ? mediaCategoryFilter : null
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

export default MediaTab;
