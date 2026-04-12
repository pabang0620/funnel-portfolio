export interface ProductLandingNumber {
  id: string;
  product_id: string;
  number: string;
  description: string | null;
  initial?: string | null;
}

export interface Product {
  id: string;
  brand_id: string;
  brand_name: string;
  base_url?: string | null;
  name: string;
  initial: string;
  landing_numbers: ProductLandingNumber[];
  created_at: string;
  updated_at: string;
}

export interface ProductCreateRequest {
  brand_id: string;
  name: string;
  initial: string;
}

export interface ProductUpdateRequest {
  brand_id?: string;
  name?: string;
  initial?: string;
}

export interface ProductLandingNumberCreateRequest {
  product_id: string;
  number: string;
  description?: string;
}

export interface ProductLandingNumberUpdateRequest {
  number?: string;
  description?: string;
}
