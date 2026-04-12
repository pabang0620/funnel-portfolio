import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Loading } from '../../components/ui/loading';
import { Clock, User, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import { STATUS_LABELS, STATUS_COLORS } from '../../lib/constants';
import type { TimeSlot, Reservation } from '../../types';

interface TimeSlotListProps {
  slots: TimeSlot[];
  onSlotClick: (slot: TimeSlot) => void;
  loading?: boolean;
}

export function TimeSlotList({ slots, onSlotClick, loading }: TimeSlotListProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            시간 슬롯
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Loading size="sm" text="시간 슬롯 불러오는 중..." />
        </CardContent>
      </Card>
    );
  }

  const safeSlots = Array.isArray(slots) ? slots : [];

  if (safeSlots.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            시간 슬롯
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            회의실과 날짜를 선택해주세요
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          시간 슬롯
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-2">
            {safeSlots.map((slot) => (
              <TimeSlotItem
                key={slot.start_time}
                slot={slot}
                onClick={() => onSlotClick(slot)}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface TimeSlotItemProps {
  slot: TimeSlot;
  onClick: () => void;
}

function TimeSlotItem({ slot, onClick }: TimeSlotItemProps) {
  const { start_time, is_available, reservation } = slot;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 rounded-lg border text-left transition-all',
        is_available
          ? 'hover:border-primary hover:bg-accent cursor-pointer'
          : 'bg-muted/50 cursor-pointer'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-medium w-12">{start_time}</span>

          {reservation ? (
            <ReservationInfo reservation={reservation} />
          ) : (
            <span className="text-sm text-muted-foreground">예약 가능</span>
          )}
        </div>

        {reservation && (
          <Badge className={cn('text-xs', STATUS_COLORS[reservation.status])}>
            {STATUS_LABELS[reservation.status]}
          </Badge>
        )}
      </div>
    </button>
  );
}

function ReservationInfo({ reservation }: { reservation: Reservation }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm">{reservation.purpose}</span>
        <span className="text-xs text-muted-foreground">
          ({reservation.start_time} - {reservation.end_time})
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <User className="h-3 w-3" />
          <span>{reservation.booker_name}</span>
        </div>
        {reservation.team && (
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{reservation.team.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
