/**
 * mockService.ts
 * Full in-memory CRUD for meeting-room portfolio demo.
 * All dates are computed relative to today so the calendar always shows data.
 */
import type {
  Room,
  Team,
  Reservation,
  TimeSlot,
  CalendarEvent,
  OrgDepartment,
  OrgMember,
  CreateReservationRequest,
} from '../../pages/meeting-room/types';

import roomsJson from './rooms.json';
import teamsJson from './teams.json';
import orgJson from './organization.json';

// ── helpers ──────────────────────────────────────────────────────────────────

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function dateStr(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function uuid(): string {
  return `mock-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ── static data ───────────────────────────────────────────────────────────────

let rooms: Room[] = (roomsJson as unknown as Room[]);
let teams: Team[] = (teamsJson as unknown as Team[]);

const ROOM_IDS = ['room-1', 'room-2', 'room-3', 'room-4', 'room-5'];
const TEAM_IDS = ['team-1', 'team-2', 'team-3', 'team-4', 'team-5'];

// ── seed reservations ─────────────────────────────────────────────────────────

function buildSeedReservations(): Reservation[] {
  const teamData = [
    { id: 'team-1', name: '개발팀' },
    { id: 'team-2', name: '마케팅팀' },
    { id: 'team-3', name: '디자인팀' },
    { id: 'team-4', name: '영업팀' },
    { id: 'team-5', name: '경영지원팀' },
  ];
  const roomData = [
    { id: 'room-1', name: '한강룸', floor: '3F', capacity: 20, is_active: true },
    { id: 'room-2', name: '남산룸', floor: '3F', capacity: 12, is_active: true },
    { id: 'room-3', name: '북악룸', floor: '4F', capacity: 6, is_active: true },
    { id: 'room-4', name: '관악룸', floor: '4F', capacity: 8, is_active: true },
    { id: 'room-5', name: '인왕룸', floor: '5F', capacity: 10, is_active: true },
  ];

  const make = (
    offset: number,
    roomIdx: number,
    teamIdx: number,
    start: string,
    end: string,
    purpose: string,
    booker: string,
    attendees?: string,
    status: 'reserved' | 'completed' | 'cancelled' = 'reserved'
  ): Reservation => ({
    id: `res-${offset}-${roomIdx}-${start.replace(':', '')}`,
    room_id: ROOM_IDS[roomIdx],
    team_id: TEAM_IDS[teamIdx],
    booker_name: booker,
    purpose,
    reservation_date: dateStr(offset),
    start_time: start,
    end_time: end,
    status,
    attendees,
    room: roomData[roomIdx] as Room,
    team: teamData[teamIdx] as Team,
  });

  return [
    // Today
    make(0, 0, 0, '09:30', '10:30', '스프린트 플래닝', '홍길동', '김지수, 이민준'),
    make(0, 1, 1, '10:00', '11:00', '마케팅 전략 회의', '이민준', '박소연'),
    make(0, 2, 2, '11:00', '12:00', 'UI 리뷰', '최현우'),
    make(0, 3, 3, '14:00', '15:00', '고객사 미팅', '강도현', '윤서진'),
    make(0, 0, 4, '15:00', '16:00', '주간 팀 미팅', '임재원', '한예린'),
    make(0, 4, 0, '16:00', '17:00', '아키텍처 검토', '홍길동'),
    make(0, 1, 1, '17:00', '18:00', '캠페인 분석', '박소연'),

    // Tomorrow
    make(1, 0, 0, '09:30', '11:00', '기술 스펙 검토', '김지수', '홍길동, 이민준'),
    make(1, 1, 2, '10:30', '12:00', '디자인 시스템 회의', '정다은', '최현우'),
    make(1, 3, 3, '14:00', '15:30', '파트너사 미팅', '윤서진'),
    make(1, 2, 4, '15:00', '16:00', '예산 검토', '임재원', '한예린'),
    make(1, 4, 1, '16:30', '18:00', 'SNS 콘텐츠 기획', '이민준', '박소연'),

    // Day after tomorrow
    make(2, 0, 0, '10:00', '12:00', '개발팀 워크샵', '홍길동', '김지수, 이민준, 최현우'),
    make(2, 1, 3, '13:00', '14:00', '영업 전략 수립', '강도현'),
    make(2, 2, 2, '14:00', '15:00', '프로토타입 리뷰', '최현우', '정다은'),
    make(2, 3, 1, '15:30', '17:00', 'A/B 테스트 분석', '박소연'),

    // 3 days ahead
    make(3, 1, 0, '09:30', '10:30', '코드 리뷰 세션', '이민준'),
    make(3, 0, 1, '11:00', '13:00', '분기 마케팅 회의', '박소연', '이민준, 강도현'),
    make(3, 4, 4, '14:00', '15:00', '채용 면접', '한예린'),
    make(3, 2, 3, '16:00', '17:30', '파트너 협의', '강도현', '윤서진'),

    // 4 days ahead
    make(4, 0, 0, '10:00', '11:00', '릴리즈 체크리스트', '홍길동'),
    make(4, 1, 2, '11:30', '12:30', '사용자 리서치', '정다은'),
    make(4, 3, 1, '14:00', '15:00', '광고 집행 계획', '이민준', '박소연'),

    // Yesterday (completed)
    make(-1, 0, 0, '10:00', '11:00', '백로그 정리', '홍길동', undefined, 'completed'),
    make(-1, 1, 1, '14:00', '15:00', '콘텐츠 기획', '이민준', undefined, 'completed'),
    make(-1, 2, 3, '15:30', '16:30', '견적서 검토', '강도현', undefined, 'completed'),

    // Next week
    make(7, 0, 0, '09:30', '11:30', '스프린트 리뷰', '홍길동', '전체 팀'),
    make(7, 1, 1, '13:00', '14:00', '월간 마케팅 보고', '이민준'),
    make(8, 0, 2, '10:00', '12:00', '디자인 스프린트', '최현우', '정다은'),
    make(8, 3, 4, '14:00', '15:30', '인사 위원회', '임재원'),
  ];
}

let reservations: Reservation[] = buildSeedReservations();

// ── mock members (Slack-like) ─────────────────────────────────────────────────

const slackMembers = [
  { id: 'U001', name: 'hong', real_name: '홍길동', email: 'hong@funnelzone.com' },
  { id: 'U002', name: 'jisu', real_name: '김지수', email: 'jisu@funnelzone.com' },
  { id: 'U003', name: 'minjun', real_name: '이민준', email: 'minjun@funnelzone.com' },
  { id: 'U004', name: 'soyeon', real_name: '박소연', email: 'soyeon@funnelzone.com' },
  { id: 'U005', name: 'hyunwoo', real_name: '최현우', email: 'hyunwoo@funnelzone.com' },
  { id: 'U006', name: 'daeun', real_name: '정다은', email: 'daeun@funnelzone.com' },
  { id: 'U007', name: 'dohyun', real_name: '강도현', email: 'dohyun@funnelzone.com' },
  { id: 'U008', name: 'seojin', real_name: '윤서진', email: 'seojin@funnelzone.com' },
  { id: 'U009', name: 'jaewon', real_name: '임재원', email: 'jaewon@funnelzone.com' },
  { id: 'U010', name: 'yerin', real_name: '한예린', email: 'yerin@funnelzone.com' },
];

// ── calendar events (CEO) ─────────────────────────────────────────────────────

const calendarEvents: CalendarEvent[] = [
  {
    id: 'cal-1',
    title: '투자자 미팅',
    start: `${dateStr(0)}T10:00:00`,
    end: `${dateStr(0)}T11:00:00`,
    location: '서울 본사',
    description: 'Series B 투자 관련 논의',
  },
  {
    id: 'cal-2',
    title: '전략 워크샵',
    start: `${dateStr(1)}T14:00:00`,
    end: `${dateStr(1)}T17:00:00`,
    description: '하반기 전략 수립 워크샵',
  },
  {
    id: 'cal-3',
    title: '파트너 콘퍼런스',
    start: `${dateStr(3)}T09:00:00`,
    end: `${dateStr(3)}T18:00:00`,
    location: '코엑스',
  },
  {
    id: 'cal-4',
    title: '이사회',
    start: `${dateStr(7)}T10:00:00`,
    end: `${dateStr(7)}T12:00:00`,
    description: '분기 이사회 보고',
  },
];

// ── time slots ────────────────────────────────────────────────────────────────

function generateSlots(roomId: string, date: string): TimeSlot[] {
  const times = [
    '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  ];
  const dayReservations = reservations.filter(
    (r) => r.room_id === roomId && r.reservation_date === date && r.status === 'reserved'
  );

  return times.map((t) => {
    const existing = dayReservations.find((r) => r.start_time <= t && r.end_time > t);
    return {
      start_time: t,
      end_time: (() => {
        const [h, m] = t.split(':').map(Number);
        const total = h * 60 + m + 30;
        return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
      })(),
      is_available: !existing,
      reservation: existing,
    };
  });
}

// ── org data ──────────────────────────────────────────────────────────────────

const orgDepartments: OrgDepartment[] = orgJson as OrgDepartment[];
const orgMembers: OrgMember[] = [
  { id: 'm-1', department_id: 'dept-3', name: '홍길동', email: 'hong@funnelzone.com', position: '시니어 개발자', display_order: 1, employment_status: 1, created_at: '2024-01-01T00:00:00Z' },
  { id: 'm-2', department_id: 'dept-3', name: '김지수', email: 'jisu@funnelzone.com', position: '개발자', display_order: 2, employment_status: 1, created_at: '2024-01-01T00:00:00Z' },
  { id: 'm-3', department_id: 'dept-5', name: '이민준', email: 'minjun@funnelzone.com', position: '마케터', display_order: 1, employment_status: 1, created_at: '2024-01-01T00:00:00Z' },
  { id: 'm-4', department_id: 'dept-5', name: '박소연', email: 'soyeon@funnelzone.com', position: '콘텐츠 마케터', display_order: 2, employment_status: 1, created_at: '2024-01-01T00:00:00Z' },
  { id: 'm-5', department_id: 'dept-6', name: '최현우', email: 'hyunwoo@funnelzone.com', position: 'UI 디자이너', display_order: 1, employment_status: 1, created_at: '2024-01-01T00:00:00Z' },
];

// ── mock API functions ────────────────────────────────────────────────────────

export async function mockFetchRooms(): Promise<Room[]> {
  return [...rooms];
}

export async function mockFetchRoom(id: string): Promise<Room> {
  const room = rooms.find((r) => r.id === id);
  if (!room) throw new Error(`Room ${id} not found`);
  return { ...room };
}

export async function mockCreateRoom(data: Partial<Room>): Promise<Room> {
  const newRoom: Room = {
    id: uuid(),
    name: data.name || '새 회의실',
    floor: data.floor || '1F',
    description: data.description,
    image_url: data.image_url,
    capacity: data.capacity,
    is_active: true,
    created_at: new Date().toISOString(),
  };
  rooms = [...rooms, newRoom];
  return newRoom;
}

export async function mockUpdateRoom(id: string, data: Partial<Room>): Promise<Room> {
  rooms = rooms.map((r) => (r.id === id ? { ...r, ...data } : r));
  const updated = rooms.find((r) => r.id === id);
  if (!updated) throw new Error(`Room ${id} not found`);
  return updated;
}

export async function mockFetchTeams(): Promise<Team[]> {
  return [...teams];
}

export async function mockCreateTeam(name: string): Promise<Team> {
  const newTeam: Team = {
    id: uuid(),
    name,
    display_order: teams.length + 1,
    is_active: true,
    created_at: new Date().toISOString(),
  };
  teams = [...teams, newTeam];
  return newTeam;
}

export async function mockUpdateTeam(id: string, data: Partial<Team>): Promise<Team> {
  teams = teams.map((t) => (t.id === id ? { ...t, ...data } : t));
  const updated = teams.find((t) => t.id === id);
  if (!updated) throw new Error(`Team ${id} not found`);
  return updated;
}

export async function mockDeleteTeam(id: string): Promise<void> {
  teams = teams.filter((t) => t.id !== id);
}

export async function mockFetchSlots(roomId: string, date: string): Promise<TimeSlot[]> {
  return generateSlots(roomId, date);
}

export async function mockFetchReservations(params: {
  room_id?: string;
  date?: string;
  start_date?: string;
  end_date?: string;
  team_id?: string;
  status?: string;
}): Promise<Reservation[]> {
  let filtered = [...reservations];

  if (params.room_id) filtered = filtered.filter((r) => r.room_id === params.room_id);
  if (params.date) filtered = filtered.filter((r) => r.reservation_date === params.date);
  if (params.start_date) filtered = filtered.filter((r) => r.reservation_date >= params.start_date!);
  if (params.end_date) filtered = filtered.filter((r) => r.reservation_date <= params.end_date!);
  if (params.team_id) filtered = filtered.filter((r) => r.team_id === params.team_id);
  if (params.status) filtered = filtered.filter((r) => r.status === params.status);

  // Attach room and team objects
  return filtered.map((r) => ({
    ...r,
    room: rooms.find((rm) => rm.id === r.room_id) || r.room,
    team: teams.find((t) => t.id === r.team_id) || r.team,
  }));
}

export async function mockCreateReservation(data: CreateReservationRequest): Promise<Reservation> {
  // Check conflicts
  const conflicts = reservations.filter(
    (r) =>
      r.room_id === data.room_id &&
      r.reservation_date === data.reservation_date &&
      r.status === 'reserved' &&
      !(r.end_time <= data.start_time || r.start_time >= data.end_time)
  );
  if (conflicts.length > 0) {
    throw new Error('해당 시간에 이미 예약이 있습니다');
  }

  const room = rooms.find((r) => r.id === data.room_id);
  const team = teams.find((t) => t.id === data.team_id);

  const newReservation: Reservation = {
    id: uuid(),
    room_id: data.room_id,
    team_id: data.team_id,
    booker_name: data.booker_name,
    purpose: data.purpose,
    reservation_date: data.reservation_date,
    start_time: data.start_time,
    end_time: data.end_time,
    status: 'reserved',
    attendees: data.attendees,
    room,
    team,
  };

  reservations = [...reservations, newReservation];
  return newReservation;
}

export async function mockCancelReservation(id: string, _password: string): Promise<void> {
  // In demo mode, accept any password
  reservations = reservations.map((r) =>
    r.id === id ? { ...r, status: 'cancelled' as const } : r
  );
}

export async function mockCompleteReservation(id: string, _password: string, actualEndTime?: string): Promise<void> {
  reservations = reservations.map((r) =>
    r.id === id ? { ...r, status: 'completed' as const, end_time: actualEndTime || r.end_time } : r
  );
}

export async function mockUpdateReservation(
  id: string,
  data: {
    password: string;
    purpose?: string;
    start_time?: string;
    end_time?: string;
    attendees?: string;
    memo?: string;
  }
): Promise<Reservation> {
  reservations = reservations.map((r) => (r.id === id ? { ...r, ...data } : r));
  const updated = reservations.find((r) => r.id === id);
  if (!updated) throw new Error(`Reservation ${id} not found`);
  return updated;
}

export async function mockVerifyPassword(_id: string, _password: string): Promise<boolean> {
  // In demo mode, accept any password
  return true;
}

export async function mockGetSlackMembers() {
  return [...slackMembers];
}

export async function mockFetchCalendarEvents(
  _startDate: string,
  _endDate: string
): Promise<CalendarEvent[]> {
  return [...calendarEvents];
}

export async function mockFetchOrganization(): Promise<OrgDepartment[]> {
  return [...orgDepartments];
}

export async function mockFetchOrgMembers(_departmentId?: string): Promise<OrgMember[]> {
  if (_departmentId) return orgMembers.filter((m) => m.department_id === _departmentId);
  return [...orgMembers];
}

export async function mockUploadRoomImage(_file: File): Promise<{ filename: string; url: string }> {
  return { filename: 'demo-image.jpg', url: '/images/demo-room.jpg' };
}
