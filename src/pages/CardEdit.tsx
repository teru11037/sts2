import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../db';
import TopBar from '../components/TopBar';
import CardTile from '../components/CardTile';
import { CHARACTERS } from '../data/characters';
import { deleteImage, readAndResize, saveImage } from '../lib/images';
import { useSingleImage } from '../hooks/useImagesMap';
import type { Card, CardRarity, CardType, CharacterId } from '../types';

const TYPES: CardType[] = ['Attack', 'Skill', 'Power', 'Status', 'Curse'];
const RARITIES: CardRarity[] = ['Starter', 'Common', 'Uncommon', 'Rare', 'Special'];

function newCard(): Card {
  return {
    id: 'card_' + Math.random().toString(36).slice(2, 10),
    name: '',
    nameJa: '',
    character: 'ironclad',
    type: 'Attack',
    rarity: 'Common',
    cost: 1,
    description: '',
    upgradedDescription: '',
    isCustom: 1
  };
}

export default function CardEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const [card, setCard] = useState<Card | null>(null);
  const [upgraded, setUpgraded] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!id) {
      setCard(newCard());
    } else {
      db.cards.get(id).then((c) => setCard(c ?? null));
    }
  }, [id]);

  const imageUrl = useSingleImage(card?.imageId);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f || !card) return;
    setUploading(true);
    try {
      const { dataUrl, width, height } = await readAndResize(f, { maxEdge: 512, quality: 0.82 });
      const imageId = card.imageId ?? 'img_' + Math.random().toString(36).slice(2, 10);
      await saveImage(imageId, dataUrl, width, height);
      setCard({ ...card, imageId });
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const clearImage = async () => {
    if (!card?.imageId) return;
    const prev = card.imageId;
    setCard({ ...card, imageId: undefined });
    await deleteImage(prev);
  };

  if (!card) return null;

  const save = async () => {
    if (!card.name.trim()) {
      alert('名前を入力してください');
      return;
    }
    // 編集・新規ともユーザデータ扱い (isCustom=1) にすることで、
    // 将来のシード再投入から保護する。
    await db.cards.put({ ...card, isCustom: 1 });
    nav(-1);
  };

  const remove = async () => {
    if (!id) return;
    if (!confirm('このカードを削除しますか？\n(シード提供カードは再起動時に復元されます)')) return;
    await db.cards.delete(id);
    nav(-1);
  };

  return (
    <>
      <TopBar title={id ? 'カード編集' : 'カード新規'} back />
      <div className="content">
        <div className="stack" style={{ alignItems: 'center' }}>
          <CardTile card={card} size="lg" upgraded={upgraded} imageUrl={imageUrl} />
          <div className="upgrade-toggle">
            <button className={!upgraded ? 'active' : ''} onClick={() => setUpgraded(false)}>
              通常
            </button>
            <button className={upgraded ? 'active' : ''} onClick={() => setUpgraded(true)}>
              +
            </button>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? '処理中…' : card.imageId ? '🖼️ 画像を差し替え' : '📷 画像をアップロード'}
            </button>
            {card.imageId && (
              <button className="danger" onClick={clearImage}>
                画像を外す
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={onFileChange}
          />
          <div className="dim" style={{ fontSize: 11 }}>
            アップロード後、自動で 512px JPEG に圧縮します (1.5MB まで)
          </div>
        </div>

        <div className="stack" style={{ marginTop: 14 }}>
          <label className="field">
            <span>名前 (英)</span>
            <input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
          </label>
          <label className="field">
            <span>名前 (日本語)</span>
            <input
              value={card.nameJa ?? ''}
              onChange={(e) => setCard({ ...card, nameJa: e.target.value })}
            />
          </label>
          <label className="field">
            <span>キャラクター</span>
            <select
              value={card.character}
              onChange={(e) => setCard({ ...card, character: e.target.value as CharacterId })}
            >
              {CHARACTERS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameJa ?? c.name}
                </option>
              ))}
            </select>
          </label>
          <div className="row" style={{ gap: 10 }}>
            <label className="field" style={{ flex: 1 }}>
              <span>タイプ</span>
              <select
                value={card.type}
                onChange={(e) => setCard({ ...card, type: e.target.value as CardType })}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="field" style={{ flex: 1 }}>
              <span>レアリティ</span>
              <select
                value={card.rarity}
                onChange={(e) => setCard({ ...card, rarity: e.target.value as CardRarity })}
              >
                {RARITIES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label className="field" style={{ width: 100 }}>
              <span>コスト</span>
              <input
                type="text"
                inputMode="text"
                value={card.cost === null ? '-' : String(card.cost)}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '-' || v === '') setCard({ ...card, cost: null });
                  else if (v === 'X' || v === 'x') setCard({ ...card, cost: 'X' });
                  else {
                    const n = Number(v);
                    if (!Number.isNaN(n)) setCard({ ...card, cost: n });
                  }
                }}
              />
            </label>
          </div>
          <label className="field">
            <span>効果</span>
            <textarea
              value={card.description}
              onChange={(e) => setCard({ ...card, description: e.target.value })}
            />
          </label>
          <label className="field">
            <span>強化後の効果</span>
            <textarea
              value={card.upgradedDescription ?? ''}
              onChange={(e) => setCard({ ...card, upgradedDescription: e.target.value })}
            />
          </label>
          <label className="field">
            <span>メモ</span>
            <textarea
              value={card.notes ?? ''}
              onChange={(e) => setCard({ ...card, notes: e.target.value })}
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
