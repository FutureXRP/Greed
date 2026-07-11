/**
 * Loads the bundled ENABLE (3–7) dictionary asset into a Dictionary.
 * RN-specific (uses expo-asset / expo-file-system); the pure builder lives in
 * dictionary.ts so the engine stays isomorphic.
 */

import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { buildDictionary, Dictionary } from './dictionary';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const DICT_MODULE = require('../../assets/enable37.txt');

let cached: Dictionary | null = null;

async function readAssetText(): Promise<string> {
  const asset = Asset.fromModule(DICT_MODULE);
  if (!asset.downloaded) await asset.downloadAsync();

  const uri = asset.localUri ?? asset.uri;
  if (Platform.OS === 'web') {
    const res = await fetch(uri);
    return res.text();
  }
  return FileSystem.readAsStringAsync(uri);
}

/** Load (and cache) the full dictionary. Safe to call repeatedly. */
export async function loadDictionary(): Promise<Dictionary> {
  if (cached) return cached;
  const raw = await readAssetText();
  cached = buildDictionary(raw);
  return cached;
}

export function getCachedDictionary(): Dictionary | null {
  return cached;
}
