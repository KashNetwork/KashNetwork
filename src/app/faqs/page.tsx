import Link from 'next/link';
import { SiteNav, SiteFooter, ink, bodyText, softText, brandBlue } from '@/components/site-chrome';

export const metadata = {
  title: "FAQs — Kash Network",
  description:
    'Everything you need to know about the Kash Network system, subscription, and getting started.',
};

const FAQS: { q: string; a: string[] }[] = [
  {
    q: 'What is Kash Network?',
    a: ['Kash Network combines a ‘simple’ email marketing system with an affiliate referral program — all in one.'],
  },
  {
    q: 'How does it work?',
    a: [
      '✅ **Step 1:** Get Your Unique Affiliate Link (DONE-FOR-YOU Website) — Earn $30 monthly residual commissions when people join through your link.',
      '✅ **Step 2:** Your Affiliate Link Gets Shared — Our trusted email advertising sources will write the email ad for you and send it to THOUSANDS of people who are interested in earning extra income from home. It only takes 60 seconds to get fully setup and ready to earn commissions.',
      '✅ **Step 3:** Our A.I. assistant replies to emails from interested people on your behalf to turn conversations into commissions — 24 hours a day, 7 days a week… it never sleeps!',
      '**The result?**',
      'The FASTEST way to earn commissions online without needing any special skills.',
      '**100% BEGINNER-FRIENDLY!**',
      '_This isn’t “hype”… It’s a proven process — now running on A.I. so it never stops, never sleeps, and works for you 24/7._',
    ],
  },
  {
    q: 'Is this really beginner-friendly?',
    a: [
      'YES. We provide the done-for-you website, help get your affiliate link in front of interested people, and let our A.I. assistant handle the follow-up email conversations for you — 24/7. No prior experience required from you. The A.I. assistant’s purpose is built for natural “back-and-forth” conversations, building trust, addressing objections, communicating value, and guiding the person toward a “yes” — trained on proven scripts. The A.I. assistant is specifically trained to help affiliates earn commissions online.',
    ],
  },
  {
    q: 'What is an Affiliate?',
    a: [
      'An affiliate is an individual who earns a commission on each sale through their unique affiliate link for another company’s product or service.',
    ],
  },
  {
    q: 'What is an Affiliate Referral Program?',
    a: ['A program where affiliates earn commissions by referring people to a company’s product or service.'],
  },
  {
    q: 'How much money can I make with this system?',
    a: [
      'From a legal standpoint, no business in any industry can make any “guarantees” about income. Disclaimer: the results shown are not typical or guaranteed. Individual results vary.',
    ],
  },
  {
    q: 'Can I get a refund?',
    a: [
      'Your $1 trial payment provides immediate access to our platform and is non-refundable. If you choose to continue after the 7-day trial period, your subscription will renew automatically at the regular subscription price. All subscription payments are non-refundable once processed. You may cancel your subscription at any time before the end of your 7-day trial to avoid being charged the full subscription price.',
    ],
  },
  {
    q: 'Can I do this part-time and still keep my full-time job?',
    a: [
      'YES. It only takes 60 seconds of your time each day — so you can build this income stream while keeping your day job.',
    ],
  },
  {
    q: 'What if I’m too new to this?',
    a: [
      'That’s actually the point of this system. Kash Network was designed with beginners in mind. We’ll help you get set up with your done-for-you affiliate website, show you how everything works step by step, and our A.I. assistant handles the follow-up conversations with interested people for you. You don’t need any special skills or previous experience to get started.',
    ],
  },
  {
    q: 'What if I don’t have time?',
    a: [
      'The whole reason this system exists is to compress the time required from members down to almost nothing. Getting set up only takes 60 seconds, and once you’re up and running, there’s very little to manage. Our A.I. assistant handles the follow-up conversations with interested people on your behalf and it doesn’t take days off — so you can build this alongside your full-time job or busy schedule. Just log into your dashboard anytime to check your activity and commissions.',
    ],
  },
  {
    q: 'What if I’m not ‘salesy’?',
    a: [
      'You don’t need to be. You’re never on a sales call. The A.I. takes care of the email conversations. The system is built so you don’t need to pitch, persuade, or close.',
    ],
  },
  {
    q: 'What if I’m not ‘technical’ or good with computers?',
    a: [
      'Not a problem. We’ll help you get everything set up and show you exactly what to do. You don’t need any technical experience or special skills to get started.',
    ],
  },
  {
    q: 'What if I’ve tried other ‘done-for-you’ programs and got burned?',
    a: [
      'I understand. A lot of so-called “done-for-you” programs still leave you to figure everything out on your own. Kash Network is different. You get a done-for-you affiliate website, trusted email advertising sources, an A.I. assistant that follows up with interested people for you, and support when you need it. You’re not left to do everything by yourself.',
    ],
  },
  {
    q: 'Wait — What if it doesn’t work for me?',
    a: [
      'That’s exactly why we offer a 7-day trial. You can explore the system, see how it works, and decide if it’s the right fit for you. If it’s not, simply cancel before your trial ends on Day 7 and you won’t be charged the full subscription price.',
    ],
  },
  {
    q: 'How do I get started?',
    a: [
      'Click the “Activate Commissions for $1” button and process the checkout.',
      'Grab your affiliate link.',
      'Give your affiliate link to the trusted email advertising sources we provide — they write the email ad and send it for you.',
      'Our A.I. assistant takes over — handling the follow-up email conversations for you, 24/7',
      'Just log into your affiliate dashboard whenever you want to see activity and any commissions you’ve earned.',
      'That’s it!',
    ],
  },
];

