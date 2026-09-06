import { NextResponse } from 'next/server';
import { integrationStatus } from '@/server/config';
import { getDb } from '@/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  let db = 'error';
  try {
    await getDb();
    db = 'ok';
  } catch (e) {
    db = `error: ${(e as Error).message}`;
  }
  return NextResponse.json({
    ok: db === 'ok',
    db,
    integrations: integrationStatus(),
    ts: new Date().toISOString(),
  });
}
