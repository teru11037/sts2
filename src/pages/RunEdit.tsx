import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import TopBar from '../components/TopBar';
import CardTile from '../components/CardTile';
import RelicTile from '../components/RelicTile';
import TilePicker from '../components/TilePicker';
import BulkAddModal from '../components/BulkAddModal';
import NotFound from '../components/NotFound';
import { CHARACTERS } from '../data/characters';
import { useImagesMap } from '../hooks/useImagesMap';
import { useUnsavedGuard, confirmBack } from '../hooks/useUnsavedGuard';
import { toInt } from '../lib/num';
import type { Card, CharacterId, Relic, Run, RunEvent, RunResult } from '../types';

function newRun(): Run {
  return {
    character: 'ironclad',
    ascension: 0,
    result: 'in_progress',
    floorReached: 0,
    finalDeck: [],
    finalRelics: [],
    events: [],
    startedAt: Date.now(),
    notes: ''
  };
}

const EVENT_KIND_LABEL: Record<RunEvent['kind'], string> = {
  card_added: '➕ カード獲得',
  card_removed: '➖ カード除去',
  card_upgraded: '⬆️ 強化',
  card_transformed: '🔄 変化',
  relic_obtained: '🏺 レリック獲得',
  relic_lost: '💔 レリック喪失',
  boss_defeated: '🐉 ボス撃破',
  elite_defeated: '⚔️ エリート撃破',
  event: '❓ イベント',
  shop: '🛒 ショップ',
  rest: '🏕️ 休憩',
  note: '📝 メモ'
};

