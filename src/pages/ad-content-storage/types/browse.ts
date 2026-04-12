import type { CategoryLabel, AttributeLabel } from './labels'

export interface BrowseFile {
  id: string
  name: string
  path: string
  file_type: string
  size: number
  created_at: string
  memo?: string
  ad_codes?: string[]
  scripts?: object
  has_scripts?: boolean
  category_labels: CategoryLabel[]
  attribute_labels: AttributeLabel[]
  product_id?: string
  total_spend?: number
  total_revenue?: number
  total_conversions?: number
  total_impressions?: number
  total_clicks?: number
  cpc?: number
  s3_key: string
}

export interface BrowseFilter {
  category_label_ids?: string[]
  attribute_label_ids?: string[]
  product_ids?: string[]
  team_ids?: string[]
  is_labeled?: boolean
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  start_date?: string
  end_date?: string
  page: number
  limit: number
}

export interface PaginatedBrowseResponse {
  files: BrowseFile[]
  total: number
  page: number
  limit: number
  has_next: boolean
}
