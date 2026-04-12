import type { Ad } from './ad'

export interface ReferenceSet {
  id: string
  user_id?: string
  name: string
  completed: boolean
  completed_at: string | null
  updated_at: string
  item_count: number
  items: ReferenceItem[]
  created_at: string
}

export interface ReferenceItem {
  id: string
  set_id: string
  url: string
  url_type: 'image' | 'video' | 'link'
  note: string | null
  created_at: string
  ad_id: string | null
  ad_data: Ad | null
}

export interface ReferenceSetListResponse {
  items: ReferenceSet[]
  total: number
  has_more: boolean
}
