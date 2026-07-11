# GREED — Build Bible

**Tagline:** Keep seven. Regret the rest.
**One-liner:** A daily push-your-luck word game where the letters come one at a time, greed is punished in public, and every game ends with a shareable tragedy.

**Status:** Validated HTML prototype exists (`prototype/greed.html`) — full daily loop, seeded generation, ENABLE dictionary, solver, tragedy report, emoji share. This document specifies the production app.

---

## 1. Vision

GREED owns one psychological lever no daily word game currently owns: **decision drama**. Wordle is deduction, Connections is sorting, Spelling Bee is generation. GREED is *appetite* — the push-your-luck tension of poker and Deal or No Deal applied to letters. The player's enemy is never the puzzle; it is their own greed, and the game shows them the receipts.

Three modes share one core mechanic:

1. **The Daily** — one shared stream per day for every player on Earth. The ritual. The share loop. The front door.
2. **The Gauntlet** — run-based escalating levels with targets, modifiers, and a between-hand economy. The appetite mode. Where session time lives.
3. **Endless** — the Gauntlet with no ceiling. Leaderboard chasing. The prestige mode.

Design north star: **every hand must produce a story.** A near-miss, a spurned J, a word you were secretly holding. Near-misses, not wins, drive return visits. Every system below is in service of manufacturing high-quality regret.

---

## 2. Core Mechanic — The Draft (all modes)

A stream of letters is revealed **one at a time**. For each letter the player makes a single binary choice:

- **KEEP** — the letter fills one rack slot. Permanent.
- **PASS** — the letter is gone forever. The player never knows what's coming next.

Rules:

- Default geometry: **16-letter stream, 7-slot rack** (Gauntlet modifiers vary this).
- When the rack fills, the draft ends immediately. Unrevealed letters stay unseen (until the report).
- **Forced fill:** when letters remaining == open slots, all remaining letters are forced into the rack, visually marked in loss-red. This is the punishment for over-passing and must *feel* like a punishment (distinct color, sound, haptic).
- After the draft: **spell one word** (3–7 letters) from the rack tiles. Submit ("Cash out") or **Fold** for 0.
- Word must be in the dictionary and formable from the rack multiset.

### Scoring

`score = sum(letter values) × length multiplier`

| Length | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|
| Multiplier | ×1 | ×2 | ×3 | ×4 | ×6 |

Letter values: standard Scrabble (A1 B3 C3 D2 E1 F4 G2 H4 I1 J8 K5 L1 M3 N1 O1 P3 Q10 R1 S1 T1 U1 V4 W4 X8 Y4 Z10).

Letter generation: draw without replacement from the standard Scrabble bag distribution (no blanks, 98 tiles).

**Tuning flags (revisit after telemetry):**
- The ×6 seven-letter jackpot may make length strictly dominant over rare-letter gambling. Watch the meta. Candidate alternative: {3:1, 4:2, 5:3, 6:5, 7:7} or a flat +25 "bingo bonus."
- 16/7 geometry: if forced-fill triggers too rarely (<20% of hands), tighten to 15/7. If players never feel scarcity, the drama dies.

### Generation guards (frozen for Daily — see §10)

- Vowel count in stream must be 4–8; resample with seed attempt suffix otherwise.
- God-line (best possible word from the full 16) must be ≥5 letters; resample otherwise. Guarantees every daily has a satisfying answer.
- Generation attempts loop: `seed = hash(seedStr + "#" + attempt)`, max 80 attempts, deterministic.

---

## 3. Mode 1 — The Daily

