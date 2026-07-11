/**
 * The epitaph — one line of dramatized regret per hand. Tone: dry casino noir.
 * Priority chain (first match wins): folded → perfect → played-your-best →
 * held-better → passed-a-gem → default.
 */

import { LETTER_VALUES } from '../engine/score';

export interface EpitaphInput {
  folded: boolean;
  score: number;
  godScore: number;
  heldBestScore: number;
  word: string | null;
  heldBestWord: string | null;
  /** Letters the player passed on. */
  passedLetters: string[];
  /** Stable index for deterministic line selection within a category. */
  pick: number;
}

const FOLDED = [
  'You folded. The house respects a coward.',
  'Nothing ventured. Nothing, indeed.',
  'You looked at your hand and walked away. We noted it.',
  'A fold is a decision. A small one.',
  'You kept your dignity and precisely zero points.',
  'The safest score is zero. Congratulations on your safety.',
  'You blinked. The table blinked back.',
  'Some nights you play the letters. Some nights you play it safe.',
  'You held the cards to your chest and left them there.',
  'The board stays clean. So does your conscience.',
  'You passed on the whole hand. Bold, in its way.',
  'Zero is a number too. A quiet one.',
  'You declined to gamble. The gamble declined to remember you.',
  'Folded like fresh laundry. Neat. Pointless.',
  'The bravest thing you did tonight was leave.',
  'You chose the exit. It was always unlocked.',
  'No word, no risk, no story. Just a fold.',
  'You had letters. You had a choice. You chose the door.',
  'A tidy zero. Framed and hung on the wall.',
  'You surrendered the hand before it could betray you.',
];

const PERFECT = [
  'Perfect. You took everything the stream offered and asked for the receipt.',
  'The god-line and your line are the same line. Flawless greed.',
  'You left nothing on the felt. Nothing at all.',
  'This is the ceiling. You are standing on it.',
  'No regret to manufacture tonight. You played it clean.',
  'The house has no receipts to show you. You already have them all.',
  'A perfect hand. Frame it before the appetite comes back.',
  'You met the maximum and shook its hand.',
  'Every letter earned its keep. Every keep earned its letter.',
  'The best possible word, played by the best possible you.',
  'Greed, when it is this precise, stops being a sin.',
  'You solved it. There is no better line to have played.',
  'The stream gave; you took exactly right. Rare.',
  'Nothing spurned, nothing spared. Perfect.',
  'You beat the god-line to the punch. It concedes.',
  'Textbook. If the textbook were written by a card sharp.',
  'The whole board, converted. Not a tile wasted.',
  'You will not do better than this. Sit with that.',
  'Immaculate. The felt is jealous.',
  'A clean sweep. The regret machine has nothing to say.',
];

const BEST = [
  'You played your best word. The rest was appetite.',
  'The top of your rack, cashed. Clean hands, mostly.',
  'You wrung the best from what you kept. Only the passing haunts you.',
  'Best in your seven. Whatever slipped by, slipped by before the rack.',
  'You spent your hand well. The regret is upstream.',
  'No better word lived in your rack. You found it.',
  'You maxed the seven you chose. The choosing is another story.',
  'The rack gave its all. You accepted the offer.',
  'Optimal, given your greed. The greed is the variable.',
  'You left nothing in the rack. The stream is another matter.',
  'Every tile you kept, you used. Efficient hunger.',
  'You read your rack correctly. The board, less so.',
  'Best available, played. The god-line just had more to work with.',
  'You squeezed the hand dry. It was a smaller hand than it could have been.',
  'The word was there and you took it. Good eyes.',
  'You played the ceiling of your own choices.',
  'Nothing better to be had from those seven. Well seen.',
  'You honored your rack. Now answer for your passes.',
  'The rack has no complaints. The stream files several.',
  'Peak of the possible, from what you let yourself have.',
];

