export interface User {
  id: string
  username: string
  name: string
  role: 1 | 2  // 1=관리자, 2=일반직원
  created_at: string
  updated_at: string
}

export interface Folder {
  id: string
  name: string
  parent_id: string | null
  is_admin_only: boolean
  s3_id?: string
  created_by?: string
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  children?: Folder[]
}

export interface FileItem {
  id: string
  folder_id: string
  file_name: string
  s3_id: string
  size: number
  mime_type: string | null
  created_date: string | null
  creator: string | null
  event_name: string | null
  uploaded_by: string
  uploader_name: string
  upload_date: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  preview_url?: string | null
}
