import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { CalendarHeader } from '../components/calendar/CalendarHeader';
import { CalendarSidebar } from '../components/calendar/CalendarSidebar';
import { CalendarGrid } from '../components/calendar/CalendarGrid';
import { DayView } from '../components/calendar/DayView';
import { WeekView } from '../components/calendar/WeekView';
import { CalendarEventDetail } from '../components/calendar/CalendarEventDetail';
import { Loading } from '../components/ui/loading';
import { useRooms } from '../hooks/useRooms';
import { useReservations } from '../hooks/useReservations';
import { useCalendarEvents } from '../hooks/useCalendarEvents';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import type { CalendarEvent } from '../types';

export type ViewMode = 'day' | 'week' | 'month';

export function CalendarView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const today = new Date();

  // Parse URL params
  const dateParam = searchParams.get('date');
  const viewParam = searchParams.get('view') as ViewMode | null;

  const initialDate = dateParam ? new Date(dateParam) : today;
  const initialView: ViewMode = viewParam && ['day', 'week', 'month'].includes(viewParam)
    ? viewParam
    : 'day';

  const [year, setYear] = useState(initialDate.getFullYear());
  const [month, setMonth] = useState(initialDate.getMonth() + 1);
  const [visibleRoomIds, setVisibleRoomIds] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [ceoVisible, setCeoVisible] = useState(true);
  const [isRoomsInitialized, setIsRoomsInitialized] = useState(false);
  const [calendarEventDetailOpen, setCalendarEventDetailOpen] = useState(false);
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState<CalendarEvent | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const { rooms, loading: roomsLoading } = useRooms();

  // Initialize visible rooms when rooms load (only once)
  useEffect(() => {
    if (rooms.length > 0 && !isRoomsInitialized) {
      setVisibleRoomIds(new Set(rooms.map((r) => r.id)));
      setIsRoomsInitialized(true);
    }
  }, [rooms, isRoomsInitialized]);

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    params.set('date', dateStr);
    params.set('view', viewMode);
    setSearchParams(params, { replace: true });
  }, [selectedDate, viewMode, setSearchParams]);

  // Only calculate query params when in month view
  // DayView and WeekView handle their own data fetching internally
  const queryParams = useMemo(() => {
    if (viewMode !== 'month') {
      // Return empty params - DayView/WeekView fetch their own data
      return {};
    }

    // Month view: fetch entire month
    const monthStart = `${year}-${month.toString().padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const monthEnd = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;

    return {
      start_date: monthStart,
      end_date: monthEnd,
    };
  }, [viewMode, year, month]);

  // Only fetch when we have valid params (month view)
  const { reservations, loading: reservationsLoading, refetch: refetchReservations } = useReservations(queryParams);

  // Fetch calendar events for month view
  const monthStart = viewMode === 'month' ? `${year}-${month.toString().padStart(2, '0')}-01` : null;
  const lastDay = viewMode === 'month' ? new Date(year, month, 0).getDate() : 0;
  const monthEnd = viewMode === 'month' ? `${year}-${month.toString().padStart(2, '0')}-${lastDay}` : null;
  const { events: calendarEvents, loading: calendarEventsLoading, refetch: refetchCalendarEvents } = useCalendarEvents(monthStart, monthEnd);

  useAutoRefresh(refetchReservations);
  useAutoRefresh(refetchCalendarEvents);

  const handlePrevPeriod = () => {
    if (viewMode === 'day') {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() - 1);
      setSelectedDate(newDate);
      setYear(newDate.getFullYear());
      setMonth(newDate.getMonth() + 1);
    } else if (viewMode === 'week') {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() - 7);
      setSelectedDate(newDate);
      setYear(newDate.getFullYear());
      setMonth(newDate.getMonth() + 1);
    } else {
      if (month === 1) {
        setYear(year - 1);
        setMonth(12);
      } else {
        setMonth(month - 1);
      }
    }
  };

  const handleNextPeriod = () => {
    if (viewMode === 'day') {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() + 1);
      setSelectedDate(newDate);
      setYear(newDate.getFullYear());
      setMonth(newDate.getMonth() + 1);
    } else if (viewMode === 'week') {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() + 7);
      setSelectedDate(newDate);
      setYear(newDate.getFullYear());
      setMonth(newDate.getMonth() + 1);
    } else {
      if (month === 12) {
        setYear(year + 1);
        setMonth(1);
      } else {
        setMonth(month + 1);
      }
    }
  };

  const handleToday = () => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
    setSelectedDate(now);
  };

  const handleDateClick = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    setSelectedDate(dateObj);
    setYear(dateObj.getFullYear());
    setMonth(dateObj.getMonth() + 1);
    setViewMode('day');
  };

  const handleRoomToggle = (roomId: string) => {
    setVisibleRoomIds((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) {
        next.delete(roomId);
      } else {
        next.add(roomId);
      }
      return next;
    });
  };

  const handleCeoToggle = () => {
    setCeoVisible((prev) => !prev);
  };

  // Navigate to day view instead of opening create dialog
  const handleNavigateToDay = (date: string) => {
    const dateObj = new Date(date);
    setSelectedDate(dateObj);
    setYear(dateObj.getFullYear());
    setMonth(dateObj.getMonth() + 1);
    setViewMode('day');
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const handleCalendarEventClick = (event: CalendarEvent) => {
    setSelectedCalendarEvent(event);
    setCalendarEventDetailOpen(true);
  };

  // Show loading state while data is being fetched
  if (roomsLoading || (viewMode === 'month' && (reservationsLoading || calendarEventsLoading))) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  const renderMainContent = () => {
    switch (viewMode) {
      case 'day':
        return (
          <DayView
            selectedDate={selectedDate}
            rooms={rooms}
            visibleRoomIds={visibleRoomIds}
            ceoVisible={ceoVisible}
          />
        );
      case 'week':
        return (
          <WeekView
            selectedDate={selectedDate}
            rooms={rooms}
            visibleRoomIds={visibleRoomIds}
            onDateClick={handleDateClick}
            onNavigateToDay={handleNavigateToDay}
            ceoVisible={ceoVisible}
          />
        );
      case 'month':
      default:
        return (
          <CalendarGrid
            year={year}
            month={month}
            reservations={reservations}
            calendarEvents={calendarEvents}
            rooms={rooms}
            visibleRoomIds={visibleRoomIds}
            onDateClick={handleDateClick}
            onNavigateToDay={handleNavigateToDay}
            onCalendarEventClick={handleCalendarEventClick}
            ceoVisible={ceoVisible}
          />
        );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <CalendarHeader
        year={year}
        month={month}
        selectedDate={selectedDate}
        viewMode={viewMode}
        onPrevPeriod={handlePrevPeriod}
        onNextPeriod={handleNextPeriod}
        onToday={handleToday}
        onViewModeChange={handleViewModeChange}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          sidebarVisible
            ? "w-48 md:w-56 lg:w-64"
            : "w-0"
        )}>
          <div className={cn(
            "w-48 md:w-56 lg:w-64 h-full transition-opacity duration-300",
            sidebarVisible ? "opacity-100" : "opacity-0"
          )}>
            <CalendarSidebar
              rooms={rooms}
              visibleRoomIds={visibleRoomIds}
              onRoomToggle={handleRoomToggle}
              ceoVisible={ceoVisible}
              onCeoToggle={handleCeoToggle}
            />
          </div>
        </div>

        {/* Main View */}
        <div className="flex-1 flex flex-col min-h-0 relative border-l border-[#DADCE0]">
          {/* 사이드바 토글 버튼 */}
          <button
            type="button"
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 w-6 h-6 bg-white border border-[#DADCE0] rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
            title={sidebarVisible ? '사이드바 숨기기' : '사이드바 보기'}
          >
            {sidebarVisible ? (
              <ChevronLeft className="w-4 h-4 text-[#5F6368]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[#5F6368]" />
            )}
          </button>
          {renderMainContent()}
        </div>
      </div>

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
