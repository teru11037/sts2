import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  back?: boolean;
  right?: ReactNode;
}

export default function TopBar({ title, back, right }: Props) {
  const nav = useNavigate();
  return (
    <div className="topbar">
      {back && (
        <button className="back" onClick={() => nav(-1)} aria-label="戻る">
          ← 戻る
        </button>
      )}
      <h1>{title}</h1>
      {right}
    </div>
  );
}
