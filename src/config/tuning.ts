/**
 * ALL non-frozen constants. Gauntlet/Endless targets, shop prices, difficulty
 * tiers, and modifier weights live here and should be trivially adjustable.
 * (Daily/seedv1 constants are frozen in the engine and must NOT be moved here.)
 */

export const TUNING = {
  /**
   * Level target curve: T(n) = base + step·(n−1)^exp, then scaled by the
   * difficulty tier's targetMult. Sub-exponential on purpose so runs can reach
   * 50–100 levels instead of exploding by level 10.
   *   medium: L1≈22 · L10≈45 · L25≈92 · L50≈180 · L100≈377
   */
  curve: {
    base: 22,
    step: 1.8,
    exp: 1.15,
  },
  gauntlet: {
    /** Surplus-over-target → coin conversion divisor (lower = more coin). */
    coinPerSurplus: 4,
  },
  endless: {
    /** Level from which the full modifier pool is unlocked. */
    fullModifierLevel: 8,
  },
  geometry: {
    streamLen: 16,
    rackSize: 7,
    minWord: 3,
  },
} as const;

export type Tuning = typeof TUNING;
