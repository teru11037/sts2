import Dexie, { type Table } from 'dexie';
import type { Card, Relic, Deck, Run, ComboMemo } from '../types';
import { SEED_CARDS } from '../data/cards';
import { SEED_RELICS } from '../data/relics';

export class Sts2Db extends Dexie {
  cards!: Table<Card, string>;
  relics!: Table<Relic, string>;
  decks!: Table<Deck, number>;
  runs!: Table<Run, number>;
  memos!: Table<ComboMemo, number>;
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
  }
}

export const db = new Sts2Db();

const SEED_VERSION = 1;

export async function ensureSeeded(): Promise<void> {
  const rec = await db.meta.get('seedVersion');
  const current = typeof rec?.value === 'number' ? rec.value : 0;
  if (current >= SEED_VERSION) return;

  await db.transaction('rw', db.cards, db.relics, db.meta, async () => {
    // シードは isCustom=0 で投入。ユーザが編集・作成したカード (isCustom=1) はこのパスでは触らない。
    const cardsToPut = SEED_CARDS.map((c) => ({ ...c, isCustom: 0 as const }));
    await db.cards.bulkPut(cardsToPut);

    const relicsToPut = SEED_RELICS.map((r) => ({ ...r, isCustom: 0 as const }));
    await db.relics.bulkPut(relicsToPut);

    await db.meta.put({ key: 'seedVersion', value: SEED_VERSION });
  });
}

export async function exportAll(): Promise<string> {
  const [cards, relics, decks, runs, memos] = await Promise.all([
    db.cards.toArray(),
    db.relics.toArray(),
    db.decks.toArray(),
    db.runs.toArray(),
    db.memos.toArray()
  ]);
  return JSON.stringify(
    { version: 1, exportedAt: Date.now(), cards, relics, decks, runs, memos },
    null,
    2
  );
}

export async function importAll(json: string): Promise<void> {
  const data = JSON.parse(json);
  await db.transaction('rw', [db.cards, db.relics, db.decks, db.runs, db.memos], async () => {
    if (Array.isArray(data.cards)) await db.cards.bulkPut(data.cards);
    if (Array.isArray(data.relics)) await db.relics.bulkPut(data.relics);
    if (Array.isArray(data.decks)) await db.decks.bulkPut(data.decks);
    if (Array.isArray(data.runs)) await db.runs.bulkPut(data.runs);
    if (Array.isArray(data.memos)) await db.memos.bulkPut(data.memos);
  });
}
