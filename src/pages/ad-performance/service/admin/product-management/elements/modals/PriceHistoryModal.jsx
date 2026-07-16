import React from "react";
import Button from "../../../../../components/ui/Button";

function PriceHistoryModal({
  selectedPriceHistory,
  editingHistoryId,
  editingHistoryData,
  setEditingHistoryData,
  expandedHistoryIds,
  getProductHiddens,
  toggleHistoryAccordion,
  startEditHistory,
  cancelEditHistory,
  saveHistoryEdit,
  deleteHistory,
  updateEditingHistoryBoxPrice,
  updateEditingHistoryHiddenPrice,
  addHistoryBoxRow,
  removeHistoryBoxRow,
  onClose,
  // 판매처 변경 관련
  channelOptions,
  isEditingMarketPlace,
  newMarketPlaceId,
  setNewMarketPlaceId,
  startEditMarketPlace,
  cancelEditMarketPlace,
  saveMarketPlaceChange,
}) {
  if (!selectedPriceHistory) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content price-history-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">가격 변경 히스토리</h3>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {/* 기본 정보 */}
          <div className="history-modal-header-info">
            <span className="history-product">
              {selectedPriceHistory.product}
            </span>
            {isEditingMarketPlace ? (
              <div className="marketplace-edit-row">
                <select
                  className="marketplace-select"
                  value={newMarketPlaceId || ""}
                  onChange={(e) => setNewMarketPlaceId(parseInt(e.target.value, 10))}
                >
                  <option value="">판매처 선택</option>
                  {(channelOptions || []).map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.name}
                    </option>
                  ))}
                </select>
                <button className="save-btn small" onClick={() => saveMarketPlaceChange(channelOptions)}>
                  저장
                </button>
                <button className="cancel-btn small" onClick={cancelEditMarketPlace}>
                  취소
                </button>
              </div>
            ) : (
              <div className="marketplace-display-row">
                <span className="history-channel">
                  {selectedPriceHistory.channel}
                </span>
                <button className="edit-marketplace-btn" onClick={startEditMarketPlace}>
                  판매처 변경
                </button>
              </div>
            )}
          </div>

          {/* 히스토리 목록 - 아코디언 형태 */}
          <div className="history-list">
            {(selectedPriceHistory.priceHistory || []).length === 0 ? (
              <p className="detail-empty-message">
                등록된 가격 히스토리가 없습니다.
              </p>
            ) : (
              (selectedPriceHistory.priceHistory || []).map(
                (history, index) => (
                  <HistoryAccordionItem
                    key={history.id}
                    history={history}
                    isLatest={index === 0}
                    selectedPriceHistory={selectedPriceHistory}
                    editingHistoryId={editingHistoryId}
                    editingHistoryData={editingHistoryData}
                    setEditingHistoryData={setEditingHistoryData}
                    expandedHistoryIds={expandedHistoryIds}
                    getProductHiddens={getProductHiddens}
                    toggleHistoryAccordion={toggleHistoryAccordion}
                    startEditHistory={startEditHistory}
                    cancelEditHistory={cancelEditHistory}
                    saveHistoryEdit={saveHistoryEdit}
                    deleteHistory={deleteHistory}
                    updateEditingHistoryBoxPrice={updateEditingHistoryBoxPrice}
                    updateEditingHistoryHiddenPrice={
                      updateEditingHistoryHiddenPrice
                    }
                    addHistoryBoxRow={addHistoryBoxRow}
                    removeHistoryBoxRow={removeHistoryBoxRow}
                  />
                )
              )
            )}
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="secondary" size="medium" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}

