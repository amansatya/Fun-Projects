import { Route, Routes } from 'react-router';
import { Layout } from './components/Layout';
import { ComputerPage } from './pages/ComputerPage';
import { HomePage } from './pages/HomePage';
import { LocalPage } from './pages/LocalPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { OnlineLobbyPage } from './pages/OnlineLobbyPage';
import { OnlineRoomPage } from './pages/OnlineRoomPage';

/** Route table. The router itself is provided in main.tsx (and by tests). */
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="local" element={<LocalPage />} />
        <Route path="computer" element={<ComputerPage />} />
        <Route path="online" element={<OnlineLobbyPage />} />
        <Route path="online/:code" element={<OnlineRoomPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
