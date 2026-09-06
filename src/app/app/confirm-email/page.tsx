import { Suspense } from 'react';
import { ConfirmEmail } from '@/screens/ConfirmEmail';

export default function Page() {
  return (
    <Suspense>
      <ConfirmEmail />
    </Suspense>
  );
}
