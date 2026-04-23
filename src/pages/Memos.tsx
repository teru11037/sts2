import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import TopBar from '../components/TopBar';
import { CHARACTER_MAP } from '../data/characters';

export default function Memos() {
  const memos = useLiveQuery(() => db.memos.orderBy('updatedAt').reverse().toArray(), []);

  return (
    <>
      <TopBar title="コンボ / シナジー" />
      <div className="content">
        {memos && memos.length === 0 && (
          <div className="empty">
            <h3>コンボメモがまだありません</h3>
            <p>右下の + で新しい図を作ってみよう。カードを配置して線で繋げます。</p>
          </div>
        )}
        {memos?.map((m) => {
          const c = m.character ? CHARACTER_MAP[m.character] : null;
          return (
            <Link key={m.id} to={`/memos/${m.id}`} className="list-item">
              {m.starred ? <span className="starred">⭐</span> : <span>🕸️</span>}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{m.title}</div>
                <div className="dim">
                  {c && <span>{c.nameJa ?? c.name} · </span>}
                  {m.nodes.length} ノード / {m.edges.length} リンク
                  {m.tags.length > 0 && <span> · #{m.tags.slice(0, 3).join(' #')}</span>}
                </div>
              </div>
              <div>→</div>
            </Link>
          );
        })}
      </div>
      <Link to="/memos/new" className="fab" aria-label="コンボ追加">
        +
      </Link>
    </>
  );
}
