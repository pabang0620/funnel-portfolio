export interface Placement {
  id: string;
  name: string;
  initial: string;
  display_name: string;
}

export interface PlacementCreateRequest {
  name: string;
  initial: string;
  display_name: string;
}

export interface PlacementUpdateRequest {
  name?: string;
  initial?: string;
  display_name?: string;
}
