import React from "react";
import Button from "../../../../../components/ui/Button";

function UpdateConfirmModal({ updateConfirmData, onConfirm, onCancel }) {
  if (!updateConfirmData) return null;

  const { productName, marketPlaceName, changes } = updateConfirmData;

  const hasChanges =
    changes &&
    (changes.fee ||
      changes.boxPrices.length > 0 ||
      changes.hiddenPrices.length > 0);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content update-confirm-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>가격 업데이트 확인</h3>
          <button className="modal-close-btn" onClick={onCancel}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="update-confirm-info">
            <p className="update-target">
              <strong>{productName}</strong> -{" "}
              <strong>{marketPlaceName}</strong>에 이미 등록된 가격이 있습니다.
            </p>
            <p className="update-question">
              다음 변경 사항을 적용하시겠습니까?
            </p>
          </div>

          {hasChanges ? (
            <div className="update-changes">
              {/* 수수료 변경 */}
              {changes.fee && (
                <div className="change-section">
                  <h5 className="change-section-title" title="지불하는 금액">수수료 변경</h5>
                  <div className="change-item">
                    <span className="change-label" title="지불하는 금액">수수료</span>
                    <span className="change-values">
                      <span className="old-value">{changes.fee.oldValue}%</span>
                      <span className="change-arrow">→</span>
                      <span className="new-value">{changes.fee.newValue}%</span>
                    </span>
                  </div>
                </div>
              )}

              {/* 박스별 가격 변경 */}
              {changes.boxPrices.length > 0 && (
                <div className="change-section">
                  <h5 className="change-section-title">박스별 가격 변경</h5>
                  {changes.boxPrices.map((change) => (
                    <div key={change.boxCount} className="change-item">
                      <span className="change-label">
                        {change.boxCount}박스
                      </span>
                      <div className="change-details">
                        <div className="change-row">
                          <span className="change-field">판매가:</span>
                          <span className="change-values">
                            <span className="old-value">
                              {change.oldPrice.toLocaleString()}원
                            </span>
                            <span className="change-arrow">→</span>
                            <span className="new-value">
                              {change.newPrice.toLocaleString()}원
                            </span>
                          </span>
                        </div>
                        <div className="change-row">
                          <span className="change-field">배송비:</span>
                          <span className="change-values">
                            <span className="old-value">
                              {change.oldShippingFee.toLocaleString()}원
                            </span>
                            <span className="change-arrow">→</span>
                            <span className="new-value">
                              {change.newShippingFee.toLocaleString()}원
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 히든별 가격 변경 */}
              {changes.hiddenPrices.length > 0 && (
                <div className="change-section">
                  <h5 className="change-section-title">히든별 가격 변경</h5>
                  {changes.hiddenPrices.map((change) => {
                    const [boxNum, hiddenName] = change.key.split("_");
                    return (
                      <div key={change.key} className="change-item">
                        <span className="change-label">
                          {boxNum}박스 - {hiddenName}
                        </span>
                        <div className="change-details">
                          <div className="change-row">
                            <span className="change-field">판매가:</span>
                            <span className="change-values">
                              <span className="old-value">
                                {change.oldPrice.toLocaleString()}원
                              </span>
                              <span className="change-arrow">→</span>
                              <span className="new-value">
                                {change.newPrice.toLocaleString()}원
                              </span>
                            </span>
                          </div>
                          <div className="change-row">
                            <span className="change-field">배송비:</span>
                            <span className="change-values">
                              <span className="old-value">
                                {change.oldShippingFee.toLocaleString()}원
                              </span>
                              <span className="change-arrow">→</span>
                              <span className="new-value">
                                {change.newShippingFee.toLocaleString()}원
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <p className="no-changes-message">변경된 내용이 없습니다.</p>
          )}
        </div>
        <div className="modal-footer">
          <Button variant="secondary" size="medium" onClick={onCancel}>
            취소
          </Button>
          <Button variant="primary" size="medium" onClick={onConfirm}>
            업데이트
          </Button>
        </div>
      </div>
    </div>
  );
}

export default UpdateConfirmModal;
