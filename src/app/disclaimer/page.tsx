import { LegalPage } from '@/components/legal-page';
import { DISCLAIMER_DOC } from '@/content/legal-extra';

export const metadata = { title: 'Disclaimer — Kash Network' };

export default function Page() {
  return <LegalPage doc={DISCLAIMER_DOC} />;
}
