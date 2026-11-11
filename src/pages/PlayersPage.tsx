import React, { useState, useEffect, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { Player, PlayerRole, CricketFormat } from '../types/cricket';
import { PlayerCard } from '../components/player/PlayerCard';
import { Search, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PlayersPage: React.FC = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [countryFilter, setCountryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedFormat, setSelectedFormat] = useState<CricketFormat>('T20');

  useEffect(() => {
    setPlayers(storageService.getPlayers());
    const unsub = storageService.subscribe(() => {
      setPlayers(storageService.getPlayers());
    });
    return unsub;
  }, []);

  const countries = useMemo(() => {
    const set = new Set<string>();
    players.forEach((p) => set.add(p.country));
    return ['All', ...Array.from(set).sort()];
  }, [players]);

  const filtered = useMemo(() => {
    return players
      .filter((p) => {
        if (searchTerm.trim()) {
          const t = searchTerm.toLowerCase();
          const match =
            p.fullName.toLowerCase().includes(t) ||
            p.displayName.toLowerCase().includes(t) ||
            p.country.toLowerCase().includes(t) ||
            p.specialization.toLowerCase().includes(t);
          if (!match) return false;
        }
        if (roleFilter !== 'All') {
          if (roleFilter === 'Wicketkeeper') {
            const isWk = p.primaryRole === 'Wicketkeeper' || p.secondaryRoles.includes('Wicketkeeper');
            if (!isWk) return false;
          } else if (p.primaryRole !== roleFilter) return false;
        }
        if (countryFilter !== 'All' && p.country !== countryFilter) return false;
        if (statusFilter !== 'All' && p.careerStatus !== statusFilter) return false;
        return true;
      })
      .sort((a, b) => {
        const aR =
          selectedFormat === 'ODI' ? a.formatRatings.ODI : selectedFormat === 'TEST' ? a.formatRatings.TEST : a.formatRatings.T20;
        const bR =
          selectedFormat === 'ODI' ? b.formatRatings.ODI : selectedFormat === 'TEST' ? b.formatRatings.TEST : b.formatRatings.T20;
        return (bR || b.overallRating) - (aR || a.overallRating);
      });
  }, [players, searchTerm, roleFilter, countryFilter, statusFilter, selectedFormat]);

  const groupedPlayers = useMemo(() => {
    const categories: { role: PlayerRole; title: string }[] = [
      { role: 'Wicketkeeper', title: 'Wicketkeepers' },
      { role: 'Batter', title: 'Batters' },
      { role: 'All-rounder', title: 'All-rounders' },
      { role: 'Bowler', title: 'Bowlers' },
    ];

    return categories
      .map((category) => ({
        ...category,
        players: filtered.filter((player) => player.primaryRole === category.role),
      }))
      .filter((category) => category.players.length > 0);
  }, [filtered]);

  const handleCompare = (player: Player) => {
    navigate(`/compare?player1=${player.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
            Players
          </h1>
        </div>

        {/* Format Rating Filter Pills */}
        <div className="flex items-center gap-2 bg-[#121720] p-1.5 rounded-xl border border-white/5 shrink-0">
          <span className="text-xs text-[#929BA8] px-2 font-semibold">Ratings for:</span>
          {(['T20', 'ODI', 'TEST'] as const).map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => setSelectedFormat(fmt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedFormat === fmt
                  ? 'bg-[#20C878] text-[#090B0F]'
                  : 'text-[#929BA8] hover:text-white'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#929BA8]" />
            <input
              type="text"
              placeholder="Search players by name, country, specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#181F29] border border-white/10 rounded-xl text-sm text-white placeholder-[#929BA8] focus:outline-none focus:border-[#20C878]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Country */}
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="bg-[#181F29] text-white text-xs border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#20C878] w-full sm:w-auto"
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Countries' : c}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#181F29] text-white text-xs border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#20C878] w-full sm:w-auto"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Stars</option>
              <option value="Legend">Legends</option>
            </select>
          </div>
        </div>

        {/* Role Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {(['All', 'Batter', 'All-rounder', 'Bowler', 'Wicketkeeper'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                roleFilter === r
                  ? 'bg-[#20C878] text-[#090B0F]'
                  : 'bg-[#181F29] text-[#929BA8] hover:text-white'
              }`}
            >
              {r === 'All' && 'All Roles'}
              {r === 'Batter' && 'Batters'}
              {r === 'All-rounder' && 'All-rounders'}
              {r === 'Bowler' && 'Bowlers'}
              {r === 'Wicketkeeper' && 'Wicketkeepers'}
            </button>
          ))}
        </div>
      </div>

      {/* Players grouped by primary role */}
      {groupedPlayers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-[#121720] p-10 text-center">
          <p className="text-sm font-semibold text-white">No players found</p>
          <p className="mt-1 text-xs text-[#929BA8]">Try changing your search or filters.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {groupedPlayers.map((category) => (
            <section key={category.role} aria-labelledby={`players-${category.role}`}>
              <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
                <h2 id={`players-${category.role}`} className="text-base font-bold text-white sm:text-lg">
                  {category.title}
                </h2>
                <span className="text-xs font-medium text-[#929BA8]">
                  {category.players.length} {category.players.length === 1 ? 'player' : 'players'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {category.players.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    onViewDetails={(selectedPlayer) =>
                      navigate(`/players/${selectedPlayer.id}`, { state: { returnTo: '/players' } })
                    }
                    onCompare={handleCompare}
                    format={selectedFormat}
                    compact={false}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
