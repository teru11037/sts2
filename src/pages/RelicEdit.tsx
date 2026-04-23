import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../db';
import TopBar from '../components/TopBar';
import RelicTile from '../components/RelicTile';
import { CHARACTERS } from '../data/characters';
import type { CharacterId, Relic, RelicRarity } from '../types';

const RARITIES: RelicRarity[] = ['Starter', 'Common', 'Uncommon', 'Rare', 'Boss', 'Shop', 'Event'];

function newRelic(): Relic {
  return {
    id: 'relic_' + Math.random().toString(36).slice(2, 10),
    name: '',
    nameJa: '',
    rarity: 'Common',
    description: '',
    isCustom: 1
  };
}

export default function RelicEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const [relic, setRelic] = useState<Relic | null>(null);

  useEffect(() => {
    if (!id) setRelic(newRelic());
    else db.relics.get(id).then((r) => setRelic(r ?? null));
  }, [id]);

  if (!relic) return null;

  const save = async () => {
    if (!relic.name.trim()) {
      alert('名前を入力してください');
      return;
    }
    await db.relics.put({ ...relic, isCustom: relic.isCustom ?? 1 });
    nav(-1);
  };

  const remove = async () => {
    if (!id) return;
    if (!confirm('このレリックを削除しますか？')) return;
    await db.relics.delete(id);
    nav(-1);
  };

  return (
    <>
      <TopBar title={id ? 'レリック編集' : 'レリック新規'} back />
      <div className="content">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <RelicTile relic={relic} size="lg" />
        </div>
        <div className="stack">
          <label className="field">
            <span>名前 (英)</span>
            <input value={relic.name} onChange={(e) => setRelic({ ...relic, name: e.target.value })} />
          </label>
          <label className="field">
            <span>名前 (日本語)</span>
            <input
              value={relic.nameJa ?? ''}
              onChange={(e) => setRelic({ ...relic, nameJa: e.target.value })}
            />
          </label>
          <label className="field">
            <span>キャラクター (任意)</span>
            <select
              value={relic.character ?? ''}
              onChange={(e) =>
                setRelic({ ...relic, character: (e.target.value || undefined) as CharacterId | undefined })
              }
            >
              <option value="">(共通)</option>
              {CHARACTERS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameJa ?? c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>レアリティ</span>
            <select
              value={relic.rarity}
              onChange={(e) => setRelic({ ...relic, rarity: e.target.value as RelicRarity })}
            >
              {RARITIES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>効果</span>
            <textarea
              value={relic.description}
              onChange={(e) => setRelic({ ...relic, description: e.target.value })}
            />
          </label>
          <label className="field">
            <span>メモ</span>
            <textarea
              value={relic.notes ?? ''}
              onChange={(e) => setRelic({ ...relic, notes: e.target.value })}
            />
          </label>
        </div>
        <div className="row" style={{ marginTop: 16, gap: 10 }}>
          <button className="primary grow" onClick={save}>
            保存
          </button>
          {id && (
            <button className="danger" onClick={remove}>
              削除
            </button>
          )}
        </div>
      </div>
    </>
  );
}
