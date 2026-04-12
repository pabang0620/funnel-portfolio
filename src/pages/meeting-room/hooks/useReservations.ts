import { useState, useEffect, useCallback } from 'react';
import {
  mockFetchSlots,
  mockFetchReservations,
  mockCreateReservation,
  mockCancelReservation,
  mockCompleteReservation,
  mockUpdateReservation,
} from '@/data/meeting-room/mockService';
import type { TimeSlot, Reservation, CreateReservationRequest, ReservationQueryParams } from '../types';

export function useSlots(roomId: string | null, date: string | null) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    if (!roomId || !date) {
      setSlots([]);
      return;
    }
    setLoading(true);
    setError(null);
    mockFetchSlots(roomId, date)
      .then(setSlots)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [roomId, date]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { slots, loading, error, refetch };
}

export function useReservations(params: ReservationQueryParams) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roomId = params.room_id;
  const date = params.date;
  const startDate = params.start_date;
  const endDate = params.end_date;
  const teamId = params.team_id;
  const status = params.status;

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);

    const queryParams: ReservationQueryParams = {};
    if (roomId) queryParams.room_id = roomId;
    if (date) queryParams.date = date;
    if (startDate) queryParams.start_date = startDate;
    if (endDate) queryParams.end_date = endDate;
    if (teamId) queryParams.team_id = teamId;
    if (status) queryParams.status = status;

    mockFetchReservations(queryParams)
      .then(setReservations)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [roomId, date, startDate, endDate, teamId, status]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { reservations, loading, error, refetch };
}

export function useReservationActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: CreateReservationRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mockCreateReservation(data);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : '예약 생성에 실패했습니다';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancel = useCallback(async (id: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await mockCancelReservation(id, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : '예약 취소에 실패했습니다';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const complete = useCallback(async (id: string, password: string, actualEndTime?: string) => {
    setLoading(true);
    setError(null);
    try {
      await mockCompleteReservation(id, password, actualEndTime);
    } catch (err) {
      const message = err instanceof Error ? err.message : '예약 완료 처리에 실패했습니다';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, data: {
    password: string;
    purpose?: string;
    start_time?: string;
    end_time?: string;
    attendees?: string;
    memo?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mockUpdateReservation(id, data);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : '예약 수정에 실패했습니다';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, cancel, complete, update, loading, error };
}
