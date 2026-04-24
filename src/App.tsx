import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import BottomNav from './components/BottomNav';
import PageTransition from './components/PageTransition';
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
import NotFound from './components/NotFound';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/cards" element={<PageTransition><Cards /></PageTransition>} />
        <Route path="/cards/new" element={<PageTransition><CardEdit /></PageTransition>} />
        <Route path="/cards/:id" element={<PageTransition><CardEdit /></PageTransition>} />
        <Route path="/relics" element={<PageTransition><Relics /></PageTransition>} />
        <Route path="/relics/new" element={<PageTransition><RelicEdit /></PageTransition>} />
        <Route path="/relics/:id" element={<PageTransition><RelicEdit /></PageTransition>} />
        <Route path="/decks" element={<PageTransition><Decks /></PageTransition>} />
        <Route path="/decks/new" element={<PageTransition><DeckEdit /></PageTransition>} />
        <Route path="/decks/:id" element={<PageTransition><DeckEdit /></PageTransition>} />
        <Route path="/runs" element={<PageTransition><Runs /></PageTransition>} />
        <Route path="/runs/new" element={<PageTransition><RunEdit /></PageTransition>} />
        <Route path="/runs/:id" element={<PageTransition><RunEdit /></PageTransition>} />
        <Route path="/memos" element={<PageTransition><Memos /></PageTransition>} />
        <Route path="/memos/new" element={<PageTransition><MemoEdit /></PageTransition>} />
        <Route path="/memos/:id" element={<PageTransition><MemoEdit /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <div className="app">
      <AnimatedRoutes />
      <BottomNav />
    </div>
  );
}
