import { Suspense } from 'react';
import SalesPage from '@/screens/SalesPage';

export const metadata = { title: '$37 Per Hour Sending Emails — Kash Network' };

export default function Page() {
  return (
    <Suspense>
      <SalesPage />
    </Suspense>
  );
}
