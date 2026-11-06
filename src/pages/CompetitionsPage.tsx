import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { Competition, TeamEntity, SquadMembership, Player } from '../types/cricket';
import { Trophy, Shield, Users, ArrowRight, CheckCircle2, Sliders } from 'lucide-react';

export const CompetitionsPage: React.FC = () => {
  const [competitions, setCompetitions] = useState<Competition[]>(() => storageService.getCompetitions());
  const [teams, setTeams] = useState<TeamEntity[]>(() => storageService.getTeams());
  const [players, setPlayers] = useState<Player[]>(() => storageService.getPlayers());
  const [selectedCompId, setSelectedCompId] = useState<string>('comp-ipl');

  useEffect(() => {
    setCompetitions(storageService.getCompetitions());
    setTeams(storageService.getTeams());
    setPlayers(storageService.getPlayers());
  }, []);

  const activeComp =
    competitions.find((c) => c.id === selectedCompId) ||
    competitions[0] ||
    storageService.getCompetitions()[0];
  const compTeams = activeComp ? teams.filter((t) => t.competitionId === activeComp.id) : [];

  const playersMap = new Map<string, Player>();
  players.forEach((p) => playersMap.set(p.id, p));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#20C878] mb-1">
          <Trophy className="w-4 h-4" />
          <span>Tournaments & Leagues</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
          Cricket Competitions & Squads
        </h1>
        <p className="text-xs sm:text-sm text-[#929BA8] mt-1">
          Explore official rules, quotas, season-specific rosters, and participating teams across global cricket.
        </p>
      </div>

      {/* Competitions Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {competitions.map((comp) => {
          const isSelected = comp.id === selectedCompId;
          return (
            <button
              key={comp.id}
              type="button"
              onClick={() => setSelectedCompId(comp.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'border-[#20C878] bg-[#182420] text-white shadow-xl shadow-[#20C878]/10'
                  : 'border-white/5 bg-[#121720] text-[#929BA8] hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-white/70">
                  {comp.format}
                </span>
                <span className="text-xs font-bold text-[#20C878]">{comp.competitionType}</span>
              </div>
              <h3 className="text-base font-bold text-white font-heading truncate">{comp.name}</h3>
              <p className="text-xs text-[#929BA8] mt-1">{comp.country} • {comp.currentSeason}</p>
            </button>
          );
        })}
      </div>

      {/* Active Competition Deep Dive */}
      {activeComp && (
        <div className="flex flex-col gap-6 bg-[#121720] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#20C878]">
                  {activeComp.competitionType} League
                </span>
                <span className="text-xs text-[#929BA8]">•</span>
                <span className="text-xs text-[#929BA8]">{activeComp.country}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white mt-1">
                {activeComp.name}
              </h2>
              <p className="text-xs sm:text-sm text-[#929BA8] mt-2 max-w-2xl leading-relaxed">
                {activeComp.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={`/builder/${activeComp.competitionType === 'Franchise' ? 'franchise' : 'international'}`}
                className="px-5 py-2.5 bg-[#20C878] hover:bg-[#1bb56c] text-[#090B0F] font-bold text-xs rounded-xl shadow-lg shadow-[#20C878]/20 flex items-center gap-2"
              >
                <Sliders className="w-4 h-4" />
                <span>Build Lineup for {activeComp.shortName}</span>
              </Link>
            </div>
          </div>

          {/* Rules Snapshot Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#3BA7FF]" />
              Official Competition Rules & Quotas
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#181F29] p-3 rounded-xl border border-white/5">
                <span className="text-[#929BA8] block text-[10px] uppercase">Starting Players</span>
                <span className="text-base font-bold text-white mt-1 block">
                  {activeComp.rules.exactPlayersCount} Players
                </span>
              </div>
              <div className="bg-[#181F29] p-3 rounded-xl border border-white/5">
                <span className="text-[#929BA8] block text-[10px] uppercase">Overseas Player Cap</span>
                <span className="text-base font-bold text-[#20C878] mt-1 block">
                  Max {activeComp.rules.maxOverseas} Foreigners
                </span>
              </div>
              <div className="bg-[#181F29] p-3 rounded-xl border border-white/5">
                <span className="text-[#929BA8] block text-[10px] uppercase">Impact Player Rule</span>
                <span className="text-base font-bold text-amber-400 mt-1 block">
                  {activeComp.rules.allowImpactPlayer ? 'Allowed (Tactical Sub)' : 'Not Allowed'}
                </span>
              </div>
              <div className="bg-[#181F29] p-3 rounded-xl border border-white/5">
                <span className="text-[#929BA8] block text-[10px] uppercase">Minimum Bowlers</span>
                <span className="text-base font-bold text-sky-400 mt-1 block">
                  {activeComp.rules.minBowlersOrAllRounders} Options
                </span>
              </div>
            </div>
          </div>

          {/* Participating Teams / Franchises */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#20C878]" />
              Participating Franchises / Teams ({compTeams.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {compTeams.map((team) => {
                // Find squad
                const squad = storageService.getSquad(team.id, activeComp.currentSeason, activeComp.id);
                const squadPlayerNames = squad
                  ? squad.playerIds.map((id) => playersMap.get(id)?.displayName).filter(Boolean).slice(0, 4)
                  : [];

                return (
                  <div
                    key={team.id}
                    className="p-4 bg-[#181F29] rounded-2xl border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold font-heading text-white">{team.name}</span>
                        <span className="text-[10px] font-bold text-[#929BA8]">{team.code}</span>
                      </div>
                      <p className="text-xs text-[#929BA8]">{team.homeGround}</p>

                      {squadPlayerNames.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/5">
                          <span className="text-[10px] text-[#929BA8] block uppercase">Squad Stars:</span>
                          <span className="text-xs text-[#F5F7FA] font-medium mt-0.5 block truncate">
                            {squadPlayerNames.join(', ')}...
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-amber-400 font-bold">
                        {team.championships.length > 0
                          ? `🏆 ${team.championships.length} Titles (${team.championships.join(', ')})`
                          : 'Challenger'}
                      </span>
                      <Link
                        to={`/builder/franchise`}
                        className="text-xs text-[#20C878] font-bold hover:underline flex items-center gap-1"
                      >
                        <span>Build Lineup</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
