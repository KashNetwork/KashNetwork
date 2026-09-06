'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from './api';

/** Reads ?ref= on a funnel page and logs the affiliate click once per mount. */
export function useRefTracking(linkKind: 'landing' | 'sales' | 'checkout') {
  const params = useSearchParams();
  const ref = params.get('ref');
  useEffect(() => {
    if (!ref) return;
    api.trackClick(ref, linkKind, window.location.pathname).catch(() => undefined);
  }, [ref, linkKind]);
  return ref ?? undefined;
}
