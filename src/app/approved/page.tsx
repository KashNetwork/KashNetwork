import { Suspense } from 'react';
import Approved from '@/screens/Approved';

export const metadata = {
  title: 'Your Account Has Been Approved — Kash Network',
  robots: { index: false },
};

export default function Page() {
  return (
    <Suspense>
      <Approved />
    </Suspense>
  );
}
