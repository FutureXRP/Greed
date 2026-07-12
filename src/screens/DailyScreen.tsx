import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { Button, Card, Loading, Mono, UIText } from '../components/ui';
import { DraftView } from '../components/DraftView';
import { SpellView } from '../components/SpellView';
import { ReportView } from '../components/ReportView';
import { useHand } from '../components/useHand';
import { COLORS, SPACE } from '../theme';
import { useApp } from '../AppContext';
import { generateStream, dailySeedString, DAILY_GEN } from '../engine/generate';
import { DEFAULT_CONFIG } from '../engine/gameMachine';
import { buildReport } from '../game/report';
import { dailyShareText } from '../game/share';
import { shareText } from '../game/shareActions';
import { HandResult } from '../engine/types';
import {
  getDaily,
  saveDaily,
  recordStreakPlay,
  localPercentile,
  StreakState,
  StoredDaily,
} from '../storage';

export function DailyScreen() {
  const { dict, settings, today, dayNum } = useApp();
  const seed = useMemo(() => dailySeedString(today), [today]);
  const gen = useMemo(() => generateStream(seed, dict, DAILY_GEN), [seed, dict]);
  const stream = gen.letters;

  const hand = useHand(stream, DEFAULT_CONFIG);
  const [result, setResult] = useState<HandResult | null>(null);
  const [percentile, setPercentile] = useState<number | null>(null);
  const [streak, setStreak] = useState<StreakState | null>(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);

  // On mount: if today was already played, show the stored result (locked).
  useEffect(() => {
    (async () => {
      const prior = await getDaily(dayNum);
      if (prior) {
        setResult(storedToResult(prior));
        setPercentile(prior.percentile ?? null);
        setLocked(true);
      }
      setLoading(false);
    })();
  }, [dayNum]);

  async function finish(word: string | null) {
    const r = buildReport({ state: hand.state, dict, word });
    setResult(r);
    const pct = await localPercentile(dayNum, r.score, r.godScore);
    setPercentile(pct);
    const stored: StoredDaily = {
      dayNum,
      word: r.word,
      score: r.score,
      heldBestWord: r.heldBestWord,
      heldBestScore: r.heldBestScore,
      godWord: r.godWord,
      godScore: r.godScore,
      decisions: r.decisions,
      fates: r.fates,
      epitaph: r.epitaph,
      percentile: pct,
    };
    await saveDaily(stored);
    setStreak(await recordStreakPlay(dayNum));
  }

  async function onShare() {
    if (!result) return;
    let text = dailyShareText(dayNum, result);
    if (percentile != null) text += `\nBeat ${percentile}% of players today.`;
    await shareText(text);
  }

  if (loading) return <Screen title="GREED"><Loading label="Shuffling the bag…" /></Screen>;

  // Report (either fresh or locked)
  if (result) {
    return (
      <Screen title="GREED" subtitle={`The Daily · № ${dayNum}`}>
        <ReportView
          result={result}
          stream={stream}
          reducedMotion={settings.reducedMotion || locked}
          extraStat={
            percentile != null ? (
              <Card style={styles.pctCard}>
                <Mono style={styles.pctBig}>Beat {percentile}%</Mono>
                <UIText style={styles.pctLabel}>of players today</UIText>
              </Card>
            ) : null
          }
        />
        {streak ? (
          <UIText style={styles.streakLine}>🔥 {streak.current}-day streak · best {streak.max}</UIText>
        ) : null}
        {locked ? <UIText style={styles.lockedLine}>You’ve played today. Come back tomorrow.</UIText> : null}
        <Button label="SHARE" variant="gold" onPress={onShare} />
      </Screen>
    );
  }

  // Draft / Spell
  return (
    <Screen title="GREED" subtitle={`The Daily · № ${dayNum}`}>
      {hand.state.phase === 'draft' ? (
        <DraftView
          state={hand.state}
          onKeep={hand.keep}
          onPass={hand.pass}
          extras={{ haptics: settings.haptics, reducedMotion: settings.reducedMotion }}
        />
      ) : (
        <SpellView
          state={hand.state}
          dict={dict}
          onToggle={hand.toggle}
          onBackspace={hand.backspace}
          onClear={hand.clear}
          onSubmit={(w) => finish(w)}
          onFold={() => finish(null)}
        />
      )}
    </Screen>
  );
}

function storedToResult(s: StoredDaily): HandResult {
  return {
    word: s.word,
    score: s.score,
    heldBestWord: s.heldBestWord,
    heldBestScore: s.heldBestScore,
    godWord: s.godWord,
    godScore: s.godScore,
    decisions: s.decisions,
    fates: s.fates,
    epitaph: s.epitaph,
  };
}

const styles = StyleSheet.create({
  pctCard: { alignItems: 'center', paddingVertical: SPACE.sm, borderColor: COLORS.goldDim },
  pctBig: { color: COLORS.goldHi, fontSize: 30, fontWeight: '700' },
  pctLabel: { color: COLORS.muted, fontSize: 12, letterSpacing: 1 },
  streakLine: { color: COLORS.goldHi, textAlign: 'center', fontSize: 14 },
  lockedLine: { color: COLORS.muted, textAlign: 'center', fontSize: 13, fontStyle: 'italic' },
});
