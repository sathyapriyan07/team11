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
  const [selectedCompetitionType, setSelectedCompetitionType] = useState<Competition['competitionType']>('Franchise');

  useEffect(() => {
    setCompetitions(storageService.getCompetitions());
    setTeams(storageService.getTeams());
    setPlayers(storageService.getPlayers());
  }, []);

  const competitionTypes: Competition['competitionType'][] = ['Franchise', 'Domestic', 'International'];
  const visibleCompetitions = competitions.filter((competition) => competition.competitionType === selectedCompetitionType);
  const activeComp =
    visibleCompetitions.find((competition) => competition.id === selectedCompId) ||
    visibleCompetitions[0];
  const compTeams = activeComp ? teams.filter((t) => t.competitionId === activeComp.id) : [];

  const playersMap = new Map<string, Player>();
  players.forEach((p) => playersMap.set(p.id, p));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6 sm:gap-8">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#20C878] mb-1">
          <Trophy className="w-4 h-4" />
          <span>Tournaments & Leagues</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-extrabold font-heading text-white">
          Cricket Competitions & Squads
        </h1>
        <p className="text-[10px] sm:text-sm text-[#929BA8] mt-1">
          Explore official rules, quotas, season-specific rosters, and participating teams across global cricket.
        </p>
      </div>

      {/* Competition type tabs */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Competition type">
        {competitionTypes.map((type) => {
          const count = competitions.filter((competition) => competition.competitionType === type).length;
          const isSelected = selectedCompetitionType === type;
          return (
            <button
              key={type}
              id={`competition-type-${type.toLowerCase()}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls="competition-list"
              onClick={() => {
                setSelectedCompetitionType(type);
                const firstCompetition = competitions.find((competition) => competition.competitionType === type);
                setSelectedCompId(firstCompetition?.id ?? '');
              }}
              className={`rounded-full border px-4 py-2 text-xs font-bold transition-colors sm:text-sm ${
                isSelected
                  ? 'border-[#20C878] bg-[#20C878] text-[#090B0F]'
                  : 'border-white/10 bg-[#121720] text-[#929BA8] hover:border-white/20 hover:text-white'
              }`}
            >
              {type} <span className={isSelected ? 'ml-1 opacity-70' : 'ml-1 opacity-60'}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Competitions in the selected type */}
      {visibleCompetitions.length > 0 ? (
      <div id="competition-list" role="tabpanel" aria-labelledby={`competition-type-${selectedCompetitionType.toLowerCase()}`} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {visibleCompetitions.map((comp) => {
          const isSelected = comp.id === activeComp?.id;
          return (
            <button
              key={comp.id}
              type="button"
              onClick={() => setSelectedCompId(comp.id)}
              className={`p-2.5 sm:p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'border-[#20C878] bg-[#182420] text-white shadow-xl shadow-[#20C878]/10'
                  : 'border-white/5 bg-[#121720] text-[#929BA8] hover:border-white/20'
              }`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-white/70">
                  {comp.format}
                </span>
                <div className="flex items-center gap-2">
                  {comp.logo && <img src={comp.logo} alt="" className="h-7 w-7 rounded-md object-contain" />}
                </div>
              </div>
              <h3 className="text-xs sm:text-base font-bold text-white font-heading truncate">{comp.name}</h3>
              <p className="text-[10px] sm:text-xs text-[#929BA8] mt-1">{comp.country} • {comp.currentSeason}</p>
            </button>
          );
        })}
      </div>
      ) : (
        <p className="rounded-2xl border border-white/10 bg-[#121720] p-4 text-xs text-[#929BA8]">
          No {selectedCompetitionType.toLowerCase()} competitions are available yet.
        </p>
      )}

      {/* Active Competition Deep Dive */}
      {activeComp && (
        <div className="flex flex-col gap-5 sm:gap-6 bg-[#121720] border border-white/10 rounded-3xl p-4 sm:p-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#20C878]">
                  {activeComp.competitionType} League
                </span>
                <span className="text-[10px] sm:text-xs text-[#929BA8]">•</span>
                <span className="text-[10px] sm:text-xs text-[#929BA8]">{activeComp.country}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 sm:gap-3">
                {activeComp.logo && <img src={activeComp.logo} alt="" className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-xl object-contain" />}
                <h2 className="text-lg sm:text-2xl font-extrabold font-heading text-white">
                  {activeComp.name}
                </h2>
              </div>
              <p className="text-[10px] sm:text-sm text-[#929BA8] mt-2 max-w-2xl leading-relaxed">
                {activeComp.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={`/builder/${activeComp.competitionType === 'Franchise' ? 'franchise' : 'international'}`}
                className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#20C878] hover:bg-[#1bb56c] text-[#090B0F] font-bold text-[11px] sm:text-xs rounded-xl shadow-lg shadow-[#20C878]/20 flex items-center gap-2"
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
                <span className="text-xs sm:text-base font-bold text-white mt-1 block">
                  {activeComp.rules.exactPlayersCount} Players
                </span>
              </div>
              <div className="bg-[#181F29] p-3 rounded-xl border border-white/5">
                <span className="text-[#929BA8] block text-[10px] uppercase">Overseas Player Cap</span>
                <span className="text-xs sm:text-base font-bold text-[#20C878] mt-1 block">
                  Max {activeComp.rules.maxOverseas} Foreigners
                </span>
              </div>
              <div className="bg-[#181F29] p-3 rounded-xl border border-white/5">
                <span className="text-[#929BA8] block text-[10px] uppercase">Impact Player Rule</span>
                <span className="text-xs sm:text-base font-bold text-amber-400 mt-1 block">
                  {activeComp.rules.allowImpactPlayer ? 'Allowed (Tactical Sub)' : 'Not Allowed'}
                </span>
              </div>
              <div className="bg-[#181F29] p-3 rounded-xl border border-white/5">
                <span className="text-[#929BA8] block text-[10px] uppercase">Minimum Bowlers</span>
                <span className="text-xs sm:text-base font-bold text-sky-400 mt-1 block">
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
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          {team.logo && <img src={team.logo} alt="" className="h-8 w-8 shrink-0 rounded-lg object-contain" />}
                          <span className="truncate text-xs font-bold font-heading text-white">{team.name}</span>
                        </div>
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
