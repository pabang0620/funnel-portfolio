export interface Room {
  id: string;
  name: string;
  floor: string;
  description?: string;
  image_url?: string;
  capacity?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Team {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface Reservation {
  id: string;
  room_id: string;
  team_id: string;
  booker_name: string;
  purpose: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  status: 'reserved' | 'completed' | 'cancelled';
  memo?: string;
  attendees?: string;
  room?: Room;
  team?: Team;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
  reservation?: Reservation;
}

export interface CreateReservationRequest {
  room_id: string;
  team_id: string;
  booker_name: string;
  booker_email?: string;
  purpose: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  password: string;
  attendees?: string;
  attendee_emails?: string;
}

export interface ReservationQueryParams {
  room_id?: string;
  date?: string;
  start_date?: string;
  end_date?: string;
  team_id?: string;
  status?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
}

export interface OrgDepartment {
  id: string;
  name: string;
  parent_id: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  children?: OrgDepartment[];
  members_count?: number;
}

export interface OrgMember {
  id: string;
  department_id: string;
  name: string;
  email?: string;
  position?: string;
  display_order: number;
  employment_status: 1 | 0;
  created_at: string;
}

export interface CreateDepartmentRequest {
  name: string;
  parent_id?: string | null;
  display_order?: number;
}

export interface UpdateDepartmentRequest {
  name?: string;
  parent_id?: string | null;
  display_order?: number;
  is_active?: boolean;
}

export interface CreateMemberRequest {
  department_id: string;
  name: string;
  email?: string;
  position?: string;
  display_order?: number;
  employment_status?: 1 | 0;
}

export interface UpdateMemberRequest {
  name?: string;
  email?: string;
  position?: string;
  display_order?: number;
  employment_status?: 1 | 0;
}

export interface MoveMemberRequest {
  target_department_id: string;
  display_order: number;
}
