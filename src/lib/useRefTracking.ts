'use client';

import { useEffect, useState } from 'react';
import { api } from './api';

/**
 * Reads the affiliate `?ref=` and logs one click per mount.
 *
 * Takes an optional `initialRef` (passed from a Server Component that already
 * read `searchParams`) so funnel pages can still be server-rendered — using
 * `useSearchParams()` here would opt the whole page out of SSR.
 */
export function useRefTracking(
  linkKind: 'landing' | 'sales' | 'checkout',
  initialRef?: string,
) {
  const [ref, setRef] = useState<string | undefined>(initialRef);

  useEffect(() => {
    let r = initialRef;
    if (!r && typeof window !== 'undefined') {
      r = new URLSearchParams(window.location.search).get('ref') ?? undefined;
      if (r) setRef(r);
    }
    if (r) api.trackClick(r, linkKind, window.location.pathname).catch(() => undefined);
  }, [initialRef, linkKind]);

  return ref;
}
