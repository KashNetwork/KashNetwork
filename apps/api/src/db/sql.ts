// Thin SQL client abstraction. Two backends, same interface:
//   - PGlite  (local dev + persistent, no Docker) — the default
//   - node-postgres (pg) against a real Postgres via DATABASE_URL (staging/prod)
//
// The frontend never connects to Postgres; everything goes through the API, so
// we don't need PostgREST / supabase-js — raw SQL is enough and portable.

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface SqlClient {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]>;
  exec(sql: string): Promise<void>;
  end(): Promise<void>;
}

const here = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_PGLITE_DIR = resolve(here, '../../.pglite');

export async function makeSqlClient(opts: {
  databaseUrl?: string;
  pgliteDir?: string;
}): Promise<SqlClient> {
  if (opts.databaseUrl) {
    const { default: pg } = await import('pg');
    const pool = new pg.Pool({ connectionString: opts.databaseUrl, max: 5 });
    return {
      async query<T = Record<string, unknown>>(text: string, params?: unknown[]) {
        const res = await pool.query(text, params as unknown[]);
        return res.rows as T[];
      },
      async exec(sql: string) {
        await pool.query(sql);
      },
      async end() {
        await pool.end();
      },
    };
  }

  const { PGlite } = await import('@electric-sql/pglite');
  const { citext } = await import('@electric-sql/pglite/contrib/citext');
  const db = new PGlite(opts.pgliteDir ?? DEFAULT_PGLITE_DIR, { extensions: { citext } });
  await db.waitReady;
  return {
    async query<T = Record<string, unknown>>(text: string, params?: unknown[]) {
      const res = await db.query<T>(text, params as unknown[]);
      return res.rows;
    },
    async exec(sql: string) {
      await db.exec(sql);
    },
    async end() {
      await db.close();
    },
  };
}
