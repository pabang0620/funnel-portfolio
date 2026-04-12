// 30분 단위 시간 슬롯 (예약 가능 시간대: 09:30 ~ 18:30, 19:00은 종료시간 참조용)
export const TIME_SLOTS = [
  '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'
];

// 1시간 단위 시간 슬롯 (캘린더 표시용)
export const HOUR_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

// 5분 단위 시간 슬롯 (예약 폼용: 09:00 ~ 19:30)
export const TIME_SLOTS_5MIN: string[] = (() => {
  const slots: string[] = [];
  for (let h = 9; h <= 19; h++) {
    for (let m = 0; m < 60; m += 5) {
      if (h === 19 && m > 30) break;
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
})();

export function normalizeTime(time: string): string {
  if (!time) return '';
  const parts = time.split(':');
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  }
  return time;
}

export function parseTimeToMinutes(time: string): number {
  const normalized = normalizeTime(time);
  const [hours, minutes] = normalized.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

export function getReservationHeight(startTime: string, endTime: string): number {
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);
  return (endMinutes - startMinutes) / 60;
}

export function getReservationTop(startTime: string): number {
  const startMinutes = parseTimeToMinutes(startTime);
  const baseMinutes = 9 * 60;
  return (startMinutes - baseMinutes) / 60;
}

export const STATUS_LABELS: Record<string, string> = {
  reserved: '예약됨',
  completed: '사용완료',
  cancelled: '취소됨'
};

export const STATUS_COLORS: Record<string, string> = {
  reserved: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-500'
};
