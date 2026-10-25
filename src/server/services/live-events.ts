import type { LiveEventRow } from '@/server/db/types';

/** "Jane D." from a full name; falls back to the part of the email before any digits or dots. */
export function publicName(fullName: string | null, email: string): string {
  const parts = (fullName ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${cap(parts[0]!)} ${parts[parts.length - 1]![0]!.toUpperCase()}.`;
  if (parts.length === 1) return cap(parts[0]!);
  const local = (email.split('@')[0] ?? '').replace(/[0-9._-]+/g, ' ').trim().split(' ')[0] ?? '';
  return local.length >= 2 ? cap(local) : 'A new member';
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

export function relativeTime(iso: string, now = Date.now()): string {
  const mins = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return hrs === 1 ? '1 hour ago' : `${hrs} hours ago`;
  const days = Math.round(hrs / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}

/** Real events only: past ones are fine, nothing is invented. */
export function formatLiveEvents(rows: LiveEventRow[], now = Date.now()) {
  return rows.map((r) => ({
    id: r.id,
    label: publicName(r.full_name, r.email),
    message:
      r.kind === 'joined'
        ? 'just joined Kash Network'
        : `earned a $${(r.amount_cents / 100).toFixed(r.amount_cents % 100 ? 2 : 0)} commission`,
    time: relativeTime(r.at, now),
  }));
}
