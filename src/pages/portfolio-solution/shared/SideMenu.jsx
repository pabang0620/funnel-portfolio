import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faDatabase,
  faChartPie,
  faPhone,
  faCalendarAlt,
  faBullhorn,
  faCode,
  faList,
  faTrophy,
  faDollarSign,
  faUserShield,
  faChevronRight,
  faBars,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import AlertModal from "../shared/AlertModal";

const BASE = "/portfolio-solution";

const MENU_CONFIG = [
  {
    key: "main-report",
    label: "메인보고서",
    icon: faChartBar,
    path: `${BASE}/main-report`,
    locked: false,
  },
  {
    key: "db-list",
    label: "DB리스트",
    icon: faDatabase,
    path: `${BASE}/db-list`,
    locked: false,
  },
  {
    key: "pivot",
    label: "피봇 분석",
    icon: faChartPie,
    path: `${BASE}/pivot`,
    locked: false,
  },
  {
    key: "tm",
    label: "TM",
    icon: faPhone,
    locked: false,
    subMenus: [
      {
        key: "tm-status",
        label: "담당자 업무 현황",
        path: `${BASE}/tm-status`,
        locked: false,
      },
      {
        key: "tm-calendar",
        label: "예약달력",
        path: `${BASE}/tm/calendar`,
        locked: true,
      },
      {
        key: "tm-notice",
        label: "공지",
        path: `${BASE}/tm/notice`,
        locked: true,
      },
    ],
  },
  {
    key: "code-manage",
    label: "코드 관리",
    icon: faCode,
    locked: false,
    subMenus: [
      {
        key: "create-code",
        label: "코드 생성",
        path: `${BASE}/create-code`,
        locked: false,
      },
      {
        key: "code-list",
        label: "코드 목록",
        path: `${BASE}/code-list`,
        locked: true,
      },
    ],
  },
  {
    key: "performance-report",
    label: "성과 리포트",
    icon: faTrophy,
    path: `${BASE}/performance-report`,
    locked: true,
  },
  {
    key: "ad-cost",
    label: "광고비관리",
    icon: faDollarSign,
    path: `${BASE}/ad-cost`,
    locked: true,
  },
  {
    key: "admin",
    label: "관리자 페이지",
    icon: faUserShield,
    path: `${BASE}/admin`,
    locked: true,
  },
];

function SideMenu({ isSidebarOpen, setIsSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSubMenus, setOpenSubMenus] = useState({});
  const [alertMessage, setAlertMessage] = useState(null);
  const isMobile = window.innerWidth <= 768;

  // 현재 경로에 해당하는 서브메뉴 자동 오픈
  useEffect(() => {
    const currentPath = location.pathname;
    MENU_CONFIG.forEach((menu) => {
      if (menu.subMenus) {
        const hasActive = menu.subMenus.some((sub) =>
          currentPath.startsWith(sub.path)
        );
        if (hasActive) {
          setOpenSubMenus((prev) => ({ ...prev, [menu.key]: true }));
        }
      }
    });
  }, [location.pathname]);

  const toggleSubMenu = (key) => {
    setOpenSubMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isMainMenuActive = (menu) => {
    if (menu.path) return location.pathname.startsWith(menu.path);
    if (menu.subMenus) {
      return menu.subMenus.some((sub) =>
        location.pathname.startsWith(sub.path)
      );
    }
    return false;
  };

  const handleMenuClick = (item) => {
    if (item.locked) {
      setAlertMessage("데모 버전에서는 제공되지 않는 기능입니다.");
      return;
    }
    navigate(item.path);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleToggle = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const sidebarClass = [
    isMobile
      ? isSidebarOpen
        ? "sidebar-open"
        : ""
      : isSidebarOpen
      ? ""
      : "sidebar-collapsed",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <nav className={sidebarClass}>
        {/* 사이드바 헤더 */}
        <div className="sidebar-header">
          <button
            className="sidebar-toggle-btn"
            onClick={handleToggle}
            aria-label="사이드바 토글"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
          {(isSidebarOpen || !isMobile) && (
            <span
              style={{
                marginLeft: "0.75rem",
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "#4880ff",
                whiteSpace: "nowrap",
                overflow: "hidden",
                opacity: isSidebarOpen && !isMobile ? 1 : isMobile ? 1 : 0,
                transition: "opacity 0.3s",
              }}
            >
              Med Manager
            </span>
          )}
        </div>

        {/* 메뉴 목록 */}
        <div className="sidebar-content">
          <div className="sidebar-group">
            <ul className="sidebar-menu">
              {MENU_CONFIG.map((menu) => (
                <li key={menu.key} className="sidebar-menu-item">
                  {/* 서브메뉴가 있는 경우 */}
                  {menu.subMenus ? (
                    <>
                      <button
                        className={`sidebar-menu-button${
                          isMainMenuActive(menu) ? " active" : ""
                        }`}
                        onClick={() => toggleSubMenu(menu.key)}
                      >
                        <span className="menu-icon">
                          <FontAwesomeIcon icon={menu.icon} />
                        </span>
                        <span className="menu-title">{menu.label}</span>
                        <span
                          className={`submenu-indicator${
                            openSubMenus[menu.key] ? " expanded" : ""
                          }`}
                        >
                          <FontAwesomeIcon icon={faChevronRight} />
                        </span>
                      </button>
                      <ul
                        className={`sidebar-submenu${
                          openSubMenus[menu.key] ? " expanded" : " collapsed"
                        }`}
                      >
                        {menu.subMenus.map((sub) => (
                          <li key={sub.key} className="sidebar-submenu-item">
                            <button
                              className={`sidebar-submenu-button${
                                location.pathname.startsWith(sub.path)
                                  ? " active"
                                  : ""
                              }`}
                              onClick={() => handleMenuClick(sub)}
                            >
                              {sub.label}
                              {sub.locked && (
                                <FontAwesomeIcon
                                  icon={faLock}
                                  style={{
                                    marginLeft: "0.4rem",
                                    fontSize: "0.7rem",
                                    opacity: 0.6,
                                  }}
                                />
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    /* 단일 메뉴 */
                    <button
                      className={`sidebar-menu-button${
                        isMainMenuActive(menu) ? " active" : ""
                      }`}
                      onClick={() => handleMenuClick(menu)}
                    >
                      <span className="menu-icon">
                        <FontAwesomeIcon icon={menu.icon} />
                      </span>
                      <span className="menu-title">{menu.label}</span>
                      {menu.locked && (
                        <FontAwesomeIcon
                          icon={faLock}
                          style={{
                            marginLeft: "0.4rem",
                            fontSize: "0.7rem",
                            opacity: 0.6,
                          }}
                        />
                      )}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {alertMessage && (
        <AlertModal
          message={alertMessage}
          onConfirm={() => setAlertMessage(null)}
          confirmText="확인"
        />
      )}
    </>
  );
}

export default SideMenu;
