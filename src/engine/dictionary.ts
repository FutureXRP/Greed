/**
 * Dictionary: ENABLE filtered to 3–7 letters, uppercase (51,852 words).
 * Builds a validation Set and precomputes per-word letter counts for the solver.
 */

export interface DictEntry {
  word: string;
  /** 26-length letter histogram (A=0 … Z=25). */
  counts: Uint8Array;
  length: number;
}

export interface Dictionary {
  set: Set<string>;
  entries: DictEntry[];
  has(word: string): boolean;
  size: number;
}

const A = 65;

export function letterCounts(letters: string[] | string): Uint8Array {
  const counts = new Uint8Array(26);
  for (const ch of letters) {
    const i = ch.charCodeAt(0) - A;
    if (i >= 0 && i < 26) counts[i]++;
  }
  return counts;
}

/**
 * Build a Dictionary from raw newline-separated text. Ignores blank lines,
 * uppercases, and filters to 3–7 letters (defensive — the asset is pre-filtered).
 */
export function buildDictionary(raw: string): Dictionary {
  const set = new Set<string>();
  const entries: DictEntry[] = [];
  for (const line of raw.split('\n')) {
    const word = line.trim().toUpperCase();
    if (word.length < 3 || word.length > 7) continue;
    if (!/^[A-Z]+$/.test(word)) continue;
    if (set.has(word)) continue;
    set.add(word);
    entries.push({ word, counts: letterCounts(word), length: word.length });
  }
  return {
    set,
    entries,
    has: (w: string) => set.has(w.toUpperCase()),
    size: set.size,
  };
}
