import { NextResponse } from 'next/server';
import { config } from '@/server/config';
import { getCookie, REF_COOKIE } from '@/server/auth/session';
import { currentSession } from '@/server/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/checkout/start?ref=CODE
 * Redirects to the Explodely hosted checkout for the $1 trial, passing our
 * affiliate code through as `tpa` (Explodely records it and zeroes its own
 * commission) and prefilling the buyer's email when we know it.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const ref = url.searchParams.get('ref') ?? (await getCookie(REF_COOKIE)) ?? null;

  if (!config.explodely.enabled) {
    // not wired yet — send them to the on-site placeholder
    return NextResponse.redirect(new URL('/secure-checkout?pending=1', url.origin));
  }

  const checkout = new URL(`${config.explodely.checkoutBase}/${config.explodely.productId}`);
  if (ref) checkout.searchParams.set('tpa', ref);

  const session = await currentSession();
  const typed = url.searchParams.get('email')?.trim().toLowerCase();
  const email = typed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(typed) ? typed : session?.profile.email;
  if (email) checkout.searchParams.set('checkout_email', email);

  return NextResponse.redirect(checkout.toString(), 303);
}
