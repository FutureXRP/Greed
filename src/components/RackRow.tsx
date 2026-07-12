import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Tile } from './Tile';
import { COLORS, RADIUS, SPACE } from '../theme';
import { GameState } from '../engine/types';

/** The rack: filled slots show tiles, empty slots show ghost frames. */
export function RackRow({
  state,
  tileSize = 40,
  onTilePress,
  highlightSpelled,
  hideValues,
}: {
  state: GameState;
  tileSize?: number;
  onTilePress?: (rackIndex: number) => void;
  highlightSpelled?: boolean;
  hideValues?: boolean;
}) {
  const slots = [];
  for (let i = 0; i < state.config.rackSize; i++) {
    const slot = state.rack[i];
    if (slot) {
      const used = highlightSpelled && state.spelled.includes(i);
      const tone = slot.forced ? 'forced' : slot.cursed ? 'cursed' : 'gold';
      const tile = (
        <Tile letter={slot.letter} size={tileSize} tone={tone} dim={used} hideValue={hideValues} />
      );
      slots.push(
        onTilePress ? (
          <Pressable key={i} onPress={() => onTilePress(i)} accessibilityRole="button" accessibilityLabel={`Tile ${slot.letter}`}>
            {tile}
          </Pressable>
        ) : (
          <View key={i}>{tile}</View>
        ),
      );
    } else {
      slots.push(
        <View
          key={i}
          style={[styles.empty, { width: tileSize, height: tileSize * 1.12, borderRadius: RADIUS.tile }]}
        />,
      );
    }
  }
  return <View style={styles.row}>{slots}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: SPACE.xs, justifyContent: 'center', flexWrap: 'wrap' },
  empty: {
    borderWidth: 2,
    borderColor: COLORS.line,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
});
