import { useState, useEffect, useCallback } from 'react';
import {
  mockFetchTeams,
  mockCreateTeam,
  mockUpdateTeam,
  mockDeleteTeam,
} from '@/data/meeting-room/mockService';
import type { Team } from '../types';

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mockFetchTeams();
      setTeams(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '팀 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  const createTeam = async (name: string): Promise<Team> => {
    const newTeam = await mockCreateTeam(name);
    setTeams((prev) => [...prev, newTeam]);
    return newTeam;
  };

  const updateTeam = async (id: string, data: Partial<Team>): Promise<Team> => {
    const updatedTeam = await mockUpdateTeam(id, data);
    setTeams((prev) => prev.map((team) => (team.id === id ? updatedTeam : team)));
    return updatedTeam;
  };

  const deleteTeam = async (id: string): Promise<void> => {
    await mockDeleteTeam(id);
    setTeams((prev) => prev.filter((team) => team.id !== id));
  };

  return {
    teams,
    loading,
    error,
    refetch: loadTeams,
    createTeam,
    updateTeam,
    deleteTeam,
  };
}
