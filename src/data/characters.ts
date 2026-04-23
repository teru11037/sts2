import type { Character } from '../types';

export const CHARACTERS: Character[] = [
  {
    id: 'ironclad',
    name: 'Ironclad',
    nameJa: 'アイアンクラッド',
    maxHp: 80,
    startingRelic: 'Burning Blood',
    description: '力とブロックを積み上げる物理アタッカー。自傷シナジーと筋力ビルドが軸。',
    color: '#c0392b'
  },
  {
    id: 'silent',
    name: 'Silent',
    nameJa: 'サイレント',
    maxHp: 70,
    startingRelic: 'Ring of the Snake',
    description: '手札と毒、シブを駆使するトリッキーなキャラ。ドローとコンボで押し切る。',
    color: '#27ae60'
  },
  {
    id: 'defect',
    name: 'Defect',
    nameJa: 'ディフェクト',
    maxHp: 75,
    startingRelic: 'Cracked Core',
    description: 'オーブをチャネル/起動して戦う。フォーカスとオーブ種類で戦略が変わる。',
    color: '#2980b9'
  },
  {
    id: 'regent',
    name: 'Regent',
    nameJa: 'リージェント',
    maxHp: 75,
    startingRelic: 'Crown of Stars',
    description: 'スター(Star)リソースを蓄えて強力な呪文に変換する新キャラ。',
    color: '#d4a017'
  },
  {
    id: 'necrobinder',
    name: 'Necrobinder',
    nameJa: 'ネクロバインダー',
    maxHp: 66,
    startingRelic: "Osty's Binding",
    description: 'Doomで処刑し、Soulで手札を回す死霊術士。HP最低だが爆発力は随一。',
    color: '#8e44ad'
  },
  {
    id: 'colorless',
    name: 'Colorless',
    nameJa: 'カラーレス',
    description: '全キャラで入手できる無色カード。',
    color: '#7f8c8d'
  },
  {
    id: 'neutral',
    name: 'Neutral',
    nameJa: '共通/ステータス/呪い',
    description: 'ステータスカードや呪いなど共通カード。',
    color: '#34495e'
  }
];

export const CHARACTER_MAP: Record<string, Character> = Object.fromEntries(
  CHARACTERS.map((c) => [c.id, c])
);
