import { Navigate } from 'react-router-dom';

// 図鑑はカード画面に統合済み。/relics は Cards に合流。
export default function Relics() {
  return <Navigate to="/cards" replace />;
}
