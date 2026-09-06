// Adapter registry — picks real vs fake based on config.
// Real implementations are added in Milestone 2/3; for now everything is fake
// unless noted.

import type { AiProvider, EmailProvider, PaymentProvider } from '@kash/shared';
import { config } from '../config.js';
import { fakeAiProvider, fakeEmailProvider, fakePaymentProvider } from './fakes.js';

export function getPaymentProvider(): PaymentProvider {
  // TODO(M2): return new ExplodelyProvider(config.explodely) when enabled
  return fakePaymentProvider;
}

export function getEmailProvider(): EmailProvider {
  // TODO(M3): return new ResendProvider(config.resend) when enabled
  return fakeEmailProvider;
}

export function getAiProvider(): AiProvider {
  // TODO(M3): return new OpenAiProvider(...) / GoogleAiProvider(...) when enabled
  return fakeAiProvider;
}

export { config };
