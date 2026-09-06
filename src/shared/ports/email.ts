// EmailProvider port (Resend + Google SMTP + email verification).

export type FromAddress = 'harley@kash.network' | 'support@kash.network';

export interface SendEmailInput {
  from: FromAddress;
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  tags?: Record<string, string>;
}

export type EmailInvalidReason =
  | 'syntax'
  | 'disposable'
  | 'no_mx'
  | 'undeliverable'
  | 'role';

export interface EmailProvider {
  send(msg: SendEmailInput): Promise<{ providerMessageId: string }>;
  verifyEmail(email: string): Promise<{ valid: boolean; reason?: EmailInvalidReason }>;
}
