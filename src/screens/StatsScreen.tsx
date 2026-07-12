import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { Button, Card, Mono, UIText } from '../components/ui';
import { COLORS, SPACE } from '../theme';
import { useApp } from '../AppContext';
import {
  getStreak,
  getAllDailies,
  getBestRuns,
  StreakState,
  StoredDaily,
  StoredRun,
} from '../storage';

export function StatsScreen() {
  const { navigate } = useApp();
  const [streak, setStreak] = useState<StreakState | null>(null);
  const [dailies, setDailies] = useState<StoredDaily[]>([]);
  const [runs, setRuns] = useState<Record<string, StoredRun>>({});

  useEffect(() => {
    (async () => {
      setStreak(await getStreak());
      setDailies(await getAllDailies());
      setRuns(await getBestRuns());
    })();
  }, []);

  const played = dailies.length;
  const folds = dailies.filter((d) => d.word == null).length;
  const avg = played ? Math.round(dailies.reduce((a, d) => a + d.score, 0) / played) : 0;
  const best = dailies.reduce<StoredDaily | null>((b, d) => (!b || d.score > b.score ? d : b), null);
  const avgGreed =
    played > 0
      ? Math.round(
          (dailies.reduce((a, d) => a + (d.godScore ? d.score / d.godScore : 0), 0) / played) * 100,
        )
      : 0;

  return (
    <Screen title="PROFILE">
      <View style={styles.grid}>
        <Stat label="CURRENT STREAK" value={`${streak?.current ?? 0}`} />
        <Stat label="MAX STREAK" value={`${streak?.max ?? 0}`} />
        <Stat label="DAILIES PLAYED" value={`${played}`} />
        <Stat label="AVG SCORE" value={`${avg}`} />
        <Stat label="BEST DAILY" value={`${best?.score ?? 0}`} />
        <Stat label="AVG GREED" value={`${avgGreed}%`} />
      </View>

      <Card>
        <UIText style={styles.sectionTitle}>BEST RUNS</UIText>
        {runs.gauntlet ? (
          <RunLine label="Gauntlet" run={runs.gauntlet} />
        ) : (
          <UIText style={styles.empty}>No Gauntlet run yet.</UIText>
        )}
        {runs.endless ? (
          <RunLine label="Endless" run={runs.endless} />
        ) : (
          <UIText style={styles.empty}>No Endless run yet.</UIText>
        )}
      </Card>

      <Card>
        <UIText style={styles.sectionTitle}>HISTORY</UIText>
        {dailies.length === 0 ? (
          <UIText style={styles.empty}>Play the Daily to start your history.</UIText>
        ) : (
          dailies
            .slice()
            .reverse()
            .slice(0, 20)
            .map((d) => (
              <View key={d.dayNum} style={styles.histRow}>
                <Mono style={styles.histDay}>№ {d.dayNum}</Mono>
                <Mono style={styles.histWord}>{d.word ?? 'FOLD'}</Mono>
                <Mono style={styles.histScore}>
                  {d.score} / {d.godScore}
                </Mono>
              </View>
            ))
        )}
        {folds > 0 ? <UIText style={styles.foldNote}>{folds} fold{folds === 1 ? '' : 's'} on record.</UIText> : null}
      </Card>

      <Button label="SETTINGS" variant="primary" onPress={() => navigate({ name: 'settings' })} />
      <Button label="HOW TO PLAY" variant="primary" onPress={() => navigate({ name: 'how' })} />
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card style={styles.statCard}>
      <Mono style={styles.statValue}>{value}</Mono>
      <UIText style={styles.statLabel}>{label}</UIText>
    </Card>
  );
}

function RunLine({ label, run }: { label: string; run: StoredRun }) {
  return (
    <View style={styles.histRow}>
      <UIText style={styles.runLabel}>{label}</UIText>
      <Mono style={styles.histScore}>
        Lv {run.levelReached} · {run.totalScore} pts
      </Mono>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.sm },
  statCard: { width: '31%', alignItems: 'center', paddingVertical: SPACE.md, gap: 2, flexGrow: 1 },
  statValue: { color: COLORS.goldHi, fontSize: 26, fontWeight: '700' },
  statLabel: { color: COLORS.muted, fontSize: 9, letterSpacing: 1, textAlign: 'center' },
  sectionTitle: { color: COLORS.gold, letterSpacing: 2, fontWeight: '700', fontSize: 13, marginBottom: SPACE.sm },
  empty: { color: COLORS.muted, fontStyle: 'italic', fontSize: 13 },
  histRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
  },
  histDay: { color: COLORS.muted, fontSize: 13, width: 54 },
  histWord: { color: COLORS.bone, fontSize: 14, flex: 1, textAlign: 'center', letterSpacing: 1 },
  histScore: { color: COLORS.goldHi, fontSize: 13 },
  runLabel: { color: COLORS.bone, fontSize: 14 },
  foldNote: { color: COLORS.muted, fontSize: 11, marginTop: SPACE.sm, fontStyle: 'italic' },
});
