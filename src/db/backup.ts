import { db, exportAll, importAll } from './index';
import type { BackupRecord } from './index';

// 自動バックアップ保持数。超えたら古い auto から順に削除。
const MAX_AUTO_BACKUPS = 7;
// バックアップ取得の最低間隔 (ms)。
const MIN_INTERVAL_MS = 20 * 60 * 60 * 1000; // 20h (1日1回ペースの余裕込み)

/**
 * 直近バックアップが一定時間以上前なら新しい自動バックアップを作成し、
 * 保持数を超えた分を削除する。データ量が多い場合は重いので、
 * アプリ起動後の idle で呼ぶことを想定。
 */
export async function ensureDailyBackup(): Promise<BackupRecord | null> {
  try {
    const last = await db.backups.orderBy('createdAt').last();
    if (last && Date.now() - last.createdAt < MIN_INTERVAL_MS) {
      return null;
    }
    const json = await exportAll();
    const rec: BackupRecord = {
      createdAt: Date.now(),
      kind: 'auto',
      bytes: json.length,
      json
    };
    const id = await db.backups.add(rec);
    await pruneAutoBackups();
    return { ...rec, id: id as number };
  } catch (err) {
    console.error('自動バックアップ失敗', err);
    return null;
  }
}

async function pruneAutoBackups() {
  const autos = await db.backups
    .where('kind')
    .equals('auto')
    .sortBy('createdAt');
  if (autos.length <= MAX_AUTO_BACKUPS) return;
  const ids = autos
    .slice(0, autos.length - MAX_AUTO_BACKUPS)
    .map((b) => b.id!)
    .filter(Boolean);
  await db.backups.bulkDelete(ids);
}

export async function createManualBackup(label?: string): Promise<BackupRecord> {
  const json = await exportAll();
  const rec: BackupRecord = {
    createdAt: Date.now(),
    kind: 'manual',
    label: label?.trim() || undefined,
    bytes: json.length,
    json
  };
  const id = await db.backups.add(rec);
  return { ...rec, id: id as number };
}

export async function listBackups(): Promise<BackupRecord[]> {
  return db.backups.orderBy('createdAt').reverse().toArray();
}

export async function restoreBackup(id: number): Promise<void> {
  const rec = await db.backups.get(id);
  if (!rec) throw new Error('バックアップが見つかりません');
  // 復元前の現在データを念のため manual として保存しておく。
  await createManualBackup('復元直前の自動退避');
  await importAll(rec.json);
}

export async function deleteBackup(id: number): Promise<void> {
  await db.backups.delete(id);
}
