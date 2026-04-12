import { useMemo, useState } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { getRoomColor, CEO_COLOR } from '../../lib/theme';
import { isHoliday } from '../../lib/holidays';
import { ReservationDetail } from '../reservation/ReservationDetail';
import { CalendarEventDetail } from './CalendarEventDetail';
import { useReservations } from '../../hooks/useReservations';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { TIME_SLOTS, parseTimeToMinutes } from '../../lib/constants';
import { Loading } from '../../components/ui/loading';
import type { Room, Reservation, CalendarEvent } from '../../types';

interface WeekViewProps {
  selectedDate: Date;
  rooms: Room[];
  visibleRoomIds: Set<string>;
  onDateClick: (date: Date) => void;
  onNavigateToDay?: (date: string) => void;
  ceoVisible?: boolean;
}

const ROW_HEIGHT = 40; // 30분 = 40px

export function WeekView({
  selectedDate,
  rooms,
  visibleRoomIds,
  onDateClick,
  onNavigateToDay,
  ceoVisible = true,
}: WeekViewProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [calendarEventDetailOpen, setCalendarEventDetailOpen] = useState(false);
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState<CalendarEvent | null>(null);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const startDate = format(weekDays[0], 'yyyy-MM-dd');
  const endDate = format(weekDays[6], 'yyyy-MM-dd');

  const queryParams = useMemo(
    () => ({
      start_date: startDate,
      end_date: endDate,
    }),
    [startDate, endDate]
  );

  const { reservations, loading: reservationsLoading, refetch } = useReservations(queryParams);
  const { events: calendarEvents, loading: eventsLoading, refetch: refetchEvents } = useCalendarEvents(startDate, endDate);

  useAutoRefresh(refetch);
  useAutoRefresh(refetchEvents);

  // Get reservations for a specific date
  const getReservationsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const list = Array.isArray(reservations) ? reservations : [];
    return list.filter(
      (r) =>
        visibleRoomIds.has(r.room_id) &&
        r.status === 'reserved' &&
        r.reservation_date === dateStr
    );
  };

  // Parse ISO datetime to date string (YYYY-MM-DD)
  const parseISOToDate = (isoString: string): string => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Check if event has specific time (not all-day event)
  const hasTime = (isoString: string): boolean => {
    return isoString.includes('T');
  };

  // Parse ISO datetime to time string (HH:mm)
  const parseISOToTime = (isoString: string): string => {
    if (!hasTime(isoString)) {
      return '08:00';
    }
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Parse ISO end time (for all-day events, return 19:00)
  const parseISOToEndTime = (isoString: string): string => {
    if (!hasTime(isoString)) {
      return '19:00';
    }
    return parseISOToTime(isoString);
  };

  // Get calendar events for a specific date
  const getCalendarEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return calendarEvents.filter((event) => parseISOToDate(event.start) === dateStr);
  };

  // Handle calendar event click
  const handleCalendarEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    setSelectedCalendarEvent(event);
    setCalendarEventDetailOpen(true);
  };

  // Handle cell click - navigate to day view
  const handleCellClick = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    onNavigateToDay?.(dateStr);
  };

  const handleReservationClick = (e: React.MouseEvent, reservation: Reservation) => {
    e.stopPropagation();
    setSelectedReservation(reservation);
    setDetailOpen(true);
  };

  const handleDetailUpdate = () => {
    refetch();
  };

  const today = new Date();

  const getRoomIndex = (roomId: string) => {
    return rooms.findIndex((r) => r.id === roomId);
  };

  // 19:00은 종료 시간 참조용으로만 사용, 시간표에는 18:30까지 표시
  const displaySlots = TIME_SLOTS.slice(0, -1);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Time grid with sticky header */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {(reservationsLoading || eventsLoading) ? (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <Loading size="md" text="예약 정보를 불러오는 중..." />
          </div>
        ) : (
        <table className="w-full h-full table-fixed border-collapse" style={{ minWidth: '700px' }}>
          <thead className="sticky top-0 z-10 bg-white">
            <tr>
              <th className="w-[50px] md:w-[60px] min-w-[50px] md:min-w-[60px] max-w-[50px] md:max-w-[60px] border-r border-b border-[#DADCE0]" />
              {weekDays.map((day, index) => (
                <th
                  key={index}
                  onClick={() => onDateClick(day)}
                  className={cn(
                    'text-center py-1.5 md:py-2 border-r border-b border-[#DADCE0] last:border-r-0 cursor-pointer hover:bg-[#F1F3F4] font-normal',
                    isSameDay(day, today) && 'bg-blue-50'
                  )}
                >
                  <div
                    className={cn(
                      'text-xs font-normal',
                      (index === 0 || isHoliday(day)) && 'text-[#D93025]',
                      index === 6 && !isHoliday(day) && 'text-[#1A73E8]',
                      index !== 0 && index !== 6 && !isHoliday(day) && 'text-[#5F6368]'
                    )}
                  >
                    {format(day, 'EEE', { locale: ko })}
                  </div>
                  <div
                    className={cn(
                      'text-lg font-semibold mt-0.5 md:mt-1',
                      isSameDay(day, today) &&
                        'w-6 h-6 md:w-8 md:h-8 mx-auto rounded-full bg-[#1A73E8] text-white flex items-center justify-center'
                    )}
                  >
                    {format(day, 'd')}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displaySlots.map((time, index) => {
              const slotMinutes = parseTimeToMinutes(time);
              const isThickBorder = time === '12:00' || time === '18:00';

              return (
                <tr key={time}>
                  {/* Time label */}
                  <td
                    className={cn(
                      "w-[50px] md:w-[60px] min-w-[50px] md:min-w-[60px] max-w-[50px] md:max-w-[60px] border-r border-[#DADCE0] px-1.5 md:px-2 py-1 align-top",
                      isThickBorder ? "border-b-2 border-b-gray-400" : "border-b border-[#DADCE0]"
                    )}
                    style={{ height: ROW_HEIGHT }}
                  >
                    <span className="text-xs font-normal text-[#5F6368]">{time}</span>
                  </td>

                  {/* Day cells */}
                  {weekDays.map((day, dayIndex) => {
                    const dayReservations = getReservationsForDate(day);

                    // Find reservations that start in this 30-minute slot
                    const reservationsInSlot = dayReservations.filter((r) => {
                      const startMinutes = parseTimeToMinutes(r.start_time);
                      return startMinutes >= slotMinutes && startMinutes < slotMinutes + 30;
                    });

                    return (
                      <td
                        key={dayIndex}
                        onClick={() => handleCellClick(day)}
                        className={cn(
                          'border-r border-[#DADCE0] last:border-r-0 cursor-pointer hover:bg-[#F1F3F4] relative p-0',
                          isThickBorder ? 'border-b-2 border-b-gray-400' : 'border-b border-[#DADCE0]',
                          index % 2 === 0 && 'bg-gray-100',
                          isSameDay(day, today) && 'bg-blue-50/30'
                        )}
                        style={{ height: ROW_HEIGHT }}
                      >
                        {/* Calendar events starting in this 30-minute slot (only if CEO visible) */}
                        {ceoVisible && (() => {
                          const dayEvents = getCalendarEventsForDate(day);
                          return dayEvents.filter((event) => {
                            const eventStartTime = parseISOToTime(event.start);
                            const eventStartMinutes = parseTimeToMinutes(eventStartTime);
                            return eventStartMinutes >= slotMinutes && eventStartMinutes < slotMinutes + 30;
                          }).map((event) => {
                            const eventStartTime = parseISOToTime(event.start);
                            const eventEndTime = parseISOToEndTime(event.end);
                            const eventStartMinutes = parseTimeToMinutes(eventStartTime);
                            const eventEndMinutes = parseTimeToMinutes(eventEndTime);
                            const durationSlots = (eventEndMinutes - eventStartMinutes) / 30;
                            const topOffset = (eventStartMinutes - slotMinutes) / 30;

                            return (
                              <div
                                key={event.id}
                                onClick={(e) => handleCalendarEventClick(e, event)}
                                className="absolute left-0 right-0 py-0.5 text-white text-xs overflow-hidden z-10 cursor-pointer hover:brightness-110 hover:shadow-md"
                                style={{
                                  backgroundColor: CEO_COLOR,
                                  height: `calc(${durationSlots} * ${ROW_HEIGHT}px - 1px)`,
                                  top: `${topOffset * ROW_HEIGHT}px`,
                                }}
                              >
                                <div className="text-sm font-medium truncate">{event.title}</div>
                                {durationSlots >= 2 && (
                                  <div className="text-xs font-normal opacity-70 truncate">
                                    {eventStartTime}
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })()}
                        {/* Reservations starting in this 30-minute slot */}
                        {reservationsInSlot.map((reservation) => {
                          const startMinutes = parseTimeToMinutes(reservation.start_time);
                          const endMinutes = parseTimeToMinutes(reservation.end_time);
                          const durationSlots = (endMinutes - startMinutes) / 30; // 30분 = 1슬롯
                          const topOffset = (startMinutes - slotMinutes) / 30;

                          return (
                            <div
                              key={reservation.id}
                              onClick={(e) => handleReservationClick(e, reservation)}
                              className="absolute left-0 right-0 py-0.5 text-white text-xs overflow-hidden z-10 cursor-pointer hover:opacity-90"
                              style={{
                                backgroundColor: getRoomColor(getRoomIndex(reservation.room_id)),
                                height: `calc(${durationSlots} * ${ROW_HEIGHT}px - 1px)`,
                                top: `${topOffset * ROW_HEIGHT}px`,
                              }}
                            >
                              <div className="text-xs font-medium truncate">
                                {reservation.start_time} - {reservation.end_time}
                              </div>
                              {durationSlots >= 2 && (
                                <div className="text-xs opacity-90 truncate">
                                  {reservation.team?.name || '팀없음'} | {reservation.purpose}
                                </div>
                              )}
                              {durationSlots >= 3 && (
                                <div className="text-xs opacity-80 truncate">
                                  {reservation.room?.name}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        )}
      </div>

      {/* Reservation Detail Dialog */}
      {selectedReservation && (
        <ReservationDetail
          open={detailOpen}
          onClose={() => {
            setDetailOpen(false);
            setSelectedReservation(null);
          }}
          onUpdate={handleDetailUpdate}
          reservation={selectedReservation}
          rooms={rooms}
        />
      )}

      {/* Calendar Event Detail Dialog */}
      <CalendarEventDetail
        open={calendarEventDetailOpen}
        onClose={() => {
          setCalendarEventDetailOpen(false);
          setSelectedCalendarEvent(null);
        }}
        event={selectedCalendarEvent}
      />
    </div>
  );
}
