import { afterEach, describe, expect, it, vi } from 'vitest';
import { verifyEmailWithKickbox } from '../src/server/adapters/kickbox';

const mockFetch = (body: unknown, ok = true) =>
  vi.spyOn(global, 'fetch').mockResolvedValue({
    ok,
    json: async () => body,
  } as Response);

afterEach(() => {
  vi.restoreAllMocks();
});

describe('verifyEmailWithKickbox', () => {
  it('rejects a confirmed-undeliverable mailbox', async () => {
    mockFetch({ success: true, result: 'undeliverable', role: false, disposable: false });
    const v = await verifyEmailWithKickbox('nobody@gmail.com', 'test-key');
    expect(v).toEqual({ valid: false, reason: 'undeliverable' });
  });

  it('rejects a mailbox Kickbox flags as disposable even if our own list missed it', async () => {
    mockFetch({ success: true, result: 'deliverable', role: false, disposable: true });
    const v = await verifyEmailWithKickbox('a@newthrowawaydomain.xyz', 'test-key');
    expect(v).toEqual({ valid: false, reason: 'disposable' });
  });

  it('accepts a deliverable mailbox', async () => {
    mockFetch({ success: true, result: 'deliverable', role: false, disposable: false });
    const v = await verifyEmailWithKickbox('jane@gmail.com', 'test-key');
    expect(v).toEqual({ valid: true });
  });

  it('accepts risky/unknown results rather than false-positive rejecting', async () => {
    mockFetch({ success: true, result: 'risky', role: false, disposable: false });
    const v = await verifyEmailWithKickbox('jane@some-catch-all-domain.com', 'test-key');
    expect(v).toEqual({ valid: true });
  });

  it('fails open when Kickbox itself could not complete the check', async () => {
    mockFetch({ success: false });
    const v = await verifyEmailWithKickbox('jane@gmail.com', 'test-key');
    expect(v).toEqual({ valid: true });
  });

  it('fails open on an HTTP-level error', async () => {
    mockFetch({}, false);
    const v = await verifyEmailWithKickbox('jane@gmail.com', 'test-key');
    expect(v).toEqual({ valid: true });
  });

  it('fails open on a network error', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('network down'));
    const v = await verifyEmailWithKickbox('jane@gmail.com', 'test-key');
    expect(v).toEqual({ valid: true });
  });
});
