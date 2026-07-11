/**
 * The Vault — between-level shop. 3 random items per visit, fixed prices.
 */

export type ShopItemId =
  | 'peek'
  | 'burn'
  | 'eighthSlot'
  | 'markedCard'
  | 'insurance'
  | 'loadedDie';

export interface ShopItem {
  id: ShopItemId;
  name: string;
  cost: number;
  effect: string;
}

// Entry items (Peek/Burn/Insurance) are priced low so the first cleared level
// can afford a power-up; the swingier items stay pricier.
export const SHOP_ITEMS: Record<ShopItemId, ShopItem> = {
  peek: { id: 'peek', name: 'Peek', cost: 2, effect: 'See the next 2 letters before deciding.' },
  burn: { id: 'burn', name: 'Burn', cost: 4, effect: 'Discard one rack tile mid-draft; the slot reopens.' },
  eighthSlot: { id: 'eighthSlot', name: 'Eighth Slot', cost: 7, effect: 'Rack size 8 for the next hand only.' },
  markedCard: { id: 'markedCard', name: 'Marked Card', cost: 5, effect: 'A chosen letter glows if it appears in the next 5 stream letters.' },
  insurance: { id: 'insurance', name: 'Insurance', cost: 3, effect: "Your next bust doesn't count. Consumed on use." },
  loadedDie: { id: 'loadedDie', name: 'Loaded Die', cost: 9, effect: 'Reroll the entire stream once mid-draft, keeping your rack.' },
};

const ALL: ShopItemId[] = Object.keys(SHOP_ITEMS) as ShopItemId[];

/** Roll a 3-item shop for this visit (deterministic given rng). */
export function rollShop(rng: () => number, count = 3): ShopItem[] {
  const pool = ALL.slice();
  // Fisher–Yates using rng.
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count).map((id) => SHOP_ITEMS[id]);
}

/** Player-owned consumables during a run. */
export interface Inventory {
  peek: number;
  burn: number;
  eighthSlot: number;
  markedCard: number;
  insurance: number;
  loadedDie: number;
}

export function emptyInventory(): Inventory {
  return { peek: 0, burn: 0, eighthSlot: 0, markedCard: 0, insurance: 0, loadedDie: 0 };
}

/** Build a starting inventory from a partial (difficulty's free items). */
export function makeInventory(seed: Partial<Inventory> = {}): Inventory {
  return { ...emptyInventory(), ...seed };
}
