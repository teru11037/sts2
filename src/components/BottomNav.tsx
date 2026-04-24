import { NavLink, useLocation } from 'react-router-dom';
import { Home, Library, Layers, Swords, Network } from 'lucide-react';
import { motion, LayoutGroup } from 'framer-motion';

const TABS = [
  { to: '/', label: 'ホーム', Icon: Home },
  { to: '/cards', label: '図鑑', Icon: Library },
  { to: '/decks', label: 'デッキ', Icon: Layers },
  { to: '/runs', label: 'ラン', Icon: Swords },
  { to: '/memos', label: 'コンボ', Icon: Network }
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="bottomnav" aria-label="主要ナビ">
      <LayoutGroup id="bottomnav">
        {TABS.map((t) => {
          const isActive =
            t.to === '/' ? pathname === '/' : pathname === t.to || pathname.startsWith(t.to + '/');
          return (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.to === '/'}
              className={isActive ? 'active' : ''}
              style={{ position: 'relative' }}
            >
              {isActive && (
                <motion.span
                  layoutId="tab-glow"
                  style={{
                    position: 'absolute',
                    inset: 6,
                    borderRadius: 14,
                    background:
                      'radial-gradient(ellipse at 50% 80%, rgba(194,137,255,0.22), transparent 70%)',
                    zIndex: 0
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
              <span
                className="icon"
                aria-hidden
                style={{ position: 'relative', zIndex: 1 }}
              >
                <t.Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
              </span>
              <span style={{ position: 'relative', zIndex: 1 }}>{t.label}</span>
            </NavLink>
          );
        })}
      </LayoutGroup>
    </nav>
  );
}
