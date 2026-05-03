export const APP_NAME = "Monk ModeX";

export const TIER = {
  FOUNDATION: "foundation",
  OPERATOR: "operator",
} as const;

export type Tier = (typeof TIER)[keyof typeof TIER];

export const TIER_DURATION_DAYS: Record<Tier, 30 | 90> = {
  foundation: 30,
  operator: 90,
};

export const SESSION_COOKIE_NAME = "mmx_session";
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
