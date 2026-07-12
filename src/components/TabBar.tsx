import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACE, SHADOW, FONTS } from '../theme';
import { UIText } from './ui';

export type Tab = 'daily' | 'gauntlet' | 'endless' | 'profile';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'daily', label: 'Daily', icon: '☀' },
  { id: 'gauntlet', label: 'Gauntlet', icon: '♛' },
  { id: 'endless', label: 'Endless', icon: '∞' },
  { id: 'profile', label: 'Profile', icon: '☺' },
];

/** Floating rounded bottom navigation — Sunshine Day style. */
export function TabBar({ active, onSelect }: { active: Tab; onSelect: (t: Tab) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, SPACE.sm) }]}>
      <View style={styles.bar}>
        {TABS.map((t) => {
          const on = t.id === active;
          return (
            <Pressable
              key={t.id}
              accessibilityRole="tab"
              accessibilityLabel={t.label}
              accessibilityState={{ selected: on }}
              onPress={() => onSelect(t.id)}
              style={[styles.tab, on && styles.tabOn]}
            >
              <UIText style={[styles.icon, on && styles.iconOn]}>{t.icon}</UIText>
              <UIText style={[styles.label, on && styles.labelOn]}>{t.label}</UIText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: COLORS.ink, paddingHorizontal: SPACE.md, paddingTop: SPACE.xs },
  bar: {
    flexDirection: 'row',
    backgroundColor: COLORS.felt,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 6,
    gap: 4,
    ...SHADOW,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    gap: 1,
  },
  tabOn: { backgroundColor: COLORS.feltHi },
  icon: { fontSize: 15, color: COLORS.muted },
  iconOn: { color: COLORS.goldHi },
  label: { fontSize: 10.5, color: COLORS.muted, fontFamily: FONTS.ui, fontWeight: '600' },
  labelOn: { color: COLORS.goldHi, fontWeight: '800' },
});