export default function Page() {
  return (
    <div style={{ background: '#FFFFFF', color: ink }} className="min-h-screen font-sans">
      <SiteNav />

      <div className="mx-auto max-w-[1440px]">
        <header style={{ background: '#F7FBFF', borderBottom: '1px solid #E1E8F2' }}>
          <div className="mx-auto flex max-w-[810px] flex-col gap-4 px-5 py-12 sm:pt-[68px] sm:pb-[54px]">
            <Link
              href="/"
              className="w-fit text-[13px] font-bold tracking-[0.12em] transition-opacity hover:opacity-70"
              style={{ color: brandBlue, lineHeight: '1' }}
            >
              ← BACK TO KASH NETWORK
            </Link>
            <h1
              className="font-display text-[28px] font-extrabold sm:text-[40px] lg:w-[847px] lg:whitespace-nowrap lg:text-[52px]"
              style={{ color: ink, letterSpacing: '-0.04em', lineHeight: '1' }}
            >
              Frequently Asked Questions (FAQ&apos;s)
            </h1>
            <p className="text-[15px]" style={{ color: softText, lineHeight: '1.4' }}>
              Answers about Kash Network
            </p>
            <p className="text-[18px]" style={{ color: bodyText, lineHeight: '1.45' }}>
              Everything you need to know about the system, subscription, and getting started.
            </p>
          </div>
        </header>
      </div>

      <main className="mx-auto max-w-[810px] px-5 pb-[88px] pt-16">
        {FAQS.map((f, i) => (
          <section key={i} className="mt-6 first:mt-0">
            <h2
              className="font-display text-[24px]"
              style={{ color: ink, letterSpacing: '-0.02em', lineHeight: '1.25', fontWeight: 900 }}
            >
              &ldquo;{f.q}&rdquo;
            </h2>
            {f.a.map((p, j) => {
              const italic = p.startsWith('_') && p.endsWith('_');
              const text = italic ? p.slice(1, -1) : p;
              return (
                <p
                  key={j}
                  className="mt-6 text-[16px]"
                  style={{
                    color: bodyText,
                    lineHeight: '1.6',
                    letterSpacing: '-0.02em',
                    fontWeight: 400,
                    fontStyle: italic ? 'italic' : undefined,
                  }}
                >
                  {text.split(/(\*\*[^*]+\*\*)/g).map((seg, k) =>
                    seg.startsWith('**') && seg.endsWith('**') ? (
                      <strong key={k} style={{ fontWeight: 700, color: ink }}>
                        {seg.slice(2, -2)}
                      </strong>
                    ) : (
                      seg
                    ),
                  )}
                </p>
              );
            })}
          </section>
        ))}
      </main>

      <SiteFooter />
    </div>
  );
}
