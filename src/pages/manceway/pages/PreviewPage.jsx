import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./PreviewPage.css";

const PreviewPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageData, setPageData] = useState({});

  useEffect(() => {
    const pageId = searchParams.get('pageId');
    const grade = searchParams.get('grade');
    const permissions = searchParams.get('permissions')?.split(',') || [];
    const mainCategory = searchParams.get('mainCategory');
    const subPage = searchParams.get('subPage');

    setPageData({
      pageId,
      grade,
      permissions,
      mainCategory,
      subPage
    });
  }, [searchParams]);

  const renderSalesPagePreview = () => {
    const { permissions } = pageData;
    
    // 월 매출 실적 추이 차트 권한들
    const hasRevenueTotal = permissions.includes("exec_sales_chart_revenue_total");
    const hasRevenueChannel = permissions.includes("exec_sales_chart_revenue_channel");
    const hasRevenueProduct = permissions.includes("exec_sales_chart_revenue_product");
    const hasAnyRevenue = hasRevenueTotal || hasRevenueChannel || hasRevenueProduct;
    
    // 월 예상 공헌이익 차트 권한들
    const hasProfitTotal = permissions.includes("exec_sales_chart_profit_total");
    const hasProfitChannel = permissions.includes("exec_sales_chart_profit_channel");
    const hasProfitProduct = permissions.includes("exec_sales_chart_profit_product");
    const hasAnyProfit = hasProfitTotal || hasProfitChannel || hasProfitProduct;
    
    // 테이블 컬럼 권한들
    const hasProduct = permissions.includes("exec_sales_col_product");
    const hasTotal = permissions.includes("exec_sales_col_total");
    const hasChannelSales = permissions.includes("exec_sales_col_channel_sales");
    const hasChannelRatio = permissions.includes("exec_sales_col_channel_ratio");
    const hasMargin = permissions.includes("exec_sales_col_margin");
    const hasProfit = permissions.includes("exec_sales_col_profit");
    const hasProfitRate = permissions.includes("exec_sales_col_profit_rate");
    const hasAdCost = permissions.includes("exec_sales_col_ad_cost");
    const hasRoas = permissions.includes("exec_sales_col_roas");
    const hasCommission = permissions.includes("exec_sales_col_commission");

    return (
      <div className="page-preview sales-preview">
        <h2>경영 리포트 - 판매 실적 현황</h2>
        
        {/* 차트 영역 */}
        <div className="charts-section">
          <div className={`chart-container ${!hasAnyRevenue ? 'hidden' : ''}`}>
            <h3>📊 월 매출 실적 추이</h3>
            <div className="chart-placeholder">
              {hasRevenueTotal && <div className="chart-item">전체 매출</div>}
              {hasRevenueChannel && <div className="chart-item">판매처별 매출</div>}
              {hasRevenueProduct && <div className="chart-item">제품별 매출</div>}
            </div>
          </div>
          
          <div className={`chart-container ${!hasAnyProfit ? 'hidden' : ''}`}>
            <h3>💰 월 예상 공헌이익</h3>
            <div className="chart-placeholder">
              {hasProfitTotal && <div className="chart-item">전체 이익</div>}
              {hasProfitChannel && <div className="chart-item">판매처별 이익</div>}
              {hasProfitProduct && <div className="chart-item">제품별 이익</div>}
            </div>
          </div>
        </div>

        {/* 테이블 영역 */}
        <div className="table-section">
          <h3>📋 판매 실적 상세 테이블</h3>
          <table className="table-preview">
            <thead>
              <tr>
                {hasProduct && <th>제품</th>}
                {hasTotal && <th>합계</th>}
                {hasChannelSales && <th>판매처별 매출</th>}
                {hasChannelRatio && <th>판매처 비율</th>}
                {hasMargin && <th>마진</th>}
                {hasProfit && <th>공헌이익</th>}
                {hasProfitRate && <th>공헌이익률</th>}
                {hasAdCost && <th>광고비</th>}
                {hasRoas && <th>ROAS</th>}
                {hasCommission && <th>수수료</th>}
              </tr>
            </thead>
            <tbody>
              <tr>
                {hasProduct && <td>제품 A</td>}
                {hasTotal && <td>1,000,000</td>}
                {hasChannelSales && <td>800,000</td>}
                {hasChannelRatio && <td>80%</td>}
                {hasMargin && <td>200,000</td>}
                {hasProfit && <td>150,000</td>}
                {hasProfitRate && <td>15%</td>}
                {hasAdCost && <td>50,000</td>}
                {hasRoas && <td>300%</td>}
                {hasCommission && <td>30,000</td>}
              </tr>
              <tr>
                {hasProduct && <td>제품 B</td>}
                {hasTotal && <td>750,000</td>}
                {hasChannelSales && <td>600,000</td>}
                {hasChannelRatio && <td>80%</td>}
                {hasMargin && <td>150,000</td>}
                {hasProfit && <td>100,000</td>}
                {hasProfitRate && <td>13.3%</td>}
                {hasAdCost && <td>30,000</td>}
                {hasRoas && <td>250%</td>}
                {hasCommission && <td>25,000</td>}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderProductDetailPreview = () => {
    return (
      <div className="page-preview product-detail-preview">
        <h2>경영 리포트 - 제품 상세</h2>
        <div className="chart-container">
          <h3>📊 월별 매출 차트</h3>
          <div className="chart-placeholder">제품별 월별 매출 추이</div>
        </div>
      </div>
    );
  };

  const renderMarketingReportPreview = () => {
    return (
      <div className="page-preview marketing-preview">
        <h2>마케팅 리포트</h2>
        <div className="charts-section">
          <div className="chart-container">
            <h3>📊 매출 및 광고비 소진 현황</h3>
            <div className="chart-placeholder">매출과 광고비 차트</div>
          </div>
          <div className="chart-container">
            <h3>📈 광고 세부 지표</h3>
            <div className="chart-placeholder">광고 성과 지표</div>
          </div>
        </div>
      </div>
    );
  };

  const renderAccountManagementPreview = () => {
    return (
      <div className="page-preview account-preview">
        <h2>계정 관리</h2>
        <table className="table-preview">
          <thead>
            <tr>
              <th>아이디</th>
              <th>이름</th>
              <th>팀</th>
              <th>등급</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>admin</td>
              <td>관리자</td>
              <td>관리팀</td>
              <td><span className="grade-badge grade-s">S</span></td>
              <td>활성</td>
              <td>✏️ 수정</td>
            </tr>
            <tr>
              <td>user01</td>
              <td>사용자1</td>
              <td>영업팀</td>
              <td><span className="grade-badge grade-a">A</span></td>
              <td>활성</td>
              <td>✏️ 수정</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderPreview = () => {
    switch (pageData.pageId) {
      case "executive-report-sales":
        return renderSalesPagePreview();
      case "executive-report-product-detail":
        return renderProductDetailPreview();
      case "marketing-report":
        return renderMarketingReportPreview();
      case "account-management":
        return renderAccountManagementPreview();
      default:
        return (
          <div className="page-preview default-preview">
            <div className="preview-placeholder">
              페이지 미리보기를 준비 중입니다...
            </div>
          </div>
        );
    }
  };

  const getPageTitle = () => {
    const categoryTitles = {
      "executive-report": "경영 리포트",
      "marketing-report": "마케팅 리포트",
      "account-management": "계정 관리",
      "data-entry-status": "데이터 입력 현황"
    };
    return categoryTitles[pageData.mainCategory] || "페이지 미리보기";
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGradeChange = (newGrade) => {
    const params = new URLSearchParams(searchParams);
    params.set('grade', newGrade);
    setSearchParams(params);
  };

  const handlePageChange = (newPageId) => {
    const params = new URLSearchParams(searchParams);
    params.set('pageId', newPageId);
    setSearchParams(params);
  };

  const pageOptions = [
    { id: 'executive-report-sales', title: '경영 리포트 - 판매 실적' },
    { id: 'executive-report-product-detail', title: '경영 리포트 - 제품 상세' },
    { id: 'marketing-report', title: '마케팅 리포트' },
    { id: 'account-management', title: '계정 관리' }
  ];

  if (!pageData.pageId) {
    return (
      <div className="preview-loading">
        <p>미리보기를 로드하는 중...</p>
      </div>
    );
  }

  return (
    <div className="preview-page">
      <div className="preview-header">
        <div className="preview-header-left">
          <h1>{getPageTitle()} - {pageData.grade}등급</h1>
        </div>
        <div className="preview-header-controls">
          <div className="control-group">
            <label>페이지:</label>
            <select 
              value={pageData.pageId || ''} 
              onChange={(e) => handlePageChange(e.target.value)}
              className="preview-select"
            >
              {pageOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.title}
                </option>
              ))}
            </select>
          </div>
          <div className="control-group">
            <label>등급:</label>
            <select 
              value={pageData.grade || 'S'} 
              onChange={(e) => handleGradeChange(e.target.value)}
              className="preview-select grade-select"
            >
              <option value="S">S등급</option>
              <option value="A">A등급</option>
              <option value="B">B등급</option>
              <option value="C">C등급</option>
            </select>
          </div>
        </div>
      </div>
      
      <button className="refresh-button-fixed" onClick={handleRefresh}>
        ↻
      </button>
      
      <div className="preview-content">
        {renderPreview()}
      </div>
    </div>
  );
};

export default PreviewPage;