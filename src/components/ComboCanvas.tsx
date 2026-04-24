import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as RPointerEvent } from 'react';
import type { Card, ComboEdge, ComboNode, Relic } from '../types';
import CardTile from './CardTile';
import RelicTile from './RelicTile';

interface Props {
  nodes: ComboNode[];
  edges: ComboEdge[];
  cardMap: Map<string, Card>;
  relicMap: Map<string, Relic>;
  images: Map<string, string>;
  connectMode: boolean;
  selectedNodeId: string | null;
  pendingFromId: string | null;
  onTapNode: (id: string) => void;
  onMoveNode: (id: string, x: number, y: number) => void;
  onTapEdge: (id: string) => void;
}

// 簡易なビジュアルキャンバス。
// - 1本指ドラッグ = ノードを掴めば移動 / 背景なら全体パン
// - 2本指ピンチ = ズーム
// - ConnectMode 中はタップ2つで辺を張る
export default function ComboCanvas({
  nodes,
  edges,
  cardMap,
  relicMap,
  images,
  connectMode,
  selectedNodeId,
  pendingFromId,
  onTapNode,
  onMoveNode,
  onTapEdge
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [view, setView] = useState({ tx: 0, ty: 0, scale: 1 });
  const draggingNode = useRef<null | { id: string; dx: number; dy: number }>(null);
  const panning = useRef<null | { startX: number; startY: number; tx0: number; ty0: number }>(null);
  const pinching = useRef<null | { d0: number; s0: number; mx: number; my: number; tx0: number; ty0: number }>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const movedDuringDrag = useRef(false);
  const pendingMove = useRef<null | { id: string; x: number; y: number }>(null);
  const rafId = useRef<number | null>(null);

  const scheduleMove = (id: string, x: number, y: number) => {
    pendingMove.current = { id, x, y };
    if (rafId.current != null) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      const m = pendingMove.current;
      pendingMove.current = null;
      if (m) onMoveNode(m.id, m.x, m.y);
    });
  };

  useEffect(() => {
    return () => {
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  // wheel zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setView((v) => {
        const next = Math.min(3, Math.max(0.4, v.scale * (e.deltaY > 0 ? 0.9 : 1.1)));
        const rect = el.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const k = next / v.scale;
        return { scale: next, tx: mx - (mx - v.tx) * k, ty: my - (my - v.ty) * k };
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const worldPt = (clientX: number, clientY: number) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const x = (clientX - rect.left - view.tx) / view.scale;
    const y = (clientY - rect.top - view.ty) / view.scale;
    return { x, y };
  };

  const handlePointerDown = (e: RPointerEvent<HTMLDivElement>, nodeId?: string) => {
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    movedDuringDrag.current = false;

    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      const d0 = Math.hypot(a.x - b.x, a.y - b.y);
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      pinching.current = { d0, s0: view.scale, mx, my, tx0: view.tx, ty0: view.ty };
      draggingNode.current = null;
      panning.current = null;
      return;
    }

    if (nodeId) {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      const p = worldPt(e.clientX, e.clientY);
      draggingNode.current = { id: nodeId, dx: p.x - node.x, dy: p.y - node.y };
    } else {
      panning.current = { startX: e.clientX, startY: e.clientY, tx0: view.tx, ty0: view.ty };
    }
  };

  const handlePointerMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (pointers.current.has(e.pointerId)) {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    if (pinching.current && pointers.current.size >= 2) {
      const [a, b] = Array.from(pointers.current.values());
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const s = Math.min(3, Math.max(0.4, pinching.current.s0 * (d / pinching.current.d0)));
      const rect = containerRef.current!.getBoundingClientRect();
      const mx = pinching.current.mx - rect.left;
      const my = pinching.current.my - rect.top;
      const k = s / pinching.current.s0;
      const tx = mx - (mx - pinching.current.tx0) * k;
      const ty = my - (my - pinching.current.ty0) * k;
      setView({ scale: s, tx, ty });
      movedDuringDrag.current = true;
      return;
    }

    if (draggingNode.current) {
      const p = worldPt(e.clientX, e.clientY);
      scheduleMove(draggingNode.current.id, p.x - draggingNode.current.dx, p.y - draggingNode.current.dy);
      movedDuringDrag.current = true;
      return;
    }

    if (panning.current) {
      const dx = e.clientX - panning.current.startX;
      const dy = e.clientY - panning.current.startY;
      if (Math.abs(dx) + Math.abs(dy) > 3) movedDuringDrag.current = true;
      setView((v) => ({ ...v, tx: panning.current!.tx0 + dx, ty: panning.current!.ty0 + dy }));
    }
  };

  const handlePointerUp = (e: RPointerEvent<HTMLDivElement>, nodeId?: string) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinching.current = null;

    if (!movedDuringDrag.current && nodeId) {
      onTapNode(nodeId);
    }

    draggingNode.current = null;
    if (pointers.current.size === 0) panning.current = null;
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={(e) => handlePointerDown(e)}
      onPointerMove={handlePointerMove}
      onPointerUp={(e) => handlePointerUp(e)}
      onPointerCancel={(e) => handlePointerUp(e)}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        touchAction: 'none',
        background:
          'radial-gradient(1200px 600px at 30% 10%, #2a1f45, transparent), #12101a',
        backgroundSize: '20px 20px',
        cursor: connectMode ? 'crosshair' : 'grab'
      }}
    >
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <g transform={`translate(${view.tx} ${view.ty}) scale(${view.scale})`}>
          {edges.map((ed) => {
            const a = nodes.find((n) => n.id === ed.from);
            const b = nodes.find((n) => n.id === ed.to);
            if (!a || !b) return null;
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            return (
              <g key={ed.id} style={{ pointerEvents: 'auto' }} onClick={() => onTapEdge(ed.id)}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="#c289ff"
                  strokeWidth={3 / view.scale}
                  strokeLinecap="round"
                  opacity={0.85}
                />
                {ed.label && (
                  <g>
                    <rect
                      x={mx - 28}
                      y={my - 10}
                      width={56}
                      height={20}
                      rx={6}
                      fill="#1e1830"
                      stroke="#c289ff"
                      strokeWidth={1.5 / view.scale}
                    />
                    <text
                      x={mx}
                      y={my + 4}
                      textAnchor="middle"
                      fontSize={12}
                      fill="#fff"
                      style={{ userSelect: 'none' }}
                    >
                      {ed.label.slice(0, 6)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
          {pendingFromId &&
            (() => {
              const a = nodes.find((n) => n.id === pendingFromId);
              if (!a) return null;
              return (
                <circle
                  cx={a.x}
                  cy={a.y}
                  r={46}
                  fill="none"
                  stroke="#c289ff"
                  strokeWidth={2 / view.scale}
                  strokeDasharray={`${6 / view.scale} ${4 / view.scale}`}
                />
              );
            })()}
        </g>
      </svg>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: '0 0',
          transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.scale})`,
          pointerEvents: 'none'
        }}
      >
        {nodes.map((n) => {
          const isSelected = selectedNodeId === n.id || pendingFromId === n.id;
          const commonStyle: React.CSSProperties = {
            position: 'absolute',
            left: n.x,
            top: n.y,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'auto',
            touchAction: 'none'
          };
          if (n.kind === 'card') {
            const c = n.refId ? cardMap.get(n.refId) : undefined;
            if (!c) return null;
            return (
              <div
                key={n.id}
                style={commonStyle}
                onPointerDown={(e) => handlePointerDown(e, n.id)}
                onPointerUp={(e) => handlePointerUp(e, n.id)}
              >
                <CardTile
                  card={c}
                  size="sm"
                  selected={isSelected}
                  imageUrl={c.imageId ? images.get(c.imageId) : undefined}
                />
              </div>
            );
          }
          if (n.kind === 'relic') {
            const r = n.refId ? relicMap.get(n.refId) : undefined;
            if (!r) return null;
            return (
              <div
                key={n.id}
                style={commonStyle}
                onPointerDown={(e) => handlePointerDown(e, n.id)}
                onPointerUp={(e) => handlePointerUp(e, n.id)}
              >
                <RelicTile
                  relic={r}
                  size="sm"
                  selected={isSelected}
                  imageUrl={r.imageId ? images.get(r.imageId) : undefined}
                />
              </div>
            );
          }
          return (
            <div
              key={n.id}
              style={commonStyle}
              onPointerDown={(e) => handlePointerDown(e, n.id)}
              onPointerUp={(e) => handlePointerUp(e, n.id)}
            >
              <div
                style={{
                  background: isSelected ? '#9466d4' : '#2a2240',
                  border: '2px solid ' + (isSelected ? '#fff' : '#3a305a'),
                  color: '#fff',
                  padding: '6px 10px',
                  borderRadius: 8,
                  fontSize: 12,
                  maxWidth: 140,
                  wordBreak: 'break-word',
                  textAlign: 'center'
                }}
              >
                {n.text || '(タップして選択 → 下で編集)'}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          right: 8,
          top: 8,
          background: 'rgba(0,0,0,0.4)',
          borderRadius: 8,
          display: 'flex',
          gap: 4,
          padding: 4
        }}
      >
        <button
          onClick={() => setView((v) => ({ ...v, scale: Math.min(3, v.scale * 1.2) }))}
          style={{ minHeight: 32, padding: '4px 10px', fontSize: 14 }}
        >
          ＋
        </button>
        <button
          onClick={() => setView((v) => ({ ...v, scale: Math.max(0.4, v.scale / 1.2) }))}
          style={{ minHeight: 32, padding: '4px 10px', fontSize: 14 }}
        >
          −
        </button>
        <button
          onClick={() => setView({ tx: 0, ty: 0, scale: 1 })}
          style={{ minHeight: 32, padding: '4px 10px', fontSize: 12 }}
        >
          ⟳
        </button>
      </div>
    </div>
  );
}
