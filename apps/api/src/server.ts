import { createApp } from './app.js';
import { config, integrationStatus } from './config.js';
import { initDb } from './db/index.js';

async function main() {
  await initDb();
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`[kash-api] listening on :${config.port}`);
    console.log('[kash-api] integrations:', integrationStatus());
  });
}

main().catch((e) => {
  console.error('[kash-api] failed to start', e);
  process.exit(1);
});
