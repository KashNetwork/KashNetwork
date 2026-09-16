// Shared "is this email real" check — used by both the fake and the Resend
// email providers, so verification is the same whether or not RESEND_API_KEY
// is set. Layer 1 (always runs, free): syntax, a disposable/throwaway domain
// list, role-account local-parts, then a real DNS lookup (MX, falling back to
// A/AAAA per RFC 5321 §5.1) confirming the domain can actually receive mail —
// reliably rejects made-up domains like "gkdtyail.com". Layer 2 (only when
// EMAIL_VERIFY_PROVIDER=kickbox + EMAIL_VERIFY_API_KEY are set, and only for
// addresses that already passed layer 1): a real Kickbox mailbox probe, which
// catches made-up addresses at real providers (e.g. gmail.com) that layer 1
// can't — nothing can check that without either this kind of paid service or
// an actual confirm-your-email step.

import { resolve4, resolve6, resolveMx } from 'node:dns/promises';
import { config } from '../config';
import { verifyEmailWithKickbox } from './kickbox';

const DISPOSABLE = new Set([
  'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'trashmail.com',
  'yopmail.com', 'temp-mail.org', 'sharklasers.com', 'getnada.com', 'dispostable.com',
  'maildrop.cc', 'fakeinbox.com', 'tempmail.com', 'throwawaymail.com', 'mailnesia.com',
  'guerrillamailblock.com', 'spam4.me', 'trbvm.com', 'byom.de',
]);

const ROLE_LOCALPARTS = new Set([
  'admin', 'administrator', 'postmaster', 'hostmaster', 'webmaster', 'abuse',
  'noreply', 'no-reply', 'donotreply',
]);

export type EmailVerdict =
  | { valid: true }
  | { valid: false; reason: 'syntax' | 'disposable' | 'role' | 'no_mx' | 'undeliverable' };

const domainCache = new Map<string, boolean>();

async function domainCanReceiveMail(domain: string): Promise<boolean> {
  const cached = domainCache.get(domain);
  if (cached !== undefined) return cached;

  let ok = false;
  try {
    const mx = await resolveMx(domain);
    ok = mx.length > 0;
  } catch {
    ok = false;
  }
  if (!ok) {
    // RFC 5321 §5.1: no MX record → fall back to the domain's own A/AAAA.
    try {
      const a = await resolve4(domain);
      ok = a.length > 0;
    } catch {
      /* keep trying */
    }
  }
  if (!ok) {
    try {
      const aaaa = await resolve6(domain);
      ok = aaaa.length > 0;
    } catch {
      /* no record either way */
    }
  }

  domainCache.set(domain, ok);
  return ok;
}

export async function verifyEmailByDns(email: string): Promise<EmailVerdict> {
  const trimmed = email.trim().toLowerCase();
  const m = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/.exec(trimmed);
  if (!m) return { valid: false, reason: 'syntax' };

  const domain = m[1]!;
  const localPart = trimmed.slice(0, trimmed.indexOf('@'));

  if (DISPOSABLE.has(domain)) return { valid: false, reason: 'disposable' };
  if (ROLE_LOCALPARTS.has(localPart)) return { valid: false, reason: 'role' };
  if (!(await domainCanReceiveMail(domain))) return { valid: false, reason: 'no_mx' };

  return { valid: true };
}

/**
 * Full check: DNS layer, then — only if the address survives that and Kickbox
 * is configured — a real mailbox-level probe. This is what both email
 * providers should call; verifyEmailByDns() stays exported on its own for the
 * tests that exercise the DNS layer in isolation.
 */
export async function verifyEmail(email: string): Promise<EmailVerdict> {
  const dnsVerdict = await verifyEmailByDns(email);
  if (!dnsVerdict.valid) return dnsVerdict;

  if (config.emailVerify.provider === 'kickbox' && config.emailVerify.apiKey) {
    const kickboxVerdict = await verifyEmailWithKickbox(email, config.emailVerify.apiKey);
    if (!kickboxVerdict.valid) return kickboxVerdict;
  }

  return { valid: true };
}
