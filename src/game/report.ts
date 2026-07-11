/**
 * The Agony Engine — builds the post-hand report (all modes).
 */

import { Dictionary } from '../engine/dictionary';
import { bestWord } from '../engine/solver';
import { wordScore, ScoreConfig } from '../engine/score';
import { GameState, HandResult, Fate } from '../engine/types';
import { decisionsString, rackLetters } from '../engine/gameMachine';
import { chooseEpitaph } from './epitaphs';

export interface BuildReportArgs {
  state: GameState;
  dict: Dictionary;
  /** The word the player submitted, or null to fold. */
  word: string | null;
  cfg?: ScoreConfig;
  /** Deterministic seed for epitaph selection (e.g. stream join or run seed). */
  pick?: number;
}

function hashPick(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return h;
}

export function buildReport(args: BuildReportArgs): HandResult {
  const { state, dict, word, cfg = {} } = args;
  const rack = rackLetters(state);
  const held = bestWord(rack, dict, cfg);
  const god = bestWord(state.stream, dict, cfg);

  const folded = word == null;
  const score = folded ? 0 : wordScore(word, cfg);

  const passedLetters = state.stream.filter((_, i) => state.fates[i] === 'passed');
  const pick = args.pick ?? hashPick(state.stream.join('') + (word ?? 'FOLD'));

  const epitaph = chooseEpitaph({
    folded,
    score,
    godScore: god.score,
    heldBestScore: held.score,
    word,
    heldBestWord: held.word,
    passedLetters,
    pick,
  });

  return {
    word,
    score,
    heldBestWord: held.word,
    heldBestScore: held.score,
    godWord: god.word,
    godScore: god.score,
    decisions: decisionsString(state.fates),
    fates: state.fates.slice() as Fate[],
    epitaph,
  };
}
