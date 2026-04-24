import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCcw, X } from 'lucide-react';

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW({
    onRegisterError(err) {
      console.error('SW register error', err);
    }
  });

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 'calc(100px + env(safe-area-inset-bottom))',
        left: 12,
        right: 12,
        zIndex: 40,
        background:
          'linear-gradient(180deg, rgba(44,32,70,0.96), rgba(28,21,48,0.98))',
        border: '1px solid var(--border-bright)',
        borderRadius: 'var(--radius)',
        padding: 12,
        boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px var(--accent-glow)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        animation: 'sheet-up 300ms var(--ease-spring)'
      }}
    >
      <RefreshCcw size={22} style={{ color: 'var(--accent)', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>新しいバージョンがあります</div>
        <div className="dim" style={{ fontSize: 12 }}>
          更新して最新のデータと機能を取得します。
        </div>
      </div>
      <button
        className="primary"
        onClick={() => updateServiceWorker(true)}
        style={{ padding: '8px 12px', minHeight: 36 }}
      >
        更新
      </button>
      <button
        className="ghost"
        onClick={() => setNeedRefresh(false)}
        aria-label="閉じる"
        style={{ padding: 8, minHeight: 36 }}
      >
        <X size={18} />
      </button>
    </div>
  );
}
