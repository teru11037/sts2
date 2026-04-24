import { useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import TopBar from '../components/TopBar';
import { db, exportAll, importAll } from '../db';
import {
  createManualBackup,
  deleteBackup,
  listBackups,
  restoreBackup
} from '../db/backup';
import { garbageCollectImages } from '../lib/images';

export default function Settings() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [gcMsg, setGcMsg] = useState<string | null>(null);

  const imageStats = useLiveQuery(async () => {
    const all = await db.images.toArray();
    const bytes = all.reduce((acc, i) => acc + i.dataUrl.length, 0);
    return { count: all.length, bytes };
  });

  const backups = useLiveQuery(() => listBackups(), []);

  const doCreateBackup = async () => {
    await createManualBackup();
    alert('手動バックアップを作成しました');
  };

  const doRestore = async (id: number, at: number) => {
    const ok = confirm(
      `${new Date(at).toLocaleString('ja-JP')} の状態に復元します。\n\n` +
        '現在のデータは同時に自動バックアップとして退避されるので、後から戻せます。\n\n' +
        '続行しますか？'
    );
    if (!ok) return;
    try {
      await restoreBackup(id);
      alert('復元しました。ページを再読み込みします。');
      location.reload();
    } catch (err) {
      alert('復元に失敗しました: ' + (err as Error).message);
    }
  };

  const doDeleteBackup = async (id: number) => {
    if (!confirm('このバックアップを削除しますか？')) return;
    await deleteBackup(id);
  };

  const fmtBytes = (n: number) =>
    n < 1024 ? n + 'B' : n < 1024 * 1024 ? (n / 1024).toFixed(0) + 'KB' : (n / 1024 / 1024).toFixed(1) + 'MB';

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

        <div className="section-title">自動バックアップ</div>
        <div className="card card-compact">
          <div className="dim" style={{ fontSize: 12, marginBottom: 8 }}>
            起動時に直近 20 時間以上経っていれば自動バックアップを作成します。
            自動分は最大 7 件まで保持、古いものから削除されます。
          </div>
          <button onClick={doCreateBackup}>💾 いま手動バックアップを作成</button>
          {(!backups || backups.length === 0) && (
            <div className="dim" style={{ marginTop: 8, fontSize: 12 }}>
              まだバックアップがありません。
            </div>
          )}
          {backups && backups.length > 0 && (
            <div style={{ marginTop: 10 }}>
              {backups.map((b) => (
                <div
                  key={b.id}
                  className="row-between"
                  style={{
                    padding: '8px 0',
                    borderTop: '1px solid var(--border-soft)',
                    gap: 6
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {new Date(b.createdAt).toLocaleString('ja-JP', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      <span
                        className="tag"
                        style={{ marginLeft: 6, fontSize: 10, padding: '0 6px' }}
                      >
                        {b.kind === 'auto' ? '自動' : '手動'}
                      </span>
                    </div>
                    <div className="dim" style={{ fontSize: 11 }}>
                      {fmtBytes(b.bytes)}
                      {b.label ? ` · ${b.label}` : ''}
                    </div>
                  </div>
                  <button
                    onClick={() => doRestore(b.id!, b.createdAt)}
                    style={{ padding: '6px 10px', minHeight: 32, fontSize: 12 }}
                  >
                    復元
                  </button>
                  <button
                    className="danger"
                    onClick={() => doDeleteBackup(b.id!)}
                    style={{ padding: '6px 8px', minHeight: 32, fontSize: 12 }}
                    aria-label="削除"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
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
