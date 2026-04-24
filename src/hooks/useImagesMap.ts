import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { db } from '../db';

export function useImagesMap(): Map<string, string> {
  const imgs = useLiveQuery(() => db.images.toArray(), []);
  return useMemo(() => {
    const m = new Map<string, string>();
    for (const img of imgs ?? []) m.set(img.id, img.dataUrl);
    return m;
  }, [imgs]);
}

export function useSingleImage(id: string | undefined): string | undefined {
  return useLiveQuery(async () => {
    if (!id) return undefined;
    const img = await db.images.get(id);
    return img?.dataUrl;
  }, [id]);
}
