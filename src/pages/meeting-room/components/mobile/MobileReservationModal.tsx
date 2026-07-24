import { useState, useEffect, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Loader2, Calendar, Building2, Check, Search, X, ChevronDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover';
import { MobileTimeSlot } from '../mobile/MobileTimeSlot';
import { useRooms } from '../../hooks/useRooms';
import { useTeams } from '../../hooks/useTeams';
import { useSlots, useReservationActions } from '../../hooks/useReservations';
import { useSlackMembers } from '../../hooks/useSlackMembers';
import { TIME_SLOTS, normalizeTime, parseTimeToMinutes } from '../../lib/constants';
import { cn } from '../../lib/utils';

interface MobileReservationModalProps {
  open: boolean;
  onClose: () => void;
  selectedDate: string;
  selectedRoomId?: string;
  onSuccess?: () => void;
}

export function MobileReservationModal({
  open,
  onClose,
  selectedDate,
  selectedRoomId: initialRoomId,
  onSuccess,
}: MobileReservationModalProps) {
  const [selectedRoomId, setSelectedRoomId] = useState(initialRoomId || '');
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [bookerId, setBookerId] = useState('');
  const [bookerOpen, setBookerOpen] = useState(false);
  const [bookerSearch, setBookerSearch] = useState('');
  const [selectedAttendeeIds, setSelectedAttendeeIds] = useState<string[]>([]);
  const [attendeesOpen, setAttendeesOpen] = useState(false);
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [purpose, setPurpose] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { rooms, loading: roomsLoading } = useRooms();
  const { teams, loading: teamsLoading } = useTeams();
  const { slots, loading: slotsLoading } = useSlots(selectedRoomId, selectedDate);
  const { create } = useReservationActions();
  const { members: slackMembers } = useSlackMembers();

  const selectedBooker = slackMembers.find(m => m.id === bookerId);
  const selectedAttendees = slackMembers.filter(m => selectedAttendeeIds.includes(m.id));

  // 검색 필터링된 멤버 목록
  const filteredBookerMembers = useMemo(() => {
    if (!bookerSearch) return slackMembers;
    const search = bookerSearch.toLowerCase();
    return slackMembers.filter(m =>
      m.real_name.toLowerCase().includes(search) ||
      m.email.toLowerCase().includes(search)
    );
  }, [slackMembers, bookerSearch]);

  const filteredAttendeeMembers = useMemo(() => {
    const filtered = slackMembers.filter(m => m.id !== bookerId);
    if (!attendeeSearch) return filtered;
    const search = attendeeSearch.toLowerCase();
    return filtered.filter(m =>
      m.real_name.toLowerCase().includes(search) ||
      m.email.toLowerCase().includes(search)
    );
  }, [slackMembers, bookerId, attendeeSearch]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setSelectedRoomId(initialRoomId || '');
      setSelectedStartTime('');
      setSelectedEndTime('');
      setSelectedTeamId('');
      setBookerId('');
      setBookerSearch('');
      setSelectedAttendeeIds([]);
      setAttendeeSearch('');
      setPurpose('');
      setPassword('');
    }
  }, [open, initialRoomId]);

  // Get available time slots based on current reservations
  const availableSlots = useMemo(() => {
    const available = new Set<string>();
    slots.forEach(slot => {
      if (slot.is_available) {
        available.add(normalizeTime(slot.start_time));
      }
    });
    return available;
  }, [slots]);

  // Get available end times based on selected start time
  const availableEndTimes = useMemo(() => {
    if (!selectedStartTime) return [];

    const startMinutes = parseTimeToMinutes(selectedStartTime);
    const endTimes: string[] = [];

    // Find consecutive available slots after start time
    for (const time of TIME_SLOTS) {
      const timeMinutes = parseTimeToMinutes(time);
      if (timeMinutes > startMinutes) {
        // Check if all slots between start and this time are available
        let allAvailable = true;
        for (const checkTime of TIME_SLOTS) {
          const checkMinutes = parseTimeToMinutes(checkTime);
          if (checkMinutes >= startMinutes && checkMinutes < timeMinutes) {
            if (!availableSlots.has(checkTime)) {
              allAvailable = false;
              break;
            }
          }
        }
        if (allAvailable) {
          endTimes.push(time);
        } else {
          break; // Stop at first unavailable slot
        }
      }
    }

    return endTimes;
  }, [selectedStartTime, availableSlots]);

  // Reset end time when start time changes
  useEffect(() => {
    setSelectedEndTime('');
  }, [selectedStartTime]);

  const handleTimeSelect = (time: string) => {
    if (selectedStartTime === time) {
      setSelectedStartTime('');
    } else {
      setSelectedStartTime(time);
    }
  };

  const handleSubmit = async () => {
    if (!selectedRoomId || !selectedTeamId || !selectedStartTime || !selectedEndTime || !bookerId || !purpose || !password) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    const selectedBooker = slackMembers.find(m => m.id === bookerId);
    const selectedAttendees = slackMembers.filter(m => selectedAttendeeIds.includes(m.id));

    setSubmitting(true);
    try {
      await create({
        room_id: selectedRoomId,
        team_id: selectedTeamId,
        reservation_date: selectedDate,
        start_time: selectedStartTime,
        end_time: selectedEndTime,
        booker_name: selectedBooker?.real_name || '',
        booker_email: selectedBooker?.email,
        attendees: selectedAttendees.map(a => a.real_name).join(', ') || undefined,
        attendee_emails: selectedAttendees.map(a => a.email).join(',') || undefined,
        purpose,
        password,
      });
      const roomName = rooms.find(r => r.id === selectedRoomId)?.name || '회의실';
      const dateStr = format(parseISO(selectedDate), 'M월 d일', { locale: ko });
      alert(`예약이 완료되었습니다.\n\n${dateStr} ${selectedStartTime} ~ ${selectedEndTime}\n${roomName}`);
      onSuccess?.();
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : '예약에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = roomsLoading || teamsLoading;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            예약하기
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="p-4 space-y-5">
            {/* Date Display */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500">예약 날짜</p>
                <p className="font-semibold text-gray-900 text-sm">
                  {format(parseISO(selectedDate), 'yyyy년 M월 d일 (EEE)', { locale: ko })}
                </p>
              </div>
            </div>

            {/* Room Select */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                <Building2 className="w-4 h-4 inline mr-1" />
                회의실 선택
              </Label>
              <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                <SelectTrigger className="w-full h-11 bg-white">
                  <SelectValue placeholder="회의실을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name} ({room.floor})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Selection */}
            {selectedRoomId && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">시작 시간 선택</Label>
                {slotsLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5">
                    {TIME_SLOTS.map((time) => (
                      <MobileTimeSlot
                        key={time}
                        time={time}
                        isSelected={selectedStartTime === time}
                        isDisabled={!availableSlots.has(time)}
                        onSelect={handleTimeSelect}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* End Time */}
            {selectedStartTime && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">종료 시간</Label>
                <Select value={selectedEndTime} onValueChange={setSelectedEndTime}>
                  <SelectTrigger className="w-full h-11 bg-white">
                    <SelectValue placeholder="종료 시간을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEndTimes.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Team Select */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">팀</Label>
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger className="w-full h-11 bg-white">
                  <SelectValue placeholder="팀을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  예약자명 <span className="text-red-500">*</span>
                </Label>
                <Popover open={bookerOpen} onOpenChange={(open) => {
                  setBookerOpen(open);
                  if (!open) setBookerSearch('');
                }}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-11 justify-between bg-white font-normal px-3"
                    >
                      <span className={cn(!selectedBooker && "text-muted-foreground")}>
                        {selectedBooker?.real_name || '예약자를 선택하세요'}
                      </span>
                      <ChevronDown className="w-4 h-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] p-0" align="start">
                    <div className="p-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="이름 검색..."
                          value={bookerSearch}
                          onChange={(e) => setBookerSearch(e.target.value)}
                          className="h-9 pl-8"
                        />
                      </div>
                    </div>
                    <div className="max-h-52 overflow-y-auto p-1">
                      {filteredBookerMembers.length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          No search results
                        </div>
                      ) : (
                        filteredBookerMembers.map((member) => (
                          <div
                            key={member.id}
                            className={cn(
                              'flex items-center gap-2 px-2 py-2 rounded cursor-pointer text-sm',
                              bookerId === member.id ? 'bg-blue-100' : 'hover:bg-gray-100'
                            )}
                            onClick={() => {
                              setBookerId(member.id);
                              setBookerOpen(false);
                              setBookerSearch('');
                            }}
                          >
                            <Check className={cn('w-4 h-4', bookerId === member.id ? 'opacity-100' : 'opacity-0')} />
                            <span className="truncate">{member.real_name}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  참석자 <span className="text-gray-400 font-normal">(총 {slackMembers.length}명)</span>
                </Label>
                <Popover open={attendeesOpen} onOpenChange={(open) => {
                  setAttendeesOpen(open);
                  if (!open) setAttendeeSearch('');
                }}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-11 justify-between bg-white font-normal px-3"
                    >
                      <span className={cn(selectedAttendeeIds.length === 0 && "text-muted-foreground")}>
                        {selectedAttendeeIds.length > 0
                          ? `${selectedAttendeeIds.length}명 선택됨`
                          : "참석자를 선택하세요"}
                      </span>
                      <ChevronDown className="w-4 h-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] p-0" align="start">
                    <div className="p-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="이름 검색..."
                          value={attendeeSearch}
                          onChange={(e) => setAttendeeSearch(e.target.value)}
                          className="h-9 pl-8"
                        />
                      </div>
                    </div>
                    {/* 선택된 멤버 표시 */}
                    {selectedAttendeeIds.length > 0 && (
                      <div className="p-2 border-b bg-gray-50">
                        <div className="flex flex-wrap gap-1">
                          {selectedAttendees.map((member) => (
                            <span
                              key={member.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs"
                            >
                              {member.real_name}
                              <X
                                className="w-3 h-3 cursor-pointer hover:text-blue-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAttendeeIds(prev => prev.filter(id => id !== member.id));
                                }}
                              />
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="max-h-40 overflow-y-auto p-1">
                      {filteredAttendeeMembers.length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          No search results
                        </div>
                      ) : (
                        filteredAttendeeMembers.map((member) => {
                          const isSelected = selectedAttendeeIds.includes(member.id);
                          return (
                            <div
                              key={member.id}
                              className={cn(
                                "flex items-center gap-2 px-2 py-2 rounded cursor-pointer text-sm",
                                isSelected ? "bg-blue-50" : "hover:bg-gray-100"
                              )}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedAttendeeIds(prev => prev.filter(id => id !== member.id));
                                } else {
                                  setSelectedAttendeeIds(prev => [...prev, member.id]);
                                  setAttendeeSearch('');
                                }
                              }}
                            >
                              <div className={cn(
                                "w-4 h-4 border rounded flex items-center justify-center flex-shrink-0",
                                isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300"
                              )}>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <span className="truncate">{member.real_name}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                    {selectedAttendeeIds.length > 0 && (
                      <div className="p-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full h-8 text-xs"
                          onClick={() => setSelectedAttendeeIds([])}
                        >
                          전체 해제
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="purpose" className="text-sm font-medium text-gray-700">
                  회의 목적 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="회의 목적을 입력하세요"
                  className="h-11 bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  비밀번호 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="예약 수정/취소를 위한 비밀번호"
                  className="h-11 bg-white"
                />
                <p className="text-xs text-gray-500">예약 수정/취소 시 필요합니다</p>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={submitting || !selectedRoomId || !selectedTeamId || !selectedStartTime || !selectedEndTime || !bookerId || !purpose || !password}
              className={cn(
                'w-full h-12 text-base font-semibold rounded-lg',
                'bg-blue-500 hover:bg-blue-600 text-white',
                'disabled:bg-gray-300 disabled:text-gray-500'
              )}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  예약 중...
                </>
              ) : (
                '예약하기'
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
