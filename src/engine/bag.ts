/**
 * The tile bag — standard Scrabble distribution, blanks removed (98 tiles).
 * FROZEN (seedv1).
 */

/** Letter → count in the 98-tile bag. */
export const BAG_DISTRIBUTION: Record<string, number> = {
  A: 9, B: 2, C: 2, D: 4, E: 12, F: 2, G: 3, H: 2, I: 9, J: 1,
  K: 1, L: 4, M: 2, N: 6, O: 8, P: 2, Q: 1, R: 6, S: 4, T: 6,
  U: 4, V: 2, W: 2, X: 1, Y: 2, Z: 1,
};

/** Flat array of all 98 tiles. */
export function buildBag(): string[] {
  const bag: string[] = [];
  for (const letter of Object.keys(BAG_DISTRIBUTION)) {
    for (let i = 0; i < BAG_DISTRIBUTION[letter]; i++) bag.push(letter);
  }
  return bag;
}

export const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

/**
 * Draw `n` tiles without replacement from the bag using the provided PRNG.
 * Fisher–Yates partial shuffle — deterministic for a given rng.
 */
export function drawFromBag(rng: () => number, n: number): string[] {
  const bag = buildBag();
  const drawn: string[] = [];
  for (let i = 0; i < n && bag.length > 0; i++) {
    const idx = Math.floor(rng() * bag.length);
    drawn.push(bag[idx]);
    bag[idx] = bag[bag.length - 1];
    bag.pop();
  }
  return drawn;
}

export function countVowels(letters: string[]): number {
  let v = 0;
  for (const l of letters) if (VOWELS.has(l)) v++;
  return v;
}
