import { Suspense } from 'react';
import { Login } from '@/screens/Login';

export const metadata = { title: 'Log in — Kash Network' };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
}
