/**
 * Seeded RNG — xmur3 (string → 32-bit seed) → mulberry32 (PRNG).
 * FROZEN (seedv1). Do not change: any change desyncs the global Daily.
 * Pure & isomorphic — no DOM, no React.
 */

/** Hash a string into a 32-bit seed generator (xmur3). */
export function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

/** mulberry32 PRNG — returns a float in [0, 1). */
export function mulberry32(a: number): () => number {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Build a deterministic PRNG from a seed string. */
export function makeRng(seedStr: string): () => number {
  const seed = xmur3(seedStr)();
  return mulberry32(seed);
}
