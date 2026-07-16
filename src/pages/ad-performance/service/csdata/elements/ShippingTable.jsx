import React from 'react';
import '../CSData.css';

const ShippingTable = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <p>출고 데이터가 없습니다.</p>
      </div>
    );
  }

  // 날짜 포맷 함수
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 금액 포맷 함수
  const formatCurrency = (amount) => {
    if (!amount) return '0';
    return amount.toLocaleString();
  };

  return (
    <div className="shipping-table-container">
      <table className="shipping-table">
        <thead>
          <tr>
            <th>주문번호</th>
            <th>주문일시</th>
            <th>상품명</th>
            <th>수령인</th>
            <th>연락처</th>
            <th>결제금액</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.orderNumber || '-'}</td>
              <td>{formatDateTime(item.orderDateTime)}</td>
              <td className="product-name">{item.productName}</td>
              <td>{item.recipientName || '-'}</td>
              <td>{item.recipientPhone1 || '-'}</td>
              <td className="amount">{formatCurrency(item.paymentAmount)} 원</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ShippingTable;
