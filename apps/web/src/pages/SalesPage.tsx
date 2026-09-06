import { LiveNotifications } from '../components/LiveNotifications';
import { Button, Card } from '../components/ui';
import { useRefTracking } from '../lib/useRefTracking';

/**
 * /activate — the sales page. Shown to logged-out visitors and embedded inside
 * a FREE user's "Harley's Story" tab (with that user's own affiliate ref).
 */
export function SalesPage({ embedded = false }: { embedded?: boolean }) {
  const ref = useRefTracking('sales');
  return (
    <div className={embedded ? '' : 'mx-auto max-w-3xl px-4 py-10'}>
      <Card className="text-center">
        <h1 className="text-2xl font-extrabold text-ink">Harley's Story</h1>
        {/* TODO(client): real sales copy / embedded video */}
        <p className="mx-auto mt-3 max-w-prose text-sm text-slate-600">
          Placeholder sales copy. This is where Harley's full story and the pitch for the
          $1 trial live. Replace with the client-supplied content.
        </p>
        <a href={`/secure-checkout${ref ? `?ref=${ref}` : ''}`}>
          <Button className="mt-5">Start the $1 trial →</Button>
        </a>
      </Card>
      {!embedded && <LiveNotifications location="sales" />}
    </div>
  );
}
