import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tile } from './Tile';
import { GreedMeter } from './GreedMeter';
import { CountUp } from './CountUp';
import { Card, Divider, Mono, UIText, Display } from './ui';
import { COLORS, FONTS, SPACE } from '../theme';
import { HandResult, Fate } from '../engine/types';

/** The post-hand report — the product. Every hand ends here. */
export function ReportView({
  result,
  stream,
  reducedMotion,
  extraStat,
}: {
  result: HandResult;
  stream: string[];
  reducedMotion?: boolean;
  /** Optional extra stat line (e.g. percentile, target hit). */
  extraStat?: React.ReactNode;
}) {
  const godPct = result.godScore > 0 ? (result.score / result.godScore) * 100 : 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.headline}>
        <UIText style={styles.verdictLabel}>{result.word ? 'YOU PLAYED' : 'YOU FOLDED'}</UIText>
        <Display style={styles.verdictWord}>{result.word ?? '—'}</Display>
        <CountUp value={result.score} reducedMotion={reducedMotion} style={styles.bigScore} />
      </View>

      {extraStat ? <View style={styles.extra}>{extraStat}</View> : null}

      <Card>
        <StatRow
          label="BEST IN YOUR SEVEN"
          word={result.heldBestWord}
          score={result.heldBestScore}
          hint={
            result.word && result.heldBestWord && result.heldBestWord !== result.word
              ? `You held ${result.heldBestWord} and played ${result.word}.`
              : undefined
          }
        />
        <Divider />
        <StatRow label="THE GOD-LINE" word={result.godWord} score={result.godScore} accent />
      </Card>

      <Card>
        <GreedMeter pct={godPct} reducedMotion={reducedMotion} />
      </Card>

      <View>
        <UIText style={styles.streamLabel}>THE STREAM</UIText>
        <View style={styles.streamRow}>
          {stream.map((l, i) => (
            <StreamTile key={i} letter={l} fate={result.fates[i]} />
          ))}
        </View>
        <View style={styles.legend}>
          <Legend swatch={COLORS.gold} text="kept" />
          <Legend swatch={COLORS.muted} text="passed" />
          <Legend swatch={COLORS.loss} text="forced" />
          <Legend swatch={COLORS.line} text="never seen" />
        </View>
      </View>

      <Card style={styles.epitaphCard}>
        <UIText style={styles.epitaph}>{result.epitaph}</UIText>
      </Card>
    </View>
  );
}

function StatRow({
  label,
  word,
  score,
  hint,
  accent,
}: {
  label: string;
  word: string | null;
  score: number;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <View style={styles.statRow}>
      <View style={styles.statLeft}>
        <UIText style={styles.statLabel}>{label}</UIText>
        <Mono style={[styles.statWord, accent && { color: COLORS.goldHi }]}>{word ?? '—'}</Mono>
        {hint ? <UIText style={styles.statHint}>{hint}</UIText> : null}
      </View>
      <Mono style={[styles.statScore, accent && { color: COLORS.goldHi }]}>{score}</Mono>
    </View>
  );
}

const FATE_TONE: Record<Fate, 'gold' | 'forced' | 'ghost' | 'flat'> = {
  kept: 'gold',
  passed: 'flat',
  forced: 'forced',
  unseen: 'ghost',
  pending: 'ghost',
};

function StreamTile({ letter, fate }: { letter: string; fate: Fate }) {
  return (
    <Tile
      letter={letter}
      size={30}
      tone={FATE_TONE[fate]}
      struck={fate === 'passed'}
      dim={fate === 'unseen' || fate === 'passed'}
      hideValue
    />
  );
}

function Legend({ swatch, text }: { swatch: string; text: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, { backgroundColor: swatch }]} />
      <UIText style={styles.legendText}>{text}</UIText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: SPACE.md },
  headline: { alignItems: 'center', gap: 2 },
  verdictLabel: { color: COLORS.muted, letterSpacing: 3, fontSize: 12 },
  verdictWord: { fontSize: 44, letterSpacing: 4, color: COLORS.gold },
  bigScore: { fontSize: 52, color: COLORS.goldHi, fontWeight: '700' },
  extra: { alignItems: 'center' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statLeft: { flex: 1, paddingRight: SPACE.sm },
  statLabel: { color: COLORS.muted, fontSize: 10, letterSpacing: 2 },
  statWord: { fontSize: 20, letterSpacing: 2, color: COLORS.bone },
  statHint: { color: COLORS.muted, fontSize: 11, marginTop: 2, fontStyle: 'italic' },
  statScore: { fontSize: 26, fontWeight: '700', color: COLORS.bone },
  streamLabel: { color: COLORS.muted, fontSize: 10, letterSpacing: 2, marginBottom: SPACE.xs },
  streamRow: { flexDirection: 'row', gap: 3, flexWrap: 'wrap', justifyContent: 'center' },
  legend: { flexDirection: 'row', gap: SPACE.md, justifyContent: 'center', marginTop: SPACE.sm, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendSwatch: { width: 10, height: 10, borderRadius: 2 },
  legendText: { color: COLORS.muted, fontSize: 11 },
  epitaphCard: { backgroundColor: COLORS.ink, borderColor: COLORS.goldDim },
  epitaph: {
    fontFamily: FONTS.display,
    color: COLORS.bone,
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
