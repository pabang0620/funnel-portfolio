import { useState, useEffect } from 'react';
import { mockGetSlackMembers } from '@/data/meeting-room/mockService';

export interface SlackMember {
  id: string;
  name: string;
  real_name: string;
  email: string;
}

export function useSlackMembers() {
  const [members, setMembers] = useState<SlackMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    mockGetSlackMembers()
      .then(setMembers)
      .catch((err) => setError(err instanceof Error ? err : new Error('Failed')))
      .finally(() => setLoading(false));
  }, []);

  return { members, loading, error };
}
