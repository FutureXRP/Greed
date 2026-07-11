/**
 * Scoring. Base rules FROZEN (seedv1); gauntlet modifiers layer on top via ScoreConfig.
 */

/** Standard Scrabble letter values. FROZEN. */
export const LETTER_VALUES: Record<string, number> = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8,
  K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1,
  U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10,
};

/** Length → multiplier. FROZEN for Daily. */
export const LENGTH_MULT: Record<number, number> = { 3: 1, 4: 2, 5: 3, 6: 4, 7: 6 };

const VOWEL_SET = new Set(['A', 'E', 'I', 'O', 'U']);

export interface ScoreConfig {
  /** Override the length→multiplier table (Gauntlet only). */
  lengthMult?: Record<number, number>;
  /** Vowel Tax: vowels contribute 0 to the letter sum. */
  vowelsZero?: boolean;
  /** Short Squeeze: words shorter than this score 0. */
  minScoringLength?: number;
  /** Inflation: add this to every length multiplier. */
  multBonus?: number;
}

export function letterValue(ch: string, cfg?: ScoreConfig): number {
  if (cfg?.vowelsZero && VOWEL_SET.has(ch)) return 0;
  return LETTER_VALUES[ch] ?? 0;
}

/** score = sum(letter values) × length multiplier, with optional gauntlet modifiers. */
export function wordScore(word: string, cfg: ScoreConfig = {}): number {
  const len = word.length;
  if (cfg.minScoringLength && len < cfg.minScoringLength) return 0;
  const table = cfg.lengthMult ?? LENGTH_MULT;
  let mult = table[len] ?? 0;
  if (mult === 0) return 0;
  if (cfg.multBonus) mult += cfg.multBonus;
  let sum = 0;
  for (const ch of word) sum += letterValue(ch, cfg);
  return sum * mult;
}
