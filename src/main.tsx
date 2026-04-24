import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ensureSeeded } from './db';
import { ensureDailyBackup } from './db/backup';
import ErrorBoundary from './components/ErrorBoundary';
import Splash from './components/Splash';
import StorageWarning from './components/StorageWarning';
import UpdatePrompt from './components/UpdatePrompt';

type Phase =
  | { kind: 'init' }
  | { kind: 'ready' }
  | { kind: 'storage_error'; reason: string };

function Root() {
  const [phase, setPhase] = useState<Phase>({ kind: 'init' });

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (typeof indexedDB === 'undefined') {
        if (mounted)
          setPhase({
            kind: 'storage_error',
            reason: 'indexedDB API that this browser does not expose.'
          });
        return;
      }
      try {
        await ensureSeeded();
      } catch (err) {
        if (mounted)
          setPhase({
            kind: 'storage_error',
            reason: (err as Error).message ?? String(err)
          });
        return;
      }
      if (mounted) setPhase({ kind: 'ready' });
      // 自動バックアップは非同期で実行 (起動速度を優先)
      setTimeout(() => {
        void ensureDailyBackup();
      }, 3000);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (phase.kind === 'storage_error') return <StorageWarning reason={phase.reason} />;
  if (phase.kind !== 'ready') return <Splash />;
  return (
    <HashRouter>
      <App />
      <UpdatePrompt />
    </HashRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Root />
    </ErrorBoundary>
  </React.StrictMode>
);
