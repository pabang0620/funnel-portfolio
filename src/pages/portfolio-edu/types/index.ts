export interface User {
  id: string
  email: string
  name: string
  is_admin: boolean
  team?: string | null
  part?: string | null
}

export interface Curriculum {
  id: string
  name: string
  description: string
  type: string
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
  instructors?: { id: string; name: string; team: string; part: string }[]
  lecture_count?: number
  lectures_done?: number
  lectures_ongoing?: number
  lectures_upcoming?: number
  assignment_count?: number
  student_count?: number
  attendance_rate?: number
  submission_rate?: number
  thumbnail?: string
}

export interface Lecture {
  id: string
  curriculum_id: string
  lecture_number: number
  name: string
  type?: string
  description?: string
  start_at?: string
  end_at?: string
  status: string
  max_capacity?: number
  student_count?: number
  enrolled_count?: number
  attendance_rate?: number
  created_at?: string
}

export interface Attendance {
  id: string
  lecture_id: string
  employee_id: string
  employee_name?: string
  status: 'pending' | 'enrolled' | 'rejected' | 'present' | 'late' | 'absent'
  note?: string
  enrolled_at?: string
  approved_at?: string
  recorded_at?: string
}

export interface Assignment {
  id: string
  lecture_id: string
  curriculum_id?: string
  curriculum_name?: string
  lecture_name?: string
  title: string
  description?: string
  start_date?: string
  deadline?: string
  passing_score?: number | null
  created_at: string
  updated_at: string
  submission_count?: number
  enrolled_count?: number
}

export interface Resource {
  id: string
  title: string
  content: string | null
  type: string | null
  thumbnail_url: string | null
  created_by: string | null
  created_by_name: string | null
  updated_by: string | null
  updated_by_name: string | null
  created_at: string
  updated_at: string
}

export interface RubricItem {
  idx: number
  group: string
  label: string | null
  type: 'score' | 'text'
}

export interface Rubric {
  id: string
  curriculum_id: string
  items: RubricItem[]
  created_by?: string
  created_at?: string
  updated_at?: string
}

export type RubricScores = Record<string, number | string>

export interface CurriculumStudent {
  id: string
  name: string
  email?: string
  team?: string
  part?: string
  attended_count?: number
  total_lecture_count?: number
}

export interface AdminRole {
  id: string
  employee_id: string
  name: string
  email: string
  team: string
  part: string
  created_at: string
}

export interface Instructor {
  id: string
  name: string
  div: string
  team: string
  part: string
}
