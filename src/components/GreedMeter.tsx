import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACE } from '../theme';
import { Mono, UIText } from './ui';

/** Greed meter: your score as % of the god-line, animated fill. */
export function GreedMeter({ pct, reducedMotion }: { pct: number; reducedMotion?: boolean }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const w = useRef(new Animated.Value(reducedMotion ? clamped : 0)).current;

  useEffect(() => {
    if (reducedMotion) {
      w.setValue(clamped);
      return;
    }
    Animated.timing(w, {
      toValue: clamped,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [clamped, reducedMotion, w]);

  const width = w.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <UIText style={styles.label}>GREED</UIText>
        <Mono style={styles.pct}>{Math.round(clamped)}%</Mono>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width }]} />
      </View>
      <UIText style={styles.caption}>of the god-line</UIText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: SPACE.xs },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  label: { color: COLORS.muted, letterSpacing: 3, fontSize: 12, fontWeight: '700' },
  pct: { color: COLORS.goldHi, fontSize: 18, fontWeight: '700' },
  track: {
    height: 14,
    backgroundColor: COLORS.ink,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.line,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: COLORS.gold, borderRadius: RADIUS.pill },
  caption: { color: COLORS.muted, fontSize: 11, letterSpacing: 1 },
});
