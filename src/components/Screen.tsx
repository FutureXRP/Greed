import React from 'react';
import { View, ScrollView, StyleSheet, Pressable, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACE } from '../theme';
import { UIText } from './ui';

/** Standard screen frame: dark table background, header with optional back. */
export function Screen({
  title,
  subtitle,
  onBack,
  children,
  scroll = true,
  right,
}: {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
  scroll?: boolean;
  right?: React.ReactNode;
}) {
  const header =
    title || onBack ? (
      <View style={styles.header}>
        <View style={styles.headerSide}>
          {onBack ? (
            <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back" hitSlop={12}>
              <UIText style={styles.back}>‹ back</UIText>
            </Pressable>
          ) : null}
        </View>
        <View style={styles.headerCenter}>
          {title ? <UIText style={styles.title}>{title}</UIText> : null}
          {subtitle ? <UIText style={styles.subtitle}>{subtitle}</UIText> : null}
        </View>
        <View style={[styles.headerSide, styles.headerRight]}>{right}</View>
      </View>
    ) : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.ink} />
      {header}
      {scroll ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.flex]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.ink },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  headerSide: { width: 64, justifyContent: 'center' },
  headerRight: { alignItems: 'flex-end' },
  headerCenter: { flex: 1, alignItems: 'center' },
  back: { color: COLORS.muted, fontSize: 15 },
  title: { color: COLORS.gold, fontFamily: FONTS.display, fontWeight: '900', fontSize: 20, letterSpacing: 2 },
  subtitle: { color: COLORS.muted, fontSize: 11, letterSpacing: 1 },
  content: { padding: SPACE.md, gap: SPACE.md, paddingBottom: SPACE.xl },
});
