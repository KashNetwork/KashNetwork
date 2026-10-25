import { z } from 'zod';
import { requireAdmin } from '@/server/auth/guard';
import { getDb } from '@/server/db';
import { badRequest, notFound, ok, readJson, route } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/users/:id/referrer { affiliateCode } — move a member under a different
 * affiliate. Only future commissions follow the new affiliate; earned ones stay where they are.
 */
export const POST = route(async (req, ctx) => {
  const { profile: admin } = await requireAdmin();
  const { id } = await ctx.params;
  const body = z.object({ affiliateCode: z.string().trim().min(1).max(64) }).safeParse(await readJson(req));
  if (!body.success) throw badRequest('invalid_body');

  const db = await getDb();
  const member = await db.getProfileById(id);
  if (!member) throw notFound();
  const affiliate = await db.getProfileByAffiliateCode(body.data.affiliateCode);
  if (!affiliate || !affiliate.is_affiliate) throw badRequest('unknown_affiliate_code');
  if (affiliate.id === member.id) throw badRequest('cannot_refer_self');

  const referral = await db.getReferralByReferredProfile(member.id);
  await db.updateProfile(member.id, { referred_by_affiliate_id: affiliate.id });
  if (referral) await db.updateReferral(referral.id, { affiliate_id: affiliate.id, attribution_locked: true });
  await db.createAudit({
    adminId: admin.id,
    action: 'referral.reassign',
    targetType: 'profile',
    targetId: member.id,
    before: { affiliate_id: referral?.affiliate_id ?? member.referred_by_affiliate_id ?? null },
    after: { affiliate_id: affiliate.id },
  });
  return ok({ reassigned: true, affiliateEmail: affiliate.email });
});
