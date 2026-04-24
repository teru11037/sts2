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

## デプロイ (推奨: Vercel)

このリポジトリには `vercel.json` / `netlify.toml` を同梱しています。Service Worker の二重キャッシュを避けるため `sw.js` に `Cache-Control: no-cache` を付与済み。

### Vercel (最短 3 分)

1. [vercel.com/new](https://vercel.com/new) にログインして GitHub リポジトリをインポート
2. Framework Preset は **Other**、Build Command `npm run build`、Output `dist` (vercel.json が自動検出するので基本いじらない)
3. Deploy → `https://<project>.vercel.app` が発行される
4. iPhone Safari でそのURLを開く → 共有 → ホーム画面に追加

> HTTPS 必須 (PWA / Service Worker 要件) ですが Vercel / Netlify は自動で付与されます。

### Netlify

同じリポジトリを [app.netlify.com](https://app.netlify.com) から「Add new site → Import from Git」で接続するだけ。`netlify.toml` が設定を読み込みます。

### GitHub Pages (Hash Router なので SPA リダイレクト不要)

```bash
npm run build
# dist/ をそのまま gh-pages ブランチに push
```

## ローカル起動

```bash
npm install
npm run dev
```

同一 Wi-Fi の iPhone からアクセスするには、ターミナルに表示される `http://<LAN IP>:5173/` を Safari で開いてください。

> 実機で PWA 挙動 (オフライン・ホーム画面アイコンのフルスクリーン) を試すには `npm run build && npm run preview` を使ってください。dev サーバでは Service Worker が無効です。

## iPhone にインストール (PWA)

1. デプロイ済みの URL (または `npm run preview` の URL) を Safari で開く
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

- コンボ図の PNG/SVG 書き出し (共有機能)
- オートレイアウト (コンボ図)
- タグ UI とタグ検索
- シードデータ拡充 (100+ カード / 50+ レリック)
- 複数端末同期 (任意で Supabase 等を後付け)
- Vitest による主要ロジックのユニットテスト
