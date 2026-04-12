import { useMemo } from 'react';
import { CalendarCell } from './CalendarCell';
import { cn } from '../../lib/utils';
import type { Reservation, Room, CalendarEvent } from '../../types';

interface CalendarGridProps {
  year: number;
  month: number;
  reservations: Reservation[];
  calendarEvents?: CalendarEvent[];
  rooms: Room[];
  visibleRoomIds: Set<string>;
  onDateClick: (date: string) => void;
  onNavigateToDay?: (date: string) => void;
  onCalendarEventClick?: (event: CalendarEvent) => void;
  ceoVisible?: boolean;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function CalendarGrid({
  year,
  month,
  reservations,
  calendarEvents = [],
  rooms,
  visibleRoomIds,
  onDateClick,
  onNavigateToDay,
  onCalendarEventClick,
  ceoVisible = true,
}: CalendarGridProps) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const calendarWeeks = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    // Previous month days
    const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
    const days: { day: number | null; date: string; isCurrentMonth: boolean }[] = [];

    // Previous month
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const day = prevMonthLastDay - i;
      days.push({
        day,
        date: `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        isCurrentMonth: false,
      });
    }

    // Current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        isCurrentMonth: true,
      });
    }

    // Next month
    const totalDays = days.length;
    const remainingDays = totalDays <= 35 ? 35 - totalDays : 42 - totalDays;
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      days.push({
        day: i,
        date: `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        isCurrentMonth: false,
      });
    }

    // Split into weeks
    const weeks: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks;
  }, [year, month]);

  const reservationsByDate = useMemo(() => {
    const map = new Map<string, Reservation[]>();
    const list = Array.isArray(reservations) ? reservations : [];

    list
      .filter((r) => visibleRoomIds.has(r.room_id) && r.status === 'reserved')
      .forEach((r) => {
        const date = r.reservation_date;
        if (!map.has(date)) {
          map.set(date, []);
        }
        map.get(date)!.push(r);
      });

    // Sort by start_time
    map.forEach((list) => {
      list.sort((a, b) => a.start_time.localeCompare(b.start_time));
    });

    return map;
  }, [reservations, visibleRoomIds]);

  // Parse ISO datetime to date string (YYYY-MM-DD)
  const parseISOToDate = (isoString: string): string => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const calendarEventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();

    calendarEvents.forEach((event) => {
      const date = parseISOToDate(event.start);
      if (!map.has(date)) {
        map.set(date, []);
      }
      map.get(date)!.push(event);
    });

    // Sort by start time
    map.forEach((list) => {
      list.sort((a, b) => a.start.localeCompare(b.start));
    });

    return map;
  }, [calendarEvents]);

  return (
    <div className="flex-1 h-full flex flex-col bg-white">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-[#DADCE0]">
        {WEEKDAYS.map((day, index) => (
          <div
            key={day}
            className={cn(
              'text-center py-2 md:py-3 text-xs md:text-sm font-medium border-r border-[#DADCE0] last:border-r-0',
              index === 0 && 'text-[#D93025]',
              index === 6 && 'text-[#1A73E8]',
              index !== 0 && index !== 6 && 'text-[#5F6368]'
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 h-full flex flex-col">
        {calendarWeeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 flex-1">
            {week.map((d, dayIndex) => (
              <CalendarCell
                key={d.date}
                day={d.day}
                date={d.date}
                isToday={d.date === todayStr}
                isCurrentMonth={d.isCurrentMonth}
                dayOfWeek={dayIndex}
                weekIndex={weekIndex}
                reservations={reservationsByDate.get(d.date) || []}
                calendarEvents={ceoVisible ? (calendarEventsByDate.get(d.date) || []) : []}
                rooms={rooms}
                onClick={() => onDateClick(d.date)}
                onNavigateToDay={onNavigateToDay}
                onCalendarEventClick={onCalendarEventClick}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
