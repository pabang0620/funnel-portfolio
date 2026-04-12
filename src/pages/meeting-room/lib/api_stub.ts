/**
 * api_stub.ts — shims for the portfolio demo.
 * All real API calls are replaced by mockService functions.
 */
import {
  mockUploadRoomImage,
  mockGetSlackMembers,
  mockFetchOrganization,
} from '@/data/meeting-room/mockService';

export { mockUploadRoomImage as uploadRoomImage };
export { mockGetSlackMembers as getSlackMembers };
export { mockFetchOrganization as fetchOrganizationChart };

export type CreateRoomRequest = {
  name: string;
  floor: string;
  description?: string;
  image_url?: string;
  capacity?: number;
};

export type UpdateRoomRequest = {
  name?: string;
  floor?: string;
  description?: string;
  image_url?: string;
  capacity?: number;
  is_active?: boolean;
};

export type UpdateTeamRequest = {
  name?: string;
  display_order?: number;
  is_active?: boolean;
};
