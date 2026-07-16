import React, { useState, useRef, useEffect } from "react";
import { getCurrentUser } from "../../../../utils/auth";

/**
 * 커스텀 셀렉트 컴포넌트 (추가/수정/삭제 기능 포함)
 * @param {Array} options - { id, name, fee? } 형태의 옵션 배열
 * @param {number|null} value - 선택된 값 (id)
 * @param {function} onChange - 값 변경 핸들러 (id) => void
 * @param {function} onAdd - 새 항목 추가 핸들러 (name, fee?) => void
 * @param {function} onEdit - 항목 수정 핸들러 (id, name, fee?) => void
 * @param {function} onDelete - 항목 삭제 핸들러 (id) => void
 * @param {string} placeholder - 플레이스홀더 텍스트
 * @param {string} addPlaceholder - 추가 입력 플레이스홀더
 * @param {string} addLabel - 추가 섹션 라벨
 * @param {boolean} showFee - 대행료 필드 표시 여부
 */
function CustomSelectWithAdd({
  options = [],
  value,
  onChange,
  onAdd,
  onEdit,
  onDelete,
  placeholder = "선택하세요",
  addPlaceholder = "새 항목 입력",
  addLabel = "새 항목 추가",
  showFee = false,
  requireSGrade = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemFee, setNewItemFee] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingFee, setEditingFee] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // 권한 체크
  const currentUser = getCurrentUser();
  const isSGrade = currentUser?.roleCode === 'S';
  // requireSGrade가 true면 S등급만, false면 모든 등급 허용
  const hasPermission = requireSGrade ? isSGrade : true;

  // 선택된 옵션 찾기
  const selectedOption = options.find((opt) => opt.id === value);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setNewItemName("");
        setNewItemFee("");
        setEditingId(null);
        setEditingName("");
        setEditingFee("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 옵션 선택
  const handleSelect = (optionId) => {
    if (editingId !== null) return; // 수정 모드일 때는 선택 안함
    onChange(optionId);
    setIsOpen(false);
  };

  // 새 항목 추가
  const handleAdd = () => {
    if (!newItemName.trim()) return;
    if (showFee) {
      onAdd(newItemName.trim(), newItemFee ? parseFloat(newItemFee) : null);
    } else {
      onAdd(newItemName.trim());
    }
    setNewItemName("");
    setNewItemFee("");
    // 입력 후 포커스 유지
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // 수정 모드 시작
  const handleStartEdit = (e, option) => {
    e.stopPropagation();
    setEditingId(option.id);
    setEditingName(option.name);
    setEditingFee(option.fee ?? "");
  };

  // 수정 저장
  const handleSaveEdit = (e) => {
    e.stopPropagation();
    if (!editingName.trim()) return;
    if (onEdit) {
      if (showFee) {
        onEdit(editingId, editingName.trim(), editingFee ? parseFloat(editingFee) : null);
      } else {
        onEdit(editingId, editingName.trim());
      }
    }
    setEditingId(null);
    setEditingName("");
    setEditingFee("");
  };

  // 수정 취소
  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
    setEditingName("");
    setEditingFee("");
  };

  // Enter 키로 추가
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  // Enter 키로 수정 저장
  const handleEditKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit(e);
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelEdit(e);
    }
  };

  return (
    <div className="nc-custom-select" ref={containerRef}>
      {/* 트리거 버튼 */}
      <button
        type="button"
        className={`nc-custom-select__trigger ${isOpen ? "nc-custom-select__trigger--open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`nc-custom-select__value ${!selectedOption ? "nc-custom-select__value--placeholder" : ""}`}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <span className={`nc-custom-select__arrow ${isOpen ? "nc-custom-select__arrow--open" : ""}`}>
          ▼
        </span>
      </button>

      {/* 드롭다운 */}
      {isOpen && (
        <div className="nc-custom-select__dropdown">
          {/* 옵션 목록 */}
          <div className="nc-custom-select__options">
            <button
              type="button"
              className={`nc-custom-select__option ${value === null ? "nc-custom-select__option--selected" : ""}`}
              onClick={() => handleSelect(null)}
            >
              <span className="nc-custom-select__option-text nc-custom-select__option-text--placeholder">
                선택안함
              </span>
            </button>
            {options.map((option) => (
              <div
                key={option.id}
                className={`nc-custom-select__option ${value === option.id ? "nc-custom-select__option--selected" : ""}`}
                onClick={() => handleSelect(option.id)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: editingId === option.id ? 'default' : 'pointer' }}
              >
                {editingId === option.id ? (
                  // 수정 모드
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%', padding: '0.25rem 0' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={handleEditKeyPress}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        style={{
                          flex: 1,
                          padding: '0.25rem 0.5rem',
                          border: '1px solid #3b82f6',
                          borderRadius: '4px',
                          fontSize: '0.8125rem',
                          outline: 'none',
                        }}
                      />
                      {showFee && (
                        <input
                          type="number"
                          value={editingFee}
                          onChange={(e) => setEditingFee(e.target.value)}
                          onKeyDown={handleEditKeyPress}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="%"
                          min="0"
                          max="100"
                          step="0.01"
                          style={{
                            width: '60px',
                            padding: '0.25rem 0.5rem',
                            border: '1px solid #3b82f6',
                            borderRadius: '4px',
                            fontSize: '0.8125rem',
                            outline: 'none',
                            textAlign: 'right',
                          }}
                        />
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        저장
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          background: '#e5e7eb',
                          color: '#374151',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  // 일반 모드
                  <>
                    <span className="nc-custom-select__option-text" style={{ flex: 1 }}>
                      {option.name}
                      {showFee && option.fee != null && (
                        <span style={{ color: '#6b7280', marginLeft: '8px', fontSize: '0.8125rem' }}>
                          ({option.fee}%)
                        </span>
                      )}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {value === option.id && <span className="nc-custom-select__check">✓</span>}
                      {onEdit && hasPermission && (
                        <button
                          type="button"
                          onClick={(e) => handleStartEdit(e, option)}
                          style={{
                            padding: '0.125rem 0.375rem',
                            fontSize: '0.6875rem',
                            background: '#f3f4f6',
                            color: '#6b7280',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginLeft: '0.25rem',
                          }}
                        >
                          수정
                        </button>
                      )}
                      {onDelete && hasPermission && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`"${option.name}"을(를) 삭제하시겠습니까?`)) {
                              onDelete(option.id);
                            }
                          }}
                          style={{
                            padding: '0.125rem 0.375rem',
                            fontSize: '0.6875rem',
                            background: '#fef2f2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* 추가 섹션 */}
          {onAdd && hasPermission && (
            <>
              <div className="nc-custom-select__divider" />
              <div className="nc-custom-select__add-section">
                <div className="nc-custom-select__add-label">{addLabel}</div>
                <div className="nc-custom-select__add-row" style={{ flexDirection: showFee ? 'column' : 'row', gap: showFee ? '0.5rem' : '0' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                    <input
                      ref={inputRef}
                      type="text"
                      className="nc-custom-select__add-input"
                      placeholder={addPlaceholder}
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      onKeyPress={handleKeyPress}
                      onClick={(e) => e.stopPropagation()}
                      style={{ flex: showFee ? 1 : 'auto' }}
                    />
                    {showFee && (
                      <input
                        type="number"
                        className="nc-custom-select__add-input"
                        placeholder="대행료 %"
                        title="돌려받는 금액"
                        value={newItemFee}
                        onChange={(e) => setNewItemFee(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onClick={(e) => e.stopPropagation()}
                        min="0"
                        max="100"
                        step="0.01"
                        style={{ width: '80px', textAlign: 'right' }}
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    className="nc-custom-select__add-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdd();
                    }}
                    style={{ width: showFee ? '100%' : 'auto' }}
                  >
                    추가
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default CustomSelectWithAdd;
