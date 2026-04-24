import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import TopBar from '../components/TopBar';
import ComboCanvas from '../components/ComboCanvas';
import TilePicker from '../components/TilePicker';
import { CHARACTERS } from '../data/characters';
import type { Card, CharacterId, ComboEdge, ComboMemo, ComboNode, Relic } from '../types';

function newMemo(): ComboMemo {
  const now = Date.now();
  return {
    title: '新しいコンボ',
    nodes: [],
    edges: [],
    body: '',
    tags: [],
    starred: 0,
    createdAt: now,
    updatedAt: now
  };
}

const uid = () => 'n_' + Math.random().toString(36).slice(2, 10);

export default function MemoEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const [memo, setMemo] = useState<ComboMemo | null>(null);
  const [pick, setPick] = useState<null | 'card' | 'relic'>(null);
  const [connectMode, setConnectMode] = useState(false);
  const [pendingFromId, setPendingFromId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showProps, setShowProps] = useState(false);
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [edgeLabelDraft, setEdgeLabelDraft] = useState('');

  useEffect(() => {
    if (!id) setMemo(newMemo());
    else db.memos.get(Number(id)).then((m) => setMemo(m ?? null));
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

  if (!memo) return null;

  const save = async () => {
    const now = Date.now();
    if (memo.id) await db.memos.put({ ...memo, updatedAt: now });
    else await db.memos.add({ ...memo, createdAt: now, updatedAt: now });
    nav(-1);
  };

  const remove = async () => {
    if (!memo.id) return;
    if (!confirm('このコンボメモを削除しますか？')) return;
    await db.memos.delete(memo.id);
    nav(-1);
  };

  const addNodeAtCenter = (partial: Omit<ComboNode, 'id' | 'x' | 'y'>) => {
    setMemo((prev) => {
      if (!prev) return prev;
      const offset = (prev.nodes.length % 12) * 22;
      const node: ComboNode = {
        id: uid(),
        x: 160 + offset,
        y: 200 + offset,
        ...partial
      };
      return { ...prev, nodes: [...prev.nodes, node] };
    });
  };

  const handleTapNode = (nid: string) => {
    if (connectMode) {
      if (!pendingFromId) {
        setPendingFromId(nid);
      } else if (pendingFromId === nid) {
        setPendingFromId(null);
      } else {
        const edge: ComboEdge = {
          id: 'e_' + Math.random().toString(36).slice(2, 10),
          from: pendingFromId,
          to: nid
        };
        setMemo({ ...memo, edges: [...memo.edges, edge] });
        setPendingFromId(null);
      }
      return;
    }
    setSelectedNodeId(nid);
    setShowProps(true);
  };

  const handleMoveNode = (nid: string, x: number, y: number) => {
    setMemo((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        nodes: prev.nodes.map((n) => (n.id === nid ? { ...n, x, y } : n))
      };
    });
  };

  const handleTapEdge = (eid: string) => {
    const ed = memo.edges.find((e) => e.id === eid);
    if (!ed) return;
    setEdgeLabelDraft(ed.label ?? '');
    setEditingEdgeId(eid);
  };

  const applyEdgeLabel = () => {
    if (!editingEdgeId) return;
    setMemo({
      ...memo,
      edges: memo.edges.map((e) =>
        e.id === editingEdgeId ? { ...e, label: edgeLabelDraft.trim() || undefined } : e
      )
    });
    setEditingEdgeId(null);
  };

  const deleteEdge = () => {
    if (!editingEdgeId) return;
    setMemo({ ...memo, edges: memo.edges.filter((e) => e.id !== editingEdgeId) });
    setEditingEdgeId(null);
  };

  const deleteSelected = () => {
    if (!selectedNodeId) return;
    setMemo({
      ...memo,
      nodes: memo.nodes.filter((n) => n.id !== selectedNodeId),
      edges: memo.edges.filter((e) => e.from !== selectedNodeId && e.to !== selectedNodeId)
    });
    setSelectedNodeId(null);
    setShowProps(false);
  };

  const selectedNode = memo.nodes.find((n) => n.id === selectedNodeId) ?? null;

  return (
    <>
      <TopBar
        title={id ? 'コンボ編集' : 'コンボ新規'}
        back
        right={
          <button
            className="ghost"
            onClick={() => setMemo({ ...memo, starred: memo.starred ? 0 : 1 })}
            aria-label="お気に入り"
          >
            {memo.starred ? '⭐' : '☆'}
          </button>
        }
      />
      <div style={{ padding: '8px 12px 0 12px' }}>
        <input
          value={memo.title}
          onChange={(e) => setMemo({ ...memo, title: e.target.value })}
          placeholder="タイトル"
          style={{ fontWeight: 600 }}
        />
        <div className="row" style={{ marginTop: 8, gap: 8, flexWrap: 'wrap' }}>
          <select
            value={memo.character ?? ''}
            onChange={(e) => setMemo({ ...memo, character: (e.target.value || undefined) as CharacterId | undefined })}
            style={{ flex: 1, minWidth: 140 }}
          >
            <option value="">キャラ未指定</option>
            {CHARACTERS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameJa ?? c.name}
              </option>
            ))}
          </select>
          <input
            style={{ flex: 2, minWidth: 140 }}
            value={memo.tags.join(' ')}
            onChange={(e) => setMemo({ ...memo, tags: e.target.value.split(/\s+/).filter(Boolean) })}
            placeholder="タグ (スペース区切り)"
          />
        </div>
      </div>

      <div
        style={{
          height: '55vh',
          minHeight: 380,
          margin: '10px 12px',
          borderRadius: 12,
          border: '1px solid var(--border)',
          overflow: 'hidden'
        }}
      >
        <ComboCanvas
          nodes={memo.nodes}
          edges={memo.edges}
          cardMap={cardMap}
          relicMap={relicMap}
          connectMode={connectMode}
          selectedNodeId={selectedNodeId}
          pendingFromId={pendingFromId}
          onTapNode={handleTapNode}
          onMoveNode={handleMoveNode}
          onTapEdge={handleTapEdge}
          onUpdateTextNode={(nid, t) =>
            setMemo({
              ...memo,
              nodes: memo.nodes.map((n) => (n.id === nid ? { ...n, text: t } : n))
            })
          }
        />
      </div>

      <div style={{ padding: '0 12px', paddingBottom: 100 }}>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <button className="primary" onClick={() => setPick('card')}>
            🎴 カード追加
          </button>
          <button className="primary" onClick={() => setPick('relic')}>
            🏺 レリック追加
          </button>
          <button
            onClick={() =>
              addNodeAtCenter({ kind: 'text', text: '' })
            }
          >
            📝 テキスト
          </button>
          <button
            className={connectMode ? 'primary' : ''}
            onClick={() => {
              setConnectMode((v) => !v);
              setPendingFromId(null);
            }}
          >
            {connectMode ? '🔗 接続モード中 (終了)' : '🔗 接続モード'}
          </button>
        </div>
        <div className="dim" style={{ marginTop: 6, fontSize: 12 }}>
          タイルをドラッグで移動。2本指ピンチで拡大縮小。接続モード中は2つのタイルを順にタップで線を張る。線をタップでラベル編集/削除。
        </div>

        {showProps && selectedNode && (
          <div className="card" style={{ marginTop: 10 }}>
            <div className="row-between">
              <strong>
                選択中:{' '}
                {selectedNode.kind === 'card'
                  ? cardMap.get(selectedNode.refId ?? '')?.nameJa ||
                    cardMap.get(selectedNode.refId ?? '')?.name
                  : selectedNode.kind === 'relic'
                    ? relicMap.get(selectedNode.refId ?? '')?.nameJa ||
                      relicMap.get(selectedNode.refId ?? '')?.name
                    : 'テキスト'}
              </strong>
              <button onClick={() => setShowProps(false)}>✕</button>
            </div>
            {selectedNode.kind === 'text' && (
              <textarea
                value={selectedNode.text ?? ''}
                onChange={(e) =>
                  setMemo({
                    ...memo,
                    nodes: memo.nodes.map((n) =>
                      n.id === selectedNode.id ? { ...n, text: e.target.value } : n
                    )
                  })
                }
                placeholder="テキスト内容"
              />
            )}
            <div className="row" style={{ gap: 8, marginTop: 8 }}>
              <button className="danger" onClick={deleteSelected}>
                このノードを削除
              </button>
            </div>
          </div>
        )}

        <label className="field" style={{ marginTop: 14 }}>
          <span>コンボ説明</span>
          <textarea
            value={memo.body}
            onChange={(e) => setMemo({ ...memo, body: e.target.value })}
            placeholder="例: 力積 + 二刀流 + 怒りで1ターンキル狙い"
          />
        </label>

        <div className="row" style={{ marginTop: 16, gap: 10 }}>
          <button className="primary grow" onClick={save}>
            保存
          </button>
          {memo.id && (
            <button className="danger" onClick={remove}>
              削除
            </button>
          )}
        </div>
      </div>

      {editingEdgeId && (
        <div className="modal-backdrop" onClick={() => setEditingEdgeId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="row-between">
              <h2>線を編集</h2>
              <button className="ghost" onClick={() => setEditingEdgeId(null)} aria-label="閉じる">
                ✕
              </button>
            </div>
            <label className="field">
              <span>ラベル (空欄で外す)</span>
              <input
                value={edgeLabelDraft}
                onChange={(e) => setEdgeLabelDraft(e.target.value)}
                placeholder="例: 毎ターン / 強化後 / 起点"
                autoFocus
              />
            </label>
            <div className="row" style={{ marginTop: 12, gap: 10 }}>
              <button className="primary grow" onClick={applyEdgeLabel}>
                保存
              </button>
              <button className="danger" onClick={deleteEdge}>
                線を削除
              </button>
            </div>
          </div>
        </div>
      )}

      {pick === 'card' && (
        <TilePicker
          mode="card"
          multi
          characterFilter={memo.character}
          onPick={(cid) => addNodeAtCenter({ kind: 'card', refId: cid })}
          onClose={() => setPick(null)}
        />
      )}
      {pick === 'relic' && (
        <TilePicker
          mode="relic"
          multi
          onPick={(rid) => addNodeAtCenter({ kind: 'relic', refId: rid })}
          onClose={() => setPick(null)}
        />
      )}
    </>
  );
}
