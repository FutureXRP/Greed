import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Tile } from './Tile';
import { RackRow } from './RackRow';
import { Button, Mono, UIText } from './ui';
import { COLORS, FONTS, SPACE } from '../theme';
import { GameState } from '../engine/types';
import { openSlots } from '../engine/gameMachine';

export interface DraftExtras {
  hideValues?: boolean; // Blackout
  peekAhead?: number; // Peek: show this many upcoming letters
  markedLetter?: string | null; // Marked Card: highlight if upcoming
  decisionSeconds?: number | null; // Speed Round: timeout = PASS
  cursedIndex?: number | null; // Cursed Tile stream index
  canBurn?: boolean;
  onBurn?: (rackIndex: number) => void;
  haptics?: boolean;
  reducedMotion?: boolean;
}

export function DraftView({
  state,
  onKeep,
  onPass,
  extras = {},
}: {
  state: GameState;
  onKeep: () => void;
  onPass: () => void;
  extras?: DraftExtras;
}) {
  const idx = state.revealIndex;
  const letter = idx < state.stream.length ? state.stream[idx] : '';
  const isCursed = extras.cursedIndex === idx;
  const remaining = state.stream.length - idx;
  const open = openSlots(state);
  const forcedSoon = remaining === open + 1; // next pass could trigger forced fill

  // Tile flip-in animation, re-keyed per reveal.
  const anim = useRef(new Animated.Value(extras.reducedMotion ? 1 : 0)).current;
  useEffect(() => {
    if (extras.reducedMotion) {
      anim.setValue(1);
      return;
    }
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 260, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }).start();
  }, [idx, anim, extras.reducedMotion]);

  const doKeep = () => {
    if (extras.haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onKeep();
  };
  const doPass = () => {
    if (extras.haptics) Haptics.selectionAsync().catch(() => {});
    onPass();
  };

  // Speed Round timer — restarts each reveal.
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!extras.decisionSeconds || idx >= state.stream.length) {
      setSecondsLeft(null);
      return;
    }
    setSecondsLeft(extras.decisionSeconds);
    const started = Date.now();
    const total = extras.decisionSeconds * 1000;
    const id = setInterval(() => {
      const left = Math.max(0, total - (Date.now() - started));
      setSecondsLeft(Math.ceil(left / 1000));
      if (left <= 0) {
        clearInterval(id);
        doPass(); // timeout = forced PASS
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, extras.decisionSeconds]);

  const upcoming =
    extras.peekAhead && extras.peekAhead > 0
      ? state.stream.slice(idx + 1, idx + 1 + extras.peekAhead)
      : [];

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });
  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['-8deg', '0deg'] });

  return (
    <View style={styles.wrap}>
      <View style={styles.pips}>
        {state.stream.map((_, i) => (
          <View
            key={i}
            style={[
              styles.pip,
              i < idx && styles.pipDone,
              i === idx && styles.pipCurrent,
            ]}
          />
        ))}
      </View>

      <View style={styles.counts}>
        <UIText style={styles.countLabel}>
          Tile {Math.min(idx + 1, state.stream.length)} / {state.stream.length}
        </UIText>
        <UIText style={[styles.countLabel, forcedSoon && styles.warn]}>
          {open} slot{open === 1 ? '' : 's'} open
        </UIText>
      </View>

      <View style={styles.stage}>
        {secondsLeft != null ? (
          <Mono style={[styles.timer, secondsLeft <= 2 && styles.timerLow]}>{secondsLeft}s</Mono>
        ) : null}
        <Animated.View style={{ transform: [{ scale }, { rotate }] }}>
          <Tile
            letter={letter}
            size={110}
            tone={isCursed ? 'cursed' : 'gold'}
            hideValue={extras.hideValues}
          />
        </Animated.View>
        {isCursed ? <UIText style={styles.cursedTag}>CURSED · −15 if kept</UIText> : null}

        {upcoming.length > 0 ? (
          <View style={styles.peekRow}>
            <UIText style={styles.peekLabel}>NEXT</UIText>
            {upcoming.map((l, i) => (
              <Tile
                key={i}
                letter={l}
                size={30}
                tone={extras.markedLetter && l === extras.markedLetter ? 'gold' : 'flat'}
                hideValue={extras.hideValues}
              />
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Button label="PASS" variant="ghost" onPress={doPass} style={styles.action} />
        <Button label="KEEP" variant="gold" onPress={doKeep} style={styles.action} />
      </View>

      <RackRow state={state} tileSize={38} hideValues={extras.hideValues} onTilePress={extras.canBurn ? extras.onBurn : undefined} />
      {extras.canBurn ? <UIText style={styles.burnHint}>Burn active — tap a rack tile to discard it.</UIText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: SPACE.md, alignItems: 'stretch' },
  pips: { flexDirection: 'row', gap: 3, justifyContent: 'center', flexWrap: 'wrap' },
  pip: { width: 12, height: 4, borderRadius: 2, backgroundColor: COLORS.line },
  pipDone: { backgroundColor: COLORS.goldDim },
  pipCurrent: { backgroundColor: COLORS.goldHi, width: 16 },
  counts: { flexDirection: 'row', justifyContent: 'space-between' },
  countLabel: { color: COLORS.muted, fontSize: 12, letterSpacing: 1 },
  warn: { color: COLORS.lossHi },
  stage: { alignItems: 'center', gap: SPACE.sm, minHeight: 200, justifyContent: 'center' },
  timer: { color: COLORS.goldHi, fontSize: 20, fontWeight: '700' },
  timerLow: { color: COLORS.lossHi },
  cursedTag: { color: COLORS.lossHi, fontSize: 11, letterSpacing: 1, fontWeight: '700' },
  peekRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE.xs, marginTop: SPACE.sm },
  peekLabel: { color: COLORS.muted, fontSize: 10, letterSpacing: 2, marginRight: 4 },
  actions: { flexDirection: 'row', gap: SPACE.md },
  action: { flex: 1 },
  burnHint: { color: COLORS.lossHi, fontSize: 11, textAlign: 'center', letterSpacing: 1 },
});
