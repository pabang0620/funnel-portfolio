import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import "./Breadcrumb.css";

// 경로와 라벨 매핑
const pathMapping = {
  "/": "Home",
  "/executive-report": "경영 리포트",
  "/marketing-report": "마케팅 리포트",
  "/media-operations": "매체 운영 현황",
  "/data-entry-status": "데이터 입력 현황",
  "/customer-management": "고객 관리",
  "/management-resources": "관리 리소스",
  "/management-resources/account-creation": "계정 관리",
  "/management-resources/product-management": "코드 등록",
  "/management-resources/marketplace-admedia": "판매처 및 매체 등록",
  "/management-resources/permission-settings": "등급별 권한 설정",
  "/management-resources/daily-quotes": "오늘의 명언",
};

function Breadcrumb({ productSelector = null }) {
  const location = useLocation();

  // 현재 경로를 분석해서 breadcrumb 생성
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname
      .split("/")
      .filter((segment) => segment !== "");
    const breadcrumbs = [];

    let currentPath = "";
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      const label = pathMapping[currentPath];
      if (label) {
        breadcrumbs.push({
          path: currentPath,
          label: label,
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className="breadcrumb-nav" aria-label="Breadcrumb">
      <div className="breadcrumb-container">
        <ol className="breadcrumb-list">
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={breadcrumb.path} className="breadcrumb-item">
              {index === breadcrumbs.length - 1 ? (
                // 현재 페이지는 링크 비활성화
                <span className="breadcrumb-current">{breadcrumb.label}</span>
              ) : (
                // 이전 페이지들은 링크 활성화
                <>
                  <Link to={breadcrumb.path} className="breadcrumb-link">
                    {breadcrumb.label}
                  </Link>
                  <span className="breadcrumb-separator">
                    <FontAwesomeIcon icon={faAngleRight} />
                  </span>
                </>
              )}
            </li>
          ))}
        </ol>
        {productSelector && (
          <div className="breadcrumb-product-selector">{productSelector}</div>
        )}
      </div>
    </nav>
  );
}

export default Breadcrumb;
