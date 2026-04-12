export interface LandingUrlItem {
  landing_url: string
  advertiser_name: string
  source: 'meta' | 'google'
  last_shown_date: string | null
  image_url: string | null
}

export interface LandingUrlListResponse {
  items: LandingUrlItem[]
  total: number
  page: number
  page_size: number
}
