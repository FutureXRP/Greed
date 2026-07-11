/**
 * Dictionary: YAWL ∪ ENABLE, filtered to 3–7 letters, uppercase (~72k words).
 * A word-game-curated list — creative and obscure words included, pure proper
 * names of people/places/landmarks excluded. Custom overrides layer on top.
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

export interface BuildOptions {
  /** Words to add on top of the base list (custom allowlist). */
  extra?: string[];
  /** Words to remove from the base list (custom blocklist). */
  blocked?: string[];
}

/**
 * Build a Dictionary from raw newline-separated text, applying optional custom
 * allow/block overrides. Ignores blank lines, uppercases, and filters to 3–7
 * letters (defensive — the asset is pre-filtered).
 */
export function buildDictionary(raw: string, opts: BuildOptions = {}): Dictionary {
  const set = new Set<string>();
  const add = (line: string) => {
    const word = line.trim().toUpperCase();
    if (word.length < 3 || word.length > 7) return;
    if (!/^[A-Z]+$/.test(word)) return;
    set.add(word);
  };
  for (const line of raw.split('\n')) add(line);
  for (const w of opts.extra ?? []) add(w);
  for (const w of opts.blocked ?? []) set.delete(w.trim().toUpperCase());

  const entries: DictEntry[] = [];
  for (const word of set) {
    entries.push({ word, counts: letterCounts(word), length: word.length });
  }
  return {
    set,
    entries,
    has: (w: string) => set.has(w.toUpperCase()),
    size: set.size,
  };
}
