import { describe, expect, it } from 'vitest';
import { toCsv } from '@/server/services/csv';
import { flagIfDuplicate } from '@/server/services/fraud';
import { InMemoryRepo } from '@/server/db/memory';

describe('CSV export', () => {
  it('quotes commas and neutralises spreadsheet formulas', () => {
    const csv = toCsv(['a', 'b'], [['x, y', '=HYPERLINK("evil")'], [3, null]]);
    expect(csv).toBe('a,b\r\n"x, y","\'=HYPERLINK(""evil"")"\r\n3,\r\n');
  });
});

describe('duplicate-account flag', () => {
  it('flags a gmail dot/plus twin but not an unrelated address', async () => {
    const repo = new InMemoryRepo();
    const base = { account_type: 'free' as const, free_variant: 'lead' as const, email_verified_at: new Date().toISOString() };
    await repo.createProfile({ email: 'jo.smith@gmail.com', ...base });
    const twin = await repo.createProfile({ email: 'josmith+promo@gmail.com', ...base });
    const other = await repo.createProfile({ email: 'someone@gmail.com', ...base });
    await flagIfDuplicate(repo, twin);
    await flagIfDuplicate(repo, other);
    const flags = await repo.listFraudFlags(false, 10);
    expect(flags).toHaveLength(1);
    expect(flags[0]).toMatchObject({ type: 'dup_account', profile_email: 'josmith+promo@gmail.com' });
  });
});
