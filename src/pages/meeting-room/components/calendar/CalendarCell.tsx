import { Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { EventBar } from './EventBar';
import { getRoomColor, CEO_COLOR } from '../../lib/theme';
import { isHoliday } from '../../lib/holidays';
import type { Reservation, Room, CalendarEvent } from '../../types';

interface CalendarCellProps {
  day: number | null;
  date: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  dayOfWeek: number;
  weekIndex: number;
  reservations: Reservation[];
  calendarEvents?: CalendarEvent[];
  rooms: Room[];
  onClick: () => void;
  onNavigateToDay?: (date: string) => void;
  onCalendarEventClick?: (event: CalendarEvent) => void;
}

export function CalendarCell({
  day,
  date,
  isToday,
  isCurrentMonth,
  dayOfWeek,
  weekIndex,
  reservations,
  calendarEvents = [],
  rooms,
  onClick,
  onNavigateToDay,
  onCalendarEventClick,
}: CalendarCellProps) {
  if (day === null) {
    return <div className="min-h-[120px] border-r border-b border-[#DADCE0] bg-white" />;
  }

  const dateObj = new Date(date);
  const isHolidayDate = isHoliday(dateObj);

  const handleCreateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to day view instead of opening create form
    onNavigateToDay?.(date);
  };

  const getRoomIndex = (roomId: string) => {
    return rooms.findIndex((r) => r.id === roomId);
  };

  const handleCalendarEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    onCalendarEventClick?.(event);
  };

  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const safeCalendarEvents = Array.isArray(calendarEvents) ? calendarEvents : [];

  // Combine reservations and calendar events for display
  const allItems = [
    ...safeCalendarEvents.map((event) => ({ type: 'event' as const, item: event })),
    ...safeReservations.map((res) => ({ type: 'reservation' as const, item: res })),
  ];
  const maxDisplay = 6;
  const displayItems = allItems.slice(0, maxDisplay);
  const remainingCount = allItems.length - maxDisplay;

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative min-h-[120px] border-r border-b border-[#DADCE0] p-1 text-left flex flex-col transition-colors',
        weekIndex % 2 === 0 && 'bg-gray-100',
        isToday && 'bg-[#F1F3F4]',
        !isToday && weekIndex % 2 !== 0 && 'bg-white hover:bg-[#F8F9FA]',
        !isToday && weekIndex % 2 === 0 && 'hover:bg-gray-200'
      )}
    >
      {/* Create reservation button - visible on hover */}
      {onNavigateToDay && (
        <div
          onClick={handleCreateClick}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-[#1A73E8] text-white flex items-center justify-center hover:bg-[#1557B0] transition-all cursor-pointer z-10"
        >
          <Plus className="w-4 h-4" />
        </div>
      )}

      {/* Day number */}
      <div
        className={cn(
          'w-6 h-6 flex items-center justify-center text-sm rounded-full mb-1',
          isToday && 'bg-[#1A73E8] text-white',
          !isToday && (dayOfWeek === 0 || isHolidayDate) && isCurrentMonth && 'text-[#D93025]',
          !isToday && dayOfWeek === 6 && !isHolidayDate && isCurrentMonth && 'text-[#1A73E8]',
          !isToday && dayOfWeek !== 0 && dayOfWeek !== 6 && !isHolidayDate && isCurrentMonth && 'text-[#3C4043]',
          !isCurrentMonth && 'text-[#B0B0B0]'
        )}
      >
        {day}
      </div>

      {/* Event bars */}
      <div className="flex-1 space-y-0.5 overflow-hidden">
        {displayItems.map((entry) => {
          if (entry.type === 'event') {
            const event = entry.item as CalendarEvent;
            // Parse time from ISO string
            const hasTime = event.start.includes('T');
            let timeStr = '종일';
            if (hasTime) {
              const date = new Date(event.start);
              const hours = String(date.getHours()).padStart(2, '0');
              const minutes = String(date.getMinutes()).padStart(2, '0');
              timeStr = `${hours}:${minutes}`;
            }
            return (
              <div
                key={`event-${event.id}`}
                onClick={(e) => handleCalendarEventClick(e, event)}
                className="text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:brightness-110 hover:shadow-sm text-white"
                style={{ backgroundColor: CEO_COLOR }}
              >
                {timeStr} {event.title}
              </div>
            );
          } else {
            const reservation = entry.item as Reservation;
            return (
              <EventBar
                key={reservation.id}
                reservation={reservation}
                color={getRoomColor(getRoomIndex(reservation.room_id))}
              />
            );
          }
        })}
        {remainingCount > 0 && (
          <div className="text-xs text-[#5F6368] px-1.5">
            +{remainingCount}건 더보기
          </div>
        )}
      </div>
    </button>
  );
}
