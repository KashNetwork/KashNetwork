import { z } from 'zod';
import { requireAdmin } from '@/server/auth/guard';
import { getDb } from '@/server/db';
import { badRequest, notFound, ok, readJson, route } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** PATCH /api/admin/users/:id — manual status override (M1: coarse). */
export const PATCH = route(async (req, ctx) => {
  const { profile: admin } = await requireAdmin();
  const { id } = await ctx.params;

  const body = z
    .object({
      accountType: z.enum(['free', 'paid']).optional(),
      freeVariant: z.enum(['lead', 'downgraded']).optional(),
      role: z.enum(['user', 'admin']).optional(),
      isAffiliate: z.boolean().optional(),
    })
    .safeParse(await readJson(req));
  if (!body.success) throw badRequest('invalid_body');

  const db = await getDb();
  const target = await db.getProfileById(id);
  if (!target) throw notFound();

  const patch: Record<string, unknown> = {};
  if (body.data.accountType) patch.account_type = body.data.accountType;
  if (body.data.freeVariant) patch.free_variant = body.data.freeVariant;
  if (body.data.role) patch.role = body.data.role;
  if (body.data.isAffiliate !== undefined) patch.is_affiliate = body.data.isAffiliate;
  if (Object.keys(patch).length === 0) throw badRequest('nothing_to_update');

  const updated = await db.updateProfile(target.id, patch);
  await db.createAudit({
    adminId: admin.id,
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
  return ok({ user: updated });
});
