import { Suspense } from 'react';
import Landing from '@/screens/Landing';

export const metadata = {
  title: 'Need Emergency Cash? $37 Per Hour Sending Emails — Kash Network',
};

export default function Page() {
  return (
    <Suspense>
      <Landing />
    </Suspense>
  );
}
