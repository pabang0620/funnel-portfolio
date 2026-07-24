import { Link, useLocation } from 'react-router-dom';
import { Calendar, CalendarDays } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Header() {
  const location = useLocation();

  const navItems = [
    { to: '/meeting-room', label: 'Day View', icon: Calendar },
    { to: '/meeting-room/monthly', label: 'Month View', icon: CalendarDays },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/meeting-room" className="flex items-center gap-2 mr-8" title="Meeting room booking">
          <img
            src="/images/logo.png"
            alt="FunnelZone"
            className="h-8 object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          <span className="font-bold text-lg">FunnelZone - Meeting Room Booking</span>
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
