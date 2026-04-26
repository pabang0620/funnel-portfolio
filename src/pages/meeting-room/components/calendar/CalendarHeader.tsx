import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Button } from '../../components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ViewMode } from '../../pages/CalendarView';

interface CalendarHeaderProps {
  year: number;
  month: number;
  selectedDate: Date;
  viewMode: ViewMode;
  onPrevPeriod: () => void;
  onNextPeriod: () => void;
  onToday: () => void;
  onViewModeChange: (mode: ViewMode) => void;
}

export function CalendarHeader({
  year,
  month,
  selectedDate,
  viewMode,
  onPrevPeriod,
  onNextPeriod,
  onToday,
  onViewModeChange,
}: CalendarHeaderProps) {
  const getPeriodTitle = () => {
    switch (viewMode) {
      case 'day':
        return format(selectedDate, 'yyyy년 M월 d일 (EEEE)', { locale: ko });
      case 'week': {
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
        if (weekStart.getMonth() === weekEnd.getMonth()) {
          return `${format(weekStart, 'yyyy년 M월', { locale: ko })} ${format(weekStart, 'd')}일 - ${format(weekEnd, 'd')}일`;
        }
        return `${format(weekStart, 'yyyy년 M월 d일', { locale: ko })} - ${format(weekEnd, 'M월 d일', { locale: ko })}`;
      }
      case 'month':
      default:
        return `${year}년 ${month}월`;
    }
  };

  const viewModes: { mode: ViewMode; label: string }[] = [
    { mode: 'day', label: '일간' },
    { mode: 'week', label: '주간' },
    { mode: 'month', label: '월간' },
  ];

  return (
    <header className="flex items-center justify-between h-14 md:h-16 px-3 md:px-4 border-b border-[#DADCE0]">
      {/* Left: Logo and navigation */}
      <div className="flex items-center gap-3 md:gap-6">
        {/* Logo */}
        <img
          src="/images/funnelzone.png"
          alt="PortfolioZone"
          className="w-[140px] md:w-[180px] lg:w-[200px] object-contain"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />

        {/* Navigation */}
        <div className="flex items-center gap-1 md:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToday}
            className="ml-2 md:ml-5 h-8 md:h-9 px-2 md:px-4 text-xs md:text-sm font-medium text-[#3C4043] border-[#DADCE0] hover:bg-[#F1F3F4]"
          >
            오늘
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevPeriod}
            className="h-8 w-8 md:h-9 md:w-9 text-[#5F6368] hover:bg-[#F1F3F4]"
          >
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextPeriod}
            className="h-8 w-8 md:h-9 md:w-9 text-[#5F6368] hover:bg-[#F1F3F4]"
          >
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <span className="text-lg md:text-xl lg:text-2xl font-semibold tracking-tight text-[#3C4043] ml-1 md:ml-2">
            {getPeriodTitle()}
          </span>
        </div>
      </div>

      {/* Right: View options */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* View mode buttons */}
        <div className="flex border border-[#DADCE0] rounded-md overflow-hidden">
          {viewModes.map((item, index) => (
            <button
              key={item.mode}
              onClick={() => onViewModeChange(item.mode)}
              className={cn(
                'min-w-[50px] md:min-w-[60px] lg:min-w-[70px] px-2 md:px-3 lg:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium',
                index < viewModes.length - 1 && 'border-r border-[#DADCE0]',
                viewMode === item.mode
                  ? 'text-white bg-[#1A73E8] hover:bg-[#1967D2]'
                  : 'text-[#5F6368] hover:bg-[#F1F3F4]'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
