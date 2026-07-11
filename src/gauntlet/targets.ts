/** Level target curve for Gauntlet and Endless. Non-frozen (tuning). */

import { TUNING } from '../config/tuning';
import { DifficultyConfig } from './difficulty';

/**
 * Base target curve (before difficulty scaling):
 *   T(n) = base + step · (n−1)^exp
 * Sub-exponential, so targets stay reachable deep into a run (50–100 levels).
 */
export function baseTarget(level: number): number {
  const { base, step, exp } = TUNING.curve;
  return base + step * Math.pow(Math.max(0, level - 1), exp);
}

/** Difficulty-scaled target for a level. */
export function levelTarget(level: number, difficulty: DifficultyConfig): number {
  return Math.round(baseTarget(level) * difficulty.targetMult);
}

/** Surplus over target → coin, using the difficulty's conversion rate. */
export function coinFromSurplus(score: number, target: number, coinPerSurplus: number): number {
  if (score <= target) return 0;
  return Math.floor((score - target) / coinPerSurplus);
}
