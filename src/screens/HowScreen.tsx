import React from 'react';
import { StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { Card, UIText } from '../components/ui';
import { COLORS, SPACE } from '../theme';
import { useApp } from '../AppContext';

export function HowScreen() {
  const { back } = useApp();
  return (
    <Screen title="HOW TO PLAY" onBack={back}>
      <Step n="1" title="The Draft">
        Sixteen letters arrive one at a time. For each, you choose: KEEP it into one of your seven
        rack slots, or PASS it gone forever. You never see what’s coming next.
      </Step>
      <Step n="2" title="The Squeeze">
        Pass too much and the stream punishes you: when the letters left exactly equal your open
        slots, they’re all forced in — marked in loss-red. Greed cuts both ways.
      </Step>
      <Step n="3" title="Cash Out">
        Spell one word, 3–7 letters, from your rack. Longer words multiply hard (×6 at seven
        letters). Or FOLD for zero — sometimes the wise play.
      </Step>
      <Step n="4" title="The Reckoning">
        Every hand shows you the best word you were holding, the god-line (the best possible from
        the whole stream), and exactly which letters you spurned. Regret, quantified.
      </Step>
      <Card style={styles.tip}>
        <UIText style={styles.tipText}>
          The Daily is one shared stream for everyone, once per day. The Gauntlet is a run of
          escalating targets with a shop and house rules. Endless has no ceiling.
        </UIText>
      </Card>
    </Screen>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <Card style={styles.step}>
      <UIText style={styles.stepTitle}>
        <UIText style={styles.stepNum}>{n}. </UIText>
        {title}
      </UIText>
      <UIText style={styles.stepBody}>{children}</UIText>
    </Card>
  );
}

const styles = StyleSheet.create({
  step: { gap: SPACE.xs },
  stepTitle: { color: COLORS.gold, fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  stepNum: { color: COLORS.goldHi },
  stepBody: { color: COLORS.bone, fontSize: 14, lineHeight: 20 },
  tip: { backgroundColor: COLORS.feltHi, borderColor: COLORS.line },
  tipText: { color: COLORS.muted, fontSize: 13, lineHeight: 19 },
});
