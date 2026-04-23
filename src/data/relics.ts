import type { Relic } from '../types';

// 初期シードデータ (スレスパ2 Early Access の公開情報を元にしたサンプル)
// 網羅していないので、アプリ内の「レリック追加」から随時追加できる設計。
export const SEED_RELICS: Relic[] = [
  {
    id: 'burning_blood',
    name: 'Burning Blood',
    nameJa: '燃える血',
    character: 'ironclad',
    rarity: 'Starter',
    description: '戦闘終了時に HP を 6 回復する。',
    gameVersion: 'EA'
  },
  {
    id: 'ring_of_the_snake',
    name: 'Ring of the Snake',
    nameJa: '蛇の指輪',
    character: 'silent',
    rarity: 'Starter',
    description: '戦闘開始時にカードを 2 枚追加でドローする。',
    gameVersion: 'EA'
  },
  {
    id: 'cracked_core',
    name: 'Cracked Core',
    nameJa: 'ひび割れたコア',
    character: 'defect',
    rarity: 'Starter',
    description: '戦闘開始時に Lightning オーブを 1 個 Channel する。',
    gameVersion: 'EA'
  },
  {
    id: 'crown_of_stars',
    name: 'Crown of Stars',
    nameJa: '星の王冠',
    character: 'regent',
    rarity: 'Starter',
    description: '戦闘開始時に 3 Star を得る。',
    gameVersion: 'EA'
  },
  {
    id: 'ostys_binding',
    name: "Osty's Binding",
    nameJa: 'オスティの拘束',
    character: 'necrobinder',
    rarity: 'Starter',
    description: 'Osty を召喚する。Necrobinder 固有のコア・メカニクス。',
    gameVersion: 'EA'
  },
  // --- Common の例 ---
  {
    id: 'whetstone',
    name: 'Whetstone',
    nameJa: '砥石',
    rarity: 'Common',
    description: '入手時にランダムなアタック 2 枚を強化する。',
    gameVersion: 'EA'
  },
  {
    id: 'anchor',
    name: 'Anchor',
    nameJa: 'アンカー',
    rarity: 'Common',
    description: '戦闘開始時に 10 Block を得る。',
    gameVersion: 'EA'
  },
  // --- Uncommon の例 ---
  {
    id: 'mercury_hourglass',
    name: 'Mercury Hourglass',
    nameJa: '水銀の砂時計',
    rarity: 'Uncommon',
    description: '各ターン開始時、すべての敵に 3 ダメージを与える。',
    gameVersion: 'EA'
  },
  // --- Rare の例 ---
  {
    id: 'sozu',
    name: 'Sozu',
    nameJa: 'ソウズ',
    rarity: 'Rare',
    description: 'エナジー +1。ポーションを得られなくなる。',
    gameVersion: 'EA'
  },
  // --- Ancient/Boss 相当 (STS2 では Ancients システム) ---
  {
    id: 'tezcatara_offering_sample',
    name: "Tezcatara's Offering (sample)",
    nameJa: 'テスカタラの供物 (サンプル)',
    rarity: 'Boss',
    description: 'Ancient の Tezcatara から得られる強力だが代償を伴うレリックの例。実データは未確定のため要編集。',
    gameVersion: 'EA'
  },
  {
    id: 'darv_offering_sample',
    name: "Darv's Offering (sample)",
    nameJa: 'ダルヴの供物 (サンプル)',
    rarity: 'Boss',
    description: 'Ancient の Darv から得られるクラシック寄りの強力レリック例。実データは未確定のため要編集。',
    gameVersion: 'EA'
  }
];
