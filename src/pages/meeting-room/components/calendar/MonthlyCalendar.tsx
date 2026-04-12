import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';
import type { Reservation } from '../../types';

interface MonthlyCalendarProps {
  year: number;
  month: number;
  reservations: Reservation[];
  onDateClick: (date: string) => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function MonthlyCalendar({
  year,
  month,
  reservations,
  onDateClick,
}: MonthlyCalendarProps) {
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: (number | null)[] = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, [year, month]);

  const reservationsByDate = useMemo(() => {
    const map = new Map<string, Reservation[]>();

    // reservations가 배열인지 확인
    const list = Array.isArray(reservations) ? reservations : [];

    list.forEach((r) => {
      const date = r.reservation_date;
      if (!map.has(date)) {
        map.set(date, []);
      }
      map.get(date)!.push(r);
    });

    return map;
  }, [reservations]);

  const formatDate = (day: number) => {
    const m = month.toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const today = new Date();
  const isToday = (day: number) => {
    return (
      today.getFullYear() === year &&
      today.getMonth() + 1 === month &&
      today.getDate() === day
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {year}년 {month}월
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((day, i) => (
            <div
              key={day}
              className={cn(
                'text-center text-sm font-medium py-2',
                i === 0 && 'text-red-500',
                i === 6 && 'text-blue-500'
              )}
            >
              {day}
            </div>
          ))}

          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="h-24" />;
            }

            const date = formatDate(day);
            const dayReservations = reservationsByDate.get(date) || [];
            const reservedCount = dayReservations.filter(
              (r) => r.status === 'reserved'
            ).length;

            return (
              <button
                key={day}
                onClick={() => onDateClick(date)}
                className={cn(
                  'h-24 p-1 border rounded-lg text-left transition-colors hover:bg-accent',
                  isToday(day) && 'ring-2 ring-primary'
                )}
              >
                <div
                  className={cn(
                    'text-sm font-medium',
                    index % 7 === 0 && 'text-red-500',
                    index % 7 === 6 && 'text-blue-500'
                  )}
                >
                  {day}
                </div>

                {reservedCount > 0 && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {reservedCount}건
                  </Badge>
                )}

                <div className="mt-1 space-y-0.5">
                  {dayReservations.slice(0, 2).map((r) => (
                    <div
                      key={r.id}
                      className="text-xs truncate text-muted-foreground"
                    >
                      {r.start_time} {r.purpose}
                    </div>
                  ))}
                  {dayReservations.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayReservations.length - 2}건
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
