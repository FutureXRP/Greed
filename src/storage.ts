/**
 * Local persistence via AsyncStorage. Standalone play (no server): streaks,
 * daily results, a local score distribution for a "beat X%" stat, and best runs.
 * When a Supabase backend is added (P1/P3), these become the offline mirror.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { HandResult } from './engine/types';

const K = {
  streak: 'greed.streak.v1',
  daily: 'greed.daily.v1', // map dayNum -> stored result
  dist: 'greed.dist.v1', // local score distribution per dayNum
  runs: 'greed.runs.v1', // best runs per mode
  settings: 'greed.settings.v1',
};

export interface StreakState {
  current: number;
  max: number;
  lastDay: number | null;
}

export interface StoredDaily {
  dayNum: number;
  word: string | null;
  score: number;
  heldBestWord: string | null;
  heldBestScore: number;
  godWord: string | null;
  godScore: number;
  decisions: string;
  fates: HandResult['fates'];
  epitaph: string;
  percentile?: number;
}

export interface Settings {
  reducedMotion: boolean;
  haptics: boolean;
  sound: boolean;
}

const DEFAULT_SETTINGS: Settings = { reducedMotion: false, haptics: true, sound: false };

async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function setJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best-effort; play continues without persistence
  }
}

// ---- Streaks ----

export async function getStreak(): Promise<StreakState> {
  return getJSON<StreakState>(K.streak, { current: 0, max: 0, lastDay: null });
}

/** Record that `dayNum` was played (any score, incl. fold). Calendar-day based. */
export async function recordStreakPlay(dayNum: number): Promise<StreakState> {
  const s = await getStreak();
  if (s.lastDay === dayNum) return s; // already counted today
  let current: number;
  if (s.lastDay == null) current = 1;
  else if (dayNum === s.lastDay + 1) current = s.current + 1;
  else current = 1; // gap → reset
  const next: StreakState = { current, max: Math.max(s.max, current), lastDay: dayNum };
  await setJSON(K.streak, next);
  return next;
}

// ---- Daily results ----

export async function getDaily(dayNum: number): Promise<StoredDaily | null> {
  const map = await getJSON<Record<string, StoredDaily>>(K.daily, {});
  return map[String(dayNum)] ?? null;
}

export async function saveDaily(result: StoredDaily): Promise<void> {
  const map = await getJSON<Record<string, StoredDaily>>(K.daily, {});
  map[String(result.dayNum)] = result;
  await setJSON(K.daily, map);
  await addToDistribution(result.dayNum, result.score);
}

export async function getAllDailies(): Promise<StoredDaily[]> {
  const map = await getJSON<Record<string, StoredDaily>>(K.daily, {});
  return Object.values(map).sort((a, b) => a.dayNum - b.dayNum);
}

// ---- Local score distribution (stand-in for the server percentile) ----

async function addToDistribution(dayNum: number, score: number): Promise<void> {
  const dist = await getJSON<Record<string, number[]>>(K.dist, {});
  const arr = dist[String(dayNum)] ?? [];
  arr.push(score);
  dist[String(dayNum)] = arr;
  await setJSON(K.dist, dist);
}

/**
 * Local "beat X%" percentile. Seeds a synthetic distribution around the day's
 * god-line so the very first play still gets a meaningful stat; real plays are
 * mixed in. (Server percentile replaces this in P1.)
 */
export async function localPercentile(dayNum: number, score: number, godScore: number): Promise<number> {
  const dist = await getJSON<Record<string, number[]>>(K.dist, {});
  const real = dist[String(dayNum)] ?? [];
  const samples = syntheticDistribution(godScore, dayNum).concat(real);
  const beaten = samples.filter((s) => score > s).length;
  return Math.round((beaten / samples.length) * 100);
}

/** Deterministic bell-ish synthetic field centered ~48% of god-line. */
function syntheticDistribution(godScore: number, dayNum: number): number[] {
  const center = Math.max(10, godScore * 0.48);
  const spread = Math.max(12, godScore * 0.22);
  const out: number[] = [];
  let seed = (dayNum * 2654435761) >>> 0;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = 0; i < 200; i++) {
    // sum of 3 uniforms ≈ gaussian
    const g = (rand() + rand() + rand()) / 3 - 0.5;
    out.push(Math.max(0, Math.round(center + g * 2 * spread)));
  }
  return out;
}

// ---- Runs ----

export interface StoredRun {
  mode: 'gauntlet' | 'endless';
  levelReached: number;
  totalScore: number;
  bestWord: string | null;
  bestWordScore: number;
  at: number;
}

export async function getBestRuns(): Promise<Record<string, StoredRun>> {
  return getJSON<Record<string, StoredRun>>(K.runs, {});
}

export async function saveRun(run: StoredRun): Promise<void> {
  const runs = await getBestRuns();
  const prev = runs[run.mode];
  if (
    !prev ||
    run.levelReached > prev.levelReached ||
    (run.levelReached === prev.levelReached && run.totalScore > prev.totalScore)
  ) {
    runs[run.mode] = run;
    await setJSON(K.runs, runs);
  }
}

// ---- Settings ----

export async function getSettings(): Promise<Settings> {
  return getJSON<Settings>(K.settings, DEFAULT_SETTINGS);
}

export async function saveSettings(s: Settings): Promise<void> {
  await setJSON(K.settings, s);
}
