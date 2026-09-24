// The 30-day free-lead nurture sequence — sent to anyone who enters their
// email on the video gate but doesn't buy the $1 trial. Stops immediately
// the moment they convert (see markLeadConverted in payments.ts).
//
// DRAFT COPY — client-editable. Matches the voice/claims already live on the
// Sales Page (src/content/sales-page.ts) so nothing here contradicts it, but
// the client should review/replace this before it goes out for real.
//
// {{affiliate_link}} is replaced with the Sales Page link carrying whichever
// affiliate gets credit for this lead (or the admin's own link if none).

export interface SequenceStep {
  /** Days after the lead entered their email that this step should send. */
  day: number;
  subject: string;
  /** Plain text body. {{affiliate_link}} gets substituted before sending. */
  text: string;
}

export const FREE_NURTURE_SEQUENCE: SequenceStep[] = [
  {
    day: 0,
    subject: 'Did you see what happened next?',
    text: `Hey,

You started watching the video but didn't stick around for the ending — so here's the short version.

The system lets you earn $30 an hour sending emails, no experience needed. Everything is already built for you: the website, the affiliate link, the commission tracking. You just plug in.

Go watch the rest and see the offer for yourself:
{{affiliate_link}}

— Harley`,
  },
  {
    day: 1,
    subject: "You're 60 seconds away from this",
    text: `Hey,

Setting this up takes about 60 seconds. No experience, no tech skills, nothing to build.

Once you're in, you get your own unique link, a dashboard that tracks every click and commission, and an A.I. assistant that handles the email conversations for you — 24/7.

Here's the link again:
{{affiliate_link}}

— Harley`,
  },
  {
    day: 3,
    subject: "My inbox lights up like this every day",
    text: `Hey,

I've earned commissions online since 2011, and my inbox still lights up with notifications from this exact system.

It's not complicated — you get a link, you share it (or don't, traffic options are built in), and the system handles the rest.

Take another look:
{{affiliate_link}}

— Harley`,
  },
  {
    day: 5,
    subject: 'What could you do with an extra $30/hour?',
    text: `Hey,

Rent. Groceries. A cushion in the bank. Whatever it is for you — an extra $30/hour adds up fast, especially when it's mostly automated.

If you haven't activated your $1 trial yet, here's the link:
{{affiliate_link}}

— Harley`,
  },
  {
    day: 7,
    subject: 'Still thinking it over?',
    text: `Hey,

Totally fair if you're still on the fence. Here's the deal in plain terms:

- $1 gets you a 7-day trial
- If you don't earn your first 7 commissions in 7 days, you don't pay
- Cancel anytime, no questions asked

Not much to lose. Here's the link:
{{affiliate_link}}

— Harley`,
  },
  {
    day: 10,
    subject: "Earn your first 7 commissions in 7 days — or don't pay",
    text: `Hey,

I mentioned this before but it's worth repeating: if you don't earn your first 7 commissions within 7 days of starting, you don't pay. That's how confident I am this works.

Activate your trial here:
{{affiliate_link}}

— Harley`,
  },
  {
    day: 14,
    subject: 'Zero experience? Perfect.',
    text: `Hey,

This wasn't built for marketers. It was built for people with zero experience who just want something that already works.

60 seconds to get set up. Everything else is done for you.
{{affiliate_link}}

— Harley`,
  },
  {
    day: 21,
    subject: "This won't stay open forever",
    text: `Hey,

Just a heads up — I'm not going to keep this offer exactly as-is indefinitely. If you've been meaning to check it out, now's a good time.

{{affiliate_link}}

— Harley`,
  },
  {
    day: 30,
    subject: "Last call — here's your link",
    text: `Hey,

This is the last email in this sequence, so I'll keep it simple: if you want in, here's your link.

{{affiliate_link}}

If not, no hard feelings — thanks for giving it a look.

— Harley`,
  },
];
