import type { LegalDoc } from './legal';

// Explodely's required payment-gateway disclaimer + billing support contact.
export const EXPLODELY_BILLING_SUPPORT = 'https://help.explodely.com/support/tickets/new';
export const EXPLODELY_DISCLAIMER =
  'Explodely.com is the trusted gateway for Kash Network (https://kash.network). Explodely is a trademark of Explodely LLC, a US corporation located at 1317 Edgewater Drive Suite #4648, Orlando FL, 32804, United States and used by permission. Explodely’s role as a gateway provider does not constitute an endorsement, approval or review of this product(s) or any claim, statement or opinion used in promotion of this product(s). If you aren’t completely satisfied with your purchase, or need order support, please contact Explodely here:';

export const DISCLAIMER_DOC: LegalDoc = {
  title: 'Disclaimer',
  effective: 'Effective October 6, 2026',
  lede: 'General disclaimers that apply to Kash Network and to purchases processed through our payment gateway.',
  blocks: [
    { t: 'h2', x: '1. Payment gateway' },
    { t: 'p', x: EXPLODELY_DISCLAIMER },
    { t: 'p', x: `Billing support: ${EXPLODELY_BILLING_SUPPORT}` },
    { t: 'h2', x: '2. No guarantee of results' },
    {
      t: 'p',
      x: 'Kash Network provides tools, training and an affiliate program. We do not guarantee that you will earn any money, any particular amount of money, or any commissions at all. Results depend on your effort, your market, the response of the people you reach and many other factors outside our control. Please read our Earnings Disclaimer for details.',
    },
    { t: 'h2', x: '3. Not professional advice' },
    {
      t: 'p',
      x: 'Nothing on this website is legal, financial, tax, accounting or medical advice. You should speak with a qualified professional before making decisions that affect your finances or your business.',
    },
    { t: 'h2', x: '4. Third-party services' },
    {
      t: 'p',
      x: 'Payments are processed by a third-party payment gateway and some features rely on other third-party services. We are not responsible for the availability, content or policies of third-party services, and your use of them is at your own risk.',
    },
    { t: 'h2', x: '5. Contact' },
    { t: 'p', x: 'Questions about this Disclaimer can be sent to support@kash.network.' },
  ],
};
