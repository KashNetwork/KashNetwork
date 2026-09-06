import { NextResponse } from 'next/server';

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
export const forbidden = (code = 'forbidden', msg?: string) => new ApiError(403, code, msg);
export const notFound = (msg?: string) => new ApiError(404, 'not_found', msg);
export const conflict = (code: string, msg?: string) => new ApiError(409, code, msg);

type Handler = (req: Request, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>;

/** Wraps a route handler so thrown ApiErrors become JSON responses. */
export function route(fn: Handler): Handler {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (err) {
      if (err instanceof ApiError) {
        return NextResponse.json({ error: err.code, message: err.message }, { status: err.status });
      }
      console.error('[api] unhandled error', err);
      return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
  };
}

export async function readJson<T = unknown>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw badRequest('invalid_json', 'Request body must be JSON.');
  }
}

export function clientIp(req: Request): string | null {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return req.headers.get('x-real-ip') ?? null;
}

export function userAgent(req: Request): string | null {
  return req.headers.get('user-agent') ?? null;
}

export const ok = (data: unknown, status = 200) => NextResponse.json(data, { status });
