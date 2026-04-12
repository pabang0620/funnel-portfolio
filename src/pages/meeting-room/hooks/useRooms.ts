import { useState, useEffect, useCallback } from 'react';
import {
  mockFetchRooms,
  mockFetchRoom,
  mockCreateRoom,
  mockUpdateRoom,
} from '@/data/meeting-room/mockService';
import type { Room } from '../types';

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mockFetchRooms();
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '회의실 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const createRoom = async (data: Partial<Room>): Promise<Room> => {
    const newRoom = await mockCreateRoom(data);
    setRooms((prev) => [...prev, newRoom]);
    return newRoom;
  };

  const updateRoom = async (id: string, data: Partial<Room>): Promise<Room> => {
    const updatedRoom = await mockUpdateRoom(id, data);
    setRooms((prev) => prev.map((room) => (room.id === id ? updatedRoom : room)));
    return updatedRoom;
  };

  return {
    rooms,
    loading,
    error,
    refetch: loadRooms,
    createRoom,
    updateRoom,
  };
}

export function useRoom(id: string | null) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setRoom(null);
      return;
    }
    setLoading(true);
    mockFetchRoom(id)
      .then(setRoom)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { room, loading, error };
}
