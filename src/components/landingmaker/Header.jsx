/**
 * 애플리케이션 공통 헤더 컴포넌트
 * 사용자 정보 표시, 로그아웃 기능, 페이지별 네비게이션을 제공
 * 모든 인증된 페이지에서 공통으로 사용되는 상단 바
 */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, ChevronDown, UserCircle, Wand2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/landingmaker/ui/dropdown-menu";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState("관리자");

  useEffect(() => {
    // localStorage에서 사용자 정보 가져오기
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.name) {
          setUserName(user.name);
          console.log('✅ Header에 표시될 사용자 이름:', user.name);
        }
      } catch (error) {
        console.error('Header - 사용자 정보 파싱 오류:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    // 로컬 스토리지에서 토큰 제거
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // 로그인 페이지로 이동
    navigate("/portfolio/landingmaker/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-lg border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* 로고 */}
        <h1 className="font-bold text-xl text-gray-900">
          L
          <span className="relative inline-block">
            <span>a</span>
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gray-900 rounded-full"></span>
          </span>
          nding M
          <span className="relative inline-block">
            <span>a</span>
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gray-900 rounded-full"></span>
          </span>
          ker
        </h1>

        {/* 오른쪽 메뉴 및 사용자 정보 */}
        <div className="flex items-center gap-4">
          {/* 메뉴 */}
          <nav className="flex items-center gap-6">
            <button
              onClick={() => navigate("/portfolio/landingmaker/create/template")}
              className={`font-medium text-[14px] flex items-center gap-1.5 ${
                location.pathname === "/portfolio/landingmaker/create/template"
                  ? "text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              랜딩제작
            </button>
            <button
              onClick={() => navigate("/portfolio/landingmaker")}
              className={`font-medium text-[14px] ${
                location.pathname === "/portfolio/landingmaker"
                  ? "text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              랜딩목록
            </button>
            <button
              onClick={() => navigate("/portfolio/landingmaker/admin/domain")}
              className={`font-medium text-[14px] ${
                location.pathname === "/portfolio/landingmaker/admin/domain"
                  ? "text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              도메인 관리
            </button>
          </nav>

          {/* 세로 구분선 */}
          <div className="w-px h-6 bg-gray-300"></div>

          {/* 사용자 정보 */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-2 bg-purple-100 rounded-md text-sm font-medium text-purple-900">{userName}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hover:opacity-70 transition-opacity focus:outline-none focus-visible:outline-none">
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={20}>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
