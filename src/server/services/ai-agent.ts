import type { InboundEmail } from '@/shared';
import { getAiProvider, getEmailProvider } from '../adapters';
import { config } from '../config';
import type { Repo } from '../db/repo';
import type { ProfileRow } from '../db/types';
import { affiliateLinks } from './account';
import { leadAppLink } from './magic-link';

export const AI_NAME = "Kash (Harley's A.I. Assistant)";
/** Exact opening of the first AI reply in a conversation (client-specified wording). */
export const AI_INTRO = "Hi I'm Kash, Harley's A.I. Assistant! I'll be taking over the conversation moving forward.";

/** Replies the agent will send on one lead's thread before a person takes over. */
export const MAX_AI_REPLIES_PER_THREAD = 6;
/** Global brake on AI-written emails per rolling day (cost + runaway-loop guard). */
export const MAX_AI_REPLIES_PER_DAY = 200;

export type InboundResult =
  | { action: 'ignored'; reason: string }
  | { action: 'unsubscribed' }
  | { action: 'escalated'; reason: string; ticketId: string }
  | { action: 'replied'; messageId: string };

// Topics the agent never answers on its own — money, legal, anger. A person does.
const ESCALATE = /\b(refund|chargeback|dispute|charged|charge me|billing|lawyer|attorney|legal|sue|scam|fraud|report you|ftc|complain)\b/i;
const UNSUBSCRIBE = /\b(unsubscribe|stop (?:emailing|sending|contacting)|remove me|do not contact|don'?t contact|take me off)\b/i;
const AUTO_SENDER = /(mailer-daemon|postmaster|no-?reply|do-?not-?reply|bounce)/i;
const AUTO_SUBJECT = /^(auto(?:matic)? reply|auto:|out of office|undeliverable|delivery status)/i;

export function extractAddress(raw: string): string {
  const m = /<([^>]+)>/.exec(raw);
  return (m ? m[1]! : raw).trim().toLowerCase();
}

function stripQuotedReply(text: string): string {
  const cut = text.search(/\n>|\nOn .{5,80} wrote:|\n-{2,} ?Original Message/i);
  return (cut > 0 ? text.slice(0, cut) : text).trim();
}

function leadReplySystem(link: string, first: boolean): string {
  return [
    "You are Kash, Harley's A.I. assistant, writing a short, friendly email reply for Kash Network. You are an AI and never pretend to be Harley or a human.",
    'Kash Network is an email-marketing and affiliate referral program. A 7-day trial costs $1, then it is $47/month, and the member can cancel any time.',
    'Rules:',
    '- Plain text, under 90 words, warm and direct. No bullet lists, no headings, no emojis.',
    '- Answer what the person actually asked. If you do not know, say you will have the team follow up.',
    '- Never promise or imply any level of income, results or timeline. If asked about earnings, say results vary and are not guaranteed.',
    '- The trial is NOT free: it costs $1 for 7 days. Never state any other price, trial length, discount or guarantee. If asked about anything not listed here, say the team will follow up.',
    '- Never discuss refunds, billing disputes or legal questions; say the team will follow up.',
    `- If a next step helps, you may include this link once, exactly as written: {{affiliate_link}} (it resolves to ${link}).`,
    first
      ? '- Do not greet or introduce yourself: an introduction is added above your text automatically. Start directly with the answer.'
      : '- You have already introduced yourself earlier in this conversation. Do not introduce yourself again; start directly with the answer.',
    `- Sign off with exactly: ${AI_NAME}`,
  ].join('\n');
}

function supportReplySystem(first: boolean): string {
  return [
    "You are Kash, Harley's A.I. assistant, answering support questions for Kash Network by email. You are an AI and never pretend to be Harley or a human.",
    'Facts you may use: a 7-day trial costs $1, then membership is $47/month and can be cancelled any time from the Cancel Subscription tab in the account. Members earn commissions through their unique referral link; commissions are held for 30 days and can be cashed out from the Commissions tab once the available balance reaches $30. The contact page is https://kash.network/contact.',
    'Rules:',
    '- Plain text, under 110 words, polite and specific. No emojis.',
    '- Never promise income or results. Never state anything about refunds or billing disputes beyond: the team will follow up.',
    '- The trial is NOT free: it costs $1 for 7 days. Never state any other price, trial length or discount.',
    '- If you are not sure of an answer, say the team will follow up within one business day.',
    first
      ? '- Do not greet or introduce yourself: an introduction is added above your text automatically. Start directly with the answer.'
      : '- You have already introduced yourself earlier in this conversation. Do not introduce yourself again; start directly with the answer.',
    `- Sign off with exactly: ${AI_NAME}`,
  ].join('\n');
}

function toHtml(text: string): string {
  const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const linked = esc.replace(/(https?:\/\/\S+)/g, '<a href="$1">$1</a>');
  const paras = linked.split(/\n\n+/).map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('\n');
  return `<div style="font-family:sans-serif;font-size:15px;line-height:1.6;color:#0f172a;">${paras}</div>`;
}

async function affiliateLinkFor(repo: Repo, profile: ProfileRow | null): Promise<string> {
  let code = config.adminAffiliateCode;
  if (profile) {
    const state = await repo.getLeadStateByProfile(profile.id);
    if (state?.email_affiliate_id) {
      const aff = await repo.getProfileById(state.email_affiliate_id);
      if (aff?.affiliate_code) code = aff.affiliate_code;
    }
  }
  // a free member gets the link that opens their free account ("Harley's Story" with this affiliate's Sales page)
  if (profile && profile.account_type === 'free') return leadAppLink(profile.id, code);
  return affiliateLinks(code).sales;
}

async function escalate(
  repo: Repo,
  mail: InboundEmail,
  fromEmail: string,
  profile: ProfileRow | null,
  reason: string,
): Promise<InboundResult> {
  const ticket = await repo.createSupportTicket({
    profileId: profile?.id ?? null,
    fromEmail,
    subject: mail.subject || null,
    message: stripQuotedReply(mail.text) || '(empty message)',
  });
  try {
    await getEmailProvider().send({
      from: config.resend.fromSupport,
      to: config.resend.supportInbox,
      replyTo: fromEmail,
      subject: `[Needs a person: ${reason}] ${mail.subject || 'New email'} — ${fromEmail}`,
      text: stripQuotedReply(mail.text),
      html: toHtml(stripQuotedReply(mail.text)),
      tags: { kind: 'escalation', ticket: ticket.id },
    });
  } catch (e) {
    console.warn('[ai-agent] could not notify support inbox:', (e as Error).message);
  }
  return { action: 'escalated', reason, ticketId: ticket.id };
}

/** Merge consecutive same-role turns so every provider sees alternating roles starting with the user. */
function toChat(history: { role: 'user' | 'assistant'; content: string }[]) {
  const out: { role: 'user' | 'assistant'; content: string }[] = [];
  for (const m of history) {
    if (!m.content.trim()) continue;
    const last = out[out.length - 1];
    if (last && last.role === m.role) last.content += `\n\n${m.content}`;
    else out.push({ ...m });
  }
  while (out.length && out[0]!.role !== 'user') out.shift();
  return out;
}

/**
 * Inbound email (a lead replying to a sequence email, or anyone writing to
 * support@). Coordinates the AI with the automated sequence:
 *  - a reply from a lead stops their drip sequence and hands them to the AI thread
 *  - "unsubscribe" stops everything and gets no reply
 *  - money / legal / angry messages and unknown senders go to a person as a ticket
 *  - otherwise the AI answers, capped per thread and per day
 */
export async function handleInboundEmail(repo: Repo, mail: InboundEmail): Promise<InboundResult> {
  const fromEmail = extractAddress(mail.from);
  const ownAddresses = [
    config.resend.fromHarley,
    config.resend.fromSupport,
    config.resend.replyHarley,
    config.resend.replySupport,
    config.resend.supportInbox,
  ].map(extractAddress);
  if (!fromEmail || AUTO_SENDER.test(fromEmail) || ownAddresses.includes(fromEmail) || AUTO_SUBJECT.test(mail.subject.trim())) {
    return { action: 'ignored', reason: 'automatic or own message' };
  }

  const profile = await repo.getProfileByEmail(fromEmail);
  const body = stripQuotedReply(mail.text);
  const supportLane = /support@/i.test(mail.to);

  await repo.createEmailMessage({
    profileId: profile?.id ?? null,
    direction: 'inbound',
    fromAddr: fromEmail,
    toAddr: extractAddress(mail.to),
    subject: mail.subject || null,
    bodyText: body,
    bodyHtml: mail.html,
    inReplyTo: mail.inReplyToProviderId,
  });

  if (UNSUBSCRIBE.test(body)) {
    if (profile) {
      const state = await repo.getLeadStateByProfile(profile.id);
      if (state && (state.sequence_status === 'active')) {
        await repo.updateLeadState(profile.id, { sequence_status: 'stopped', next_send_at: null });
      }
      await repo.setAiThreadActive(profile.id, false);
    }
    return { action: 'unsubscribed' };
  }

  // someone replied: the drip stops, the conversation is now the AI's (or a person's)
  if (profile) {
    const state = await repo.getLeadStateByProfile(profile.id);
    if (state?.sequence_status === 'active') {
      await repo.updateLeadState(profile.id, { sequence_status: 'stopped', next_send_at: null });
    }
  }

  if (ESCALATE.test(body) || ESCALATE.test(mail.subject)) {
    return escalate(repo, mail, fromEmail, profile, 'money, legal or complaint');
  }
  if (!profile && !supportLane) {
    return escalate(repo, mail, fromEmail, profile, 'unknown sender');
  }

  let first = true; // the first AI reply in a conversation opens with the introduction
  if (profile) {
    const thread = await repo.getAiThread(profile.id);
    if (thread && (!thread.active || thread.message_count >= MAX_AI_REPLIES_PER_THREAD)) {
      return escalate(repo, mail, fromEmail, profile, 'AI reply limit reached for this thread');
    }
    first = !thread || thread.message_count === 0;
  }
  const sinceDay = new Date(Date.now() - 86_400_000).toISOString();
  if ((await repo.countAiRepliesSince(sinceDay)) >= MAX_AI_REPLIES_PER_DAY) {
    return escalate(repo, mail, fromEmail, profile, 'daily AI reply limit reached');
  }

  const link = await affiliateLinkFor(repo, profile);
  let replyText: string;
  try {
    const past = profile ? await repo.listEmailMessagesByProfile(profile.id, 12) : [];
    const chronological = [...past].reverse().filter((m) => m.body_text);
    const history = toChat(
      chronological.map((m) => ({
        role: m.direction === 'inbound' ? ('user' as const) : ('assistant' as const),
        content: m.body_text ?? '',
      })),
    );
    if (!history.length || history[history.length - 1]!.role !== 'user') history.push({ role: 'user', content: body });

    const result = await getAiProvider().complete({
      system: supportLane ? supportReplySystem(first) : leadReplySystem(link, first),
      messages: history,
      maxOutputTokens: 400,
    });
    replyText = result.text.replaceAll('{{affiliate_link}}', link).trim();
    if (replyText && first) replyText = `${AI_INTRO}\n\n${replyText}`;
  } catch (e) {
    console.warn('[ai-agent] AI call failed:', (e as Error).message);
    return escalate(repo, mail, fromEmail, profile, 'AI unavailable');
  }
  if (!replyText) return escalate(repo, mail, fromEmail, profile, 'empty AI reply');

  // sent under the AI's own name, from the same real addresses
  const from = `"${AI_NAME}" <${extractAddress(supportLane ? config.resend.fromSupport : config.resend.fromHarley)}>`;
  const subject = /^re:/i.test(mail.subject) ? mail.subject : `Re: ${mail.subject || 'your message'}`;
  const sent = await getEmailProvider().send({
    from,
    to: fromEmail,
    subject,
    text: replyText,
    html: toHtml(replyText),
    replyTo: supportLane ? config.resend.replySupport : config.resend.replyHarley,
    tags: { kind: supportLane ? 'ai_support' : 'ai_lead_reply' },
  });
  const stored = await repo.createEmailMessage({
    profileId: profile?.id ?? null,
    direction: 'outbound',
    fromAddr: from,
    toAddr: fromEmail,
    subject,
    bodyText: replyText,
    bodyHtml: toHtml(replyText),
    providerMessageId: sent.providerMessageId,
    aiGenerated: true,
  });
  if (profile) await repo.recordAiReply(profile.id);
  return { action: 'replied', messageId: stored.id };
}

/**
 * A bounce (address doesn't exist) or spam complaint on one of our emails.
 * Stop the drip and the AI thread so we never mail that address again.
 * Only our own outbound mail counts — bounces of notices to us are ignored.
 */
export async function stopForBadAddress(repo: Repo, event: { data?: { to?: unknown } }): Promise<boolean> {
  const to = Array.isArray(event.data?.to) ? event.data!.to[0] : event.data?.to;
  const email = extractAddress(String(to ?? ''));
  if (!email) return false;
  const profile = await repo.getProfileByEmail(email);
  if (!profile) return false;
  const state = await repo.getLeadStateByProfile(profile.id);
  if (state && state.sequence_status === 'active') {
    await repo.updateLeadState(profile.id, { sequence_status: 'stopped', next_send_at: null });
  }
  await repo.setAiThreadActive(profile.id, false);
  return true;
}