export default function RunEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const [run, setRun] = useState<Run | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [pick, setPick] = useState<null | { mode: 'card' | 'relic'; target: 'deck' | 'relic' | 'event'; eventKind?: RunEvent['kind'] }>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [showBulk, setShowBulk] = useState(false);

  useUnsavedGuard(dirty);

  useEffect(() => {
    if (!id) {
      setRun(newRun());
      setLoaded(true);
    } else {
      db.runs.get(Number(id)).then((r) => {
        setRun(r ?? null);
        setLoaded(true);
      });
    }
  }, [id]);

  const updateRun = (next: Run) => {
    setRun(next);
    setDirty(true);
  };

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
  const images = useImagesMap();

  if (!loaded) return null;
  if (!run) return <NotFound title="ランが見つかりません" />;

  const save = async () => {
    const endedAt = run.result === 'in_progress' ? undefined : run.endedAt ?? Date.now();
    const toSave: Run = { ...run, endedAt };
    if (run.id) {
      await db.runs.put(toSave);
    } else {
      await db.runs.add(toSave);
    }
    setDirty(false);
    nav(-1);
  };

  const remove = async () => {
    if (!run.id) return;
    if (!confirm('このランを削除しますか？')) return;
    await db.runs.delete(run.id);
    setDirty(false);
    nav(-1);
  };

  const pushEvent = (ev: RunEvent) => {
    updateRun({ ...run, events: [...run.events, ev] });
  };

  const addToDeck = (cardId: string) => {
    updateRun({
      ...run,
      finalDeck: [...run.finalDeck, { cardId, upgraded: 0 }]
    });
    pushEvent({
      id: 'e_' + Math.random().toString(36).slice(2, 10),
      at: Date.now(),
      floor: run.floorReached,
      kind: 'card_added',
      subjectId: cardId
    });
  };

  const removeDeckAt = (i: number) => {
    const cardId = run.finalDeck[i]?.cardId;
    const next = run.finalDeck.slice();
    next.splice(i, 1);
    updateRun({ ...run, finalDeck: next });
    if (cardId)
      pushEvent({
        id: 'e_' + Math.random().toString(36).slice(2, 10),
        at: Date.now(),
        floor: run.floorReached,
        kind: 'card_removed',
        subjectId: cardId
      });
  };

  const toggleUpgrade = (i: number) => {
    const next = run.finalDeck.slice();
    const prev = next[i];
    next[i] = { ...prev, upgraded: prev.upgraded ? 0 : 1 };
    updateRun({ ...run, finalDeck: next });
    pushEvent({
      id: 'e_' + Math.random().toString(36).slice(2, 10),
      at: Date.now(),
      floor: run.floorReached,
      kind: 'card_upgraded',
      subjectId: prev.cardId
    });
  };

  const duplicateDeckAt = (i: number) => {
    const src = run.finalDeck[i];
    if (!src) return;
    const next = run.finalDeck.slice();
    next.splice(i + 1, 0, { ...src });
    updateRun({ ...run, finalDeck: next });
    pushEvent({
      id: 'e_' + Math.random().toString(36).slice(2, 10),
      at: Date.now(),
      floor: run.floorReached,
      kind: 'card_added',
      subjectId: src.cardId,
      detail: '(複製)'
    });
  };

  const addRelic = (relicId: string) => {
    if (run.finalRelics.includes(relicId)) return;
    updateRun({ ...run, finalRelics: [...run.finalRelics, relicId] });
    pushEvent({
      id: 'e_' + Math.random().toString(36).slice(2, 10),
      at: Date.now(),
      floor: run.floorReached,
      kind: 'relic_obtained',
      subjectId: relicId
    });
  };

  const removeRelic = (relicId: string) => {
    updateRun({ ...run, finalRelics: run.finalRelics.filter((r) => r !== relicId) });
    pushEvent({
      id: 'e_' + Math.random().toString(36).slice(2, 10),
      at: Date.now(),
      floor: run.floorReached,
      kind: 'relic_lost',
      subjectId: relicId
    });
  };

  const bumpFloor = (delta: number) => {
    updateRun({ ...run, floorReached: Math.max(0, (run.floorReached ?? 0) + delta) });
  };

  const recordBoss = () => {
    updateRun({
      ...run,
      events: [
        ...run.events,
        {
          id: 'e_' + Math.random().toString(36).slice(2, 10),
          at: Date.now(),
          floor: run.floorReached,
          kind: 'boss_defeated'
        }
      ]
    });
  };

  const recordElite = () => {
    updateRun({
      ...run,
      events: [
        ...run.events,
        {
          id: 'e_' + Math.random().toString(36).slice(2, 10),
          at: Date.now(),
          floor: run.floorReached,
          kind: 'elite_defeated'
        }
      ]
    });
  };

  const bulkAddCards = (ids: string[]) => {
    if (!ids.length) return;
    updateRun({
      ...run,
      finalDeck: [...run.finalDeck, ...ids.map((cardId) => ({ cardId, upgraded: 0 }))]
    });
  };

  const addNote = () => {
    if (!noteDraft.trim()) return;
    pushEvent({
      id: 'e_' + Math.random().toString(36).slice(2, 10),
      at: Date.now(),
      floor: run.floorReached,
      kind: 'note',
      detail: noteDraft.trim()
    });
    setNoteDraft('');
  };

  return (
    <>
      <TopBar title={id ? 'ラン編集' : 'ラン新規'} back onBack={() => confirmBack(dirty)} />
      <div className="content">
        <div className="row" style={{ gap: 10 }}>
          <label className="field" style={{ flex: 1 }}>
            <span>キャラ</span>
            <select
              value={run.character}
              onChange={(e) => updateRun({ ...run, character: e.target.value as CharacterId })}
            >
              {CHARACTERS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameJa ?? c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field" style={{ width: 100 }}>
            <span>Asc</span>
            <input
              type="number"
              inputMode="numeric"
              value={run.ascension ?? 0}
              min={0}
              max={20}
              onChange={(e) => updateRun({ ...run, ascension: toInt(e.target.value, 0) })}
            />
          </label>
          <label className="field" style={{ width: 100 }}>
            <span>Floor</span>
            <input
              type="number"
              inputMode="numeric"
              value={run.floorReached ?? 0}
              min={0}
              onChange={(e) => updateRun({ ...run, floorReached: toInt(e.target.value, 0) })}
            />
          </label>
        </div>
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          <button onClick={() => bumpFloor(1)}>+1 F</button>
          <button onClick={() => bumpFloor(5)}>+5 F</button>
          <button onClick={() => bumpFloor(-1)}>-1 F</button>
          <button onClick={recordElite}>⚔️ エリート撃破</button>
          <button onClick={recordBoss}>🐉 ボス撃破</button>
        </div>
        <label className="field">
          <span>結果</span>
          <select
            value={run.result}
            onChange={(e) => updateRun({ ...run, result: e.target.value as RunResult })}
          >
            <option value="in_progress">進行中</option>
            <option value="victory">勝利</option>
            <option value="defeat">敗北</option>
            <option value="abandoned">中断</option>
          </select>
        </label>

        <div className="section-title">最終デッキ ({run.finalDeck.length})</div>
        <div
          style={{
            display: 'grid',
            gap: 8,
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            justifyItems: 'center'
          }}
        >
          {run.finalDeck.map((dc, i) => {
            const c = cardMap.get(dc.cardId);
            if (!c) return null;
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <CardTile
                  card={c}
                  size="sm"
                  upgraded={!!dc.upgraded}
                  imageUrl={c.imageId ? images.get(c.imageId) : undefined}
                  onClick={() => toggleUpgrade(i)}
                />
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => toggleUpgrade(i)}
                    style={{ padding: '2px 6px', fontSize: 11, minHeight: 0 }}
                    aria-label="強化切替"
                  >
                    {dc.upgraded ? '+' : '通'}
                  </button>
                  <button
                    onClick={() => duplicateDeckAt(i)}
                    style={{ padding: '2px 6px', fontSize: 11, minHeight: 0 }}
                    aria-label="複製"
                  >
                    ⧉
                  </button>
                  <button
                    className="danger"
                    onClick={() => removeDeckAt(i)}
                    style={{ padding: '2px 6px', fontSize: 11, minHeight: 0 }}
                    aria-label="削除"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="row" style={{ marginTop: 8, gap: 8 }}>
          <button className="primary grow" onClick={() => setPick({ mode: 'card', target: 'deck' })}>
            ＋ カード獲得
          </button>
          <button onClick={() => setShowBulk(true)}>📋 最終デッキ貼付</button>
        </div>

        <div className="section-title">レリック ({run.finalRelics.length})</div>
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))', justifyItems: 'center' }}>
          {run.finalRelics.map((rid) => {
            const r = relicMap.get(rid);
            if (!r) return null;
            return (
              <div key={rid} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <RelicTile
                  relic={r}
                  size="sm"
                  imageUrl={r.imageId ? images.get(r.imageId) : undefined}
                  onClick={() => removeRelic(rid)}
                />
                <div style={{ fontSize: 9, color: 'var(--fg-muted)', textAlign: 'center', maxWidth: 64 }}>
                  {r.nameJa ?? r.name}
                </div>
              </div>
            );
          })}
        </div>
        <button className="primary" style={{ marginTop: 8 }} onClick={() => setPick({ mode: 'relic', target: 'relic' })}>
          ＋ レリック獲得
        </button>

        <div className="section-title">メモイベント</div>
        <div className="row" style={{ gap: 8 }}>
          <input
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            placeholder="例: F12 エリート撃破、HP残20"
          />
          <button className="primary" onClick={addNote}>
            追加
          </button>
        </div>

        <div className="section-title">履歴</div>
        <div className="card card-compact">
          {run.events.length === 0 && <div className="dim">まだイベントがありません。</div>}
          {run.events
            .slice()
            .reverse()
            .map((ev) => {
              const subject = ev.subjectId
                ? cardMap.get(ev.subjectId)?.nameJa ||
                  cardMap.get(ev.subjectId)?.name ||
                  relicMap.get(ev.subjectId)?.nameJa ||
                  relicMap.get(ev.subjectId)?.name ||
                  ev.subjectId
                : '';
              return (
                <div key={ev.id} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13 }}>
                    {EVENT_KIND_LABEL[ev.kind]} {subject} {ev.detail && `— ${ev.detail}`}
                  </div>
                  <div className="dim" style={{ fontSize: 11 }}>
                    F{ev.floor ?? '-'} · {new Date(ev.at).toLocaleTimeString('ja-JP')}
                  </div>
                </div>
              );
            })}
        </div>

        <label className="field" style={{ marginTop: 12 }}>
          <span>総評メモ</span>
          <textarea value={run.notes ?? ''} onChange={(e) => updateRun({ ...run, notes: e.target.value })} />
        </label>

        <div className="row" style={{ marginTop: 16, gap: 10 }}>
          <button className="primary grow" onClick={save}>
            保存
          </button>
          {run.id && (
            <button className="danger" onClick={remove}>
              削除
            </button>
          )}
        </div>
      </div>

      {pick && (
        <TilePicker
          mode={pick.mode}
          multi
          characterFilter={pick.mode === 'card' ? run.character : undefined}
          onPick={(pid) => {
            if (pick.target === 'deck') addToDeck(pid);
            else if (pick.target === 'relic') addRelic(pid);
          }}
          onClose={() => setPick(null)}
          selectedIds={pick.target === 'relic' ? run.finalRelics : undefined}
        />
      )}
      {showBulk && (
        <BulkAddModal
          cards={allCards ?? []}
          characterFilter={run.character}
          onApply={(ids) => {
            bulkAddCards(ids);
            setShowBulk(false);
          }}
          onClose={() => setShowBulk(false)}
        />
      )}
    </>
  );
}
