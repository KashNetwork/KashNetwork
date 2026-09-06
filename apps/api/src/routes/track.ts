import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { REF_COOKIE, VISITOR_COOKIE } from '../auth/sessions.js';
import { config } from '../config.js';
import { getRepo } from '../db/index.js';
import { asyncHandler, clientIp } from '../lib/http.js';

const router = Router();
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

/**
 * POST /api/track/click — logs an affiliate link click and refreshes the
 * 30-day last-click cookie. Attribution consumption is Milestone 2; this just
 * records the click and cookie now so the data exists.
 */
router.post(
  '/click',
  asyncHandler(async (req, res) => {
    const parsed = z
      .object({
        ref: z.string().trim().min(1).max(64),
        linkKind: z.enum(['landing', 'sales', 'checkout']).default('landing'),
        path: z.string().max(300).optional(),
      })
      .safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'invalid_body' });
      return;
    }

    let visitorId = req.cookies?.[VISITOR_COOKIE] as string | undefined;
    if (!visitorId) {
      visitorId = randomUUID();
      res.cookie(VISITOR_COOKIE, visitorId, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 2 * 365 * 24 * 60 * 60 * 1000,
      });
    }

    const affiliate = await getRepo().getProfileByAffiliateCode(parsed.data.ref);
    const active =
      affiliate && affiliate.is_affiliate && affiliate.account_type === 'paid';

    if (active) {
      await getRepo().createClick({
        affiliate_id: affiliate.id,
        link_kind: parsed.data.linkKind,
        visitor_id: visitorId,
        ip: clientIp(req),
        user_agent: req.headers['user-agent'] ?? null,
        referer: (req.headers['referer'] as string) ?? null,
        landing_path: parsed.data.path ?? null,
      });
      // last-click wins: refresh on every click
      res.cookie(REF_COOKIE, parsed.data.ref, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: THIRTY_DAYS,
      });
    }

    res.json({ ok: true, attributed: Boolean(active) });
  }),
);

export default router;
