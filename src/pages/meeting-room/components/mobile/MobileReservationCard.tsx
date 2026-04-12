import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Clock, MapPin, User, Users, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getRoomColor } from '../../lib/theme';
import { normalizeTime, STATUS_LABELS } from '../../lib/constants';
import type { Reservation } from '../../types';

interface MobileReservationCardProps {
  reservation: Reservation;
  colorIndex: number;
  showDate?: boolean;
  onSelect: (reservation: Reservation) => void;
}

export function MobileReservationCard({
  reservation,
  colorIndex,
  showDate = false,
  onSelect
}: MobileReservationCardProps) {
  const color = getRoomColor(colorIndex);
  const isActive = reservation.status === 'reserved';
  const isCancelled = reservation.status === 'cancelled';

  return (
    <button
      onClick={() => onSelect(reservation)}
      className={cn(
        'w-full text-left bg-white rounded-lg shadow-sm border overflow-hidden transition-all hover:shadow-md',
        isCancelled ? 'border-gray-200 opacity-60' : 'border-gray-100'
      )}
    >
      <div className="flex">
        <div
          className="w-1.5 shrink-0"
          style={{ backgroundColor: isCancelled ? '#9CA3AF' : color }}
        />
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className={cn(
                'font-semibold',
                isCancelled ? 'text-gray-500 line-through' : 'text-gray-900'
              )}>
                {reservation.purpose}
              </h3>
              {showDate && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {format(parseISO(reservation.reservation_date), 'M월 d일 (EEE)', { locale: ko })}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                isActive ? 'bg-blue-100 text-blue-700' :
                isCancelled ? 'bg-gray-100 text-gray-500' :
                'bg-green-100 text-green-700'
              )}>
                {STATUS_LABELS[reservation.status]}
              </span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>
                {normalizeTime(reservation.start_time)} - {normalizeTime(reservation.end_time)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{reservation.room?.name || '회의실'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-gray-400" />
              <span>{reservation.booker_name}</span>
            </div>
            {reservation.attendees && (
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="truncate max-w-32">{reservation.attendees}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
