import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import TopBar from '../components/TopBar';
import CardTile from '../components/CardTile';
import RelicTile from '../components/RelicTile';
import TilePicker from '../components/TilePicker';
import { CHARACTERS } from '../data/characters';
import type { Card, CharacterId, Deck, Relic } from '../types';

function newDeck(): Deck {
  const now = Date.now();
  return {
    name: '新しいデッキ',
    character: 'ironclad',
    cards: [],
    relics: [],
    notes: '',
    createdAt: now,
    updatedAt: now
  };
}

export default function DeckEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [pick, setPick] = useState<null | 'card' | 'relic'>(null);

  useEffect(() => {
    if (!id) setDeck(newDeck());
    else db.decks.get(Number(id)).then((d) => setDeck(d ?? null));
  }, [id]);

  const allCards = useLiveQuery(() => db.cards.toArray(), []);
  const cardMap = useMemo(() => {
    const m = new Map<string, Card>();
    (allCards ?? []).forEach((c) => m.set(c.id, c));
    return m;
  }, [allCards]);

  const allRelics = useLiveQuery(() => db.relics.toArray(), []);
  const relicMap = useMemo(() => {
    const m = new Map<string, Relic>();
    (allRelics ?? []).forEach((r) => m.set(r.id, r));
    return m;
  }, [allRelics]);

  if (!deck) return null;

  const save = async () => {
    const now = Date.now();
    if (deck.id) {
      await db.decks.put({ ...deck, updatedAt: now });
    } else {
      await db.decks.add({ ...deck, createdAt: now, updatedAt: now });
    }
    nav(-1);
  };

  const remove = async () => {
    if (!deck.id) return;
    if (!confirm('このデッキを削除しますか？')) return;
    await db.decks.delete(deck.id);
    nav(-1);
  };

  const addCard = (cardId: string) => {
    setDeck({
      ...deck,
      cards: [...deck.cards, { cardId, upgraded: 0 }]
    });
  };

  const removeCardAt = (i: number) => {
    const next = deck.cards.slice();
    next.splice(i, 1);
    setDeck({ ...deck, cards: next });
  };

  const toggleUpgrade = (i: number) => {
    const next = deck.cards.slice();
    next[i] = { ...next[i], upgraded: next[i].upgraded ? 0 : 1 };
    setDeck({ ...deck, cards: next });
  };

  const addRelic = (relicId: string) => {
    if (deck.relics.includes(relicId)) return;
    setDeck({ ...deck, relics: [...deck.relics, relicId] });
  };

  const removeRelic = (relicId: string) => {
    setDeck({ ...deck, relics: deck.relics.filter((r) => r !== relicId) });
  };

  const stats = useMemo(() => {
    const typeCount: Record<string, number> = { Attack: 0, Skill: 0, Power: 0, Status: 0, Curse: 0 };
    const costCount: Record<string, number> = {};
    const rar: Record<string, number> = {};
    for (const dc of deck.cards) {
      const c = cardMap.get(dc.cardId);
      if (!c) continue;
      typeCount[c.type] = (typeCount[c.type] ?? 0) + 1;
      const key = c.cost === null ? '-' : String(c.cost);
      costCount[key] = (costCount[key] ?? 0) + 1;
      rar[c.rarity] = (rar[c.rarity] ?? 0) + 1;
    }
    return { typeCount, costCount, rar, total: deck.cards.length };
  }, [deck.cards, cardMap]);

  return (
    <>
      <TopBar title={id ? 'デッキ編集' : 'デッキ新規'} back />
      <div className="content">
        <div className="stack">
          <label className="field">
            <span>デッキ名</span>
            <input value={deck.name} onChange={(e) => setDeck({ ...deck, name: e.target.value })} />
          </label>
          <label className="field">
            <span>キャラクター</span>
            <select
              value={deck.character}
              onChange={(e) => setDeck({ ...deck, character: e.target.value as CharacterId })}
            >
              {CHARACTERS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameJa ?? c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="section-title">デッキ ({stats.total}枚)</div>
        <div
          style={{
            display: 'grid',
            gap: 8,
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            justifyItems: 'center'
          }}
        >
          {deck.cards.map((dc, i) => {
            const c = cardMap.get(dc.cardId);
            if (!c) return null;
            return (
              <div key={`${dc.cardId}_${i}`} style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                <CardTile
                  card={c}
                  size="sm"
                  upgraded={!!dc.upgraded}
                  onClick={() => toggleUpgrade(i)}
                />
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => toggleUpgrade(i)}
                    style={{ padding: '2px 6px', fontSize: 11, minHeight: 0 }}
                  >
                    {dc.upgraded ? '+' : '通'}
                  </button>
                  <button
                    className="danger"
                    onClick={() => removeCardAt(i)}
                    style={{ padding: '2px 6px', fontSize: 11, minHeight: 0 }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <button className="primary" style={{ marginTop: 12 }} onClick={() => setPick('card')}>
          ＋ カードを追加
        </button>

        <div className="section-title">レリック ({deck.relics.length})</div>
        <div
          style={{
            display: 'grid',
            gap: 8,
            gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))',
            justifyItems: 'center'
          }}
        >
          {deck.relics.map((rid) => {
            const r = relicMap.get(rid);
            if (!r) return null;
            return (
              <div key={rid} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <RelicTile relic={r} size="sm" onClick={() => removeRelic(rid)} />
                <div style={{ fontSize: 9, color: 'var(--fg-muted)', textAlign: 'center', maxWidth: 64 }}>
                  {r.nameJa ?? r.name}
                </div>
              </div>
            );
          })}
        </div>
        <button className="primary" style={{ marginTop: 12 }} onClick={() => setPick('relic')}>
          ＋ レリックを追加
        </button>

        <div className="section-title">統計</div>
        <div className="card card-compact">
          <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(stats.typeCount).map(([k, v]) => (
              <span key={k} className="tag">
                {k}: {v}
              </span>
            ))}
          </div>
          <hr />
          <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(stats.costCount)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([k, v]) => (
                <span key={k} className="tag">
                  コスト{k}: {v}
                </span>
              ))}
          </div>
          <hr />
          <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(stats.rar).map(([k, v]) => (
              <span key={k} className="pill" data-rarity={k}>
                {k}: {v}
              </span>
            ))}
          </div>
        </div>

        <label className="field" style={{ marginTop: 12 }}>
          <span>メモ</span>
          <textarea
            value={deck.notes ?? ''}
            onChange={(e) => setDeck({ ...deck, notes: e.target.value })}
          />
        </label>

        <div className="row" style={{ marginTop: 16, gap: 10 }}>
          <button className="primary grow" onClick={save}>
            保存
          </button>
          {deck.id && (
            <button className="danger" onClick={remove}>
              削除
            </button>
          )}
        </div>
      </div>

      {pick === 'card' && (
        <TilePicker
          mode="card"
          characterFilter={deck.character}
          onPick={(cid) => addCard(cid)}
          onClose={() => setPick(null)}
        />
      )}
      {pick === 'relic' && (
        <TilePicker
          mode="relic"
          onPick={(rid) => {
            addRelic(rid);
            setPick(null);
          }}
          onClose={() => setPick(null)}
          selectedIds={deck.relics}
        />
      )}
    </>
  );
}
