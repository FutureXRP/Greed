/**
 * The Coinage Engine — algorithmic creative liberty.
 *
 * The base list can't contain every legitimate formation, and nobody should
 * have to hand-curate one. Instead, a non-dictionary word is accepted as a
 * "coinage" when it is *well-formed English by rule*:
 *
 *   1. A recognized combining form (HELICO, CRYO, XENO, …) played standalone.
 *   2. A dictionary root wearing a common prefix and/or suffix, with standard
 *      orthographic repair (e-restoration, consonant undoubling, I→Y).
 *
 * Deliberately NOT included: free compounding of two words. EVE+REST would
 * accept EVEREST — proper names of people/places/landmarks must stay out, so
 * every coinage must be anchored to a dictionary root via legal morphology.
 *
 * The solver (god-line / best-held) stays strict-dictionary; coinages only
 * widen what the *player* may play. Pure & isomorphic — no DOM, no React.
 */

import { Dictionary } from './dictionary';

export type WordKind = 'word' | 'coinage';

/**
 * Greek/Latin combining forms, 3–7 letters, playable standalone.
 * Curated once, by rule: no geographic/ethnic forms (no INDO, SINO, AFRO-as-
 * continent…), nothing derived from a proper name. Many also exist in the
 * base list already; the dictionary check runs first so overlap is harmless.
 */
export const COMBINING_FORMS: ReadonlySet<string> = new Set([
  'AERO', 'AGRO', 'ANDRO', 'ANEMO', 'ANGIO', 'ANTHO', 'ASTRO', 'AUDIO',
  'BARO', 'BATHY', 'BIO', 'BLASTO', 'BRACHY', 'BRADY', 'CARDIO', 'CHEMO',
  'CHLORO', 'CHONDRO', 'CHROMO', 'CHRONO', 'CRYO', 'CRYPTO', 'CYBER',
  'CYCLO', 'CYTO', 'DACTYLO', 'DENDRO', 'DERMATO', 'DYNAMO', 'ECO',
  'ELECTRO', 'ENDO', 'ENTO', 'ERGO', 'ETHNO', 'FERRO', 'FLUORO', 'GALACTO',
  'GASTRO', 'GEO', 'GERONTO', 'GIGA', 'GLYCO', 'GRAPHO', 'GYNO', 'GYRO',
  'HALO', 'HELICO', 'HELIO', 'HEMATO', 'HEMI', 'HEMO', 'HEPATO', 'HETERO',
  'HEXA', 'HISTO', 'HOLO', 'HYDRO', 'HYGRO', 'HYPER', 'HYPNO', 'HYPO',
  'ICONO', 'IDEO', 'IMMUNO', 'ISO', 'KERATO', 'KILO', 'KINETO', 'LACTO',
  'LEPTO', 'LEXICO', 'LITHO', 'LOGO', 'LUMINO', 'MACRO', 'MAGNETO', 'MEGA',
  'MELANO', 'METRO', 'MICRO', 'MILLI', 'MONO', 'MORPHO', 'MULTI', 'MYCO',
  'MYELO', 'NANO', 'NARCO', 'NECRO', 'NEPHRO', 'NEURO', 'NITRO', 'NOCTI',
  'OCTO', 'OLIGO', 'OMNI', 'ONCO', 'ONTO', 'OPTO', 'ORTHO', 'OSTEO',
  'PALEO', 'PENTA', 'PETRO', 'PHONO', 'PHOTO', 'PHYLO', 'PHYSIO', 'PICO',
  'PIEZO', 'PLASMO', 'PNEUMO', 'POLY', 'PROTO', 'PSYCHO', 'PYRO', 'QUASI',
  'RADIO', 'RETRO', 'RHEO', 'RHINO', 'SCHIZO', 'SEISMO', 'SEMI', 'SEPTA',
  'SIDERO', 'SOCIO', 'SOMATO', 'SPECTRO', 'SPIRO', 'STEREO', 'SYNCHRO',
  'TACHY', 'TECHNO', 'TELE', 'TERA', 'TETRA', 'THERMO', 'TOPO', 'TOXO',
  'TRANS', 'TURBO', 'ULTRA', 'VIBRO', 'XENO', 'XERO', 'ZYGO', 'ZOO',
]);

/**
 * Morphology is blind to parts of speech, so a handful of famous proper nouns
 * happen to be "formable" (EVEREST = EVER+EST, ANTIOCH = ANTI+OCH). This guard
 * set closes those specific holes. Engine-maintained — never a player chore.
 */
const PROPER_NOUN_GUARDS: ReadonlySet<string> = new Set([
  'EVEREST', // EVER + -EST
  'ANTIOCH', // ANTI- + OCH
  'DEWEY',   // DE- + WEY
  'OVERTON', // OVER- + TON
]);

/** Common productive prefixes (attached without spelling change). */
const PREFIXES = [
  'ANTI', 'CO', 'DE', 'DIS', 'MIS', 'NON', 'OUT', 'OVER', 'PRE', 'RE',
  'SUB', 'UN', 'UP',
];

/** Common productive suffixes, each stripped with orthographic repair. */
const SUFFIXES = ['ING', 'EST', 'ISH', 'ISM', 'IST', 'ED', 'ER', 'LY', 'ES', 'S', 'Y'];

const DOUBLE_END = /([BDFGKLMNPRSTZ])\1$/;

/** Candidate stems for `base` after a suffix was removed. */
function repairStems(base: string): string[] {
  const out = [base, base + 'E']; // HOPING → HOP → HOPE
  if (DOUBLE_END.test(base)) out.push(base.slice(0, -1)); // STOPPED → STOPP → STOP
  if (base.endsWith('I')) out.push(base.slice(0, -1) + 'Y'); // HAPPIER → HAPPI → HAPPY
  return out;
}

/** Is `word` a dictionary root wearing one legal suffix? */
function suffixDerived(word: string, dict: Dictionary): boolean {
  // Plural special-case first: BERRIES-style IES → Y.
  if (word.endsWith('IES') && word.length - 3 >= 3) {
    if (dict.set.has(word.slice(0, -3) + 'Y')) return true;
  }
  for (const suf of SUFFIXES) {
    if (!word.endsWith(suf)) continue;
    const base = word.slice(0, -suf.length);
    if (base.length < 3) continue;
    for (const stem of repairStems(base)) {
      if (dict.set.has(stem)) return true;
    }
  }
  return false;
}

/**
 * Classify a candidate word: dictionary word, rule-formed coinage, or invalid.
 * Length/alphabet bounds are the caller's usual 3–7 A–Z contract.
 */
export function classifyWord(word: string, dict: Dictionary): WordKind | null {
  const w = word.toUpperCase();
  if (w.length < 3 || w.length > 7 || !/^[A-Z]+$/.test(w)) return null;
  if (dict.set.has(w)) return 'word';
  if (PROPER_NOUN_GUARDS.has(w)) return null;
  if (COMBINING_FORMS.has(w)) return 'coinage';
  if (suffixDerived(w, dict)) return 'coinage';
  for (const pre of PREFIXES) {
    if (!w.startsWith(pre)) continue;
    const rest = w.slice(pre.length);
    if (rest.length < 3) continue;
    if (dict.set.has(rest) || suffixDerived(rest, dict)) return 'coinage';
  }
  return null;
}
