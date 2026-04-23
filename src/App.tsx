import { Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Cards from './pages/Cards';
import CardEdit from './pages/CardEdit';
import Relics from './pages/Relics';
import RelicEdit from './pages/RelicEdit';
import Decks from './pages/Decks';
import DeckEdit from './pages/DeckEdit';
import Runs from './pages/Runs';
import RunEdit from './pages/RunEdit';
import Memos from './pages/Memos';
import MemoEdit from './pages/MemoEdit';
import Settings from './pages/Settings';

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cards" element={<Cards />} />
        <Route path="/cards/new" element={<CardEdit />} />
        <Route path="/cards/:id" element={<CardEdit />} />
        <Route path="/relics" element={<Relics />} />
        <Route path="/relics/new" element={<RelicEdit />} />
        <Route path="/relics/:id" element={<RelicEdit />} />
        <Route path="/decks" element={<Decks />} />
        <Route path="/decks/new" element={<DeckEdit />} />
        <Route path="/decks/:id" element={<DeckEdit />} />
        <Route path="/runs" element={<Runs />} />
        <Route path="/runs/new" element={<RunEdit />} />
        <Route path="/runs/:id" element={<RunEdit />} />
        <Route path="/memos" element={<Memos />} />
        <Route path="/memos/new" element={<MemoEdit />} />
        <Route path="/memos/:id" element={<MemoEdit />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  );
}
