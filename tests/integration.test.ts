import fs from 'fs';
import path from 'path';
import { buildDictionary } from '../src/engine/dictionary';
import { generateStream, dailySeedString, dayNumber, DAILY_GEN } from '../src/engine/generate';
import { initGame, keep, pass, rackLetters } from '../src/engine/gameMachine';
import { bestWord } from '../src/engine/solver';
import { buildReport } from '../src/game/report';
import { dailyShareText } from '../src/game/share';
import { setupLevel } from '../src/gauntlet/run';
import { DIFFICULTIES } from '../src/gauntlet/difficulty';

const dict = buildDictionary(
  fs.readFileSync(path.join(__dirname, '..', 'assets', 'enable37.txt'), 'utf8'),
);

describe('full daily integration (real seed)', () => {
  const today = new Date(2026, 6, 11); // 2026-07-11 → GREED № 11
  const seed = dailySeedString(today);
  const gen = generateStream(seed, dict, DAILY_GEN);

  test('day number and seed', () => {
    expect(dayNumber(today)).toBe(11);
    expect(seed).toBe('GREED-2026-7-11');
  });

  test('stream satisfies frozen guards', () => {
    expect(gen.letters.length).toBe(16);
    const god = bestWord(gen.letters, dict);
    expect(god.word!.length).toBeGreaterThanOrEqual(5);
  });

  test('a greedy keep-first playthrough yields a valid, coherent report', () => {
    // Keep the first 7 letters, pass the rest (rack fills at 7 → draft ends).
    let s = initGame(gen.letters);
    while (s.phase === 'draft') s = s.rack.length < 7 ? keep(s) : pass(s);
    expect(s.phase).toBe('spell');
    expect(s.rack.length).toBe(7);

    const held = bestWord(rackLetters(s), dict);
    // Play the best held word so the submission is guaranteed valid.
    const report = buildReport({ state: s, dict, word: held.word });

    // MINE ≤ HELD ≤ GOD — the core skill/luck/greed invariant.
    expect(report.score).toBe(held.score);
    expect(report.heldBestScore).toBeLessThanOrEqual(report.godScore);
    expect(report.score).toBeLessThanOrEqual(report.godScore);
    expect(report.epitaph.length).toBeGreaterThan(0);

    const share = dailyShareText(11, report);
    expect(share).toContain('GREED #11');
    expect(share.split('\n')[1].length).toBeGreaterThan(0); // emoji grid line
  });

  test('folding produces a zero-score report with an epitaph', () => {
    let s = initGame(gen.letters);
    while (s.phase === 'draft') s = keep(s);
    const report = buildReport({ state: s, dict, word: null });
    expect(report.score).toBe(0);
    expect(report.word).toBeNull();
    expect(report.epitaph.length).toBeGreaterThan(0);
  });
});

describe('gauntlet level setup (real run seed)', () => {
  const runSeed = 'RUN-gauntlet-fixed-seed';
  const medium = DIFFICULTIES.medium;

  test('level 1 has no modifier and the medium base target', () => {
    const l1 = setupLevel({ mode: 'gauntlet', level: 1, runSeed, dict, difficulty: medium, prevBrutal: false, eighthSlot: false });
    expect(l1.modifier).toBeNull();
    expect(l1.target).toBe(22);
    expect(l1.stream.length).toBe(16);
  });

  test('level 5 draws a modifier and is deterministic', () => {
    const a = setupLevel({ mode: 'gauntlet', level: 5, runSeed, dict, difficulty: medium, prevBrutal: false, eighthSlot: false });
    const b = setupLevel({ mode: 'gauntlet', level: 5, runSeed, dict, difficulty: medium, prevBrutal: false, eighthSlot: false });
    expect(a.modifier?.id).toBe(b.modifier?.id);
    expect(a.stream).toEqual(b.stream);
    expect(a.target).toBeGreaterThan(0);
  });

  test('hard tier targets exceed easy tier at the same level', () => {
    const easy = setupLevel({ mode: 'gauntlet', level: 8, runSeed, dict, difficulty: DIFFICULTIES.easy, prevBrutal: false, eighthSlot: false });
    const hard = setupLevel({ mode: 'gauntlet', level: 8, runSeed, dict, difficulty: DIFFICULTIES.hard, prevBrutal: false, eighthSlot: false });
    expect(hard.target).toBeGreaterThan(easy.target);
  });

  test('eighth slot enlarges the rack', () => {
    const l = setupLevel({ mode: 'gauntlet', level: 2, runSeed, dict, difficulty: medium, prevBrutal: false, eighthSlot: true });
    expect(l.config.rackSize).toBe(8);
  });
});
