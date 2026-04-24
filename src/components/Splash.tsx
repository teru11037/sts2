export default function Splash() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background:
          'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(148, 102, 212, 0.35), transparent 60%), linear-gradient(180deg, #181028, #0a0712)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        color: '#f4eefa',
        zIndex: 100
      }}
    >
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: 22,
          background: 'linear-gradient(160deg, #c289ff, #7443c9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 44,
          fontWeight: 800,
          boxShadow: '0 16px 50px rgba(148,102,212,0.5), inset 0 2px 0 rgba(255,255,255,0.25)',
          animation: 'splash-pulse 1.6s ease-in-out infinite'
        }}
      >
        ⚔
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: 0.02 }}>
        STS2 Companion
      </div>
      <div style={{ fontSize: 12, color: '#b4a4d0' }}>データを準備しています…</div>
      <style>{`
        @keyframes splash-pulse {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.06); filter: brightness(1.15); }
        }
      `}</style>
    </div>
  );
}
