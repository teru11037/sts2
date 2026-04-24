import type { Card } from '../types';
import { CHARACTER_MAP } from '../data/characters';

interface Props {
  card: Card;
  upgraded?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  selected?: boolean;
  badge?: string;
  imageUrl?: string;
}

const SIZE_MAP: Record<string, { w: number; h: number; name: number; cost: number }> = {
  sm: { w: 76, h: 104, name: 11, cost: 12 },
  md: { w: 104, h: 140, name: 12.5, cost: 14 },
  lg: { w: 144, h: 196, name: 14, cost: 16 }
};

const TYPE_BG: Record<string, string> = {
  Attack:
    'radial-gradient(circle at 30% 20%, #b03a2e 0%, #6b1a14 45%, #2a0808 100%)',
  Skill:
    'radial-gradient(circle at 30% 20%, #2e78b0 0%, #123a5a 50%, #0a1a2e 100%)',
  Power:
    'radial-gradient(circle at 30% 20%, #7e3dae 0%, #3e1a6a 50%, #1a0a30 100%)',
  Status:
    'radial-gradient(circle at 30% 20%, #6a6a6a 0%, #3a3a3a 50%, #1a1a1a 100%)',
  Curse:
    'radial-gradient(circle at 30% 20%, #3a1f3a 0%, #1a0f1a 50%, #0a050a 100%)'
};

export default function CardTile({
  card,
  upgraded,
  size = 'md',
  onClick,
  selected,
  badge,
  imageUrl
}: Props) {
  const s = SIZE_MAP[size];
  const charColor = CHARACTER_MAP[card.character]?.color ?? '#555';
  const title = (card.nameJa ?? card.name) + (upgraded ? '+' : '');

  return (
    <button
      type="button"
      onClick={onClick}
      className={`tile card-tile rarity-${card.rarity}`}
      aria-label={title}
      style={{
        width: s.w,
        height: s.h,
        padding: 0,
        minHeight: 0,
        background: imageUrl
          ? `url("${imageUrl}") center/cover no-repeat, #1a1625`
          : TYPE_BG[card.type] ?? '#333',
        border: `1.5px solid ${charColor}`,
        boxShadow: selected
          ? `0 0 0 3px rgba(194,137,255,0.85), 0 10px 24px rgba(0,0,0,0.5)`
          : `inset 0 1px 0 rgba(255,255,255,0.18), 0 6px 14px rgba(0,0,0,0.45)`,
        borderRadius: 12,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0
      }}
    >
      {/* 上部の光沢 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '45%',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.14), transparent)',
          pointerEvents: 'none'
        }}
      />
      {/* ビネット */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: 'inset 0 -40px 40px rgba(0,0,0,0.55)',
          pointerEvents: 'none'
        }}
      />
      {/* コストバッジ */}
      <div
        style={{
          position: 'absolute',
          top: 5,
          left: 5,
          width: 24,
          height: 24,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35), rgba(0,0,0,0.9) 70%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: s.cost,
          fontWeight: 800,
          fontVariantNumeric: 'tabular-nums',
          textShadow: '0 1px 2px rgba(0,0,0,0.8)',
          zIndex: 3
        }}
      >
        {card.cost === null ? '-' : card.cost}
      </div>
      {/* レアリティ記号 */}
      <div
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: 0.5,
          color: '#fff',
          background:
            card.rarity === 'Rare'
              ? 'linear-gradient(180deg, #dcb400, #a87e00)'
              : card.rarity === 'Uncommon'
                ? 'linear-gradient(180deg, #3b85c6, #2f6ea8)'
                : 'rgba(0,0,0,0.55)',
          padding: '2px 6px',
          borderRadius: 6,
          textShadow: '0 1px 2px rgba(0,0,0,0.6)',
          zIndex: 3
        }}
      >
        {card.rarity[0]}
      </div>
      {upgraded && (
        <div
          style={{
            position: 'absolute',
            top: 30,
            left: 6,
            fontSize: 11,
            color: '#ffd660',
            fontWeight: 800,
            textShadow: '0 0 6px rgba(255,214,96,0.7), 0 1px 2px rgba(0,0,0,0.9)',
            zIndex: 3
          }}
        >
          +
        </div>
      )}
      {badge && (
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            right: 5,
            background: 'linear-gradient(180deg, #c289ff, #9466d4)',
            color: '#fff',
            fontSize: 11,
            fontWeight: 800,
            borderRadius: 10,
            padding: '2px 7px',
            minWidth: 22,
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(148,102,212,0.5)',
            zIndex: 3
          }}
        >
          {badge}
        </div>
      )}
      <div style={{ flex: 1 }} />
      {/* 名前帯 */}
      <div
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.3), rgba(0,0,0,0.75))',
          color: '#fff',
          fontSize: s.name,
          fontWeight: 700,
          padding: '5px 6px',
          textAlign: 'center',
          lineHeight: 1.15,
          minHeight: 26,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textShadow: '0 1px 2px rgba(0,0,0,0.9)',
          position: 'relative',
          zIndex: 2,
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        {title}
      </div>
    </button>
  );
}
