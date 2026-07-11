/**
 * Custom word overrides layered on top of the base list (YAWL ∪ ENABLE).
 *
 * This is your creative liberty. Add any words you want accepted to EXTRA_WORDS
 * and any you want rejected to BLOCKED_WORDS. Rule of thumb: allow anything
 * playful or obscure, but NOT proper names of people, places, or landmarks.
 *
 * Entries are uppercased and filtered to 3–7 letters automatically.
 */

/** Words to accept even if the base list omits them. */
export const EXTRA_WORDS: string[] = [
  'HELICO', // requested — a combining form (as in helicopter/helicoid)
];

/** Words to reject even if the base list includes them (e.g. stray proper nouns). */
export const BLOCKED_WORDS: string[] = [];