// 히스토리 아코디언 아이템
function HistoryAccordionItem({
  history,
  isLatest,
  selectedPriceHistory,
  editingHistoryId,
  editingHistoryData,
  setEditingHistoryData,
  expandedHistoryIds,
  getProductHiddens,
  toggleHistoryAccordion,
  startEditHistory,
  cancelEditHistory,
  saveHistoryEdit,
  deleteHistory,
  updateEditingHistoryBoxPrice,
  updateEditingHistoryHiddenPrice,
  addHistoryBoxRow,
  removeHistoryBoxRow,
}) {
  // 타입 안전한 비교 (숫자/문자열 혼용 대응)
  const isEditing = editingHistoryId != null && String(editingHistoryId) === String(history.id);
  const isExpanded = expandedHistoryIds.some(id => String(id) === String(history.id)) || isEditing;

  return (
    <div
      className={`history-accordion ${isLatest ? "current" : ""} ${
        isEditing ? "editing" : ""
      } ${isExpanded ? "expanded" : ""}`}
    >
      {/* 아코디언 헤더 */}
      <div
        className="history-accordion-header"
        onClick={() => !isEditing && toggleHistoryAccordion(history.id)}
      >
        <div className="history-accordion-left">
          <span className="history-accordion-toggle">▶</span>
          {isEditing && editingHistoryData ? (
            <div className="history-period">
              <input
                type="date"
                value={editingHistoryData.startDate || ""}
                onChange={(e) =>
                  setEditingHistoryData({
                    ...editingHistoryData,
                    startDate: e.target.value,
                  })
                }
                className="history-date-input"
                onClick={(e) => e.stopPropagation()}
              />
              <span className="date-separator">~</span>
              <input
                type="date"
                value={editingHistoryData.endDate || ""}
                onChange={(e) =>
                  setEditingHistoryData({
                    ...editingHistoryData,
                    endDate: e.target.value,
                  })
                }
                className="history-date-input"
                placeholder="현재"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="history-fee-input">
                <span className="history-fee-label" title="지불하는 금액">수수료</span>
                <input
                  type="number"
                  value={editingHistoryData.fee || ""}
                  onChange={(e) =>
                    setEditingHistoryData({
                      ...editingHistoryData,
                      fee: e.target.value,
                    })
                  }
                  className="history-fee-field"
                  placeholder="%"
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="history-fee-unit">%</span>
              </div>
            </div>
          ) : (
            <>
              <span className="history-accordion-period">
                {(history.startDate || history.date || "").split(" ")[0]} ~ {history.endDate ? history.endDate.split(" ")[0] : "-"}
              </span>
              <div className="history-accordion-badges">
                <span className="history-fee-badge">
                  수수료 {history.fee || 0}%
                </span>
                {isLatest && <span className="current-badge">최신</span>}
              </div>
            </>
          )}
        </div>
        <div className="history-actions" onClick={(e) => e.stopPropagation()}>
          {isEditing ? (
            <>
              <button className="save-btn" onClick={saveHistoryEdit}>
                저장
              </button>
              <button className="cancel-btn" onClick={cancelEditHistory}>
                취소
              </button>
            </>
          ) : (
            <>
              <button
                className="edit-btn"
                onClick={() => startEditHistory(history)}
              >
                수정
              </button>
              <button
                className="delete-btn"
                onClick={() => deleteHistory(history.id)}
              >
                삭제
              </button>
            </>
          )}
        </div>
      </div>

      {/* 아코디언 바디 */}
      {isExpanded && (
        <div className="history-accordion-body">
          {/* 박스별 가격 테이블 */}
          <h5>박스별 가격</h5>
          {isEditing && editingHistoryData ? (
            <div className="history-edit-prices">
              {(editingHistoryData.boxPrices || []).map((bp, index) => (
                <div key={index} className="history-price-row no-fee">
                  <span className="box-label">{bp.boxCount}박스</span>
                  <input
                    type="text"
                    placeholder="판매가"
                    value={bp.price || ""}
                    onChange={(e) =>
                      updateEditingHistoryBoxPrice(
                        bp.boxCount,
                        "price",
                        e.target.value
                      )
                    }
                  />
                  <input
                    type="text"
                    placeholder="배송비"
                    value={bp.shippingFee || ""}
                    onChange={(e) =>
                      updateEditingHistoryBoxPrice(
                        bp.boxCount,
                        "shippingFee",
                        e.target.value
                      )
                    }
                  />
                  {editingHistoryData.boxPrices.length > 1 && (
                    <button
                      type="button"
                      className="remove-box-btn"
                      onClick={() => removeHistoryBoxRow(bp.boxCount)}
                      title="박스 삭제"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <div className="history-box-controls">
                <button
                  type="button"
                  className="add-box-btn"
                  onClick={addHistoryBoxRow}
                >
                  + 박스 추가
                </button>
              </div>
            </div>
          ) : (
            <table className="history-price-table">
              <thead>
                <tr>
                  <th>박스</th>
                  <th>판매가</th>
                  <th>배송비</th>
                </tr>
              </thead>
              <tbody>
                {history.boxPrices.map((bp) => (
                  <tr key={bp.boxCount}>
                    <td className="box-col">{bp.boxCount}박스</td>
                    <td className="price-col">{bp.price.toLocaleString()}원</td>
                    <td>{bp.shippingFee.toLocaleString()}원</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 히든별 가격 */}
          {(Object.keys(history.hiddenPrices || {}).length > 0 ||
            (isEditing && editingHistoryData)) && (
            <HistoryHiddenPrices
              history={history}
              isEditing={isEditing}
              editingHistoryData={editingHistoryData}
              selectedPriceHistory={selectedPriceHistory}
              getProductHiddens={getProductHiddens}
              updateEditingHistoryHiddenPrice={updateEditingHistoryHiddenPrice}
            />
          )}
        </div>
      )}
    </div>
  );
}

// 히스토리 히든 가격 섹션
function HistoryHiddenPrices({
  history,
  isEditing,
  editingHistoryData,
  selectedPriceHistory,
  getProductHiddens,
  updateEditingHistoryHiddenPrice,
}) {
  // productId 또는 productName으로 조회
  const productHiddensFromMaster = getProductHiddens(
    selectedPriceHistory.productId || selectedPriceHistory.product || history.productName
  );

  // 히스토리 데이터에서 히든 이름 추출 (제품 마스터에서 못 찾을 경우 대비)
  const hiddenPricesSource = isEditing ? editingHistoryData?.hiddenPrices : history.hiddenPrices;
  const hiddenNamesFromHistory = [...new Set(
    Object.keys(hiddenPricesSource || {}).map(key => {
      const parts = key.split('_');
      return parts.length > 1 ? parts[1] : null;
    }).filter(Boolean)
  )];

  // 제품 마스터 우선, 없으면 히스토리에서 추출
  const productHiddens = productHiddensFromMaster.length > 0
    ? productHiddensFromMaster
    : hiddenNamesFromHistory.map((name, idx) => ({ id: `history_${idx}`, name }));

  // 수정 모드에서 사용할 박스 번호 목록
  // boxPrices에서 추출 + hiddenPrices에서도 추출 (박스별 가격 없이 히든만 있는 경우 대비)
  const boxNumbersFromBoxPrices = isEditing && editingHistoryData?.boxPrices
    ? editingHistoryData.boxPrices.map(bp => bp.boxCount)
    : [];
  const boxNumbersFromHiddenPrices = Object.keys(hiddenPricesSource || {})
    .map(key => parseInt(key.split('_')[0], 10))
    .filter(num => !isNaN(num));
  const boxNumbers = [...new Set([...boxNumbersFromBoxPrices, ...boxNumbersFromHiddenPrices])]
    .sort((a, b) => a - b);

  return (
    <>
      <h5 className="history-hidden-section-title">히든별 가격</h5>
      {isEditing ? (
        <div className="history-edit-hidden">
          {productHiddens.length > 0 ? (
            productHiddens.map((hidden) => (
              <div key={hidden.id} className="hidden-edit-section">
                <span className="hidden-name">{hidden.name}</span>
                {boxNumbers.map((boxNum) => {
                  const key = `${boxNum}_${hidden.name}`;
                  const hp = editingHistoryData.hiddenPrices?.[key] || {
                    price: "",
                    shippingFee: "",
                  };
                  return (
                    <div
                      key={key}
                      className="history-price-row small no-fee"
                    >
                      <span className="box-label">{boxNum}박스</span>
                      <input
                        type="text"
                        placeholder="판매가"
                        value={hp.price || ""}
                        onChange={(e) =>
                          updateEditingHistoryHiddenPrice(
                            key,
                            "price",
                            e.target.value
                          )
                        }
                      />
                      <input
                        type="text"
                        placeholder="배송비"
                        value={hp.shippingFee || ""}
                        onChange={(e) =>
                          updateEditingHistoryHiddenPrice(
                            key,
                            "shippingFee",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            <p className="no-hidden-msg">등록된 히든이 없습니다.</p>
          )}
        </div>
      ) : (
        <table className="history-price-table">
          <thead>
            <tr>
              <th>히든</th>
              <th>판매가</th>
              <th>배송비</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(history.hiddenPrices || {}).map(([key, hp]) => {
              const [boxNum, hiddenIdentifier] = key.split("_");
              // 히든 번호인 경우 이름으로 변환
              let displayName = hiddenIdentifier;
              if (/^\d+$/.test(hiddenIdentifier)) {
                const hiddenInfo = productHiddensFromMaster.find(h => String(h.number) === hiddenIdentifier);
                if (hiddenInfo) {
                  displayName = hiddenInfo.name;
                }
              }
              return (
                <tr key={key}>
                  <td className="box-col">
                    {boxNum}박스 - {displayName}
                  </td>
                  <td className="price-col">{hp.price.toLocaleString()}원</td>
                  <td>{hp.shippingFee.toLocaleString()}원</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}

export default PriceHistoryModal;
