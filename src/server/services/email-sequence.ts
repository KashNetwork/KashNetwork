import { FREE_NURTURE_SEQUENCE } from '@/content/email-sequence';
import { getEmailProvider } from '../adapters';
import { config } from '../config';
import type { Repo } from '../db/repo';
import { affiliateLinks } from './account';

function renderBody(text: string, link: string): string {
  return text.replaceAll('{{affiliate_link}}', link);
}

function toHtml(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const linked = escaped.replace(/(https?:\/\/\S+)/g, '<a href="$1">$1</a>');
  const paragraphs = linked
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('\n');
  return `<div style="font-family:sans-serif;font-size:15px;line-height:1.6;color:#0f172a;">${paragraphs}</div>`;
}

const DAY_MS = 86_400_000;

/**
 * One tick of the free-lead nurture sequence — called from the cron alongside
 * the M2 payment maintenance. For every lead due (sequence_status='active'
 * and next_send_at <= now): sends that step's email with {{affiliate_link}}
 * resolved to whichever affiliate is credited for this lead (or admin's own
 * link if none), logs it to email_messages, and advances to the next step.
 * A send failure leaves next_send_at untouched so the next tick retries it.
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
    const step = FREE_NURTURE_SEQUENCE[lead.sequence_step];
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
    const link = affiliateLinks(code).sales;
    const bodyText = renderBody(step.text, link);
    const bodyHtml = toHtml(bodyText);
    const from = config.resend.fromHarley;

    try {
      const result = await getEmailProvider().send({
        from,
        to: lead.email,
        subject: step.subject,
        html: bodyHtml,
        text: bodyText,
        tags: { sequence: lead.sequence, step: String(lead.sequence_step) },
      });
      await repo.createEmailMessage({
        profileId: lead.profile_id,
        direction: 'outbound',
        fromAddr: from,
        toAddr: lead.email,
        subject: step.subject,
        bodyText,
        bodyHtml,
        sequenceStep: lead.sequence_step,
        providerMessageId: result.providerMessageId,
      });

      const nextIndex = lead.sequence_step + 1;
      const nextStep = FREE_NURTURE_SEQUENCE[nextIndex];
      if (nextStep) {
        const nextSendAt = new Date(
          new Date(lead.entered_at).getTime() + nextStep.day * DAY_MS,
        ).toISOString();
        await repo.updateLeadState(lead.profile_id, { sequence_step: nextIndex, next_send_at: nextSendAt });
      } else {
        await repo.updateLeadState(lead.profile_id, {
          sequence_step: nextIndex,
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
