import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { Button, Card, Display, Mono, UIText } from '../components/ui';
import { COLORS, FONTS, SPACE } from '../theme';
import { useApp } from '../AppContext';
import { getStreak, getDaily, StreakState } from '../storage';

export function HomeScreen() {
  const { navigate, dayNum } = useApp();
  const [streak, setStreak] = useState<StreakState | null>(null);
  const [playedToday, setPlayedToday] = useState(false);

  useEffect(() => {
    (async () => {
      setStreak(await getStreak());
      setPlayedToday((await getDaily(dayNum)) != null);
    })();
  }, [dayNum]);

  return (
    <Screen scroll>
      <View style={styles.hero}>
        <Display style={styles.wordmark}>GREED</Display>
        <UIText style={styles.tagline}>Keep seven. Regret the rest.</UIText>
      </View>

      <Card style={styles.dailyCard}>
        <View style={styles.dailyTop}>
          <UIText style={styles.dailyLabel}>THE DAILY</UIText>
          <Mono style={styles.dailyNum}>№ {dayNum}</Mono>
        </View>
        <UIText style={styles.dailyBlurb}>
          One shared stream. One attempt. Every player on Earth, the same sixteen letters.
        </UIText>
        <Button
          label={playedToday ? 'SEE TODAY’S RESULT' : 'PLAY TODAY'}
          variant="gold"
          onPress={() => navigate({ name: 'daily' })}
        />
        {streak && streak.current > 0 ? (
          <UIText style={styles.streak}>
            🔥 {streak.current}-day streak · best {streak.max}
          </UIText>
        ) : null}
      </Card>

      <View style={styles.modes}>
        <ModeButton
          title="THE GAUNTLET"
          blurb="Run-based levels, targets, and the Vault. Where the appetite lives."
          onPress={() => navigate({ name: 'gauntlet' })}
        />
        <ModeButton
          title="ENDLESS"
          blurb="No ceiling. Chase the deepest level you can survive."
          onPress={() => navigate({ name: 'endless' })}
        />
      </View>

      <View style={styles.footer}>
        <Button label="STATS & STREAKS" variant="ghost" small onPress={() => navigate({ name: 'stats' })} />
        <Button label="HOW TO PLAY" variant="ghost" small onPress={() => navigate({ name: 'how' })} />
        <Button label="SETTINGS" variant="ghost" small onPress={() => navigate({ name: 'settings' })} />
      </View>
    </Screen>
  );
}

function ModeButton({ title, blurb, onPress }: { title: string; blurb: string; onPress: () => void }) {
  return (
    <Card style={styles.modeCard}>
      <UIText style={styles.modeTitle}>{title}</UIText>
      <UIText style={styles.modeBlurb}>{blurb}</UIText>
      <Button label="ENTER" variant="primary" small onPress={onPress} style={styles.modeBtn} />
    </Card>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginTop: SPACE.xl, marginBottom: SPACE.md, gap: SPACE.xs },
  wordmark: { fontSize: 64, letterSpacing: 8, color: COLORS.gold },
  tagline: { color: COLORS.muted, fontFamily: FONTS.display, fontStyle: 'italic', fontSize: 15 },
  dailyCard: { gap: SPACE.md, borderColor: COLORS.goldDim },
  dailyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dailyLabel: { color: COLORS.gold, letterSpacing: 3, fontWeight: '700', fontSize: 13 },
  dailyNum: { color: COLORS.muted, fontSize: 15 },
  dailyBlurb: { color: COLORS.bone, fontSize: 14, lineHeight: 20 },
  streak: { color: COLORS.goldHi, textAlign: 'center', fontSize: 13 },
  modes: { gap: SPACE.md },
  modeCard: { gap: SPACE.sm },
  modeTitle: { color: COLORS.bone, letterSpacing: 2, fontWeight: '700', fontSize: 15 },
  modeBlurb: { color: COLORS.muted, fontSize: 13, lineHeight: 18 },
  modeBtn: { alignSelf: 'flex-start', marginTop: SPACE.xs },
  footer: { gap: SPACE.sm, marginTop: SPACE.sm },
});
