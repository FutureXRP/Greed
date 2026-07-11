/**
 * House Rules (Gauntlet modifiers). From level 4 onward each level draws one.
 * Brutal modifiers are weighted lower early; never two brutal in a row.
 */

import { ScoreConfig } from '../engine/score';

export type ModifierId =
  | 'vowelTax'
  | 'shortSqueeze'
  | 'cursedTile'
  | 'inflation'
  | 'blackout'
  | 'speedRound'
  | 'doubleDown'
  | 'tightStream'
  | 'looseStream';

export interface Modifier {
  id: ModifierId;
  name: string;
  blurb: string;
  /** Marks the harsher modifiers (rarer early, never consecutive). */
  brutal: boolean;
  baseWeight: number;
  /** Stream length override for this hand. */
  streamLen?: number;
  /** Target multiplier (e.g. Inflation +25% → 1.25). */
  targetMult?: number;
  /** Scoring changes applied to word/god/held scoring this hand. */
  score?: ScoreConfig;
  /** Point values hidden in the draft UI. */
  hideValues?: boolean;
  /** Seconds allotted per keep/pass decision (timeout = forced PASS). */
  decisionSeconds?: number;
  /** One stream tile is cursed: −15 on cash-out if kept. */
  curse?: boolean;
  /** Optional double-or-nothing offered before the draft. */
  doubleDown?: boolean;
}

export const MODIFIERS: Record<ModifierId, Modifier> = {
  vowelTax: {
    id: 'vowelTax',
    name: 'Vowel Tax',
    blurb: 'Vowels score 0 this hand.',
    brutal: true,
    baseWeight: 6,
    score: { vowelsZero: true },
  },
  shortSqueeze: {
    id: 'shortSqueeze',
    name: 'Short Squeeze',
    blurb: 'Only words of 5+ letters score.',
    brutal: false,
    baseWeight: 10,
    score: { minScoringLength: 5 },
  },
  cursedTile: {
    id: 'cursedTile',
    name: 'Cursed Tile',
    blurb: 'One stream tile is cursed. Keep it and lose 15 on cash-out.',
    brutal: false,
    baseWeight: 10,
    curse: true,
  },
  inflation: {
    id: 'inflation',
    name: 'Inflation',
    blurb: 'Target +25%, but every length multiplier +1.',
    brutal: false,
    baseWeight: 9,
    targetMult: 1.25,
    score: { multBonus: 1 },
  },
  blackout: {
    id: 'blackout',
    name: 'Blackout',
    blurb: 'Letter point values are hidden during the draft.',
    brutal: false,
    baseWeight: 9,
    hideValues: true,
  },
  speedRound: {
    id: 'speedRound',
    name: 'Speed Round',
    blurb: '5 seconds per decision. Timeout is a forced PASS.',
    brutal: true,
    baseWeight: 5,
    decisionSeconds: 5,
  },
  doubleDown: {
    id: 'doubleDown',
    name: 'Double Down',
    blurb: 'Optional: hit 1.5× target for double coin — or double the bust.',
    brutal: false,
    baseWeight: 8,
    doubleDown: true,
  },
  tightStream: {
    id: 'tightStream',
    name: 'Tight Stream',
    blurb: 'The stream is only 13 letters.',
    brutal: false,
    baseWeight: 9,
    streamLen: 13,
  },
  looseStream: {
    id: 'looseStream',
    name: 'Loose Stream',
    blurb: 'The stream is 19 letters — but target +15%.',
    brutal: false,
    baseWeight: 9,
    targetMult: 1.15,
    streamLen: 19,
  },
};

const ALL_IDS = Object.keys(MODIFIERS) as ModifierId[];

/**
 * Draw a modifier for `level`. `rng` is a PRNG in [0,1). `prevBrutal` prevents
 * two brutal modifiers in a row. Brutal weights are damped before level 8.
 */
export function drawModifier(
  level: number,
  rng: () => number,
  prevBrutal: boolean,
  fullPool: boolean,
): Modifier {
  const candidates = ALL_IDS.map((id) => MODIFIERS[id]).filter((m) => {
    if (prevBrutal && m.brutal) return false;
    return true;
  });
  const weights = candidates.map((m) => {
    let w = m.baseWeight;
    if (m.brutal && !fullPool && level < 8) w *= 0.4;
    return w;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = rng() * total;
  for (let i = 0; i < candidates.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}
