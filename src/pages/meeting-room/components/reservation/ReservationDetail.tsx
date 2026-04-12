import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Calendar,
  Clock,
  Building2,
  User,
  Users,
  FileText,
  AlertCircle,
  StickyNote,
  CheckCircle,
  XCircle,
  Pencil,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { STATUS_LABELS, TIME_SLOTS } from '../../lib/constants';
import { useReservationActions } from '../../hooks/useReservations';
import type { Reservation, Room } from '../../types';

interface ReservationDetailProps {
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  reservation: Reservation | null;
  rooms?: Room[];
}

type ModalMode = 'view' | 'password-cancel' | 'password-edit' | 'edit';

export function ReservationDetail({
  open,
  onClose,
  onUpdate,
  reservation,
  rooms,
}: ReservationDetailProps) {
  const { cancel, update, loading } = useReservationActions();

  const [mode, setMode] = useState<ModalMode>('view');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Edit form state
  const [editPurpose, setEditPurpose] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editAttendees, setEditAttendees] = useState('');
  const [editMemo, setEditMemo] = useState('');

  // Reset mode when dialog opens/closes
  useEffect(() => {
    if (open) {
      setMode('view');
      setPassword('');
      setPasswordError('');
    }
  }, [open]);

  // 시작 시간 변경 시 종료 시간 자동 조정
  useEffect(() => {
    if (mode === 'edit' && editStartTime) {
      const [hours, minutes] = editStartTime.split(':').map(Number);
      const startTotalMinutes = hours * 60 + minutes;
      const endTotalMinutes = startTotalMinutes + 30;

      // 현재 종료 시간이 시작 시간보다 이르면 자동 조정
      if (editEndTime) {
        const [endHours, endMinutes] = editEndTime.split(':').map(Number);
        const currentEndMinutes = endHours * 60 + endMinutes;

        if (currentEndMinutes <= startTotalMinutes) {
          const h = Math.floor(endTotalMinutes / 60);
          const m = endTotalMinutes % 60;
          setEditEndTime(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
        }
      } else {
        // 종료 시간이 없으면 시작 + 30분으로 설정
        const h = Math.floor(endTotalMinutes / 60);
        const m = endTotalMinutes % 60;
        setEditEndTime(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
  }, [editStartTime, mode]);

  if (!reservation) return null;

  // 회의실 이름 찾기: reservation.room?.name 우선, 없으면 rooms에서 찾기
  const roomName = reservation.room?.name
    || rooms?.find(r => r.id === reservation.room_id)?.name
    || '회의실';
  const roomFloor = reservation.room?.floor
    || rooms?.find(r => r.id === reservation.room_id)?.floor;

  const resetState = () => {
    setMode('view');
    setPassword('');
    setPasswordError('');
    setEditPurpose('');
    setEditStartTime('');
    setEditEndTime('');
    setEditAttendees('');
    setEditMemo('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleCancelClick = () => {
    setPassword('');
    setPasswordError('');
    setMode('password-cancel');
  };

  const handleEditClick = () => {
    setPassword('');
    setPasswordError('');
    setMode('password-edit');
  };

  const handlePasswordConfirmForCancel = async () => {
    if (!password.trim()) {
      setPasswordError('비밀번호를 입력해주세요');
      return;
    }

    try {
      await cancel(reservation.id, password);
      handleClose();
      onUpdate();
    } catch {
      setPasswordError('비밀번호가 일치하지 않습니다');
    }
  };

  const handlePasswordConfirmForEdit = async () => {
    if (!password.trim()) {
      setPasswordError('비밀번호를 입력해주세요');
      return;
    }

    // Initialize edit form with current values
    setEditPurpose(reservation.purpose || '');
    setEditStartTime(reservation.start_time);
    setEditEndTime(reservation.end_time);
    setEditAttendees(reservation.attendees || '');
    setEditMemo(reservation.memo || '');
    setPasswordError('');
    setMode('edit');
  };

  const handleEditSubmit = async () => {
    try {
      await update(reservation.id, {
        password,
        purpose: editPurpose || undefined,
        start_time: editStartTime,
        end_time: editEndTime,
        attendees: editAttendees || undefined,
        memo: editMemo || undefined,
      });
      handleClose();
      onUpdate();
    } catch {
      setPasswordError('수정에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleBackToView = () => {
    setMode('view');
    setPassword('');
    setPasswordError('');
  };

  const canModify = reservation.status === 'reserved';

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'reserved':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return format(date, 'yyyy년 M월 d일 (EEE)', { locale: ko });
    } catch {
      return dateStr;
    }
  };

  // Get end time options based on start time
  const getEndTimeOptions = (start: string): string[] => {
    if (!start) return [];

    const [startHours, startMinutes] = start.split(':').map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const options: string[] = [];

    for (let minutes = startTotalMinutes + 30; minutes <= 18 * 60 + 30; minutes += 30) {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      options.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }

    return options;
  };

  const getDialogTitle = () => {
    switch (mode) {
      case 'password-cancel':
        return '예약 취소';
      case 'password-edit':
        return '예약 변경';
      case 'edit':
        return '예약 변경';
      default:
        return '예약 상세';
    }
  };

  // Render password confirmation content
  const renderPasswordContent = (isCancel: boolean) => (
    <div className="p-4 md:p-6 space-y-3 md:space-y-4">
      <p className="text-xs md:text-sm text-muted-foreground">
        {isCancel ? '예약을 취소하려면 비밀번호를 입력해주세요.' : '예약을 변경하려면 비밀번호를 입력해주세요.'}
      </p>
      <div className="grid gap-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordError('');
          }}
          placeholder="비밀번호를 입력하세요"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              isCancel ? handlePasswordConfirmForCancel() : handlePasswordConfirmForEdit();
            }
          }}
          autoFocus
        />
        {passwordError && (
          <div className="flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {passwordError}
          </div>
        )}
      </div>
    </div>
  );

  // Render edit form content
  const renderEditContent = () => (
    <div className="p-4 md:p-6 space-y-3 md:space-y-4">
      {/* Fixed info */}
      <div className="rounded-lg bg-muted/50 p-2 md:p-3 space-y-1.5 md:space-y-2 text-xs md:text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(reservation.reservation_date)}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span>{roomName}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{reservation.booker_name}</span>
        </div>
      </div>

      <Separator />

      {/* Editable fields */}
      <div className="space-y-3">
        <div className="grid gap-2">
          <Label>시간</Label>
          <div className="flex items-center gap-2">
            <Select value={editStartTime} onValueChange={setEditStartTime}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="시작" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.slice(0, -1).map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-muted-foreground">~</span>
            <Select value={editEndTime} onValueChange={setEditEndTime}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="종료" />
              </SelectTrigger>
              <SelectContent>
                {getEndTimeOptions(editStartTime).map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="editPurpose">회의 목적</Label>
          <Input
            id="editPurpose"
            value={editPurpose}
            onChange={(e) => setEditPurpose(e.target.value)}
            placeholder="회의 목적"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="editAttendees">참석자</Label>
          <Input
            id="editAttendees"
            value={editAttendees}
            onChange={(e) => setEditAttendees(e.target.value)}
            placeholder="참석자 (콤마로 구분)"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="editMemo">메모</Label>
          <Input
            id="editMemo"
            value={editMemo}
            onChange={(e) => setEditMemo(e.target.value)}
            placeholder="메모"
          />
        </div>
      </div>

      {passwordError && (
        <div className="flex items-center gap-1 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {passwordError}
        </div>
      )}
    </div>
  );

  // Render main view content
  const renderViewContent = () => (
    <div className="px-4 md:px-6 pb-4 md:pb-6 space-y-4 md:space-y-5">
      {/* Purpose Section */}
      {reservation.purpose && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span className="text-xs md:text-sm font-medium">회의 목적</span>
          </div>
          <p className="text-sm md:text-base font-medium pl-5 md:pl-6">{reservation.purpose}</p>
        </div>
      )}

      <Separator />

      {/* Date & Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-xs md:text-sm font-medium">날짜</span>
          </div>
          <p className="text-xs md:text-sm pl-5 md:pl-6">{formatDate(reservation.reservation_date)}</p>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-xs md:text-sm font-medium">시간</span>
          </div>
          <p className="text-xs md:text-sm pl-5 md:pl-6">
            {reservation.start_time} - {reservation.end_time}
          </p>
        </div>
      </div>

      <Separator />

      {/* Room & Team */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span className="text-xs md:text-sm font-medium">회의실</span>
          </div>
          <p className="text-xs md:text-sm pl-5 md:pl-6">
            {roomName}
            {roomFloor && (
              <span className="text-muted-foreground"> ({roomFloor})</span>
            )}
          </p>
        </div>
        {reservation.team && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-xs md:text-sm font-medium">팀</span>
            </div>
            <p className="text-xs md:text-sm pl-5 md:pl-6">{reservation.team.name}</p>
          </div>
        )}
      </div>

      <Separator />

      {/* Booker */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="h-4 w-4" />
          <span className="text-xs md:text-sm font-medium">예약자</span>
        </div>
        <p className="text-xs md:text-sm pl-5 md:pl-6">{reservation.booker_name}</p>
      </div>

      {/* Attendees */}
      {reservation.attendees && (
        <>
          <Separator />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-xs md:text-sm font-medium">참석자</span>
            </div>
            <p className="text-xs md:text-sm pl-5 md:pl-6">{reservation.attendees}</p>
          </div>
        </>
      )}

      {/* Memo */}
      {reservation.memo && (
        <>
          <Separator />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <StickyNote className="h-4 w-4" />
              <span className="text-xs md:text-sm font-medium">메모</span>
            </div>
            <p className="text-xs md:text-sm pl-5 md:pl-6 text-muted-foreground">{reservation.memo}</p>
          </div>
        </>
      )}

      {/* Status Badge */}
      <div className="flex items-center gap-2 pt-2">
        <span className="text-sm text-muted-foreground">상태:</span>
        <Badge
          variant="outline"
          className={cn(
            'text-xs font-medium px-2.5 py-0.5',
            getStatusBadgeStyle(reservation.status)
          )}
        >
          {reservation.status === 'reserved' && <CheckCircle className="h-3 w-3 mr-1" />}
          {reservation.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
          {reservation.status === 'cancelled' && <XCircle className="h-3 w-3 mr-1" />}
          {STATUS_LABELS[reservation.status]}
        </Badge>
      </div>
    </div>
  );

  // Render footer based on mode
  const renderFooter = () => {
    if (mode === 'password-cancel') {
      return (
        <DialogFooter className="px-6 py-4 bg-slate-50 border-t flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleBackToView} className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            돌아가기
          </Button>
          <Button
            onClick={handlePasswordConfirmForCancel}
            disabled={loading}
            variant="outline"
            className="w-full sm:w-auto text-gray-600 hover:text-red-500 hover:border-red-300"
          >
            {loading ? '처리 중...' : '취소 확인'}
          </Button>
        </DialogFooter>
      );
    }

    if (mode === 'password-edit') {
      return (
        <DialogFooter className="px-6 py-4 bg-slate-50 border-t flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleBackToView} className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            돌아가기
          </Button>
          <Button onClick={handlePasswordConfirmForEdit} disabled={loading} className="w-full sm:w-auto">
            {loading ? '확인 중...' : '확인'}
          </Button>
        </DialogFooter>
      );
    }

    if (mode === 'edit') {
      return (
        <DialogFooter className="px-6 py-4 bg-slate-50 border-t flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleBackToView} className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            돌아가기
          </Button>
          <Button onClick={handleEditSubmit} disabled={loading} className="w-full sm:w-auto">
            {loading ? '저장 중...' : '저장'}
          </Button>
        </DialogFooter>
      );
    }

    // View mode
    return (
      <DialogFooter className="px-6 py-4 bg-slate-50 border-t flex-col sm:flex-row gap-2">
        {canModify && (
          <>
            <Button variant="outline" onClick={handleEditClick} className="w-full sm:w-auto">
              <Pencil className="h-4 w-4 mr-2" />
              예약 변경
            </Button>
            <Button
              variant="outline"
              onClick={handleCancelClick}
              disabled={loading}
              className="w-full sm:w-auto text-gray-600 hover:text-red-500 hover:border-red-300"
            >
              예약 취소
            </Button>
          </>
        )}
        <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
          닫기
        </Button>
      </DialogFooter>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-[480px] md:max-w-[540px] lg:max-w-[600px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4">
          <DialogTitle className="text-lg md:text-xl font-semibold flex items-center gap-2">
            {mode === 'edit' && <Pencil className="h-4 w-4 md:h-5 md:w-5" />}
            {getDialogTitle()}
          </DialogTitle>
        </DialogHeader>

        {mode === 'view' && renderViewContent()}
        {mode === 'password-cancel' && renderPasswordContent(true)}
        {mode === 'password-edit' && renderPasswordContent(false)}
        {mode === 'edit' && renderEditContent()}

        {renderFooter()}
      </DialogContent>
    </Dialog>
  );
}
