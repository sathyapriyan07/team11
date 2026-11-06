import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { UserTeam, Player } from '../types/cricket';
import { analyzeTeam } from '../engines/analysisEngine';
import { Sliders, Shield, Target, Zap, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TeamComparePage: React.FC = () => {
  const [teams, setTeams] = useState<UserTeam[]>(() => storageService.getUserTeams());
  const [allPlayers, setAllPlayers] = useState<Player[]>(() => storageService.getPlayers());
  const [team1Id, setTeam1Id] = useState<string>(() => {
    const list = storageService.getUserTeams();
    return list[0]?.id || '';
  });
  const [team2Id, setTeam2Id] = useState<string>(() => {
    const list = storageService.getUserTeams();
    return list[1]?.id || list[0]?.id || '';
  });

  useEffect(() => {
    const userTeams = storageService.getUserTeams();
    const pList = storageService.getPlayers();
    setTeams(userTeams);
    setAllPlayers(pList);

    if (userTeams.length >= 2) {
      setTeam1Id(userTeams[0].id);
      setTeam2Id(userTeams[1].id);
    } else if (userTeams.length === 1) {
      setTeam1Id(userTeams[0].id);
    }
  }, []);

  const team1 = teams.find((t) => t.id === team1Id);
  const team2 = teams.find((t) => t.id === team2Id);

  const playersMap = new Map<string, Player>();
  allPlayers.forEach((p) => playersMap.set(p.id, p));

  const analysis1 = team1 ? analyzeTeam(team1.players, allPlayers, team1.format) : null;
  const analysis2 = team2 ? analyzeTeam(team2.players, allPlayers, team2.format) : null;

  const metrics = [
    { label: 'Overall Rating', key: 'overallRating' },
    { label: 'Batting Firepower', key: 'battingStrength' },
    { label: 'Bowling Venom', key: 'bowlingStrength' },
    { label: 'Pace Attack', key: 'paceAttackStrength' },
    { label: 'Spin Attack', key: 'spinAttackStrength' },
    { label: 'Finishing (#5-#8)', key: 'finishingStrength' },
    { label: 'Fielding & Agility', key: 'fieldingStrength' },
    { label: 'Batting Depth', key: 'battingDepth' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#20C878] mb-1">
          <Shield className="w-4 h-4" />
          <span>Tactical Showdown</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
          Team Head-to-Head Lineup Comparison
        </h1>
        <p className="text-xs sm:text-sm text-[#929BA8] mt-1">
          Pitch two saved Playing XIs against each other to evaluate tactical matchups and bowling depth.
        </p>
      </div>

      {/* Select Teams Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#121720] border border-white/10 rounded-2xl">
        {/* Team 1 Select */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[#20C878] block mb-1.5">
            Select Lineup A:
          </label>
          <select
            value={team1Id}
            onChange={(e) => setTeam1Id(e.target.value)}
            className="w-full bg-[#181F29] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#20C878] text-xs font-semibold"
          >
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.format} • {t.mode})
              </option>
            ))}
          </select>
        </div>

        {/* Team 2 Select */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[#3BA7FF] block mb-1.5">
            Select Lineup B:
          </label>
          <select
            value={team2Id}
            onChange={(e) => setTeam2Id(e.target.value)}
            className="w-full bg-[#181F29] text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#3BA7FF] text-xs font-semibold"
          >
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.format} • {t.mode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Analysis Comparison Radar / Matrix */}
      {analysis1 && analysis2 && team1 && team2 && (
        <div className="flex flex-col gap-8 bg-[#121720] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Header Banner */}
          <div className="grid grid-cols-2 gap-6 pb-6 border-b border-white/5 text-center">
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-[#20C878] uppercase">{team1.mode} Lineup</span>
              <h3 className="text-lg sm:text-xl font-bold font-heading text-white mt-0.5">{team1.title}</h3>
              <span className="text-3xl font-extrabold font-heading text-[#20C878] mt-2">
                {analysis1.overallRating}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-[#3BA7FF] uppercase">{team2.mode} Lineup</span>
              <h3 className="text-lg sm:text-xl font-bold font-heading text-white mt-0.5">{team2.title}</h3>
              <span className="text-3xl font-extrabold font-heading text-[#3BA7FF] mt-2">
                {analysis2.overallRating}
              </span>
            </div>
          </div>

          {/* Metrics Comparative Bars */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#929BA8] text-center">
              Tactical Department Face-Off
            </h4>

            {metrics.map((m) => {
              const val1 = (analysis1 as any)[m.key];
              const val2 = (analysis2 as any)[m.key];
              const diff = val1 - val2;

              return (
                <div key={m.label} className="bg-[#181F29] p-4 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center text-xs font-bold text-white mb-2">
                    <span className="text-[#20C878] font-heading text-sm">{val1}</span>
                    <span className="text-[#929BA8]">{m.label}</span>
                    <span className="text-[#3BA7FF] font-heading text-sm">{val2}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Team 1 bar from right to left */}
                    <div className="w-full h-2 bg-[#090B0F] rounded-full overflow-hidden flex justify-end">
                      <div
                        className="h-full bg-[#20C878] rounded-full transition-all"
                        style={{ width: `${val1}%` }}
                      />
                    </div>
                    {/* Team 2 bar from left to right */}
                    <div className="w-full h-2 bg-[#090B0F] rounded-full overflow-hidden flex justify-start">
                      <div
                        className="h-full bg-[#3BA7FF] rounded-full transition-all"
                        style={{ width: `${val2}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Batting Order Slot-by-Slot Comparison */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Batting Order Position-by-Position Matchup (1 to 11)
            </h4>

            <div className="flex flex-col gap-2 text-xs">
              {Array.from({ length: 11 }).map((_, idx) => {
                const orderNum = idx + 1;
                const p1 = team1.players.find((p) => p.battingOrder === orderNum);
                const p2 = team2.players.find((p) => p.battingOrder === orderNum);
                const resolved1 = p1 ? playersMap.get(p1.playerId) : undefined;
                const resolved2 = p2 ? playersMap.get(p2.playerId) : undefined;

                return (
                  <div
                    key={`slot-${orderNum}`}
                    className="grid grid-cols-11 items-center p-3 rounded-xl bg-[#181F29] border border-white/5 gap-2"
                  >
                    {/* Left Player */}
                    <div className="col-span-5 flex items-center gap-2 truncate">
                      {resolved1 ? (
                        <>
                          <img
                            src={resolved1.imageUrl}
                            alt=""
                            className="w-7 h-7 rounded-lg object-cover shrink-0"
                          />
                          <span className="font-bold text-white truncate">{resolved1.displayName}</span>
                          <span className="text-[10px] text-[#929BA8] shrink-0">
                            ({resolved1.primaryRole})
                          </span>
                        </>
                      ) : (
                        <span className="text-[#929BA8] italic">Unassigned</span>
                      )}
                    </div>

                    {/* Middle Order Badge */}
                    <div className="col-span-1 text-center font-bold font-heading text-white bg-black/40 py-1 rounded-lg">
                      #{orderNum}
                    </div>

                    {/* Right Player */}
                    <div className="col-span-5 flex items-center justify-end gap-2 truncate text-right">
                      {resolved2 ? (
                        <>
                          <span className="text-[10px] text-[#929BA8] shrink-0">
                            ({resolved2.primaryRole})
                          </span>
                          <span className="font-bold text-white truncate">{resolved2.displayName}</span>
                          <img
                            src={resolved2.imageUrl}
                            alt=""
                            className="w-7 h-7 rounded-lg object-cover shrink-0"
                          />
                        </>
                      ) : (
                        <span className="text-[#929BA8] italic">Unassigned</span>
                      )}
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
