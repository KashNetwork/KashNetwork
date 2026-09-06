import { hashPassword } from '../auth/passwords';
import { config } from '../config';
import type { Repo } from './repo';

/**
 * Idempotent startup seed. If SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD are set and
 * that profile is not already an admin, create/promote it. Runs in-process so it
 * works with PGlite (which is single-connection — the standalone create-admin
 * script can't run while the dev server holds the DB).
 */
export async function seedAdmin(repo: Repo): Promise<void> {
  const email = config.seedAdmin.email;
  const password = config.seedAdmin.password;
  if (!email || !password) return;

  const existing = await repo.getProfileByEmail(email);
  if (existing?.role === 'admin') return;

  const password_hash = await hashPassword(password);
  if (existing) {
    await repo.updateProfile(existing.id, {
      role: 'admin',
      account_type: 'paid',
      is_affiliate: true,
      affiliate_code: existing.affiliate_code ?? config.adminAffiliateCode,
      password_hash,
      email_verified_at: new Date().toISOString(),
    });
    console.log(`[seed] promoted ${email} to admin`);
  } else {
    const created = await repo.createProfile({
      email,
      full_name: 'Admin',
      role: 'admin',
      account_type: 'paid',
      password_hash,
      email_verified_at: new Date().toISOString(),
    });
    await repo.updateProfile(created.id, {
      is_affiliate: true,
      affiliate_code: config.adminAffiliateCode,
    });
    console.log(`[seed] created admin ${email}`);
  }
}
