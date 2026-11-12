import React, { useMemo, useState } from 'react';
import { CricketFormat, Player, PlayerRole, TeamEntity } from '../../types/cricket';
import {
  Check,
  Eye,
  Grid2X2,
  List,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';

type PickerSort = 'rating' | 'name' | 'runs' | 'wickets';
type PickerView = 'grid' | 'list';

interface PlayerPickerProps {
  allPlayers: Player[];
  teams?: TeamEntity[];
  selectedPlayerIds: string[];
  onTogglePlayer: (player: Player) => void;
  onViewPlayer: (player: Player) => void;
  format?: CricketFormat;
  maxPlayers?: number;
  getUnavailableReason?: (player: Player) => string | undefined;
}

export const PlayerPicker: React.FC<PlayerPickerProps> = ({
  allPlayers,
  teams = [],
  selectedPlayerIds,
  onTogglePlayer,
  onViewPlayer,
  format = 'T20',
  maxPlayers = 11,
  getUnavailableReason,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | PlayerRole>('All');
  const [countryFilter, setCountryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | Player['careerStatus']>('All');
  const [sortBy, setSortBy] = useState<PickerSort>('rating');
  const [viewMode, setViewMode] = useState<PickerView>('grid');
  const [profilePlayerId, setProfilePlayerId] = useState<string | null>(null);

  const selectedIds = useMemo(() => new Set(selectedPlayerIds), [selectedPlayerIds]);
  const teamsById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);
  const countries = useMemo(
    () => ['All', ...Array.from(new Set(allPlayers.map((player) => player.country))).sort()],
    [allPlayers],
  );
  const filteredPlayers = useMemo(() => {
    const search = searchTerm.trim().toLocaleLowerCase();
    return allPlayers
      .filter((player) => {
        if (search) {
          const matches =
            player.fullName.toLocaleLowerCase().includes(search) ||
            player.displayName.toLocaleLowerCase().includes(search) ||
            player.country.toLocaleLowerCase().includes(search) ||
            player.specialization.toLocaleLowerCase().includes(search);
          if (!matches) return false;
        }
        if (roleFilter === 'Wicketkeeper') {
          if (player.primaryRole !== 'Wicketkeeper' && !player.secondaryRoles.includes('Wicketkeeper')) return false;
        } else if (roleFilter !== 'All' && player.primaryRole !== roleFilter) {
          return false;
        }
        if (countryFilter !== 'All' && player.country !== countryFilter) return false;
        if (statusFilter !== 'All' && player.careerStatus !== statusFilter) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.displayName.localeCompare(b.displayName);
        if (sortBy === 'runs') return (b.stats.IPL?.runs ?? b.stats.T20.runs) - (a.stats.IPL?.runs ?? a.stats.T20.runs);
        if (sortBy === 'wickets') return (b.stats.IPL?.wickets ?? b.stats.T20.wickets) - (a.stats.IPL?.wickets ?? a.stats.T20.wickets);
        const rating = (player: Player) =>
          format === 'ODI'
            ? player.formatRatings.ODI ?? player.overallRating
            : format === 'TEST'
            ? player.formatRatings.TEST ?? player.overallRating
            : player.formatRatings.T20 ?? player.overallRating;
        return rating(b) - rating(a);
      });
  }, [allPlayers, countryFilter, format, roleFilter, searchTerm, sortBy, statusFilter]);

  const profilePlayer = allPlayers.find((player) => player.id === profilePlayerId);
  const remainingSlots = Math.max(0, maxPlayers - selectedIds.size);

  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#262A32] bg-[#111318]" aria-labelledby="player-picker-title">
      <div className="border-b border-[#262A32] p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.13em] text-[#AEB3BC]">
              <SlidersHorizontal className="h-4 w-4" />
              PLAYER POOL
            </div>
            <h2 id="player-picker-title" className="mt-1 font-heading text-base font-semibold text-[#F5F5F6]">
              Select your squad
            </h2>
          </div>
          <span className="rounded-lg border border-[#343943] bg-[#171A20] px-3 py-2 text-[10px] font-medium tabular-nums text-[#C3C7CE]">
            {selectedIds.size} / {maxPlayers} selected · {remainingSlots} open
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <label className="relative block">
            <span className="sr-only">Search players by name, country or specialization</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#747B86]" />
            <input
              type="search"
              placeholder="Search name, country or specialization"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="min-h-11 w-full rounded-lg border border-[#343943] bg-[#171A20] py-2 pl-10 pr-3 text-xs text-[#F5F5F6] placeholder:text-[#747B86] focus:border-[#AEB3BC] focus:outline-none"
            />
          </label>

          <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by player role">
            {(['All', 'Batter', 'All-rounder', 'Bowler', 'Wicketkeeper'] as const).map((role) => (
              <button
                key={role}
                type="button"
                aria-pressed={roleFilter === role}
                onClick={() => setRoleFilter(role)}
                className={`min-h-9 shrink-0 rounded-lg border px-3 text-[11px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B7BBC4] ${
                  roleFilter === role
                    ? 'border-[#B7BBC4] bg-[#B7BBC4] text-[#111318]'
                    : 'border-[#343943] bg-[#171A20] text-[#A0A5AE] hover:text-[#F5F5F6]'
                }`}
              >
                {role === 'All' ? 'All roles' : role === 'Wicketkeeper' ? 'Wicketkeepers' : `${role}${role === 'Bowler' ? 's' : role === 'Batter' ? 's' : ''}`}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <label>
              <span className="sr-only">Filter by country</span>
              <select
                value={countryFilter}
                onChange={(event) => setCountryFilter(event.target.value)}
                className="min-h-10 w-full rounded-lg border border-[#343943] bg-[#171A20] px-3 text-[11px] text-[#D2D4D9] focus:border-[#AEB3BC] focus:outline-none"
              >
                {countries.map((country) => <option key={country} value={country}>{country === 'All' ? 'All countries' : country}</option>)}
              </select>
            </label>
            <label>
              <span className="sr-only">Filter by career status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
                className="min-h-10 w-full rounded-lg border border-[#343943] bg-[#171A20] px-3 text-[11px] text-[#D2D4D9] focus:border-[#AEB3BC] focus:outline-none"
              >
                <option value="All">All statuses</option>
                <option value="Active">Active</option>
                <option value="Retired">Retired</option>
                <option value="Legend">Legend</option>
              </select>
            </label>
            <div className="col-span-2 flex items-center justify-between gap-2 sm:col-span-1">
              <label className="min-w-0 flex-1 sm:flex-none">
                <span className="sr-only">Sort players</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as PickerSort)}
                  className="min-h-10 w-full rounded-lg border border-[#343943] bg-[#171A20] px-3 text-[11px] text-[#D2D4D9] focus:border-[#AEB3BC] focus:outline-none"
                >
                  <option value="rating">Rating</option>
                  <option value="name">Name</option>
                  <option value="runs">Runs</option>
                  <option value="wickets">Wickets</option>
                </select>
              </label>
              <div className="flex shrink-0 rounded-lg border border-[#343943] bg-[#171A20] p-0.5">
                <button
                  type="button"
                  aria-label="Grid view"
                  aria-pressed={viewMode === 'grid'}
                  onClick={() => setViewMode('grid')}
                  className={`grid h-9 w-9 place-items-center rounded-md ${viewMode === 'grid' ? 'bg-[#2A2E36] text-white' : 'text-[#858B96]'}`}
                >
                  <Grid2X2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="List view"
                  aria-pressed={viewMode === 'list'}
                  onClick={() => setViewMode('list')}
                  className={`grid h-9 w-9 place-items-center rounded-md ${viewMode === 'list' ? 'bg-[#2A2E36] text-white' : 'text-[#858B96]'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 pt-3 text-[10px] text-[#858B96] sm:px-5">
        <span>{filteredPlayers.length} players</span>
        {remainingSlots === 0 && <span className="text-amber-100">XI full · remove a player to add another</span>}
      </div>

      {filteredPlayers.length === 0 ? (
        <div className="m-4 rounded-xl border border-dashed border-[#343943] px-4 py-10 text-center sm:m-5">
          <p className="text-sm font-medium text-[#E3E5E9]">No players match these filters</p>
          <p className="mt-1 text-xs text-[#858B96]">Try a different search or clear a filter.</p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setRoleFilter('All');
              setCountryFilter('All');
              setStatusFilter('All');
            }}
            className="mt-4 inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#343943] px-3 text-xs text-[#D2D4D9] hover:bg-white/[0.05]"
          >
            <X className="h-3.5 w-3.5" /> Clear filters
          </button>
        </div>
      ) : (
        <div className={`max-h-[72vh] overflow-y-auto p-4 sm:p-5 ${
          viewMode === 'grid' ? 'grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-3' : 'flex flex-col gap-2'
        }`}>
          {filteredPlayers.map((player) => {
            const isSelected = selectedIds.has(player.id);
            const reason = getUnavailableReason?.(player);
            const atCapacity = !isSelected && remainingSlots === 0;
            const addDisabled = !isSelected && (Boolean(reason) || atCapacity);
            const franchise = player.teamsPlayed.map((teamId) => teamsById.get(teamId)).find(Boolean);
            const rating = format === 'ODI'
              ? player.formatRatings.ODI
              : format === 'TEST'
              ? player.formatRatings.TEST
              : player.formatRatings.T20;

            return (
              <article
                key={player.id}
                className={`group min-w-0 overflow-hidden rounded-xl border bg-[#171A20] transition-colors ${
                  isSelected ? 'border-[#B7BBC4]/60' : reason ? 'border-white/[0.05] opacity-70' : 'border-white/[0.07] hover:border-white/20'
                } ${viewMode === 'list' ? 'flex min-h-[92px] items-center gap-3 p-3' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => setProfilePlayerId(isSelected && profilePlayerId === player.id ? null : player.id)}
                  aria-label={`Preview ${player.displayName}`}
                  className={`relative block min-w-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#B7BBC4] ${
                    viewMode === 'grid' ? 'w-full' : 'h-16 w-16 shrink-0 overflow-hidden rounded-lg'
                  }`}
                >
                  <div className={`relative overflow-hidden bg-[#262A32] ${
                    viewMode === 'grid' ? 'aspect-[4/3]' : 'h-full w-full'
                  }`}>
                    {player.imageUrl ? (
                      <img
                        src={player.imageUrl}
                        alt={player.displayName}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover object-top transition-transform group-hover:scale-[1.02]"
                      />
                    ) : (
                      <span className="grid h-full place-items-center font-heading text-3xl font-semibold text-white/40">
                        {player.displayName.slice(0, 1)}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                    {franchise?.logo && (
                      <img
                        src={franchise.logo}
                        alt={`${franchise.name} logo`}
                        loading="lazy"
                        className="absolute left-2 top-2 h-6 w-6 rounded-md border border-white/15 bg-black/50 p-0.5 object-contain"
                      />
                    )}
                    <span className="absolute bottom-2 left-2 right-2 truncate font-heading text-xs font-semibold text-white">
                      {player.displayName}
                    </span>
                    <span className="absolute bottom-2 right-2 rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold tabular-nums text-white/90">
                      {rating || player.overallRating}
                    </span>
                  </div>
                </button>
                <div className={`min-w-0 flex-1 ${viewMode === 'grid' ? 'p-3 pt-2.5' : ''}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[10px] text-[#A0A5AE]">{player.country}</p>
                    {player.careerStatus === 'Legend' && (
                      <span className="shrink-0 rounded border border-[#454B56] px-1.5 py-0.5 text-[8px] uppercase tracking-wide text-[#C3C7CE]">
                        Legend
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-[11px] font-medium text-[#E3E5E9]">{player.primaryRole}</p>
                  <p className="mt-0.5 truncate text-[9px] text-[#858B96]">{player.specialization}</p>
                  {reason && <p className="mt-2 text-[9px] leading-4 text-amber-100">{reason}</p>}
                  {atCapacity && <p className="mt-2 text-[9px] leading-4 text-amber-100">Starting XI is full</p>}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onTogglePlayer(player)}
                      disabled={addDisabled}
                      aria-pressed={isSelected}
                      title={reason || (atCapacity ? 'Remove a player before adding another' : undefined)}
                      className={`inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 text-[10px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B7BBC4] ${
                        isSelected
                          ? 'border border-[#59606C] bg-[#262A32] text-[#E3E5E9] hover:bg-[#343943]'
                          : addDisabled
                          ? 'cursor-not-allowed bg-[#252830] text-[#747B86]'
                          : 'bg-[#B7BBC4] text-[#111318] hover:bg-[#D5D8DE]'
                      }`}
                    >
                      {isSelected ? <><Check className="h-3.5 w-3.5" /> In XI · remove</> : <><Plus className="h-3.5 w-3.5" /> Add to XI</>}
                    </button>
                    <button
                      type="button"
                      onClick={() => onViewPlayer(player)}
                      aria-label={`Open ${player.displayName}'s full profile`}
                      title="Open full profile"
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#343943] text-[#A0A5AE] transition hover:bg-white/[0.05] hover:text-white"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {profilePlayer && (
        <aside className="border-t border-[#262A32] bg-[#171A20] p-4 sm:p-5" aria-label={`${profilePlayer.displayName} profile preview`}>
          <div className="flex items-start gap-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#262A32]">
              {profilePlayer.imageUrl ? (
                <img src={profilePlayer.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover object-top" />
              ) : <span className="grid h-full place-items-center text-lg text-white/50">{profilePlayer.displayName[0]}</span>}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h3 className="font-heading text-sm font-semibold text-[#F5F5F6]">{profilePlayer.displayName}</h3>
                <span className="text-[10px] text-[#858B96]">{profilePlayer.country} · {profilePlayer.primaryRole}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#A0A5AE]">
                {profilePlayer.bio || profilePlayer.specialization}
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-[#858B96]">
                <span>T20 {profilePlayer.formatRatings.T20}</span>
                <span>ODI {profilePlayer.formatRatings.ODI}</span>
                <span>Test {profilePlayer.formatRatings.TEST}</span>
              </div>
              <button
                type="button"
                onClick={() => onViewPlayer(profilePlayer)}
                className="mt-3 min-h-9 rounded-lg border border-[#454B56] px-3 text-[10px] font-semibold text-[#D2D4D9] hover:bg-white/[0.05]"
              >
                Open full player profile
              </button>
            </div>
            <button
              type="button"
              onClick={() => setProfilePlayerId(null)}
              aria-label="Close player preview"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#858B96] hover:bg-white/[0.05] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </aside>
      )}
    </section>
  );
};
