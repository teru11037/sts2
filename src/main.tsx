import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ensureSeeded } from './db';
import ErrorBoundary from './components/ErrorBoundary';
import Splash from './components/Splash';

function Root() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    ensureSeeded()
      .catch((err) => console.error('Seed failed', err))
      .finally(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) return <Splash />;
  return (
    <HashRouter>
      <App />
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
