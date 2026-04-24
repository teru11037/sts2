import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Swords, Layers, Network, Settings as SettingsIcon, ChevronRight, Sparkles } from 'lucide-react';
import { db } from '../db';
import TopBar from '../components/TopBar';
import { CHARACTER_MAP } from '../data/characters';

function labelResult(r: string) {
  return (
    { victory: '勝利', defeat: '敗北', abandoned: '中断', in_progress: '進行中' } as Record<string, string>
  )[r] ?? r;
}
function resultColor(r: string) {
  return (
    { victory: 'var(--success)', defeat: 'var(--danger)', abandoned: 'var(--warn)', in_progress: 'var(--accent)' } as Record<string, string>
  )[r] ?? 'var(--fg-muted)';
}

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

  const runStats = useLiveQuery(async () => {
    const all = await db.runs.toArray();
    let wins = 0;
    let losses = 0;
    let inProgress = 0;
    let monthly = 0;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    for (const r of all) {
      if (r.result === 'victory') wins++;
      else if (r.result === 'defeat') losses++;
      else if (r.result === 'in_progress') inProgress++;
      if (r.startedAt >= monthStart) monthly++;
    }
    const finished = wins + losses;
    const winRate = finished > 0 ? Math.round((wins / finished) * 100) : null;
    return { wins, losses, inProgress, monthly, winRate, total: all.length };
  });

  const recentRuns = useLiveQuery(async () =>
    db.runs.orderBy('startedAt').reverse().limit(3).toArray()
  );

  const recentDecks = useLiveQuery(async () =>
    db.decks.orderBy('updatedAt').reverse().limit(3).toArray()
  );

  const starredMemos = useLiveQuery(async () => db.memos.where('starred').equals(1).toArray());

  const inProgressRun = recentRuns?.find((r) => r.result === 'in_progress');

  return (
    <>
      <TopBar
        title="STS2 Companion"
        right={
          <Link to="/settings" className="ghost" style={{ padding: 8, display: 'inline-flex' }} aria-label="設定">
            <SettingsIcon size={20} />
          </Link>
        }
      />
      <div className="content">
        {/* 進行中ランがあれば最優先で目立たせる */}
        {inProgressRun && (
          <Link
            to={`/runs/${inProgressRun.id}`}
            className="card"
            style={{
              display: 'block',
              textDecoration: 'none',
              color: 'inherit',
              background:
                'linear-gradient(135deg, rgba(148,102,212,0.4), rgba(194,137,255,0.15)), linear-gradient(180deg, rgba(40,30,65,0.75), rgba(24,18,40,0.85))',
              borderColor: 'var(--accent-2)',
              boxShadow: '0 8px 24px rgba(148,102,212,0.25)'
            }}
          >
            <div className="row-between">
              <div>
                <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, letterSpacing: 0.1 }}>
                  ▶ 進行中
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, marginTop: 4 }}>
                  {CHARACTER_MAP[inProgressRun.character]?.nameJa ?? inProgressRun.character} · F
                  {inProgressRun.floorReached ?? 0}
                </div>
                <div className="dim" style={{ fontSize: 12 }}>
                  デッキ {inProgressRun.finalDeck.length} 枚 · レリック{' '}
                  {inProgressRun.finalRelics.length} 個
                </div>
              </div>
              <ChevronRight size={22} />
            </div>
          </Link>
        )}

        {/* 数値ダッシュボード */}
        <div className="hstats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div>
            <div className="n">{runStats?.winRate ?? '-'}<span style={{ fontSize: 13, marginLeft: 1 }}>%</span></div>
            <div className="l">勝率</div>
          </div>
          <div>
            <div className="n">{runStats?.monthly ?? '-'}</div>
            <div className="l">今月のラン</div>
          </div>
          <div>
            <div className="n">{counts?.cards ?? '-'}</div>
            <div className="l">カード</div>
          </div>
          <div>
            <div className="n">{counts?.decks ?? '-'}</div>
            <div className="l">デッキ</div>
          </div>
        </div>

        {/* クイックアクション (アイコン付き) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
            marginBottom: 8
          }}
        >
          <QuickAction to="/runs/new" label="ラン記録" Icon={Swords} />
          <QuickAction to="/decks/new" label="デッキ組む" Icon={Layers} />
          <QuickAction to="/memos/new" label="コンボ図" Icon={Network} />
        </div>

        {/* 最近のラン */}
        {recentRuns && recentRuns.length > 0 && (
          <>
            <div className="section-title">最近のラン</div>
            <div className="list-stagger">
              {recentRuns.map((r) => (
                <Link key={r.id} to={`/runs/${r.id}`} className="list-item">
                  <span
                    className="pill"
                    data-char={r.character}
                    style={{ minWidth: 52, justifyContent: 'center' }}
                  >
                    {CHARACTER_MAP[r.character]?.nameJa?.slice(0, 2) ?? r.character.slice(0, 2)}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      F{r.floorReached ?? '-'}
                      {r.ascension ? ` · A${r.ascension}` : ''}
                    </div>
                    <div className="dim" style={{ fontSize: 11 }}>
                      {new Date(r.startedAt).toLocaleString('ja-JP', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <span style={{ color: resultColor(r.result), fontWeight: 700, fontSize: 12 }}>
                    {labelResult(r.result)}
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* 最近のデッキ */}
        {recentDecks && recentDecks.length > 0 && (
          <>
            <div className="section-title">最近のデッキ</div>
            <div className="list-stagger">
              {recentDecks.map((d) => (
                <Link key={d.id} to={`/decks/${d.id}`} className="list-item">
                  <Layers size={18} style={{ color: CHARACTER_MAP[d.character]?.color ?? 'var(--fg-muted)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{d.name}</div>
                    <div className="dim" style={{ fontSize: 11 }}>
                      {d.cards.length} 枚 · {CHARACTER_MAP[d.character]?.nameJa ?? d.character}
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--fg-dim)' }} />
                </Link>
              ))}
            </div>
          </>
        )}

        {/* お気に入りコンボ */}
        {starredMemos && starredMemos.length > 0 && (
          <>
            <div className="section-title">⭐ お気に入りコンボ</div>
            <div className="list-stagger">
              {starredMemos.slice(0, 3).map((m) => (
                <Link key={m.id} to={`/memos/${m.id}`} className="list-item">
                  <Sparkles size={18} style={{ color: 'var(--warn)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{m.title}</div>
                    <div className="dim" style={{ fontSize: 11 }}>
                      {m.nodes.length} ノード · {m.edges.length} リンク
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--fg-dim)' }} />
                </Link>
              ))}
            </div>
          </>
        )}

        {/* 空の状態 */}
        {counts && counts.runs === 0 && counts.decks === 0 && (
          <div className="empty" style={{ marginTop: 20 }}>
            <h3>ようこそ</h3>
            <div className="dim" style={{ marginBottom: 10 }}>
              上のボタンから最初の1本を記録するか、デッキを組んでみよう。
              データは端末内のみに保存されます。
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function QuickAction({
  to,
  label,
  Icon
}: {
  to: string;
  label: string;
  Icon: typeof Swords;
}) {
  return (
    <Link
      to={to}
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: '16px 8px',
        textDecoration: 'none',
        color: 'inherit',
        marginBottom: 0
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: 'linear-gradient(160deg, rgba(194,137,255,0.2), rgba(148,102,212,0.1))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent)'
        }}
      >
        <Icon size={20} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 600 }}>{label}</div>
    </Link>
  );
}
