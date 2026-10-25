import type { ClickLinkKind, CommissionKind, EmailDirection, PayoutMethod, PayoutStatus } from '@/shared';
import type {
  AdminPayoutListRow,
  AdminUserListParams,
  AdminUserListRow,
  AffiliateStats,
  ClickRow,
  CommissionRow,
  DueLeadRow,
  EmailChangeRow,
  AiThreadRow,
  EmailMessageRow,
  FraudFlagInput,
  LeadStateRow,
  NewProfile,
  NotificationRow,
  LiveEventRow,
  PaymentEventRow,
  PayoutRow,
  ProfileRow,
  ReferralRow,
  SessionKind,
  SessionRow,
  SubscriptionRow,
  SupportTicketRow,
} from './types';

/**
 * Narrow persistence port. Two implementations: SupabaseRepo (production) and
 * InMemoryRepo (local dev + tests). Only what Milestone 1 needs — extended per
 * milestone.
 */
export interface Repo {
  // --- profiles ---
  getProfileById(id: string): Promise<ProfileRow | null>;
  getProfileByEmail(email: string): Promise<ProfileRow | null>;
  getProfileByAffiliateCode(code: string): Promise<ProfileRow | null>;
  createProfile(input: NewProfile): Promise<ProfileRow>;
  updateProfile(id: string, patch: Partial<ProfileRow>): Promise<ProfileRow>;

  // --- sessions ---
  createSession(input: {
    profileId: string;
    tokenHash: string;
    kind: SessionKind;
    ip?: string | null;
    userAgent?: string | null;
    expiresAt: string;
  }): Promise<SessionRow>;
  getSessionByTokenHash(tokenHash: string): Promise<SessionRow | null>;
  touchSession(id: string, lastSeenAt: string): Promise<void>;
  revokeSession(id: string): Promise<void>;
  revokeAllSessionsForProfile(profileId: string): Promise<void>;

  // --- email change ---
  createEmailChange(input: {
    profileId: string;
    newEmail: string;
    tokenHash: string;
    expiresAt: string;
  }): Promise<EmailChangeRow>;
  getEmailChangeByTokenHash(tokenHash: string): Promise<EmailChangeRow | null>;
  markEmailChangeConfirmed(id: string): Promise<void>;

  // --- clicks ---
  createClick(input: Omit<ClickRow, 'id' | 'created_at'>): Promise<ClickRow>;

  // --- support ---
  createSupportTicket(input: {
    profileId: string | null;
    fromEmail: string;
    subject: string | null;
    message: string;
  }): Promise<SupportTicketRow>;
  listSupportTickets(params: {
    page: number;
    pageSize: number;
  }): Promise<{ rows: SupportTicketRow[]; total: number }>;

  // --- notifications ---
  listLiveEvents(limit: number): Promise<LiveEventRow[]>;
  listNotifications(location: 'landing' | 'sales'): Promise<NotificationRow[]>;

  createAudit(input: {
    adminId: string;
    action: string;
    targetType: string;
    targetId: string;
    before?: unknown;
    after?: unknown;
  }): Promise<void>;

  // --- admin ---
  adminOverview(): Promise<{
    activePaid: number;
    freeLeads: number;
    cancelled: number;
    totalProfiles: number;
    adminRevenueCents: number;
    payableCents: number;
    recentActivity: { kind: 'payment' | 'signup'; email: string | null; detail: string; at: string }[];
  }>;
  adminListUsers(
    params: AdminUserListParams,
  ): Promise<{ rows: AdminUserListRow[]; total: number }>;

  /* --------------------------------------------------------- M2: payments */

  // payment events (append-only, idempotent)
  getPaymentEventByDedupeKey(key: string): Promise<PaymentEventRow | null>;
  getPaymentEventsByTxn(externalTxnId: string): Promise<PaymentEventRow[]>;
  recordPaymentEvent(input: {
    provider: string;
    eventType: PaymentEventRow['event_type'];
    externalTxnId: string | null;
    externalSubId: string | null;
    customerEmail: string | null;
    amountCents: number;
    currency: string;
    affiliateRef: string | null;
    occurredAt: string;
    raw: unknown;
    signatureValid: boolean;
    dedupeKey: string;
  }): Promise<PaymentEventRow>;
  markPaymentEventProcessed(id: string, error?: string | null): Promise<void>;
  listUnprocessedPaymentEvents(limit: number): Promise<PaymentEventRow[]>;

  // subscriptions
  getSubscriptionByExternalId(externalSubId: string): Promise<SubscriptionRow | null>;
  getSubscriptionByProfile(profileId: string): Promise<SubscriptionRow | null>;
  createSubscription(input: Partial<SubscriptionRow> & { profile_id: string }): Promise<SubscriptionRow>;
  updateSubscription(id: string, patch: Partial<SubscriptionRow>): Promise<SubscriptionRow>;
  listSubscriptionsDueToExpire(nowIso: string): Promise<SubscriptionRow[]>;

