// Explodely "Embed Checkout" settings (Seller Hub > Products > Customise Checkout > Embed Checkout).
// The page embeds Explodely's own form in an iframe:
//   https://explodely.com/e/iframe.php?skin=<skin>&pid=<pid>
// "PAY NOW" is Explodely's default button text, so no btnText option is set.
export const EXPLODELY_EMBED = {
  origin: 'https://explodely.com',
  pid: '1021006537',
  skin: 'light',
} as const;

export function embedSrc(affiliateCode?: string): string {
  const q = new URLSearchParams({ skin: EXPLODELY_EMBED.skin, pid: EXPLODELY_EMBED.pid });
  // best effort: lets Explodely tag the sale with our affiliate code (same name as on the payment link)
  if (affiliateCode) q.set('tpa', affiliateCode);
  return `${EXPLODELY_EMBED.origin}/e/iframe.php?${q.toString()}`;
}

export type EmbedAction =
  | { kind: 'height'; px: number }
  | { kind: 'success'; redirectTo: string }
  | { kind: 'ignore' };

/**
 * Explodely tells the page two things through postMessage: how tall its form is, and when the
 * payment succeeded (with the Thank You URL). Only messages from explodely.com count, and a
 * redirect is only followed if it is an http(s) address.
 */
export function readEmbedMessage(origin: string, data: unknown, fallbackRedirect = '/thanks'): EmbedAction {
  if (origin !== EXPLODELY_EMBED.origin || !data || typeof data !== 'object') return { kind: 'ignore' };
  const d = data as { type?: unknown; height?: unknown; redirectUrl?: unknown };
  if (d.type === 'checkout-height') {
    const px = Number(d.height);
    return Number.isFinite(px) && px > 0 && px < 10_000 ? { kind: 'height', px: Math.round(px) } : { kind: 'ignore' };
  }
  if (d.type === 'iframeSuccess') {
    const url = typeof d.redirectUrl === 'string' ? d.redirectUrl : '';
    return { kind: 'success', redirectTo: /^https?:\/\//i.test(url) ? url : fallbackRedirect };
  }
  return { kind: 'ignore' };
}
