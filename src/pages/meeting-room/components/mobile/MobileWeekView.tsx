import { useState } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, isSameMonth, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarX, List, LayoutGrid } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getRoomColor, CEO_COLOR } from '../../lib/theme';
import { normalizeTime } from '../../lib/constants';
import { isHoliday } from '../../lib/holidays';
import type { Reservation, Room, CalendarEvent } from '../../types';

interface MobileWeekViewProps {
  selectedDate: Date;
  reservations: Reservation[];
  rooms: Room[];
  calendarEvents?: CalendarEvent[];
  onDateSelect: (date: Date) => void;
  onReservationSelect: (reservation: Reservation) => void;
  onCalendarEventClick?: (event: CalendarEvent) => void;
}

type ViewMode = 'list' | 'grid';

export function MobileWeekView({
  selectedDate,
  reservations,
  rooms,
  calendarEvents = [],
  onDateSelect,
  onReservationSelect,
  onCalendarEventClick,
}: MobileWeekViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('weekViewMode');
      if (saved === 'grid' || saved === 'list') {
        return saved;
      }
    }
    return 'list';
  });

  // viewMode 변경 시 localStorage에 저장
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('weekViewMode', mode);
  };

  // Get week dates
  const weekStartSunday = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekStartMonday = startOfWeek(selectedDate, { weekStartsOn: 1 });

  const listWeekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStartSunday, i));
  const gridWeekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStartMonday, i));

  const getReservationsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return reservations
      .filter(r => r.reservation_date === dateStr && r.status === 'reserved')
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  const getRoomColorIndex = (roomId: string) => {
    const index = rooms.findIndex(r => r.id === roomId);
    return index >= 0 ? index : 0;
  };

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
  const handleCalendarEventClick = (event: CalendarEvent) => {
    onCalendarEventClick?.(event);
  };

  // 미니 달력 렌더링
  const renderMiniCalendar = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      days.push(day);
      day = addDays(day, 1);
    }

    const weeks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    // 현재 주의 시작/끝
    const currentWeekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const currentWeekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });

    const isInCurrentWeek = (date: Date) => {
      return date >= currentWeekStart && date <= currentWeekEnd;
    };

    return (
      <div className="bg-white rounded-lg border border-gray-100 p-2 h-full flex flex-col">
        <div className="text-center text-xs font-semibold text-gray-700 mb-2">
          {format(selectedDate, 'yyyy년 M월', { locale: ko })}
        </div>
        <div className="flex-1 grid grid-cols-7 grid-rows-[auto_repeat(6,1fr)] gap-0.5">
          {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
            <div key={d} className={cn(
              'text-center font-medium text-[10px] py-1',
              i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
            )}>
              {d}
            </div>
          ))}
          {weeks.map((week, wi) => (
            week.map((date, di) => {
              const inCurrentWeek = isInCurrentWeek(date);
              const inMonth = isSameMonth(date, selectedDate);
              const isDateToday = isToday(date);
              const isSunday = di === 0;
              const isSaturday = di === 6;
              const isHolidayDate = isHoliday(date);
              return (
                <div
                  key={`${wi}-${di}`}
                  className={cn(
                    'flex items-center justify-center text-[11px] rounded-sm',
                    !inMonth && 'text-gray-300',
                    inMonth && !inCurrentWeek && 'text-gray-600',
                    inMonth && !inCurrentWeek && (isSunday || isHolidayDate) && 'text-red-400',
                    inMonth && !inCurrentWeek && isSaturday && !isHolidayDate && 'text-blue-400',
                    inCurrentWeek && 'bg-blue-100 text-blue-700 font-semibold',
                    inCurrentWeek && (isSunday || isHolidayDate) && 'text-red-500',
                    inCurrentWeek && isSaturday && !isHolidayDate && 'text-blue-500',
                    isDateToday && 'bg-blue-500 text-white rounded-full'
                  )}
                >
                  {format(date, 'd')}
                </div>
              );
            })
          ))}
        </div>
      </div>
    );
  };

  // Grid View의 날짜 셀 렌더링
  const renderGridDayCell = (date: Date, dayIndex: number) => {
    const dateReservations = getReservationsForDate(date);
    const dateCalendarEvents = getCalendarEventsForDate(date);
    const today = isToday(date);
    const isSunday = dayIndex === 6;
    const isSaturday = dayIndex === 5;
    const isHolidayDate = isHoliday(date);
    const totalCount = dateReservations.length + dateCalendarEvents.length;

    return (
      <div
        key={date.toISOString()}
        className={cn(
          'bg-white rounded-lg border overflow-hidden',
          today ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-100'
        )}
      >
        <button
          onClick={() => onDateSelect(date)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 border-b transition-colors',
            today ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'
          )}
        >
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-base font-bold',
                today && 'bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm',
                !today && (isSunday || isHolidayDate) && 'text-red-500',
                !today && isSaturday && !isHolidayDate && 'text-blue-500',
                !today && !isSunday && !isSaturday && !isHolidayDate && 'text-gray-900'
              )}
            >
              {format(date, 'd')}
            </span>
            <span className={cn(
              'text-xs font-medium',
              (isSunday || isHolidayDate) ? 'text-red-500' : isSaturday ? 'text-blue-500' : 'text-gray-500'
            )}>
              {format(date, 'EEE', { locale: ko })}
            </span>
          </div>
          {totalCount > 0 && (
            <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600">
              {totalCount}
            </span>
          )}
        </button>

        <div className="p-2 min-h-[140px]">
          {totalCount === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[120px] text-gray-300">
              <CalendarX className="w-5 h-5" />
            </div>
          ) : (
            <div className="space-y-px">
              {/* CEO Calendar Events */}
              {dateCalendarEvents.slice(0, 2).map((event) => {
                const startTime = parseISOToTime(event.start);
                return (
                  <button
                    key={event.id}
                    onClick={() => handleCalendarEventClick(event)}
                    className="w-full text-left text-[10px] leading-tight truncate rounded px-1.5 py-1 text-white font-medium hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: CEO_COLOR }}
                    title={`${startTime} ${event.title}`}
                  >
                    {startTime} {event.title}
                  </button>
                );
              })}
              {/* Reservations */}
              {dateReservations.slice(0, 5 - Math.min(dateCalendarEvents.length, 2)).map((reservation) => {
                const colorIndex = getRoomColorIndex(reservation.room_id);
                const color = getRoomColor(colorIndex);
                return (
                  <button
                    key={reservation.id}
                    onClick={() => onReservationSelect(reservation)}
                    className="w-full text-left text-[10px] leading-tight truncate rounded px-1.5 py-1 text-white font-medium hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: color }}
                    title={`${normalizeTime(reservation.start_time)} ${reservation.purpose}`}
                  >
                    {normalizeTime(reservation.start_time)} {reservation.purpose}
                  </button>
                );
              })}
              {totalCount > 5 && (
                <div className="text-[10px] text-gray-500 text-center">
                  +{totalCount - 5}건
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Grid View 렌더링
  const renderGridView = () => (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {renderMiniCalendar()}
        {renderGridDayCell(gridWeekDates[0], 0)}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {renderGridDayCell(gridWeekDates[1], 1)}
        {renderGridDayCell(gridWeekDates[2], 2)}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {renderGridDayCell(gridWeekDates[3], 3)}
        {renderGridDayCell(gridWeekDates[4], 4)}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {renderGridDayCell(gridWeekDates[5], 5)}
        {renderGridDayCell(gridWeekDates[6], 6)}
      </div>
    </div>
  );

  // List View 렌더링
  const renderListView = () => (
    <div className="space-y-4">
      {listWeekDates.map((date, index) => {
        const dateReservations = getReservationsForDate(date);
        const dateCalendarEvents = getCalendarEventsForDate(date);
        const today = isToday(date);
        const isSunday = index === 0;
        const isSaturday = index === 6;
        const isHolidayDate = isHoliday(date);
        const totalCount = dateReservations.length + dateCalendarEvents.length;

        return (
          <div
            key={date.toISOString()}
            className={cn(
              'bg-white rounded-lg border overflow-hidden transition-all',
              today ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-100'
            )}
          >
            <button
              onClick={() => onDateSelect(date)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 border-b transition-colors',
                today ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'text-lg font-bold',
                    today && 'bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center',
                    !today && (isSunday || isHolidayDate) && 'text-red-500',
                    !today && isSaturday && !isHolidayDate && 'text-blue-500',
                    !today && !isSunday && !isSaturday && !isHolidayDate && 'text-gray-900'
                  )}
                >
                  {format(date, 'd')}
                </span>
                <span className={cn(
                  'text-sm font-medium',
                  (isSunday || isHolidayDate) ? 'text-red-500' : isSaturday ? 'text-blue-500' : 'text-gray-500'
                )}>
                  {format(date, 'EEE', { locale: ko })}
                </span>
              </div>
              <span className={cn(
                'text-sm font-medium px-2 py-0.5 rounded-full',
                totalCount > 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
              )}>
                {totalCount}건
              </span>
            </button>

            <div className="p-3">
              {totalCount === 0 ? (
                <div className="flex items-center justify-center gap-2 py-4 text-gray-400">
                  <CalendarX className="w-4 h-4" />
                  <span className="text-sm">예약 없음</span>
                </div>
              ) : (
                <div className="space-y-1">
                  {/* CEO Calendar Events */}
                  {dateCalendarEvents.map((event) => {
                    const isAllDay = !event.start.includes('T');
                    const startTime = parseISOToTime(event.start);
                    const endTime = parseISOToTime(event.end);
                    return (
                      <button
                        key={event.id}
                        onClick={() => handleCalendarEventClick(event)}
                        className="w-full text-left bg-gray-50 rounded-md overflow-hidden hover:bg-gray-100 transition-colors flex items-center"
                      >
                        <div className="w-1 h-10 shrink-0" style={{ backgroundColor: CEO_COLOR }} />
                        <div className="flex-1 flex items-center gap-2 px-2 py-1.5 min-w-0">
                          <span className="text-xs text-gray-500 shrink-0 w-[90px]">
                            {isAllDay ? '종일' : `${startTime}-${endTime}`}
                          </span>
                          <span className="text-xs font-medium shrink-0" style={{ color: CEO_COLOR }}>CEO</span>
                          <span className="text-xs text-gray-900 truncate flex-1">{event.title}</span>
                        </div>
                      </button>
                    );
                  })}
                  {/* Reservations */}
                  {dateReservations.map((reservation) => {
                    const colorIndex = getRoomColorIndex(reservation.room_id);
                    const color = getRoomColor(colorIndex);
                    const roomName = getRoomName(reservation.room_id);
                    return (
                      <button
                        key={reservation.id}
                        onClick={() => onReservationSelect(reservation)}
                        className="w-full text-left bg-gray-50 rounded-md overflow-hidden hover:bg-gray-100 transition-colors flex items-center"
                      >
                        <div className="w-1 h-10 shrink-0" style={{ backgroundColor: color }} />
                        <div className="flex-1 flex items-center gap-2 px-2 py-1.5 min-w-0">
                          <span className="text-xs text-gray-500 shrink-0 w-[90px]">
                            {normalizeTime(reservation.start_time)}-{normalizeTime(reservation.end_time)}
                          </span>
                          <span className="text-xs font-medium text-gray-700 shrink-0">{roomName}</span>
                          <span className="text-xs text-gray-900 truncate flex-1">{reservation.purpose}</span>
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
        );
      })}
    </div>
  );

  return (
    <div className="space-y-3">
      {/* View Mode Toggle */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
          <button
            onClick={() => handleViewModeChange('list')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <List className="w-3.5 h-3.5" />
            리스트
          </button>
          <button
            onClick={() => handleViewModeChange('grid')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            그리드
          </button>
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'list' ? renderListView() : renderGridView()}
    </div>
  );
}
