export type CharacterId =
  | 'ironclad'
  | 'silent'
  | 'defect'
  | 'regent'
  | 'necrobinder'
  | 'colorless'
  | 'neutral';

export type CardType = 'Attack' | 'Skill' | 'Power' | 'Status' | 'Curse';
export type CardRarity = 'Starter' | 'Common' | 'Uncommon' | 'Rare' | 'Special';
export type RelicRarity =
  | 'Starter'
  | 'Common'
  | 'Uncommon'
  | 'Rare'
  | 'Boss'
  | 'Shop'
  | 'Event';

export interface Character {
  id: CharacterId;
  name: string;
  nameJa?: string;
  maxHp?: number;
  startingRelic?: string;
  description?: string;
  color: string;
}

export interface Card {
  id: string;
  name: string;
  nameJa?: string;
  character: CharacterId;
  type: CardType;
  rarity: CardRarity;
  cost: number | 'X' | null;
  description: string;
  upgradedDescription?: string;
  tags?: string[];
  isCustom?: 0 | 1;
  gameVersion?: string;
  notes?: string;
  imageId?: string;
}

export interface Relic {
  id: string;
  name: string;
  nameJa?: string;
  character?: CharacterId;
  rarity: RelicRarity;
  description: string;
  tags?: string[];
  isCustom?: 0 | 1;
  gameVersion?: string;
  notes?: string;
  imageId?: string;
}

export interface StoredImage {
  id: string;
  dataUrl: string;
  width: number;
  height: number;
  updatedAt: number;
}

export interface DeckCard {
  cardId: string;
  upgraded: number;
  note?: string;
}

export interface Deck {
  id?: number;
  name: string;
  character: CharacterId;
  cards: DeckCard[];
  relics: string[];
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export type RunResult = 'victory' | 'defeat' | 'abandoned' | 'in_progress';

export interface RunEvent {
  id: string;
  at: number;
  floor?: number;
  kind:
    | 'card_added'
    | 'card_removed'
    | 'card_upgraded'
    | 'card_transformed'
    | 'relic_obtained'
    | 'relic_lost'
    | 'boss_defeated'
    | 'elite_defeated'
    | 'event'
    | 'shop'
    | 'rest'
    | 'note';
  subjectId?: string;
  detail?: string;
}

export interface Run {
  id?: number;
  character: CharacterId;
  ascension?: number;
  result: RunResult;
  floorReached?: number;
  finalDeck: DeckCard[];
  finalRelics: string[];
  events: RunEvent[];
  startedAt: number;
  endedAt?: number;
  notes?: string;
}

export type ComboNodeKind = 'card' | 'relic' | 'text';

export interface ComboNode {
  id: string;
  kind: ComboNodeKind;
  refId?: string;
  text?: string;
  x: number;
  y: number;
}

export interface ComboEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
}

export interface ComboMemo {
  id?: number;
  title: string;
  character?: CharacterId;
  nodes: ComboNode[];
  edges: ComboEdge[];
  body: string;
  tags: string[];
  starred: 0 | 1;
  createdAt: number;
  updatedAt: number;
}
