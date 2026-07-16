import React from 'react';
import '../CSData.css';

const ShippingPagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const { page, totalPages } = pagination;

  // 페이지 번호 배열 생성
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (page >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = page - 2; i <= page + 2; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="shipping-pagination">
      <button
        className="pagination-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        이전
      </button>

      {pageNumbers.map((num) => (
        <button
          key={num}
          className={`pagination-btn ${page === num ? 'active' : ''}`}
          onClick={() => onPageChange(num)}
        >
          {num}
        </button>
      ))}

      <button
        className="pagination-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        다음
      </button>

      <span className="pagination-info">
        {page} / {totalPages} 페이지
      </span>
    </div>
  );
};

export default ShippingPagination;
