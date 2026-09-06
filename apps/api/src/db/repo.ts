import type {
  AdminUserListParams,
  AdminUserListRow,
  ClickRow,
  EmailChangeRow,
  NewProfile,
  NotificationRow,
  ProfileRow,
  SessionKind,
  SessionRow,
  SupportTicketRow,
} from './types.js';

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

  // --- notifications ---
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
  }>;
  adminListUsers(
    params: AdminUserListParams,
  ): Promise<{ rows: AdminUserListRow[]; total: number }>;
}
