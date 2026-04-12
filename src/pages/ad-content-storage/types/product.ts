export interface Product {
  id: string
  name: string
  images: string[]
  price?: number
  thumbnail_image: string | null
  description?: string
  company_name?: string
  created_at: string
  updated_at: string
}

export interface ProductCreate {
  name: string
  images: string[]
  price?: number
  thumbnail_image: string | null
  description?: string
  company_name: string
}

export interface ProductUpdate {
  name?: string
  images?: string[]
  price?: number
  thumbnail_image?: string | null
  description?: string
  company_name?: string
}

export interface ProductListResponse {
  items: Product[]
  total: number
}

export interface ProductGroupWithProducts {
  company_name: string
  products: Product[]
  isExpanded: boolean
}

export interface ProductPendingChanges {
  id: string
  field: keyof Product
  oldValue: any
  newValue: any
  timestamp: number
}
