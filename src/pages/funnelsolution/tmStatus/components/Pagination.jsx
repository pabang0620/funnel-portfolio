import React from "react";
import "./Pagination.css";

const Pagination = ({
  currentPage,
  totalPages,
  paginationPages,
  onPageChange
}) => {
  return (
    <div className="pagination-modern">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="pagination-btn pagination-btn-icon"
      >
        «
      </button>

      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-btn pagination-btn-icon"
      >
        ‹
      </button>

      {paginationPages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`pagination-btn pagination-btn-number ${
            page === currentPage ? 'pagination-btn-active' : ''
          }`}
        >
          {page}
        </button>
      ))}

      {Math.ceil(currentPage / 10) * 10 < totalPages && (
        <button
          onClick={() => onPageChange(Math.ceil(currentPage / 10) * 10 + 1)}
          className="pagination-btn pagination-btn-number"
        >
          ...
        </button>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-btn pagination-btn-icon"
      >
        ›
      </button>

      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="pagination-btn pagination-btn-icon"
      >
        »
      </button>
    </div>
  );
};

export default Pagination;
