# GREED — iOS & Android app

**Keep seven. Regret the rest.**

A daily push-your-luck word game. Letters arrive one at a time; you KEEP or PASS
each into a seven-slot rack, then spell one word. Greed is punished in public and
every hand ends with a shareable tragedy.

This is the native mobile app (iOS + Android), built with **Expo / React Native**
and TypeScript. The game engine is pure and isomorphic, ported from the design
bible in [`Build.md`](./Build.md).

---

## Run it

```bash
npm install
npm start            # Expo dev server — scan the QR with Expo Go
npm run ios          # iOS simulator (macOS)
npm run android      # Android emulator/device
```

Verify the codebase without a device:

```bash
npm test             # 39 engine + integration tests (Jest)
npm run typecheck    # tsc --noEmit, zero errors
npx expo export --platform ios       # produces a Metro bundle
npx expo export --platform android
```

### Native builds (App Store / Play Store)

Use EAS (no local Xcode/Android Studio needed for cloud builds):

```bash
npm i -g eas-cli
eas build --platform ios
eas build --platform android
```

`app.json` already sets the bundle identifiers (`com.passagelab.greed`), the dark
UI style, icons, and splash.

---

## What's implemented

| Area | Status |
|---|---|
| **The Daily** | ✅ One shared seeded stream per day, one attempt, locked after play |
| The Draft (KEEP/PASS, forced-fill punishment) | ✅ |
| Spell phase (dictionary + rack validation, live score) | ✅ |
| The Agony Engine report (best-held, god-line, greed meter, stream fates, epitaph) | ✅ |
| Emoji share (frozen `MINE / HELD / GOD` format) | ✅ |
| Streaks, local stats & history, local "beat X%" percentile | ✅ |
| **The Gauntlet** — targets, 3 busts, coin economy, the Vault shop (all 6 items) | ✅ |
| House Rules — all 9 modifiers (Vowel Tax, Short Squeeze, Cursed Tile, Inflation, Blackout, Speed Round, Double Down, Tight/Loose Stream) | ✅ |
| **Endless** — flattening curve after level 20, full modifier pool from level 8 | ✅ |
| Haptics, tile-flip / count-up / meter animations, reduced-motion support | ✅ |
| How-to-play, settings | ✅ |

### Deferred (server-dependent — see `Build.md` §7–9)

The design targets Supabase for accounts, cross-device streaks, the **global**
percentile, edge-function anti-cheat replay, and leaderboards. This build ships
the entire game loop **client-side and offline** (as the spec's "client-first"
architecture allows), with local persistence standing in for the server. The
pure engine in `src/engine/` is exactly what a Supabase Edge Function would run
to validate submissions, so wiring the backend later is additive.

---

## Architecture

```
index.ts                 # Expo entry (registerRootComponent)
App.tsx                  # dictionary-load gate, nav stack, providers
assets/words37.txt       # YAWL ∪ ENABLE, 3–7 letters (~72k words, no proper nouns)
                         # + Coinage Engine (src/engine/coinage.ts): rule-formed
                         #   coinages accepted automatically — no manual curation
src/
  engine/                # PURE & ISOMORPHIC — no React, no DOM
    rng.ts               #   xmur3 → mulberry32 (frozen seedv1)
    bag.ts               #   98-tile Scrabble bag, deterministic draw
    score.ts             #   letter values, length multipliers, modifier config
    dictionary.ts        #   Set + precomputed letter histograms
    solver.ts            #   best-word-from-pool (god-line / best-held)
    generate.ts          #   seeded stream + fairness guards
    gameMachine.ts       #   draft → spell state machine (forced-fill, fates)
    types.ts
    dictionaryLoader.ts  #   RN asset loader (expo-asset/file-system)
  game/                  # report (Agony Engine), epitaphs, share format
  gauntlet/              # targets, modifiers, shop, per-level run setup
  config/tuning.ts       # ALL non-frozen constants
  components/            # Tile, Rack, Draft, Spell, Report, GreedMeter, …
  screens/               # Home, Daily, Gauntlet/Endless, Stats, Settings, How
  storage.ts             # AsyncStorage persistence
tests/                   # Jest — determinism, forced-fill, solver, scoring, integration
```

The `src/engine/` modules are frozen to **seedv1**: the RNG, bag, generation
guards, seed string (`GREED-YYYY-M-D`), and Day-1 epoch (2026-07-01) must not
change, or the global Daily desynchronizes. See `Build.md` §10.

## Tests

39 passing tests cover RNG determinism, the 98-tile bag, the score table and all
modifier scoring, the solver, generation guards, forced-fill edge cases, the
epitaph priority chain, the share format, Gauntlet target curves, and a full
integration playthrough of a real daily seed.
