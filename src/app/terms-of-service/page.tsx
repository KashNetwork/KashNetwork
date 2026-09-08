import { LegalPage } from '@/components/legal-page';
import { LEGAL_DOCS } from '@/content/legal';

export const metadata = { title: 'Terms of Service — Kash Network' };

export default function Page() {
  return <LegalPage doc={LEGAL_DOCS['terms-of-service']} />;
}
