import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faEye, faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import "./QuoteTable.css";

function QuoteTable({
  quotes,
  isLoading,
  onEdit,
  onDelete,
  onStatusToggle,
  onPreview,
}) {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRefs = useRef({});

  // 드롭다운 토글
  const toggleDropdown = (quoteId, e) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === quoteId ? null : quoteId);
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId && !event.target.closest('.quote-action-dropdown')) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdownId]);

  // 날짜 포맷
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("ko-KR");
  };

  // 기간 포맷
  const formatDateRange = (startDate, endDate) => {
    if (!startDate && !endDate) return "-";
    const start = startDate ? formatDate(startDate) : "";
    const end = endDate ? formatDate(endDate) : "";
    if (start && end) return `${start} ~ ${end}`;
    if (start) return `${start} ~`;
    return `~ ${end}`;
  };

  if (isLoading) {
    return <div className="quote-table-loading">명언 목록을 불러오는 중...</div>;
  }

  if (quotes.length === 0) {
    return (
      <div className="quote-table-empty">
        <p>No quotes registered.</p>
      </div>
    );
  }

  return (
    <div className="quote-table-wrapper">
      <table className="quote-table">
        <thead>
          <tr>
            <th style={{ width: "5%" }}>No</th>
            <th style={{ width: "31%" }}>명언</th>
            <th style={{ width: "15%" }}>작성자/저자</th>
            <th style={{ width: "18%" }}>지정 기간</th>
            <th style={{ width: "8%" }}>권한</th>
            <th style={{ width: "8%" }}>팀</th>
            <th style={{ width: "8%" }}>상태</th>
            <th style={{ width: "7%" }}>관리</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((quote, index) => (
            <tr
              key={quote.id}
              className={quote.status === 0 ? "inactive-row" : ""}
            >
              <td className="quote-no-cell">{quotes.length - index}</td>
              <td className="quote-content-cell">
                <span className="quote-content-text">{quote.content}</span>
              </td>
              <td>{quote.author}</td>
              <td>{formatDateRange(quote.startDate, quote.endDate)}</td>
              <td>{quote.targetRole || "전체"}</td>
              <td>{quote.targetTeam || "전체"}</td>
              <td>
                <button
                  className={`quote-status-badge ${quote.status}`}
                  onClick={() => onStatusToggle(quote)}
                >
                  {quote.status === 1 ? "활성" : "비활성"}
                </button>
              </td>
              <td className="quote-action-cell">
                <div className="quote-action-dropdown">
                  <button
                    className="quote-action-trigger"
                    onClick={(e) => toggleDropdown(quote.id, e)}
                    title="관리 메뉴"
                  >
                    <FontAwesomeIcon icon={faEllipsisH} />
                  </button>
                  {openDropdownId === quote.id && (
                    <div className="quote-action-menu">
                      <button
                        className="quote-action-menu-item preview-item"
                        onClick={() => {
                          onPreview(quote);
                          setOpenDropdownId(null);
                        }}
                      >
                        <FontAwesomeIcon icon={faEye} />
                        미리보기
                      </button>
                      <button
                        className="quote-action-menu-item edit-item"
                        onClick={() => {
                          onEdit(quote);
                          setOpenDropdownId(null);
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                        수정
                      </button>
                      <button
                        className="quote-action-menu-item delete-item"
                        onClick={() => {
                          onDelete(quote.id);
                          setOpenDropdownId(null);
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default QuoteTable;
