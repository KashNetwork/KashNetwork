import { Suspense } from 'react';
import Checkout from '@/screens/Checkout';

export const metadata = { title: 'Secure Checkout — Kash Network' };

export default function Page() {
  return (
    <Suspense>
      <Checkout />
    </Suspense>
  );
}
