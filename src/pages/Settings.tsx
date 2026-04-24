import { useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import TopBar from '../components/TopBar';
import { db, exportAll, importAll } from '../db';
import { garbageCollectImages } from '../lib/images';

export default function Settings() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [gcMsg, setGcMsg] = useState<string | null>(null);

  const imageStats = useLiveQuery(async () => {
    const all = await db.images.toArray();
    const bytes = all.reduce((acc, i) => acc + i.dataUrl.length, 0);
    return { count: all.length, bytes };
  });

  const runGc = async () => {
    const removed = await garbageCollectImages();
    setGcMsg(`${removed} 件の孤立画像を削除しました`);
    setTimeout(() => setGcMsg(null), 3000);
  };

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
    const ok = confirm(
      `インポートは既存データを同じ ID で上書きします (追記ではなく置換)。\n\nファイル: ${file.name}\n続行しますか？`
    );
    if (!ok) return;
    let text: string;
    try {
      text = await file.text();
    } catch (err) {
      alert('ファイルの読み込みに失敗しました: ' + (err as Error).message);
      return;
    }
    try {
      const s = await importAll(text);
      alert(
        [
          'インポート完了。',
          `カード: ${s.cards} / レリック: ${s.relics}`,
          `デッキ: ${s.decks} / ラン: ${s.runs}`,
          `コンボ: ${s.memos} / 画像: ${s.images}`,
          '',
          'ページを再読み込みします。'
        ].join('\n')
      );
      location.reload();
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

        <div className="section-title">画像ストレージ</div>
        <div className="card card-compact">
          <div className="row-between">
            <div>
              <div>保存枚数: <strong>{imageStats?.count ?? '-'}</strong></div>
              <div className="dim" style={{ fontSize: 12 }}>
                概算サイズ: {imageStats ? Math.round(imageStats.bytes / 1024) + 'KB' : '-'}
              </div>
            </div>
            <button onClick={runGc}>🧹 孤立画像を掃除</button>
          </div>
          {gcMsg && <div className="dim" style={{ marginTop: 8, fontSize: 12 }}>{gcMsg}</div>}
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
