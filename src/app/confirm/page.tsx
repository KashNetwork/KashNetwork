import { Suspense } from 'react';
import Confirm from '@/screens/Confirm';

export const metadata = {
  title: 'Almost Done! Confirm You’re In — Kash Network',
  description: 'One click to confirm your spot and start generating your first paycheck online.',
};

export default async function Page({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  return (
    <Suspense>
      <Confirm initialRef={ref} />
    </Suspense>
  );
}
