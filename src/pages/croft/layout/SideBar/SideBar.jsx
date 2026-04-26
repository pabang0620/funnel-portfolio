import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SideBarIcon from './SideBarIcon';

const SideBar = ({ currentPath }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('total');

  useEffect(() => {
    if (currentPath === '/portfolio/croft' || currentPath === '/portfolio/croft/') {
      setActiveMenu('total');
    } else if (currentPath === '/portfolio/croft/dash') {
      setActiveMenu('home');
    }
  }, [location, currentPath]);

  const menuItems = [
    { id: 'total', label: '통합 대시보드', path: '/portfolio/croft', hasBorder: false },
    { id: 'home', label: '단일 대시보드', path: '/portfolio/croft/dash', hasBorder: true },
    { id: 'settings', label: '환경설정', path: null, hasBorder: false },
  ];

  return (
    <aside className={`flex-shrink-0 h-screen bg-[#2f2f2f] text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-56'}`}>
      {/* 로고 영역 */}
      <div className="relative h-16 flex items-center justify-center border-b border-gray-700">
        <div
          className="cursor-pointer"
          onClick={() => navigate('/portfolio/croft')}
        >
          {isCollapsed ? (
            <div className="w-8 h-8 bg-[#3F9192] rounded-lg flex items-center justify-center text-white font-bold">C</div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#3F9192] rounded-lg flex items-center justify-center text-white font-bold">C</div>
              <span className="text-lg font-semibold">CROFT</span>
            </div>
          )}
        </div>

        {/* 토글 버튼 */}
        <button
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center shadow-md transition-colors"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <svg className={`w-3 h-3 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* 메뉴 영역 */}
      <nav className="p-3 space-y-1">
        {menuItems.map((item, index) => (
          <div key={item.id}>
            {item.hasBorder && <div className="border-t border-gray-700 my-3" />}
            <button
              onClick={() => {
                setActiveMenu(item.id);
                if (item.path) navigate(item.path);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                activeMenu === item.id
                  ? 'bg-[#3F9192] text-white'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex-shrink-0">
                {SideBarIcon(item.id, activeMenu)}
              </div>
              {!isCollapsed && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
            </button>
            {item.hasBorder && <div className="border-b border-gray-700 my-3" />}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default SideBar;
