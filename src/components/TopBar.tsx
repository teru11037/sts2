import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';

interface Props {
  title: string;
  back?: boolean;
  right?: ReactNode;
  /** back ボタン押下時のガード。false を返すと戻らない。 */
  onBack?: () => boolean | void;
}

export default function TopBar({ title, back, right, onBack }: Props) {
  const nav = useNavigate();
  const handleBack = () => {
    if (onBack && onBack() === false) return;
    nav(-1);
  };
  return (
    <div className="topbar">
      {back && (
        <button className="back" onClick={handleBack} aria-label="戻る">
          <ChevronLeft size={20} />
          <span>戻る</span>
        </button>
      )}
      <h1>{title}</h1>
      {right}
    </div>
  );
}
