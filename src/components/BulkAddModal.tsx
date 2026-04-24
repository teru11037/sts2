import { useMemo, useState } from 'react';
import type { Card } from '../types';

interface Props {
  cards: Card[];
  characterFilter?: Card['character'];
  onApply: (ids: string[]) => void;
  onClose: () => void;
}

// 入力1行 = 1カード。日本語名・英名どちらも許容、末尾 "+" で強化印は参考のみ (重複数も反映)。
// 曖昧マッチ: 完全一致 → 部分一致 → 失敗
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/\+$/u, '')
    .replace(/[・·\s]+/gu, '')
    .trim();
}

interface Parsed {
  raw: string;
  match: Card | null;
  candidates: Card[];
}

export default function BulkAddModal({ cards, characterFilter, onApply, onClose }: Props) {
  const [text, setText] = useState('');

  const pool = useMemo(
    () =>
      characterFilter
        ? cards.filter(
            (c) =>
              c.character === characterFilter ||
              c.character === 'colorless' ||
              c.character === 'neutral'
          )
        : cards,
    [cards, characterFilter]
  );

  const nameIndex = useMemo(() => {
    const m = new Map<string, Card>();
    for (const c of pool) {
      if (c.nameJa) m.set(normalize(c.nameJa), c);
      m.set(normalize(c.name), c);
    }
    return m;
  }, [pool]);

  const parsed: Parsed[] = useMemo(() => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    return lines.map((raw) => {
      const key = normalize(raw);
      const exact = nameIndex.get(key);
      if (exact) return { raw, match: exact, candidates: [] };
      const candidates = pool
        .filter(
          (c) =>
            (c.nameJa && normalize(c.nameJa).includes(key)) ||
            normalize(c.name).includes(key)
        )
        .slice(0, 4);
      return { raw, match: candidates[0] ?? null, candidates };
    });
  }, [text, nameIndex, pool]);

  const hits = parsed.filter((p) => p.match).length;
  const misses = parsed.length - hits;

  const apply = () => {
    const ids = parsed.filter((p) => p.match).map((p) => p.match!.id);
    onApply(ids);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="row-between">
          <h2>カード一括追加</h2>
          <button className="ghost" onClick={onClose} aria-label="閉じる">
            ✕
          </button>
        </div>
        <div className="dim" style={{ fontSize: 12, marginBottom: 6 }}>
          1行に1枚ずつカード名を貼り付けてください (日本語・英名どちらも可)。
          同じ名前を複数行書けば同じ枚数だけ追加されます。
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={'例:\nストライク\nストライク\n防御\nダガースロー\n略奪+'}
          style={{ minHeight: 160, fontFamily: 'ui-monospace, monospace', fontSize: 13 }}
        />
        <div className="row" style={{ marginTop: 8, gap: 10 }}>
          <div className="dim" style={{ fontSize: 13 }}>
            マッチ: <strong style={{ color: 'var(--success)' }}>{hits}</strong> / 未検出:{' '}
            <strong style={{ color: misses ? 'var(--danger)' : 'var(--fg-dim)' }}>{misses}</strong>
          </div>
        </div>

        {parsed.length > 0 && (
          <div className="card card-compact" style={{ marginTop: 10, maxHeight: 200, overflowY: 'auto' }}>
            {parsed.map((p, i) => (
              <div
                key={i}
                style={{
                  padding: '4px 0',
                  borderBottom: '1px solid var(--border-soft)',
                  fontSize: 13
                }}
              >
                <span style={{ color: p.match ? 'var(--success)' : 'var(--danger)' }}>
                  {p.match ? '✓' : '✗'}
                </span>{' '}
                <span style={{ color: 'var(--fg-muted)' }}>{p.raw}</span>
                {p.match ? (
                  <span>
                    {' '}
                    → <strong>{p.match.nameJa ?? p.match.name}</strong>
                  </span>
                ) : p.candidates.length ? (
                  <span className="dim">
                    {' '}
                    候補なし: {p.candidates.map((c) => c.nameJa ?? c.name).join(', ')}
                  </span>
                ) : (
                  <span className="dim"> 候補なし</span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="row" style={{ marginTop: 12, gap: 10 }}>
          <button className="primary grow" onClick={apply} disabled={hits === 0}>
            {hits} 枚を追加
          </button>
          <button onClick={onClose}>キャンセル</button>
        </div>
      </div>
    </div>
  );
}
