import { Banner, Card } from '../components/ui';
import { useRefTracking } from '../lib/useRefTracking';

/**
 * /secure-checkout — Explodely checkout embed goes here in Milestone 2.
 * After a successful $1 charge, Explodely's IPN flips the account to paid and
 * the user is redirected to /app (Buy Traffic tab).
 */
export function Checkout() {
  const ref = useRefTracking('checkout');
  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Card title="Secure checkout">
        <Banner tone="warn">
          Milestone 2: the Explodely checkout iframe / hosted link is wired in here.
          {ref ? ` Affiliate ref: ${ref}` : ''}
        </Banner>
        <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
          <li>• $1 today for a 7-day trial</li>
          <li>• then $47/month — cancel anytime</li>
        </ul>
      </Card>
    </div>
  );
}
