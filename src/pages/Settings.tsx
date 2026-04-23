import { useRef } from 'react';
import TopBar from '../components/TopBar';
import { db, exportAll, importAll } from '../db';

export default function Settings() {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const doExport = async () => {
    const json = await exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sts2-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = async (file: File) => {
    const text = await file.text();
    try {
      await importAll(text);
      alert('インポートしました');
    } catch (err) {
      alert('読み込み失敗: ' + (err as Error).message);
    }
  };

  const resetAll = async () => {
    if (!confirm('すべてのユーザデータを削除します。よろしいですか？')) return;
    await db.delete();
    location.reload();
  };

  return (
    <>
      <TopBar title="設定" back />
      <div className="content">
        <div className="section-title">データ</div>
        <div className="stack">
          <button onClick={doExport}>📤 JSON でエクスポート</button>
          <button onClick={() => fileRef.current?.click()}>📥 JSON からインポート</button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) doImport(f);
              e.target.value = '';
            }}
          />
          <button className="danger" onClick={resetAll}>
            🧹 全データリセット
          </button>
        </div>

        <div className="section-title">アプリについて</div>
        <div className="card card-compact">
          <div>STS2 Companion v0.1</div>
          <div className="dim" style={{ marginTop: 4 }}>
            スレスパ2 Early Access 向けの非公式 PWA コンパニオン。
            データは端末のみに保存されます (IndexedDB)。
          </div>
          <div className="dim" style={{ marginTop: 6 }}>
            シードのカード/レリックは一部のサンプルです。図鑑の「+」から自由に追加・編集できます。
          </div>
        </div>

        <div className="section-title">iPhone にインストール</div>
        <div className="card card-compact">
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.7 }}>
            <li>Safari で開く</li>
            <li>共有ボタン (□↑) をタップ</li>
            <li>「ホーム画面に追加」</li>
            <li>ホーム画面のアイコンから起動するとフルスクリーン表示</li>
          </ol>
        </div>
      </div>
    </>
  );
}
