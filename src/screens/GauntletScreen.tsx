import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Screen } from '../components/Screen';
import { Button, Card, Mono, UIText } from '../components/ui';
import { ReportView } from '../components/ReportView';
import { LevelHand } from '../components/LevelHand';
import { COLORS, SPACE, FONTS } from '../theme';
import { useApp } from '../AppContext';
import { GameState } from '../engine/types';
import { buildReport } from '../game/report';
import { runShareText } from '../game/share';
import { shareText } from '../game/shareActions';
import { setupLevel, makeRandomTail, LevelSetup, RunMode } from '../gauntlet/run';
import { coinFromSurplus, levelTarget } from '../gauntlet/targets';
import { rollShop, ShopItem, makeInventory, Inventory, ShopItemId } from '../gauntlet/shop';
import { DIFFICULTIES, DIFFICULTY_ORDER, DifficultyConfig } from '../gauntlet/difficulty';
import { saveRun } from '../storage';

type Stage = 'difficulty' | 'intro' | 'hand' | 'result' | 'shop' | 'over';

interface HandOutcome {
  reportWord: string | null;
  reportScore: number;
  heldBestWord: string | null;
  heldBestScore: number;
  godWord: string | null;
  godScore: number;
  fates: GameState['fates'];
  epitaph: string;
  stream: string[];
  target: number;
  finalScore: number;
  hit: boolean;
  coinGained: number;
  cursedPenalty: number;
  doubled: boolean;
}

const MARK_LETTERS = ['S', 'E', 'A', 'R', 'T', 'N', 'O', 'L', 'D', 'J', 'Q', 'X', 'Z', 'K'];

