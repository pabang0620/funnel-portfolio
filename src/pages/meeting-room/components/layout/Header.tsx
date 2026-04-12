import { Link, useLocation } from 'react-router-dom';
import { Calendar, CalendarDays } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Header() {
  const location = useLocation();

  const navItems = [
    { to: '/meeting-room', label: '일별 보기', icon: Calendar },
    { to: '/meeting-room/monthly', label: '월별 보기', icon: CalendarDays },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/meeting-room" className="flex items-center gap-2 mr-8">
          <img
            src="/images/logo.png"
            alt="FunnelZone"
            className="h-8 object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          <span className="font-bold text-lg">FunnelZone - 회의실 예약</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                location.pathname === item.to
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
