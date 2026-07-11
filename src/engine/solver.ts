/**
 * Solver: best scoring word formable from a pool of letters.
 * Used for the god-line (best from full stream) and best-held (best from rack).
 * Linear scan of the dictionary — pure, fast enough to run every hand.
 */

import { Dictionary, letterCounts } from './dictionary';
import { wordScore, ScoreConfig } from './score';
import { classifyWord, WordKind } from './coinage';

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

/**
 * Classify a play: 'word' (dictionary), 'coinage' (rule-formed — see
 * coinage.ts), or null if invalid or not formable from `pool`.
 * The god-line solver above stays strict-dictionary on purpose: coinages
 * widen what the player may play, never the theoretical maximum.
 */
export function classifyPlay(word: string, pool: string[], dict: Dictionary): WordKind | null {
  const w = word.toUpperCase();
  const kind = classifyWord(w, dict);
  if (!kind) return null;
  return formable(letterCounts(w), letterCounts(pool)) ? kind : null;
}

/** Is `word` an accepted play (dictionary word or coinage) formable from `pool`? */
export function isValidPlay(word: string, pool: string[], dict: Dictionary): boolean {
  return classifyPlay(word, pool, dict) != null;
}
