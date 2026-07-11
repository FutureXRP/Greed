import React from 'react';
import {
  Text,
  TextProps,
  Pressable,
  View,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { COLORS, FONTS, RADIUS, SPACE } from '../theme';

export function Mono(props: TextProps) {
  return <Text {...props} style={[styles.mono, props.style]} />;
}

export function Display(props: TextProps) {
  return <Text {...props} style={[styles.display, props.style]} />;
}

export function UIText(props: TextProps) {
  return <Text {...props} style={[styles.ui, props.style]} />;
}

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger' | 'gold';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}

export function Button({ label, onPress, variant = 'primary', disabled, style, small }: ButtonProps) {
  const v = VARIANTS[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        small && styles.btnSmall,
        { backgroundColor: v.bg, borderColor: v.border, opacity: disabled ? 0.4 : pressed ? 0.82 : 1 },
        style,
      ]}
    >
      <Text style={[styles.btnLabel, small && styles.btnLabelSmall, { color: v.fg }]}>{label}</Text>
    </Pressable>
  );
}

const VARIANTS = {
  primary: { bg: COLORS.feltHi, border: COLORS.line, fg: COLORS.bone },
  gold: { bg: COLORS.gold, border: COLORS.goldHi, fg: COLORS.ink },
  ghost: { bg: 'transparent', border: COLORS.line, fg: COLORS.muted },
  danger: { bg: 'transparent', border: COLORS.loss, fg: COLORS.lossHi },
} as const;

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Divider() {
  return <View style={styles.divider} />;
}

export function Loading({ label }: { label?: string }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={COLORS.gold} size="large" />
      {label ? <UIText style={styles.loadingLabel}>{label}</UIText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  mono: { fontFamily: FONTS.mono, color: COLORS.bone },
  display: { fontFamily: FONTS.display, fontWeight: '900', color: COLORS.gold },
  ui: { fontFamily: FONTS.ui, color: COLORS.bone },
  btn: {
    paddingVertical: 14,
    paddingHorizontal: SPACE.lg,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSmall: { paddingVertical: 9, paddingHorizontal: SPACE.md },
  btnLabel: { fontFamily: FONTS.ui, fontWeight: '700', fontSize: 16, letterSpacing: 1 },
  btnLabelSmall: { fontSize: 13 },
  card: {
    backgroundColor: COLORS.felt,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: SPACE.md,
  },
  divider: { height: 1, backgroundColor: COLORS.line, marginVertical: SPACE.md },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACE.md },
  loadingLabel: { color: COLORS.muted, letterSpacing: 1 },
});
