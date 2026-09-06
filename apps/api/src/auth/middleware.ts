import type { NextFunction, Request, Response } from 'express';
import type { ProfileRow, SessionRow } from '../db/index.js';
import { forbidden, unauthorized } from '../lib/http.js';
import { resolveSession, SESSION_COOKIE } from './sessions.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      rawBody?: string;
      auth?: { profile: ProfileRow; session: SessionRow };
    }
  }
}

async function attach(req: Request) {
  if (req.auth) return;
  const token = req.cookies?.[SESSION_COOKIE] as string | undefined;
  const resolved = await resolveSession(token);
  if (resolved) req.auth = resolved;
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    await attach(req);
    next();
  } catch (e) {
    next(e);
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    await attach(req);
    if (!req.auth) throw unauthorized();
    next();
  } catch (e) {
    next(e);
  }
}

export async function requirePaid(req: Request, _res: Response, next: NextFunction) {
  try {
    await attach(req);
    if (!req.auth) throw unauthorized();
    if (req.auth.profile.account_type !== 'paid' && req.auth.profile.role !== 'admin')
      throw forbidden('paid_account_required');
    next();
  } catch (e) {
    next(e);
  }
}

export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    await attach(req);
    if (!req.auth) throw unauthorized();
    if (req.auth.profile.role !== 'admin') throw forbidden('admin_required');
    next();
  } catch (e) {
    next(e);
  }
}
