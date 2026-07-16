import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

const userName = "데모 관리자";

function Header({ isSidebarOpen, setIsSidebarOpen }) {
  const navigate = useNavigate();
  const isMobile = window.innerWidth <= 768;

  const handleToggle = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleLogout = () => {
    navigate("/portfolio/landingmaker");
  };

  return (
    <header>
      {/* 모바일 햄버거 버튼 */}
      {isMobile && (
        <button
          className="mobile-menu-btn"
          onClick={handleToggle}
          aria-label="메뉴 열기"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
      )}

      {/* 로고 */}
      <div className="logo">
        <span className="gradient-text">Med Manager</span>
        <span className="solid-text">Med Manager</span>
      </div>

      {/* 우측 프로필 영역 */}
      <div className="profile">
        <span
          style={{
            fontSize: "0.875rem",
            color: "#555",
            marginRight: "0.5rem",
          }}
        >
          {userName}
        </span>
        <button
          onClick={handleLogout}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            padding: "4px",
            borderRadius: "6px",
            transition: "background 0.2s",
          }}
          aria-label="로그아웃"
          title="나가기"
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(72,128,255,0.08)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          <img
            src="/images/header/sign-out.png"
            alt="로그아웃"
            style={{ width: "20px", height: "20px", objectFit: "contain" }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = "none";
              e.target.parentElement.insertAdjacentText("beforeend", "나가기");
            }}
          />
        </button>
      </div>
    </header>
  );
}

export default Header;
