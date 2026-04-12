import { cn } from '../../lib/utils';
import type { Reservation } from '../../types';

interface EventBarProps {
  reservation: Reservation;
  color: string;
  onClick?: () => void;
}

export function EventBar({ reservation, color, onClick }: EventBarProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-1.5 py-0.5 text-left text-xs font-medium text-white rounded truncate',
        'hover:opacity-90 transition-opacity'
      )}
      style={{ backgroundColor: color }}
    >
      {reservation.start_time.slice(0, 5)} {reservation.team?.name || '팀없음'} {reservation.purpose} {reservation.room?.name || ''}
    </button>
  );
}
