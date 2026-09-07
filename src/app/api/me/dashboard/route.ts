import { requirePaid } from '@/server/auth/guard';
import { getDb } from '@/server/db';
import { forbidden, ok, route } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/me/dashboard — affiliate stats + recent referrals + commission history. */
export const GET = route(async () => {
  const { profile } = await requirePaid();
  if (!profile.is_affiliate) throw forbidden('not_an_affiliate');
  const db = await getDb();

  const [stats, referrals, commissions] = await Promise.all([
    db.affiliateStats(profile.id),
    db.listReferralsByAffiliate(profile.id, 10),
    db.listCommissionsByAffiliate(profile.id, 10),
  ]);

  const referredEmails = await Promise.all(
    referrals.map((r) => db.getProfileById(r.referred_profile_id)),
  );

  return ok({
    stats,
    recentReferrals: referrals.map((r, i) => ({
      id: r.id,
      email: maskEmail(referredEmails[i]?.email ?? null),
      status: r.status,
      date: r.created_at,
      source: r.attribution_source,
    })),
    commissionHistory: commissions.map((c) => ({
      id: c.id,
      amountCents: c.amount_cents,
      kind: c.kind,
      status: c.status,
      date: c.created_at,
      availableAt: c.available_at,
    })),
  });
});

function maskEmail(email: string | null): string {
  if (!email) return 'unknown';
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const shown = (local ?? '').slice(0, 2);
  return `${shown}${'•'.repeat(Math.max(1, (local ?? '').length - 2))}@${domain}`;
}
