import type { NextFunction, Request, RequestHandler, Response } from 'express';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message?: string,
  ) {
    super(message ?? code);
  }
}

export const badRequest = (code: string, msg?: string) => new ApiError(400, code, msg);
export const unauthorized = (msg?: string) => new ApiError(401, 'unauthorized', msg);
export const forbidden = (msg?: string) => new ApiError(403, 'forbidden', msg);
export const notFound = (msg?: string) => new ApiError(404, 'not_found', msg);
export const conflict = (code: string, msg?: string) => new ApiError(409, code, msg);

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: err.code, message: err.message });
    return;
  }
  console.error('[api] unhandled error', err);
  res.status(500).json({ error: 'internal_error' });
}

export function clientIp(req: Request): string | null {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string') return xff.split(',')[0]!.trim();
  return req.socket.remoteAddress ?? null;
}
