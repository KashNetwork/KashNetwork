import { LegalPage } from '@/components/legal-page';
import { FTC_DOC } from '@/content/legal-explodely';

export const metadata = { title: 'FTC Compliance — Kash Network' };

export default function Page() {
  return <LegalPage doc={FTC_DOC} />;
}
