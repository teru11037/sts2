import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import TopBar from '../components/TopBar';

export default function Home() {
  const counts = useLiveQuery(async () => {
    const [cards, relics, decks, runs, memos] = await Promise.all([
      db.cards.count(),
      db.relics.count(),
      db.decks.count(),
      db.runs.count(),
      db.memos.count()
    ]);
    return { cards, relics, decks, runs, memos };
  });

  const latestRun = useLiveQuery(async () =>
    db.runs.orderBy('startedAt').reverse().limit(1).first()
  );

  const starredMemos = useLiveQuery(async () =>
    db.memos.where('starred').equals(1).toArray()
  );

  return (
    <>
      <TopBar
        title="STS2 Companion"
        right={
          <Link to="/settings" className="ghost" style={{ padding: 8 }} aria-label="設定">
            ⚙️
          </Link>
        }
      />
      <div className="content">
        <div className="hstats">
          <div>
            <div className="n">{counts?.cards ?? '-'}</div>
            <div className="l">カード</div>
          </div>
          <div>
            <div className="n">{counts?.relics ?? '-'}</div>
            <div className="l">レリック</div>
          </div>
          <div>
            <div className="n">{counts?.runs ?? '-'}</div>
            <div className="l">ラン</div>
          </div>
        </div>

        <div className="stack">
          <Link to="/runs/new" className="card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
            <div className="row-between">
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>🟢 ラン記録を始める</div>
                <div className="dim">キャラ選択 → デッキ/レリック/イベントを記録</div>
              </div>
              <div style={{ fontSize: 22 }}>→</div>
            </div>
          </Link>

          <Link to="/decks/new" className="card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
            <div className="row-between">
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>🧩 デッキを組む</div>
                <div className="dim">タイルをタップしてデッキ構築</div>
              </div>
              <div style={{ fontSize: 22 }}>→</div>
            </div>
          </Link>

          <Link to="/memos/new" className="card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
            <div className="row-between">
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>🕸️ コンボを図にする</div>
                <div className="dim">カードを配置して線で繋ぐビジュアルエディタ</div>
              </div>
              <div style={{ fontSize: 22 }}>→</div>
            </div>
          </Link>
        </div>

        {latestRun && (
          <>
            <div className="section-title">直近のラン</div>
            <Link to={`/runs/${latestRun.id}`} className="list-item">
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>
                  {latestRun.character} / {labelResult(latestRun.result)} / F{latestRun.floorReached ?? '-'}
                </div>
                <div className="dim">
                  {new Date(latestRun.startedAt).toLocaleString('ja-JP')}
                </div>
              </div>
              <div>→</div>
            </Link>
          </>
        )}

        {starredMemos && starredMemos.length > 0 && (
          <>
            <div className="section-title">⭐ お気に入りコンボ</div>
            {starredMemos.slice(0, 5).map((m) => (
              <Link key={m.id} to={`/memos/${m.id}`} className="list-item">
                <span className="starred">⭐</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{m.title}</div>
                  <div className="dim">
                    {m.nodes.length} ノード / {m.edges.length} リンク
                  </div>
                </div>
                <div>→</div>
              </Link>
            ))}
          </>
        )}
      </div>
    </>
  );
}

function labelResult(r: string) {
  return (
    { victory: '勝利', defeat: '敗北', abandoned: '中断', in_progress: '進行中' } as Record<
      string,
      string
    >
  )[r] ?? r;
}
