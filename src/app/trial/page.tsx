import Landing from '@/screens/Landing';

export const metadata = {
  title: 'Need Emergency Cash? $37 Per Hour Sending Emails — Kash Network',
  description:
    'Watch the 4-minute demo and start your 7-day trial for $1. Done-for-you affiliate system, partner email traffic, and a 24/7 AI assistant.',
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  return <Landing initialRef={ref} />;
}
