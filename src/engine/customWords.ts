/**
 * Optional word overrides — an escape hatch, not a chore.
 *
 * You do NOT need to maintain this file. Creative liberty is handled by the
 * Coinage Engine (see coinage.ts), which accepts well-formed coinages by rule:
 * combining forms (HELICO, CRYO, XENO…) and dictionary roots wearing legal
 * prefixes/suffixes — while proper names of people/places/landmarks stay out.
 *
 * These lists exist only for one-off judgment calls the rules can't express.
 * Entries are uppercased and filtered to 3–7 letters automatically.
 */

/** Words to accept even if the base list and the Coinage Engine reject them. */
export const EXTRA_WORDS: string[] = [];

/** Words to reject even if the base list includes them (e.g. a stray proper noun). */
export const BLOCKED_WORDS: string[] = [];
