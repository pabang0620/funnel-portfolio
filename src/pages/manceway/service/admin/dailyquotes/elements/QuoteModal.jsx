import { useState, useEffect } from "react";
import Button from "../../../../components/ui/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import "./QuoteModal.css";

function QuoteModal({ isOpen, quote, onClose, onSave, showAlert }) {
  const [formData, setFormData] = useState({
    content: "",
    author: "",
    startDate: "",
    endDate: "",
    targetRole: "",
    targetTeam: "",
  });

  useEffect(() => {
    if (quote) {
      setFormData({
        content: quote.content || "",
        author: quote.author || "",
        startDate: quote.startDate ? quote.startDate.split("T")[0] : "",
        endDate: quote.endDate ? quote.endDate.split("T")[0] : "",
        targetRole: quote.targetRole || "",
        targetTeam: quote.targetTeam || "",
      });
    } else {
      setFormData({
        content: "",
        author: "",
        startDate: "",
        endDate: "",
        targetRole: "",
        targetTeam: "",
      });
    }
  }, [quote, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.content.trim()) {
      showAlert("입력 오류", "명언 내용을 입력해주세요.", "warning");
      return;
    }
    if (!formData.author.trim()) {
      showAlert("입력 오류", "작성자/저자를 입력해주세요.", "warning");
      return;
    }

    const data = {
      content: formData.content.trim(),
      author: formData.author.trim(),
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
      targetRole: formData.targetRole || null,
      targetTeam: formData.targetTeam || null,
    };

    await onSave(data, quote?.id);
  };

  if (!isOpen) return null;

  return (
    <div className="quote-modal-overlay" onClick={onClose}>
      <div className="quote-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="quote-modal-header">
          <h3>{quote ? "명언 수정" : "명언 추가"}</h3>
          <button className="quote-modal-close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="quote-modal-body">
          <div className="quote-modal-form-group">
            <label>명언 내용 *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="명언을 입력하세요... (줄바꿈 가능)"
              rows={4}
            />
          </div>
          <div className="quote-modal-form-group">
            <label>작성자/저자 *</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              placeholder="작성자/저자 이름"
            />
          </div>
          <div className="quote-modal-form-row">
            <div className="quote-modal-form-group">
              <label>시작일 <span className="optional">(선택)</span></label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="quote-modal-form-group">
              <label>종료일 <span className="optional">(선택)</span></label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="quote-modal-form-row">
            <div className="quote-modal-form-group">
              <label>대상 권한 <span className="optional">(선택)</span></label>
              <select
                name="targetRole"
                value={formData.targetRole}
                onChange={handleInputChange}
              >
                <option value="">전체</option>
                <option value="S">S (임원)</option>
                <option value="A">A (팀장)</option>
                <option value="B">B (중간관리자)</option>
                <option value="C">C (실무자)</option>
              </select>
            </div>
            <div className="quote-modal-form-group">
              <label>대상 팀 <span className="optional">(선택)</span></label>
              <select
                name="targetTeam"
                value={formData.targetTeam}
                onChange={handleInputChange}
              >
                <option value="">전체</option>
                <option value="온라인팀">온라인팀</option>
                <option value="퍼포먼스팀">퍼포먼스팀</option>
              </select>
            </div>
          </div>
        </div>
        <div className="quote-modal-footer">
          <Button onClick={onClose} className="cancel-btn">
            취소
          </Button>
          <Button onClick={handleSubmit} className="save-btn">
            <FontAwesomeIcon icon={faSave} /> 저장
          </Button>
        </div>
      </div>
    </div>
  );
}

export default QuoteModal;
