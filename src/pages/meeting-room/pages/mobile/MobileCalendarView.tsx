import { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Loader2, ChevronLeft, ChevronRight, Plus, Clock, Calendar } from 'lucide-react';
import { MobileHeader } from '../../components/mobile/MobileHeader';
import { MobileBottomNav } from '../../components/mobile/MobileBottomNav';
import { MobileDatePicker } from '../../components/mobile/MobileDatePicker';
import { MobileRoomCard } from '../../components/mobile/MobileRoomCard';
import { MobileWeekView } from '../../components/mobile/MobileWeekView';
import { MobileMonthView } from '../../components/mobile/MobileMonthView';
import { MobileReservationModal } from '../../components/mobile/MobileReservationModal';
import { ReservationDetail } from '../../components/reservation/ReservationDetail';
import { CalendarEventDetail } from '../../components/calendar/CalendarEventDetail';
import { useRooms } from '../../hooks/useRooms';
import { useReservations } from '../../hooks/useReservations';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';
import { cn } from '../../lib/utils';
import { CEO_COLOR } from '../../lib/theme';
import type { Reservation, CalendarEvent } from '../../types';

type ViewMode = 'day' | 'week' | 'month';

export function MobileCalendarView() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [selectedRoomIdForReserve, setSelectedRoomIdForReserve] = useState<string | undefined>(undefined);
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState<CalendarEvent | null>(null);
  const [calendarEventDetailOpen, setCalendarEventDetailOpen] = useState(false);

  const { rooms, loading: roomsLoading } = useRooms();

  // Calculate date range based on view mode
  const dateRange = useMemo(() => {
    if (viewMode === 'day') {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      return { start: dateStr, end: dateStr };
    } else if (viewMode === 'week') {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
      return {
        start: format(weekStart, 'yyyy-MM-dd'),
        end: format(weekEnd, 'yyyy-MM-dd'),
      };
    } else {
      const monthStart = startOfMonth(selectedDate);
      const monthEnd = endOfMonth(selectedDate);
      return {
        start: format(monthStart, 'yyyy-MM-dd'),
        end: format(monthEnd, 'yyyy-MM-dd'),
      };
    }
  }, [selectedDate, viewMode]);

  const { reservations, loading: reservationsLoading, refetch } = useReservations(
    viewMode === 'day'
      ? { date: dateRange.start }
      : { start_date: dateRange.start, end_date: dateRange.end }
  );

  // CEO calendar events
  const { events: calendarEvents, loading: calendarEventsLoading } = useCalendarEvents(
    dateRange.start,
    dateRange.end
  );

  const loading = roomsLoading || reservationsLoading || calendarEventsLoading;

  const reservationsByRoom = useMemo(() => {
    const map = new Map<string, typeof reservations>();
    rooms.forEach(room => {
      map.set(room.id, reservations.filter(r => r.room_id === room.id));
    });
    return map;
  }, [rooms, reservations]);

  // Filter reservations for selected date in day view
  const dayReservationsByRoom = useMemo(() => {
    if (viewMode !== 'day') return reservationsByRoom;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const map = new Map<string, typeof reservations>();
    rooms.forEach(room => {
      map.set(
        room.id,
        reservations.filter(r => r.room_id === room.id && r.reservation_date === dateStr)
      );
    });
    return map;
  }, [rooms, reservations, selectedDate, viewMode, reservationsByRoom]);

  const handleFabClick = () => {
    setSelectedRoomIdForReserve(undefined);
    setReserveModalOpen(true);
  };

  const handleReserveModalClose = () => {
    setReserveModalOpen(false);
    setSelectedRoomIdForReserve(undefined);
  };

  const handleReserveSuccess = () => {
    refetch();
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (viewMode !== 'day') {
      setViewMode('day');
    }
  };

  const handleReservationSelect = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setDetailOpen(true);
  };

  const handleDetailClose = () => {
    setDetailOpen(false);
    setSelectedReservation(null);
  };

  const handleDetailUpdate = () => {
    refetch();
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
    setSelectedCalendarEvent(event);
    setCalendarEventDetailOpen(true);
  };

  const handleCalendarEventDetailClose = () => {
    setCalendarEventDetailOpen(false);
    setSelectedCalendarEvent(null);
  };

  // Get calendar events for selected date in day view
  const dayCalendarEvents = useMemo(() => {
    if (viewMode !== 'day') return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return calendarEvents.filter((event) => {
      const eventDate = event.start.split('T')[0];
      return eventDate === dateStr;
    });
  }, [calendarEvents, selectedDate, viewMode]);

  const handlePrevPeriod = () => {
    if (viewMode === 'week') {
      setSelectedDate(subWeeks(selectedDate, 1));
    } else if (viewMode === 'month') {
      setSelectedDate(subMonths(selectedDate, 1));
    }
  };

  const handleNextPeriod = () => {
    if (viewMode === 'week') {
      setSelectedDate(addWeeks(selectedDate, 1));
    } else if (viewMode === 'month') {
      setSelectedDate(addMonths(selectedDate, 1));
    }
  };

  const getPeriodLabel = () => {
    if (viewMode === 'week') {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
      return `${format(weekStart, 'M/d')} - ${format(weekEnd, 'M/d')}`;
    }
    return format(selectedDate, 'yyyy년 M월', { locale: ko });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileHeader selectedDate={selectedDate} />

      {/* View Mode Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          {(['day', 'week', 'month'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                'flex-1 py-3 text-sm font-medium transition-colors',
                viewMode === mode
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {mode === 'day' ? '일간' : mode === 'week' ? '주간' : '월간'}
            </button>
          ))}
        </div>
      </div>

      {/* Period Navigation for Week/Month views */}
      {viewMode !== 'day' && (
        <div className="bg-white border-b border-gray-200 py-3 px-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevPeriod}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-base font-semibold text-gray-900">
              {getPeriodLabel()}
            </span>
            <button
              onClick={handleNextPeriod}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Date Picker for Day view */}
      {viewMode === 'day' && (
        <MobileDatePicker
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      )}

      <main className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : viewMode === 'day' ? (
          // Day View - Room Cards + CEO Calendar
          rooms.length === 0 && dayCalendarEvents.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">No meeting rooms registered</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* CEO Calendar Events Card */}
              {dayCalendarEvents.length > 0 && (
                <div className="w-full text-left bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden flex">
                  <div
                    className="w-1.5 shrink-0"
                    style={{ backgroundColor: CEO_COLOR }}
                  />
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">대표님 일정</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>CEO Calendar</span>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${CEO_COLOR}20`, color: CEO_COLOR }}>
                        {dayCalendarEvents.length}건
                      </span>
                    </div>
                    <div className="space-y-2">
                      {dayCalendarEvents.slice(0, 3).map((event) => {
                        const isAllDay = !event.start.includes('T');
                        const startTime = parseISOToTime(event.start);
                        const endTime = parseISOToTime(event.end);
                        return (
                          <button
                            key={event.id}
                            onClick={() => handleCalendarEventClick(event)}
                            className="w-full flex items-center gap-2 p-2 rounded-lg text-sm hover:opacity-80 transition-colors text-left text-white"
                            style={{ backgroundColor: CEO_COLOR }}
                          >
                            <Clock className="w-4 h-4 shrink-0" />
                            <span className="shrink-0">
                              {isAllDay ? '종일' : `${startTime} - ${endTime}`}
                            </span>
                            <span className="font-medium truncate">
                              {event.title}
                            </span>
                          </button>
                        );
                      })}
                      {dayCalendarEvents.length > 3 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{dayCalendarEvents.length - 3}건 더보기
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* Room Cards */}
              {rooms.map((room, index) => (
                <MobileRoomCard
                  key={room.id}
                  room={room}
                  reservations={dayReservationsByRoom.get(room.id) || []}
                  colorIndex={index}
                  onReservationSelect={handleReservationSelect}
                />
              ))}
            </div>
          )
        ) : viewMode === 'week' ? (
          // Week View
          <MobileWeekView
            selectedDate={selectedDate}
            reservations={reservations}
            rooms={rooms}
            calendarEvents={calendarEvents}
            onDateSelect={handleDateSelect}
            onReservationSelect={handleReservationSelect}
            onCalendarEventClick={handleCalendarEventClick}
          />
        ) : (
          // Month View
          <MobileMonthView
            selectedDate={selectedDate}
            reservations={reservations}
            rooms={rooms}
            calendarEvents={calendarEvents}
            onDateSelect={handleDateSelect}
            onReservationSelect={handleReservationSelect}
            onCalendarEventClick={handleCalendarEventClick}
          />
        )}
      </main>

      {/* FAB Button - hidden when modal is open */}
      {!reserveModalOpen && !detailOpen && !calendarEventDetailOpen && (
        <button
          onClick={handleFabClick}
          className="fixed bottom-20 right-4 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-50 active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      <MobileBottomNav />

      {/* Reservation Modal */}
      <MobileReservationModal
        open={reserveModalOpen}
        onClose={handleReserveModalClose}
        selectedDate={format(selectedDate, 'yyyy-MM-dd')}
        selectedRoomId={selectedRoomIdForReserve}
        onSuccess={handleReserveSuccess}
      />

      {/* Reservation Detail Modal */}
      <ReservationDetail
        open={detailOpen}
        onClose={handleDetailClose}
        onUpdate={handleDetailUpdate}
        reservation={selectedReservation}
        rooms={rooms}
      />

      {/* Calendar Event Detail Modal */}
      <CalendarEventDetail
        open={calendarEventDetailOpen}
        onClose={handleCalendarEventDetailClose}
        event={selectedCalendarEvent}
      />
    </div>
  );
}
