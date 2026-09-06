import { currentSession, type AuthedSession } from './session';
import { forbidden, unauthorized } from '@/server/http';

export async function getAuth(): Promise<AuthedSession | null> {
  return currentSession();
}

export async function requireAuth(): Promise<AuthedSession> {
  const a = await currentSession();
  if (!a) throw unauthorized();
  return a;
}

export async function requirePaid(): Promise<AuthedSession> {
  const a = await requireAuth();
  if (a.profile.account_type !== 'paid' && a.profile.role !== 'admin') {
    throw forbidden('paid_account_required');
  }
  return a;
}

export async function requireAdmin(): Promise<AuthedSession> {
  const a = await requireAuth();
  if (a.profile.role !== 'admin') throw forbidden('admin_required');
  return a;
}
