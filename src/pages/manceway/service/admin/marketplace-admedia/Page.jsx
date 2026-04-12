import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import Layout from "../../../components/Layout";
import "./MarketplaceAdmedia.css";

// Hooks
import { useSalesChannelTab, useMediaTab, useTeamMediaTab } from "./hooks";

// Elements (Components)
import { SalesChannelTab, MediaTab, TeamMediaTab } from "./elements";

function MarketplaceAdmedia() {
  // 탭 상태 (로컬스토리지에서 불러오기)
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("marketplaceAdmediaActiveTab");
    return savedTab || "salesChannel";
  });

  // 탭 변경 핸들러
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    localStorage.setItem("marketplaceAdmediaActiveTab", tab);
  }, []);

  // 커스텀 훅 사용
  const salesChannelTab = useSalesChannelTab();
  const mediaTab = useMediaTab();
  const teamMediaTab = useTeamMediaTab();

  return (
    <Layout>
      <div className="marketplace-admedia-container full-width-layout">
        {/* 커스텀 Breadcrumb */}
        <nav className="breadcrumb-nav" aria-label="Breadcrumb">
          <div className="breadcrumb-container">
            <ol className="breadcrumb-list">
              <li className="breadcrumb-item">
                <Link to="/management-resources" className="breadcrumb-link">
                  관리 리소스
                </Link>
                <span className="breadcrumb-separator">
                  <FontAwesomeIcon icon={faAngleRight} />
                </span>
              </li>
              <li className="breadcrumb-item">
                <div className="breadcrumb-tabs">
                  <button
                    className={
                      activeTab === "salesChannel"
                        ? "breadcrumb-tab active"
                        : "breadcrumb-tab"
                    }
                    onClick={() => handleTabChange("salesChannel")}
                  >
                    판매처 등록
                  </button>
                  <button
                    className={
                      activeTab === "media"
                        ? "breadcrumb-tab active"
                        : "breadcrumb-tab"
                    }
                    onClick={() => handleTabChange("media")}
                  >
                    매체 등록
                  </button>
                  <button
                    className={
                      activeTab === "teamMediaManagement"
                        ? "breadcrumb-tab active"
                        : "breadcrumb-tab"
                    }
                    onClick={() => handleTabChange("teamMediaManagement")}
                  >
                    팀별 매체 관리
                  </button>
                </div>
              </li>
            </ol>
          </div>
        </nav>

        {/* 판매처 탭 */}
        {activeTab === "salesChannel" && (
          <SalesChannelTab {...salesChannelTab} />
        )}

        {/* 매체 탭 */}
        {activeTab === "media" && <MediaTab {...mediaTab} />}
        
        {/* 팀별 매체 관리 탭 */}
        {activeTab === "teamMediaManagement" && <TeamMediaTab {...teamMediaTab} />}
      </div>
    </Layout>
  );
}

export default MarketplaceAdmedia;
