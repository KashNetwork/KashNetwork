// Central config. Next.js loads .env / .env.local automatically.
// Each integration is "real" only if its credentials are present; otherwise the
// fake adapter is used, so the app runs with an empty env during early phases.

const env = process.env;

export const config = {
  nodeEnv: env.NODE_ENV ?? 'development',
  publicSiteUrl: env.NEXT_PUBLIC_SITE_URL ?? env.PUBLIC_SITE_URL ?? 'https://kash.network',
  adminAffiliateCode: env.ADMIN_AFFILIATE_CODE ?? 'admin',

  db: {
    // empty -> local PGlite (no Docker). Set to a Postgres connection string
    // (Supabase, Neon, ...) for staging/prod.
    databaseUrl: env.DATABASE_URL ?? '',
    pgliteDir: env.PGLITE_DIR ?? '',
  },

  seedAdmin: {
    email: env.SEED_ADMIN_EMAIL ?? '',
    password: env.SEED_ADMIN_PASSWORD ?? '',
  },

  explodely: {
    apiKey: env.EXPLODELY_API_KEY ?? '',
    ipnSecret: env.EXPLODELY_IPN_SECRET ?? '',
    productId: env.EXPLODELY_PRODUCT_ID ?? '',
    get enabled() {
      return Boolean(this.ipnSecret);
    },
  },

  resend: {
    apiKey: env.RESEND_API_KEY ?? '',
    fromHarley: env.EMAIL_FROM_HARLEY ?? 'Harley <harley@go.kash.network>',
    fromSupport: env.EMAIL_FROM_SUPPORT ?? 'Kash Support <support@app.kash.network>',
    // where the support form + admin alerts are delivered (a real inbox)
    supportInbox: env.SUPPORT_INBOX ?? 'support@app.kash.network',
    get enabled() {
      return Boolean(this.apiKey);
    },
  },

  emailVerify: {
    provider: env.EMAIL_VERIFY_PROVIDER ?? 'fake',
    apiKey: env.EMAIL_VERIFY_API_KEY ?? '',
  },

  ai: {
    provider: env.AI_PROVIDER ?? 'fake',
    apiKey: env.AI_API_KEY ?? '',
    model: env.AI_MODEL ?? '',
    monthlyCostCapUsd: Number(env.AI_MONTHLY_COST_CAP_USD ?? 50),
    get enabled() {
      return this.provider !== 'fake' && Boolean(this.apiKey);
    },
  },

  secrets: {
    inboundEmail: env.INBOUND_EMAIL_SECRET ?? '',
    cron: env.CRON_SECRET ?? '',
  },

  leadSessionTtlDays: Number(env.LEAD_SESSION_TTL_DAYS ?? 3650),
} as const;

export function integrationStatus() {
  return {
    db: config.db.databaseUrl ? 'postgres' : 'pglite (local)',
    explodely: config.explodely.enabled ? 'real' : 'fake',
    resend: config.resend.enabled ? 'real' : 'fake',
    ai: config.ai.enabled ? config.ai.provider : 'fake',
    emailVerify: config.emailVerify.provider,
  };
}
