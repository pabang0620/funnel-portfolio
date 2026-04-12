export interface Media {
  id: string;
  name: string;
  initial: string;
  display_name: string;
  group?: string | null;
}

export interface MediaCreateRequest {
  name: string;
  initial: string;
  display_name: string;
  group?: string | null;
}

export interface MediaUpdateRequest {
  name?: string;
  initial?: string;
  display_name?: string;
  group?: string | null;
}
