import {
  useState,
  useCallback,
  useEffect,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faDatabase,
  faUsers,
  faEye,
  faBullhorn,
  faUsersCog,
  faAngleRight,
  faUserPlus,
  faQrcode,
  faPlus,
  faUserShield,
  faQuoteLeft,
  faSignOutAlt,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import "./Sidebar.css";
import { useAuth } from "../contexts/AuthContext";
import { useMenuPermissions } from "../hooks/useMenuPermissions";

const menuItems = [
  {
    path: "/ad-performance/executive-report",
    label: "Executive Report",
    icon: faChartLine,
  },
  { path: "/ad-performance/marketing-report", label: "Marketing Report", icon: faBullhorn },
  // { path: "/media-operations", label: "Media Operations Status", icon: faEye },
  { path: "/ad-performance/data-entry-status", label: "Data Entry Status", icon: faDatabase, locked: true },
  // { path: "/customer-management", label: "Customer Management", icon: faUsers },
  {
    label: "CS Management",
    path: "/ad-performance/cs-management/data",
    icon: faUsers,
    locked: true,
    subItems: [
      {
        path: "/ad-performance/cs-management/data",
        label: "Data Management",
        icon: faDatabase,
      },
      {
        path: "/ad-performance/cs-management/shipping",
        label: "Shipping Management",
        icon: faQrcode,
      },
    ],
  },
  {
    label: "Admin Resources",
    path: "/ad-performance/management-resources/account-creation",
    icon: faUsersCog,
    locked: true,
    subItems: [
      {
        path: "/ad-performance/management-resources/account-creation",
        label: "Account Creation",
        icon: faUserPlus,
      },
      {
        path: "/ad-performance/management-resources/permission-settings",
        label: "Role Permission Settings",
        icon: faUserShield,
      },
      {
        path: "/ad-performance/management-resources/product-management",
        label: "Code & Product Registration",
        icon: faQrcode,
      },
      {
        path: "/ad-performance/management-resources/marketplace-admedia",
        label: "Marketplace & Media Registration",
        icon: faPlus,
      },
      {
        path: "/ad-performance/management-resources/daily-quotes",
        label: "Quote of the Day",
        icon: faQuoteLeft,
      },
    ],
  },
];


function Sidebar({ isCollapsed, onToggleCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { userName, userTeam, userRole, parentTeam, logout, checkTokenExpiry } = useAuth();
  const [openIndexes, setOpenIndexes] = useState({});

  // DB 기반 메뉴 권한 관리
  const { shouldShowParentMenu, filterAccessibleSubItems } = useMenuPermissions();

  // 페이지 이동 전 토큰 만료 체크
  const handleNavigation = useCallback((path, e) => {
    if (!checkTokenExpiry()) {
      e?.preventDefault();
      alert("Your session has expired. Please log in again.");
      // navigate("/login"); // PORTFOLIO: no login
      return false;
    }
    return true;
  }, [checkTokenExpiry, navigate]);

  const handleLogout = () => {
    logout();
    // navigate("/login"); // PORTFOLIO: no login
  };

  const toggleSubMenu = (index) => {
    setOpenIndexes((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  // 메뉴 아이템이 활성화되었는지 확인하는 함수
  const isMainMenuActive = useCallback(
    (menu) => {
      // 정확히 메인 메뉴 경로와 일치하는 경우
      if (location.pathname === menu.path) {
        return true;
      }
      // 서브메뉴 중 하나와 일치하는 경우
      if (
        menu.subItems &&
        menu.subItems.some((subItem) => location.pathname === subItem.path)
      ) {
        return true;
      }
      // 경로가 메인 메뉴 경로로 시작하는 경우 (하위 경로 포함)
      if (menu.path !== "/" && location.pathname.startsWith(menu.path)) {
        return true;
      }
      return false;
    },
    [location.pathname]
  );

  // 서브메뉴가 있는 메인 메뉴의 경우 자동으로 확장 상태로 만들기 (첫 로드시에만)
  useEffect(() => {
    const newOpenIndexes = {};

    menuItems.forEach((item, index) => {
      if (item.subItems && isMainMenuActive(item)) {
        // 이미 설정된 값이 없을 때만 자동 확장
        if (openIndexes[index] === undefined) {
          newOpenIndexes[index] = false; // false가 펼쳐진 상태
        }
      }
    });

    if (Object.keys(newOpenIndexes).length > 0) {
      setOpenIndexes((prevState) => ({ ...prevState, ...newOpenIndexes }));
    }
  }, [location.pathname, isMainMenuActive]);

  return (
    <nav className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-content">
        <div className="sidebar-header">
          <h1 className="sidebar-title" title="Cross-channel revenue dashboard with month-over-month deltas">{isCollapsed ? "AP" : "Ad Performance"}</h1>
        </div>

        <div className="sidebar-group">
          <ul className="sidebar-menu">
            {menuItems
              .map((item, index) => {
                // 잠긴 항목은 별도 렌더링 (권한 필터 우선 적용)
                if (item.locked) {
                  return (
                    <li key={index} className="sidebar-menu-item">
                      <button
                        onClick={() => {}}
                        className="sidebar-menu-button"
                        style={{ opacity: 0.6, cursor: 'not-allowed' }}
                      >
                        <span className="menu-icon">
                          <FontAwesomeIcon icon={item.icon} />
                        </span>
                        <span className="menu-title">{item.label}</span>
                        <FontAwesomeIcon
                          icon={faLock}
                          style={{ marginLeft: 'auto', fontSize: '11px', opacity: 0.7 }}
                        />
                      </button>
                      {item.subItems && (
                        <ul
                          className={`sidebar-submenu ${
                            openIndexes[index] ? "collapsed" : "expanded"
                          }`}
                        >
                          {item.subItems.map((subItem, subIndex) => (
                            <li key={subIndex} className="sidebar-submenu-item">
                              <button
                                onClick={() => {}}
                                className="sidebar-submenu-button"
                                style={{ opacity: 0.6, cursor: 'not-allowed' }}
                              >
                                <span className="submenu-icon">
                                  <FontAwesomeIcon icon={subItem.icon} />
                                </span>
                                <span className="submenu-title">
                                  {subItem.label}
                                </span>
                                <FontAwesomeIcon
                                  icon={faLock}
                                  style={{ marginLeft: 'auto', fontSize: '10px', opacity: 0.7 }}
                                />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                }

                // 일반 항목: 권한 필터 적용
                if (!shouldShowParentMenu(item)) return null;

                const isActive = isMainMenuActive(item);

                // 접근 가능한 서브메뉴만 필터링
                const accessibleSubItems = item.subItems
                  ? filterAccessibleSubItems(item.subItems)
                  : null;

                // 서브메뉴가 있지만 접근 가능한 항목이 없으면 렌더링하지 않음
                if (item.subItems && accessibleSubItems.length === 0) {
                  return null;
                }

                return (
                  <li key={index} className="sidebar-menu-item">
                    {accessibleSubItems ? (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (!isCollapsed) {
                            toggleSubMenu(index);
                          }
                        }}
                        className={`sidebar-menu-button ${
                          isActive ? "active" : ""
                        }`}
                      >
                        <span className="menu-icon">
                          <FontAwesomeIcon icon={item.icon} />
                        </span>
                        <span className="menu-title">{item.label}</span>
                        <span
                          className={`submenu-indicator ${
                            !openIndexes[index] ? "expanded" : ""
                          }`}
                        >
                          <FontAwesomeIcon icon={faAngleRight} />
                        </span>
                      </button>
                    ) : (
                      <Link
                        to={item.path}
                        className={`sidebar-menu-button ${
                          isActive ? "active" : ""
                        }`}
                        onClick={(e) => handleNavigation(item.path, e)}
                      >
                        <span className="menu-icon">
                          <FontAwesomeIcon icon={item.icon} />
                        </span>
                        <span className="menu-title">{item.label}</span>
                      </Link>
                    )}
                    {accessibleSubItems && (
                      <ul
                        className={`sidebar-submenu ${
                          openIndexes[index] ? "collapsed" : "expanded"
                        }`}
                      >
                        {accessibleSubItems.map((subItem, subIndex) => {
                          const isSubActive =
                            location.pathname === subItem.path;
                          return (
                            <li key={subIndex} className="sidebar-submenu-item">
                              <Link
                                to={subItem.path}
                                className={`sidebar-submenu-button ${
                                  isSubActive ? "active" : ""
                                }`}
                                onClick={(e) => handleNavigation(subItem.path, e)}
                              >
                                <span className="submenu-icon">
                                  <FontAwesomeIcon icon={subItem.icon} />
                                </span>
                                <span className="submenu-title">
                                  {subItem.label}
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
          </ul>
        </div>

        {/* 사용자 정보 영역 */}
        <div className="sidebar-footer">
          <div className="user-info">
            {!isCollapsed ? (
              <div className="user-info-row">
                <span className={`user-grade-badge grade-${userRole.toLowerCase()}`}>
                  {userRole}
                </span>
                <span className="user-name">{userName}</span>
                {userTeam && <span className="user-team">{userTeam}</span>}
              </div>
            ) : (
              <div className="user-info-collapsed">
                <span className={`user-grade-badge grade-${userRole.toLowerCase()}`}>
                  {userRole}
                </span>
              </div>
            )}
          </div>
          <button
            className="logout-button"
            onClick={handleLogout}
            title="Log out"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            {!isCollapsed && <span className="logout-text">Log out</span>}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Sidebar;
