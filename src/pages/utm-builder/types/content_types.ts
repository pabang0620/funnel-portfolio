export interface ContentType {
  id: string;
  name: string;
  initial: string;
  display_name: string;
}

export interface ContentTypeCreateRequest {
  name: string;
  initial: string;
  display_name: string;
}

export interface ContentTypeUpdateRequest {
  name?: string;
  initial?: string;
  display_name?: string;
}
