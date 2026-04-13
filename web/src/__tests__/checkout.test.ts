import { describe, it, expect } from 'vitest';
import { getTransactionFeePercent } from '@/app/utils/subscription';

/**
 * Tests that verify the total application fee (platform + transaction)
 * matches what Stripe will charge, for each tier at various booking amounts.
 *
 * This mirrors the logic in /api/checkout/route.ts:
 *   platformFeeCents  = round(totalAmountCents * 0.10)
 *   transactionFeeCents = round(totalAmountCents * (transactionFeePercent / 100))
 *   applicationFeeCents = platformFeeCents + transactionFeeCents
 */

const PLATFORM_FEE_PERCENT = 10;

function calculateFees(totalPriceDollars: number, user: { isSubscribed: boolean; subscriptionTier?: string; subscriptionStatus?: string }) {
  const totalAmountCents = totalPriceDollars * 100;
  const platformFeeCents = Math.round(totalAmountCents * (PLATFORM_FEE_PERCENT / 100));
  const transactionFeePercent = getTransactionFeePercent(user, totalAmountCents);
  const transactionFeeCents = Math.round(totalAmountCents * (transactionFeePercent / 100));
  const applicationFeeCents = platformFeeCents + transactionFeeCents;

  return { platformFeeCents, transactionFeePercent, transactionFeeCents, applicationFeeCents };
}

describe('checkout fee calculation', () => {
  const bronze = { isSubscribed: false };
  const gold = { isSubscribed: true, subscriptionTier: 'Gold', subscriptionStatus: 'active' };
  const platinum = { isSubscribed: true, subscriptionTier: 'Platinum', subscriptionStatus: 'active' };

  describe('Bronze user — $50 booking (7% transaction fee)', () => {
    const fees = calculateFees(50, bronze);

    it('platform fee is $5.00', () => {
      expect(fees.platformFeeCents).toBe(500);
    });

    it('transaction fee is 7%', () => {
      expect(fees.transactionFeePercent).toBe(7);
    });

    it('transaction fee is $3.50', () => {
      expect(fees.transactionFeeCents).toBe(350);
    });

    it('total application fee is $8.50', () => {
      expect(fees.applicationFeeCents).toBe(850);
    });
  });

  describe('Bronze user — $150 booking (5% transaction fee)', () => {
    const fees = calculateFees(150, bronze);

    it('platform fee is $15.00', () => {
      expect(fees.platformFeeCents).toBe(1500);
    });

    it('transaction fee is 5%', () => {
      expect(fees.transactionFeePercent).toBe(5);
    });

    it('transaction fee is $7.50', () => {
      expect(fees.transactionFeeCents).toBe(750);
    });

    it('total application fee is $22.50', () => {
      expect(fees.applicationFeeCents).toBe(2250);
    });
  });

  describe('Bronze user — $250 booking (3% transaction fee)', () => {
    const fees = calculateFees(250, bronze);

    it('platform fee is $25.00', () => {
      expect(fees.platformFeeCents).toBe(2500);
    });

    it('transaction fee is 3%', () => {
      expect(fees.transactionFeePercent).toBe(3);
    });

    it('transaction fee is $7.50', () => {
      expect(fees.transactionFeeCents).toBe(750);
    });

    it('total application fee is $32.50', () => {
      expect(fees.applicationFeeCents).toBe(3250);
    });
  });

  describe('Gold user — $50 booking (0% transaction fee)', () => {
    const fees = calculateFees(50, gold);

    it('platform fee is $5.00', () => {
      expect(fees.platformFeeCents).toBe(500);
    });

    it('transaction fee is 0%', () => {
      expect(fees.transactionFeePercent).toBe(0);
    });

    it('no transaction fee charged', () => {
      expect(fees.transactionFeeCents).toBe(0);
    });

    it('total application fee is $5.00 (platform only)', () => {
      expect(fees.applicationFeeCents).toBe(500);
    });
  });

  describe('Gold user — $250 booking (0% transaction fee)', () => {
    const fees = calculateFees(250, gold);

    it('total application fee is $25.00 (platform only)', () => {
      expect(fees.applicationFeeCents).toBe(2500);
    });
  });

  describe('Platinum user — $50 booking (0% transaction fee)', () => {
    const fees = calculateFees(50, platinum);

    it('total application fee is $5.00 (platform only)', () => {
      expect(fees.applicationFeeCents).toBe(500);
    });
  });

  describe('edge: boundary amounts', () => {
    it('$100.00 booking for Bronze charges 7%', () => {
      const fees = calculateFees(100, bronze);
      expect(fees.transactionFeePercent).toBe(7);
      expect(fees.applicationFeeCents).toBe(1000 + 700); // $10 platform + $7 transaction
    });

    it('$100.01 booking for Bronze charges 5%', () => {
      const fees = calculateFees(100.01, bronze);
      expect(fees.transactionFeePercent).toBe(5);
    });

    it('$199.99 booking for Bronze charges 5%', () => {
      const fees = calculateFees(199.99, bronze);
      expect(fees.transactionFeePercent).toBe(5);
    });

    it('$200.00 booking for Bronze charges 3%', () => {
      const fees = calculateFees(200, bronze);
      expect(fees.transactionFeePercent).toBe(3);
      expect(fees.applicationFeeCents).toBe(2000 + 600); // $20 platform + $6 transaction
    });
  });
});
