import type { Card } from '../types';

// 初期シードデータ。スレスパ2 Early Access の公開情報を元にしたサンプル。
// 網羅はしていない。アプリ内の「カード追加」機能から拡張可能。
export const SEED_CARDS: Card[] = [
  // --- 共通スタータ ---
  {
    id: 'strike_r',
    name: 'Strike',
    nameJa: 'ストライク (赤)',
    character: 'ironclad',
    type: 'Attack',
    rarity: 'Starter',
    cost: 1,
    description: 'Deal 6 damage.',
    upgradedDescription: 'Deal 9 damage.',
    gameVersion: 'EA'
  },
  {
    id: 'defend_r',
    name: 'Defend',
    nameJa: 'ディフェンド (赤)',
    character: 'ironclad',
    type: 'Skill',
    rarity: 'Starter',
    cost: 1,
    description: 'Gain 5 Block.',
    upgradedDescription: 'Gain 8 Block.',
    gameVersion: 'EA'
  },
  {
    id: 'bash',
    name: 'Bash',
    nameJa: 'バッシュ',
    character: 'ironclad',
    type: 'Attack',
    rarity: 'Starter',
    cost: 2,
    description: 'Deal 8 damage. Apply 2 Vulnerable.',
    upgradedDescription: 'Deal 10 damage. Apply 3 Vulnerable.',
    gameVersion: 'EA'
  },
  {
    id: 'strike_g',
    name: 'Strike',
    nameJa: 'ストライク (緑)',
    character: 'silent',
    type: 'Attack',
    rarity: 'Starter',
    cost: 1,
    description: 'Deal 6 damage.',
    upgradedDescription: 'Deal 9 damage.',
    gameVersion: 'EA'
  },
  {
    id: 'defend_g',
    name: 'Defend',
    nameJa: 'ディフェンド (緑)',
    character: 'silent',
    type: 'Skill',
    rarity: 'Starter',
    cost: 1,
    description: 'Gain 5 Block.',
    upgradedDescription: 'Gain 8 Block.',
    gameVersion: 'EA'
  },
  {
    id: 'survivor',
    name: 'Survivor',
    nameJa: 'サバイバー',
    character: 'silent',
    type: 'Skill',
    rarity: 'Starter',
    cost: 1,
    description: 'Gain 8 Block. Discard 1 card.',
    upgradedDescription: 'Gain 11 Block. Discard 1 card.',
    gameVersion: 'EA'
  },
  {
    id: 'neutralize',
    name: 'Neutralize',
    nameJa: 'ニュートラライズ',
    character: 'silent',
    type: 'Attack',
    rarity: 'Starter',
    cost: 0,
    description: 'Deal 3 damage. Apply 1 Weak.',
    upgradedDescription: 'Deal 4 damage. Apply 2 Weak.',
    gameVersion: 'EA'
  },
  {
    id: 'strike_b',
    name: 'Strike',
    nameJa: 'ストライク (青)',
    character: 'defect',
    type: 'Attack',
    rarity: 'Starter',
    cost: 1,
    description: 'Deal 6 damage.',
    upgradedDescription: 'Deal 9 damage.',
    gameVersion: 'EA'
  },
  {
    id: 'defend_b',
    name: 'Defend',
    nameJa: 'ディフェンド (青)',
    character: 'defect',
    type: 'Skill',
    rarity: 'Starter',
    cost: 1,
    description: 'Gain 5 Block.',
    upgradedDescription: 'Gain 8 Block.',
    gameVersion: 'EA'
  },
  {
    id: 'zap',
    name: 'Zap',
    nameJa: 'ザップ',
    character: 'defect',
    type: 'Skill',
    rarity: 'Starter',
    cost: 1,
    description: 'Channel 1 Lightning.',
    upgradedDescription: 'Channel 1 Lightning. (Retain)',
    gameVersion: 'EA'
  },
  {
    id: 'dualcast',
    name: 'Dualcast',
    nameJa: 'デュアルキャスト',
    character: 'defect',
    type: 'Skill',
    rarity: 'Starter',
    cost: 1,
    description: 'Evoke your rightmost Orb twice.',
    upgradedDescription: "Evoke your rightmost Orb twice. Don't consume it.",
    gameVersion: 'EA'
  },
  // --- Regent ---
  {
    id: 'regent_strike',
    name: 'Strike',
    nameJa: 'ストライク (金)',
    character: 'regent',
    type: 'Attack',
    rarity: 'Starter',
    cost: 1,
    description: 'Deal 6 damage.',
    upgradedDescription: 'Deal 9 damage.',
    gameVersion: 'EA'
  },
  {
    id: 'regent_defend',
    name: 'Defend',
    nameJa: 'ディフェンド (金)',
    character: 'regent',
    type: 'Skill',
    rarity: 'Starter',
    cost: 1,
    description: 'Gain 5 Block.',
    upgradedDescription: 'Gain 8 Block.',
    gameVersion: 'EA'
  },
  // --- Necrobinder ---
  {
    id: 'necro_strike',
    name: 'Strike',
    nameJa: 'ストライク (紫)',
    character: 'necrobinder',
    type: 'Attack',
    rarity: 'Starter',
    cost: 1,
    description: 'Deal 6 damage.',
    upgradedDescription: 'Deal 9 damage.',
    gameVersion: 'EA'
  },
  {
    id: 'necro_defend',
    name: 'Defend',
    nameJa: 'ディフェンド (紫)',
    character: 'necrobinder',
    type: 'Skill',
    rarity: 'Starter',
    cost: 1,
    description: 'Gain 5 Block.',
    upgradedDescription: 'Gain 8 Block.',
    gameVersion: 'EA'
  },
  // --- 共通 (呪い / ステータス) ---
  {
    id: 'ascenders_bane',
    name: "Ascender's Bane",
    nameJa: 'アセンダーの災難',
    character: 'neutral',
    type: 'Curse',
    rarity: 'Special',
    cost: null,
    description: 'Unplayable. Cannot be removed from your deck.',
    gameVersion: 'EA'
  },
  {
    id: 'wound',
    name: 'Wound',
    nameJa: 'ウーンド',
    character: 'neutral',
    type: 'Status',
    rarity: 'Special',
    cost: null,
    description: 'Unplayable.',
    gameVersion: 'EA'
  },
  {
    id: 'dazed',
    name: 'Dazed',
    nameJa: 'ダズド',
    character: 'neutral',
    type: 'Status',
    rarity: 'Special',
    cost: null,
    description: 'Unplayable. Ethereal.',
    gameVersion: 'EA'
  },
  {
    id: 'slimed',
    name: 'Slimed',
    nameJa: 'スライム化',
    character: 'neutral',
    type: 'Status',
    rarity: 'Special',
    cost: 1,
    description: 'Exhaust.',
    gameVersion: 'EA'
  }
];
