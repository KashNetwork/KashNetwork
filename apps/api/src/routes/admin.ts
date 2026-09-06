import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin } from '../auth/middleware.js';
import { getRepo } from '../db/index.js';
import { asyncHandler, badRequest, notFound } from '../lib/http.js';
import { MONEY } from '@kash/shared';

const router = Router();
router.use(requireAdmin);

/** GET /api/admin/overview — metric cards for the initial admin dashboard. */
router.get(
  '/overview',
  asyncHandler(async (_req, res) => {
    const o = await getRepo().adminOverview();
    res.json({
      activePaidMembers: o.activePaid,
      freeLeads: o.freeLeads,
      cancelledMembers: o.cancelled,
      totalProfiles: o.totalProfiles,
      // revenue/payout figures are Milestone 2/3 — placeholders so the UI renders
      adminRevenueCents: o.activePaid * MONEY.adminRecurringCents,
      pendingPayoutsCents: 0,
    });
  }),
);

/** GET /api/admin/users?filter=&q=&page= */
router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const q = z
      .object({
        filter: z.enum(['all', 'free_leads', 'active_paid', 'cancelled']).catch('all'),
        q: z.string().trim().max(120).optional(),
        page: z.coerce.number().int().min(1).catch(1),
      })
      .parse(req.query);
    const { rows, total } = await getRepo().adminListUsers({
      filter: q.filter,
      q: q.q,
      page: q.page,
      pageSize: 25,
    });
    res.json({ rows, total, page: q.page, pageSize: 25 });
  }),
);

/** PATCH /api/admin/users/:id — manual status override (M1: coarse). */
router.patch(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        accountType: z.enum(['free', 'paid']).optional(),
        freeVariant: z.enum(['lead', 'downgraded']).optional(),
        role: z.enum(['user', 'admin']).optional(),
        isAffiliate: z.boolean().optional(),
      })
      .safeParse(req.body);
    if (!body.success) throw badRequest('invalid_body');

    const target = await getRepo().getProfileById(req.params.id!);
    if (!target) throw notFound();

    const patch: Record<string, unknown> = {};
    if (body.data.accountType) patch.account_type = body.data.accountType;
    if (body.data.freeVariant) patch.free_variant = body.data.freeVariant;
    if (body.data.role) patch.role = body.data.role;
    if (body.data.isAffiliate !== undefined) patch.is_affiliate = body.data.isAffiliate;
    if (Object.keys(patch).length === 0) throw badRequest('nothing_to_update');

    const updated = await getRepo().updateProfile(target.id, patch);
    await getRepo().createAudit({
      adminId: req.auth!.profile.id,
      action: 'user.status_override',
      targetType: 'profile',
      targetId: target.id,
      before: {
        account_type: target.account_type,
        free_variant: target.free_variant,
        role: target.role,
        is_affiliate: target.is_affiliate,
      },
      after: patch,
    });
    res.json({ user: updated });
  }),
);

export default router;
