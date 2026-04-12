import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { TeamSelect } from '../reservation/TeamSelect';
import { AttendeesSelect } from '../reservation/AttendeesSelect';
import { useReservationActions } from '../../hooks/useReservations';
import { TIME_SLOTS } from '../../lib/constants';
import type { Room } from '../../types';

interface ReservationFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  room: Room;
  date: string;
  startTime: string;
}

export function ReservationForm({
  open,
  onClose,
  onSuccess,
  room,
  date,
  startTime,
}: ReservationFormProps) {
  const { create, loading } = useReservationActions();

  const [teamId, setTeamId] = useState('');
  const [bookerName, setBookerName] = useState('');
  const [bookerEmail, setBookerEmail] = useState('');
  const [purpose, setPurpose] = useState('');
  const [endTime, setEndTime] = useState('');
  const [password, setPassword] = useState('');
  const [attendees, setAttendees] = useState<string[]>([]);

  const startIndex = TIME_SLOTS.indexOf(startTime);
  const availableEndTimes = TIME_SLOTS.slice(startIndex + 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await create({
      room_id: room.id,
      team_id: teamId,
      booker_name: bookerName,
      booker_email: bookerEmail || undefined,
      purpose,
      reservation_date: date,
      start_time: startTime,
      end_time: endTime,
      password,
      attendees: attendees.length > 0 ? attendees.join(', ') : undefined,
    });

    resetForm();
    onSuccess();
  };

  const resetForm = () => {
    setTeamId('');
    setBookerName('');
    setBookerEmail('');
    setPurpose('');
    setEndTime('');
    setPassword('');
    setAttendees([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isValid = teamId && bookerName && purpose && endTime && password;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[500px] lg:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">회의실 예약</DialogTitle>
          <DialogDescription className="text-sm font-normal">
            {room.name} - {date} {startTime}부터
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-3 md:gap-4 py-3 md:py-4">
            <div className="grid gap-2">
              <Label className="text-sm font-medium" htmlFor="team">팀 선택 <span className="text-red-500">*</span></Label>
              <TeamSelect value={teamId} onChange={setTeamId} />
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-medium" htmlFor="bookerName">예약자명 <span className="text-red-500">*</span></Label>
              <Input
                id="bookerName"
                value={bookerName}
                onChange={(e) => setBookerName(e.target.value)}
                className="text-sm font-normal"
                placeholder="이름을 입력하세요"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-medium" htmlFor="bookerEmail">예약자 이메일</Label>
              <Input
                id="bookerEmail"
                type="email"
                value={bookerEmail}
                onChange={(e) => setBookerEmail(e.target.value)}
                className="text-sm font-normal"
                placeholder="email@example.com"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-medium" htmlFor="attendees">참석자</Label>
              <AttendeesSelect value={attendees} onChange={setAttendees} />
              <p className="text-xs text-muted-foreground">
                Slack 멤버를 검색하여 선택하세요
              </p>
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-medium" htmlFor="purpose">회의 목적 <span className="text-red-500">*</span></Label>
              <Input
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="text-sm font-normal"
                placeholder="회의 목적을 입력하세요"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-medium" htmlFor="endTime">종료 시간 <span className="text-red-500">*</span></Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger>
                  <SelectValue placeholder="종료 시간 선택" />
                </SelectTrigger>
                <SelectContent>
                  {(Array.isArray(availableEndTimes) ? availableEndTimes : []).map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-medium" htmlFor="password">비밀번호 <span className="text-red-500">*</span></Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-sm font-normal"
                placeholder="비밀번호를 입력하세요"
                maxLength={20}
              />
              <p className="text-xs text-muted-foreground">
                예약 수정/취소 시 필요합니다 (숫자 4자리 권장)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              취소
            </Button>
            <Button type="submit" disabled={!isValid || loading}>
              {loading ? '예약 중...' : '예약하기'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
