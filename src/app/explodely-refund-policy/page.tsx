import { LegalPage } from '@/components/legal-page';
import { EXPLODELY_REFUND_DOC } from '@/content/legal-explodely';

export const metadata = { title: 'Return and Refund Policy — Kash Network' };

export default function Page() {
  return <LegalPage doc={EXPLODELY_REFUND_DOC} />;
}
