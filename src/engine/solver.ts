/**
 * Solver: best scoring word formable from a pool of letters.
 * Used for the god-line (best from full stream) and best-held (best from rack).
 * Linear scan of the dictionary — pure, fast enough to run every hand.
 */

import { Dictionary, letterCounts } from './dictionary';
import { wordScore, ScoreConfig } from './score';

export interface SolveResult {
  word: string | null;
  score: number;
}

/** Can `word`'s letter histogram be formed from `pool`? */
function formable(wordCounts: Uint8Array, pool: Uint8Array): boolean {
  for (let i = 0; i < 26; i++) {
    if (wordCounts[i] > pool[i]) return false;
  }
  return true;
}

/**
 * Highest-scoring dictionary word formable from `pool`.
 * `cfg` applies gauntlet scoring modifiers (defaults to base scoring).
 */
export function bestWord(pool: string[], dict: Dictionary, cfg: ScoreConfig = {}): SolveResult {
  const poolCounts = letterCounts(pool);
  let best: string | null = null;
  let bestScore = -1;
  for (const entry of dict.entries) {
    if (!formable(entry.counts, poolCounts)) continue;
    const s = wordScore(entry.word, cfg);
    if (s > bestScore) {
      bestScore = s;
      best = entry.word;
    }
  }
  return { word: best, score: best ? bestScore : 0 };
}

/** Is `word` both in the dictionary and formable from `pool`? */
export function isValidPlay(word: string, pool: string[], dict: Dictionary): boolean {
  const w = word.toUpperCase();
  if (w.length < 3 || w.length > 7) return false;
  if (!dict.has(w)) return false;
  return formable(letterCounts(w), letterCounts(pool));
}
