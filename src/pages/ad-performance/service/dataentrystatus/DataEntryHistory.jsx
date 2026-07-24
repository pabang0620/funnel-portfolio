import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import Breadcrumb from "../../components/Breadcrumb";
import CustomSelect from "../../components/ui/CustomSelect";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faTimes } from "@fortawesome/free-solid-svg-icons";
import { getEntryHistory } from "./api";
import "./DataEntryHistory.css";

/**
 * 데이터 입력 히스토리 페이지
 * marketingDailyDataLog 테이블의 입력/수정 이력을 표시
 */
function DataEntryHistory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 데이터 상태
  const [historyData, setHistoryData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
  });

  // 상세 모달 상태
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 필터 옵션 상태
  const [teams, setTeams] = useState([]);
  const [products, setProducts] = useState([]);
  const [parentMedia, setParentMedia] = useState([]);

  // 필터 선택 상태
  const [selectedTeamId, setSelectedTeamId] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState(0);

  // 데이터 로드
  const loadData = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getEntryHistory({
        page,
        limit: 20,
        teamId: selectedTeamId,
        productId: selectedProductId,
      });

      if (response.success) {
        setHistoryData(response.data.history);
        setPagination(response.data.pagination);

        // 필터 옵션은 첫 로드시에만 설정
        if (teams.length === 0) {
          setTeams(response.data.filters.teams);
          setProducts(response.data.filters.products);
          setParentMedia(response.data.filters.parentMedia);
        }
      }
    } catch (err) {
      console.error("히스토리 로드 실패:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드 및 필터 변경 시 재로드
  useEffect(() => {
    loadData(1);
  }, [selectedTeamId, selectedProductId]);

  // 팀 특수 옵션 생성 (부모 매체 기반 그룹핑)
  const teamSpecialOptions = {};
  teamSpecialOptions["전체"] = teams.map((t) => t.name);

  parentMedia.forEach((media) => {
    const childrenTeams = teams.filter((t) => t.parentId === media.id);
    if (childrenTeams.length > 0) {
      teamSpecialOptions[media.name] = childrenTeams.map((c) => c.name);
    }
  });

  // 팀 옵션 목록
  const teamOptions = [
    { id: 0, name: "전체" },
    ...parentMedia.map((m) => ({ id: `parent_${m.id}`, name: m.name })),
    ...teams.map((t) => ({ id: t.id, name: t.name })),
  ];

  // 제품 특수 옵션
  const productSpecialOptions = {
    전체: products.map((p) => p.name),
  };

  // 제품 옵션 목록
  const productOptions = [
    { id: 0, name: "전체" },
    ...products.map((p) => ({ id: p.id, name: p.name })),
  ];

  // 팀 선택 핸들러
  const handleTeamChange = (values) => {
    if (values.length === 0 || values.includes("전체")) {
      setSelectedTeamId(0);
    } else {
      // 단일 선택만 지원 - 첫 번째 선택값 사용
      const selectedName = values[0];
      const selectedTeam = teams.find((t) => t.name === selectedName);
      setSelectedTeamId(selectedTeam ? selectedTeam.id : 0);
    }
  };

  // 제품 선택 핸들러
  const handleProductChange = (values) => {
    if (values.length === 0 || values.includes("전체")) {
      setSelectedProductId(0);
    } else {
      const selectedName = values[0];
      const selectedProduct = products.find((p) => p.name === selectedName);
      setSelectedProductId(selectedProduct ? selectedProduct.id : 0);
    }
  };

  // 페이지 변경
  const handlePageChange = (page) => {
    loadData(page);
  };

  // 페이지 번호 렌더링
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`page-number ${i === pagination.page ? "active" : ""}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  // 날짜/시간 포맷 (DB에서 KST로 저장되므로 UTC 메서드 사용)
  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    const year = date.getUTCFullYear().toString().slice(2);
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  // 액션 타입 라벨
  const getActionLabel = (actionType) => {
    switch (actionType) {
      case "INSERT":
        return "신규 입력";
      case "UPDATE":
        return "수정";
      case "DELETE":
        return "삭제";
      default:
        return actionType;
    }
  };

  // 액션 타입 클래스
  const getActionClass = (actionType) => {
    switch (actionType) {
      case "INSERT":
        return "action-insert";
      case "UPDATE":
        return "action-update";
      case "DELETE":
        return "action-delete";
      default:
        return "";
    }
  };

  // 액션 타입에 따른 사용자 라벨 (작성자/수정자/삭제자)
  const getUserLabel = (actionType) => {
    switch (actionType) {
      case "INSERT":
        return "작성자";
      case "UPDATE":
        return "수정자";
      case "DELETE":
        return "삭제자";
      default:
        return "작성자";
    }
  };

  // 숫자 포맷 (천 단위 콤마)
  const formatNumber = (num) => {
    if (num === null || num === undefined) return "-";
    return num.toLocaleString("ko-KR");
  };

  // 금액 포맷 (원)
  const formatCurrency = (num) => {
    if (num === null || num === undefined) return "-";
    return `${num.toLocaleString("ko-KR")}원`;
  };

  // 히스토리 항목 클릭 핸들러
  const handleLogClick = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedLog(null);
  };

  // 현재 선택된 팀/제품 이름 찾기
  const selectedTeamName = selectedTeamId === 0
    ? "전체"
    : teams.find((t) => t.id === selectedTeamId)?.name || "전체";

  const selectedProductName = selectedProductId === 0
    ? "전체"
    : products.find((p) => p.id === selectedProductId)?.name || "전체";

  const rightPanel = (
    <div className="data-entry-history-container">
      <div className="filter-panel-container">
        {/* 필터 박스 */}
        <div className="filter-box">
          <div className="filter-field vertical">
            <label>팀 선택</label>
            <CustomSelect
              options={teamOptions}
              selectedValues={[selectedTeamName]}
              onSelectionChange={handleTeamChange}
              placeholder="팀 선택"
              multiple={false}
              specialOptions={teamSpecialOptions}
            />
          </div>

          <div className="filter-field vertical">
            <label>제품 선택</label>
            <CustomSelect
              options={productOptions}
              selectedValues={[selectedProductName]}
              onSelectionChange={handleProductChange}
              placeholder="제품 선택"
              multiple={false}
              specialOptions={productSpecialOptions}
            />
          </div>
        </div>

        {/* 뒤로가기 버튼 */}
        <div className="back-button-box">
          <button className="back-panel-btn" onClick={() => navigate("/data-entry-status")}>
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>데이터 입력 현황으로 돌아가기</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <Layout rightPanel={rightPanel}>
      <div className="data-entry-history-container">
        <Breadcrumb />

        {/* 히스토리 리스트 */}
        <div className="history-list-wrapper">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>데이터를 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p>오류: {error}</p>
            </div>
          ) : historyData.length === 0 ? (
            <div className="no-data">No history.</div>
          ) : (
            historyData.map((log) => (
              <div
                key={log.id}
                className="history-item clickable"
                onClick={() => handleLogClick(log)}
              >
                <div className="history-content">
                  <span className="history-team">{log.teamName}</span>
                  <span className="history-product">{log.productName}</span>
                  <span className={`history-status ${getActionClass(log.actionType)}`}>
                    {getActionLabel(log.actionType)}
                  </span>
                  <span className="history-datetime">{formatDateTime(log.createdAt)}</span>
                  <span className="history-editor">{getUserLabel(log.actionType)}: {log.userName}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 페이지네이션 */}
        {!loading && pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
            >
              이전
            </button>
            {renderPageNumbers()}
            <button
              className="page-btn"
              onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
              disabled={pagination.page === pagination.totalPages}
            >
              다음
            </button>
          </div>
        )}
      </div>

      {/* 상세 정보 모달 */}
      {showDetailModal && selectedLog && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>입력 상세 정보</h3>
              <button className="modal-close-btn" onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-body">
              {/* 기본 정보 */}
              <div className="detail-section">
                <h4>기본 정보</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">날짜</span>
                    <span className="detail-value">{selectedLog.date}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">팀</span>
                    <span className="detail-value">{selectedLog.teamName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">제품</span>
                    <span className="detail-value">{selectedLog.productName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">작업 유형</span>
                    <span className={`detail-value ${getActionClass(selectedLog.actionType)}`}>
                      {getActionLabel(selectedLog.actionType)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 입력 데이터 */}
              <div className="detail-section">
                <h4>입력 데이터</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">광고비</span>
                    <span className="detail-value">{formatCurrency(selectedLog.adCost)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">매출</span>
                    <span className="detail-value">{formatCurrency(selectedLog.revenue)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">노출수</span>
                    <span className="detail-value">{formatNumber(selectedLog.impressions)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">클릭수</span>
                    <span className="detail-value">{formatNumber(selectedLog.clicks)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">전환수</span>
                    <span className="detail-value">{formatNumber(selectedLog.conversions)}</span>
                  </div>
                  {selectedLog.adCost && selectedLog.revenue && selectedLog.adCost > 0 && (
                    <div className="detail-item">
                      <span className="detail-label">ROAS</span>
                      <span className="detail-value highlight">
                        {((selectedLog.revenue / selectedLog.adCost) * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 작성 정보 */}
              <div className="detail-section">
                <h4>작성 정보</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">{getUserLabel(selectedLog.actionType)}</span>
                    <span className="detail-value">{selectedLog.userName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">작성 일시</span>
                    <span className="detail-value">{formatDateTime(selectedLog.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default DataEntryHistory;
