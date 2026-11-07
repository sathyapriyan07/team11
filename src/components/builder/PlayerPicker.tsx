import React, { useState, useMemo } from 'react';
import { Player, PlayerRole, CricketFormat } from '../../types/cricket';
import { PlayerCard } from '../player/PlayerCard';
import { Search, Filter, LayoutGrid, List, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface PlayerPickerProps {
  allPlayers: Player[];
  selectedPlayerIds: string[];
  onTogglePlayer: (player: Player) => void;
  onViewPlayer: (player: Player) => void;
  onComparePlayer?: (player: Player) => void;
  format?: CricketFormat;
  defaultRoleFilter?: string;
  allowedFranchiseId?: string;
}

export const PlayerPicker: React.FC<PlayerPickerProps> = ({
  allPlayers,
  selectedPlayerIds,
  onTogglePlayer,
  onViewPlayer,
  onComparePlayer,
  format = 'T20',
  allowedFranchiseId,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [countryFilter, setCountryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'rating' | 'name' | 'runs' | 'wickets'>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Unique countries list
  const countries = useMemo(() => {
    const set = new Set<string>();
    allPlayers.forEach((p) => set.add(p.country));
    return ['All', ...Array.from(set).sort()];
  }, [allPlayers]);

  const filteredPlayers = useMemo(() => {
    return allPlayers
      .filter((p) => {
        // Franchise restriction if in franchise mode
        if (allowedFranchiseId && !p.teamsPlayed.includes(allowedFranchiseId)) {
          return false;
        }

        // Search term
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchName = p.fullName.toLowerCase().includes(term) || p.displayName.toLowerCase().includes(term);
          const matchCountry = p.country.toLowerCase().includes(term);
          const matchSpec = p.specialization.toLowerCase().includes(term);
          if (!matchName && !matchCountry && !matchSpec) return false;
        }

        // Role filter
        if (roleFilter !== 'All') {
          if (roleFilter === 'Wicketkeeper') {
            const isWk = p.primaryRole === 'Wicketkeeper' || p.secondaryRoles.includes('Wicketkeeper');
            if (!isWk) return false;
          } else if (p.primaryRole !== roleFilter) {
            return false;
          }
        }

        // Country filter
        if (countryFilter !== 'All' && p.country !== countryFilter) {
          return false;
        }

        // Status filter
        if (statusFilter !== 'All') {
          if (statusFilter === 'Active' && p.careerStatus !== 'Active') return false;
          if (statusFilter === 'Legend' && p.careerStatus !== 'Legend') return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.displayName.localeCompare(b.displayName);
        }
        if (sortBy === 'runs') {
          return (b.stats.IPL?.runs || b.stats.T20.runs) - (a.stats.IPL?.runs || a.stats.T20.runs);
        }
        if (sortBy === 'wickets') {
          return (b.stats.IPL?.wickets || b.stats.T20.wickets) - (a.stats.IPL?.wickets || a.stats.T20.wickets);
        }
        // Rating default
        const aRating =
          format === 'ODI' ? a.formatRatings.ODI : format === 'TEST' ? a.formatRatings.TEST : a.formatRatings.T20;
        const bRating =
          format === 'ODI' ? b.formatRatings.ODI : format === 'TEST' ? b.formatRatings.TEST : b.formatRatings.T20;
        return (bRating || b.overallRating) - (aRating || a.overallRating);
      });
  }, [allPlayers, allowedFranchiseId, searchTerm, roleFilter, countryFilter, statusFilter, sortBy, format]);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#121720] p-3 shadow-xl sm:gap-4 sm:p-4">
      {/* Top Filter Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#929BA8]" />
            <input
              type="text"
              placeholder="Search players by name, specialization, or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full min-w-0 rounded-xl border border-white/10 bg-[#181F29] py-2 pl-10 pr-2 text-[11px] text-white placeholder-[#929BA8] transition-colors focus:border-[#20C878] focus:outline-none sm:py-2 sm:pr-4 sm:text-sm"
            />
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center bg-[#181F29] rounded-xl p-1 border border-white/5 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-[#20C878] text-[#090B0F]' : 'text-[#929BA8] hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-[#20C878] text-[#090B0F]' : 'text-[#929BA8] hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Roles Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(['All', 'Batter', 'All-rounder', 'Bowler', 'Wicketkeeper'] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter(role)}
              className={`shrink-0 rounded-xl px-3 py-1.5 font-semibold whitespace-nowrap transition-all ${
                roleFilter === role
                  ? 'bg-[#20C878] text-[#090B0F] shadow-sm shadow-[#20C878]/20'
                  : 'bg-[#181F29] text-[#929BA8] hover:text-white hover:bg-[#202938]'
              }`}
            >
              {role === 'All' && 'All Roles'}
              {role === 'Batter' && '🏏 Batters'}
              {role === 'All-rounder' && '⚡ All-rounders'}
              {role === 'Bowler' && '🎯 Bowlers'}
              {role === 'Wicketkeeper' && '🧤 Keepers'}
            </button>
          ))}
        </div>

        {/* Secondary Filters: Country, Status, Sort */}
        <div className="grid grid-cols-2 gap-2 text-xs sm:flex sm:flex-wrap sm:items-center">
          <select
            aria-label="Filter by country"
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="h-9 w-full min-w-0 rounded-xl border border-white/10 bg-[#181F29] px-2 text-[11px] text-[#F5F7FA] focus:border-[#20C878] focus:outline-none sm:h-auto sm:w-auto sm:px-2.5 sm:py-1.5 sm:text-xs"
          >
            {countries.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Countries' : c}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by player status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 w-full min-w-0 rounded-xl border border-white/10 bg-[#181F29] px-2 text-[11px] text-[#F5F7FA] focus:border-[#20C878] focus:outline-none sm:h-auto sm:w-auto sm:px-2.5 sm:py-1.5 sm:text-xs"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Legend">Legends Only</option>
          </select>

          <div className="col-span-2 flex min-w-0 items-center justify-between gap-2 sm:ml-auto sm:col-span-1 sm:justify-start">
            <select
              aria-label="Sort players"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rating' | 'name' | 'runs' | 'wickets')}
              className="h-9 min-w-0 rounded-xl border border-white/10 bg-[#181F29] px-2 text-[11px] text-[#F5F7FA] focus:border-[#20C878] focus:outline-none sm:h-auto sm:px-2.5 sm:py-1.5 sm:text-xs"
            >
              <option value="rating">Sort by Rating</option>
              <option value="name">Sort by Name</option>
              <option value="runs">Sort by Runs</option>
              <option value="wickets">Sort by Wickets</option>
            </select>
            <span className="shrink-0 text-[11px] text-[#929BA8]">
              {filteredPlayers.length} available
            </span>
          </div>
        </div>
      </div>

      {/* Players Collection Display */}
      {filteredPlayers.length === 0 ? (
        <div className="p-8 text-center text-[#929BA8] border border-dashed border-white/10 rounded-xl">
          <p className="text-sm font-semibold text-white">No players found</p>
          <p className="text-xs text-[#929BA8] mt-1">
            Try adjusting your search query, role filter or country filter.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-3 max-h-[75vh] overflow-y-auto pr-1">
          {filteredPlayers.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              isSelected={selectedPlayerIds.includes(player.id)}
              onSelect={onTogglePlayer}
              onViewDetails={onViewPlayer}
              onCompare={onComparePlayer}
              format={format}
              compact={false}
            />
          ))}
        </div>
      ) : (
        <div className="flex max-h-[75vh] flex-col gap-2 overflow-y-auto pr-1">
          {filteredPlayers.map((player) => {
            const isSelected = selectedPlayerIds.includes(player.id);
            return (
              <div
                key={player.id}
                className={`relative flex min-h-28 min-w-0 items-center overflow-hidden rounded-xl border p-3 transition-colors ${
                  isSelected
                    ? 'border-[#20C878]/50 bg-[#182420]'
                    : 'border-white/5 bg-[#181F29] hover:border-white/15'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onViewPlayer(player)}
                  aria-label={`View ${player.displayName} profile`}
                  className="absolute bottom-0 left-3 flex h-28 w-20 shrink-0 items-end justify-center"
                >
                  {player.imageUrl ? (
                    <img
                      src={player.imageUrl}
                      alt=""
                      className="h-full w-full object-contain object-bottom"
                      loading="lazy"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="mb-2 grid h-12 w-12 place-items-center rounded-full bg-[#202938] text-lg font-bold text-white/50"
                    >
                      {player.displayName.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </button>

                <div className="ml-[5.75rem] flex min-w-0 flex-1 items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                      <button
                        type="button"
                        onClick={() => onViewPlayer(player)}
                        className="max-w-full truncate text-left text-xs font-bold text-white hover:text-[#20C878]"
                      >
                        {player.displayName}
                      </button>
                      <span className="truncate text-[9px] text-[#929BA8]">{player.country}</span>
                    </div>
                    <span className="mt-0.5 block truncate text-[10px] text-[#929BA8]">
                      {player.primaryRole} • {player.specialization}
                    </span>
                  </div>

                  <div className="flex w-[4.25rem] shrink-0 flex-col items-center gap-1">
                    <span className="font-heading text-[11px] font-bold text-[#20C878]">
                      {player.overallRating}
                    </span>
                    <button
                      type="button"
                      onClick={() => onTogglePlayer(player)}
                      aria-label={`${isSelected ? 'Remove' : 'Pick'} ${player.displayName}`}
                      className={`w-full rounded-lg px-2 py-1.5 text-[11px] font-bold transition-all ${
                        isSelected
                          ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                          : 'bg-[#20C878] text-[#090B0F] hover:bg-[#1bb56c]'
                      }`}
                    >
                      {isSelected ? 'Remove' : '+ Pick'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
