import React from "react";
import Modal from "../../../components/ui/Modal";
import "./ChangesSummaryModal.css";

const ChangesSummaryModal = ({
  isOpen,
  onClose,
  onSave,
  manualData,
  originalData,
  userRole,
  userTeam,
}) => {
  // 날짜별로 변경사항을 그룹화
  const getChangesByDate = () => {
    const changesByDate = {};

    Object.entries(manualData).forEach(([date, fields]) => {
      Object.entries(fields).forEach(([field, newValue]) => {
        if (newValue !== undefined) {
          // 원본 데이터에서 해당 날짜의 원래 값 찾기
          const originalItem = originalData?.find((item) => item.date === date);
          const originalValue = originalItem?.[field] ?? null;

          if (newValue !== originalValue) {
            if (!changesByDate[date]) {
              changesByDate[date] = [];
            }

            changesByDate[date].push({
              field,
              originalValue,
              newValue,
              fieldName: getFieldDisplayName(field),
              unit: getFieldUnit(field),
            });
          }
        }
      });
    });

    return changesByDate;
  };

  // 필드명 한글 변환
  const getFieldDisplayName = (field) => {
    const fieldNames = {
      adCost: "광고비",
      revenue: "직접매출",
      impressions: "노출수",
      clicks: "클릭수",
      conversions: "구매건수",
    };
    return fieldNames[field] || field;
  };

  // 필드별 단위 반환
  const getFieldUnit = (field) => {
    const units = {
      adCost: "원",
      revenue: "원",
      impressions: "회",
      clicks: "회",
      conversions: "건",
    };
    return units[field] || "";
  };

  // 날짜 포맷
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const changesByDate = getChangesByDate();
  const totalChanges = Object.values(changesByDate).reduce(
    (total, changes) => total + changes.length,
    0
  );

  if (!isOpen) return null;

  return (
    <div className="changes-summary-modal">
      <Modal isOpen={isOpen} onClose={onClose} title="변경사항 확인">
        {totalChanges === 0 ? (
          <p className="modal-content">변경된 항목이 없습니다.</p>
        ) : (
          <>
            <div className="modifier-info">
              <p className="modifier-text">
                <strong>
                  {localStorage.getItem("userName") || "사용자"}({userTeam})
                </strong>
                님을 최종 수정자로 다음 항목이 변경됩니다.
              </p>
            </div>

            <div className="changes-container">
              {Object.entries(changesByDate)
                .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                .map(([date, changes]) => (
                <div key={date} className="date-group">
                  <div className="date-title">{formatDate(date)}</div>
                  {changes.map((change, index) => (
                    <div key={index} className="change-item">
                      <span className="field-name">{change.fieldName}:</span>
                      {change.originalValue !== null && (
                        <>
                          <span className="value-before">
                            {change.originalValue.toLocaleString()}{change.unit}
                          </span>
                          <span className="arrow">→</span>
                        </>
                      )}
                      <span className="value-after">
                        {change.newValue !== null
                          ? `${change.newValue.toLocaleString()}${change.unit}`
                          : "(빈값)"}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="modal-buttons">
          <button
            onClick={onSave}
            className="modal-btn modal-btn-primary"
            disabled={totalChanges === 0}
          >
            저장 ({totalChanges}건)
          </button>
          <button onClick={onClose} className="modal-btn modal-btn-secondary">
            취소
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ChangesSummaryModal;
