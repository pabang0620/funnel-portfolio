import { Building2, Users, Clock } from 'lucide-react';
import { getRoomColor } from '../../lib/theme';
import { normalizeTime } from '../../lib/constants';
import type { Room, Reservation } from '../../types';

interface MobileRoomCardProps {
  room: Room;
  reservations: Reservation[];
  colorIndex: number;
  onReservationSelect?: (reservation: Reservation) => void;
}

export function MobileRoomCard({ room, reservations, colorIndex, onReservationSelect }: MobileRoomCardProps) {
  const color = getRoomColor(colorIndex);
  const activeReservations = reservations.filter(r => r.status === 'reserved');
  const hasReservations = activeReservations.length > 0;

  return (
    <div className="w-full text-left bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden flex">
      <div
        className="w-1.5 shrink-0"
        style={{ backgroundColor: color }}
      />
      <div className="flex-1 p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{room.name}</h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <Building2 className="w-4 h-4" />
              <span>{room.floor}</span>
              {room.capacity && (
                <>
                  <Users className="w-4 h-4 ml-2" />
                  <span>{room.capacity}명</span>
                </>
              )}
            </div>
          </div>
          {hasReservations && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
              {activeReservations.length}건
            </span>
          )}
        </div>

        {hasReservations ? (
          <div className="space-y-2">
            {activeReservations.slice(0, 3).map((reservation) => (
              <button
                key={reservation.id}
                onClick={() => onReservationSelect?.(reservation)}
                className="w-full flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm hover:bg-gray-100 transition-colors text-left"
              >
                <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-gray-600 shrink-0">
                  {normalizeTime(reservation.start_time)} - {normalizeTime(reservation.end_time)}
                </span>
                <span className="text-gray-900 font-medium truncate">
                  {reservation.purpose}
                </span>
              </button>
            ))}
            {activeReservations.length > 3 && (
              <p className="text-xs text-gray-500 text-center">
                +{activeReservations.length - 3}건 더보기
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            오늘 예약이 없습니다
          </p>
        )}
      </div>
    </div>
  );
}