const HELD = [
  'You were holding {held} the entire time. You played {word}.',
  '{held} sat in your rack, waiting. You never called its name.',
  'You had {held} the whole hand. {word} is what you announced.',
  'The rack whispered {held}. You answered with {word}.',
  'You held {held} and blinked. {word} it is, then.',
  '{held} was right there. {word} was easier to see.',
  'History will record {word}. Your rack remembers {held}.',
  'You spelled {word}. You could have spelled {held}. You know this now.',
  '{held}, unplayed, unspoken. {word} took the stage instead.',
  'The better word was {held}. You went with {word}. We all make choices.',
  'You left {held} face-down. {word} took the light.',
  '{held} was yours to play. {word} was yours to settle for.',
  'Somewhere in those tiles: {held}. You found {word} first and stopped looking.',
  'You had {held}. The scoreboard says {word}. The rack says nothing, loudly.',
  '{word} scored. {held} would have scored more. It was in your hand.',
  'The tiles spelled {held} if you asked them. You asked them for {word}.',
  'You played it safe with {word}. {held} was the road not taken.',
  '{held} — in your rack, in your reach, in your regret.',
  'You settled for {word}. {held} settled for being remembered.',
  'The word of the hand was {held}. You were not on speaking terms.',
];

const GEM = [
  'You passed on the {letter}. It remembers.',
  'The {letter} came to you and you waved it off. Bold.',
  'A {letter} in the stream, a {letter} in the trash. Same {letter}.',
  'You let the {letter} walk. It will not forget the insult.',
  'That {letter} was worth keeping. You disagreed. Loudly.',
  'The stream offered you the {letter}. You offered it nothing.',
  'You spurned the {letter}. Somewhere, a better player winces.',
  'The {letter} slid past. You could have caught it. You chose not to.',
  'A {letter}, passed. The rarest regrets are the ones you can name.',
  'You had a shot at the {letter} and blinked it away.',
  'The {letter} is gone now. You sent it there.',
  'You looked a {letter} in the eye and said no. We respect the audacity.',
  'The {letter} was a gift. You returned it unopened.',
  'That {letter} could have carried the hand. You let it walk home alone.',
  'You passed the {letter} like it owed you money.',
  'The {letter} remembers the ones who keep it. You are not on the list.',
  'A high-value {letter}, dismissed. The math weeps quietly.',
  'You had the {letter} in your sights and lowered the rifle.',
  'The {letter} does not come around often. It came around. You left.',
  'History turns on small refusals. This one was the {letter}.',
];

const DEFAULT = [
  'You kept seven. You regret the rest.',
  'The felt is cleared. The appetite is not.',
  'Another hand fed to the stream.',
  'The letters came. The letters went. You did your best guessing.',
  'A hand played, a story told, a lesson half-learned.',
  'You kept seven and made your peace. Uneasy peace.',
  'The house collects the rest. The house always collects.',
  'You played the hand you kept. That was the whole game.',
  'The stream moves on. It does not wait for your regrets.',
  'Seven tiles, one word, one small tragedy. Same as ever.',
  'You made your keeps. The keeps made your fate.',
  'Not your best, not your worst. Just your hand.',
  'The tiles are spent. Count the damage in the morning.',
  'You reached for seven and closed your hand. This is what was in it.',
  'The greed meter has a reading. You are the reading.',
  'A word, a score, a shrug. The daily ritual.',
  'You took what you took. The rest is arithmetic and regret.',
  'The stream gave you a hand. You gave it a story.',
  'Kept seven. Regretted the rest. As advertised.',
  'The night is over. The letters are quiet. Sleep on it.',
];

function fill(line: string, input: EpitaphInput): string {
  return line
    .replace(/\{word\}/g, input.word ?? '—')
    .replace(/\{held\}/g, input.heldBestWord ?? '—')
    .replace(/\{letter\}/g, bestPassedGem(input.passedLetters) ?? '—');
}

/** Highest-value passed letter, if any is "notable" (value ≥ 4). */
function bestPassedGem(passed: string[]): string | null {
  let best: string | null = null;
  let bestVal = 3; // only J,K,Q,X,Z,F,H,V,W,Y (≥4) qualify as a "gem"
  for (const l of passed) {
    const v = LETTER_VALUES[l] ?? 0;
    if (v > bestVal) {
      bestVal = v;
      best = l;
    }
  }
  return best;
}

export function chooseEpitaph(input: EpitaphInput): string {
  const p = Math.abs(input.pick);
  if (input.folded) return FOLDED[p % FOLDED.length];
  if (input.godScore > 0 && input.score === input.godScore) return PERFECT[p % PERFECT.length];
  if (input.score >= input.heldBestScore) return BEST[p % BEST.length];
  if (input.heldBestWord && input.heldBestWord !== input.word) {
    return fill(HELD[p % HELD.length], input);
  }
  if (bestPassedGem(input.passedLetters)) return fill(GEM[p % GEM.length], input);
  return DEFAULT[p % DEFAULT.length];
}
