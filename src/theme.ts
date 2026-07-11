/**
 * Design system — carried forward from the prototype aesthetic.
 * Loss red is reserved EXCLUSIVELY for punishment (forced/cursed tiles, busts).
 */

import { Platform } from 'react-native';

export const COLORS = {
  ink: '#141210', // table
  felt: '#1f1b15',
  feltHi: '#2a251d',
  line: '#3a3327',
  gold: '#d9a441',
  goldHi: '#f0c065',
  goldDim: '#8a6b2d',
  bone: '#ede4d3',
  muted: '#8a7f6c',
  loss: '#b8452f', // PUNISHMENT ONLY
  lossHi: '#d65a42',
  win: '#7fae5a',
} as const;

/**
 * Fonts. The brand fonts (Fraunces / Archivo / IBM Plex Mono) require bundled
 * font files; until those ship we fall back to platform equivalents. The
 * `mono` family is used for all numbers/scores — banknote energy.
 */
export const FONTS = {
  display: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  ui: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
} as const;

export const SPACE = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
} as const;

export const RADIUS = {
  tile: 10,
  card: 16,
  pill: 999,
} as const;

/** Standard Scrabble letter values, for tile pips. */
export const TILE_VALUES: Record<string, number> = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8,
  K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1,
  U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10,
};
