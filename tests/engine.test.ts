import { makeRng, xmur3, mulberry32 } from '../src/engine/rng';
import { buildBag, drawFromBag, countVowels, BAG_DISTRIBUTION } from '../src/engine/bag';
import { wordScore, LETTER_VALUES } from '../src/engine/score';
import { buildDictionary } from '../src/engine/dictionary';
import { bestWord, isValidPlay } from '../src/engine/solver';
import { generateStream, dailySeedString, dayNumber, DAILY_GEN } from '../src/engine/generate';
import { initGame, keep, pass, currentLetter, decisionsString } from '../src/engine/gameMachine';
import { fatesToGrid, dailyShareText } from '../src/game/share';
import { chooseEpitaph } from '../src/game/epitaphs';
import { baseTarget, levelTarget, coinFromSurplus } from '../src/gauntlet/targets';
import { DIFFICULTIES } from '../src/gauntlet/difficulty';
import { classifyWord } from '../src/engine/coinage';

// A small dictionary is enough for most engine tests.
const MINI = buildDictionary(
  ['CAT', 'DOG', 'QUITS', 'SEQUIN', 'STONE', 'NOTES', 'ONSET', 'ZZZZ', 'AB', 'QUIZ', 'JAZZ', 'OXEN'].join('\n'),
);

