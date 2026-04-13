import { describe, it, expect } from 'vitest';
import {
  normalizeTier,
  isActiveSub,
  hasFeature,
  getTransactionFeePercent,
  TIERS,
} from '@/app/utils/subscription';

// ---------------------------------------------------------------------------
// isActiveSub
// ---------------------------------------------------------------------------
describe('isActiveSub', () => {
  it('returns true for active subscriber', () => {
    expect(isActiveSub({ isSubscribed: true, subscriptionStatus: 'active' })).toBe(true);
  });

  it('returns true for trialing subscriber', () => {
    expect(isActiveSub({ isSubscribed: true, subscriptionStatus: 'trialing' })).toBe(true);
  });

  it('returns true for past_due subscriber', () => {
    expect(isActiveSub({ isSubscribed: true, subscriptionStatus: 'past_due' })).toBe(true);
  });

  it('returns false when isSubscribed is false', () => {
    expect(isActiveSub({ isSubscribed: false, subscriptionStatus: 'active' })).toBe(false);
  });

  it('returns false for canceled status', () => {
    expect(isActiveSub({ isSubscribed: true, subscriptionStatus: 'canceled' })).toBe(false);
  });

  it('returns false when subscriptionStatus is null', () => {
    expect(isActiveSub({ isSubscribed: true, subscriptionStatus: null })).toBe(false);
  });

  it('returns false when subscriptionStatus is undefined', () => {
    expect(isActiveSub({ isSubscribed: true })).toBe(false);
  });

  it('returns false for completely free user', () => {
    expect(isActiveSub({ isSubscribed: false })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// normalizeTier
// ---------------------------------------------------------------------------
describe('normalizeTier', () => {
  it('returns bronze for free user', () => {
    expect(normalizeTier({ isSubscribed: false })).toBe(TIERS.BRONZE);
  });

  it('returns gold for active Gold subscriber', () => {
    expect(normalizeTier({
      isSubscribed: true,
      subscriptionTier: 'Gold',
      subscriptionStatus: 'active',
    })).toBe(TIERS.GOLD);
  });

  it('returns platinum for active Platinum subscriber', () => {
    expect(normalizeTier({
      isSubscribed: true,
      subscriptionTier: 'Platinum',
      subscriptionStatus: 'active',
    })).toBe(TIERS.PLATINUM);
  });

  it('is case-insensitive', () => {
    expect(normalizeTier({
      isSubscribed: true,
      subscriptionTier: 'GOLD',
      subscriptionStatus: 'active',
    })).toBe(TIERS.GOLD);
  });

  it('maps legacy tier pearl to gold', () => {
    expect(normalizeTier({
      isSubscribed: true,
      subscriptionTier: 'pearl',
      subscriptionStatus: 'active',
    })).toBe(TIERS.GOLD);
  });

  it('maps legacy tier sapphire to gold', () => {
    expect(normalizeTier({
      isSubscribed: true,
      subscriptionTier: 'sapphire',
      subscriptionStatus: 'active',
    })).toBe(TIERS.GOLD);
  });

  it('maps legacy tier ruby to gold', () => {
    expect(normalizeTier({
      isSubscribed: true,
      subscriptionTier: 'ruby',
      subscriptionStatus: 'active',
    })).toBe(TIERS.GOLD);
  });

  it('maps legacy tier emerald to platinum', () => {
    expect(normalizeTier({
      isSubscribed: true,
      subscriptionTier: 'emerald',
      subscriptionStatus: 'active',
    })).toBe(TIERS.PLATINUM);
  });

  it('maps legacy tier diamond to platinum', () => {
    expect(normalizeTier({
      isSubscribed: true,
      subscriptionTier: 'diamond',
      subscriptionStatus: 'active',
    })).toBe(TIERS.PLATINUM);
  });

  it('returns bronze for expired subscription even with gold tier', () => {
    expect(normalizeTier({
      isSubscribed: false,
      subscriptionTier: 'Gold',
      subscriptionStatus: 'canceled',
    })).toBe(TIERS.BRONZE);
  });

  it('returns bronze for null subscriptionTier with active status', () => {
    expect(normalizeTier({
      isSubscribed: true,
      subscriptionTier: null,
      subscriptionStatus: 'active',
    })).toBe(TIERS.BRONZE);
  });

  it('returns bronze for unknown tier name', () => {
    expect(normalizeTier({
      isSubscribed: true,
      subscriptionTier: 'mystery',
      subscriptionStatus: 'active',
    })).toBe(TIERS.BRONZE);
  });
});

// ---------------------------------------------------------------------------
// hasFeature
// ---------------------------------------------------------------------------
describe('hasFeature', () => {
  const bronze = { isSubscribed: false };
  const gold = { isSubscribed: true, subscriptionTier: 'Gold', subscriptionStatus: 'active' as const };
  const platinum = { isSubscribed: true, subscriptionTier: 'Platinum', subscriptionStatus: 'active' as const };

  it('denies analytics for bronze', () => {
    expect(hasFeature(bronze, 'analytics')).toBe(false);
  });

  it('grants analytics for gold', () => {
    expect(hasFeature(gold, 'analytics')).toBe(true);
  });

  it('grants analytics for platinum', () => {
    expect(hasFeature(platinum, 'analytics')).toBe(true);
  });

  it('denies seo for bronze', () => {
    expect(hasFeature(bronze, 'seo')).toBe(false);
  });

  it('grants seo for gold', () => {
    expect(hasFeature(gold, 'seo')).toBe(true);
  });

  it('denies marketing_credits for gold', () => {
    expect(hasFeature(gold, 'marketing_credits')).toBe(false);
  });

  it('grants marketing_credits for platinum', () => {
    expect(hasFeature(platinum, 'marketing_credits')).toBe(true);
  });

  it('denies promotions for gold', () => {
    expect(hasFeature(gold, 'promotions')).toBe(false);
  });

  it('grants promotions for platinum', () => {
    expect(hasFeature(platinum, 'promotions')).toBe(true);
  });

  it('denies features for expired gold subscriber', () => {
    const expired = { isSubscribed: false, subscriptionTier: 'Gold', subscriptionStatus: 'canceled' };
    expect(hasFeature(expired, 'analytics')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getTransactionFeePercent
// ---------------------------------------------------------------------------
describe('getTransactionFeePercent', () => {
  const bronze = { isSubscribed: false };
  const gold = { isSubscribed: true, subscriptionTier: 'Gold', subscriptionStatus: 'active' as const };
  const platinum = { isSubscribed: true, subscriptionTier: 'Platinum', subscriptionStatus: 'active' as const };

  describe('bronze tier — tiered fees', () => {
    it('charges 7% for $50 booking', () => {
      expect(getTransactionFeePercent(bronze, 5000)).toBe(7);
    });

    it('charges 7% for $100 booking (boundary)', () => {
      expect(getTransactionFeePercent(bronze, 10000)).toBe(7);
    });

    it('charges 5% for $101 booking', () => {
      expect(getTransactionFeePercent(bronze, 10100)).toBe(5);
    });

    it('charges 5% for $150 booking', () => {
      expect(getTransactionFeePercent(bronze, 15000)).toBe(5);
    });

    it('charges 5% for $199 booking (boundary)', () => {
      expect(getTransactionFeePercent(bronze, 19900)).toBe(5);
    });

    it('charges 3% for $200 booking', () => {
      expect(getTransactionFeePercent(bronze, 20000)).toBe(3);
    });

    it('charges 3% for $500 booking', () => {
      expect(getTransactionFeePercent(bronze, 50000)).toBe(3);
    });
  });

  describe('gold tier — no transaction fee', () => {
    it('charges 0% for $50 booking', () => {
      expect(getTransactionFeePercent(gold, 5000)).toBe(0);
    });

    it('charges 0% for $200 booking', () => {
      expect(getTransactionFeePercent(gold, 20000)).toBe(0);
    });
  });

  describe('platinum tier — no transaction fee', () => {
    it('charges 0% for $50 booking', () => {
      expect(getTransactionFeePercent(platinum, 5000)).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('expired gold subscriber pays bronze fees', () => {
      const expired = { isSubscribed: false, subscriptionTier: 'Gold', subscriptionStatus: 'canceled' };
      expect(getTransactionFeePercent(expired, 5000)).toBe(7);
    });

    it('legacy emerald subscriber pays 0%', () => {
      const legacy = { isSubscribed: true, subscriptionTier: 'emerald', subscriptionStatus: 'active' };
      expect(getTransactionFeePercent(legacy, 5000)).toBe(0);
    });
  });
});
