import { afterEach, describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  process.env.EXPLODELY_USERNAME = 'seller';
  process.env.EXPLODELY_API_KEY = 'key';
});

import { ExplodelyProvider } from '@/server/adapters/explodely';

afterEach(() => vi.unstubAllGlobals());

const reply = (status: number, body: string) =>
  vi.fn().mockResolvedValue(new Response(body, { status, headers: { 'content-type': 'application/json' } }));

describe('Explodely cancel rebill', () => {
  it('succeeds on a clean 200 with no error', async () => {
    const f = reply(200, '{"success":true}');
    vi.stubGlobal('fetch', f);
    await expect(new ExplodelyProvider().cancelSubscription('ord_1', true)).resolves.toBeUndefined();
    const url = String((f.mock.calls[0] as unknown[])[0]);
    expect(url).toContain('apiaction=cancelrebill');
    expect(url).toContain('mainorderid=ord_1');
  });

  it('fails when Explodely reports an error', async () => {
    vi.stubGlobal('fetch', reply(200, '{"error":"invalid order"}'));
    await expect(new ExplodelyProvider().cancelSubscription('ord_1', true)).rejects.toThrow(/invalid order/);
  });

  it('fails on a blocked or non-JSON response instead of pretending it worked', async () => {
    vi.stubGlobal('fetch', reply(403, '<html>Forbidden</html>'));
    await expect(new ExplodelyProvider().cancelSubscription('ord_1', true)).rejects.toThrow(/403/);
  });
});
