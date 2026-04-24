import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // 開発者ツールで追えるように console へ
    console.error('ErrorBoundary caught', error, info);
  }

  reset = () => this.setState({ error: null });
  reload = () => location.reload();

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ padding: 20, color: '#f0eaf5' }}>
        <h2 style={{ color: '#ff8b8b', marginTop: 32 }}>アプリでエラーが発生しました</h2>
        <p style={{ color: '#a294c0' }}>
          保存済みデータは失われていません。再読み込みするか、画面を戻って続行してください。
        </p>
        <pre
          style={{
            background: '#1e1830',
            border: '1px solid #3a305a',
            borderRadius: 10,
            padding: 12,
            fontSize: 12,
            overflow: 'auto',
            color: '#f0eaf5',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: 240
          }}
        >
          {this.state.error.message}
          {'\n\n'}
          {this.state.error.stack ?? ''}
        </pre>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button
            onClick={this.reset}
            style={{
              background: '#9466d4',
              color: '#fff',
              border: 'none',
              padding: '12px 18px',
              borderRadius: 10,
              fontWeight: 600
            }}
          >
            戻して続行
          </button>
          <button
            onClick={this.reload}
            style={{
              background: '#1e1830',
              color: '#f0eaf5',
              border: '1px solid #3a305a',
              padding: '12px 18px',
              borderRadius: 10
            }}
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }
}
