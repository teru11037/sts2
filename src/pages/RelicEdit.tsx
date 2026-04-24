import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../db';
import TopBar from '../components/TopBar';
import RelicTile from '../components/RelicTile';
import NotFound from '../components/NotFound';
import { CHARACTERS } from '../data/characters';
import { deleteImage, readAndResize, saveImage } from '../lib/images';
import { useSingleImage } from '../hooks/useImagesMap';
import { useUnsavedGuard, confirmBack } from '../hooks/useUnsavedGuard';
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
  const [loaded, setLoaded] = useState(false);
  const [dirty, setDirty] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  useUnsavedGuard(dirty);

  useEffect(() => {
    if (!id) {
      setRelic(newRelic());
      setLoaded(true);
    } else {
      db.relics.get(id).then((r) => {
        setRelic(r ?? null);
        setLoaded(true);
      });
    }
  }, [id]);

  const updateRelic = (next: Relic) => {
    setRelic(next);
    setDirty(true);
  };

  const imageUrl = useSingleImage(relic?.imageId);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f || !relic) return;
    setUploading(true);
    try {
      const { dataUrl, width, height } = await readAndResize(f, { maxEdge: 256, quality: 0.85 });
      const imageId = relic.imageId ?? 'img_' + Math.random().toString(36).slice(2, 10);
      await saveImage(imageId, dataUrl, width, height);
      updateRelic({ ...relic, imageId });
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const clearImage = async () => {
    if (!relic?.imageId) return;
    const prev = relic.imageId;
    updateRelic({ ...relic, imageId: undefined });
    await deleteImage(prev);
  };

  if (!loaded) return null;
  if (!relic) return <NotFound title="レリックが見つかりません" />;

  const save = async () => {
    if (!relic.name.trim() && !relic.nameJa?.trim()) {
      alert('名前を入力してください');
      return;
    }
    await db.relics.put({ ...relic, isCustom: 1 });
    setDirty(false);
    nav(-1);
  };

  const remove = async () => {
    if (!id) return;
    if (!confirm('このレリックを削除しますか？')) return;
    await db.relics.delete(id);
    setDirty(false);
    nav(-1);
  };

  return (
    <>
      <TopBar title={id ? 'レリック編集' : 'レリック新規'} back onBack={() => confirmBack(dirty)} />
      <div className="content">
        <div className="stack" style={{ alignItems: 'center', marginBottom: 12 }}>
          <RelicTile relic={relic} size="lg" imageUrl={imageUrl} />
          <div className="row" style={{ gap: 8 }}>
            <button onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? '処理中…' : relic.imageId ? '🖼️ 画像を差し替え' : '📷 画像をアップロード'}
            </button>
            {relic.imageId && (
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
            256px JPEG に自動圧縮
          </div>
        </div>
        <div className="stack">
          <label className="field">
            <span>名前 (英)</span>
            <input value={relic.name} onChange={(e) => updateRelic({ ...relic, name: e.target.value })} />
          </label>
          <label className="field">
            <span>名前 (日本語)</span>
            <input
              value={relic.nameJa ?? ''}
              onChange={(e) => updateRelic({ ...relic, nameJa: e.target.value })}
            />
          </label>
          <label className="field">
            <span>キャラクター (任意)</span>
            <select
              value={relic.character ?? ''}
              onChange={(e) =>
                updateRelic({ ...relic, character: (e.target.value || undefined) as CharacterId | undefined })
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
              onChange={(e) => updateRelic({ ...relic, rarity: e.target.value as RelicRarity })}
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
              onChange={(e) => updateRelic({ ...relic, description: e.target.value })}
            />
          </label>
          <label className="field">
            <span>メモ</span>
            <textarea
              value={relic.notes ?? ''}
              onChange={(e) => updateRelic({ ...relic, notes: e.target.value })}
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
