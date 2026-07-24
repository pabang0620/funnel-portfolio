import { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarX, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { getRoomColor, CEO_COLOR } from '../../lib/theme';
import { isHoliday } from '../../lib/holidays';
import { normalizeTime } from '../../lib/constants';
import type { Reservation, Room, CalendarEvent } from '../../types';

interface MobileMonthViewProps {
  selectedDate: Date;
  reservations: Reservation[];
  rooms: Room[];
  calendarEvents?: CalendarEvent[];
  onDateSelect: (date: Date) => void;
  onReservationSelect: (reservation: Reservation) => void;
  onCalendarEventClick?: (event: CalendarEvent) => void;
}

export function MobileMonthView({
  selectedDate,
  reservations,
  rooms,
  calendarEvents = [],
  onDateSelect,
  onReservationSelect,
  onCalendarEventClick,
}: MobileMonthViewProps) {
  const [viewingDate, setViewingDate] = useState<Date>(selectedDate);

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  // Generate all dates for the calendar grid
  const calendarDates: Date[] = [];
  let currentDate = calendarStart;
  while (currentDate <= calendarEnd) {
    calendarDates.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }

  // Get reservations for a specific date
  const getReservationsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return reservations
      .filter(r => r.reservation_date === dateStr && r.status === 'reserved')
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  // Get reservations for selected date
  const selectedDateReservations = useMemo(() => {
    return getReservationsForDate(viewingDate);
  }, [viewingDate, reservations]);

  // Get room color index
  const getRoomColorIndex = (roomId: string) => {
    const index = rooms.findIndex(r => r.id === roomId);
    return index >= 0 ? index : 0;
  };

  // Get room name (shortened for display)
  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room?.name || '회의실';
  };

  // Get calendar events for a specific date
  const getCalendarEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return calendarEvents.filter((event) => {
      const eventDate = event.start.split('T')[0];
      return eventDate === dateStr;
    });
  };

  // Get calendar events for selected date
  const selectedDateCalendarEvents = useMemo(() => {
    return getCalendarEventsForDate(viewingDate);
  }, [viewingDate, calendarEvents]);

  // Parse ISO datetime to time string (HH:mm)
  const parseISOToTime = (isoString: string): string => {
    if (!isoString.includes('T')) {
      return '종일';
    }
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Handle CEO calendar event click
  const handleCalendarEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    onCalendarEventClick?.(event);
  };

  // Split into weeks
  const weeks: Date[][] = [];
  for (let i = 0; i < calendarDates.length; i += 7) {
    weeks.push(calendarDates.slice(i, i + 7));
  }

  const handleDateClick = (date: Date) => {
    setViewingDate(date);
    // 하단 목록만 업데이트, 일간 보기로 이동하지 않음
  };

  const handleGoToDayView = () => {
    onDateSelect(viewingDate);
  };

  const handleReservationClick = (e: React.MouseEvent, reservation: Reservation) => {
    e.stopPropagation();
    onReservationSelect(reservation);
  };

  return (
    <div className="space-y-4">
      {/* Calendar Grid */}
      <div className="bg-white rounded-lg border border-gray-100 p-2">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
            <div
              key={day}
              className={cn(
                'text-center text-xs font-medium py-1',
                index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-500'
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="space-y-0.5">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-0.5">
              {week.map((date, dayIndex) => {
                const dayReservations = getReservationsForDate(date);
                const dayCalendarEvents = getCalendarEventsForDate(date);
                const isViewing = isSameDay(date, viewingDate);
                const isCurrentMonth = isSameMonth(date, selectedDate);
                const today = isToday(date);
                const isSunday = dayIndex === 0;
                const isSaturday = dayIndex === 6;
                const totalCount = dayReservations.length + dayCalendarEvents.length;

                return (
                  <div
                    key={date.toISOString()}
                    onClick={() => handleDateClick(date)}
                    className={cn(
                      'relative flex flex-col min-h-[100px] p-1 rounded-md transition-all cursor-pointer border',
                      isViewing
                        ? 'bg-blue-50 border-blue-300'
                        : isCurrentMonth
                          ? 'hover:bg-gray-50 border-transparent'
                          : 'opacity-40 border-transparent',
                      today && !isViewing && 'ring-2 ring-blue-300'
                    )}
                  >
                    {/* Date number */}
                    <span
                      className={cn(
                        'text-xs font-medium mb-0.5',
                        isViewing
                          ? 'text-blue-600'
                          : !isCurrentMonth
                            ? 'text-gray-400'
                            : (isSunday || isHoliday(date))
                              ? 'text-red-500'
                              : isSaturday
                                ? 'text-blue-500'
                                : 'text-gray-900'
                      )}
                    >
                      {format(date, 'd')}
                    </span>

                    {/* Events in cell */}
                    {isCurrentMonth && totalCount > 0 && (
                      <div className="flex-1 flex flex-col gap-px overflow-hidden">
                        {/* CEO Calendar Events */}
                        {dayCalendarEvents.slice(0, 2).map((event) => (
                          <button
                            key={event.id}
                            onClick={(e) => handleCalendarEventClick(e, event)}
                            className="w-full text-left text-[9px] leading-tight truncate rounded px-0.5 py-px text-white font-medium hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: CEO_COLOR }}
                            title={`${parseISOToTime(event.start)} ${event.title}`}
                          >
                            {event.title}
                          </button>
                        ))}
                        {/* Reservations */}
                        {dayReservations.slice(0, 4 - Math.min(dayCalendarEvents.length, 2)).map((reservation) => {
                          const colorIndex = getRoomColorIndex(reservation.room_id);
                          const color = getRoomColor(colorIndex);
                          return (
                            <button
                              key={reservation.id}
                              onClick={(e) => handleReservationClick(e, reservation)}
                              className="w-full text-left text-[9px] leading-tight truncate rounded px-0.5 py-px text-white font-medium hover:opacity-80 transition-opacity"
                              style={{ backgroundColor: color }}
                              title={`${normalizeTime(reservation.start_time)} ${reservation.purpose}`}
                            >
                              {reservation.purpose}
                            </button>
                          );
                        })}
                        {totalCount > 4 && (
                          <div className="text-[9px] text-gray-500 font-medium pl-0.5">
                            +{totalCount - 4}건
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Date Reservations */}
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
        {/* Date Header */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            {format(viewingDate, 'M월 d일 (EEE)', { locale: ko })} 일정
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoToDayView}
            className="text-xs h-7 px-2 gap-1"
          >
            <Calendar className="w-3.5 h-3.5" />
            일간 보기
          </Button>
        </div>

        {/* Reservations List */}
        <div className="p-3">
          {selectedDateReservations.length === 0 && selectedDateCalendarEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-gray-400">
              <CalendarX className="w-8 h-8" />
              <span className="text-sm">No reservations</span>
            </div>
          ) : (
            <div className="space-y-1">
              {/* CEO Calendar Events */}
              {selectedDateCalendarEvents.map((event) => {
                const isAllDay = !event.start.includes('T');
                const startTime = parseISOToTime(event.start);
                const endTime = parseISOToTime(event.end);
                return (
                  <button
                    key={event.id}
                    onClick={(e) => handleCalendarEventClick(e, event)}
                    className="w-full text-left bg-gray-50 rounded-md overflow-hidden hover:bg-gray-100 transition-colors flex items-center"
                  >
                    <div
                      className="w-1 h-10 shrink-0"
                      style={{ backgroundColor: CEO_COLOR }}
                    />
                    <div className="flex-1 flex items-center gap-2 px-2 py-1.5 min-w-0">
                      <span className="text-xs text-gray-500 shrink-0 w-[90px]">
                        {isAllDay ? '종일' : `${startTime}-${endTime}`}
                      </span>
                      <span className="text-xs font-medium shrink-0" style={{ color: CEO_COLOR }}>
                        CEO
                      </span>
                      <span className="text-xs text-gray-900 truncate flex-1">
                        {event.title}
                      </span>
                    </div>
                  </button>
                );
              })}
              {/* Reservations */}
              {selectedDateReservations.map((reservation) => {
                const colorIndex = getRoomColorIndex(reservation.room_id);
                const color = getRoomColor(colorIndex);
                const roomName = getRoomName(reservation.room_id);

                return (
                  <button
                    key={reservation.id}
                    onClick={() => onReservationSelect(reservation)}
                    className="w-full text-left bg-gray-50 rounded-md overflow-hidden hover:bg-gray-100 transition-colors flex items-center"
                  >
                    <div
                      className="w-1 h-10 shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1 flex items-center gap-2 px-2 py-1.5 min-w-0">
                      <span className="text-xs text-gray-500 shrink-0 w-[90px]">
                        {normalizeTime(reservation.start_time)}-{normalizeTime(reservation.end_time)}
                      </span>
                      <span className="text-xs font-medium text-gray-700 shrink-0">
                        {roomName}
                      </span>
                      <span className="text-xs text-gray-900 truncate flex-1">
                        {reservation.purpose}
                      </span>
                      <span className="text-xs text-gray-500 shrink-0 truncate max-w-[80px]">
                        {reservation.booker_name}{reservation.attendees && ` 외 ${reservation.attendees.split(',').length}명`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
