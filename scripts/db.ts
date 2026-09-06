/**
 * pnpm db:migrate   # apply pending migrations (local PGlite, or DATABASE_URL)
 * pnpm db:reset      # wipe local PGlite + re-migrate
 */
import 'dotenv/config';
import { rmSync } from 'node:fs';
import { closeDb, getDb } from '../src/server/db/index';
import { DEFAULT_PGLITE_DIR } from '../src/server/db/sql';
import { config } from '../src/server/config';

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
  await getDb();
  await closeDb();
  console.log(cmd === 'reset' ? 'reset complete' : 'migrations up to date');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
