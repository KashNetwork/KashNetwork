import { describe, expect, it } from 'vitest';
import { embedSrc, readEmbedMessage } from '@/content/explodely-embed';

const OK = 'https://explodely.com';

describe('Explodely embedded checkout', () => {
  it('points at the product with the light skin, and adds the affiliate code when there is one', () => {
    expect(embedSrc()).toBe('https://explodely.com/e/iframe.php?skin=light&pid=1021006537');
    expect(embedSrc('AFF777')).toContain('tpa=AFF777');
  });

  it('resizes to the height Explodely reports', () => {
    expect(readEmbedMessage(OK, { type: 'checkout-height', height: 742 })).toEqual({ kind: 'height', px: 742 });
    expect(readEmbedMessage(OK, { type: 'checkout-height', height: -5 })).toEqual({ kind: 'ignore' });
    expect(readEmbedMessage(OK, { type: 'checkout-height', height: 'x' })).toEqual({ kind: 'ignore' });
  });

  it('on success, follows the Thank You URL, or falls back to /thanks', () => {
    expect(readEmbedMessage(OK, { type: 'iframeSuccess', redirectUrl: 'https://kash.network/thanks' })).toEqual({
      kind: 'success',
      redirectTo: 'https://kash.network/thanks',
    });
    expect(readEmbedMessage(OK, { type: 'iframeSuccess' })).toEqual({ kind: 'success', redirectTo: '/thanks' });
  });

  it('never follows a non-web redirect (javascript:, data:)', () => {
    expect(readEmbedMessage(OK, { type: 'iframeSuccess', redirectUrl: 'javascript:alert(1)' })).toEqual({
      kind: 'success',
      redirectTo: '/thanks',
    });
  });

  it('ignores messages from any other website', () => {
    expect(readEmbedMessage('https://evil.example', { type: 'iframeSuccess', redirectUrl: 'https://x.com' })).toEqual({ kind: 'ignore' });
    expect(readEmbedMessage(OK, null)).toEqual({ kind: 'ignore' });
    expect(readEmbedMessage(OK, { type: 'other' })).toEqual({ kind: 'ignore' });
  });
});