- One puzzle per calendar day (player's local date), identical stream for all players. Seed string: `GREED-YYYY-M-D` (unpadded month/day — matches prototype; **frozen as seed scheme v1**).
- Day number: days since **July 1, 2026** (GREED № 1).
- One attempt per day per account. No replays. Scarcity is the product.
- Post-game: full Tragedy Report (§6), emoji share, streak update, and **global percentile** ("Your 54 beat 78% of players today") — this stat is the single highest-leverage retention/share feature in the app. Ship it in P1.
- Streaks: current + max, calendar-day based, timezone = device local. A "played" day counts regardless of score (folding counts — showing up is the streak).

---

## 4. Mode 2 — The Gauntlet (levels)

A **run** is a sequence of hands. Each level = one hand with a **target score**. Hit the target to advance; miss = a **bust**. Three busts ends the run ("The house collects").

### Level targets

`T(n) = round(30 × 1.22^(n−1))` → 30, 37, 45, 54, 66, 81, 99, 120, 147, 179, 218…

Calibration: a competent word (40–80 pts) clears early levels comfortably; from ~level 6 the player needs either long words or rare-letter gambles; from ~level 10 they need shop leverage and modifier synergy. Tune the base and exponent against real play data — these are opening bids.

### The Vault (between-level economy)

Surplus points over target convert to **coin**: `floor(surplus / 5)`. Between hands, the player may buy from a 3-item rotating shop:

| Item | Cost | Effect |
|---|---|---|
| Peek | 3 | See the next 2 letters of the stream before deciding |
| Burn | 5 | Discard one rack tile mid-draft; the slot reopens |
| Eighth Slot | 8 | Rack size 8 for the next hand only (enables 7-letter words with a spare) |
| Marked Card | 6 | One chosen letter (e.g. "S") glows if present in the next 5 stream letters |
| Insurance | 4 | Next bust doesn't count (consumed on use) |
| Loaded Die | 10 | Reroll the entire stream once, mid-draft, keeping your rack |

Shop inventory: 3 random items per visit, prices fixed. Coin carries across levels within a run; resets on new run.

### House Rules (modifiers)

From level 4 onward, each level draws one modifier, shown before the draft begins:

| Modifier | Effect |
|---|---|
| Vowel Tax | Vowels score 0 this hand |
| Short Squeeze | Only words of 5+ letters score |
| Cursed Tile | One stream letter is cursed (marked); if kept, −15 on cash-out |
| Inflation | Target +25%, but length multipliers each +1 |
| Blackout | Letter point values hidden during the draft |
| Speed Round | 5 seconds per keep/pass decision; timeout = forced PASS |
| Double Down | Optional before draft: hit 1.5× target for 2× score → coin; miss = double bust |
| Tight Stream | Stream is 13 letters instead of 16 |
| Loose Stream | Stream is 19 letters; target +15% |

Modifier pool weighted so brutal ones (Vowel Tax, Speed Round) appear less often early. Never two consecutive brutal modifiers.

### Run end

Report shows: deepest level, total cumulative score, best single word of the run, coins earned/spent, and the run's defining tragedy (highest-value passed letter or biggest missed word). Shareable card, same emoji language as the Daily.

---

## 5. Mode 3 — Endless

Identical to Gauntlet with no final level. Target curve continues; modifier pool fully unlocked from level 8; from level 20 the curve flattens to `T(n) = T(20) + 40(n−20)` so deep runs are skill-bounded, not math-bounded.

Leaderboards (Supabase):
- **Deepest level** (all-time + weekly), tiebreak by cumulative score.
- **Daily percentile board** is separate (Daily mode only).
- Handle required for board entry; anonymous play allowed but unranked.

---

## 6. The Agony Engine (post-game report — all modes)

The report is the product. Every hand ends with:

1. **Your word + score** (count-up animation).
2. **Best in your seven** — the top word you were actually holding ("You held SEQUIN and played QUITS").
3. **The god-line** — best possible word from perfect keeps across the full stream.
4. **Greed meter** — your score as % of god-line, animated bar.
5. **The full stream** — all 16 letters shown with per-letter fate: kept (gold), passed (struck through, loss-red slash), forced (red tile), never seen (hollow).
6. **The epitaph** — one generated line of dramatized regret. Priority order (first match wins): folded → perfect game → played-your-best ("the rest was appetite") → held-better ("You were holding X the entire time") → passed a gem ("You passed on the J. It remembers.") → default. Expand the epitaph pool to 20+ lines per category; this is the game's voice. Tone: dry casino noir, never mean.

### Share format (Daily)

```
GREED #11
⬛🟨🟨⬛⬛🟨🟨⬛🟨⬛🟨🟥🟥⬜⬜⬜
MINE 54 · HELD 71 · GOD 120
Keep seven. Regret the rest.
```

🟨 kept · ⬛ passed · 🟥 forced · ⬜ never seen. The three-number line (MINE/HELD/GOD) is the conversation starter — it encodes skill, luck, and greed in one glance. Never change this format casually; it's the brand.

---

## 7. Tech Architecture

Stack: **Next.js (App Router) + Supabase + Vercel** — standard PassageLab stack.

- **Client-first gameplay.** The entire game loop runs client-side (the prototype proves it). Server involvement only for: auth, result submission/validation, percentiles, leaderboards, streak storage.
- **PWA from day one** (manifest, service worker, installable, offline daily via cached dictionary + client seed). App-store wrap later via Capacitor (P5).
- **Dictionary:** ENABLE list filtered to 3–7 letters (51,852 words, prototype has the exact file). Ship as a gzip'd static asset (~150KB over the wire). Load in a **Web Worker**: build the `Set` for validation + precompute per-word letter counts and scores for the solver. Solver (best-word-from-pool) is a linear scan — <100ms, run god-line + best-held in the worker, never on the main thread.
- **Seeded RNG:** xmur3 + mulberry32, exactly as in prototype. **The generation algorithm is versioned (`seedv1`) and frozen once the Daily launches** — any change to bag, guards, RNG, or seed string desynchronizes the global daily. Changes require a `seedv2` cutover on a known day number.
- **State:** React state + a small reducer for the game machine (`draft → spell → report`). No localStorage dependency for core play; persistence goes through Supabase for signed-in users. Signed-out users can play everything; streaks/leaderboards prompt sign-in.

---

## 8. Data Model (Supabase)

```sql
-- profiles: extends auth.users
profiles (
  id uuid pk references auth.users,
  handle text unique,            -- leaderboard name, 3–16 chars
  current_streak int default 0,
  max_streak int default 0,
  last_daily_day int,            -- day number of last daily played
  created_at timestamptz
)

daily_results (
  id bigint pk,
  user_id uuid references profiles,
  day_num int not null,
  word text,                     -- null = folded
  score int not null,
  held_best_score int not null,
  god_score int not null,
  decisions text not null,       -- e.g. "PKKPPKKPKPKFF" (K/P/F per letter)
  created_at timestamptz,
  unique (user_id, day_num)
)

runs (
  id uuid pk,
  user_id uuid references profiles,
  mode text check (mode in ('gauntlet','endless')),
  seed text not null,            -- for replay/validation
  level_reached int default 0,
  total_score int default 0,
  busts int default 0,
  state jsonb,                   -- resumable mid-run state
  started_at timestamptz,
  ended_at timestamptz
)

-- percentile: computed per day_num on read (or a pg cron rollup into daily_stats)
daily_stats (
  day_num int pk,
  plays int, mean_score numeric, score_histogram jsonb
)
```

RLS: users read/write only their own rows; `daily_stats` and leaderboard views public-read. Leaderboards = views over `runs` (deepest level, weekly window) and `daily_results` (percentile).

---

## 9. Anti-cheat & Fairness

The daily percentile only means something if scores are honest. Pragmatic tiering:

- **P1 (launch):** submission includes `decisions` string + word + score. A Supabase Edge Function **replays the seed**: regenerates the day's stream (`seedv1`), verifies the decisions string is consistent (rack derivation matches, forced-fill positions correct), verifies the word is formable from the derived rack, is in the dictionary, and the score matches. Reject on any mismatch. The dictionary ships inside the edge function bundle.
- **Not solved at this tier:** a client that shows the player the full stream in advance (the stream is client-computable by design). Accept this for launch — it's the same trust level as Wordle. If it becomes a real problem (P4+): server-issued stream via signed per-letter reveal tokens.
- One daily submission per user per day enforced by the unique constraint, surfaced gracefully in UI.

---

## 10. Frozen Constants (seedv1 — do not change post-launch)

| Constant | Value |
|---|---|
| STREAM_LEN | 16 |
| RACK_SIZE | 7 |
| MIN_WORD | 3 |
| Multipliers | {3:1, 4:2, 5:3, 6:4, 7:6} |
| Bag | Scrabble distribution, no blanks (98 tiles) |
| Vowel guard | 4–8 vowels in stream |
| God-line guard | best word ≥5 letters |
| Seed string | `GREED-YYYY-M-D` (unpadded) + `#attempt` |
| RNG | xmur3 → mulberry32 |
| Epoch (Day 1) | 2026-07-01 |
| Dictionary | YAWL ∪ ENABLE, 3–7 letters, uppercase (~72,028 words, curated — no proper names of people/places/landmarks; custom allow/block overrides in `src/engine/customWords.ts`) |

Gauntlet/Endless constants (targets, shop prices, modifier weights) are **not** frozen — they live in a single `config/tuning.ts` and should be trivially adjustable.

---

## 11. Monetization (recommendation — decide before P5)

- **The Daily is free forever.** Never paywall the ritual; it's the acquisition engine.
- **GREED Gold — one-time purchase (~$4.99):** unlimited Gauntlet & Endless runs (free tier: 2 runs/day), full stats history, tile skins (brass, bone, obsidian, "counterfeit"), and streak insurance (1 auto-save/month). One-time purchase matches the Footsteps model and the audience's subscription fatigue.
- No ads, ever. Ads in a 2-minute ritual game poison the exact feeling we're selling.
- Optional later: seasonal cosmetic packs (Genesis gold-foil tile set — cross-pollinate the Crypto Lore foil aesthetic).

---

## 12. Design System

Carry the prototype's aesthetic forward — it's already distinctive:

- **Palette:** ink table `#141210`, felt `#1f1b15`, line `#3a3327`, gold `#d9a441` / hi `#f0c065` / dim `#8a6b2d`, bone `#ede4d3`, muted `#8a7f6c`, loss red `#b8452f`. **Loss red is reserved exclusively for punishment** (forced tiles, cursed tiles, busts) — that reservation is a design rule, not a suggestion.
- **Type:** Fraunces (900) for wordmark, tile letters, verdict words; Archivo for UI; IBM Plex Mono for all numbers/scores. Tiles render as gilded/engraved (the existing gradient treatment) — banknote energy.
- **Motion:** tile flip-in on reveal, toss-away on pass (left, rotated) vs. drop-to-rack on keep (down), slot pop, greed-meter fill, score count-up. Respect `prefers-reduced-motion` everywhere.
- **Sound (P4):** card-slide on reveal, felt thump on keep, dismissive flick on pass, low brass sting on forced fill, coin shimmer on cash-out. All optional, off by default on web, on by default in app wrap.
- **Haptics (Capacitor):** light tick per decision, heavy thud on forced fill and bust.

---

## 13. Repo Structure

```
greed/
├── GREED.md                    # this file
├── prototype/greed.html        # validated prototype — reference implementation
├── app/
│   ├── layout.tsx
│   ├── page.tsx                # Daily (the front door)
│   ├── gauntlet/page.tsx
│   ├── endless/page.tsx
│   ├── stats/page.tsx
│   └── api/submit-daily/route.ts   # or Supabase edge function
├── components/
│   ├── game/  (Draft.tsx, BigTile.tsx, Rack.tsx, Spell.tsx, Report.tsx, Pips.tsx)
│   ├── gauntlet/ (Shop.tsx, ModifierCard.tsx, RunReport.tsx)
│   └── ui/
├── lib/
│   ├── engine/  (rng.ts, generate.ts, score.ts, solver.ts, gameMachine.ts)
│   ├── gauntlet/ (targets.ts, modifiers.ts, shop.ts)
│   ├── epitaphs.ts
│   ├── share.ts
│   └── supabase/ (client.ts, queries.ts)
├── workers/dictionary.worker.ts
├── config/tuning.ts             # ALL non-frozen constants live here
├── public/dict/enable37.txt.gz
└── supabase/ (migrations/, functions/validate-daily/)
```

Engine code in `lib/engine/` must be **pure and isomorphic** — it runs in the browser, the worker, and the validation edge function. No DOM, no React imports.

---

## 14. Build Phases

**P0 — Port (Daily, anonymous).** Next.js scaffold; extract prototype logic into `lib/engine/` as typed pure modules with unit tests (RNG determinism, forced-fill edge cases, solver correctness, score table); dictionary worker; Daily playable end-to-end with report + clipboard share; PWA manifest.
*Accept when:* today's seed produces the identical stream as the prototype for the same date; full loop playable on a phone; Lighthouse PWA installable.

**P1 — Accounts & the percentile.** Supabase auth (magic link + Google); profiles, daily_results, streaks; edge-function validation replay; global percentile in the report + share line ("beat 78%"); stats page (history, streak, distribution).
*Accept when:* two accounts on the same day see the same stream and correct relative percentile; invalid submissions rejected by replay.

**P2 — The Gauntlet.** Run state machine, targets, busts, coin economy, shop (all 6 items), House Rules (all 9 modifiers), run report + share card, resumable runs via `runs.state`.
*Accept when:* a full run to bust-out plays cleanly; every modifier functions; Speed Round timer is authoritative; refresh mid-run resumes.

**P3 — Endless & leaderboards.** Endless curve, weekly + all-time boards, handles, anonymous-unranked path.
*Accept when:* leaderboard updates in near-real-time post-run; RLS verified (users cannot write others' scores).

**P4 — Juice & retention.** Sound, haptics-ready animations, expanded epitaph pool (20+/category), onboarding (first-visit 20-second interactive tutorial — teach by playing 5 letters, not by modal), daily reminder push (PWA), empty/edge states.
*Accept when:* a first-time player reaches their first report with zero instructions read.

**P5 — Monetization & app stores.** GREED Gold purchase flow (Stripe or RevenueCat-via-Capacitor), run limits for free tier, tile skins, Capacitor iOS/Android builds.

---

## 15. Success Metrics

- **Daily D7 retention** — the number that matters most. Target: >30% (Wordle-class games run 40%+).
- **Share rate** — % of completed dailies that tap Share. Target: >12%.
- **Tragedy quality proxy** — median gap between MINE and GOD. If the gap is routinely tiny, the game is too easy and stories die; routinely huge, players feel hopeless. Healthy band: player at 40–70% of god-line.
- Gauntlet: median run length 8–15 minutes; shop engagement >60% of runs.

---

## 16. Open Design Questions (decide during P2 with real play data)

1. Length-multiplier meta: does ×6 make 7-letter chasing strictly dominant? (Telemetry: distribution of submitted word lengths.)
2. Forced-fill frequency at 16/7 — is it rare enough to feel fair but common enough to fear?
3. Should the Daily show remaining vowel/consonant counts in the stream? (Raises skill ceiling, may reduce gambling drama. Candidate: show it in Gauntlet, never in Daily.)
4. Speed Round on mobile — 5s may be brutal with touch targets; test 7s.
5. Endless energy/run-limit for free tier: 2/day feels right, validate against session data.
6. Name check before launch: trademark search on "GREED" in games (crowded word) — fallback candidates: GILT, THE STREAM, SEVEN.

---

## 17. Prototype Carry-over Checklist

From `prototype/greed.html`, port verbatim: RNG pair, bag + draw, generation guards, score function, solver, forced-fill logic, epitaph priority chain, share emoji format, CSS custom-property palette, tile gradient treatment, keyboard bindings (K/P in draft; type-to-spell, Backspace, Enter in spell phase).

Known prototype gaps to fix in P0: no persistence of any kind (by design), no percentile, practice mode should move behind a menu (Daily is the landing experience), needs proper focus states and screen-reader labels on tiles.
