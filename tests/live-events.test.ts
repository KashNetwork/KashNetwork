import { describe, expect, it } from 'vitest';
import { formatLiveEvents, publicName, relativeTime } from '@/server/services/live-events';

const now = Date.parse('2026-10-25T12:00:00Z');

describe('live events', () => {
  it('shows first name and last initial only', () => {
    expect(publicName('jane van doe', 'x@y.com')).toBe('Jane D.');
    expect(publicName(null, 'mike.smith42@gmail.com')).toBe('Mike');
    expect(publicName(null, '123@y.com')).toBe('A new member');
  });

  it('words joins and commissions from real rows', () => {
    const out = formatLiveEvents(
      [
        { id: 'j-1', kind: 'joined', full_name: 'Ann Lee', email: 'a@b.c', amount_cents: 0, at: '2026-10-25T08:00:00Z' },
        { id: 'c-1', kind: 'earned', full_name: 'Bo Kim', email: 'b@b.c', amount_cents: 3000, at: '2026-10-23T12:00:00Z' },
      ],
      now,
    );
    expect(out[0]).toMatchObject({ label: 'Ann L.', message: 'just joined Kash Network', time: '4 hours ago' });
    expect(out[1]).toMatchObject({ label: 'Bo K.', message: 'earned a $30 commission', time: '2 days ago' });
  });

  it('formats relative times', () => {
    expect(relativeTime('2026-10-25T11:59:00Z', now)).toBe('just now');
    expect(relativeTime('2026-10-24T12:00:00Z', now)).toBe('yesterday');
  });
});
