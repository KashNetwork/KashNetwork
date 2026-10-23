import { FREE_NURTURE_SEQUENCE, nextSendableIndex } from '@/content/email-sequence';
import { getEmailProvider } from '../adapters';
import { config } from '../config';
import type { Repo } from '../db/repo';
import { leadAppLink } from './magic-link';
import { renderSequenceEmail } from './email-render';
import { unsubscribeUrl } from './unsubscribe';

const HOUR_MS = 3_600_000;
/** Minimum time between two emails to the same lead, however late the job runs. */
const MIN_GAP_HOURS = 20;

/**
 * One tick of the free-lead nurture sequence — called from the cron alongside
 * the M2 payment maintenance. For every lead due (sequence_status='active'
 * and next_send_at <= now): sends that step's email with each {{link:...}}
 * resolved to the sales-page link of whichever affiliate is credited for this
 * lead (or the admin's own link if none), logs it to email_messages, and
 * advances to the next step. A send failure leaves next_send_at untouched so
 * the next tick retries it. Emails marked `hold` in the content file are
 * skipped, never sent.
 *
 * Gated on config.resend.enabled (a real, non-fake send). Without that gate,
 * production leads would accumulate "sent" state via the fake provider
 * (console.log, returns success) while RESEND_API_KEY isn't set yet — by the
 * time the sending domain is verified and it's flipped on, those early leads
 * would have already silently skipped the steps that "sent" while fake,
 * never actually receiving them. Leaving next_send_at untouched instead means
 * everyone's sequence genuinely starts once sending is real, not before.
 *
 * `force` bypasses that gate — for tests exercising the sequence logic itself
 * (step content, advancement, affiliate-link substitution) against the fake
 * provider without needing a real RESEND_API_KEY, which would also switch
 * getEmailProvider() to the real adapter and attempt actual network sends.
 * The real cron route never passes it.
 */
export async function runNurtureSequenceTick(repo: Repo, limit = 50, force = false) {
  if (!force && !config.resend.enabled) {
    return { sent: 0, completed: 0, failed: 0, due: 0, skipped: true };
  }

  const nowIso = new Date().toISOString();
  const due = await repo.listLeadsDueForSend(nowIso, limit);
  let sent = 0;
  let completed = 0;
  let failed = 0;

  for (const lead of due) {
    // held emails (copy that isn't true yet) are skipped, never sent
    const stepIndex = nextSendableIndex(lead.sequence_step);
    const step = stepIndex >= 0 ? FREE_NURTURE_SEQUENCE[stepIndex] : undefined;
    if (!step) {
      await repo.updateLeadState(lead.profile_id, { sequence_status: 'completed', next_send_at: null });
      completed++;
      continue;
    }

    let code = config.adminAffiliateCode;
    if (lead.email_affiliate_id) {
      const aff = await repo.getProfileById(lead.email_affiliate_id);
      if (aff?.affiliate_code) code = aff.affiliate_code;
    }
    // opens the lead's free account, with this affiliate's Sales page in "Harley's Story"
    const link = leadAppLink(lead.profile_id, code);
    const unsub = unsubscribeUrl(lead.profile_id);
    const rendered = renderSequenceEmail(step, link, unsub);
    const from = config.resend.fromHarley;

    try {
      const result = await getEmailProvider().send({
        from,
        to: lead.email,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        replyTo: config.resend.replyHarley,
        headers: {
          'List-Unsubscribe': `<${unsub}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
        tags: { sequence: lead.sequence, step: String(stepIndex) },
      });
      await repo.createEmailMessage({
        profileId: lead.profile_id,
        direction: 'outbound',
        fromAddr: from,
        toAddr: lead.email,
        subject: rendered.subject,
        bodyText: rendered.text,
        bodyHtml: rendered.html,
        sequenceStep: stepIndex,
        providerMessageId: result.providerMessageId,
      });

      const nextIndex = nextSendableIndex(stepIndex + 1);
      const nextStep = nextIndex >= 0 ? FREE_NURTURE_SEQUENCE[nextIndex] : undefined;
      if (nextStep) {
        // on schedule normally; after an outage, still leave a gap so nobody gets a burst of emails
        const nextSendAt = new Date(
          Math.max(
            new Date(lead.entered_at).getTime() + nextStep.afterHours * HOUR_MS,
            Date.now() + MIN_GAP_HOURS * HOUR_MS,
          ),
        ).toISOString();
        await repo.updateLeadState(lead.profile_id, { sequence_step: nextIndex, next_send_at: nextSendAt });
      } else {
        await repo.updateLeadState(lead.profile_id, {
          sequence_step: FREE_NURTURE_SEQUENCE.length,
          sequence_status: 'completed',
          next_send_at: null,
        });
      }
      sent++;
    } catch (e) {
      console.warn('[nurture] send failed for', lead.profile_id, (e as Error).message);
      failed++;
    }
  }

  return { sent, completed, failed, due: due.length };
}

/** Stops the sequence the moment a lead converts (buys the $1 trial). */
export async function markLeadConverted(repo: Repo, profileId: string) {
  const state = await repo.getLeadStateByProfile(profileId);
  if (!state || state.sequence_status !== 'active') return;
  await repo.updateLeadState(profileId, {
    sequence_status: 'converted',
    converted_at: new Date().toISOString(),
    next_send_at: null,
  });
}
