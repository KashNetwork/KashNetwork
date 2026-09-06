// Normalised inbound email (from whichever provider handles reply parsing).

export interface InboundEmail {
  from: string;
  to: string; // harley@ or support@
  subject: string;
  text: string;
  html: string | null;
  inReplyToProviderId: string | null;
  receivedAt: string; // ISO
}
