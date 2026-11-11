'use client';
import { useEffect, useState } from 'react';
import { bangkokClock, type Clock } from '@/lib/opening-hours';

/** Bangkok time, refreshed each minute. Null until mounted, so static HTML never holds a stale "open now". */
export function useBangkokClock(): Clock | null {
  const [clock, setClock] = useState<Clock | null>(null);
  useEffect(() => {
    const tick = () => setClock(bangkokClock(new Date()));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);
  return clock;
}
