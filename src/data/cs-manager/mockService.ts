import scriptsData from './scripts.json'
import productsData from './products.json'
import usersData from './users.json'

// In-memory stores (mutations happen in memory only, reset on page reload)
let scripts = [...scriptsData] as Script[]
let products = [...productsData] as Product[]
let users = [...usersData] as User[]

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TranscriptSegment {
  id: number
  start: number
  text: string
}

export interface Transcript {
  text: string
  language: string
  duration: number
  segments?: TranscriptSegment[]
}

export interface Script {
  id: string
  file_name: string
  s3_key: string
  file_size: number
  calling_date: string
  brand_name: string
  consultant_name: string
  user_id: string
  phone_number: string
  consultation_date: string
  category_1: string | null
  category_2: string | null
  category_3: string | null
  match_status: string
  transcript: Transcript | null
}

export interface Product {
  id: string
  product_id: string
  name: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  name: string
  team: string
  status: 'approved' | 'pending' | 'inactive' | 'deleted'
  admin: boolean
  created_at: string
  updated_at: string
}

export interface ScriptFilters {
  s3_id?: string
  user_id?: string
  date_from?: string
  date_to?: string
  file_name?: string
  limit?: number
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const mockCurrentUser: User = {
  id: 'admin-001',
  email: 'admin@company.com',
  name: '관리자',
  team: '운영팀',
  status: 'approved',
  admin: true,
  created_at: '2025-01-01T10:00:00.000Z',
  updated_at: '2025-01-01T10:00:00.000Z',
}

// ─── Products ────────────────────────────────────────────────────────────────

export function fetchProducts(): Product[] {
  return products
}

// ─── Users ───────────────────────────────────────────────────────────────────

export function fetchAllUsers(): User[] {
  return users.filter(u => u.status !== 'deleted')
}

export function addUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): User {
  const newUser: User = {
    ...userData,
    id: `u-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  users = [...users, newUser]
  return newUser
}

export function updateUser(userId: string, updates: Partial<User>): User {
  users = users.map(u =>
    u.id === userId ? { ...u, ...updates, updated_at: new Date().toISOString() } : u
  )
  const updated = users.find(u => u.id === userId)
  if (!updated) throw new Error('User not found')
  return updated
}

export function deleteUser(userId: string): void {
  users = users.map(u =>
    u.id === userId ? { ...u, status: 'deleted' as const, updated_at: new Date().toISOString() } : u
  )
}

// ─── Scripts ─────────────────────────────────────────────────────────────────

export function fetchScripts(filters: ScriptFilters = {}): { success: boolean; data: Script[]; count: number } {
  let result = [...scripts]

  if (filters.s3_id) {
    result = result.filter(s => s.s3_key.startsWith(filters.s3_id!))
  }
  if (filters.user_id) {
    result = result.filter(s => s.user_id === filters.user_id)
  }
  if (filters.date_from) {
    result = result.filter(s => s.calling_date >= filters.date_from!)
  }
  if (filters.date_to) {
    result = result.filter(s => s.calling_date <= filters.date_to!)
  }
  if (filters.file_name) {
    result = result.filter(s =>
      s.file_name.toLowerCase().includes(filters.file_name!.toLowerCase())
    )
  }
  if (filters.limit) {
    result = result.slice(0, filters.limit)
  }

  return { success: true, data: result, count: result.length }
}

export function getTotalCount(): number {
  return scripts.length
}

export function deleteScript(scriptId: string): { success: boolean; msg: string } {
  scripts = scripts.filter(s => s.id !== scriptId)
  return { success: true, msg: '파일이 삭제되었습니다.' }
}

// ─── Transcripts ─────────────────────────────────────────────────────────────

export function extractTranscript(scriptId: string): { transcript: Transcript; already_extracted: boolean } {
  const script = scripts.find(s => s.id === scriptId)
  if (!script) throw new Error('Script not found')

  if (script.transcript) {
    return { transcript: script.transcript, already_extracted: true }
  }

  // Generate mock transcript
  const mockTranscript: Transcript = {
    text: `${script.consultant_name} 상담사와 ${script.phone_number} 고객의 통화 내용입니다. ${script.category_1} 관련 문의가 접수되었습니다.`,
    language: 'ko',
    duration: Math.floor(script.file_size / 16000),
    segments: [
      { id: 1, start: 0, text: `안녕하세요, ${script.brand_name} 고객 서비스입니다.` },
      { id: 2, start: 4, text: `무엇을 도와드릴까요?` },
      { id: 3, start: 8, text: `${script.category_1} 관련하여 문의하고 싶습니다.` },
      { id: 4, start: 12, text: `네, 확인해 드리겠습니다.` },
    ],
  }

  scripts = scripts.map(s =>
    s.id === scriptId ? { ...s, transcript: mockTranscript } : s
  )

  return { transcript: mockTranscript, already_extracted: false }
}

export function updateTranscript(scriptId: string, transcript: Transcript): { success: boolean; msg: string } {
  scripts = scripts.map(s =>
    s.id === scriptId ? { ...s, transcript } : s
  )
  return { success: true, msg: '스크립트가 저장되었습니다.' }
}

export function deleteTranscript(scriptId: string): { success: boolean; msg: string } {
  scripts = scripts.map(s =>
    s.id === scriptId ? { ...s, transcript: null } : s
  )
  return { success: true, msg: '스크립트가 삭제되었습니다.' }
}

// ─── Upload (mock) ────────────────────────────────────────────────────────────

export interface UploadPreviewResult {
  filename: string
  s3_path: string
  brand_name: string
  consultant_name: string
  calling_date: string
  is_duplicate: boolean
  overwrite_mode?: string
}

export function previewUpload(files: File[]): UploadPreviewResult[] {
  return files.map(file => ({
    filename: file.name,
    s3_path: `7c9e6679-7425-40de-944b-e07fc1f90ae7/u001/2026-01-10/${file.name}`,
    brand_name: 'Udit',
    consultant_name: '김철수',
    calling_date: '2026-01-10',
    is_duplicate: false,
  }))
}

export function confirmUpload(previewResults: UploadPreviewResult[]): Array<{ filename: string; status: string; s3_key?: string }> {
  return previewResults.map(r => ({
    filename: r.filename,
    status: 'success',
    s3_key: r.s3_path,
  }))
}

// ─── Presigned URL (mock) ─────────────────────────────────────────────────────

export function getPresignedUrl(s3Key: string): string {
  // Return a placeholder URL – actual S3 is not accessible in the demo
  return `https://example.com/mock-audio/${s3Key.split('/').pop()}`
}
