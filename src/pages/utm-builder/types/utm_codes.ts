export interface UTMCode {
  id: string;
  base_code: string;
  sequence: string | null;
  utm_code: string;
  ad_url: string | null;

  // 관련 정보 이름
  media_name: string | null;
  media_display: string | null;
  content_type_name: string | null;
  content_type_display: string | null;
  placement_name: string | null;
  placement_display: string | null;
  product_name: string | null;
  product_id: string | null;
  brand_name: string | null;
  landing_display: string | null;
  media_initial: string | null;
  content_type_initial: string | null;
  placement_initial: string | null;
  product_initial: string | null;
  planner_initial: string | null;
  marketer_initial: string | null;
  creator_initial: string | null;
  planner_name: string | null;
  marketer_name: string | null;
  creator_name: string | null;
  author_name: string | null;

  created_at: string;
  updated_at: string;
}

export interface UTMGenerateRequest {
  media_id: string;
  content_type_id: string;
  placement_id: string;
  product_id: string;
  landing_number_id: string;
  planner_id: string;
  marketer_id: string;
  creator_id: string;
  sequence?: string;
}

export interface UTMUpdateRequest {
  media_id?: string;
  content_type_id?: string;
  placement_id?: string;
  product_id?: string;
  product_landing_number_id?: string;
  planner_id?: string;
  marketer_id?: string;
  creator_id?: string;
}

export interface UTMListParams {
  page?: number;
  limit?: number;
  utm_code?: string;
  product_initials?: string[];
  media_initials?: string[];
  content_type_initials?: string[];
  placement_id?: string;
  planner_initials?: string[];
  marketer_initials?: string[];
  creator_initials?: string[];
  author_name?: string;
  created_at_from?: string;
  created_at_to?: string;
  sort_key?: string;
  sort_dir?: 'asc' | 'desc';
}

export interface UTMListResponse {
  items: UTMCode[];
  total: number;
}

export interface UTMBulkCreateItem {
  media_id: string
  content_type_id: string
  placement_id: string
  product_id: string
  landing_number_id: string
  planner_id: string
  marketer_id: string
  creator_id: string
  sequence: string
  author_user_id?: string | null
  simple_url?: boolean
  criteo?: boolean
}

export interface UTMBulkCreateResultItem {
  input_index: number
  utm_code: string | null
  success: boolean
  error: string | null
}

export interface UTMBulkCreateResponse {
  success_count: number
  fail_count: number
  results: UTMBulkCreateResultItem[]
}

export interface UTMDecodeResult {
  input_code: string;
  utm_code: string;
  base_code: string;
  sequence: string;
  status: 'registered' | 'decoded' | 'not_found';
  media_name?: string;
  media_display?: string;
  landing_name?: string;
  content_type_name?: string;
  content_type_display?: string;
  placement_name?: string;
  placement_display?: string;
  product_id?: string;
  product_name?: string;
  brand_name?: string;
  brand_url?: string;
  planner_name?: string;
  marketer_name?: string;
  creator_name?: string;
  product_landing_number_id?: string;
  landing_number?: string | number | null;
  ad_url?: string;
  error?: string;
}
