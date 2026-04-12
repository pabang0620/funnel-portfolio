import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MiniCalendarProps {
  year: number;
  month: number;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function MiniCalendar({
  year,
  month,
  selectedDate,
  onDateSelect,
  onPrevMonth,
  onNextMonth,
}: MiniCalendarProps) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    // Previous month days
    const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
    const prevMonthDays: { day: number; month: number; year: number; isCurrentMonth: boolean }[] = [];
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      prevMonthDays.push({
        day: prevMonthLastDay - i,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
      });
    }

    // Current month days
    const currentMonthDays: { day: number; month: number; year: number; isCurrentMonth: boolean }[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      currentMonthDays.push({
        day,
        month,
        year,
        isCurrentMonth: true,
      });
    }

    // Next month days
    const totalDays = prevMonthDays.length + currentMonthDays.length;
    const remainingDays = totalDays <= 35 ? 35 - totalDays : 42 - totalDays;
    const nextMonthDays: { day: number; month: number; year: number; isCurrentMonth: boolean }[] = [];
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      nextMonthDays.push({
        day: i,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
      });
    }

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  }, [year, month]);

  const isToday = (d: { day: number; month: number; year: number }) => {
    return `${d.year}-${d.month}-${d.day}` === todayStr;
  };

  const isSelected = (d: { day: number; month: number; year: number }) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getFullYear() === d.year &&
      selectedDate.getMonth() + 1 === d.month &&
      selectedDate.getDate() === d.day
    );
  };

  return (
    <div className="w-full">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[#3C4043]">
          {year}년 {month}월
        </span>
        <div className="flex items-center">
          <button
            onClick={onPrevMonth}
            className="p-1 hover:bg-[#F1F3F4] rounded-full"
          >
            <ChevronLeft className="h-4 w-4 text-[#5F6368]" />
          </button>
          <button
            onClick={onNextMonth}
            className="p-1 hover:bg-[#F1F3F4] rounded-full"
          >
            <ChevronRight className="h-4 w-4 text-[#5F6368]" />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((day, index) => (
          <div
            key={day}
            className={cn(
              'text-center text-xs font-medium py-1',
              index === 0 && 'text-[#D93025]',
              index === 6 && 'text-[#1A73E8]',
              index !== 0 && index !== 6 && 'text-[#5F6368]'
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-0">
        {calendarDays.map((d, index) => (
          <button
            key={`${d.year}-${d.month}-${d.day}`}
            onClick={() => onDateSelect(new Date(d.year, d.month - 1, d.day))}
            className={cn(
              'w-7 h-7 flex items-center justify-center text-xs rounded-full transition-colors',
              d.isCurrentMonth ? 'text-[#3C4043]' : 'text-[#B0B0B0]',
              index % 7 === 0 && d.isCurrentMonth && 'text-[#D93025]',
              index % 7 === 6 && d.isCurrentMonth && 'text-[#1A73E8]',
              isToday(d) && 'bg-[#1A73E8] text-white',
              isSelected(d) && !isToday(d) && 'bg-[#E8F0FE] text-[#1A73E8]',
              !isToday(d) && !isSelected(d) && 'hover:bg-[#F1F3F4]'
            )}
          >
            {d.day}
          </button>
        ))}
      </div>
    </div>
  );
}
