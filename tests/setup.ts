import { vi } from 'vitest';

// deterministic config for adapter tests (read at module-eval by src/server/config)
process.env.EXPLODELY_IPN_SECRET ??= 'test-token';
process.env.EXPLODELY_PRODUCT_ID ??= '12345';

/** In-memory cookie jar shared by tests, standing in for Next's request cookies. */
export const cookieJar = new Map<string, string>();

// This sandbox has no outbound DNS, so the real domainCanReceiveMail() lookup
// in src/server/adapters/email-verify.ts would fail for every domain, real or
// not. Stub node:dns/promises so tests stay deterministic and offline: any
// domain resolves an MX record except ones that look deliberately fake
// (the pattern tests use to exercise the "no_mx" rejection path).
const FAKE_DOMAIN = /doesnotexist|nonexistent|gkdtyail/i;
vi.mock('node:dns/promises', () => ({
  resolveMx: async (domain: string) => {
    if (FAKE_DOMAIN.test(domain)) throw new Error('ENOTFOUND');
    return [{ exchange: `mx.${domain}`, priority: 10 }];
  },
  resolve4: async (domain: string) => {
    if (FAKE_DOMAIN.test(domain)) throw new Error('ENOTFOUND');
    return ['203.0.113.1'];
  },
  resolve6: async (domain: string) => {
    if (FAKE_DOMAIN.test(domain)) throw new Error('ENOTFOUND');
    return ['2001:db8::1'];
  },
}));

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
