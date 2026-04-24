import { AlertTriangle } from 'lucide-react';

export default function StorageWarning({ reason }: { reason?: string }) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        color: '#f4eefa',
        background:
          'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(148, 102, 212, 0.25), transparent 60%), linear-gradient(180deg, #181028, #0a0712)'
      }}
    >
      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: 20,
          background: 'linear-gradient(160deg, #ffc857, #e09a2a)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#1a1625',
          marginBottom: 18,
          boxShadow: '0 12px 36px rgba(255,200,87,0.35)'
        }}
      >
        <AlertTriangle size={36} />
      </div>
      <h2 style={{ margin: 0, fontSize: 18, textAlign: 'center' }}>
        ブラウザのストレージが利用できません
      </h2>
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.7,
          color: '#b4a4d0',
          marginTop: 10,
          maxWidth: 420,
          textAlign: 'center'
        }}
      >
        このアプリはデータを端末内の IndexedDB に保存しますが、
        この環境では書き込みができませんでした。
      </p>
      <ul
        style={{
          fontSize: 13,
          color: '#b4a4d0',
          marginTop: 14,
          paddingLeft: 20,
          maxWidth: 440,
          lineHeight: 1.8
        }}
      >
        <li>Safari の「プライベートブラウズ」を解除する</li>
        <li>iOS の「サイトデータを保持」をオンにする</li>
        <li>別ブラウザ (Chrome, Edge) で開く</li>
        <li>ホーム画面に追加した PWA から起動する (推奨)</li>
      </ul>
      {reason && (
        <pre
          style={{
            marginTop: 18,
            fontSize: 11,
            color: '#8576a8',
            background: 'rgba(0,0,0,0.25)',
            padding: 10,
            borderRadius: 8,
            maxWidth: 420,
            overflow: 'auto'
          }}
        >
          {reason}
        </pre>
      )}
      <button
        onClick={() => location.reload()}
        style={{
          marginTop: 20,
          padding: '12px 20px',
          borderRadius: 12,
          border: '1px solid #564585',
          background: 'linear-gradient(180deg, #c289ff, #9466d4)',
          color: '#fff',
          fontWeight: 700
        }}
      >
        もう一度試す
      </button>
    </div>
  );
}