describe('rng', () => {
  test('xmur3 + mulberry32 are deterministic', () => {
    const a = makeRng('GREED-2026-7-1#0');
    const b = makeRng('GREED-2026-7-1#0');
    const seqA = [a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
    expect(seqA[0]).not.toEqual(seqA[1]);
  });

  test('different seeds diverge', () => {
    const a = makeRng('GREED-2026-7-1#0');
    const b = makeRng('GREED-2026-7-2#0');
    expect(a()).not.toEqual(b());
  });

  test('mulberry32 output is in [0,1)', () => {
    const r = mulberry32(xmur3('x')());
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('bag', () => {
  test('bag has exactly 98 tiles', () => {
    expect(buildBag().length).toBe(98);
  });

  test('bag distribution totals 98 and has no blanks', () => {
    const total = Object.values(BAG_DISTRIBUTION).reduce((a, b) => a + b, 0);
    expect(total).toBe(98);
    expect(Object.keys(BAG_DISTRIBUTION).length).toBe(26);
  });

  test('draw is deterministic and without replacement bounds', () => {
    const d1 = drawFromBag(makeRng('s#0'), 16);
    const d2 = drawFromBag(makeRng('s#0'), 16);
    expect(d1).toEqual(d2);
    expect(d1.length).toBe(16);
    // no letter drawn more than its bag count
    const counts: Record<string, number> = {};
    for (const l of d1) counts[l] = (counts[l] ?? 0) + 1;
    for (const [l, c] of Object.entries(counts)) {
      expect(c).toBeLessThanOrEqual(BAG_DISTRIBUTION[l]);
    }
  });
});

describe('score', () => {
  test('length multipliers', () => {
    // QUITS = Q10 U1 I1 T1 S1 = 14, ×3 (5 letters) = 42
    expect(wordScore('QUITS')).toBe(42);
    // CAT = C3 A1 T1 = 5, ×1 = 5
    expect(wordScore('CAT')).toBe(5);
  });

  test('seven-letter jackpot ×6', () => {
    // SEQUIN(6): S1 E1 Q10 U1 I1 N1 = 15 ×4 = 60
    expect(wordScore('SEQUIN')).toBe(60);
  });

  test('vowel tax zeroes vowels', () => {
    // STONE: S1 T1 O0 N1 E0 = 3, ×3 = 9 under vowel tax
    expect(wordScore('STONE', { vowelsZero: true })).toBe(9);
  });

  test('short squeeze zeroes short words', () => {
    expect(wordScore('CAT', { minScoringLength: 5 })).toBe(0);
    expect(wordScore('QUITS', { minScoringLength: 5 })).toBe(42);
  });

  test('inflation multBonus', () => {
    // CAT sum 5, mult 1+1=2 => 10
    expect(wordScore('CAT', { multBonus: 1 })).toBe(10);
  });

  test('letter values match Scrabble', () => {
    expect(LETTER_VALUES.Q).toBe(10);
    expect(LETTER_VALUES.Z).toBe(10);
    expect(LETTER_VALUES.A).toBe(1);
  });
});

describe('solver', () => {
  test('bestWord finds highest score from pool', () => {
    const pool = 'SEQUINX'.split('');
    const r = bestWord(pool, MINI);
    // SEQUIN(60) beats QUITS(needs T, absent), STONE(needs O,T absent)
    expect(r.word).toBe('SEQUIN');
    expect(r.score).toBe(60);
  });

  test('bestWord respects multiset (not enough copies)', () => {
    const pool = 'CATT'.split('');
    const r = bestWord(pool, MINI);
    expect(r.word).toBe('CAT');
  });

  test('isValidPlay validates length, dict, formability', () => {
    expect(isValidPlay('CAT', 'CATX'.split(''), MINI)).toBe(true);
    expect(isValidPlay('AB', 'AB'.split(''), MINI)).toBe(false); // too short
    expect(isValidPlay('CAT', 'CXX'.split(''), MINI)).toBe(false); // not formable
    expect(isValidPlay('XYZ', 'XYZ'.split(''), MINI)).toBe(false); // not in dict
  });
});

describe('generate', () => {
  test('daily seed string is unpadded', () => {
    expect(dailySeedString(new Date(2026, 6, 1))).toBe('GREED-2026-7-1');
    expect(dailySeedString(new Date(2026, 11, 25))).toBe('GREED-2026-12-25');
  });

  test('day number epoch', () => {
    expect(dayNumber(new Date(2026, 6, 1))).toBe(1);
    expect(dayNumber(new Date(2026, 6, 11))).toBe(11);
  });

  test('generation is deterministic and satisfies vowel guard', () => {
    const dict = FULL();
    const g1 = generateStream('GREED-2026-7-1', dict);
    const g2 = generateStream('GREED-2026-7-1', dict);
    expect(g1.letters).toEqual(g2.letters);
    expect(g1.letters.length).toBe(16);
    const v = countVowels(g1.letters);
    expect(v).toBeGreaterThanOrEqual(4);
    expect(v).toBeLessThanOrEqual(8);
  });

  test('god-line guard: best word >= 5 letters', () => {
    const dict = FULL();
    const g = generateStream('GREED-2026-7-1', dict);
    const god = bestWord(g.letters, dict);
    expect(god.word).not.toBeNull();
    expect(god.word!.length).toBeGreaterThanOrEqual(5);
  });
});

describe('gameMachine', () => {
  test('keeping fills the rack and ends the draft at rack size', () => {
    let s = initGame('ABCDEFGHIJKLMNOP'.split(''));
    for (let i = 0; i < 7; i++) s = keep(s);
    expect(s.phase).toBe('spell');
    expect(s.rack.length).toBe(7);
    expect(s.rack.every((r) => !r.forced)).toBe(true);
  });

  test('forced fill punishes over-passing', () => {
    // 16 letters, pass the first 9, then remaining 7 == 7 open slots -> all forced
    let s = initGame('ABCDEFGHIJKLMNOP'.split(''));
    for (let i = 0; i < 9; i++) s = pass(s);
    expect(s.phase).toBe('spell');
    expect(s.rack.length).toBe(7);
    expect(s.rack.every((r) => r.forced)).toBe(true);
    expect(s.fates.filter((f) => f === 'forced').length).toBe(7);
    expect(s.fates.filter((f) => f === 'passed').length).toBe(9);
  });

  test('unseen letters when rack fills early', () => {
    let s = initGame('ABCDEFGHIJKLMNOP'.split(''));
    for (let i = 0; i < 7; i++) s = keep(s); // fill immediately
    expect(s.fates.filter((f) => f === 'unseen').length).toBe(9);
  });

  test('decisions string encodes K/P/F/U', () => {
    let s = initGame('ABCDEFGHIJKLMNOP'.split(''));
    s = keep(s);
    s = pass(s);
    const str = decisionsString(s.fates);
    expect(str[0]).toBe('K');
    expect(str[1]).toBe('P');
  });

  test('currentLetter tracks the reveal head', () => {
    let s = initGame('ABCDEFGHIJKLMNOP'.split(''));
    expect(currentLetter(s)).toBe('A');
    s = keep(s);
    expect(currentLetter(s)).toBe('B');
  });
});

describe('share', () => {
  test('fates grid maps to emoji', () => {
    const grid = fatesToGrid(['kept', 'passed', 'forced', 'unseen']);
    expect(grid).toBe('🟨⬛🟥⬜');
  });

  test('daily share text format', () => {
    const text = dailyShareText(11, {
      word: 'QUITS',
      score: 54,
      heldBestWord: 'SEQUIN',
      heldBestScore: 71,
      godWord: 'X',
      godScore: 120,
      decisions: 'KP',
      fates: ['kept', 'passed'],
      epitaph: '',
    });
    expect(text).toContain('GREED #11');
    expect(text).toContain('MINE 54 · HELD 71 · GOD 120');
    expect(text).toContain('Keep seven. Regret the rest.');
  });
});

describe('epitaphs', () => {
  test('folded takes priority', () => {
    const line = chooseEpitaph({
      folded: true, score: 0, godScore: 100, heldBestScore: 80,
      word: null, heldBestWord: 'SEQUIN', passedLetters: ['J'], pick: 0,
    });
    expect(typeof line).toBe('string');
    expect(line.length).toBeGreaterThan(0);
  });

  test('perfect game detected', () => {
    const line = chooseEpitaph({
      folded: false, score: 100, godScore: 100, heldBestScore: 100,
      word: 'X', heldBestWord: 'X', passedLetters: [], pick: 0,
    });
    expect(line.toLowerCase()).toMatch(/perfect|flawless|ceiling|immaculate|clean|maximum|best possible|solved|met the|god-line|nothing|whole board|precise|will not do better/);
  });

  test('held-better substitutes words', () => {
    const line = chooseEpitaph({
      folded: false, score: 30, godScore: 100, heldBestScore: 71,
      word: 'QUITS', heldBestWord: 'SEQUIN', passedLetters: [], pick: 0,
    });
    expect(line).toContain('SEQUIN');
  });
});

describe('coinage engine', () => {
  // Controlled mini-dictionary so each rule is tested in isolation.
  const dict = buildDictionary(['TOSS', 'HOPE', 'STOP', 'HAPPY', 'CAT', 'GLOW', 'EVE', 'REST', 'BERRY'].join('\n'));

  test('dictionary words classify as word', () => {
    expect(classifyWord('TOSS', dict)).toBe('word');
  });

  test('combining forms play standalone (HELICO by rule, not by hand)', () => {
    expect(classifyWord('HELICO', dict)).toBe('coinage');
    expect(classifyWord('CRYO', dict)).toBe('coinage');
    expect(classifyWord('XENO', dict)).toBe('coinage');
  });

  test('prefixed roots are accepted', () => {
    expect(classifyWord('RETOSS', dict)).toBe('coinage');
    expect(classifyWord('UNHAPPY', dict)).toBe('coinage');
    expect(classifyWord('MISHOPE', dict)).toBe('coinage');
  });

  test('suffixed roots with orthographic repair', () => {
    expect(classifyWord('HOPING', dict)).toBe('coinage'); // e-restoration
    expect(classifyWord('STOPPED', dict)).toBe('coinage'); // undoubling
    expect(classifyWord('HAPPIER', dict)).toBe('coinage'); // I→Y
    expect(classifyWord('BERRIES', dict)).toBe('coinage'); // IES→Y
    expect(classifyWord('GLOWY', dict)).toBe('coinage'); // playful -Y
    expect(classifyWord('CATTISH', dict)).toBe('coinage'); // -ISH with doubling
  });

  test('prefix + suffix combine', () => {
    expect(classifyWord('RETOSSY', dict)).toBe('coinage');
  });

  test('no free compounding — EVEREST stays out even with EVE and REST known', () => {
    expect(classifyWord('EVEREST', dict)).toBeNull();
  });

  test('proper names and gibberish are rejected', () => {
    expect(classifyWord('LONDON', dict)).toBeNull();
    expect(classifyWord('DENALI', dict)).toBeNull();
    expect(classifyWord('ZZQJ', dict)).toBeNull();
  });
});

describe('gauntlet targets', () => {
  test('curve is gentle and monotonic to 100 levels', () => {
    // base + step·(n−1)^exp — sub-exponential so deep runs stay reachable.
    expect(baseTarget(1)).toBe(22);
    for (let n = 2; n <= 100; n++) {
      expect(baseTarget(n)).toBeGreaterThan(baseTarget(n - 1));
    }
    // Far gentler than the old 30×1.22^(n−1): ~180 at L50, not tens of thousands.
    expect(baseTarget(50)).toBeGreaterThan(120);
    expect(baseTarget(50)).toBeLessThan(240);
    expect(baseTarget(100)).toBeLessThan(500);
  });

  test('difficulty tiers scale the target', () => {
    const easy = levelTarget(10, DIFFICULTIES.easy);
    const medium = levelTarget(10, DIFFICULTIES.medium);
    const hard = levelTarget(10, DIFFICULTIES.hard);
    expect(easy).toBeLessThan(medium);
    expect(medium).toBeLessThan(hard);
    expect(levelTarget(1, DIFFICULTIES.medium)).toBe(22);
  });

  test('difficulty tiers configure busts, coin, and modifier start', () => {
    expect(DIFFICULTIES.easy.maxBusts).toBeGreaterThan(DIFFICULTIES.hard.maxBusts);
    expect(DIFFICULTIES.easy.startCoin).toBeGreaterThan(DIFFICULTIES.hard.startCoin);
    expect(DIFFICULTIES.easy.startItems.peek).toBe(1);
    expect(DIFFICULTIES.hard.modifierStartLevel).toBeLessThan(DIFFICULTIES.easy.modifierStartLevel);
  });

  test('coin from surplus uses the given rate', () => {
    expect(coinFromSurplus(50, 30, 4)).toBe(5); // floor(20/4)
    expect(coinFromSurplus(50, 30, 3)).toBe(6); // easy converts faster
    expect(coinFromSurplus(30, 30, 4)).toBe(0);
    expect(coinFromSurplus(20, 30, 4)).toBe(0);
  });
});

// Lazily build the full dictionary from the asset for generation tests.
let _full: ReturnType<typeof buildDictionary> | null = null;
function FULL() {
  if (_full) return _full;
  const fs = require('fs');
  const path = require('path');
  const raw = fs.readFileSync(path.join(__dirname, '..', 'assets', 'words37.txt'), 'utf8');
  _full = buildDictionary(raw);
  return _full;
}
