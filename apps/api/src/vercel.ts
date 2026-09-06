// Vercel serverless entry — the Express app works directly as a Node handler.
// Requires DATABASE_URL in the environment (PGlite is local-dev only).
import { createApp } from './app.js';
import { initDb } from './db/index.js';

await initDb();

export default createApp();
