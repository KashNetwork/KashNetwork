import { z } from 'zod';
import { getEmailProvider } from '@/server/adapters';
import { requireAuth } from '@/server/auth/guard';
import { config } from '@/server/config';
import { getDb } from '@/server/db';
import { badRequest, ok, readJson, route } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/support — support form. "from" is always the logged-in user's email
 * (sticky contact); message is stored and emailed to support@.
 */
export const POST = route(async (req) => {
  const { profile } = await requireAuth();
  const parsed = z
    .object({
      subject: z.string().trim().max(200).optional(),
      message: z.string().trim().min(1).max(5000),
    })
    .safeParse(await readJson(req));
  if (!parsed.success) throw badRequest('invalid_body');

  const ticket = await (await getDb()).createSupportTicket({
    profileId: profile.id,
    fromEmail: profile.email,
    subject: parsed.data.subject ?? null,
    message: parsed.data.message,
  });

  await getEmailProvider().send({
    from: config.resend.fromSupport,
    to: config.resend.supportInbox,
    replyTo: profile.email,
    subject: `[Support] ${parsed.data.subject ?? 'New message'} — ${profile.email}`,
    text: parsed.data.message,
    html: `<p>${parsed.data.message.replace(/\n/g, '<br>')}</p><hr><p>From: ${profile.email}</p>`,
    tags: { kind: 'support', ticket: ticket.id },
  });

  return ok({ ok: true, ticketId: ticket.id }, 201);
});
