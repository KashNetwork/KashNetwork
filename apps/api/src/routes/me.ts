import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../auth/middleware.js';
import { getRepo } from '../db/index.js';
import { asyncHandler, badRequest } from '../lib/http.js';
import { presentMe } from '../services/account.js';

const router = Router();

/** GET /api/me — current account state + visible tabs. */
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ me: presentMe(req.auth!.profile) });
  }),
);

/** PATCH /api/me/profile — update editable profile fields (name only here;
 * email goes through /api/auth/email-change). */
router.patch(
  '/profile',
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = z
      .object({ fullName: z.string().trim().min(1).max(120) })
      .safeParse(req.body);
    if (!parsed.success) throw badRequest('invalid_body');
    const updated = await getRepo().updateProfile(req.auth!.profile.id, {
      full_name: parsed.data.fullName,
    });
    res.json({ me: presentMe(updated) });
  }),
);

export default router;
