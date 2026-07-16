import React, { useState } from "react";
import "./PagePreview.css";
import Button from "./Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faChevronDown,
  faChevronUp,
  faEye,
} from "@fortawesome/free-solid-svg-icons";

const PagePreview = ({
  pageId,
  selectedPermissions = [],
  onGradeChange,
  selectedGrade = "S",
  pageCategories,
  selectedMainCategory,
  selectedSubPage,
  onMainCategoryChange,
  onSubPageChange,
  userRole,
  onSave,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  // 팝업 창으로 미리보기 열기
  const openPreviewPopup = () => {
    const params = new URLSearchParams({
      pageId: pageId,
      grade: selectedGrade,
      permissions: selectedPermissions.join(","),
      mainCategory: selectedMainCategory,
      subPage: selectedSubPage,
    });

    const popupUrl = `/preview?${params.toString()}`;
    window.open(
      popupUrl,
      "preview",
      "width=1200,height=800,scrollbars=yes,resizable=yes"
    );
  };
  const renderSalesPagePreview = () => {
    // 월 매출 실적 추이 차트 권한들
    const hasRevenueTotal = selectedPermissions.includes(
      "exec_sales_chart_revenue_total"
    );
    const hasRevenueChannel = selectedPermissions.includes(
      "exec_sales_chart_revenue_channel"
    );
    const hasRevenueProduct = selectedPermissions.includes(
      "exec_sales_chart_revenue_product"
    );
    const hasAnyRevenue =
      hasRevenueTotal || hasRevenueChannel || hasRevenueProduct;

    // 월 예상 공헌이익 차트 권한들
    const hasProfitTotal = selectedPermissions.includes(
      "exec_sales_chart_profit_total"
    );
    const hasProfitChannel = selectedPermissions.includes(
      "exec_sales_chart_profit_channel"
    );
    const hasProfitProduct = selectedPermissions.includes(
      "exec_sales_chart_profit_product"
    );
    const hasAnyProfit = hasProfitTotal || hasProfitChannel || hasProfitProduct;
    const hasProduct = selectedPermissions.includes("exec_sales_col_product");
    const hasTotal = selectedPermissions.includes("exec_sales_col_total");
    const hasChannelSales = selectedPermissions.includes(
      "exec_sales_col_channel_sales"
    );
    const hasChannelRatio = selectedPermissions.includes(
      "exec_sales_col_channel_ratio"
    );
    const hasMargin = selectedPermissions.includes("exec_sales_col_margin");
    const hasProfit = selectedPermissions.includes("exec_sales_col_profit");
    const hasProfitRate = selectedPermissions.includes(
      "exec_sales_col_profit_rate"
    );
    const hasAdCost = selectedPermissions.includes("exec_sales_col_ad_cost");
    const hasRoas = selectedPermissions.includes("exec_sales_col_roas");
    const hasCommission = selectedPermissions.includes(
      "exec_sales_col_commission"
    );

    return (
      <div className="page-preview sales-preview">
        <div className="preview-content-layout">
          {/* 왼쪽 메인 컨텐츠 */}
          <div className="preview-main-content">
            {/* 상단 차트 영역 */}
            {hasAnyRevenue || hasAnyProfit ? (
              <div className="chart-area visible">
                {hasAnyRevenue && (
                  <div className="chart-box">
                    <div className="chart-title">월 매출 실적</div>
                    <div className="revenue-metrics">
                      <div className="metric-row">
                        <div className="metric-box expected-revenue">
                          <div className="metric-label">예상매출</div>
                          <div className="metric-value">1,200만원</div>
                        </div>
                      </div>
                      <div className="metric-row">
                        <div className="metric-box average-revenue">
                          <div className="metric-label">평균매출</div>
                          <div className="metric-value">950만원</div>
                        </div>
                        <div className="metric-box monthly-comparison">
                          <div className="metric-label">전월대비 매출</div>
                          <div className="metric-value">+15%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {hasAnyProfit && (
                  <div className="chart-box">
                    <div className="chart-title">월 예상 공헌이익</div>
                    <div className="revenue-metrics">
                      <div className="metric-row">
                        <div className="metric-box expected-profit">
                          <div className="metric-label">예상 공헌이익</div>
                          <div className="metric-value">450만원</div>
                        </div>
                      </div>
                      <div className="metric-row">
                        <div className="metric-box average-profit">
                          <div className="metric-label">평균 공헌이익</div>
                          <div className="metric-value">380만원</div>
                        </div>
                        <div className="metric-box profit-comparison">
                          <div className="metric-label">전월대비 공헌이익</div>
                          <div className="metric-value">+18%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="chart-area hidden">
                <div className="hidden-message">
                  🚫 상단 차트 영역 (권한 없음)
                </div>
              </div>
            )}

            {/* 테이블 영역 */}
            <div className="table-area">
              <table className="table-preview">
                <thead>
                  <tr>
                    {hasProduct && (
                      <th className="table-col visible" rowSpan="2">
                        제품
                      </th>
                    )}
                    {hasTotal && (
                      <th className="table-col visible" rowSpan="2">
                        총매출
                      </th>
                    )}
                    {(hasChannelSales || hasChannelRatio) && (
                      <th
                        className="table-col visible channel-main-header"
                        colSpan="2"
                      >
                        카페24
                      </th>
                    )}
                    {(hasChannelSales || hasChannelRatio) && (
                      <th
                        className="table-col visible channel-main-header"
                        colSpan="2"
                      >
                        쿠팡
                      </th>
                    )}
                    {hasMargin && (
                      <th className="table-col visible sensitive" rowSpan="2">
                        판매마진
                      </th>
                    )}
                    {hasProfit && (
                      <th className="table-col visible sensitive" rowSpan="2">
                        공헌이익
                      </th>
                    )}
                    {hasProfitRate && (
                      <th className="table-col visible sensitive" rowSpan="2">
                        이익률
                      </th>
                    )}
                    {hasAdCost && (
                      <th className="table-col visible" rowSpan="2">
                        광고비
                      </th>
                    )}
                    {hasRoas && (
                      <th className="table-col visible" rowSpan="2">
                        ROAS
                      </th>
                    )}
                    {hasCommission && (
                      <th className="table-col visible sensitive" rowSpan="2">
                        매출수수료
                      </th>
                    )}
                  </tr>
                  {(hasChannelSales || hasChannelRatio) && (
                    <tr>
                      {hasChannelSales && (
                        <th className="table-col visible channel-sub">매출</th>
                      )}
                      {hasChannelRatio && (
                        <th className="table-col visible channel-sub">비율</th>
                      )}
                      {hasChannelSales && (
                        <th className="table-col visible channel-sub">매출</th>
                      )}
                      {hasChannelRatio && (
                        <th className="table-col visible channel-sub">비율</th>
                      )}
                    </tr>
                  )}
                </thead>
                <tbody>
                  <tr>
                    {hasProduct && <td className="table-cell">상품A</td>}
                    {hasTotal && <td className="table-cell">1,000,000원</td>}
                    {hasChannelSales && (
                      <td className="table-cell">500,000원</td>
                    )}
                    {hasChannelRatio && <td className="table-cell">50%</td>}
                    {hasChannelSales && (
                      <td className="table-cell">300,000원</td>
                    )}
                    {hasChannelRatio && <td className="table-cell">30%</td>}
                    {hasMargin && (
                      <td className="table-cell sensitive">200,000원</td>
                    )}
                    {hasProfit && (
                      <td className="table-cell sensitive">150,000원</td>
                    )}
                    {hasProfitRate && (
                      <td className="table-cell sensitive">15%</td>
                    )}
                    {hasAdCost && <td className="table-cell">100,000원</td>}
                    {hasRoas && <td className="table-cell">10.0</td>}
                    {hasCommission && (
                      <td className="table-cell sensitive">50,000원</td>
                    )}
                  </tr>
                  <tr>
                    {hasProduct && <td className="table-cell">상품B</td>}
                    {hasTotal && <td className="table-cell">800,000원</td>}
                    {hasChannelSales && (
                      <td className="table-cell">400,000원</td>
                    )}
                    {hasChannelRatio && <td className="table-cell">50%</td>}
                    {hasChannelSales && (
                      <td className="table-cell">200,000원</td>
                    )}
                    {hasChannelRatio && <td className="table-cell">25%</td>}
                    {hasMargin && (
                      <td className="table-cell sensitive">160,000원</td>
                    )}
                    {hasProfit && (
                      <td className="table-cell sensitive">120,000원</td>
                    )}
                    {hasProfitRate && (
                      <td className="table-cell sensitive">15%</td>
                    )}
                    {hasAdCost && <td className="table-cell">80,000원</td>}
                    {hasRoas && <td className="table-cell">10.0</td>}
                    {hasCommission && (
                      <td className="table-cell sensitive">40,000원</td>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 오른쪽 필터 패널 */}
          <div className="preview-filter-sidebar">
            <div className="filter-section-title">오른쪽 필터 패널</div>
            <div className="filter-panel">
              <div className="filter-box">📅 달력 필터</div>
              <div className="filter-box">🏪 판매처 선택</div>
              <div className="filter-box">📦 제품 선택</div>
              <div className="filter-box">💾 검색값 저장</div>
              <div className="filter-box">📊 엑셀 업로드</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProductDetailPreview = () => {
    return (
      <div className="page-preview product-detail-preview">
        <div className="preview-content-layout">
          <div className="preview-main-content">
            <div className="table-area">
              <div className="table-title">첫 번째 테이블</div>
              <div className="table-preview small">
                <div className="table-header">
                  <div className="table-col visible">제품</div>
                  <div className="table-col visible">총매출</div>
                  <div className="table-col visible">카페24</div>
                  <div className="table-col visible sensitive">판매마진</div>
                  <div className="table-col visible sensitive">공헌이익</div>
                </div>
              </div>
              <div className="table-title">두 번째 테이블 (매체별)</div>
              <div className="table-preview small">
                <div className="table-header">
                  <div className="table-col visible">구글</div>
                  <div className="table-col visible">메타</div>
                  <div className="table-col visible">틱톡</div>
                </div>
              </div>
            </div>
          </div>

          <div className="preview-filter-sidebar">
            <div className="filter-section-title">오른쪽 필터 패널</div>
            <div className="filter-panel">
              <div className="filter-box">📅 달력 필터</div>
              <div className="filter-box">🏪 판매처 선택</div>
              <div className="filter-box">📱 매체 선택</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMarketingReportPreview = () => {
    return (
      <div className="page-preview marketing-preview">
        <div className="preview-content-layout">
          <div className="preview-main-content">
            <div className="chart-area">
              <div className="chart-box">
                <div className="chart-title">매출 및 광고비 소진 현황</div>
                <div className="chart-placeholder">📈 차트</div>
              </div>
              <div className="chart-box">
                <div className="chart-title">광고 세무지표</div>
                <div className="chart-placeholder">📊 차트</div>
              </div>
            </div>
          </div>

          <div className="preview-filter-sidebar">
            <div className="filter-section-title">기능 영역</div>
            <div className="filter-panel">
              <div className="filter-box">📊 엑셀 업로드</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAccountManagementPreview = () => {
    return (
      <div className="page-preview account-preview">
        <div className="action-area">
          <div className="action-button">➕ 새 계정 생성</div>
          <div className="search-box">🔍 검색</div>
        </div>
        <div className="table-area">
          <div className="table-preview">
            <div className="table-header">
              <div className="table-col visible">아이디</div>
              <div className="table-col visible">이름</div>
              <div className="table-col visible">팀</div>
              <div className="table-col visible">등급</div>
              <div className="table-col visible">상태</div>
              <div className="table-col visible">관리</div>
            </div>
            <div className="table-row">
              <div className="table-cell">admin</div>
              <div className="table-cell">관리자</div>
              <div className="table-cell">관리팀</div>
              <div className="table-cell">S</div>
              <div className="table-cell">활성</div>
              <div className="table-cell">✏️ 수정</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPreview = () => {
    switch (pageId) {
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

  const renderGradeBadge = (grade) => {
    const badgeClasses = {
      S: "grade-badge grade-s",
      A: "grade-badge grade-a",
      B: "grade-badge grade-b",
      C: "grade-badge grade-c",
    };

    return (
      <span className={badgeClasses[grade] || "grade-badge"}>{grade}</span>
    );
  };

  return (
    <div className="page-preview-container">
      <div className="preview-header-controls">
        <div className="page-selector-inline">
          <label className="page-selector-label">페이지 선택:</label>
          <select
            className="page-select"
            value={selectedMainCategory}
            onChange={(e) =>
              onMainCategoryChange && onMainCategoryChange(e.target.value)
            }
          >
            {pageCategories &&
              Object.entries(pageCategories).map(
                ([categoryId, categoryData]) => (
                  <option key={categoryId} value={categoryId}>
                    {categoryData.title}
                  </option>
                )
              )}
          </select>

          {pageCategories && pageCategories[selectedMainCategory]?.subPages && (
            <select
              className="page-select sub-page-select"
              value={selectedSubPage}
              onChange={(e) =>
                onSubPageChange && onSubPageChange(e.target.value)
              }
            >
              {Object.entries(
                pageCategories[selectedMainCategory].subPages
              ).map(([subPageId, subPageData]) => (
                <option key={subPageId} value={subPageId}>
                  {subPageData.title}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="header-controls-right">
          <div className="preview-toggle-button">
            <Button variant="secondary" onClick={openPreviewPopup}>
              미리보기
            </Button>
          </div>

          <div className="grade-selector">
            <label className="grade-selector-label">미리보기 등급:</label>
            <div className="grade-select-wrapper">
              {renderGradeBadge(selectedGrade)}
              <select
                className="grade-select"
                value={selectedGrade}
                onChange={(e) => onGradeChange && onGradeChange(e.target.value)}
              >
                <option value="S">S등급</option>
                <option value="A">A등급</option>
                <option value="B">B등급</option>
                <option value="C">C등급</option>
              </select>
            </div>
          </div>

          {userRole === "S" && (
            <div className="preview-save-button">
              <Button variant="primary" onClick={onSave}>
                <FontAwesomeIcon icon={faSave} />
                저장
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PagePreview;
