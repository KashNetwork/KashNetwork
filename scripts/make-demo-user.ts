/**
 * Create/refresh a demo paid + affiliate account (for showing the paid dashboard).
 *   pnpm tsx scripts/make-demo-user.ts --email demo-paid@kash.network --password demo1234 --code DEMO
 * Requires DATABASE_URL (or uses local PGlite).
 */
import 'dotenv/config';
import { hashPassword } from '../src/server/auth/passwords';
import { closeDb, getDb } from '../src/server/db/index';

const arg = (n: string, d?: string) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : d;
};

async function main() {
  const email = (arg('email', 'demo-paid@kash.network')!).toLowerCase();
  const password = arg('password', 'demo1234')!;
  const code = arg('code', 'DEMO')!;

  const repo = await getDb();
  const existing = await repo.getProfileByEmail(email);
  const password_hash = await hashPassword(password);
  const patch = {
    full_name: 'Demo Paid',
    password_hash,
    account_type: 'paid' as const,
    free_variant: 'lead' as const,
    is_affiliate: true,
    affiliate_code: code,
    email_verified_at: new Date().toISOString(),
  };

  if (existing) {
    await repo.updateProfile(existing.id, patch);
    console.log(`updated ${email}`);
  } else {
    const p = await repo.createProfile({ email, ...patch });
    await repo.updateProfile(p.id, { is_affiliate: true, affiliate_code: code });
    console.log(`created ${email}`);
  }
  console.log(`login: ${email} / ${password}  (affiliate code ${code})`);
  await closeDb();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
