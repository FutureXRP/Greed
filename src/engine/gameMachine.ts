/**
 * The draft → spell → report state machine. Pure reducer — no DOM, no React.
 */

import { Fate, GameConfig, GameState, RackSlot } from './types';

export const DEFAULT_CONFIG: GameConfig = { streamLen: 16, rackSize: 7, minWord: 3 };

export function initGame(stream: string[], config: GameConfig = DEFAULT_CONFIG): GameState {
  return {
    phase: 'draft',
    config,
    stream,
    revealIndex: 0,
    rack: [],
    fates: stream.map(() => 'pending' as Fate),
    spelled: [],
  };
}

/** The letter currently awaiting a KEEP/PASS decision, or null if the draft is over. */
export function currentLetter(s: GameState): string | null {
  if (s.phase !== 'draft') return null;
  if (s.revealIndex >= s.stream.length) return null;
  return s.stream[s.revealIndex];
}

export function openSlots(s: GameState): number {
  return s.config.rackSize - s.rack.length;
}

/** Letters not yet decided (including the current one). */
function remainingLetters(s: GameState): number {
  return s.stream.length - s.revealIndex;
}

/**
 * After any decision, resolve forced-fill and draft-end transitions.
 * Invariant maintained: remaining ≥ open. When remaining === open, all
 * remaining letters are forced into the rack.
 */
function resolve(s: GameState): GameState {
  let state = s;
  // Forced fill: remaining letters exactly equal open slots.
  while (
    state.phase === 'draft' &&
    openSlots(state) > 0 &&
    remainingLetters(state) > 0 &&
    remainingLetters(state) === openSlots(state)
  ) {
    const idx = state.revealIndex;
    const letter = state.stream[idx];
    const slot: RackSlot = { letter, forced: true, from: idx };
    const fates = state.fates.slice();
    fates[idx] = 'forced';
    state = {
      ...state,
      rack: [...state.rack, slot],
      fates,
      revealIndex: idx + 1,
    };
  }
  // Draft ends when the rack is full or the stream is exhausted.
  if (state.phase === 'draft' && (openSlots(state) === 0 || state.revealIndex >= state.stream.length)) {
    const fates = state.fates.map((f) => (f === 'pending' ? ('unseen' as Fate) : f));
    state = { ...state, fates, phase: 'spell' };
  }
  return state;
}

export function keep(s: GameState): GameState {
  if (s.phase !== 'draft') return s;
  const idx = s.revealIndex;
  if (idx >= s.stream.length || openSlots(s) === 0) return s;
  const letter = s.stream[idx];
  const slot: RackSlot = { letter, forced: false, from: idx };
  const fates = s.fates.slice();
  fates[idx] = 'kept';
  return resolve({ ...s, rack: [...s.rack, slot], fates, revealIndex: idx + 1 });
}

export function pass(s: GameState): GameState {
  if (s.phase !== 'draft') return s;
  const idx = s.revealIndex;
  if (idx >= s.stream.length) return s;
  const fates = s.fates.slice();
  fates[idx] = 'passed';
  return resolve({ ...s, fates, revealIndex: idx + 1 });
}

/** Burn (shop item): discard a rack tile mid-draft, reopening the slot. */
export function burn(s: GameState, rackIndex: number): GameState {
  if (s.phase !== 'draft') return s;
  if (rackIndex < 0 || rackIndex >= s.rack.length) return s;
  const rack = s.rack.slice();
  rack.splice(rackIndex, 1);
  return { ...s, rack };
}

// ---- Spell phase ----

export function toggleTile(s: GameState, rackIndex: number): GameState {
  if (s.phase !== 'spell') return s;
  const at = s.spelled.indexOf(rackIndex);
  if (at >= 0) {
    const spelled = s.spelled.slice();
    spelled.splice(at, 1);
    return { ...s, spelled };
  }
  if (s.spelled.length >= 7) return s; // max word length
  return { ...s, spelled: [...s.spelled, rackIndex] };
}

export function backspaceTile(s: GameState): GameState {
  if (s.phase !== 'spell' || s.spelled.length === 0) return s;
  return { ...s, spelled: s.spelled.slice(0, -1) };
}

export function clearSpelled(s: GameState): GameState {
  return s.phase === 'spell' ? { ...s, spelled: [] } : s;
}

export function currentWord(s: GameState): string {
  return s.spelled.map((i) => s.rack[i]?.letter ?? '').join('');
}

export function rackLetters(s: GameState): string[] {
  return s.rack.map((r) => r.letter);
}

/** Encode the K/P/F/U decision string for anti-cheat replay. */
export function decisionsString(fates: Fate[]): string {
  return fates
    .map((f) => (f === 'kept' ? 'K' : f === 'passed' ? 'P' : f === 'forced' ? 'F' : 'U'))
    .join('');
}
