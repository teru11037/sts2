import { db } from '../db';
import type { StoredImage } from '../types';

const MAX_BYTES = 1_500_000; // 1.5MB のアップロード上限 (原本)

export interface ResizeOpts {
  maxEdge: number;
  quality?: number;
  mime?: string;
}

export async function readAndResize(file: File, opts: ResizeOpts): Promise<{ dataUrl: string; width: number; height: number }> {
  if (!file.type.startsWith('image/')) {
    throw new Error('画像ファイルを選択してください');
  }
  if (file.size > MAX_BYTES) {
    throw new Error(`ファイルが大きすぎます (${Math.round(file.size / 1024)}KB)。1.5MB 以下にしてください。`);
  }

  const loaded = await loadBitmap(file);
  try {
    const { canvas, width, height } = drawResized(loaded, opts.maxEdge);
    const mime = opts.mime ?? (file.type === 'image/png' ? 'image/png' : 'image/jpeg');
    const dataUrl = canvas.toDataURL(mime, opts.quality ?? 0.82);
    return { dataUrl, width, height };
  } finally {
    closeLoaded(loaded);
  }
}

type LoadedImage =
  | { kind: 'bitmap'; bitmap: ImageBitmap; width: number; height: number }
  | { kind: 'image'; img: HTMLImageElement; width: number; height: number };

async function loadBitmap(file: File): Promise<LoadedImage> {
  if (typeof createImageBitmap === 'function') {
    const b = await createImageBitmap(file);
    return { kind: 'bitmap', bitmap: b, width: b.width, height: b.height };
  }
  return await new Promise<LoadedImage>((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ kind: 'image', img, width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('画像の読み込みに失敗しました'));
    };
    img.src = url;
  });
}

function closeLoaded(loaded: LoadedImage) {
  if (loaded.kind === 'bitmap') loaded.bitmap.close?.();
}

function drawResized(loaded: LoadedImage, maxEdge: number) {
  const srcW = loaded.width;
  const srcH = loaded.height;
  const scale = Math.min(1, maxEdge / Math.max(srcW, srcH));
  const width = Math.max(1, Math.round(srcW * scale));
  const height = Math.max(1, Math.round(srcH * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  if (loaded.kind === 'bitmap') {
    ctx.drawImage(loaded.bitmap, 0, 0, width, height);
  } else {
    ctx.drawImage(loaded.img, 0, 0, width, height);
  }
  return { canvas, width, height };
}

export async function saveImage(id: string, dataUrl: string, width: number, height: number): Promise<StoredImage> {
  const img: StoredImage = { id, dataUrl, width, height, updatedAt: Date.now() };
  await db.images.put(img);
  return img;
}

export async function deleteImage(id: string): Promise<void> {
  await db.images.delete(id);
}

// 孤立した画像を掃除 (どのカード/レリックからも参照されていない)
export async function garbageCollectImages(): Promise<number> {
  const [imgs, cards, relics] = await Promise.all([
    db.images.toArray(),
    db.cards.toArray(),
    db.relics.toArray()
  ]);
  const referenced = new Set<string>();
  for (const c of cards) if (c.imageId) referenced.add(c.imageId);
  for (const r of relics) if (r.imageId) referenced.add(r.imageId);
  const orphans = imgs.filter((i) => !referenced.has(i.id)).map((i) => i.id);
  if (orphans.length > 0) await db.images.bulkDelete(orphans);
  return orphans.length;
}
