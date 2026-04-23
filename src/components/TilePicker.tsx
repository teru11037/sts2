import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Card, CardType, CharacterId, Relic } from '../types';
import { CHARACTERS } from '../data/characters';
import CardTile from './CardTile';
import RelicTile from './RelicTile';

type Mode = 'card' | 'relic';

interface Props {
  mode: Mode;
  title?: string;
  onPick: (id: string) => void;
  onClose: () => void;
  characterFilter?: CharacterId;
  multi?: boolean;
  selectedIds?: string[];
}

const TYPES: CardType[] = ['Attack', 'Skill', 'Power', 'Status', 'Curse'];

export default function TilePicker({
  mode,
  title,
  onPick,
  onClose,
  characterFilter,
  multi,
  selectedIds = []
}: Props) {
  const [q, setQ] = useState('');
  const [type, setType] = useState<CardType | 'all'>('all');
  const [char, setChar] = useState<CharacterId | 'all'>(characterFilter ?? 'all');

  const cards = useLiveQuery(async () => {
    if (mode !== 'card') return [] as Card[];
    return db.cards.toArray();
  }, [mode]);

  const relics = useLiveQuery(async () => {
    if (mode !== 'relic') return [] as Relic[];
    return db.relics.toArray();
  }, [mode]);

  const filteredCards = useMemo(() => {
    const list = cards ?? [];
    const qq = q.trim().toLowerCase();
    return list
      .filter((c) => (char === 'all' ? true : c.character === char))
      .filter((c) => (type === 'all' ? true : c.type === type))
      .filter((c) =>
        qq
          ? [c.name, c.nameJa, c.description, c.upgradedDescription]
              .filter(Boolean)
              .some((s) => (s as string).toLowerCase().includes(qq))
          : true
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [cards, q, type, char]);

  const filteredRelics = useMemo(() => {
    const list = relics ?? [];
    const qq = q.trim().toLowerCase();
    return list
      .filter((r) => (char === 'all' ? true : !r.character || r.character === char))
      .filter((r) =>
        qq
          ? [r.name, r.nameJa, r.description]
              .filter(Boolean)
              .some((s) => (s as string).toLowerCase().includes(qq))
          : true
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [relics, q, char]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="row-between">
          <h2>{title ?? (mode === 'card' ? 'カードを選ぶ' : 'レリックを選ぶ')}</h2>
          <button className="ghost" onClick={onClose} aria-label="閉じる">
            ✕
          </button>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="名前や効果で検索..."
          autoFocus={false}
        />
        <div className="filters" style={{ marginTop: 10 }}>
          <button
            className={`chip ${char === 'all' ? 'active' : ''}`}
            onClick={() => setChar('all')}
          >
            全キャラ
          </button>
          {CHARACTERS.map((c) => (
            <button
              key={c.id}
              className={`chip ${char === c.id ? 'active' : ''}`}
              onClick={() => setChar(c.id)}
            >
              {c.nameJa ?? c.name}
            </button>
          ))}
        </div>
        {mode === 'card' && (
          <div className="filters">
            <button
              className={`chip ${type === 'all' ? 'active' : ''}`}
              onClick={() => setType('all')}
            >
              全タイプ
            </button>
            {TYPES.map((t) => (
              <button
                key={t}
                className={`chip ${type === t ? 'active' : ''}`}
                onClick={() => setType(t)}
              >
                {t}
              </button>
            ))}
          </div>
        )}
        <div
          style={{
            display: 'grid',
            gap: 10,
            gridTemplateColumns:
              mode === 'card' ? 'repeat(auto-fill, minmax(80px, 1fr))' : 'repeat(auto-fill, minmax(64px, 1fr))',
            justifyItems: 'center',
            marginTop: 6
          }}
        >
          {mode === 'card' &&
            filteredCards.map((c) => (
              <CardTile
                key={c.id}
                card={c}
                size="sm"
                selected={selectedIds.includes(c.id)}
                onClick={() => {
                  onPick(c.id);
                  if (!multi) onClose();
                }}
              />
            ))}
          {mode === 'relic' &&
            filteredRelics.map((r) => (
              <RelicTile
                key={r.id}
                relic={r}
                size="sm"
                selected={selectedIds.includes(r.id)}
                onClick={() => {
                  onPick(r.id);
                  if (!multi) onClose();
                }}
              />
            ))}
        </div>
        {((mode === 'card' && filteredCards.length === 0) ||
          (mode === 'relic' && filteredRelics.length === 0)) && (
          <div className="empty">
            <h3>該当なし</h3>
            <p>条件を変えるか、図鑑から新規追加してください。</p>
          </div>
        )}
        {multi && (
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="primary" onClick={onClose}>
              決定
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
