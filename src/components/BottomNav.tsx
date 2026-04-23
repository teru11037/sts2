import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/', label: 'ホーム', icon: '🏠' },
  { to: '/cards', label: '図鑑', icon: '🎴' },
  { to: '/decks', label: 'デッキ', icon: '🃏' },
  { to: '/runs', label: 'ラン', icon: '⚔️' },
  { to: '/memos', label: 'コンボ', icon: '🕸️' }
];

export default function BottomNav() {
  return (
    <nav className="bottomnav" aria-label="主要ナビ">
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.to === '/'}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <span className="icon" aria-hidden>
            {t.icon}
          </span>
          <span>{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
