// EmailProvider port (Resend). Sending domains are subdomains of kash.network:
//   harley@go.kash.network   — outbound nurture sequence
//   support@app.kash.network — support + AI replies
// The concrete addresses live in config (EMAIL_FROM_HARLEY / EMAIL_FROM_SUPPORT).

export type FromAddress = string;

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
