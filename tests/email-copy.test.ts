import { beforeEach, describe, expect, it } from 'vitest';
import { FREE_NURTURE_SEQUENCE, nextSendableIndex } from '@/content/email-sequence';
import { InMemoryRepo } from '@/server/db/memory';
import { runNurtureSequenceTick } from '@/server/services/email-sequence';
import { renderSequenceEmail } from '@/server/services/email-render';
import { hashPassword } from '@/server/auth/passwords';

const LINK = 'https://kash.network/activate?ref=AFF777';
const UNSUB = 'https://kash.network/api/unsubscribe?t=abc';

describe('the 30 client emails', () => {
  it('has all 30 days in order, due 1 hour after sign-up and then daily', () => {
    expect(FREE_NURTURE_SEQUENCE).toHaveLength(30);
    FREE_NURTURE_SEQUENCE.forEach((s, i) => expect(s.day).toBe(i + 1));
    expect(FREE_NURTURE_SEQUENCE[0]!.afterHours).toBe(1);
    expect(FREE_NURTURE_SEQUENCE[1]!.afterHours).toBe(25);
    expect(FREE_NURTURE_SEQUENCE[29]!.afterHours).toBe(1 + 29 * 24);
  });

  it('every email has one call-to-action, shown as hyperlink text and never as a raw URL', () => {
    for (const step of FREE_NURTURE_SEQUENCE) {
      const labels = [...step.body.matchAll(/\{\{link:(.+?)\}\}/g)].map((m) => m[1]!);
      expect(labels, `day ${step.day}`).toHaveLength(1);
      const { html, text } = renderSequenceEmail(step, LINK, UNSUB);
      // the label is the anchor text and the affiliate link is its href
      const escLabel = labels[0]!.replace(/&/g, '&amp;');
      expect(html, `day ${step.day}`).toContain(`>${escLabel}</a>`);
      expect(html).toContain(`href="${LINK}"`);
      // the raw affiliate URL appears only inside that href, never as visible text
      const visible = html.replace(/<[^>]+>/g, ' ');
      expect(visible, `day ${step.day}`).not.toContain('ref=AFF777');
      expect(visible).not.toContain('{{');
      // plain-text version still carries the URL so non-HTML clients can click it
      expect(text).toContain(LINK);
      expect(text).toContain('Carter');
      expect(text).toContain('Unsubscribe');
    }
  });

  it('keeps the client wording, e.g. day 3', () => {
    const d3 = FREE_NURTURE_SEQUENCE[2]!;
    expect(d3.subject).toBe('What happens if you do nothing today?');
    const { html } = renderSequenceEmail(d3, LINK, UNSUB);
    expect(html).toContain('>Activate Your $1 Trial &amp; Start Moving Forward</a>');
    expect(html).toContain('Talk soon,');
  });

  it('renders the numbered list (day 16) and bullets (day 23)', () => {
    expect(renderSequenceEmail(FREE_NURTURE_SEQUENCE[15]!, LINK, UNSUB).html).toContain('<ol');
    const d23 = renderSequenceEmail(FREE_NURTURE_SEQUENCE[22]!, LINK, UNSUB).html;
    expect(d23).toContain('<strong>Your Premium Dashboard:</strong>');
  });

  it('sends all 30: the three rewritten emails (25, 29, 30) are switched on', () => {
    expect(FREE_NURTURE_SEQUENCE.filter((s) => s.hold)).toHaveLength(0);
    expect(nextSendableIndex(24)).toBe(24); // day 25 follows day 24
    expect(FREE_NURTURE_SEQUENCE[24]!.subject).toBe('The cost of sitting on the sidelines ⏳');
    expect(FREE_NURTURE_SEQUENCE[28]!.subject).toBe('Where will you be 30 days from now?');
    expect(FREE_NURTURE_SEQUENCE[29]!.subject).toBe('Final Notice: This is my final check-in. 🚨');
  });
});

describe('sending the sequence', () => {
  let repo: InMemoryRepo;
  beforeEach(() => {
    repo = new InMemoryRepo();
  });

  it("sends Day 1 with the credited affiliate's link, then schedules Day 2 for 25 hours after sign-up", async () => {
    const admin = await repo.createProfile({ email: 'admin@kash.network', account_type: 'paid', role: 'admin' });
    await repo.updateProfile(admin.id, { role: 'admin', is_affiliate: true, affiliate_code: 'admin', password_hash: await hashPassword('x') });
    const aff = await repo.createProfile({ email: 'seller@gmail.com', account_type: 'paid' });
    await repo.updateProfile(aff.id, { is_affiliate: true, affiliate_code: 'AFF777' });
    const lead = await repo.createProfile({ email: 'buyer.lead@gmail.com', account_type: 'free' });
    await repo.createLeadState({ profileId: lead.id, sequence: 'free_nurture', emailAffiliateId: aff.id, nextSendAt: new Date(Date.now() - 1000).toISOString() });

    await runNurtureSequenceTick(repo, 10, true);
    const sent = (await repo.listEmailMessagesByProfile(lead.id)).find((m) => m.direction === 'outbound')!;
    expect(sent.subject).toBe('⚠️ Your spot is waiting (Finish reading my story)');
    const href = /href="([^"]+)"/.exec(sent.body_html!)![1]!;
    expect(href).toContain('/api/auth/lead?t=');
    expect(href).toContain('ref=AFF777');

    const state = (await repo.getLeadStateByProfile(lead.id))!;
    expect(state.sequence_step).toBe(1);
    const due = new Date(state.next_send_at!).getTime() - new Date(state.entered_at).getTime();
    expect(Math.round(due / 3_600_000)).toBe(25);
  });
});
