import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Shield } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Competition, TeamEntity } from '../types/cricket';

type TeamTypeFilter = 'All' | TeamEntity['type'];

export const TeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<TeamEntity[]>(() => storageService.getTeams());
  const [competitions, setCompetitions] = useState<Competition[]>(() => storageService.getCompetitions());
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TeamTypeFilter>('All');

  useEffect(() => {
    const refresh = () => {
      setTeams(storageService.getTeams());
      setCompetitions(storageService.getCompetitions());
    };
    refresh();
    return storageService.subscribe(refresh);
  }, []);

  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase();
    return teams
      .filter((team) => typeFilter === 'All' || team.type === typeFilter)
      .filter((team) =>
        !query ||
        [
          team.name,
          team.shortName,
          team.code,
          team.homeGround,
          competitions.find((competition) => competition.id === team.competitionId)?.name ?? '',
        ]
        .some((value) => value.toLowerCase().includes(query)),
      )
      .sort((first, second) => first.name.localeCompare(second.name));
  }, [teams, competitions, search, typeFilter]);

  const teamsByCompetition = useMemo(() => {
    const groups = new Map<string, TeamEntity[]>();
    filteredTeams.forEach((team) => {
      const competitionId = competitions.some((competition) => competition.id === team.competitionId)
        ? team.competitionId
        : 'other';
      groups.set(competitionId, [...(groups.get(competitionId) ?? []), team]);
    });

    return [...groups.entries()].sort(([firstId], [secondId]) => {
      if (firstId === 'other') return 1;
      if (secondId === 'other') return -1;
      const firstName = competitions.find((competition) => competition.id === firstId)?.name ?? '';
      const secondName = competitions.find((competition) => competition.id === secondId)?.name ?? '';
      return firstName.localeCompare(secondName);
    });
  }, [filteredTeams, competitions]);

  const filters: TeamTypeFilter[] = ['All', 'Franchise', 'National', 'Domestic'];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Teams</h1>

      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#929BA8]" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search teams"
            aria-label="Search teams"
            className="w-full rounded-xl border border-white/10 bg-[#181F29] py-3 pl-10 pr-4 text-sm text-white placeholder-[#929BA8] focus:border-[#20C878] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2" aria-label="Filter teams by type">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setTypeFilter(filter)}
              aria-pressed={typeFilter === filter}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                typeFilter === filter
                  ? 'bg-[#20C878] text-[#090B0F]'
                  : 'bg-[#181F29] text-[#929BA8] hover:text-white'
              }`}
            >
              {filter === 'All' ? 'All Teams' : filter}
            </button>
          ))}
          <span className="ml-auto self-center text-xs text-[#929BA8]">
            {filteredTeams.length} {filteredTeams.length === 1 ? 'team' : 'teams'}
          </span>
        </div>
      </div>

      {filteredTeams.length > 0 ? (
        <div className="flex flex-col gap-8">
          {teamsByCompetition.map(([competitionId, competitionTeams]) => {
            const competitionName = competitions.find((competition) => competition.id === competitionId)?.name
              ?? (competitionId === 'other' ? 'Other Teams' : 'Teams');

            return (
              <section key={competitionId} aria-labelledby={`teams-${competitionId}`}>
                <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
                  <h2 id={`teams-${competitionId}`} className="text-lg font-bold text-white">
                    {competitionName}
                  </h2>
                  <span className="text-xs text-[#929BA8]">{competitionTeams.length} teams</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {competitionTeams.map((team) => (
                    <Link
                      key={team.id}
                      to={`/teams/${team.id}`}
                      className="flex min-w-0 items-center gap-4 rounded-2xl border border-white/10 bg-[#121720] p-4 transition-colors hover:border-[#20C878]/50"
                    >
                      {team.logo ? (
                        <img src={team.logo} alt="" className="h-14 w-14 shrink-0 object-contain" />
                      ) : (
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center text-sm font-extrabold text-[#20C878]">
                          {team.code}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold text-white">{team.name}</span>
                        <span className="mt-0.5 block truncate text-xs text-[#929BA8]">
                          {team.type}{team.homeGround ? ` · ${team.homeGround}` : ''}
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-[#929BA8]" />
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
          <Shield className="mx-auto h-8 w-8 text-[#929BA8]" />
          <p className="mt-3 text-sm font-semibold text-white">
            {teams.length === 0 ? 'No teams available' : 'No teams found'}
          </p>
          <p className="mt-1 text-xs text-[#929BA8]">
            {teams.length === 0 ? 'Teams added in Admin will appear here.' : 'Try a different search or team type.'}
          </p>
        </div>
      )}
    </div>
  );
};
