import { vi } from 'vitest';

// deterministic config for adapter tests (read at module-eval by src/server/config)
process.env.EXPLODELY_IPN_SECRET ??= 'test-token';
process.env.EXPLODELY_PRODUCT_ID ??= '12345';

/** In-memory cookie jar shared by tests, standing in for Next's request cookies. */
export const cookieJar = new Map<string, string>();

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) =>
      cookieJar.has(name) ? { name, value: cookieJar.get(name)! } : undefined,
    getAll: () => [...cookieJar].map(([name, value]) => ({ name, value })),
    set: (name: string, value: string) => cookieJar.set(name, value),
    delete: (name: string) => cookieJar.delete(name),
    has: (name: string) => cookieJar.has(name),
  }),
}));
