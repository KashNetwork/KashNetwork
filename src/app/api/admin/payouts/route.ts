import { z } from 'zod';
import { PAYOUT_STATUS } from '@/shared';
import { requireAdmin } from '@/server/auth/guard';
import { getDb } from '@/server/db';
import { badRequest, ok, route } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const querySchema = z.object({
  status: z.enum([...PAYOUT_STATUS, 'all']).default('requested'),
  page: z.coerce.number().int().min(1).default(1),
});

/** GET /api/admin/payouts?status=requested&page=1 — the cashout approval queue. */
export const GET = route(async (req) => {
  await requireAdmin();
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    status: url.searchParams.get('status') ?? undefined,
    page: url.searchParams.get('page') ?? undefined,
  });
  if (!parsed.success) throw badRequest('invalid_query');

  const db = await getDb();
  const { rows, total } = await db.listPayoutsByStatus(parsed.data.status, {
    page: parsed.data.page,
    pageSize: 25,
  });
  return ok({
    rows: rows.map((p) => ({
      id: p.id,
      affiliateEmail: p.affiliate_email,
      affiliateName: p.affiliate_full_name,
      amountCents: p.amount_cents,
      status: p.status,
      method: p.method,
      methodDetails: p.method_details,
      requestedAt: p.requested_at,
      paidAt: p.paid_at,
      rejectedReason: p.rejected_reason,
    })),
    total,
    page: parsed.data.page,
    pageSize: 25,
  });
});
