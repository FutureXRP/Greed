/**
 * Design system — "Sunshine Day": warm cream table, white cards, amber gold,
 * rounded cheerful type. Loss red remains reserved EXCLUSIVELY for punishment
 * (forced/cursed tiles, busts).
 *
 * Token semantics (kept from the original dark theme so components re-skin
 * automatically): ink = page background, felt = card surface, feltHi = soft
 * fill, line = hairline borders, gold = primary accent fill, goldHi = accent
 * text emphasis, bone = primary text, muted = secondary text.
 */

import { Platform } from 'react-native';

export const COLORS = {
  ink: '#FBF3E2', // page background (warm cream)
  felt: '#FFFFFF', // card surface
  feltHi: '#FFF3D6', // soft amber fill
  line: '#F0DFBD',
  gold: '#F5A623', // primary amber (fills, buttons)
  goldHi: '#E07B27', // amber emphasis text (deep enough for cream bg)
  goldDim: '#C98A2E',
  bone: '#4A3B2A', // primary text (warm brown)
  muted: '#A0906F',
  loss: '#E4573D', // PUNISHMENT ONLY
  lossHi: '#C63E28',
  win: '#4E9B57',
} as const;

/**
 * Fonts. Rounded/cheerful display face where the platform has one; body stays
 * on the system face, numbers on the platform mono for tabular alignment.
 */
export const FONTS = {
  display: Platform.select({
    ios: 'Arial Rounded MT Bold',
    android: 'sans-serif-medium',
    default: 'sans-serif',
  }),
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
  tile: 12,
  card: 20,
  pill: 999,
} as const;

/** Soft warm drop shadow for cards and the tab bar. */
export const SHADOW = {
  shadowColor: '#C89B4B',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.18,
  shadowRadius: 8,
  elevation: 3,
} as const;

/** Standard Scrabble letter values, for tile pips. */
export const TILE_VALUES: Record<string, number> = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8,
  K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1,
  U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10,
};
