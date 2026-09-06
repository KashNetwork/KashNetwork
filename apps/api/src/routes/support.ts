import { Router } from 'express';
import { z } from 'zod';
import { getEmailProvider } from '../adapters/index.js';
import { requireAuth } from '../auth/middleware.js';
import { getRepo } from '../db/index.js';
import { asyncHandler, badRequest } from '../lib/http.js';

const router = Router();

/**
 * POST /api/support — support form. The "from" is always the logged-in user's
 * email (sticky contact); message is stored and emailed to support@.
 */
router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = z
      .object({
        subject: z.string().trim().max(200).optional(),
        message: z.string().trim().min(1).max(5000),
      })
      .safeParse(req.body);
    if (!parsed.success) throw badRequest('invalid_body');

    const profile = req.auth!.profile;
    const ticket = await getRepo().createSupportTicket({
      profileId: profile.id,
      fromEmail: profile.email,
      subject: parsed.data.subject ?? null,
      message: parsed.data.message,
    });

    await getEmailProvider().send({
      from: 'support@kash.network',
      to: 'support@kash.network',
      replyTo: profile.email,
      subject: `[Support] ${parsed.data.subject ?? 'New message'} — ${profile.email}`,
      text: parsed.data.message,
      html: `<p>${parsed.data.message.replace(/\n/g, '<br>')}</p><hr><p>From: ${profile.email}</p>`,
      tags: { kind: 'support', ticket: ticket.id },
    });

    res.status(201).json({ ok: true, ticketId: ticket.id });
  }),
);

export default router;
