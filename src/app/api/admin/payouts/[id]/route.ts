import { z } from 'zod';
import { requireAdmin } from '@/server/auth/guard';
import { getDb } from '@/server/db';
import { badRequest, conflict, notFound, ok, readJson, route } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('approve') }),
  z.object({ action: z.literal('reject'), reason: z.string().trim().min(1).max(300) }),
]);

/**
 * PATCH /api/admin/payouts/:id
 * { action: "approve" } — one-click "Approve & Mark Paid": payout -> paid,
 *   every linked commission -> paid, pending balance recalculates to $0.
 * { action: "reject", reason } — payout -> rejected, linked commissions
 *   revert to 'available' (not forfeited — the affiliate can request again).
 */
export const PATCH = route(async (req, ctx) => {
  const { profile: admin } = await requireAdmin();
  const { id } = await ctx.params;
  const parsed = bodySchema.safeParse(await readJson(req));
  if (!parsed.success) throw badRequest('invalid_body');

  const db = await getDb();
  const existing = await db.getPayoutById(id);
  if (!existing) throw notFound('payout not found');
  if (existing.status !== 'requested') {
    throw conflict('not_requested', `This payout is already ${existing.status}.`);
  }

  const before = { status: existing.status };
  const payout =
    parsed.data.action === 'approve'
      ? await db.approveAndPayPayout(id, admin.id)
      : await db.rejectPayout(id, admin.id, parsed.data.reason);

  await db.createAudit({
    adminId: admin.id,
    action: parsed.data.action === 'approve' ? 'payout.approved' : 'payout.rejected',
    targetType: 'payout',
    targetId: id,
    before,
    after: { status: payout.status, reason: parsed.data.action === 'reject' ? parsed.data.reason : undefined },
  });

  return ok({
    payout: {
      id: payout.id,
      status: payout.status,
      amountCents: payout.amount_cents,
      paidAt: payout.paid_at,
      rejectedReason: payout.rejected_reason,
    },
  });
});
