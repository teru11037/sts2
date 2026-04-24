import Dexie, { type Table } from 'dexie';
import type { Card, ComboMemo, Deck, Relic, Run, StoredImage } from '../types';
import { SEED_CARDS } from '../data/cards';
import { SEED_RELICS } from '../data/relics';

export class Sts2Db extends Dexie {
  cards!: Table<Card, string>;
  relics!: Table<Relic, string>;
  decks!: Table<Deck, number>;
  runs!: Table<Run, number>;
  memos!: Table<ComboMemo, number>;
  images!: Table<StoredImage, string>;
  meta!: Table<{ key: string; value: unknown }, string>;

  constructor() {
    super('sts2-companion');
    this.version(1).stores({
      cards: 'id, name, character, type, rarity, isCustom',
      relics: 'id, name, character, rarity, isCustom',
      decks: '++id, name, character, updatedAt',
      runs: '++id, character, result, startedAt, endedAt',
      memos: '++id, title, starred, updatedAt',
      meta: 'key'
    });
    this.version(2).stores({
      images: 'id, updatedAt'
    });
  }
}

export const db = new Sts2Db();

const SEED_VERSION = 1;

export async function ensureSeeded(): Promise<void> {
  const rec = await db.meta.get('seedVersion');
  const current = typeof rec?.value === 'number' ? rec.value : 0;
  if (current >= SEED_VERSION) return;

  await db.transaction('rw', db.cards, db.relics, db.meta, async () => {
    // isCustom=1 (ユーザが編集・追加したもの) は触らない。
    // 既存でも isCustom=0 / undefined なら上書きする (seed 側のバグ修正を反映できる)。
    const existingCards = await db.cards.bulkGet(SEED_CARDS.map((c) => c.id));
    for (let i = 0; i < SEED_CARDS.length; i++) {
      const ex = existingCards[i];
      if (ex && ex.isCustom === 1) continue;
      await db.cards.put({ ...SEED_CARDS[i], isCustom: 0 });
    }

    const existingRelics = await db.relics.bulkGet(SEED_RELICS.map((r) => r.id));
    for (let i = 0; i < SEED_RELICS.length; i++) {
      const ex = existingRelics[i];
      if (ex && ex.isCustom === 1) continue;
      await db.relics.put({ ...SEED_RELICS[i], isCustom: 0 });
    }

    await db.meta.put({ key: 'seedVersion', value: SEED_VERSION });
  });
}

export async function exportAll(): Promise<string> {
  const [cards, relics, decks, runs, memos, images] = await Promise.all([
    db.cards.toArray(),
    db.relics.toArray(),
    db.decks.toArray(),
    db.runs.toArray(),
    db.memos.toArray(),
    db.images.toArray()
  ]);
  return JSON.stringify(
    { version: 2, exportedAt: Date.now(), cards, relics, decks, runs, memos, images },
    null,
    2
  );
}

export async function importAll(json: string): Promise<void> {
  const data = JSON.parse(json);
  await db.transaction(
    'rw',
    [db.cards, db.relics, db.decks, db.runs, db.memos, db.images],
    async () => {
      if (Array.isArray(data.cards)) await db.cards.bulkPut(data.cards);
      if (Array.isArray(data.relics)) await db.relics.bulkPut(data.relics);
      if (Array.isArray(data.decks)) await db.decks.bulkPut(data.decks);
      if (Array.isArray(data.runs)) await db.runs.bulkPut(data.runs);
      if (Array.isArray(data.memos)) await db.memos.bulkPut(data.memos);
      if (Array.isArray(data.images)) await db.images.bulkPut(data.images);
    }
  );
}
