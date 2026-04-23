import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import TopBar from '../components/TopBar';
import { CHARACTER_MAP } from '../data/characters';

const RESULT_LABEL: Record<string, { label: string; emoji: string; color: string }> = {
  victory: { label: '勝利', emoji: '👑', color: 'var(--success)' },
  defeat: { label: '敗北', emoji: '💀', color: 'var(--danger)' },
  abandoned: { label: '中断', emoji: '✋', color: 'var(--warn)' },
  in_progress: { label: '進行中', emoji: '▶️', color: 'var(--accent)' }
};

export default function Runs() {
  const runs = useLiveQuery(() => db.runs.orderBy('startedAt').reverse().toArray(), []);

  const stats = useLiveQuery(async () => {
    const all = await db.runs.toArray();
    const byChar: Record<string, { wins: number; losses: number; total: number }> = {};
    for (const r of all) {
      const e = (byChar[r.character] = byChar[r.character] ?? { wins: 0, losses: 0, total: 0 });
      e.total++;
      if (r.result === 'victory') e.wins++;
      else if (r.result === 'defeat') e.losses++;
    }
    return byChar;
  }, []);

  return (
    <>
      <TopBar title="ラン記録" />
      <div className="content">
        {stats && Object.keys(stats).length > 0 && (
          <>
            <div className="section-title">キャラ別成績</div>
            <div className="card card-compact">
              {Object.entries(stats).map(([ch, s]) => {
                const c = CHARACTER_MAP[ch];
                const rate = s.wins + s.losses > 0 ? (s.wins / (s.wins + s.losses)) * 100 : 0;
                return (
                  <div key={ch} style={{ marginBottom: 8 }}>
                    <div className="row-between" style={{ marginBottom: 4 }}>
                      <span className="pill" data-char={ch}>
                        {c?.nameJa ?? ch}
                      </span>
                      <span className="dim">
                        {s.wins}勝 / {s.losses}敗 / 計{s.total} · {rate.toFixed(0)}%
                      </span>
                    </div>
                    <div className="bar">
                      <span style={{ width: `${rate}%`, background: 'var(--success)' }} />
                      <span
                        style={{
                          width: `${s.wins + s.losses > 0 ? ((s.losses / (s.wins + s.losses)) * 100) : 0}%`,
                          background: 'var(--danger)'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="section-title">履歴</div>
        {runs && runs.length === 0 && (
          <div className="empty">
            <h3>まだランがありません</h3>
            <p>右下の + から1ラン目を記録してみよう。</p>
          </div>
        )}
        {runs?.map((r) => {
          const c = CHARACTER_MAP[r.character];
          const res = RESULT_LABEL[r.result];
          return (
            <Link key={r.id} to={`/runs/${r.id}`} className="list-item">
              <span style={{ fontSize: 22 }}>{res?.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>
                  {c?.nameJa ?? r.character} · F{r.floorReached ?? '-'}
                </div>
                <div className="dim">
                  {new Date(r.startedAt).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  {r.ascension ? ` · A${r.ascension}` : ''}
                </div>
              </div>
              <span style={{ color: res?.color, fontWeight: 700, fontSize: 13 }}>
                {res?.label}
              </span>
            </Link>
          );
        })}
      </div>
      <Link to="/runs/new" className="fab" aria-label="ラン追加">
        +
      </Link>
    </>
  );
}
