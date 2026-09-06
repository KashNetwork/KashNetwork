import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { config, integrationStatus } from './config.js';
import { errorMiddleware } from './lib/http.js';
import api from './routes/index.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);

  const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) cb(null, true);
        else cb(null, false);
      },
      credentials: true,
    }),
  );

  app.use(
    express.json({
      limit: '256kb',
      verify: (req, _res, buf) => {
        (req as express.Request & { rawBody?: string }).rawBody = buf.toString('utf8');
      },
    }),
  );
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, integrations: integrationStatus(), ts: new Date().toISOString() });
  });

  app.use('/api', api);

  app.use((_req, res) => res.status(404).json({ error: 'not_found' }));
  app.use(errorMiddleware);

  void config; // referenced for side-effect of load order
  return app;
}
