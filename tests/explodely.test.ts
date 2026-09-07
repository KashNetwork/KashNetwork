import { describe, expect, it } from 'vitest';
import { ExplodelyProvider } from '@/server/adapters/explodely';

const p = new ExplodelyProvider();

// a form-encoded Sale IPN as Explodely sends it
const saleIpn = (over: Record<string, string> = {}) =>
  '?' +
  new URLSearchParams({
    token: 'test-token',
    orderid: '900001',
    type: 'sale',
    productId: '12345',
    productName: 'Kash Network',
    customerName: 'John Buyer',
    customerEmail: 'John@Gmail.com',
    customerPhone: '555',
    affiliate: 'tpa_ABC123',
    amount: '1.00',
    saletimedate: '13:45:07 07-Sep-2026',
    ipadd: '1.2.3.4',
    ...over,
  }).toString();

describe('ExplodelyProvider.parseEvent', () => {
  it('parses an initial sale as trial_started with tpa-stripped ref', () => {
    const e = p.parseEvent(saleIpn());
    expect(e.type).toBe('trial_started');
    expect(e.externalTxnId).toBe('900001');
    expect(e.externalSubId).toBe('900001'); // no mainorderid -> orderid
    expect(e.customerEmail).toBe('john@gmail.com');
    expect(e.affiliateRef).toBe('ABC123');
    expect(e.amountCents).toBe(100);
    expect(e.occurredAt).toBe('2026-09-07T13:45:07.000Z');
    expect(e.dedupeKey).toBe('900001:trial_started');
  });

  it('parses a rebill sale as rebill_succeeded keyed to mainorderid', () => {
    const e = p.parseEvent(saleIpn({ orderid: '900002', rebill: 'yes', mainorderid: '900001', amount: '47.00' }));
    expect(e.type).toBe('rebill_succeeded');
    expect(e.externalTxnId).toBe('900002');
    expect(e.externalSubId).toBe('900001');
    expect(e.amountCents).toBe(4700);
  });

  it('parses a refund (negative amount) as refunded', () => {
    const e = p.parseEvent(
      '?' +
        new URLSearchParams({
          token: 'test-token',
          orderid: '900001',
          type: 'refund',
          customerEmail: 'john@gmail.com',
          amount: '-1.00',
          refundtimestamp: '1789065000',
        }).toString(),
    );
    expect(e.type).toBe('refunded');
    expect(e.amountCents).toBe(100);
    expect(e.externalTxnId).toBe('900001');
  });

  it('parses a rebillcancel (minimal payload)', () => {
    const e = p.parseEvent(
      '?' +
        new URLSearchParams({
          token: 'test-token',
          type: 'rebillcancel',
          mainorderid: '900001',
          canceltimestamp: '1789070000',
        }).toString(),
    );
    expect(e.type).toBe('subscription_cancelled');
    expect(e.externalSubId).toBe('900001');
  });
});

describe('ExplodelyProvider.verifyWebhook', () => {
  it('accepts a matching token and rejects a bad one', () => {
    expect(() => p.verifyWebhook({}, saleIpn())).not.toThrow();
    expect(() => p.verifyWebhook({}, saleIpn({ token: 'wrong' }))).toThrow(/mismatch/);
    expect(() => p.verifyWebhook({}, '?orderid=1&type=sale')).toThrow(/mismatch/);
  });
});
