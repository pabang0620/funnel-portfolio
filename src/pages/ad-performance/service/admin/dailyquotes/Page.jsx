import { useState, useEffect } from "react";
import Layout from "../../../components/Layout";
import Breadcrumb from "../../../components/Breadcrumb";
import Button from "../../../components/ui/Button";
import AlertModal from "../../../components/ui/AlertModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faQuoteLeft } from "@fortawesome/free-solid-svg-icons";
import DailyQuotePopup from "../../../components/ui/DailyQuotePopup";
import QuoteModal from "./elements/QuoteModal";
import QuoteTable from "./elements/QuoteTable";
import {
  getAllQuotes,
  createQuote,
  updateQuote,
  deleteQuote,
} from "../../../api/dailyQuote";
import "./DailyQuotes.css";

function DailyQuotes() {
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
  });
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    quoteId: null,
  });
  const [previewQuote, setPreviewQuote] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 명언 목록 불러오기
  const fetchQuotes = async () => {
    try {
      setIsLoading(true);
      const response = await getAllQuotes();
      if (response.success) {
        setQuotes(response.data);
      }
    } catch (error) {
      console.error("명언 목록 조회 실패:", error);
      showAlert("오류", "명언 목록을 불러오는데 실패했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  // AlertModal 헬퍼 함수
  const showAlert = (title, message, type = "warning") => {
    setAlertModal({ isOpen: true, title, message, type });
  };

  const closeAlert = () => {
    setAlertModal({ isOpen: false, title: "", message: "", type: "warning" });
  };

  // 모달 열기
  const openModal = (quote = null) => {
    setEditingQuote(quote);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingQuote(null);
  };

  // 저장 처리 (추가/수정)
  const handleSave = async (data, id) => {
    try {
      if (id) {
        await updateQuote(id, data);
      } else {
        await createQuote(data);
      }
      closeModal();
      fetchQuotes();
    } catch (error) {
      console.error("저장 실패:", error);
      showAlert("오류", "저장에 실패했습니다.", "error");
    }
  };

  // 삭제 확인
  const confirmDelete = (quoteId) => {
    setDeleteConfirm({ isOpen: true, quoteId });
  };

  // 삭제 처리
  const handleDelete = async () => {
    try {
      await deleteQuote(deleteConfirm.quoteId);
      showAlert("성공", "명언이 삭제되었습니다.", "success");
      setDeleteConfirm({ isOpen: false, quoteId: null });
      fetchQuotes();
    } catch (error) {
      console.error("삭제 실패:", error);
      showAlert("오류", "삭제에 실패했습니다.", "error");
    }
  };

  // 상태 토글
  const handleStatusToggle = async (quote) => {
    try {
      const newStatus = quote.status === 1 ? 0 : 1;
      await updateQuote(quote.id, { status: newStatus });
      fetchQuotes();
    } catch (error) {
      console.error("상태 변경 실패:", error);
      showAlert("오류", "상태 변경에 실패했습니다.", "error");
    }
  };

  // 검색 필터링
  const filteredQuotes = quotes.filter((quote) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return quote.content.toLowerCase().includes(searchLower);
  });

  return (
    <Layout>
      <div className="daily-quotes-container full-width-layout">
        <Breadcrumb />

        <div className="daily-quotes-content">
          <div className="daily-quotes-header">
            <div className="search-container">
              <input
                type="text"
                placeholder="명언 내용으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <Button onClick={() => openModal()} className="add-quote-btn">
              <FontAwesomeIcon icon={faPlus} /> 명언 추가
            </Button>
          </div>

          {/* 명언 테이블 */}
          <QuoteTable
            quotes={filteredQuotes}
            isLoading={isLoading}
            onEdit={openModal}
            onDelete={confirmDelete}
            onStatusToggle={handleStatusToggle}
            onPreview={setPreviewQuote}
          />
        </div>

        {/* 추가/수정 모달 */}
        <QuoteModal
          isOpen={isModalOpen}
          quote={editingQuote}
          onClose={closeModal}
          onSave={handleSave}
          showAlert={showAlert}
        />

        {/* 삭제 확인 모달 */}
        {deleteConfirm.isOpen && (
          <div
            className="modal-overlay"
            onClick={() => setDeleteConfirm({ isOpen: false, quoteId: null })}
          >
            <div
              className="modal-content delete-confirm-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>삭제 확인</h3>
              </div>
              <div className="modal-body">
                <p>이 명언을 삭제하시겠습니까?</p>
              </div>
              <div className="modal-footer">
                <Button
                  onClick={() =>
                    setDeleteConfirm({ isOpen: false, quoteId: null })
                  }
                  className="cancel-btn"
                >
                  취소
                </Button>
                <Button onClick={handleDelete} className="delete-confirm-btn">
                  삭제
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 미리보기 팝업 */}
        {previewQuote && (
          <DailyQuotePopup
            quote={previewQuote}
            onClose={() => setPreviewQuote(null)}
          />
        )}

        {/* 알림 모달 */}
        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={closeAlert}
          title={alertModal.title}
          message={alertModal.message}
          type={alertModal.type}
        />
      </div>
    </Layout>
  );
}

export default DailyQuotes;
