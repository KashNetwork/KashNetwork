/**
 * Create (or promote) the admin account on whichever DB the API is configured
 * for (local PGlite by default, or DATABASE_URL if set).
 *
 *   pnpm --filter @kash/api create-admin --email admin@kash.network --password '...'
 *
 * The admin also gets an affiliate_code so it can act as the fallback affiliate
 * for unattributed / reassigned referrals.
 */
import { hashPassword } from '../src/auth/passwords.js';
import { config } from '../src/config.js';
import { closeDb, getRepo, initDb } from '../src/db/index.js';

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const email = arg('email');
  const password = arg('password');
  const code = arg('code') ?? config.adminAffiliateCode;
  if (!email || !password) {
    console.error('Usage: create-admin --email <e> --password <p> [--code <affiliate_code>]');
    process.exit(1);
  }

  await initDb();
  const repo = getRepo();
  const existing = await repo.getProfileByEmail(email);
  const password_hash = await hashPassword(password);

  if (existing) {
    await repo.updateProfile(existing.id, {
      role: 'admin',
      account_type: 'paid',
      free_variant: 'lead',
      is_affiliate: true,
      affiliate_code: existing.affiliate_code ?? code,
      password_hash,
      email_verified_at: new Date().toISOString(),
    });
    console.log(`Promoted ${email} to admin.`);
  } else {
    const created = await repo.createProfile({
      email,
      full_name: 'Admin',
      role: 'admin',
      account_type: 'paid',
      password_hash,
      email_verified_at: new Date().toISOString(),
    });
    await repo.updateProfile(created.id, { is_affiliate: true, affiliate_code: code });
    console.log(`Created admin ${email}.`);
  }
  await closeDb();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
