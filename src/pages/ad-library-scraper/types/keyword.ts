export interface Keyword {
  id: string
  keyword: string
  sources: string
  created_at: string
  updated_at: string
}

export interface KeywordCreate {
  keyword: string
  sources: string
}

export interface KeywordUpdate {
  keyword: string
  sources?: string
}
