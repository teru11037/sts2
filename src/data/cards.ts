import type { Card } from '../types';
import { SEED_CARDS_SILENT } from './cards_silent';

// 初期シードデータ。スレスパ2 Early Access の公開情報を元にしたサンプル。
// Silent は専用ファイル (cards_silent.ts) から読み込む。他キャラはサンプルのみ。
const SEED_CARDS_OTHER: Card[] = [
  // --- 共通スタータ (Silent 以外) ---
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
  },
  // --- Silent トークン (ナイフ等) ---
  {
    id: 'knife_token',
    name: 'Knife',
    nameJa: 'ナイフ',
    character: 'silent',
    type: 'Attack',
    rarity: 'Special',
    cost: 0,
    description: 'トークン。デッキにない。精度上昇・ファントムブレード等で威力が変化する。',
    tags: ['ナイフ', 'トークン'],
    notes: 'ナイフ系シナジーで参照されるトークン',
    gameVersion: 'EA'
  },
  {
    id: 'inked_knife_token',
    name: 'Inked Knife',
    nameJa: '墨塗りのナイフ',
    character: 'silent',
    type: 'Attack',
    rarity: 'Special',
    cost: 0,
    description: 'トークン。墨の刃から生成される。',
    tags: ['ナイフ', 'トークン'],
    notes: '墨の刃で生成',
    gameVersion: 'EA'
  }
];

export const SEED_CARDS: Card[] = [...SEED_CARDS_OTHER, ...SEED_CARDS_SILENT];
