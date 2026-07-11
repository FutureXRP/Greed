/**
 * Per-level setup for a Gauntlet/Endless run. Deterministic given the run seed
 * and level, so a run is resumable/replayable.
 */

import { makeRng } from '../engine/rng';
import { drawFromBag } from '../engine/bag';
import { generateStream, GenerateOptions } from '../engine/generate';
import { Dictionary } from '../engine/dictionary';
import { ScoreConfig } from '../engine/score';
import { GameConfig } from '../engine/types';
import { levelTarget } from './targets';
import { drawModifier, Modifier } from './modifiers';
import { DifficultyConfig } from './difficulty';
import { TUNING } from '../config/tuning';

export type RunMode = 'gauntlet' | 'endless';

export interface LevelSetup {
  level: number;
  target: number;
  modifier: Modifier | null;
  config: GameConfig;
  cursedIndex: number | null;
  scoreConfig: ScoreConfig;
  hideValues: boolean;
  decisionSeconds: number | null;
  doubleDownAvailable: boolean;
  stream: string[];
}

function genOptions(streamLen: number): GenerateOptions {
  return {
    streamLen,
    minVowels: Math.max(3, Math.floor(streamLen * 0.25)),
    maxVowels: Math.ceil(streamLen * 0.55),
    minGodLength: 4,
    maxAttempts: 60,
  };
}

export function setupLevel(args: {
  mode: RunMode;
  level: number;
  runSeed: string;
  dict: Dictionary;
  difficulty: DifficultyConfig;
  prevBrutal: boolean;
  eighthSlot: boolean;
}): LevelSetup {
  const { mode, level, runSeed, dict, difficulty, prevBrutal, eighthSlot } = args;

  let modifier: Modifier | null = null;
  if (level >= difficulty.modifierStartLevel) {
    const fullPool = mode === 'endless' && level >= TUNING.endless.fullModifierLevel;
    modifier = drawModifier(level, makeRng(`${runSeed}-mod-${level}`), prevBrutal, fullPool);
  }

  const streamLen = modifier?.streamLen ?? TUNING.geometry.streamLen;
  const modTargetMult = modifier?.targetMult ?? 1;
  const target = Math.round(levelTarget(level, difficulty) * modTargetMult);
  const rackSize = eighthSlot ? 8 : TUNING.geometry.rackSize;

  const cursedIndex = modifier?.curse
    ? Math.floor(makeRng(`${runSeed}-curse-${level}`)() * streamLen)
    : null;

  const stream = generateStream(`${runSeed}-L${level}`, dict, genOptions(streamLen)).letters;

  return {
    level,
    target,
    modifier,
    config: { streamLen, rackSize, minWord: TUNING.geometry.minWord },
    cursedIndex,
    scoreConfig: modifier?.score ?? {},
    hideValues: modifier?.hideValues ?? false,
    decisionSeconds: modifier?.decisionSeconds ?? null,
    doubleDownAvailable: modifier?.doubleDown ?? false,
    stream,
  };
}

/** A fresh random tail of `count` tiles (Loaded Die reroll). Non-deterministic. */
export function makeRandomTail(count: number): string[] {
  return drawFromBag(() => Math.random(), count);
}
