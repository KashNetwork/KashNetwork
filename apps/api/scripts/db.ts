/**
 * pnpm --filter @kash/api db migrate   # apply pending migrations
 * pnpm --filter @kash/api db reset      # wipe local PGlite + re-migrate + seed admin-less
 */
import { rmSync } from 'node:fs';
import { closeDb, initDb } from '../src/db/index.js';
import { DEFAULT_PGLITE_DIR } from '../src/db/sql.js';
import { config } from '../src/config.js';

const cmd = process.argv[2];

async function main() {
  if (cmd === 'reset') {
    if (config.db.databaseUrl) {
      console.error('reset only wipes local PGlite; DATABASE_URL is set — aborting.');
      process.exit(1);
    }
    rmSync(config.db.pgliteDir || DEFAULT_PGLITE_DIR, { recursive: true, force: true });
    console.log('wiped local PGlite dir');
  }
  await initDb();
  await closeDb();
  console.log(cmd === 'reset' ? 'reset complete' : 'migrations up to date');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
