import { NextResponse } from 'next/server';
import { integrationStatus } from '@/server/config';
import { getDb } from '@/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** The scheduled job runs every 15 minutes; more than this long without a run counts as stalled. */
const CRON_STALE_MINUTES = 45;

/**
 * GET /api/health            — status + when the scheduled job last ran
 * GET /api/health?strict=1   — same, but answers 503 if the database is down or the
 *                              job has stalled, so an uptime monitor can alert on it.
 */
export async function GET(req: Request) {
  const strict = new URL(req.url).searchParams.get('strict') === '1';
  let db = 'error';
  let lastRun: string | null = null;
  try {
    const repo = await getDb();
    db = 'ok';
    lastRun = ((await repo.getSetting<{ at: string }>('cron_last_run')) ?? null)?.at ?? null;
  } catch (e) {
    db = `error: ${(e as Error).message}`;
  }
  const minutesAgo = lastRun ? Math.round((Date.now() - new Date(lastRun).getTime()) / 60_000) : null;
  const cronStale = minutesAgo === null || minutesAgo > CRON_STALE_MINUTES;
  const healthy = db === 'ok' && !cronStale;
  return NextResponse.json(
    {
      ok: db === 'ok',
      db,
      cron: { lastRun, minutesAgo, stale: cronStale },
      integrations: integrationStatus(),
      ts: new Date().toISOString(),
    },
    { status: strict && !healthy ? 503 : 200 },
  );
}
