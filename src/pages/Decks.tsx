import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import TopBar from '../components/TopBar';
import { CHARACTER_MAP } from '../data/characters';

export default function Decks() {
  const decks = useLiveQuery(() => db.decks.orderBy('updatedAt').reverse().toArray(), []);

  return (
    <>
      <TopBar title="デッキ" />
      <div className="content">
        {decks && decks.length === 0 && (
          <div className="empty">
            <h3>デッキがまだありません</h3>
            <p>右下の + からデッキを仮組みできます。</p>
          </div>
        )}
        {decks?.map((d) => {
          const char = CHARACTER_MAP[d.character];
          return (
            <Link key={d.id} to={`/decks/${d.id}`} className="list-item">
              <span className="pill" data-char={char?.id}>
                {char?.nameJa ?? char?.name}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{d.name}</div>
                <div className="dim">
                  {d.cards.length} 枚 / {d.relics.length} レリック
                </div>
              </div>
              <div>→</div>
            </Link>
          );
        })}
      </div>
      <Link to="/decks/new" className="fab" aria-label="デッキ追加">
        +
      </Link>
    </>
  );
}
