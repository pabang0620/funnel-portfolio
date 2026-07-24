import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import Breadcrumb from "../../components/Breadcrumb";
import { getSalesOrders, deleteSalesOrder, bulkDeleteSalesOrders, getSalesBatches, deleteSalesBatch } from "./api";
import { useAuth } from "../../contexts/AuthContext";
import "./SalesOrders.css";

function SalesOrders() {
  const { userRole } = useAuth();
  const isSGrade = userRole === 'S';

  // 필터 상태
  const [filters, setFilters] = useState({
    orderNumber: "",
    productName: "",
    startDate: "",
    endDate: "",
  });

  // 데이터 상태
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  // 체크박스 상태
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // 정렬 방향 상태
  const [sortOrder, setSortOrder] = useState('desc');

  // 검색 실행 여부 추적
  const [hasSearched, setHasSearched] = useState(false);

  // 배치 관리 모달 상태
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batches, setBatches] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [deletingBatch, setDeletingBatch] = useState(null);
  const [batchFilter, setBatchFilter] = useState({ startDate: '', endDate: '' });
  const [batchSearched, setBatchSearched] = useState(false);

  // 데이터 로드
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSalesOrders({
        page: currentPage,
        limit: pageSize,
        ...filters,
        sortOrder,
      });

      setSalesOrders(response.data || []);

      // pagination 객체에서 값 추출
      if (response.pagination) {
        setTotalCount(response.pagination.total || 0);
        setTotalPages(response.pagination.totalPages || 1);
      } else {
        setTotalCount(0);
        setTotalPages(1);
      }

      setSelectedIds([]);
      setSelectAll(false);
    } catch (err) {
      console.error("데이터 로드 실패:", err);
      setError(err.message || "데이터를 불러오는데 실패했습니다.");
      setSalesOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // 검색 실행 후 페이지 변경 시에만 재조회
  useEffect(() => {
    if (hasSearched) {
      loadData();
    }
  }, [currentPage]);

  // 정렬 변경 시 재조회 (검색된 상태일 때만)
  useEffect(() => {
    if (hasSearched) {
      loadData();
    }
  }, [sortOrder]);

  // 필터 입력 핸들러
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  // 검색 버튼 클릭
  const handleSearch = () => {
    // 날짜 필수 검증
    if (!filters.startDate || !filters.endDate) {
      alert("업로드 시작일과 종료일을 선택해주세요.");
      return;
    }

    setHasSearched(true);
    setCurrentPage(1);
    loadData();
  };

  // 초기화 버튼 클릭
  const handleReset = () => {
    setFilters({
      orderNumber: "",
      productName: "",
      startDate: "",
      endDate: "",
    });
    setSortOrder('desc');
    setHasSearched(false);
    setSalesOrders([]);
    setCurrentPage(1);
    setTotalPages(1);
    setTotalCount(0);
    setSelectedIds([]);
    setSelectAll(false);
  };

  // 전체 선택 토글
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(salesOrders.map((order) => order.id));
    }
    setSelectAll(!selectAll);
  };

  // 개별 선택 토글
  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
      setSelectAll(false);
    } else {
      const newSelectedIds = [...selectedIds, id];
      setSelectedIds(newSelectedIds);
      if (newSelectedIds.length === salesOrders.length) {
        setSelectAll(true);
      }
    }
  };

  // 단일 삭제
  const handleDeleteOne = async (id, orderNumber) => {
    if (!window.confirm(`주문번호 "${orderNumber}"를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await deleteSalesOrder(id);
      if (response.success) {
        alert("삭제되었습니다.");
        loadData();
      } else {
        alert(`삭제 실패: ${response.message}`);
      }
    } catch (error) {
      console.error("삭제 실패:", error);
      alert(`삭제 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  // 다중 삭제
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert("삭제할 항목을 선택해주세요.");
      return;
    }

    if (!window.confirm(`선택된 ${selectedIds.length}개 항목을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await bulkDeleteSalesOrders(selectedIds);
      if (response.success) {
        alert(`${response.deletedCount}건 삭제되었습니다.`);
        loadData();
      } else {
        alert(`삭제 실패: ${response.message}`);
      }
    } catch (error) {
      console.error("다중 삭제 실패:", error);
      alert(`삭제 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  // 배치 관리 모달 열기
  const handleOpenBatchModal = () => {
    setBatches([]);
    setBatchSearched(false);
    setBatchFilter({ startDate: '', endDate: '' });
    setShowBatchModal(true);
  };

  // 배치 검색
  const handleSearchBatches = async () => {
    if (!batchFilter.startDate || !batchFilter.endDate) {
      alert('시작일과 종료일을 선택해주세요.');
      return;
    }
    setBatchLoading(true);
    setBatchSearched(true);
    try {
      const response = await getSalesBatches(batchFilter);
      if (response.success) {
        setBatches(response.data);
      }
    } catch (error) {
      alert('배치 목록 조회 중 오류가 발생했습니다.');
    } finally {
      setBatchLoading(false);
    }
  };

  // 배치 삭제
  const handleDeleteBatch = async (createdAt, totalCount) => {
    if (!window.confirm(`업로드 시각 "${formatDateTime(createdAt)}" 의 데이터 ${totalCount}건을 삭제하시겠습니까?`)) return;
    setDeletingBatch(createdAt);
    try {
      const response = await deleteSalesBatch(createdAt);
      if (response.success) {
        setBatches(prev => prev.filter(b => b.createdAt !== createdAt));
        if (hasSearched) loadData();
      } else {
        alert(`삭제 실패: ${response.message}`);
      }
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setDeletingBatch(null);
    }
  };

  // 금액 포맷 (천 단위 콤마)
  const formatCurrency = (value) => {
    if (!value && value !== 0) return "0";
    return parseInt(value).toLocaleString();
  };

  // 날짜 포맷 (YYYY-MM-DD HH:mm:ss → YYYY-MM-DD HH:mm)
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "-";
    return dateTimeStr.substring(0, 16).replace("T", " ");
  };

  return (
    <Layout>
      <div className="sales-orders-container">
        <div className="main-content">
          {/* Breadcrumb 네비게이션 */}
          <Breadcrumb />

          {/* 페이지 제목 */}
          <h1 className="page-title">판매 주문 관리</h1>

          {/* 필터 섹션 */}
          <div className="filter-section">
            <div className="filter-row">
              <div className="filter-item">
                <label>주문번호</label>
                <input
                  type="text"
                  value={filters.orderNumber}
                  onChange={(e) => handleFilterChange("orderNumber", e.target.value)}
                  placeholder="주문번호 검색"
                  className="filter-input"
                />
              </div>
              <div className="filter-item">
                <label>제품명</label>
                <input
                  type="text"
                  value={filters.productName}
                  onChange={(e) => handleFilterChange("productName", e.target.value)}
                  placeholder="제품명 검색"
                  className="filter-input"
                />
              </div>
              <div className="filter-item">
                <label>업로드 시작일</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange("startDate", e.target.value)}
                  className="filter-input"
                />
              </div>
              <div className="filter-item">
                <label>업로드 종료일</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange("endDate", e.target.value)}
                  className="filter-input"
                />
              </div>
            </div>
            <div className="filter-buttons">
              <button onClick={handleSearch} className="btn btn-primary">
                검색
              </button>
              <button onClick={handleReset} className="btn btn-secondary">
                초기화
              </button>
              <button
                onClick={() => {
                  const next = sortOrder === 'desc' ? 'asc' : 'desc';
                  setSortOrder(next);
                  if (hasSearched) {
                    setCurrentPage(1);
                  }
                }}
                className="btn btn-secondary"
                title={sortOrder === 'desc' ? '최신순 정렬 중 (클릭 시 오래된순)' : '오래된순 정렬 중 (클릭 시 최신순)'}
              >
                업로드 시각 {sortOrder === 'desc' ? '▼' : '▲'}
              </button>
            </div>
          </div>

          {/* 액션 버튼 영역 */}
          {isSGrade && (
            <div className="action-bar">
              <div className="selected-count">
                {selectedIds.length > 0 && `${selectedIds.length}개 선택됨`}
              </div>
              <button
                onClick={handleBulkDelete}
                className="btn btn-danger"
                disabled={selectedIds.length === 0}
              >
                선택 항목 삭제
              </button>
              <button
                onClick={handleOpenBatchModal}
                className="btn btn-secondary"
              >
                업로드 배치 관리
              </button>
            </div>
          )}

          {/* 데이터 테이블 */}
          <div className="table-container">
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>데이터를 불러오는 중...</p>
              </div>
            ) : error ? (
              <div className="error-message">
                <p>오류: {error}</p>
              </div>
            ) : salesOrders.length === 0 ? (
              <div className="empty-message">
                <p>No data.</p>
              </div>
            ) : (
              <table className="sales-table">
                <thead>
                  <tr>
                    {isSGrade && (
                      <th className="th-checkbox">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                        />
                      </th>
                    )}
                    <th>ID</th>
                    <th>주문일시</th>
                    <th>주문번호</th>
                    <th>제품명</th>
                    <th>파일판매처명</th>
                    <th>업로드 시각</th>
                    {isSGrade && <th>삭제</th>}
                  </tr>
                </thead>
                <tbody>
                  {salesOrders.map((order) => (
                    <tr key={order.id} className={selectedIds.includes(order.id) ? "selected" : ""}>
                      {isSGrade && (
                        <td className="td-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(order.id)}
                            onChange={() => handleSelectOne(order.id)}
                          />
                        </td>
                      )}
                      <td>{order.id}</td>
                      <td>{formatDateTime(order.orderDateTime)}</td>
                      <td>{order.orderNumber || "-"}</td>
                      <td>{order.productName || "-"}</td>
                      <td>{order.fileMarketPlaceName || "-"}</td>
                      <td>{formatDateTime(order.createdAt)}</td>
                      {isSGrade && (
                        <td>
                          <button
                            onClick={() => handleDeleteOne(order.id, order.orderNumber)}
                            className="btn btn-delete-small"
                          >
                            삭제
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* 페이지네이션 */}
          {!loading && salesOrders.length > 0 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                이전
              </button>
              <span className="pagination-info">
                {currentPage} / {totalPages} (총 {totalCount}건)
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                다음
              </button>
            </div>
          )}
        </div>
      </div>
      {showBatchModal && (
        <div
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}
          onClick={() => setShowBatchModal(false)}
        >
          <div
            style={{background:'#fff',borderRadius:'8px',padding:'24px',width:'750px',maxWidth:'95vw',maxHeight:'80vh',display:'flex',flexDirection:'column',gap:'16px'}}
            onClick={e => e.stopPropagation()}
          >
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h3 style={{margin:0}}>업로드 배치 관리</h3>
              <button onClick={() => setShowBatchModal(false)} style={{background:'none',border:'none',fontSize:'20px',cursor:'pointer'}}>×</button>
            </div>

            <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
              <input
                type="date"
                value={batchFilter.startDate}
                onChange={e => setBatchFilter(prev => ({ ...prev, startDate: e.target.value }))}
                className="filter-input"
                style={{width:'140px'}}
              />
              <span style={{color:'#666'}}>~</span>
              <input
                type="date"
                value={batchFilter.endDate}
                onChange={e => setBatchFilter(prev => ({ ...prev, endDate: e.target.value }))}
                className="filter-input"
                style={{width:'140px'}}
              />
              <button onClick={handleSearchBatches} className="btn btn-primary" disabled={batchLoading}>
                {batchLoading ? '조회 중...' : '검색'}
              </button>
            </div>

            {batchLoading ? (
              <p style={{textAlign:'center',color:'#666'}}>불러오는 중...</p>
            ) : !batchSearched ? (
              <p style={{textAlign:'center',color:'#666'}}>날짜를 선택하고 검색하세요.</p>
            ) : batches.length === 0 ? (
              <p style={{textAlign:'center',color:'#666'}}>No upload batches for this period.</p>
            ) : (
              <div style={{overflowY:'auto',flex:1}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px'}}>
                  <thead>
                    <tr style={{background:'#f5f5f5'}}>
                      <th style={{padding:'10px 8px',border:'1px solid #ddd',textAlign:'left'}}>업로드 시각</th>
                      <th style={{padding:'10px 8px',border:'1px solid #ddd',textAlign:'right'}}>총 건수</th>
                      <th style={{padding:'10px 8px',border:'1px solid #ddd',textAlign:'left'}}>쇼핑몰 구성</th>
                      <th style={{padding:'10px 8px',border:'1px solid #ddd',textAlign:'center'}}>삭제</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((batch) => (
                      <tr key={batch.createdAt}>
                        <td style={{padding:'8px',border:'1px solid #ddd'}}>{formatDateTime(batch.createdAt)}</td>
                        <td style={{padding:'8px',border:'1px solid #ddd',textAlign:'right'}}>{batch.totalCount.toLocaleString()}건</td>
                        <td style={{padding:'8px',border:'1px solid #ddd',fontSize:'12px',color:'#555'}}>
                          {Object.entries(batch.mallBreakdown).map(([mall, cnt]) => `${mall}: ${cnt}`).join(' / ')}
                        </td>
                        <td style={{padding:'8px',border:'1px solid #ddd',textAlign:'center'}}>
                          <button
                            onClick={() => handleDeleteBatch(batch.createdAt, batch.totalCount)}
                            className="btn btn-delete-small"
                            disabled={deletingBatch === batch.createdAt}
                          >
                            {deletingBatch === batch.createdAt ? '삭제 중...' : '삭제'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{display:'flex',justifyContent:'flex-end'}}>
              <button onClick={() => setShowBatchModal(false)} className="btn btn-secondary">닫기</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default SalesOrders;
