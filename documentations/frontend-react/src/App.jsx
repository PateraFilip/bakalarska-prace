import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import InfoTodo from './pages/InfoTodo';
import InfoWatchlist from './pages/InfoWatchlist';
import InfoGame from './pages/InfoGame';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="info-todo" element={<InfoTodo />} />
          <Route path="info-watchlist" element={<InfoWatchlist />} />
          <Route path="info-game" element={<InfoGame />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;