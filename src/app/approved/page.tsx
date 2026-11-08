import { Suspense } from 'react';
import Approved from '@/screens/Approved';

export const metadata = {
  title: 'Your Account Has Been Approved — Kash Network',
  robots: { index: false },
  // open to anyone with the link
};

export default function Page() {
  return (
    <Suspense>
      <Approved />
    </Suspense>
  );
}
