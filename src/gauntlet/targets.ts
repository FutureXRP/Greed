/** Level target curves for Gauntlet and Endless. Non-frozen (tuning). */

import { TUNING } from '../config/tuning';

/** Gauntlet: T(n) = round(30 × 1.22^(n−1)). */
export function gauntletTarget(level: number): number {
  const { baseTarget, growth } = TUNING.gauntlet;
  return Math.round(baseTarget * Math.pow(growth, level - 1));
}

/**
 * Endless: same curve, but from level 20 the curve flattens to
 * T(n) = T(20) + 40(n−20) so deep runs are skill-bounded, not math-bounded.
 */
export function endlessTarget(level: number): number {
  const { flattenLevel, linearStep } = TUNING.endless;
  if (level <= flattenLevel) return gauntletTarget(level);
  return gauntletTarget(flattenLevel) + linearStep * (level - flattenLevel);
}

export function targetFor(mode: 'gauntlet' | 'endless', level: number): number {
  return mode === 'endless' ? endlessTarget(level) : gauntletTarget(level);
}

/** Surplus over target → coin. */
export function coinFromSurplus(score: number, target: number): number {
  if (score <= target) return 0;
  return Math.floor((score - target) / TUNING.gauntlet.coinPerSurplus);
}
