import { useNavigate } from 'react-router-dom';
import TopBar from './TopBar';

interface Props {
  title?: string;
  message?: string;
}

export default function NotFound({
  title = '見つかりませんでした',
  message = 'このページまたは項目は存在しないか、削除された可能性があります。'
}: Props) {
  const nav = useNavigate();
  return (
    <>
      <TopBar title={title} back />
      <div className="content">
        <div className="empty">
          <h3>{title}</h3>
          <div className="dim" style={{ marginBottom: 16 }}>
            {message}
          </div>
          <div className="row" style={{ justifyContent: 'center', gap: 10 }}>
            <button onClick={() => nav('/')}>🏠 ホーム</button>
            <button className="primary" onClick={() => nav(-1)}>
              戻る
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
