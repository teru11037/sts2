import type { Relic } from '../types';
import { CHARACTER_MAP } from '../data/characters';

interface Props {
  relic: Relic;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  selected?: boolean;
}

const SIZE_MAP: Record<string, number> = { sm: 56, md: 72, lg: 96 };

const RARITY_COLOR: Record<string, string> = {
  Starter: '#555',
  Common: '#8a8f95',
  Uncommon: '#2f6ea8',
  Rare: '#b79100',
  Boss: '#7b2ea8',
  Shop: '#4a7a3a',
  Event: '#a8692e'
};

export default function RelicTile({ relic, size = 'md', onClick, selected }: Props) {
  const w = SIZE_MAP[size];
  const charColor = relic.character ? CHARACTER_MAP[relic.character]?.color : undefined;
  const bg = RARITY_COLOR[relic.rarity] ?? '#444';
  const title = relic.nameJa ?? relic.name;
  const initial = title.charAt(0);

  return (
    <button
      type="button"
      onClick={onClick}
      className="tile relic-tile"
      aria-label={title}
      style={{
        width: w,
        height: w,
        padding: 0,
        minHeight: 0,
        background: `radial-gradient(circle at 30% 25%, ${bg}, #1a1625 80%)`,
        border: selected ? '2px solid #fff' : `2px solid ${charColor ?? bg}`,
        boxShadow: selected ? '0 0 0 3px rgba(194,137,255,0.8)' : 'none',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: Math.floor(w * 0.4),
        fontWeight: 700,
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0,
        textShadow: '0 1px 3px rgba(0,0,0,0.6)'
      }}
      title={title}
    >
      {initial}
    </button>
  );
}
