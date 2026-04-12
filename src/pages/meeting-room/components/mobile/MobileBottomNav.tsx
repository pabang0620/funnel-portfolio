import { useNavigate, useLocation } from 'react-router-dom';
import { Home, List } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { path: '/meeting-room/mobile', icon: Home, label: '홈' },
  { path: '/meeting-room/mobile/list', icon: List, label: '일정목록' },
];

export function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.endsWith(item.path.split('/').pop() || '');
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 min-h-12 min-w-16 px-4 py-2 rounded-lg transition-colors',
                isActive
                  ? 'text-blue-500'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              )}
            >
              <Icon className={cn('w-6 h-6', isActive && 'fill-current')} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
