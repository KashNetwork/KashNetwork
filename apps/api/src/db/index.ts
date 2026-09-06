import { config } from '../config.js';
import { runMigrations } from './migrate.js';
import type { Repo } from './repo.js';
import { seedAdmin } from './seed.js';
import { makeSqlClient, type SqlClient } from './sql.js';
import { SqlRepo } from './sqlrepo.js';

let instance: Repo | null = null;
let client: SqlClient | null = null;

/** Build the SQL client, apply migrations, and set the repo singleton. */
export async function initDb(): Promise<void> {
  if (instance) return;
  client = await makeSqlClient({
    databaseUrl: config.db.databaseUrl || undefined,
    pgliteDir: config.db.pgliteDir || undefined,
  });
  const ran = await runMigrations(client);
  if (ran.length) console.log(`[db] applied migrations: ${ran.join(', ')}`);
  console.log(`[db] ready (${config.db.databaseUrl ? 'postgres' : 'pglite'})`);
  instance = new SqlRepo(client);
  await seedAdmin(instance);
}

export function getRepo(): Repo {
  if (!instance) throw new Error('DB not initialised — call initDb() first');
  return instance;
}

/** test helper — inject an in-memory repo, no migrations needed */
export function setRepo(r: Repo) {
  instance = r;
}

export async function closeDb() {
  await client?.end();
  client = null;
  instance = null;
}

export type { Repo };
export * from './types.js';
