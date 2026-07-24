import { useState } from "react";
import Modal from "../../../components/ui/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

function HistoryDetailModal({ isOpen, onClose, historyLogs }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // 페이지네이션 계산
  const totalPages = Math.ceil(historyLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLogs = historyLogs.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`page-number ${i === currentPage ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <Modal isOpen={isOpen} maxWidth="900px">
      <div className="media-operations-container">
        <div className="history-detail-modal">
          <div className="modal-header">
            <h2>히스토리 상세 내역</h2>
            <button className="close-btn" onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className="modal-body">
            <div className="history-table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>번호</th>
                    <th>팀</th>
                    <th>제품</th>
                    <th>매체</th>
                    <th>상태</th>
                    <th>수정 일시</th>
                    <th>수정자</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLogs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="no-data">No history.</td>
                    </tr>
                  ) : (
                    currentLogs.map((log, index) => (
                      <tr key={index}>
                        <td>{startIndex + index + 1}</td>
                        <td>{log.team}</td>
                        <td>{log.product}</td>
                        <td>{log.media}</td>
                        <td>
                          <span className={`status-badge-small ${log.action === 'ON' ? 'status-on' : 'status-off'}`}>
                            {log.action}
                          </span>
                        </td>
                        <td>{log.datetime}</td>
                        <td>{log.editor}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  이전
                </button>
                {renderPageNumbers()}
                <button
                  className="page-btn"
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  다음
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default HistoryDetailModal;
