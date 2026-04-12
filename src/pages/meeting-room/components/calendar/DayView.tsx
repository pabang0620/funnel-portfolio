import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Users, MapPin, Check, ChevronDown, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import ReactSelect, { components } from 'react-select';
import type { OptionProps, MenuListProps } from 'react-select';
import { ReservationDetail } from '../reservation/ReservationDetail';
import { CalendarEventDetail } from './CalendarEventDetail';
import { useReservations, useReservationActions } from '../../hooks/useReservations';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { useSlackMembers } from '../../hooks/useSlackMembers';
import { useTeams } from '../../hooks/useTeams';
import { cn, getImageUrl } from '../../lib/utils';
import { getRoomColor, CEO_COLOR } from '../../lib/theme';
import { TIME_SLOTS, TIME_SLOTS_5MIN, parseTimeToMinutes } from '../../lib/constants';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { Card, CardContent } from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Loading } from '../../components/ui/loading';
import type { Room, Reservation, CalendarEvent } from '../../types';

interface DayViewProps {
  selectedDate: Date;
  rooms: Room[];
  visibleRoomIds: Set<string>;
  ceoVisible?: boolean;
}

const ROW_HEIGHT = 40;

// Custom Option component with green checkmark
const CustomOption = (props: OptionProps<{ value: string; label: string }, true>) => {
  const { isSelected } = props;
  return (
    <components.Option {...props}>
      <div className="flex items-center gap-2">
        {isSelected && (
          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
        )}
        <span className={isSelected ? 'font-medium' : ''}>{props.label}</span>
      </div>
    </components.Option>
  );
};

// Custom MenuList component with confirmation button
const CustomMenuList = (
  props: MenuListProps<{ value: string; label: string }, true> & { onClose?: () => void }
) => {
  return (
    <>
      <components.MenuList {...props}>{props.children}</components.MenuList>
      <div className="border-t p-2">
        <Button
          type="button"
          variant="default"
          size="sm"
          className="w-full h-7 text-xs"
          onClick={() => {
            props.onClose?.();
          }}
        >
          확인
        </Button>
      </div>
    </>
  );
};

