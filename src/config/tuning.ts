/**
 * ALL non-frozen constants. Gauntlet/Endless targets, shop prices, and modifier
 * weights live here and should be trivially adjustable. (Daily/seedv1 constants
 * are frozen in the engine and must NOT be moved here.)
 */

export const TUNING = {
  gauntlet: {
    baseTarget: 30,
    growth: 1.22,
    maxBusts: 3,
    /** Surplus-over-target → coin conversion divisor. */
    coinPerSurplus: 5,
    /** Level at which modifiers begin. */
    modifierStartLevel: 4,
  },
  endless: {
    /** Level from which the curve flattens to linear. */
    flattenLevel: 20,
    /** Linear step after the flatten point. */
    linearStep: 40,
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
