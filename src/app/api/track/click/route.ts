import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { getCookie, REF_COOKIE, setCookie, VISITOR_COOKIE } from '@/server/auth/session';
import { getDb } from '@/server/db';
import { clientIp, ok, readJson, route } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const THIRTY_DAYS_S = 30 * 24 * 60 * 60;
const TWO_YEARS_S = 2 * 365 * 24 * 60 * 60;

/**
 * POST /api/track/click — logs an affiliate click and refreshes the 30-day
 * last-click cookie. Attribution consumption is Milestone 2.
 */
export const POST = route(async (req) => {
  const parsed = z
    .object({
      ref: z.string().trim().min(1).max(64),
      linkKind: z.enum(['landing', 'sales', 'checkout']).default('landing'),
      path: z.string().max(300).optional(),
    })
    .safeParse(await readJson(req));
  if (!parsed.success) return ok({ error: 'invalid_body' }, 400);

  let visitorId = await getCookie(VISITOR_COOKIE);
  if (!visitorId) {
    visitorId = randomUUID();
    await setCookie(VISITOR_COOKIE, visitorId, TWO_YEARS_S);
  }

  const db = await getDb();
  const affiliate = await db.getProfileByAffiliateCode(parsed.data.ref);
  const active = affiliate && affiliate.is_affiliate && affiliate.account_type === 'paid';

  if (active) {
    await db.createClick({
      affiliate_id: affiliate.id,
      link_kind: parsed.data.linkKind,
      visitor_id: visitorId,
      ip: clientIp(req),
      user_agent: req.headers.get('user-agent'),
      referer: req.headers.get('referer'),
      landing_path: parsed.data.path ?? null,
    });
    await setCookie(REF_COOKIE, parsed.data.ref, THIRTY_DAYS_S);
  }

  return ok({ ok: true, attributed: Boolean(active) });
});
