import { useState, useMemo } from 'react';
import { format, parseISO, isToday, isTomorrow, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Loader2, Calendar, Search } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { MobileHeader } from '../../components/mobile/MobileHeader';
import { MobileBottomNav } from '../../components/mobile/MobileBottomNav';
import { MobileReservationCard } from '../../components/mobile/MobileReservationCard';
import { ReservationDetail } from '../../components/reservation/ReservationDetail';
import { useRooms } from '../../hooks/useRooms';
import { useReservations } from '../../hooks/useReservations';
import type { Reservation } from '../../types';

export function MobileReservationList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const today = new Date();
  const startDate = format(today, 'yyyy-MM-dd');
  const endDate = format(addDays(today, 30), 'yyyy-MM-dd');

  const { rooms } = useRooms();
  const { reservations, loading, refetch } = useReservations({
    start_date: startDate,
    end_date: endDate,
  });

  // Create room index map
  const roomIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    rooms.forEach((room, index) => {
      map.set(room.id, index);
    });
    return map;
  }, [rooms]);

  // Attach room info to reservations
  const reservationsWithRoom = useMemo(() => {
    return reservations.map(r => ({
      ...r,
      room: rooms.find(room => room.id === r.room_id),
    }));
  }, [reservations, rooms]);

  // Filter and group reservations
  const groupedReservations = useMemo(() => {
    let filtered = reservationsWithRoom;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.purpose.toLowerCase().includes(query) ||
        r.booker_name.toLowerCase().includes(query) ||
        r.room?.name.toLowerCase().includes(query)
      );
    }

    // Group by date
    const groups = new Map<string, typeof filtered>();
    filtered.forEach(reservation => {
      const date = reservation.reservation_date;
      if (!groups.has(date)) {
        groups.set(date, []);
      }
      groups.get(date)!.push(reservation);
    });

    // Sort each group by start time
    groups.forEach((list) => {
      list.sort((a, b) => a.start_time.localeCompare(b.start_time));
    });

    // Convert to sorted array
    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b));
  }, [reservationsWithRoom, searchQuery]);

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) {
      return `오늘 (${format(date, 'M월 d일', { locale: ko })})`;
    }
    if (isTomorrow(date)) {
      return `내일 (${format(date, 'M월 d일', { locale: ko })})`;
    }
    return format(date, 'M월 d일 (EEE)', { locale: ko });
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileHeader selectedDate={today} title="일정 목록" />

      {/* Search */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="회의실, 목적, 예약자 검색"
            className="pl-9 h-10 bg-gray-50 border-gray-200"
          />
        </div>
      </div>

      <main className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : groupedReservations.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchQuery ? '검색 결과가 없습니다' : '예약 내역이 없습니다'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedReservations.map(([date, dateReservations]) => (
              <div key={date}>
                <h2 className="text-sm font-semibold text-gray-500 mb-3 px-1">
                  {getDateLabel(date)}
                </h2>
                <div className="space-y-3">
                  {dateReservations.map((reservation) => (
                    <MobileReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      colorIndex={roomIndexMap.get(reservation.room_id) || 0}
                      onSelect={handleReservationSelect}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <MobileBottomNav />

      {/* Reservation Detail Modal */}
      <ReservationDetail
        open={detailOpen}
        onClose={handleDetailClose}
        onUpdate={handleDetailUpdate}
        reservation={selectedReservation}
        rooms={rooms}
      />
    </div>
  );
}
