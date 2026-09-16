// Kickbox mailbox-level email verification — the layer on top of the free DNS
// check in email-verify.ts. DNS confirms the *domain* can receive mail (kills
// made-up domains); Kickbox actually probes the *mailbox* (kills made-up
// addresses at real providers like gmail.com). Only called for addresses that
// already pass the free DNS check, so a Kickbox credit is never spent on an
// obviously-fake domain.
//
// Docs: https://docs.kickbox.com/docs/single-verification-api
//
// Fails OPEN: if Kickbox errors, times out, or is unreachable, the email is
// allowed through rather than blocking real signups over a third-party outage
// — the DNS check has already run by this point, so that's still a real bar.

export type KickboxVerdict =
  | { valid: true }
  | { valid: false; reason: 'undeliverable' | 'disposable' | 'role' };

interface KickboxResponse {
  success: boolean;
  result?: 'deliverable' | 'undeliverable' | 'risky' | 'unknown';
  reason?: string;
  role?: boolean;
  disposable?: boolean;
}

export async function verifyEmailWithKickbox(
  email: string,
  apiKey: string,
): Promise<KickboxVerdict> {
  try {
    const url = new URL('https://api.kickbox.com/v2/verify');
    url.searchParams.set('email', email);
    url.searchParams.set('apikey', apiKey);

    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return { valid: true }; // fail open on API-level errors

    const data = (await res.json()) as KickboxResponse;
    if (!data.success) return { valid: true }; // Kickbox couldn't complete the check

    if (data.disposable) return { valid: false, reason: 'disposable' };
    if (data.role) return { valid: false, reason: 'role' };
    if (data.result === 'undeliverable') return { valid: false, reason: 'undeliverable' };

    // 'deliverable', 'risky' (e.g. catch-all domains), and 'unknown' all pass —
    // only a confirmed-bad mailbox is rejected, to avoid false positives on
    // legitimate but hard-to-verify addresses.
    return { valid: true };
  } catch {
    return { valid: true }; // network error / timeout — fail open
  }
}
