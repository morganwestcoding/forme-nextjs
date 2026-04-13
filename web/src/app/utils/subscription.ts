// Subscription tier helpers — gating, fee calculation, feature access

export const TIERS = {
  BRONZE: 'bronze',
  GOLD: 'gold',
  PLATINUM: 'platinum',
} as const;

export type Tier = (typeof TIERS)[keyof typeof TIERS];

export type GatedFeature = 'analytics' | 'seo' | 'marketing_credits' | 'promotions';

/**
 * Map from feature → minimum tier required.
 * Gold features are also available to Platinum.
 */
const FEATURE_ACCESS: Record<GatedFeature, Tier[]> = {
  analytics:        [TIERS.GOLD, TIERS.PLATINUM],
  seo:              [TIERS.GOLD, TIERS.PLATINUM],
  marketing_credits:[TIERS.PLATINUM],
  promotions:       [TIERS.PLATINUM],
};

/** Legacy tier names that map to the current system */
const LEGACY_TIER_MAP: Record<string, Tier> = {
  pearl:     TIERS.GOLD,
  sapphire:  TIERS.GOLD,
  ruby:      TIERS.GOLD,
  emerald:   TIERS.PLATINUM,
  diamond:   TIERS.PLATINUM,
  enterprise:TIERS.PLATINUM,
  pro:       TIERS.GOLD,
  basic:     TIERS.BRONZE,
  quartz:    TIERS.BRONZE,
};

type SubscriptionUser = {
  isSubscribed: boolean;
  subscriptionTier?: string | null;
  subscriptionStatus?: string | null;
};

const ACTIVE_STATUSES = ['active', 'trialing', 'past_due'];

/** True when the user has a currently active paid subscription */
export function isActiveSub(user: SubscriptionUser): boolean {
  return (
    user.isSubscribed === true &&
    ACTIVE_STATUSES.includes(user.subscriptionStatus ?? '')
  );
}

/** Resolve a user's effective tier — accounts for legacy names and expired subs */
export function normalizeTier(user: SubscriptionUser): Tier {
  if (!isActiveSub(user)) return TIERS.BRONZE;

  const raw = (user.subscriptionTier ?? '').toLowerCase().trim();
  if (raw === TIERS.GOLD || raw === TIERS.PLATINUM) return raw;
  if (raw in LEGACY_TIER_MAP) return LEGACY_TIER_MAP[raw];
  return TIERS.BRONZE;
}

/** Check whether a user's tier grants access to a gated feature */
export function hasFeature(user: SubscriptionUser, feature: GatedFeature): boolean {
  const tier = normalizeTier(user);
  return FEATURE_ACCESS[feature].includes(tier);
}

/**
 * Transaction fee % charged to Bronze users on each booking.
 * Gold and Platinum pay $0 transaction fees.
 *
 * Bronze tiers:
 *   $0–$100   → 7%
 *   $101–$199 → 5%
 *   $200+     → 3%
 *
 * @param bookingAmountCents - total booking price in cents
 * @returns fee percentage (e.g. 7 for 7%)
 */
export function getTransactionFeePercent(
  user: SubscriptionUser,
  bookingAmountCents: number,
): number {
  const tier = normalizeTier(user);
  if (tier === TIERS.GOLD || tier === TIERS.PLATINUM) return 0;

  const dollars = bookingAmountCents / 100;
  if (dollars <= 100) return 7;
  if (dollars < 200) return 5;
  return 3;
}
