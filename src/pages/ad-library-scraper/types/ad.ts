export interface AdVariant {
  content_url: string
  thumbnail_url: string | null
  landing_page_url: string
}

export interface Ad {
  id: string
  keyword_id: string
  source: 'meta' | 'google'
  advertiser_name: string
  variants: AdVariant[]
  scraped_date: string
  last_shown_date: string | null
  created_at: string
  updated_at: string
}

export interface AdListResponse {
  ads: Ad[]
  total: number
  page?: number
  page_size?: number
}
