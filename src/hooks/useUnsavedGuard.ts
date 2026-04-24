import { useEffect, useRef } from 'react';

// dirty=true のとき、タブを閉じる/リロードするブラウザダイアログを出す。
// 戻るボタン経由の離脱は TopBar 側で onBack を持たせて確認する (ここでは扱わない)。
export function useUnsavedGuard(dirty: boolean) {
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      e.preventDefault();
      // Chrome 等で必要
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);
}

// TopBar.onBack 用のユーティリティ: dirty なら確認してから実行
export function confirmBack(dirty: boolean): boolean {
  if (!dirty) return true;
  return confirm('保存していない変更があります。破棄して戻りますか？');
}
