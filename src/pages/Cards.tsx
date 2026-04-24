import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import TopBar from '../components/TopBar';
import CardTile from '../components/CardTile';
import RelicTile from '../components/RelicTile';
import { CHARACTERS } from '../data/characters';
import { useImagesMap } from '../hooks/useImagesMap';
import type { CardType, CharacterId } from '../types';

type Tab = 'cards' | 'relics';
const TYPES: CardType[] = ['Attack', 'Skill', 'Power', 'Status', 'Curse'];

export default function Cards() {
  const [tab, setTab] = useState<Tab>('cards');
  const [q, setQ] = useState('');
  const [type, setType] = useState<CardType | 'all'>('all');
  const [char, setChar] = useState<CharacterId | 'all'>('all');

  const allCards = useLiveQuery(() => db.cards.toArray(), []);
  const allRelics = useLiveQuery(() => db.relics.toArray(), []);
  const images = useImagesMap();

  const cards = useMemo(() => {
    const list = allCards ?? [];
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
  }, [allCards, q, type, char]);

  const relics = useMemo(() => {
    const list = allRelics ?? [];
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
  }, [allRelics, q, char]);

  return (
    <>
      <TopBar
        title="図鑑"
        right={
          <div className="upgrade-toggle">
            <button className={tab === 'cards' ? 'active' : ''} onClick={() => setTab('cards')}>
              カード
            </button>
            <button className={tab === 'relics' ? 'active' : ''} onClick={() => setTab('relics')}>
              レリック
            </button>
          </div>
        }
      />
      <div className="content">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="名前や効果で検索..."
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
        {tab === 'cards' && (
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

        {tab === 'cards' ? (
          <div
            style={{
              display: 'grid',
              gap: 10,
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              justifyItems: 'center'
            }}
          >
            {cards.map((c) => (
              <Link key={c.id} to={`/cards/${c.id}`} style={{ textDecoration: 'none' }}>
                <CardTile card={c} size="md" imageUrl={c.imageId ? images.get(c.imageId) : undefined} />
              </Link>
            ))}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gap: 10,
              gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))',
              justifyItems: 'center'
            }}
          >
            {relics.map((r) => (
              <Link key={r.id} to={`/relics/${r.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <RelicTile relic={r} size="md" imageUrl={r.imageId ? images.get(r.imageId) : undefined} />
                  <div style={{ fontSize: 10, color: 'var(--fg-muted)', textAlign: 'center', maxWidth: 76 }}>
                    {r.nameJa ?? r.name}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {tab === 'cards' && cards.length === 0 && (
          <div className="empty">
            <h3>カードが見つかりません</h3>
            <p>条件を変えるか、右下の + から追加してください。</p>
          </div>
        )}
        {tab === 'relics' && relics.length === 0 && (
          <div className="empty">
            <h3>レリックが見つかりません</h3>
            <p>条件を変えるか、右下の + から追加してください。</p>
          </div>
        )}
      </div>
      <Link
        to={tab === 'cards' ? '/cards/new' : '/relics/new'}
        className="fab"
        aria-label="追加"
        style={{ textDecoration: 'none' }}
      >
        +
      </Link>
    </>
  );
}
