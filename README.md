# STS2 Companion

スレスパ2 (Slay the Spire 2) Early Access 向けの、iPhone 最適化 PWA コンパニオンアプリ。

- ラン記録 (結果 / デッキ / レリック / イベント履歴)
- デッキビルダー (タイルをタップして仮組み / 統計表示)
- コンボ・シナジーのビジュアルエディタ (カードを配置 → 線で繋ぐ / ドラッグ / ピンチズーム)
- カード・レリック図鑑 (検索 / フィルタ / ユーザ追加編集)
- 全データは端末内 IndexedDB (Dexie) に保存 / JSON エクスポート・インポート対応

## 技術スタック

- Vite + React + TypeScript
- Dexie (IndexedDB) ＋ dexie-react-hooks
- React Router (HashRouter)
- vite-plugin-pwa (Service Worker, manifest, オフライン対応)

## 起動

```bash
npm install
npm run dev
```

同一 Wi-Fi の iPhone からアクセスするには、ターミナルに表示される `http://<LAN IP>:5173/` を Safari で開いてください。

## iPhone にインストール (PWA)

1. Safari で開く
2. 共有ボタン → 「ホーム画面に追加」
3. ホーム画面のアイコンから起動するとフルスクリーン + オフライン動作

## データ

- 最初の起動時にサンプルのカード/レリックを IndexedDB に投入します (スレスパ2 Early Access の公開情報を元にしたごく一部)。
- 図鑑の「+」ボタンから自由にカードやレリックを追加・編集できます。`isCustom=1` のカードはシード再投入時も上書きされません。
- `設定 → JSON エクスポート / インポート` で端末間のデータ移行ができます。

## 構成

```
src/
  App.tsx, main.tsx, index.css
  types.ts             … 型定義
  db/index.ts          … Dexie スキーマと seed / export / import
  data/                … シード (characters / cards / relics)
  components/
    CardTile.tsx       … カードタイル (コスト・タイプ・色でカード画像化)
    RelicTile.tsx      … レリックタイル
    TilePicker.tsx     … モーダル型のタイル選択ピッカー
    ComboCanvas.tsx    … ビジュアルコンボ編集キャンバス
    TopBar.tsx, BottomNav.tsx
  pages/
    Home.tsx, Cards.tsx, CardEdit.tsx
    Relics.tsx (→ Cards に統合), RelicEdit.tsx
    Decks.tsx, DeckEdit.tsx
    Runs.tsx, RunEdit.tsx
    Memos.tsx, MemoEdit.tsx
    Settings.tsx
```

## 今後の拡張メモ

- カード画像の差し替え (ローカル画像アップロード対応)
- ランのインポート (ゲーム側のセーブパースは EA 仕様変わりやすいので手動記録優先)
- 複数端末同期 (任意で Supabase 等を後付け)
- コンボの PNG/SVG 書き出し
