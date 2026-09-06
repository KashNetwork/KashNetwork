import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { SqlClient } from './sql.js';

const here = dirname(fileURLToPath(import.meta.url));
// repo-root/supabase/migrations, from apps/api/src/db (tsx) — overridable for prod
const MIGRATIONS_DIR =
  process.env.MIGRATIONS_DIR ?? resolve(here, '../../../../supabase/migrations');

/** Apply any migration files not yet recorded in _migrations. Idempotent. */
export async function runMigrations(db: SqlClient): Promise<string[]> {
  if (!existsSync(MIGRATIONS_DIR)) {
    console.warn(`[db] migrations dir not found (${MIGRATIONS_DIR}) — skipping auto-migrate`);
    return [];
  }
  await db.exec(`
    create table if not exists _migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    );
  `);
  const applied = new Set(
    (await db.query<{ name: string }>('select name from _migrations')).map((r) => r.name),
  );
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const ran: string[] = [];
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
    await db.exec(sql);
    await db.query('insert into _migrations (name) values ($1)', [file]);
    ran.push(file);
  }
  return ran;
}

export { MIGRATIONS_DIR };
