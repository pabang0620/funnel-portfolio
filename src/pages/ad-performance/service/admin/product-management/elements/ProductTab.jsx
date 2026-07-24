import React from "react";
import Button from "../../../../components/ui/Button";

function ProductTab({
  userRole,
  productManagement,
  productForm,
  setProductForm,
  editingProductId,
  editingProductData,
  setEditingProductData,
  openMenuId,
  hiddenNumberDropdownOpen,
  productHiddenForm,
  setProductHiddenForm,
  editingHiddenId,
  editingHiddenData,
  setEditingHiddenData,
  handleProductSubmit,
  handleProductEdit,
  handleProductSave,
  handleProductEditCancel,
  handleProductDelete,
  toggleMenu,
  toggleHiddenNumberDropdown,
  handleEditHidden,
  handleSaveHiddenEdit,
  handleCancelHiddenEdit,
  handleAddProductHidden,
  handleDeleteProductHidden,
  // 페이지네이션
  pagination,
  fetchProducts,
}) {
  return (
    <div className="tab-content">
      {/* 제품 등록 폼 */}
      <div className="registration-form">
        <div className="form-row">
          <div className="form-field" style={{ position: "relative" }}>
            <label htmlFor="product-name">제품명</label>
            <input
              id="product-name"
              type="text"
              className="form-input"
              placeholder="제품명을 입력하세요"
              value={productForm.name}
              onChange={(e) =>
                setProductForm({ ...productForm, name: e.target.value })
              }
            />
            <label
              style={{
                position: "absolute",
                bottom: "-18px",
                left: "0",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                fontSize: "0.75rem",
                color: "#6b7280",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={productForm.name.startsWith("대행_")}
                onChange={(e) => {
                  if (e.target.checked) {
                    if (!productForm.name.startsWith("대행_")) {
                      setProductForm({ ...productForm, name: "대행_" + productForm.name });
                    }
                  } else {
                    if (productForm.name.startsWith("대행_")) {
                      setProductForm({ ...productForm, name: productForm.name.replace(/^대행_/, "") });
                    }
                  }
                }}
                style={{
                  width: "12px",
                  height: "12px",
                  cursor: "pointer",
                }}
              />
              대행
            </label>
          </div>
          {/* S등급 전용: 원가 입력 필드 */}
          {userRole === "S" && (
            <div className="form-field">
              <label htmlFor="product-cost-price">원가 (선택)</label>
              <input
                id="product-cost-price"
                type="number"
                className="form-input"
                placeholder="원가를 입력하세요"
                value={productForm.costPrice}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    costPrice: e.target.value,
                  })
                }
                min="0"
                step="1"
              />
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="product-hidden-number">히든 번호(선택)</label>
            <input
              id="product-hidden-number"
              type="text"
              className="form-input"
              placeholder="예: 17"
              value={productForm.hiddenNumber || ""}
              onChange={(e) =>
                setProductForm({
                  ...productForm,
                  hiddenNumber: e.target.value,
                })
              }
            />
          </div>
          <div className="form-field">
            <label htmlFor="product-hidden-name">히든 이름(선택)</label>
            <input
              id="product-hidden-name"
              type="text"
              className="form-input"
              placeholder="예: 카카오"
              value={productForm.hiddenName || ""}
              onChange={(e) =>
                setProductForm({
                  ...productForm,
                  hiddenName: e.target.value,
                })
              }
            />
          </div>
        </div>
        <p
          style={{
            fontSize: "0.875rem",
            color: "#6b7280",
            marginTop: "0.5rem",
          }}
        >
          * 추가 히든 번호는 "히든 번호 관리"에서 등록 가능합니다.
        </p>

        <div className="form-actions">
          <Button
            variant="primary"
            size="large"
            onClick={handleProductSubmit}
          >
            제품 등록하기
          </Button>
        </div>
      </div>

      {/* 제품 리스트 */}
      <div className="list-section">
        <div className="list-table-wrapper">
          <table className="list-table">
            <thead>
              <tr>
                <th>제품명</th>
                {userRole === "S" && <th>원가</th>}
                {userRole === "S" && <th>원가 등록일</th>}
                <th>히든 번호</th>
                <th>등록일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {productManagement.length === 0 ? (
                <tr>
                  <td
                    colSpan={userRole === "S" ? "6" : "4"}
                    className="no-data"
                  >
                    No products registered.
                  </td>
                </tr>
              ) : (
                productManagement.map((product) => {
                  const isEditing = editingProductId === product.id;
                  return (
                    <React.Fragment key={product.id}>
                      <tr>
                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingProductData.name}
                              onChange={(e) =>
                                setEditingProductData({
                                  ...editingProductData,
                                  name: e.target.value,
                                })
                              }
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
                            product.name
                          )}
                        </td>
                        {userRole === "S" && (
                          <td>
                            {isEditing ? (
                              <input
                                type="number"
                                value={editingProductData.costPrice}
                                onChange={(e) =>
                                  setEditingProductData({
                                    ...editingProductData,
                                    costPrice: e.target.value,
                                  })
                                }
                                placeholder="원가"
                                min="0"
                                step="1"
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
                            ) : product.costPrice ? (
                              `${product.costPrice.toLocaleString()}원`
                            ) : (
                              "-"
                            )}
                          </td>
                        )}
                        {userRole === "S" && (
                          <td>{product.costPriceDate || "-"}</td>
                        )}
                        <td style={{ position: "relative" }}>
                          <HiddenNumberCell
                            product={product}
                            isEditing={isEditing}
                            editingProductData={editingProductData}
                            hiddenNumberDropdownOpen={hiddenNumberDropdownOpen}
                            toggleHiddenNumberDropdown={toggleHiddenNumberDropdown}
                            productHiddenForm={productHiddenForm}
                            setProductHiddenForm={setProductHiddenForm}
                            editingHiddenId={editingHiddenId}
                            editingHiddenData={editingHiddenData}
                            setEditingHiddenData={setEditingHiddenData}
                            handleEditHidden={handleEditHidden}
                            handleSaveHiddenEdit={handleSaveHiddenEdit}
                            handleCancelHiddenEdit={handleCancelHiddenEdit}
                            handleAddProductHidden={handleAddProductHidden}
                            handleDeleteProductHidden={handleDeleteProductHidden}
                          />
                        </td>
                        <td>{product.registeredDate}</td>
                        <td>
                          {isEditing ? (
                            <div className="action-buttons">
                              <Button
                                variant="primary"
                                size="small"
                                onClick={handleProductSave}
                              >
                                저장
                              </Button>
                              <Button
                                variant="secondary"
                                size="small"
                                onClick={handleProductEditCancel}
                              >
                                취소
                              </Button>
                            </div>
                          ) : (
                            <div className="dropdown-menu-container">
                              <button
                                className="menu-trigger-btn"
                                onClick={() => toggleMenu(product.id)}
                              >
                                ⋯
                              </button>
                              {openMenuId === product.id && (
                                <div className="dropdown-menu">
                                  <button
                                    className="dropdown-item"
                                    onClick={() => {
                                      handleProductEdit(product);
                                      toggleMenu(null);
                                    }}
                                  >
                                    수정
                                  </button>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => {
                                      handleProductDelete(product.id);
                                      toggleMenu(null);
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
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {pagination && pagination.totalCount > 0 && (
          <div className="pagination-wrapper">
            <button
              className="pagination-btn"
              onClick={() => fetchProducts(1)}
              disabled={pagination.page === 1}
            >
              «
            </button>
            <button
              className="pagination-btn"
              onClick={() => fetchProducts(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              ‹
            </button>
            <span className="pagination-info">
              {pagination.page} / {pagination.totalPages} 페이지 (총 {pagination.totalCount}건)
            </span>
            <button
              className="pagination-btn"
              onClick={() => fetchProducts(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              ›
            </button>
            <button
              className="pagination-btn"
              onClick={() => fetchProducts(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
            >
              »
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// 히든 번호 셀 컴포넌트
function HiddenNumberCell({
  product,
  isEditing,
  editingProductData,
  hiddenNumberDropdownOpen,
  toggleHiddenNumberDropdown,
  productHiddenForm,
  setProductHiddenForm,
  editingHiddenId,
  editingHiddenData,
  setEditingHiddenData,
  handleEditHidden,
  handleSaveHiddenEdit,
  handleCancelHiddenEdit,
  handleAddProductHidden,
  handleDeleteProductHidden,
}) {
  const displayHiddenNumbers = isEditing
    ? editingProductData.hiddenNumbers
    : product.hiddenNumbers;

  return (
    <>
      <div
        data-hidden-trigger
        onClick={() =>
          isEditing && toggleHiddenNumberDropdown(product.id)
        }
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
        {displayHiddenNumbers && displayHiddenNumbers.length > 0 ? (
          displayHiddenNumbers.map((hn) => (
            <span
              key={hn.id}
              style={{
                padding: "0.25rem 0.5rem",
                backgroundColor: "#dbeafe",
                color: "#1e40af",
                borderRadius: "4px",
                fontSize: "0.75rem",
                fontWeight: "600",
              }}
            >
              {hn.number} ({hn.name})
            </span>
          ))
        ) : (
          <span
            style={{
              color: "#9ca3af",
              fontSize: "0.875rem",
            }}
          >
            {isEditing ? "클릭하여 관리" : "-"}
          </span>
        )}
      </div>

      {/* 노션 스타일 드롭다운 */}
      {isEditing && hiddenNumberDropdownOpen === product.id && (
        <div className="notion-style-dropdown">
          <div className="notion-dropdown-content">
            {/* 기존 히든 번호 리스트 */}
            {editingProductData.hiddenNumbers &&
              editingProductData.hiddenNumbers.length > 0 && (
                <>
                  <div className="notion-list-section">
                    {editingProductData.hiddenNumbers.map((hn) => {
                      const isEditingHidden = editingHiddenId === hn.id;
                      return (
                        <div key={hn.id} className="notion-list-item">
                          {isEditingHidden ? (
                            <>
                              <div className="notion-edit-inputs">
                                <input
                                  type="text"
                                  value={editingHiddenData.number}
                                  onChange={(e) =>
                                    setEditingHiddenData({
                                      ...editingHiddenData,
                                      number: e.target.value,
                                    })
                                  }
                                  className="notion-input-small"
                                  placeholder="번호"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <input
                                  type="text"
                                  value={editingHiddenData.name}
                                  onChange={(e) =>
                                    setEditingHiddenData({
                                      ...editingHiddenData,
                                      name: e.target.value,
                                    })
                                  }
                                  className="notion-input-small"
                                  placeholder="이름"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              <div className="notion-item-actions">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveHiddenEdit(product.id);
                                  }}
                                  className="notion-save-btn"
                                >
                                  저장
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelHiddenEdit();
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
                                <span className="notion-item-number">
                                  {hn.number}
                                </span>
                                <span className="notion-item-name">
                                  {hn.name}
                                </span>
                              </div>
                              <div className="notion-item-actions">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditHidden(hn);
                                  }}
                                  className="notion-edit-btn"
                                >
                                  수정
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProductHidden(product.id, hn.id);
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
              <div className="notion-add-label">새 히든 번호 추가</div>
              <div className="notion-add-inputs">
                <input
                  type="text"
                  placeholder="히든 번호 (예: 17)"
                  value={productHiddenForm.number}
                  onChange={(e) =>
                    setProductHiddenForm({
                      ...productHiddenForm,
                      number: e.target.value,
                    })
                  }
                  className="notion-input"
                  onClick={(e) => e.stopPropagation()}
                />
                <input
                  type="text"
                  placeholder="이름 (예: 카카오)"
                  value={productHiddenForm.name}
                  onChange={(e) =>
                    setProductHiddenForm({
                      ...productHiddenForm,
                      name: e.target.value,
                    })
                  }
                  className="notion-input"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddProductHidden(product.id);
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

export default ProductTab;
