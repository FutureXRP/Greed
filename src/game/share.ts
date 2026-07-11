/**
 * Emoji share format. FROZEN brand asset — do not change casually.
 *
 *   GREED #11
 *   ⬛🟨🟨⬛⬛🟨🟨⬛🟨⬛🟨🟥🟥⬜⬜⬜
 *   MINE 54 · HELD 71 · GOD 120
 *   Keep seven. Regret the rest.
 *
 * 🟨 kept · ⬛ passed · 🟥 forced · ⬜ never seen
 */

import { Fate } from '../engine/types';
import { HandResult } from '../engine/types';

const FATE_EMOJI: Record<Fate, string> = {
  kept: '🟨',
  passed: '⬛',
  forced: '🟥',
  unseen: '⬜',
  pending: '⬜',
};

export function fatesToGrid(fates: Fate[]): string {
  return fates.map((f) => FATE_EMOJI[f]).join('');
}

export function dailyShareText(dayNum: number, result: HandResult): string {
  const grid = fatesToGrid(result.fates);
  const mine = result.word ? result.score : 0;
  return [
    `GREED #${dayNum}`,
    grid,
    `MINE ${mine} · HELD ${result.heldBestScore} · GOD ${result.godScore}`,
    'Keep seven. Regret the rest.',
  ].join('\n');
}

export interface RunSummary {
  mode: 'gauntlet' | 'endless';
  levelReached: number;
  totalScore: number;
  bestWord: string | null;
  bestWordScore: number;
}

export function runShareText(run: RunSummary): string {
  const label = run.mode === 'endless' ? 'ENDLESS' : 'GAUNTLET';
  return [
    `GREED · ${label}`,
    `Level ${run.levelReached} · ${run.totalScore} pts`,
    run.bestWord ? `Best: ${run.bestWord} (${run.bestWordScore})` : 'No word survived.',
    'Keep seven. Regret the rest.',
  ].join('\n');
}
