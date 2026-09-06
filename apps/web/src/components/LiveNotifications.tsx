import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';

interface Item {
  id: string;
  label: string;
  message: string;
  time: string | null;
}

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

/**
 * Light-theme social-proof popups, bottom-left.
 * First 10–15s after load, visible 4–6s, next 15–35s later, cap 8 per session.
 * Content comes from GET /api/notifications (client-approved lines).
 */
export function LiveNotifications({ location }: { location: 'landing' | 'sales' }) {
  const [items, setItems] = useState<Item[]>([]);
  const [current, setCurrent] = useState<Item | null>(null);
  const shownCount = useRef(0);
  const idx = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    api
      .notifications(location)
      .then((r) => setItems(r.items))
      .catch(() => undefined);
  }, [location]);

  useEffect(() => {
    if (items.length === 0) return;
    const schedule = (delay: number) => {
      const t = window.setTimeout(() => {
        if (shownCount.current >= 8) return;
        const item = items[idx.current % items.length]!;
        idx.current += 1;
        shownCount.current += 1;
        setCurrent(item);
        const hide = window.setTimeout(() => {
          setCurrent(null);
          if (shownCount.current < 8) schedule(rand(15000, 35000));
        }, rand(4000, 6000));
        timers.current.push(hide);
      }, delay);
      timers.current.push(t);
    };
    schedule(rand(10000, 15000));
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [items]);

  if (!current) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-50 max-w-[320px]">
      <div className="animate-[fadeIn_.3s_ease] rounded-xl bg-white p-4 shadow-lg ring-1 ring-slate-200">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
            ✦
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground">{current.label}</div>
            <div className="truncate text-sm text-slate-600">{current.message}</div>
            {current.time && <div className="mt-0.5 text-xs text-slate-400">{current.time}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
