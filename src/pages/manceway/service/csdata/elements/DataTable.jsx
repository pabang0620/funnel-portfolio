import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSearch } from '@fortawesome/free-solid-svg-icons';
import { getCSDataList, deleteCSData, deleteCSDataBulk, updateCSDataStatus } from '../api';

const DataTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({ startDate: '', endDate: '', search: '', orderStatus: '' });
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingStatus, setEditingStatus] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      const result = await getCSDataList(params);
      if (result.success) {
        setData(result.data.list);
        setPagination(prev => ({ ...prev, ...result.data.pagination }));
      }
    } catch (err) {
      console.error('조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.page, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchData();
  };

  const handleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map(item => item.id));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('삭제하시겠습니까?')) return;

    try {
      const result = await deleteCSData(id);
      if (result.success) {
        fetchData();
      } else {
        alert(result.msg);
      }
    } catch (err) {
      alert('삭제 실패');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }
    if (!window.confirm(`${selectedIds.length}건을 삭제하시겠습니까?`)) return;

    try {
      const result = await deleteCSDataBulk(selectedIds);
      if (result.success) {
        setSelectedIds([]);
        fetchData();
      } else {
        alert(result.msg);
      }
    } catch (err) {
      alert('삭제 실패');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    // Display UTC time directly without timezone conversion
    const date = new Date(dateStr);
    return date.toISOString().slice(0, 19).replace('T', ' ');
  };

  const formatAmount = (amount) => {
    if (!amount) return '-';
    return amount.toLocaleString() + '원';
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setEditingStatus(item.orderStatus || '결제대기');
  };

  const handleSaveClick = async (id) => {
    try {
      const result = await updateCSDataStatus(id, editingStatus);
      if (result.success) {
        alert(result.msg || '거래상태가 수정되었습니다.');
        setEditingId(null);
        setEditingStatus('');
        fetchData();
      } else {
        alert(result.msg || '수정 실패');
      }
    } catch (error) {
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  const handleCancelClick = () => {
    setEditingId(null);
    setEditingStatus('');
  };

  return (
    <>
      {/* Filter Section */}
      <div className="filter-section">
        <div className="date-filters">
          <input
            type="date"
            className="date-input"
            value={filters.startDate}
            onChange={e => handleFilterChange('startDate', e.target.value)}
          />
          <span>~</span>
          <input
            type="date"
            className="date-input"
            value={filters.endDate}
            onChange={e => handleFilterChange('endDate', e.target.value)}
          />
        </div>
        <div className="status-filter">
          <select
            className="status-select-filter"
            value={filters.orderStatus}
            onChange={e => handleFilterChange('orderStatus', e.target.value)}
          >
            <option value="">전체 거래상태</option>
            <option value="승인">승인</option>
            <option value="입금">입금</option>
            <option value="결제대기">결제대기</option>
          </select>
        </div>
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="제품명 검색"
            value={filters.search}
            onChange={e => handleFilterChange('search', e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSearch()}
          />
          <button className="search-btn" onClick={handleSearch}>
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
        <button
          className="bulk-delete-btn"
          onClick={handleBulkDelete}
          disabled={selectedIds.length === 0}
        >
          <FontAwesomeIcon icon={faTrash} />
          선택 삭제 ({selectedIds.length})
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedIds.length === data.length && data.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th>결제시간</th>
              <th>주문번호</th>
              <th>제품명</th>
              <th>금액</th>
              <th>수량</th>
              <th>거래상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="loading-row">
                <td colSpan="8">로딩 중...</td>
              </tr>
            ) : data.length === 0 ? (
              <tr className="empty-row">
                <td colSpan="8">데이터가 없습니다.</td>
              </tr>
            ) : (
              data.map(item => (
                <tr key={item.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => handleSelect(item.id)}
                    />
                  </td>
                  <td>{formatDate(item.orderDateTime)}</td>
                  <td>{item.orderNumber || '-'}</td>
                  <td>{item.productNameFromId || '-'}</td>
                  <td className="amount-cell">{formatAmount(item.paymentAmount)}</td>
                  <td>{item.quantity || '-'}</td>
                  <td>
                    {editingId === item.id ? (
                      <select
                        className="status-select"
                        value={editingStatus}
                        onChange={(e) => setEditingStatus(e.target.value)}
                      >
                        <option value="승인">승인</option>
                        <option value="입금">입금</option>
                        <option value="결제대기">결제대기</option>
                      </select>
                    ) : (
                      item.orderStatus || '-'
                    )}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button className="save-btn" onClick={() => handleSaveClick(item.id)}>
                          저장
                        </button>
                        <button className="cancel-btn" onClick={handleCancelClick}>
                          취소
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button className="edit-btn" onClick={() => handleEditClick(item)}>
                          수정
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(item.id)}
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          disabled={pagination.page === 1}
          onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
        >
          이전
        </button>
        <span>{pagination.page} / {pagination.totalPages || 1}</span>
        <button
          disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
          onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
        >
          다음
        </button>
      </div>
    </>
  );
};

export default DataTable;
