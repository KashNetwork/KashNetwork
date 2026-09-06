import { config } from '../config';
import { runMigrations } from './migrate';
import type { Repo } from './repo';
import { seedAdmin } from './seed';
import { makeSqlClient, type SqlClient } from './sql';
import { SqlRepo } from './sqlrepo';

let instance: Repo | null = null;
let client: SqlClient | null = null;
let initPromise: Promise<Repo> | null = null;

async function init(): Promise<Repo> {
  client = await makeSqlClient({
    databaseUrl: config.db.databaseUrl || undefined,
    pgliteDir: config.db.pgliteDir || undefined,
  });
  const ran = await runMigrations(client);
  if (ran.length) console.log(`[db] applied migrations: ${ran.join(', ')}`);
  console.log(`[db] ready (${config.db.databaseUrl ? 'postgres' : 'pglite'})`);
  const repo = new SqlRepo(client);
  await seedAdmin(repo);
  instance = repo;
  return repo;
}

/** Lazy singleton — initialises (migrate + seed) on first call, then memoised. */
export async function getDb(): Promise<Repo> {
  if (instance) return instance;
  if (!initPromise) initPromise = init().catch((e) => ((initPromise = null), Promise.reject(e)));
  return initPromise;
}

/** @deprecated use getDb(). Kept for the standalone scripts. */
export async function initDb(): Promise<void> {
  await getDb();
}

/** test helper — inject a repo directly, skipping init */
export function setRepo(r: Repo | null) {
  instance = r;
  initPromise = r ? Promise.resolve(r) : null;
}

export async function closeDb() {
  await client?.end();
  client = null;
  instance = null;
  initPromise = null;
}

export type { Repo };
export * from './types';