export function DayView({
  selectedDate,
  rooms,
  visibleRoomIds,
  ceoVisible = true,
}: DayViewProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [calendarEventDetailOpen, setCalendarEventDetailOpen] = useState(false);
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState<CalendarEvent | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [teamId, setTeamId] = useState('');
  const [bookerId, setBookerId] = useState('');
  const [selectedAttendeeIds, setSelectedAttendeeIds] = useState<string[]>([]);
  const [purpose, setPurpose] = useState('');
  const [reservationFormExpanded, setReservationFormExpanded] = useState(true);
  const [roomInfoExpanded, setRoomInfoExpanded] = useState(true);
  const [password, setPassword] = useState('');
  const [rightPanelVisible, setRightPanelVisible] = useState(true);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorTitle, setErrorTitle] = useState('');
  const [suggestedEndTime, setSuggestedEndTime] = useState<string | null>(null);
  const [attendeesMenuOpen, setAttendeesMenuOpen] = useState(false);
  const [isMovingReservation, setIsMovingReservation] = useState(false);
  const [draggedReservation, setDraggedReservation] = useState<Reservation | null>(null);
  const [draggedReservationCopy, setDraggedReservationCopy] = useState<Reservation | null>(null);
  const [dragHoverTime, setDragHoverTime] = useState<string | null>(null);
  const [dragHoverRoom, setDragHoverRoom] = useState<string | null>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [movePassword, setMovePassword] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [newRoomId, setNewRoomId] = useState('');

  const { members: slackMembers } = useSlackMembers();
  const { teams } = useTeams();

  // 시작 시간 수동 변경 시 종료시간 초기화 (셀 클릭으로 설정된 경우 제외)
  useEffect(() => {
    // 셀 클릭이 아닌 수동 변경인 경우에만 종료시간을 초기화
    // 이 로직은 셀 클릭 시 자동 계산된 종료시간을 보존하기 위함
  }, [startTime]);

  // 시작 시간 이후의 종료 시간 옵션 생성 (5분 단위, 최대 19:30까지)
  const endTimeOptions = useMemo(() => {
    if (!startTime) return [];

    const startTotalMinutes = parseTimeToMinutes(startTime);
    const options: string[] = [];

    // 시작 시간 + 5분부터 19:30까지 (5분 단위)
    for (let minutes = startTotalMinutes + 5; minutes <= 19 * 60 + 30; minutes += 5) {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      options.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }

    return options;
  }, [startTime]);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const queryParams = useMemo(
    () => ({
      date: dateStr,
    }),
    [dateStr]
  );

  const { reservations, loading: reservationsLoading, refetch } = useReservations(queryParams);
  const { events: calendarEvents, loading: eventsLoading, refetch: refetchEvents } = useCalendarEvents(dateStr, dateStr);

  useAutoRefresh(refetch);
  useAutoRefresh(refetchEvents);
  const { create, update, loading: createLoading } = useReservationActions();

  // Rooms that can be booked (excludes CEO)
  const bookableRooms = useMemo(() => {
    return rooms.filter((room) => visibleRoomIds.has(room.id));
  }, [rooms, visibleRoomIds]);

  // All visible rooms including CEO for display
  const visibleRooms = useMemo(() => {
    if (ceoVisible) {
      return [
        {
          id: 'ceo-calendar',
          name: 'CEO',
          floor: 'Calendar',
          capacity: undefined,
          image_url: undefined,
        } as unknown as Room,
        ...bookableRooms,
      ];
    }
    return bookableRooms;
  }, [bookableRooms, ceoVisible]);

  useEffect(() => {
    if (bookableRooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(bookableRooms[0].id);
    }
  }, [bookableRooms, selectedRoomId]);

  const getRoomIndex = (roomId: string) => {
    // CEO is always red
    if (roomId === 'ceo-calendar') {
      return -1; // Special case
    }
    return rooms.findIndex((r) => r.id === roomId);
  };

  const getRoomColorForId = (roomId: string) => {
    if (roomId === 'ceo-calendar') {
      return CEO_COLOR;
    }
    return getRoomColor(getRoomIndex(roomId));
  };

  const getReservationsForRoom = (roomId: string): Reservation[] => {
    // CEO calendar returns calendar events as virtual reservations
    if (roomId === 'ceo-calendar') {
      return calendarEvents.map((event) => ({
        id: event.id,
        room_id: 'ceo-calendar',
        reservation_date: dateStr,
        start_time: parseISOToTime(event.start),
        end_time: parseISOToEndTime(event.end),
        purpose: event.title,
        booker_name: event.location || '',
        status: 'reserved' as const,
        team_id: '',
        booker_email: undefined,
        attendees: undefined,
        attendee_emails: undefined,
        password: '',
        created_at: event.start,
        updated_at: event.start,
      } as Reservation));
    }
    const list = Array.isArray(reservations) ? reservations : [];
    return list.filter(
      (r) =>
        r.room_id === roomId &&
        r.status === 'reserved'
    );
  };

  const getReservationAtTime = (roomId: string, time: string): Reservation | undefined => {
    // CEO calendar checks calendar events
    if (roomId === 'ceo-calendar') {
      const timeMinutes = parseTimeToMinutes(time);
      const event = calendarEvents.find((event) => {
        const startTime = parseISOToTime(event.start);
        const endTime = parseISOToEndTime(event.end);
        const startMinutes = parseTimeToMinutes(startTime);
        const endMinutes = parseTimeToMinutes(endTime);
        return startMinutes <= timeMinutes && endMinutes > timeMinutes;
      });
      if (event) {
        return {
          id: event.id,
          room_id: 'ceo-calendar',
          reservation_date: dateStr,
          start_time: parseISOToTime(event.start),
          end_time: parseISOToEndTime(event.end),
          purpose: event.title,
          booker_name: event.location || '',
          status: 'reserved' as const,
          team_id: '',
          booker_email: undefined,
          attendees: undefined,
          attendee_emails: undefined,
          password: '',
          created_at: event.start,
          updated_at: event.start,
        } as Reservation;
      }
      return undefined;
    }
    const list = Array.isArray(reservations) ? reservations : [];
    const timeMinutes = parseTimeToMinutes(time);
    return list.find(
      (r) =>
        r.room_id === roomId &&
        r.status === 'reserved' &&
        parseTimeToMinutes(r.start_time) <= timeMinutes &&
        parseTimeToMinutes(r.end_time) > timeMinutes
    );
  };

  // Check if event has specific time (not all-day event)
  const hasTime = (isoString: string): boolean => {
    return isoString.includes('T');
  };

  // Parse ISO datetime to time string (HH:mm)
  const parseISOToTime = (isoString: string): string => {
    // All-day events (no time) - show as 08:00-19:00
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

  // Handle calendar event click
  const handleCalendarEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    setSelectedCalendarEvent(event);
    setCalendarEventDetailOpen(true);
  };

  const handleCellClick = (
    _room: Room,
    slotTime: string,
    roomId: string
  ) => {
    const reservation = getReservationAtTime(roomId, slotTime);
    if (reservation) {
      // 예약이 있으면 상세 보기
      setSelectedReservation(reservation);
      setDetailOpen(true);
    } else {
      // 빈 셀 클릭 시 해당 시간과 회의실 선택
      setSelectedRoomId(roomId);
      setStartTime(slotTime);

      // 기본값: 1시간 예약
      const clickedMinutes = parseTimeToMinutes(slotTime);
      const defaultEndMinutes = clickedMinutes + 60;
      const defaultEndHours = Math.floor(defaultEndMinutes / 60);
      const defaultEndMins = defaultEndMinutes % 60;
      let calculatedEndTime = `${String(defaultEndHours).padStart(2, '0')}:${String(defaultEndMins).padStart(2, '0')}`;

      const roomReservations = getReservationsForRoom(roomId);

      // 클릭한 시간 이후의 예약들 찾기
      const futureReservations = roomReservations
        .filter(r => parseTimeToMinutes(r.start_time) > clickedMinutes)
        .sort((a, b) => parseTimeToMinutes(a.start_time) - parseTimeToMinutes(b.start_time));

      // 1시간 이내에 다음 예약이 있으면, 그 시작 시간을 종료 시간으로 설정
      if (futureReservations.length > 0) {
        const nextReservationMinutes = parseTimeToMinutes(futureReservations[0].start_time);

        if (nextReservationMinutes <= defaultEndMinutes) {
          // 30분 단위로 내림 (예: 14:45 → 14:30, 14:20 → 14:00)
          const roundedMinutes = Math.floor(nextReservationMinutes / 30) * 30;
          const hours = Math.floor(roundedMinutes / 60);
          const mins = roundedMinutes % 60;
          calculatedEndTime = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
        }
      }

      // 19:30을 초과하지 않도록
      const maxEndMinutes = 19 * 60 + 30;
      const calculatedEndMinutes = parseTimeToMinutes(calculatedEndTime);
      if (calculatedEndMinutes > maxEndMinutes) {
        calculatedEndTime = '19:30';
      }

      // 최소 30분 보장
      const finalEndMinutes = parseTimeToMinutes(calculatedEndTime);
      if (finalEndMinutes - clickedMinutes < 30) {
        // 30분 미만이면 30분으로 설정
        const endMinutes = clickedMinutes + 30;
        const endHours = Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;
        calculatedEndTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
      }

      setEndTime(calculatedEndTime);
    }
  };

  const handleReservationClick = (e: React.MouseEvent, reservation: Reservation) => {
    e.stopPropagation();
    setSelectedReservation(reservation);
    setDetailOpen(true);
  };

  const handleDetailUpdate = () => {
    refetch();
  };

  const handleDrop = (dropTime: string, roomId: string) => {
    if (!draggedReservation) return;

    const dropMinutes = parseTimeToMinutes(dropTime);
    const originalStartMinutes = parseTimeToMinutes(draggedReservation.start_time);
    const originalEndMinutes = parseTimeToMinutes(draggedReservation.end_time);
    const duration = originalEndMinutes - originalStartMinutes;

    // 새로운 종료 시간 계산
    const newEndMinutes = dropMinutes + duration;
    const newEndHours = Math.floor(newEndMinutes / 60);
    const newEndMins = newEndMinutes % 60;
    const calculatedNewEndTime = `${String(newEndHours).padStart(2, '0')}:${String(newEndMins).padStart(2, '0')}`;

    // 19:30을 넘지 않도록 체크
    if (newEndMinutes > 19 * 60 + 30) {
      setErrorTitle('시간 이동 불가');
      setErrorMessage('예약 종료 시간이 19:30을 초과할 수 없습니다.');
      setSuggestedEndTime(null);
      setErrorModalOpen(true);
      return;
    }

    // 같은 시간과 같은 회의실이면 무시
    if (dropTime === draggedReservation.start_time && roomId === draggedReservation.room_id) {
      return;
    }

    setNewStartTime(dropTime);
    setNewEndTime(calculatedNewEndTime);
    setNewRoomId(roomId);
    setIsMovingReservation(true);
    setPasswordModalOpen(true);
  };

  const handlePasswordSubmit = async () => {
    if (!draggedReservationCopy || !movePassword) return;

    try {
      const updates: any = {
        start_time: newStartTime,
        end_time: newEndTime,
        password: movePassword,
      };

      // 회의실이 변경된 경우에만 room_id 추가
      if (newRoomId !== draggedReservationCopy.room_id) {
        updates.room_id = newRoomId;
      }

      await update(draggedReservationCopy.id, updates);

      setPasswordModalOpen(false);
      setMovePassword('');
      setDraggedReservationCopy(null);
      setIsMovingReservation(false);
      refetch();
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('already') || error.message.includes('예약')) {
          // 충돌 시간 파싱하여 제안
          const timeMatch = error.message.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
          if (timeMatch) {
            const conflictStart = timeMatch[1];
            if (conflictStart > newStartTime) {
              setSuggestedEndTime(conflictStart);
              setErrorTitle('예약 시간 충돌');
              setErrorMessage(
                `${error.message}\n\n대신 ${newStartTime} ~ ${conflictStart}로 변경하시겠습니까?`
              );
              setPasswordModalOpen(false);
              setErrorModalOpen(true);
              return;
            }
          }
        }
        setErrorTitle('시간 이동 실패');
        setErrorMessage(error.message);
        setSuggestedEndTime(null);
        setPasswordModalOpen(false);
        setErrorModalOpen(true);
      }
    }
  };

  const selectedBooker = slackMembers.find(m => m.id === bookerId);
  const selectedAttendees = slackMembers.filter(m => selectedAttendeeIds.includes(m.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await create({
        room_id: selectedRoomId,
        team_id: teamId,
        booker_name: selectedBooker?.real_name || '',
        booker_email: selectedBooker?.email,
        purpose,
        reservation_date: dateStr,
        start_time: startTime,
        end_time: endTime,
        password,
        attendees: selectedAttendees.map(a => a.real_name).join(', ') || undefined,
        attendee_emails: selectedAttendees.map(a => a.email).join(',') || undefined,
      });

      resetForm();
      refetch();
    } catch (error: unknown) {
      // 중복 예약 에러 처리
      if (error instanceof Error) {
        if (error.message.includes('already') || error.message.includes('예약')) {
          // 에러 메시지에서 충돌 시간 추출 (예: "14:00-15:00")
          const timeMatch = error.message.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
          if (timeMatch) {
            const conflictStart = timeMatch[1]; // 충돌 예약의 시작 시간

            // 현재 예약 시작 시간부터 충돌 시작 시간까지가 가능한 시간
            if (conflictStart > startTime) {
              setSuggestedEndTime(conflictStart);
              setErrorTitle('예약 시간 충돌');
              setErrorMessage(
                `${error.message}\n\n대신 ${startTime} ~ ${conflictStart}로 예약하시겠습니까?`
              );
            } else {
              setSuggestedEndTime(null);
              setErrorTitle('예약 실패');
              setErrorMessage(error.message);
            }
          } else {
            setSuggestedEndTime(null);
            setErrorTitle('예약 실패');
            setErrorMessage(error.message);
          }
        } else {
          setSuggestedEndTime(null);
          setErrorTitle('예약 실패');
          setErrorMessage(error.message);
        }
      } else {
        setSuggestedEndTime(null);
        setErrorTitle('예약 실패');
        setErrorMessage('예약 중 오류가 발생했습니다.');
      }
      setErrorModalOpen(true);
    }
  };

  const resetForm = () => {
    setTeamId('');
    setBookerId('');
    setSelectedAttendeeIds([]);
    setPurpose('');
    setPassword('');
    setStartTime('');
    setEndTime('');
  };

  const isValid = selectedRoomId && teamId && bookerId && startTime && endTime && password;
  const loading = createLoading;

  if (visibleRooms.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        왼쪽 사이드바에서 회의실을 선택해주세요
      </div>
    );
  }

  // 19:00은 종료 시간 참조용으로만 사용, 시간표에는 18:30까지 표시
  const displaySlots = TIME_SLOTS.slice(0, -1);

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full">
      {/* Left: Time Grid */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <div className="flex-1 overflow-y-auto min-h-0">
          {(reservationsLoading || eventsLoading) ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <Loading size="md" text="예약 정보를 불러오는 중..." />
            </div>
          ) : (
          <table className="w-full h-full table-fixed border-collapse" style={{ minWidth: `${60 + visibleRooms.length * 120}px` }}>
            <thead className="sticky top-0 z-10 bg-white">
              <tr>
                <th className="w-[50px] md:w-[60px] min-w-[50px] md:min-w-[60px] max-w-[50px] md:max-w-[60px] border-r border-b border-[#DADCE0] h-10 md:h-12" />
                {visibleRooms.map((room) => {
                  const color = getRoomColorForId(room.id);
                  return (
                    <th
                      key={room.id}
                      className="text-center py-1.5 md:py-2 px-1 md:px-2 border-r border-b border-[#DADCE0] last:border-r-0 font-normal"
                    >
                      <div className="flex items-center justify-center gap-1 md:gap-2">
                        <span
                          className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm font-medium text-[#3C4043] truncate">
                          {room.name}
                        </span>
                      </div>
                      <div className="text-xs font-normal text-[#5F6368]">{room.floor}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {displaySlots.map((time, index) => {
                const slotMinutes = parseTimeToMinutes(time);
                const isThickBorder = time === '12:00' || time === '18:00';

                return (
                  <tr key={time}>
                    <td
                      className={cn(
                        "w-[50px] md:w-[60px] min-w-[50px] md:min-w-[60px] max-w-[50px] md:max-w-[60px] border-r border-[#DADCE0] px-1.5 md:px-2 py-1 align-top",
                        isThickBorder ? "border-b-2 border-b-gray-400" : "border-b border-[#DADCE0]"
                      )}
                      style={{ height: ROW_HEIGHT }}
                    >
                      <span className="text-xs font-normal text-[#5F6368]">{time}</span>
                    </td>

                    {visibleRooms.map((room) => {
                      const color = getRoomColorForId(room.id);
                      const roomReservations = getReservationsForRoom(room.id);
                      const isCEO = room.id === 'ceo-calendar';

                      const reservationsInSlot = roomReservations.filter((r) => {
                        const startMinutes = parseTimeToMinutes(r.start_time);
                        return startMinutes >= slotMinutes && startMinutes < slotMinutes + 30;
                      });

                      return (
                        <td
                          key={`${room.id}-${time}`}
                          onClick={() => !isCEO && handleCellClick(room, time, room.id)}
                          onDragOver={(e) => {
                            if (draggedReservation && !isCEO) {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = 'move';
                              setDragHoverTime(time);
                              setDragHoverRoom(room.id);
                            }
                          }}
                          onDragLeave={() => {
                            setDragHoverTime(null);
                            setDragHoverRoom(null);
                          }}
                          onDrop={(e) => {
                            if (draggedReservation && !isCEO) {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDrop(time, room.id);
                            }
                          }}
                          className={cn(
                            'border-r last:border-r-0 border-[#DADCE0] relative p-0',
                            isThickBorder ? 'border-b-2 border-b-gray-400' : 'border-b border-[#DADCE0]',
                            !isCEO && 'cursor-pointer',
                            !getReservationAtTime(room.id, time) && index % 2 === 0 && 'bg-gray-100',
                            !isCEO && !getReservationAtTime(room.id, time) && 'hover:bg-blue-50',
                            draggedReservation && !isCEO && dragHoverTime === time && dragHoverRoom === room.id && 'bg-blue-100'
                          )}
                          style={{ height: ROW_HEIGHT }}
                        >
                          {/* Show preview while dragging */}
                          {draggedReservation && dragHoverTime === time && dragHoverRoom === room.id && (() => {
                            const slotMinutes = parseTimeToMinutes(time);
                            const originalStartMinutes = parseTimeToMinutes(draggedReservation.start_time);
                            const originalEndMinutes = parseTimeToMinutes(draggedReservation.end_time);
                            const duration = originalEndMinutes - originalStartMinutes;
                            const durationSlots = duration / 30;
                            const newEndMinutes = slotMinutes + duration;
                            const newEndHours = Math.floor(newEndMinutes / 60);
                            const newEndMins = newEndMinutes % 60;
                            const previewEndTime = `${String(newEndHours).padStart(2, '0')}:${String(newEndMins).padStart(2, '0')}`;

                            return (
                              <div
                                className="absolute left-0 right-0 py-0.5 md:py-1 text-white overflow-hidden z-20 pointer-events-none opacity-60 border-2 border-blue-500 border-dashed"
                                style={{
                                  backgroundColor: getRoomColorForId(room.id),
                                  height: `${durationSlots * ROW_HEIGHT + 2}px`,
                                  top: '0px',
                                }}
                              >
                                <div className="text-xs font-medium truncate">
                                  {time} - {previewEndTime}
                                </div>
                              </div>
                            );
                          })()}
                          {reservationsInSlot.map((reservation) => {
                            const startMinutes = parseTimeToMinutes(reservation.start_time);
                            const endMinutes = parseTimeToMinutes(reservation.end_time);
                            const durationSlots = (endMinutes - startMinutes) / 30;
                            const topOffset = (startMinutes - slotMinutes) / 30;

                            return (
                              <div
                                key={reservation.id}
                                draggable={!isCEO}
                                onDragStart={(e) => {
                                  if (!isCEO) {
                                    e.stopPropagation();
                                    setDraggedReservation(reservation);
                                    setDraggedReservationCopy(reservation);
                                    e.dataTransfer.effectAllowed = 'move';
                                  }
                                }}
                                onDragEnd={() => {
                                  setDraggedReservation(null);
                                  setDragHoverTime(null);
                                  setDragHoverRoom(null);
                                }}
                                onClick={(e) => {
                                  if (isCEO) {
                                    e.stopPropagation();
                                    handleCalendarEventClick(e, calendarEvents.find(ev => ev.id === reservation.id)!);
                                  } else {
                                    handleReservationClick(e, reservation);
                                  }
                                }}
                                className={cn(
                                  "absolute left-0 right-0 py-0.5 md:py-1 text-white overflow-hidden z-10 transition-all duration-150 hover:brightness-110 hover:shadow-md",
                                  !isCEO && "cursor-move"
                                )}
                                style={{
                                  backgroundColor: color,
                                  height: `calc(${durationSlots} * ${ROW_HEIGHT}px - 1px)`,
                                  top: `${topOffset * ROW_HEIGHT}px`,
                                }}
                              >
                                <div className="text-xs font-medium truncate">
                                  {reservation.start_time} - {reservation.end_time}
                                </div>
                                {durationSlots >= 1 && (
                                  <div className="text-xs opacity-90 truncate">
                                    {!isCEO && `${reservation.team?.name || '팀없음'} | `}{reservation.purpose}
                                  </div>
                                )}
                                {!isCEO && durationSlots >= 3 && (
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

        {/* 패널 토글 버튼 - 오른쪽 가장자리에 고정 */}
        <button
          type="button"
          onClick={() => setRightPanelVisible(!rightPanelVisible)}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 w-6 h-6 bg-white border border-[#DADCE0] rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
          title={rightPanelVisible ? '패널 숨기기' : '패널 보기'}
        >
          {rightPanelVisible ? (
            <ChevronRight className="w-4 h-4 text-[#5F6368]" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-[#5F6368]" />
          )}
        </button>
      </div>

      {/* Right: Reservation Form + Room Info Panel */}
      <div className={cn(
        "border-t md:border-t-0 md:border-l border-[#DADCE0] bg-[#F8F9FA] flex flex-col min-h-0 transition-all duration-300 ease-in-out overflow-hidden",
        rightPanelVisible
          ? "w-full md:w-72 lg:w-80"
          : "w-0 border-l-0"
      )}>
        <div className={cn(
          "flex-1 transition-opacity duration-300 w-full md:w-72 lg:w-80",
          rightPanelVisible ? "opacity-100" : "opacity-0"
        )}>
          <ScrollArea className="flex-1 h-full">
            <div className="p-2 md:p-3 space-y-2 md:space-y-3">
            {/* Reservation Form */}
            <div className="bg-white rounded-lg border p-2 md:p-3">
              <button
                type="button"
                onClick={() => setReservationFormExpanded(!reservationFormExpanded)}
                className="flex items-center gap-1 w-full text-left mb-2 md:mb-3"
              >
                {reservationFormExpanded ? (
                  <ChevronDown className="h-4 w-4 text-[#5F6368]" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-[#5F6368]" />
                )}
                <h3 className="text-base font-semibold text-[#3C4043]">예약 등록</h3>
              </button>

              {reservationFormExpanded && (
              <form onSubmit={handleSubmit} className="space-y-1.5 md:space-y-2">
                {/* 1. Room Selection */}
                <div className="flex items-center gap-2">
                  <Label className="w-20 text-sm font-medium flex-shrink-0">회의실 <span className="text-destructive">*</span></Label>
                  <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                    <SelectTrigger className="h-8 text-sm font-normal">
                      <SelectValue placeholder="회의실 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {bookableRooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 2. Date */}
                <div className="flex items-center gap-2">
                  <Label className="w-20 text-sm font-medium flex-shrink-0">날짜</Label>
                  <div className="flex-1 px-2 py-1.5 text-xs bg-muted rounded-md border">
                    {format(selectedDate, 'yyyy년 M월 d일', { locale: ko })}
                  </div>
                </div>

                {/* 3. Time - 시작/종료 시간 선택 (5분 단위) */}
                <div className="flex items-center gap-2">
                  <Label className="w-20 text-sm font-medium flex-shrink-0">
                    시간 <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex-1 flex items-center gap-2">
                    <Select value={startTime} onValueChange={setStartTime}>
                      <SelectTrigger className="flex-1 h-8 text-xs">
                        <SelectValue placeholder="시작" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS_5MIN.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-xs">~</span>
                    <Select value={endTime} onValueChange={setEndTime} disabled={!startTime}>
                      <SelectTrigger className="flex-1 h-8 text-xs">
                        <SelectValue placeholder="종료" />
                      </SelectTrigger>
                      <SelectContent>
                        {endTimeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 4. Team Selection */}
                <div className="flex items-center gap-2">
                  <Label className="w-20 text-sm font-medium flex-shrink-0">팀 <span className="text-destructive">*</span></Label>
                  <ReactSelect
                    options={teams.filter(t => t.is_active).map(t => ({
                      value: t.id,
                      label: t.name,
                    }))}
                    value={teams.find(t => t.id === teamId) ? {
                      value: teamId,
                      label: teams.find(t => t.id === teamId)!.name,
                    } : null}
                    onChange={(selected) => {
                      setTeamId(selected ? selected.value : '');
                    }}
                    placeholder="팀 선택"
                    className="flex-1 text-xs"
                    classNamePrefix="select"
                    isClearable
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '32px',
                        height: '32px',
                        fontSize: '0.75rem',
                        borderColor: '#E5E7EB',
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        padding: '0 8px',
                        height: '30px',
                      }),
                      indicatorsContainer: (base) => ({
                        ...base,
                        height: '30px',
                      }),
                    }}
                  />
                </div>

                {/* 5. Booker Name (react-select 단일 선택) */}
                <div className="flex items-center gap-2">
                  <Label className="w-20 text-sm font-medium flex-shrink-0">
                    예약자명 <span className="text-destructive">*</span>
                  </Label>
                  <ReactSelect
                    options={slackMembers.map(m => ({
                      value: m.id,
                      label: m.real_name,
                    }))}
                    value={selectedBooker ? {
                      value: selectedBooker.id,
                      label: selectedBooker.real_name,
                    } : null}
                    onChange={(selected) => {
                      setBookerId(selected ? selected.value : '');
                    }}
                    placeholder="예약자 선택"
                    className="flex-1 text-xs"
                    classNamePrefix="select"
                    isClearable
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '32px',
                        height: '32px',
                        fontSize: '0.75rem',
                        borderColor: '#E5E7EB',
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        padding: '0 8px',
                        height: '30px',
                      }),
                      indicatorsContainer: (base) => ({
                        ...base,
                        height: '30px',
                      }),
                    }}
                  />
                </div>

                {/* 6. Attendees (react-select 다중 선택 - 줄바꿈 방지) */}
                <div className="flex items-center gap-2">
                  <div className="w-20 flex flex-col gap-0.5">
                    <Label className="text-xs whitespace-nowrap">
                      참석자 <span className="text-muted-foreground text-[10px]">({slackMembers.length})</span>
                    </Label>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const allIds = slackMembers.filter(m => m.id !== bookerId).map(m => m.id);
                          setSelectedAttendeeIds(allIds);
                        }}
                        className="text-[10px] hover:opacity-70"
                      >
                        전체
                      </button>
                      <span className="text-[10px] text-muted-foreground">|</span>
                      <button
                        type="button"
                        onClick={() => setSelectedAttendeeIds([])}
                        className="text-[10px] hover:opacity-70"
                      >
                        해제
                      </button>
                    </div>
                  </div>
                  <ReactSelect
                    isMulti
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    menuIsOpen={attendeesMenuOpen}
                    onMenuOpen={() => setAttendeesMenuOpen(true)}
                    onMenuClose={() => setAttendeesMenuOpen(false)}
                    options={slackMembers.filter(m => m.id !== bookerId).map(m => ({
                      value: m.id,
                      label: m.real_name,
                    }))}
                    value={selectedAttendees.map(m => ({
                      value: m.id,
                      label: m.real_name,
                    }))}
                    onChange={(selected) => {
                      setSelectedAttendeeIds(selected ? selected.map(s => s.value) : []);
                    }}
                    placeholder={selectedAttendeeIds.length > 0
                      ? `${selectedAttendeeIds.length}명 선택됨`
                      : '참석자 선택'}
                    className="flex-1 text-xs"
                    classNamePrefix="select"
                    controlShouldRenderValue={false}
                    components={{
                      Option: CustomOption,
                      MenuList: (props) => (
                        <CustomMenuList
                          {...props}
                          onClose={() => setAttendeesMenuOpen(false)}
                        />
                      ),
                    }}
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '32px',
                        height: '32px',
                        fontSize: '0.75rem',
                        borderColor: '#E5E7EB',
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        padding: '0 8px',
                        height: '30px',
                      }),
                      indicatorsContainer: (base) => ({
                        ...base,
                        height: '30px',
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected
                          ? '#D1FAE5'
                          : state.isFocused
                          ? '#F3F4F6'
                          : 'white',
                        color: state.isSelected ? '#065F46' : '#111827',
                        fontSize: '0.75rem',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        ':active': {
                          backgroundColor: '#A7F3D0',
                        },
                      }),
                    }}
                  />
                </div>

                {/* 7. Purpose */}
                <div className="flex items-center gap-2">
                  <Label className="w-20 text-sm font-medium flex-shrink-0">회의목적</Label>
                  <Input
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="회의 목적"
                    className="h-8 text-sm font-normal"
                  />
                </div>

                {/* 8. Password (바로 예약 버튼 위) */}
                <div className="flex items-center gap-2">
                  <Label className="w-20 text-sm font-medium flex-shrink-0">비밀번호 <span className="text-destructive">*</span></Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호"
                    maxLength={20}
                    autoComplete="off"
                    className="h-8 text-sm font-normal"
                  />
                </div>

                {/* 9. Submit Button */}
                <div className="pt-1">
                  <Button type="submit" className="w-full h-8 text-xs" disabled={!isValid || loading}>
                    {loading ? '예약 중...' : '예약하기'}
                  </Button>
                </div>
              </form>
              )}
            </div>

            {/* Room Info Section */}
            <div>
              <button
                type="button"
                onClick={() => setRoomInfoExpanded(!roomInfoExpanded)}
                className="flex items-center gap-1 w-full text-left mb-2"
              >
                {roomInfoExpanded ? (
                  <ChevronDown className="h-4 w-4 text-[#5F6368]" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-[#5F6368]" />
                )}
                <h3 className="text-sm font-semibold text-[#3C4043]">회의실 안내</h3>
              </button>

              {roomInfoExpanded && (
              <div className="space-y-2 overflow-y-auto pr-1" style={{ maxHeight: '330px', padding: '3px' }}>
                {bookableRooms.map((room) => {
                  const roomIndex = getRoomIndex(room.id);
                  const isSelected = selectedRoomId === room.id;
                  return (
                    <Card
                      key={room.id}
                      onClick={() => setSelectedRoomId(room.id)}
                      className={cn(
                        "overflow-hidden py-0 gap-0 transition-all cursor-pointer hover:shadow-md",
                        isSelected
                          ? "ring-2 ring-emerald-400 bg-emerald-50"
                          : "hover:bg-gray-50"
                      )}
                    >
                      <CardContent className="p-0">
                        <div className="flex">
                          {/* Room Image - compact */}
                          <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 relative">
                            {room.image_url ? (
                              <img
                                src={getImageUrl(room.image_url) || ''}
                                alt={room.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center"
                                style={{ backgroundColor: `${getRoomColor(roomIndex)}20` }}
                              >
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                  style={{ backgroundColor: getRoomColor(roomIndex) }}
                                >
                                  {room.name.charAt(0)}
                                </div>
                              </div>
                            )}
                            {isSelected && (
                              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Room Info */}
                          <div className="flex-1 p-2 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: getRoomColor(roomIndex) }}
                              />
                              <h4 className="font-medium text-[#3C4043] text-sm truncate">{room.name}</h4>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-0.5">
                                <MapPin className="w-3 h-3" />
                                {room.floor}
                              </span>
                              {room.capacity && (
                                <span className="flex items-center gap-0.5">
                                  <Users className="w-3 h-3" />
                                  {room.capacity}명
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              )}
            </div>
          </div>
        </ScrollArea>
        </div>
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

      {/* Password Modal for Drag & Drop */}
      <AlertDialog open={passwordModalOpen} onOpenChange={(open) => {
        setPasswordModalOpen(open);
        // 충돌이 발생하여 대안 시간이 제안된 경우는 상태를 유지해야 함
        if (!open && !suggestedEndTime) {
          setMovePassword('');
          setDraggedReservationCopy(null);
          setIsMovingReservation(false);
        }
      }}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>예약 {newRoomId !== draggedReservationCopy?.room_id ? '이동' : '시간 변경'}</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div className="text-left">
                <p className="text-sm text-muted-foreground mb-2">
                  예약을 {newRoomId !== draggedReservationCopy?.room_id ? '다른 회의실로 이동' : '변경'}하시겠습니까?
                </p>
                <div className="bg-blue-50 p-3 rounded-md space-y-2">
                  {newRoomId !== draggedReservationCopy?.room_id && (
                    <div className="flex items-center justify-between text-sm pb-2 border-b border-blue-200">
                      <span className="text-muted-foreground">회의실:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{rooms.find(r => r.id === draggedReservationCopy?.room_id)?.name}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-medium text-blue-600">{rooms.find(r => r.id === newRoomId)?.name}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">변경 전:</span>
                    <span className="font-medium">{draggedReservationCopy?.start_time} - {draggedReservationCopy?.end_time}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">변경 후:</span>
                    <span className="font-medium text-blue-600">{newStartTime} - {newEndTime}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="move-password" className="text-sm font-medium">
                  비밀번호 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="move-password"
                  type="password"
                  value={movePassword}
                  onChange={(e) => setMovePassword(e.target.value)}
                  placeholder="예약 비밀번호 입력"
                  autoComplete="off"
                  className="h-9"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && movePassword) {
                      handlePasswordSubmit();
                    }
                  }}
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              onClick={() => {
                setMovePassword('');
                setDraggedReservationCopy(null);
              }}
              className="w-full sm:w-auto"
            >
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePasswordSubmit}
              disabled={!movePassword || createLoading}
              className="w-full sm:w-auto"
            >
              {createLoading ? '변경 중...' : '변경하기'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Alert Dialog */}
      <AlertDialog open={errorModalOpen} onOpenChange={setErrorModalOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <AlertDialogTitle className="text-left">{errorTitle}</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left pt-2 whitespace-pre-line">
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            {suggestedEndTime ? (
              <>
                <AlertDialogCancel
                  onClick={() => {
                    setSuggestedEndTime(null);
                    setIsMovingReservation(false);
                    setDraggedReservationCopy(null);
                    setMovePassword('');
                  }}
                  className="w-full sm:w-auto"
                >
                  취소
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    setErrorModalOpen(false);
                    setSuggestedEndTime(null);

                    if (isMovingReservation && draggedReservationCopy) {
                      // 드래그 앤 드롭으로 이동 중인 경우 - 자동으로 재시도
                      try {
                        const updates: any = {
                          start_time: newStartTime,
                          end_time: suggestedEndTime, // 제안된 시간으로 변경
                          password: movePassword,
                        };

                        // 회의실이 변경된 경우에만 room_id 추가
                        if (newRoomId !== draggedReservationCopy.room_id) {
                          updates.room_id = newRoomId;
                        }

                        await update(draggedReservationCopy.id, updates);

                        setMovePassword('');
                        setDraggedReservationCopy(null);
                        setIsMovingReservation(false);
                        refetch();
                      } catch (err: unknown) {
                        if (err instanceof Error) {
                          setErrorTitle('시간 이동 실패');
                          setErrorMessage(err.message);
                          setErrorModalOpen(true);
                        }
                      }
                    } else {
                      // 새 예약 생성 중인 경우
                      setEndTime(suggestedEndTime);

                      // 자동으로 다시 예약 시도
                      try {
                        await create({
                          room_id: selectedRoomId,
                          team_id: teamId,
                          booker_name: selectedBooker?.real_name || '',
                          booker_email: selectedBooker?.email,
                          purpose,
                          reservation_date: dateStr,
                          start_time: startTime,
                          end_time: suggestedEndTime,
                          password,
                          attendees: selectedAttendees.map(a => a.real_name).join(', ') || undefined,
                          attendee_emails: selectedAttendees.map(a => a.email).join(',') || undefined,
                        });

                        resetForm();
                        refetch();
                      } catch (err: unknown) {
                        if (err instanceof Error) {
                          setErrorTitle('예약 실패');
                          setErrorMessage(err.message);
                          setSuggestedEndTime(null);
                          setErrorModalOpen(true);
                        }
                      }
                    }
                  }}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                >
                  {isMovingReservation ? '변경하기' : '예약하기'}
                </AlertDialogAction>
              </>
            ) : (
              <AlertDialogAction
                onClick={() => {
                  setErrorModalOpen(false);
                  setSuggestedEndTime(null);
                  setIsMovingReservation(false);
                  setDraggedReservationCopy(null);
                  setMovePassword('');
                }}
                className="w-full sm:w-auto"
              >
                확인
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
