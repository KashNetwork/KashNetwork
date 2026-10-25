import { z } from 'zod';
import { requireAdmin } from '@/server/auth/guard';
import { getDb } from '@/server/db';
import { route } from '@/server/http';
import { toCsv } from '@/server/services/csv';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/admin/export?type=users|payouts — CSV download for the admin. */
export const GET = route(async (req) => {
  await requireAdmin();
  const type = z.enum(['users', 'payouts']).catch('users').parse(new URL(req.url).searchParams.get('type'));
  const db = await getDb();
  let csv: string;
  if (type === 'users') {
    const { rows } = await db.adminListUsers({ filter: 'all', page: 1, pageSize: 100000 });
    csv = toCsv(
      ['email', 'name', 'status', 'affiliate_code', 'referrals', 'joined'],
      rows.map((r) => [r.email, r.full_name, r.free_variant === 'downgraded' ? 'cancelled' : r.account_type, r.affiliate_code, r.referral_count, r.created_at]),
    );
  } else {
    const { rows } = await db.listPayoutsByStatus('all', { page: 1, pageSize: 100000 });
    csv = toCsv(
      ['affiliate_email', 'name', 'amount_usd', 'status', 'method', 'destination', 'requested', 'paid'],
      rows.map((p) => [
        p.affiliate_email,
        p.affiliate_full_name,
        (p.amount_cents / 100).toFixed(2),
        p.status,
        p.method,
        typeof p.method_details === 'object' && p.method_details && 'destination' in p.method_details
          ? String((p.method_details as { destination: unknown }).destination)
          : '',
        p.requested_at,
        p.paid_at,
      ]),
    );
  }
  return new Response(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="kash-${type}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
});
