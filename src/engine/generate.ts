/**
 * Deterministic stream generation with fairness guards.
 * FROZEN for Daily (seedv1): seed string `GREED-YYYY-M-D` (unpadded) + `#attempt`,
 * vowel guard 4–8, god-line guard ≥5, max 80 attempts.
 */

import { makeRng } from './rng';
import { drawFromBag, countVowels } from './bag';
import { bestWord } from './solver';
import { Dictionary } from './dictionary';

export interface GenerateOptions {
  streamLen: number;
  /** Inclusive vowel bounds; omit to skip the vowel guard. */
  minVowels?: number;
  maxVowels?: number;
  /** Require the god-line to be at least this long; omit to skip. */
  minGodLength?: number;
  maxAttempts?: number;
}

export interface GeneratedStream {
  letters: string[];
  attempt: number;
  seed: string;
}

export const DAILY_GEN: GenerateOptions = {
  streamLen: 16,
  minVowels: 4,
  maxVowels: 8,
  minGodLength: 5,
  maxAttempts: 80,
};

/**
 * Generate a letter stream for `seedStr`, resampling with `#attempt` suffixes
 * until the guards pass (or attempts exhausted, in which case the last draw is
 * returned so generation never hard-fails).
 */
export function generateStream(
  seedStr: string,
  dict: Dictionary,
  opts: GenerateOptions = DAILY_GEN,
): GeneratedStream {
  const maxAttempts = opts.maxAttempts ?? 80;
  let last: string[] = [];
  let lastSeed = seedStr;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const seed = `${seedStr}#${attempt}`;
    const rng = makeRng(seed);
    const letters = drawFromBag(rng, opts.streamLen);
    last = letters;
    lastSeed = seed;

    if (opts.minVowels != null || opts.maxVowels != null) {
      const v = countVowels(letters);
      if (opts.minVowels != null && v < opts.minVowels) continue;
      if (opts.maxVowels != null && v > opts.maxVowels) continue;
    }
    if (opts.minGodLength != null) {
      const god = bestWord(letters, dict);
      if (!god.word || god.word.length < opts.minGodLength) continue;
    }
    return { letters, attempt, seed };
  }
  return { letters: last, attempt: maxAttempts - 1, seed: lastSeed };
}

/** Daily seed string: `GREED-YYYY-M-D` with unpadded month/day. FROZEN. */
export function dailySeedString(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `GREED-${y}-${m}-${d}`;
}

/** GREED epoch — Day 1 is 2026-07-01 (local). */
export const EPOCH = { year: 2026, month: 7, day: 1 };

/** Day number for a local date (days since epoch, epoch = 1). */
export function dayNumber(date: Date): number {
  const epoch = Date.UTC(EPOCH.year, EPOCH.month - 1, EPOCH.day);
  const today = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((today - epoch) / 86_400_000) + 1;
}