  // referrals + links
  getReferralByReferredProfile(referredProfileId: string): Promise<ReferralRow | null>;
  createReferral(input: {
    affiliateId: string;
    referredProfileId: string;
    status?: ReferralRow['status'];
    firstClickAt?: string | null;
    lastClickAt?: string | null;
    attributionSource: string;
    attributionLocked?: boolean;
  }): Promise<ReferralRow>;
  updateReferral(id: string, patch: Partial<ReferralRow>): Promise<ReferralRow>;
  listReferralsByAffiliate(affiliateId: string, limit?: number): Promise<ReferralRow[]>;
  reassignReferralsToAdmin(fromAffiliateId: string, adminId: string): Promise<number>;
  ensureReferralLinks(affiliateId: string, kinds: ClickLinkKind[]): Promise<void>;
  setReferralLinksActive(affiliateId: string, active: boolean): Promise<void>;

  // commissions
  getCommissionForReferralEvent(
    referralId: string,
    paymentEventId: string,
  ): Promise<CommissionRow | null>;
  createCommission(input: {
    affiliateId: string;
    referralId: string;
    subscriptionId: string | null;
    paymentEventId: string | null;
    amountCents: number;
    kind: CommissionKind;
    holdUntil: string;
  }): Promise<CommissionRow>;
  updateCommission(id: string, patch: Partial<CommissionRow>): Promise<CommissionRow>;
  reverseCommissionsForPaymentEvent(paymentEventId: string, reason: string): Promise<number>;
  forfeitUnpaidCommissions(affiliateId: string, reason: string): Promise<number>;
  promoteEligibleCommissions(nowIso: string): Promise<number>;
  listCommissionsByAffiliate(affiliateId: string, limit?: number): Promise<CommissionRow[]>;

  // fraud
  createFraudFlag(input: FraudFlagInput): Promise<void>;

  // attribution
  lastAttributableClick(input: {
    visitorId?: string | null;
    email?: string | null;
    windowDays: number;
  }): Promise<ClickRow | null>;

  // dashboard aggregates
  affiliateStats(affiliateId: string): Promise<AffiliateStats>;
  paymentsForEmail(email: string): Promise<PaymentEventRow[]>;

  /* ----------------------------------------------------------- M3: payouts */

  // Atomically claims every currently-'available' commission for this
  // affiliate into one new payout ('requested', amount = their sum), and
  // flips each claimed commission to 'requested' with payout_id set — one
  // request cashes out the whole available balance, not an itemized pick.
  // Returns null if there was nothing available to claim (race with another
  // request, or balance dropped between the caller's own check and this call).
  createPayoutRequest(input: {
    affiliateId: string;
    method: PayoutMethod;
    methodDetails: unknown;
  }): Promise<PayoutRow | null>;
  getPayoutById(id: string): Promise<PayoutRow | null>;
  listPayoutsByAffiliate(affiliateId: string, limit?: number): Promise<PayoutRow[]>;
  listPayoutsByStatus(
    status: PayoutStatus | 'all',
    params: { page: number; pageSize: number },
  ): Promise<{ rows: AdminPayoutListRow[]; total: number }>;
  // One-click "Approve & Mark Paid": payout -> paid, every linked commission -> paid.
  approveAndPayPayout(id: string, actedBy: string): Promise<PayoutRow>;
  // payout -> rejected, every linked commission reverts to 'available' (not forfeited).
  rejectPayout(id: string, actedBy: string, reason: string): Promise<PayoutRow>;

  /* ------------------------------------------------------ M3: email nurture */

  createLeadState(input: {
    profileId: string;
    sequence: string;
    emailAffiliateId: string | null;
    nextSendAt: string;
  }): Promise<LeadStateRow>;
  getLeadStateByProfile(profileId: string): Promise<LeadStateRow | null>;
  updateLeadState(profileId: string, patch: Partial<LeadStateRow>): Promise<LeadStateRow>;
  // due = sequence_status = 'active' and next_send_at <= now, joined with email/name to send.
  listLeadsDueForSend(nowIso: string, limit: number): Promise<DueLeadRow[]>;

  createEmailMessage(input: {
    profileId: string | null;
    direction: EmailDirection;
    fromAddr: string;
    toAddr: string;
    subject: string | null;
    bodyText: string | null;
    bodyHtml: string | null;
    sequenceStep?: number | null;
    providerMessageId?: string | null;
    inReplyTo?: string | null;
    aiGenerated?: boolean;
  }): Promise<EmailMessageRow>;
  listEmailMessagesByProfile(profileId: string, limit?: number): Promise<EmailMessageRow[]>;

  /* ------------------------------------------------------ settings */

  getSetting<T = unknown>(key: string): Promise<T | null>;
  setSetting(key: string, value: unknown): Promise<void>;

  /* ------------------------------------------------------ M3: AI agent */

  getAiThread(profileId: string): Promise<AiThreadRow | null>;
  // creates the thread on first reply; bumps message_count + last_message_at each call
  recordAiReply(profileId: string): Promise<AiThreadRow>;
  setAiThreadActive(profileId: string, active: boolean): Promise<void>;
  // support ticket created from an inbound email (profile may be unknown)
  countAiRepliesSince(sinceIso: string): Promise<number>;
}
