import { useEffect } from 'react';

export function useAutoRefresh(refetch: () => void, intervalMs = 300_000) {
  useEffect(() => {
    const msUntilNext = intervalMs - (Date.now() % intervalMs);
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const timeoutId = setTimeout(() => {
      refetch();
      intervalId = setInterval(() => {
        refetch();
      }, intervalMs);
    }, msUntilNext);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId !== null) clearInterval(intervalId);
    };
  }, [refetch, intervalMs]);
}
