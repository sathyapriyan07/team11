import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, Users } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Player, TeamEntity } from '../types/cricket';

export const TeamDetailPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const [team, setTeam] = useState<TeamEntity | undefined>(() =>
    teamId ? storageService.getTeamById(teamId) : undefined,
  );
  const [players, setPlayers] = useState<Player[]>(() => storageService.getPlayers());

  useEffect(() => {
    const refresh = () => {
      setTeam(teamId ? storageService.getTeamById(teamId) : undefined);
      setPlayers(storageService.getPlayers());
    };
    refresh();
    return storageService.subscribe(refresh);
  }, [teamId]);

  const timeline = useMemo(() => {
    if (!team) return [];

    const grouped = new Map<string, Player[]>();
    players
      .filter((player) => player.teamsPlayed.includes(team.id))
      .forEach((player) => {
        const years = player.teamYears?.[team.id]?.trim() || 'Years not specified';
        const squad = grouped.get(years) ?? [];
        squad.push(player);
        grouped.set(years, squad);
      });

    return [...grouped.entries()].sort(([first], [second]) => {
      if (first === 'Years not specified') return 1;
      if (second === 'Years not specified') return -1;
      const firstYear = Number(first.match(/\d{4}/)?.[0] ?? 0);
      const secondYear = Number(second.match(/\d{4}/)?.[0] ?? 0);
      return secondYear - firstYear || first.localeCompare(second);
    });
  }, [players, team]);

  if (!team) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p role="alert" className="text-sm text-[#929BA8]">Team not found.</p>
        <Link to="/competitions" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#20C878]">
          <ArrowLeft className="h-4 w-4" /> Back to competitions
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Link to="/competitions" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#929BA8] hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Competitions
      </Link>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#121720]">
        <div className="flex flex-col gap-5 bg-gradient-to-br from-[#182420] to-[#121720] p-5 sm:flex-row sm:items-center sm:p-8">
          {team.logo ? (
            <img src={team.logo} alt={`${team.name} logo`} className="h-20 w-20 shrink-0 object-contain" />
          ) : (
            <span className="shrink-0 text-2xl font-extrabold text-[#20C878]">{team.code}</span>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold text-white sm:text-4xl">{team.name}</h1>
            <p className="mt-1 text-sm text-[#929BA8]">
              {[team.homeGround, team.establishedYear ? `Est. ${team.establishedYear}` : '', team.code]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
          <Link
            to={`/builder/${team.type === 'Franchise' ? 'franchise' : 'international'}?id=${team.id}`}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#20C878] px-4 py-3 text-sm font-bold text-[#090B0F] hover:bg-[#1bb56c]"
          >
            Build a lineup <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <div>
          <h2 className="text-xl font-bold text-white sm:text-2xl">Squad timeline</h2>
          <p className="mt-1 text-sm text-[#929BA8]">
            Players linked to {team.name}, grouped by their years with the team.
          </p>
        </div>

        {timeline.length > 0 ? (
          <div className="flex flex-col gap-5">
            {timeline.map(([years, squad]) => (
              <section key={years} className="overflow-hidden rounded-2xl border border-white/10 bg-[#121720]">
                <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 sm:px-5">
                  <h3 className="flex items-center gap-2 font-bold text-white">
                    <CalendarDays className="h-4 w-4 text-[#20C878]" /> {years}
                  </h3>
                  <span className="text-xs text-[#929BA8]">{squad.length} {squad.length === 1 ? 'player' : 'players'}</span>
                </div>
                <div className="grid gap-3 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-3">
                  {squad.map((player) => (
                    <Link
                      key={player.id}
                      to={`/players/${player.id}`}
                      className="flex min-w-0 items-center gap-3 rounded-xl border border-white/5 bg-[#181F29] p-3 transition-colors hover:border-[#20C878]/50"
                    >
                      {player.imageUrl ? (
                        <img src={player.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-full bg-white/5 object-cover" />
                      ) : (
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/5 text-sm font-bold text-[#20C878]">
                          {player.displayName.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-white">{player.displayName || player.fullName}</span>
                        <span className="block truncate text-xs text-[#929BA8]">{player.country} · {player.primaryRole}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-[#929BA8]" />
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#121720] p-8 text-center">
            <Users className="mx-auto h-8 w-8 text-[#929BA8]" />
            <p className="mt-3 font-semibold text-white">No linked players yet</p>
            <p className="mt-1 text-sm text-[#929BA8]">Link players to this team in Admin to build its squad timeline.</p>
          </div>
        )}
      </section>
    </div>
  );
};
