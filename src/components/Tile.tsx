import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { COLORS, FONTS, RADIUS, TILE_VALUES } from '../theme';

export type TileTone = 'gold' | 'forced' | 'cursed' | 'ghost' | 'flat';

interface TileProps {
  letter: string;
  size?: number;
  tone?: TileTone;
  hideValue?: boolean;
  struck?: boolean;
  style?: StyleProp<ViewStyle>;
  dim?: boolean;
}

/**
 * A gilded/engraved tile — banknote energy. `forced`/`cursed` render in loss-red
 * (reserved for punishment only).
 */
export function Tile({ letter, size = 48, tone = 'gold', hideValue, struck, style, dim }: TileProps) {
  const palette = TONES[tone];
  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size * 1.12,
          borderRadius: RADIUS.tile,
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: dim ? 0.4 : 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.letter,
          { color: palette.fg, fontSize: size * 0.5, textDecorationLine: struck ? 'line-through' : 'none' },
        ]}
      >
        {letter}
      </Text>
      {!hideValue && letter ? (
        <Text style={[styles.pip, { color: palette.fg, fontSize: size * 0.2 }]}>{TILE_VALUES[letter] ?? ''}</Text>
      ) : null}
    </View>
  );
}

const TONES: Record<TileTone, { bg: string; border: string; fg: string }> = {
  gold: { bg: '#FFC94D', border: COLORS.gold, fg: '#5A4014' },
  forced: { bg: COLORS.loss, border: COLORS.lossHi, fg: '#FFFFFF' },
  cursed: { bg: '#FBE3DC', border: COLORS.loss, fg: COLORS.lossHi },
  ghost: { bg: 'transparent', border: COLORS.line, fg: COLORS.muted },
  flat: { bg: COLORS.feltHi, border: COLORS.line, fg: '#8A7A5C' },
};

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  letter: {
    fontFamily: FONTS.display,
    fontWeight: '900',
    includeFontPadding: false,
  },
  pip: {
    position: 'absolute',
    bottom: 3,
    right: 5,
    fontFamily: FONTS.mono,
    fontWeight: '700',
  },
});
