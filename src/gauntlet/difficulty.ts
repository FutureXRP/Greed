/**
 * Difficulty tiers for Gauntlet & Endless runs. Non-frozen (tuning).
 * A tier scales the target curve and sets busts, starting coin/items, when
 * house rules begin, and how fast surplus converts to coin.
 */

import { Inventory } from './shop';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface DifficultyConfig {
  id: Difficulty;
  name: string;
  blurb: string;
  /** Multiplier on the base level-target curve. */
  targetMult: number;
  /** Busts allowed before the run ends. */
  maxBusts: number;
  /** Coin the player starts the run with. */
  startCoin: number;
  /** Free consumables at run start (first power-ups, on the house). */
  startItems: Partial<Inventory>;
  /** Level from which house-rule modifiers begin. */
  modifierStartLevel: number;
  /** Surplus-over-target → coin divisor (lower = more coin). */
  coinPerSurplus: number;
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: {
    id: 'easy',
    name: 'Easy',
    blurb: 'Gentle targets, four busts, and a Peek + Insurance on the house. Learn the appetite.',
    targetMult: 0.75,
    maxBusts: 4,
    startCoin: 5,
    startItems: { peek: 1, insurance: 1 },
    modifierStartLevel: 6,
    coinPerSurplus: 3,
  },
  medium: {
    id: 'medium',
    name: 'Medium',
    blurb: 'The standard run. Three busts, a free Peek to start, house rules from level 4.',
    targetMult: 1.0,
    maxBusts: 3,
    startCoin: 2,
    startItems: { peek: 1 },
    modifierStartLevel: 4,
    coinPerSurplus: 4,
  },
  hard: {
    id: 'hard',
    name: 'Hard',
    blurb: 'Steep targets, two busts, empty pockets, and house rules from level 3. The house favours the house.',
    targetMult: 1.4,
    maxBusts: 2,
    startCoin: 0,
    startItems: {},
    modifierStartLevel: 3,
    coinPerSurplus: 5,
  },
};

export const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard'];