export function GauntletScreen({ mode }: { mode: RunMode }) {
  const { dict, settings, back } = useApp();
  const runSeed = useMemo(
    () => `RUN-${mode}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    [mode],
  );

  const [stage, setStage] = useState<Stage>('difficulty');
  const [difficulty, setDifficulty] = useState<DifficultyConfig | null>(null);
  const [level, setLevel] = useState(1);
  const [busts, setBusts] = useState(0);
  const [coin, setCoin] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [inv, setInv] = useState<Inventory>(makeInventory);
  const [prevBrutal, setPrevBrutal] = useState(false);
  const [runBest, setRunBest] = useState<{ word: string | null; score: number }>({ word: null, score: 0 });

  const [setup, setSetup] = useState<LevelSetup | null>(null);
  const [armed, setArmed] = useState<{ peek: boolean; eighth: boolean; burn: boolean; die: boolean; marked: string | null }>(
    { peek: false, eighth: false, burn: false, die: false, marked: null },
  );
  const [doubleDown, setDoubleDown] = useState(false);
  const [outcome, setOutcome] = useState<HandOutcome | null>(null);
  const [shop, setShop] = useState<ShopItem[]>([]);
  const [bought, setBought] = useState<Set<number>>(new Set());

  // Start the run once a difficulty is chosen.
  function chooseDifficulty(d: DifficultyConfig) {
    setDifficulty(d);
    setCoin(d.startCoin);
    setInv(makeInventory(d.startItems));
    setBusts(0);
    setLevel(1);
    setTotalScore(0);
    setPrevBrutal(false);
    setRunBest({ word: null, score: 0 });
    setSetup(setupLevel({ mode, level: 1, runSeed, dict, difficulty: d, prevBrutal: false, eighthSlot: false }));
    setArmed({ peek: false, eighth: false, burn: false, die: false, marked: null });
    setDoubleDown(false);
    setStage('intro');
  }

  function beginLevel(nextLevel: number) {
    if (!difficulty) return;
    setSetup(setupLevel({ mode, level: nextLevel, runSeed, dict, difficulty, prevBrutal, eighthSlot: false }));
    setArmed({ peek: false, eighth: false, burn: false, die: false, marked: null });
    setDoubleDown(false);
    setLevel(nextLevel);
    setStage('intro');
  }

  function armItem(id: ShopItemId) {
    if (inv[id] <= 0) return;
    if (id === 'peek') setArmed((a) => ({ ...a, peek: true }));
    else if (id === 'eighthSlot') setArmed((a) => ({ ...a, eighth: true }));
    else if (id === 'burn') setArmed((a) => ({ ...a, burn: true }));
    else if (id === 'loadedDie') setArmed((a) => ({ ...a, die: true }));
    else if (id === 'markedCard') setArmed((a) => ({ ...a, marked: a.marked ?? 'S' }));
    setInv((v) => ({ ...v, [id]: v[id] - 1 }));
  }

  const effectiveTarget = setup ? (doubleDown ? Math.round(setup.target * 1.5) : setup.target) : 0;

  function onHandDone(word: string | null, state: GameState) {
    if (!setup) return;
    const report = buildReport({ state, dict, word, cfg: setup.scoreConfig });
    const cursedKept = setup.cursedIndex != null && state.rack.some((r) => r.from === setup.cursedIndex);
    const cursedPenalty = cursedKept ? 15 : 0;
    const finalScore = Math.max(0, report.score - cursedPenalty);
    const hit = finalScore >= effectiveTarget;
    const perSurplus = difficulty?.coinPerSurplus ?? 4;
    const coinGained = hit ? coinFromSurplus(finalScore, effectiveTarget, perSurplus) * (doubleDown ? 2 : 1) : 0;

    setTotalScore((t) => t + finalScore);
    if (report.word && report.score > runBest.score) setRunBest({ word: report.word, score: report.score });

    let nextBusts = busts;
    if (hit) {
      setCoin((c) => c + coinGained);
    } else {
      const bustAdd = doubleDown ? 2 : 1;
      if (inv.insurance > 0) {
        setInv((v) => ({ ...v, insurance: v.insurance - 1 }));
      } else {
        nextBusts = busts + bustAdd;
        setBusts(nextBusts);
      }
    }
    setPrevBrutal(setup.modifier?.brutal ?? false);

    setOutcome({
      reportWord: report.word,
      reportScore: report.score,
      heldBestWord: report.heldBestWord,
      heldBestScore: report.heldBestScore,
      godWord: report.godWord,
      godScore: report.godScore,
      fates: report.fates,
      epitaph: report.epitaph,
      stream: setup.stream,
      target: effectiveTarget,
      finalScore,
      hit,
      coinGained,
      cursedPenalty,
      doubled: doubleDown,
    });
    setStage('result');
  }

  function afterResult() {
    const maxBusts = difficulty?.maxBusts ?? 3;
    if (busts >= maxBusts) {
      saveRun({
        mode,
        levelReached: level,
        totalScore,
        bestWord: runBest.word,
        bestWordScore: runBest.score,
        at: Date.now(),
      });
      setStage('over');
    } else {
      setShop(rollShop(() => Math.random(), 3));
      setBought(new Set());
      setStage('shop');
    }
  }

  function buy(item: ShopItem, index: number) {
    if (coin < item.cost || bought.has(index)) return;
    setCoin((c) => c - item.cost);
    setInv((v) => ({ ...v, [item.id]: v[item.id] + 1 }));
    setBought((b) => new Set(b).add(index));
  }

  const title = mode === 'endless' ? 'ENDLESS' : 'THE GAUNTLET';
  const maxBusts = difficulty?.maxBusts ?? 3;

  // ---- Difficulty select (first stage) ----
  if (stage === 'difficulty' || !difficulty) {
    return (
      <Screen title={title} subtitle="Choose your tier" onBack={back}>
        <UIText style={styles.dim}>
          {mode === 'endless' ? 'No ceiling — how hard should the climb be?' : 'Runs scale to 100 levels. Pick your poison.'}
        </UIText>
        {DIFFICULTY_ORDER.map((id) => {
          const d = DIFFICULTIES[id];
          return (
            <Card key={id} style={styles.diffCard}>
              <View style={styles.diffTop}>
                <UIText style={styles.diffName}>{d.name}</UIText>
                <Mono style={styles.diffTargets}>
                  L1 {levelTarget(1, d)} · L25 {levelTarget(25, d)} · L50 {levelTarget(50, d)}
                </Mono>
              </View>
              <UIText style={styles.diffBlurb}>{d.blurb}</UIText>
              <View style={styles.diffMeta}>
                <UIText style={styles.diffMetaText}>{d.maxBusts} busts</UIText>
                <UIText style={styles.diffMetaText}>{d.startCoin}◈ to start</UIText>
                <UIText style={styles.diffMetaText}>rules from L{d.modifierStartLevel}</UIText>
              </View>
              <Button label={`PLAY ${d.name.toUpperCase()}`} variant="gold" small onPress={() => chooseDifficulty(d)} style={styles.diffBtn} />
            </Card>
          );
        })}
      </Screen>
    );
  }

  // ---- Render per stage ----
  const statusBar = (
    <View style={styles.status}>
      <StatusPill label="LEVEL" value={`${level}`} />
      <StatusPill label="COIN" value={`${coin}`} gold />
      <StatusPill label="BUSTS" value={`${busts}/${maxBusts}`} danger={busts > 0} />
      <StatusPill label="TOTAL" value={`${totalScore}`} />
    </View>
  );

  if (!setup) return <Screen title={title} onBack={back}><UIText style={styles.dim}>Loading…</UIText></Screen>;

  if (stage === 'intro') {
    return (
      <Screen title={title} subtitle={`${difficulty.name} · Level ${level}`} onBack={back}>
        {statusBar}
        <Card style={styles.targetCard}>
          <UIText style={styles.targetLabel}>TARGET</UIText>
          <Mono style={styles.targetValue}>{effectiveTarget}</Mono>
          {doubleDown ? <UIText style={styles.ddNote}>Double Down: 1.5× target, 2× reward, 2× bust</UIText> : null}
        </Card>

        {setup.modifier ? (
          <Card style={styles.modCard}>
            <UIText style={styles.modName}>HOUSE RULE · {setup.modifier.name}</UIText>
            <UIText style={styles.modBlurb}>{setup.modifier.blurb}</UIText>
          </Card>
        ) : (
          <UIText style={styles.dim}>No house rule this level. Play clean.</UIText>
        )}

        {setup.doubleDownAvailable ? (
          <Button
            label={doubleDown ? 'DOUBLE DOWN: ON' : 'DOUBLE DOWN?'}
            variant={doubleDown ? 'gold' : 'ghost'}
            small
            onPress={() => setDoubleDown((d) => !d)}
          />
        ) : null}

        <InventoryBar inv={inv} armed={armed} onArm={armItem} />
        {armed.marked != null ? (
          <MarkPicker value={armed.marked} onPick={(l) => setArmed((a) => ({ ...a, marked: l }))} />
        ) : null}

        <Button label="DEAL" variant="gold" onPress={() => setStage('hand')} />
      </Screen>
    );
  }

  if (stage === 'hand') {
    const config = { ...setup.config, rackSize: armed.eighth ? 8 : setup.config.rackSize };
    return (
      <Screen title={title} subtitle={`Level ${level} · target ${effectiveTarget}`} onBack={back}>
        {statusBar}
        <LevelHand
          key={`${level}-${armed.eighth}`}
          stream={setup.stream}
          config={config}
          dict={dict}
          cfg={setup.scoreConfig}
          extras={{
            cursedIndex: setup.cursedIndex,
            peekAhead: armed.peek ? 2 : 0,
            markedLetter: armed.marked,
            decisionSeconds: setup.decisionSeconds,
            hideValues: setup.hideValues,
            canBurn: armed.burn,
            loadedDie: armed.die,
            haptics: settings.haptics,
            reducedMotion: settings.reducedMotion,
            makeTail: makeRandomTail,
          }}
          onSubmit={onHandDone}
          onFold={(state) => onHandDone(null, state)}
        />
      </Screen>
    );
  }

  if (stage === 'result' && outcome) {
    return (
      <Screen title={title} subtitle={`Level ${level}`} onBack={back}>
        <ReportView
          result={{
            word: outcome.reportWord,
            score: outcome.reportScore,
            heldBestWord: outcome.heldBestWord,
            heldBestScore: outcome.heldBestScore,
            godWord: outcome.godWord,
            godScore: outcome.godScore,
            decisions: '',
            fates: outcome.fates,
            epitaph: outcome.epitaph,
          }}
          stream={outcome.stream}
          reducedMotion={settings.reducedMotion}
          extraStat={
            <Card style={[styles.verdictCard, outcome.hit ? styles.hitCard : styles.bustCard]}>
              <Mono style={[styles.verdictBig, { color: outcome.hit ? COLORS.win : COLORS.lossHi }]}>
                {outcome.finalScore} / {outcome.target}
              </Mono>
              <UIText style={[styles.verdictLabel, { color: outcome.hit ? COLORS.win : COLORS.lossHi }]}>
                {outcome.hit ? 'TARGET CLEARED' : 'BUST'}
              </UIText>
              {outcome.cursedPenalty > 0 ? (
                <UIText style={styles.penalty}>−{outcome.cursedPenalty} cursed tile</UIText>
              ) : null}
              {outcome.hit && outcome.coinGained > 0 ? (
                <UIText style={styles.coinGain}>+{outcome.coinGained} coin</UIText>
              ) : null}
            </Card>
          }
        />
        <Button
          label={busts >= maxBusts ? 'THE HOUSE COLLECTS' : outcome.hit ? 'TO THE VAULT' : 'PRESS ON'}
          variant="gold"
          onPress={afterResult}
        />
      </Screen>
    );
  }

  if (stage === 'shop') {
    return (
      <Screen title="THE VAULT" subtitle={`${coin} coin`} onBack={back}>
        {statusBar}
        <UIText style={styles.dim}>Buy what you can carry. Coin resets when the run ends.</UIText>
        {shop.map((item, i) => (
          <Card key={i} style={styles.shopItem}>
            <View style={styles.shopText}>
              <UIText style={styles.shopName}>{item.name}</UIText>
              <UIText style={styles.shopEffect}>{item.effect}</UIText>
            </View>
            <Button
              label={bought.has(i) ? 'BOUGHT' : `${item.cost}◈`}
              variant={bought.has(i) ? 'ghost' : coin >= item.cost ? 'gold' : 'ghost'}
              small
              disabled={bought.has(i) || coin < item.cost}
              onPress={() => buy(item, i)}
            />
          </Card>
        ))}
        <Button label="NEXT LEVEL" variant="primary" onPress={() => beginLevel(level + 1)} />
      </Screen>
    );
  }

  // Game over — run report
  return (
    <Screen title={title} subtitle="The house collects." onBack={back}>
      <View style={styles.overHero}>
        <Mono style={styles.overLevel}>LEVEL {level}</Mono>
        <UIText style={styles.overSub}>{mode === 'endless' ? 'deepest reached' : 'run ended'}</UIText>
      </View>
      <View style={styles.status}>
        <StatusPill label="TOTAL SCORE" value={`${totalScore}`} />
        <StatusPill label="BEST WORD" value={runBest.word ?? '—'} gold />
        <StatusPill label="BEST SCORE" value={`${runBest.score}`} />
      </View>
      <Card style={styles.epitaphCard}>
        <UIText style={styles.overEpitaph}>
          {runBest.word
            ? `Your ${runBest.word} carried you to level ${level}. The rest was appetite.`
            : `No word survived to level ${level}. The house thanks you for playing.`}
        </UIText>
      </Card>
      <Button
        label="SHARE"
        variant="gold"
        onPress={() =>
          shareText(
            runShareText({
              mode,
              levelReached: level,
              totalScore,
              bestWord: runBest.word,
              bestWordScore: runBest.score,
            }),
          )
        }
      />
      <Button label="HOME" variant="ghost" onPress={back} />
    </Screen>
  );
}

function StatusPill({ label, value, gold, danger }: { label: string; value: string; gold?: boolean; danger?: boolean }) {
  return (
    <View style={styles.pill}>
      <Mono style={[styles.pillValue, gold && { color: COLORS.goldHi }, danger && { color: COLORS.lossHi }]}>{value}</Mono>
      <UIText style={styles.pillLabel}>{label}</UIText>
    </View>
  );
}

function InventoryBar({
  inv,
  armed,
  onArm,
}: {
  inv: Inventory;
  armed: { peek: boolean; eighth: boolean; burn: boolean; die: boolean; marked: string | null };
  onArm: (id: ShopItemId) => void;
}) {
  const items: { id: ShopItemId; label: string; on: boolean }[] = [
    { id: 'peek', label: `Peek ×${inv.peek}`, on: armed.peek },
    { id: 'burn', label: `Burn ×${inv.burn}`, on: armed.burn },
    { id: 'eighthSlot', label: `8th ×${inv.eighthSlot}`, on: armed.eighth },
    { id: 'markedCard', label: `Mark ×${inv.markedCard}`, on: armed.marked != null },
    { id: 'loadedDie', label: `Die ×${inv.loadedDie}`, on: armed.die },
    { id: 'insurance', label: `Insure ×${inv.insurance}`, on: false },
  ];
  const owned = items.filter((it) => inv[it.id] > 0 || it.on);
  if (owned.length === 0) return <UIText style={styles.dim}>Empty pockets. Clear the target to earn coin.</UIText>;
  return (
    <View>
      <UIText style={styles.invLabel}>YOUR ITEMS — tap to arm for this hand</UIText>
      <View style={styles.invRow}>
        {owned.map((it) => (
          <Pressable
            key={it.id}
            onPress={() => it.id !== 'insurance' && onArm(it.id)}
            style={[styles.invChip, it.on && styles.invChipOn]}
          >
            <UIText style={[styles.invChipText, it.on && styles.invChipTextOn]}>{it.label}</UIText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function MarkPicker({ value, onPick }: { value: string; onPick: (l: string) => void }) {
  return (
    <View>
      <UIText style={styles.invLabel}>MARK A LETTER</UIText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.markRow}>
        {MARK_LETTERS.map((l) => (
          <Pressable key={l} onPress={() => onPick(l)} style={[styles.markChip, value === l && styles.markChipOn]}>
            <Mono style={[styles.markText, value === l && { color: COLORS.ink }]}>{l}</Mono>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  diffCard: { gap: SPACE.sm, borderColor: COLORS.goldDim },
  diffTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 4 },
  diffName: { color: COLORS.gold, fontFamily: FONTS.display, fontWeight: '900', fontSize: 20, letterSpacing: 1 },
  diffTargets: { color: COLORS.muted, fontSize: 11 },
  diffBlurb: { color: COLORS.bone, fontSize: 13, lineHeight: 18 },
  diffMeta: { flexDirection: 'row', gap: SPACE.sm, flexWrap: 'wrap' },
  diffMetaText: { color: COLORS.muted, fontSize: 11, letterSpacing: 0.5 },
  diffBtn: { alignSelf: 'flex-start', marginTop: SPACE.xs },
  status: { flexDirection: 'row', gap: SPACE.sm, justifyContent: 'space-between' },
  pill: { flex: 1, alignItems: 'center', backgroundColor: COLORS.felt, borderRadius: 10, borderWidth: 1, borderColor: COLORS.line, paddingVertical: SPACE.sm },
  pillValue: { color: COLORS.bone, fontSize: 16, fontWeight: '700' },
  pillLabel: { color: COLORS.muted, fontSize: 9, letterSpacing: 1, marginTop: 2 },
  dim: { color: COLORS.muted, fontStyle: 'italic', textAlign: 'center', fontSize: 13 },
  targetCard: { alignItems: 'center', gap: 2, borderColor: COLORS.goldDim },
  targetLabel: { color: COLORS.gold, letterSpacing: 3, fontSize: 12, fontWeight: '700' },
  targetValue: { color: COLORS.goldHi, fontSize: 44, fontWeight: '700' },
  ddNote: { color: COLORS.lossHi, fontSize: 11, textAlign: 'center' },
  modCard: { gap: 4, borderColor: COLORS.loss },
  modName: { color: COLORS.lossHi, letterSpacing: 1, fontWeight: '700', fontSize: 13 },
  modBlurb: { color: COLORS.bone, fontSize: 14, lineHeight: 19 },
  invLabel: { color: COLORS.muted, fontSize: 10, letterSpacing: 1, marginBottom: SPACE.xs },
  invRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.xs },
  invChip: { paddingVertical: 6, paddingHorizontal: SPACE.sm, borderRadius: 999, borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.felt },
  invChipOn: { backgroundColor: COLORS.gold, borderColor: COLORS.goldHi },
  invChipText: { color: COLORS.bone, fontSize: 12 },
  invChipTextOn: { color: COLORS.ink, fontWeight: '700' },
  markRow: { gap: SPACE.xs, paddingVertical: 2 },
  markChip: { width: 34, height: 34, borderRadius: 8, borderWidth: 1, borderColor: COLORS.line, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.felt },
  markChipOn: { backgroundColor: COLORS.gold, borderColor: COLORS.goldHi },
  markText: { color: COLORS.bone, fontSize: 16, fontWeight: '700' },
  verdictCard: { alignItems: 'center', gap: 2, width: '100%' },
  hitCard: { borderColor: COLORS.win },
  bustCard: { borderColor: COLORS.loss },
  verdictBig: { fontSize: 30, fontWeight: '700' },
  verdictLabel: { letterSpacing: 2, fontSize: 12, fontWeight: '700' },
  penalty: { color: COLORS.lossHi, fontSize: 12 },
  coinGain: { color: COLORS.goldHi, fontSize: 13 },
  shopItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACE.md },
  shopText: { flex: 1 },
  shopName: { color: COLORS.gold, fontSize: 15, fontWeight: '700', letterSpacing: 1 },
  shopEffect: { color: COLORS.muted, fontSize: 12, marginTop: 2, lineHeight: 16 },
  overHero: { alignItems: 'center', marginVertical: SPACE.md },
  overLevel: { color: COLORS.gold, fontSize: 40, fontWeight: '700', letterSpacing: 2 },
  overSub: { color: COLORS.muted, letterSpacing: 2, fontSize: 12 },
  epitaphCard: { backgroundColor: COLORS.ink, borderColor: COLORS.goldDim },
  overEpitaph: { fontFamily: FONTS.display, fontStyle: 'italic', color: COLORS.bone, fontSize: 16, textAlign: 'center', lineHeight: 23 },
});
