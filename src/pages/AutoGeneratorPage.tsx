import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AutoStrategy,
  generateAutomatedXI,
} from '../engines/teamGenerator';
import { storageService } from '../services/storageService';
import { Player, UserTeam, CricketFormat } from '../types/cricket';
import { PlayingXITable } from '../components/builder/PlayingXITable';
import { RulesValidationBar } from '../components/builder/RulesValidationBar';
import { validateTeamRules } from '../engines/rulesEngine';
import { analyzeTeam } from '../engines/analysisEngine';
import { TeamAnalysisPanel } from '../components/builder/TeamAnalysisPanel';
import { PlayerDetailModal } from '../components/player/PlayerDetailModal';
import {
  Sparkles,
  Sliders,
  RefreshCw,
  Lock,
  Unlock,
  CheckCircle2,
  ArrowRight,
  Zap,
  Target,
  Shield,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AutoGeneratorPage: React.FC = () => {
  const navigate = useNavigate();
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [strategy, setStrategy] = useState<AutoStrategy>('balanced');
  const [format, setFormat] = useState<CricketFormat>('T20');
  const [maxOverseas, setMaxOverseas] = useState<number>(4);
  const [lockedPlayerIds, setLockedPlayerIds] = useState<string[]>([]);

  // Generated Result
  const [generatedLineup, setGeneratedLineup] = useState<any>(null);
  const [inspectPlayer, setInspectPlayer] = useState<Player | null>(null);

  useEffect(() => {
    const list = storageService.getPlayers();
    setAllPlayers(list);
    // Generate initial
    const result = generateAutomatedXI(list, {
      strategy: 'balanced',
      format: 'T20',
      maxOverseas: 4,
      lockedPlayerIds: [],
    });
    setGeneratedLineup(result);
  }, []);

  const handleGenerate = () => {
    const result = generateAutomatedXI(allPlayers, {
      strategy,
      format,
      maxOverseas,
      lockedPlayerIds,
    });
    setGeneratedLineup(result);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleToggleLock = (playerId: string) => {
    if (lockedPlayerIds.includes(playerId)) {
      setLockedPlayerIds(lockedPlayerIds.filter((id) => id !== playerId));
    } else {
      setLockedPlayerIds([...lockedPlayerIds, playerId]);
    }
  };

  const handleOpenInBuilder = () => {
    if (!generatedLineup) return;
    const newTeam: UserTeam = {
      id: `team-user-${Date.now()}`,
      title: `Auto-Generated ${strategy.toUpperCase()} XI`,
      description: generatedLineup.summary,
      mode: 'auto',
      format,
      players: generatedLineup.players,
      impactPlayerId: generatedLineup.impactPlayer?.id,
      substituteIds: generatedLineup.substitutes.map((s: Player) => s.id),
      status: 'draft',
      authorName: 'TacticalAlgorithm',
      authorId: 'user-default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likesCount: 0,
      bookmarksCount: 0,
      isPublic: true,
      tags: [strategy, format, 'Auto-Generated'],
      tacticalNotes: generatedLineup.summary,
    };
    storageService.saveUserTeam(newTeam);
    navigate(`/builder/auto?id=${newTeam.id}`);
  };

  const validation = generatedLineup
    ? validateTeamRules({
        selectedPlayers: generatedLineup.players,
        allPlayers,
        mode: 'auto',
      })
    : null;

  const analysis = generatedLineup
    ? analyzeTeam(generatedLineup.players, allPlayers, format)
    : null;

  const strategiesList: { id: AutoStrategy; title: string; desc: string; icon: any }[] = [
    { id: 'balanced', title: 'Balanced Championship XI', desc: 'Optimal blend of anchors, middle accelerators and death bowlers.', icon: Shield },
    { id: 'best-overall', title: 'Highest Overall Ratings', desc: 'Picks the highest statistical performers across disciplines.', icon: Sparkles },
    { id: 't20-power', title: 'T20 Boundary Destroyers', desc: 'Maximum strike rates, six hitters and lethal death yorkers.', icon: Zap },
    { id: 'best-batting', title: 'Top-Heavy Batting Lineup', desc: 'Maximizes batting firepower, technique, and power hitting.', icon: Target },
    { id: 'best-bowling', title: 'Venomous Bowling Attack', desc: 'Elite wicket takers, swing specialists and mystery spin.', icon: Shield },
    { id: 'all-round', title: 'All-Round Depth Battery', desc: 'Heavy versatile all-rounders batting down to #9.', icon: Layers },
    { id: 'odi-master', title: 'ODI Format Specialists', desc: 'Optimized for 50-over pacing, strike rotation and stamina.', icon: Target },
    { id: 'test-purist', title: 'Red Ball Test Match XI', desc: 'Patience, classical defensive technique, and swing control.', icon: Shield },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#20C878] mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Algorithmic Lineup Synthesizer</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
          Automatic Playing XI Generator
        </h1>
        <p className="text-sm text-[#929BA8] max-w-2xl mt-1 leading-relaxed">
          Configure tactical strategies, lock essential match-winners, and let our multi-objective constraint engine calculate balanced cricket combinations.
        </p>
      </div>

      {/* Generator Configuration Panel */}
      <div className="bg-[#121720] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
        {/* Strategy Grid */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[#929BA8] block mb-3">
            Select Optimization Strategy:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {strategiesList.map((st) => {
              const Icon = st.icon;
              const isSelected = strategy === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStrategy(st.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-[#20C878] bg-[#20C878]/10 text-white shadow-md'
                      : 'border-white/5 bg-[#181F29] text-[#929BA8] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-[#20C878]' : 'text-[#929BA8]'}`} />
                    <span className="text-xs font-bold text-white font-heading">{st.title}</span>
                  </div>
                  <p className="text-[11px] text-[#929BA8] line-clamp-2 leading-relaxed">
                    {st.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Parameters: Format & Overseas Limit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-white/5">
          {/* Format */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#929BA8]">Target Format:</label>
            <div className="flex items-center gap-2">
              {(['T20', 'ODI', 'TEST'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFormat(fmt)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    format === fmt
                      ? 'bg-[#20C878] text-[#090B0F]'
                      : 'bg-[#181F29] text-[#929BA8] hover:text-white'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Overseas Limit */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#929BA8]">
              Overseas Quota Cap: <strong className="text-white">{maxOverseas} Foreign Players</strong>
            </label>
            <input
              type="range"
              min="0"
              max="11"
              value={maxOverseas}
              onChange={(e) => setMaxOverseas(Number(e.target.value))}
              className="w-full h-2 bg-[#181F29] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#929BA8]">
              <span>0 (All Indian)</span>
              <span>4 (IPL Standard)</span>
              <span>11 (Open)</span>
            </div>
          </div>

          {/* Generate Action Button */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleGenerate}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#20C878] to-[#1bb56c] hover:brightness-110 active:scale-[0.98] text-[#090B0F] font-bold text-xs rounded-xl shadow-lg shadow-[#20C878]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Compute Optimal Playing XI</span>
            </button>
          </div>
        </div>

        {/* Locked Players Tray */}
        <div>
          <label className="text-xs font-semibold text-[#929BA8] block mb-2">
            Lock Essential Players into Selection ({lockedPlayerIds.length} locked):
          </label>
          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
            {allPlayers.slice(0, 15).map((player) => {
              const isLocked = lockedPlayerIds.includes(player.id);
              return (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => handleToggleLock(player.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    isLocked
                      ? 'bg-amber-400 text-black font-bold shadow-sm'
                      : 'bg-[#181F29] text-[#929BA8] hover:text-white border border-white/5'
                  }`}
                >
                  {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3 text-[#929BA8]" />}
                  <span>{player.displayName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Generated Lineup Showcase */}
      {generatedLineup && (
        <div className="flex flex-col gap-6">
          {/* Summary Banner */}
          <div className="p-4 bg-gradient-to-r from-[#182420] via-[#121720] to-[#152332] rounded-2xl border border-[#20C878]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#20C878]">
                Algorithm Outcome
              </span>
              <p className="text-sm font-semibold text-white mt-0.5">
                {generatedLineup.summary}
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenInBuilder}
              className="px-5 py-2.5 bg-[#20C878] hover:bg-[#1bb56c] text-[#090B0F] font-bold text-xs rounded-xl shadow-lg shadow-[#20C878]/20 flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Fine-Tune in Full Builder</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Validation Bar */}
          {validation && <RulesValidationBar validation={validation} />}

          {/* Playing XI Table & Subs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <PlayingXITable
              selectedPlayers={generatedLineup.players}
              allPlayers={allPlayers}
              onRemovePlayer={() => {}}
              onSetCaptain={() => {}}
              onSetViceCaptain={() => {}}
              onSetWicketkeeper={() => {}}
              onMovePlayer={() => {}}
              onViewPlayer={setInspectPlayer}
            />

            {/* Tactical Metrics & Bench */}
            <div className="flex flex-col gap-6">
              {analysis && <TeamAnalysisPanel analysis={analysis} />}
            </div>
          </div>
        </div>
      )}

      {/* Player Inspect Modal */}
      <PlayerDetailModal
        player={inspectPlayer}
        onClose={() => setInspectPlayer(null)}
      />
    </div>
  );
};
