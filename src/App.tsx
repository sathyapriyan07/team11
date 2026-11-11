/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { BuilderPage } from './pages/BuilderPage';
import { AutoGeneratorPage } from './pages/AutoGeneratorPage';
import { PlayersPage } from './pages/PlayersPage';
import { CompetitionsPage } from './pages/CompetitionsPage';
import { PoolsPage } from './pages/PoolsPage';
import { PlayerComparePage } from './pages/PlayerComparePage';
import { TeamComparePage } from './pages/TeamComparePage';
import { MyTeamsPage } from './pages/MyTeamsPage';
import { ExplorePage } from './pages/ExplorePage';
import { PosterPage } from './pages/PosterPage';
import { AdminPage } from './pages/AdminPage';
import { AdminPlayerFormPage } from './pages/AdminPlayerFormPage';
import { PlayerDetailPage } from './pages/PlayerDetailPage';

// Scroll to top upon route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  const [theme, setTheme] = useState<'black' | 'light'>(() =>
    window.localStorage.getItem('xi-arena-theme') === 'light' ? 'light' : 'black',
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('xi-arena-theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#090B0F] text-[#F5F7FA] flex flex-col font-['Inter_Tight',sans-serif]">
        <ScrollToTop />
        <Navbar theme={theme} onToggleTheme={() => setTheme((current) => current === 'black' ? 'light' : 'black')} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/builder" element={<BuilderPage />} />
            <Route path="/builder/:mode" element={<BuilderPage />} />
            <Route path="/generator" element={<AutoGeneratorPage />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/players/:playerId" element={<PlayerDetailPage />} />
            <Route path="/competitions" element={<CompetitionsPage />} />
            <Route path="/pools" element={<PoolsPage />} />
            <Route path="/compare" element={<PlayerComparePage />} />
            <Route path="/team-compare" element={<TeamComparePage />} />
            <Route path="/my-teams" element={<MyTeamsPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/poster" element={<PosterPage />} />
            <Route path="/admin/players/new" element={<AdminPlayerFormPage />} />
            <Route path="/admin/players/:playerId/edit" element={<AdminPlayerFormPage />} />
            <Route path="/admin" element={<AdminPage />} />
            {/* Fallback */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
