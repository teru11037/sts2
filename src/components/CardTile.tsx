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
  sm: { w: 76, h: 100, name: 11, cost: 12 },
  md: { w: 100, h: 132, name: 12, cost: 14 },
  lg: { w: 140, h: 186, name: 13, cost: 16 }
};

export default function CardTile({ card, upgraded, size = 'md', onClick, selected, badge, imageUrl }: Props) {
  const s = SIZE_MAP[size];
  const charColor = CHARACTER_MAP[card.character]?.color ?? '#555';
  const title = (card.nameJa ?? card.name) + (upgraded ? '+' : '');
  const typeColor: Record<string, string> = {
    Attack: 'linear-gradient(160deg, #8e1f1f, #c0392b)',
    Skill: 'linear-gradient(160deg, #1f4f7a, #2980b9)',
    Power: 'linear-gradient(160deg, #5a2a7a, #8e44ad)',
    Status: 'linear-gradient(160deg, #3a3a3a, #555)',
    Curse: 'linear-gradient(160deg, #1a0f1a, #3a1f3a)'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="tile card-tile"
      aria-label={title}
      style={{
        width: s.w,
        height: s.h,
        padding: 0,
        minHeight: 0,
        background: imageUrl
          ? `url("${imageUrl}") center/cover no-repeat, #1a1625`
          : typeColor[card.type] ?? '#333',
        border: selected ? '2px solid #fff' : `2px solid ${charColor}`,
        boxShadow: selected ? '0 0 0 3px rgba(194,137,255,0.8)' : 'none',
        borderRadius: 10,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 4,
          left: 4,
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.65)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: s.cost,
          fontWeight: 700
        }}
      >
        {card.cost === null ? '-' : card.cost}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 4,
          right: 4,
          fontSize: 9,
          fontWeight: 700,
          color: '#fff',
          background: 'rgba(0,0,0,0.5)',
          padding: '2px 5px',
          borderRadius: 4
        }}
      >
        {card.rarity[0]}
      </div>
      {upgraded && (
        <div
          style={{
            position: 'absolute',
            top: 28,
            left: 4,
            fontSize: 10,
            color: '#ffc857',
            fontWeight: 700,
            textShadow: '0 0 4px rgba(0,0,0,0.8)'
          }}
        >
          +
        </div>
      )}
      {badge && (
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            right: 4,
            background: '#c289ff',
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            borderRadius: 10,
            padding: '2px 7px',
            minWidth: 20,
            textAlign: 'center'
          }}
        >
          {badge}
        </div>
      )}
      <div style={{ flex: 1 }} />
      <div
        style={{
          background: 'rgba(0,0,0,0.55)',
          color: '#fff',
          fontSize: s.name,
          fontWeight: 600,
          padding: '4px 6px',
          textAlign: 'center',
          lineHeight: 1.15,
          minHeight: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {title}
      </div>
    </button>
  );
}
