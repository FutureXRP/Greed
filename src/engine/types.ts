/** Per-letter fate in the stream, used for the report and share grid. */
export type Fate = 'pending' | 'kept' | 'passed' | 'forced' | 'unseen';

export type Phase = 'draft' | 'spell' | 'report';

export interface RackSlot {
  letter: string;
  /** Was this tile forced in (over-passing punishment)? Renders in loss-red. */
  forced: boolean;
  /** Cursed tile (Gauntlet): −15 on cash-out if kept. */
  cursed?: boolean;
  /** Stream index this tile came from. */
  from: number;
}

export interface GameConfig {
  streamLen: number;
  rackSize: number;
  minWord: number;
}

export interface GameState {
  phase: Phase;
  config: GameConfig;
  stream: string[];
  /** Index of the next letter awaiting a decision. */
  revealIndex: number;
  rack: RackSlot[];
  fates: Fate[];
  /** Spell phase: rack indices chosen, in order. */
  spelled: number[];
}

export interface HandResult {
  word: string | null; // null = folded
  score: number;
  heldBestWord: string | null;
  heldBestScore: number;
  godWord: string | null;
  godScore: number;
  /** K/P/F per stream letter (kept/passed/forced), 'U' for unseen. */
  decisions: string;
  fates: Fate[];
  epitaph: string;
}
