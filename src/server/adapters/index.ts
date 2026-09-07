// Adapter registry — picks real vs fake based on config.
// Real implementations are added in Milestone 2/3; for now everything is fake
// unless noted.

import type { AiProvider, EmailProvider, PaymentProvider } from '@/shared';
import { config } from '../config';
import { fakeAiProvider, fakeEmailProvider, fakePaymentProvider } from './fakes';
import { ResendEmailProvider } from './resend';

let emailProvider: EmailProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  // TODO(M2): return new ExplodelyProvider(config.explodely) when enabled
  return fakePaymentProvider;
}

export function getEmailProvider(): EmailProvider {
  if (emailProvider) return emailProvider;
  emailProvider = config.resend.enabled ? new ResendEmailProvider() : fakeEmailProvider;
  return emailProvider;
}

export function getAiProvider(): AiProvider {
  // TODO(M3): return new OpenAiProvider(...) / GoogleAiProvider(...) when enabled
  return fakeAiProvider;
}

export { config };
