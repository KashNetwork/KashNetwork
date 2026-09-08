import { LegalPage } from '@/components/legal-page';
import { LEGAL_DOCS } from '@/content/legal';

export const metadata = { title: 'Affiliate Agreement — Kash Network' };

export default function Page() {
  return <LegalPage doc={LEGAL_DOCS['affiliate-agreement']} />;
}
