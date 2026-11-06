import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  BuilderMode,
  UserTeam,
  UserTeamPlayer,
  Player,
  Competition,
  TeamEntity,
  CricketFormat,
  FieldingPosition,
} from '../types/cricket';
import { storageService } from '../services/storageService';
import { validateTeamRules } from '../engines/rulesEngine';
import { analyzeTeam } from '../engines/analysisEngine';
import { RulesValidationBar } from '../components/builder/RulesValidationBar';
import { PlayingXITable } from '../components/builder/PlayingXITable';
import { SubstitutesPanel } from '../components/builder/SubstitutesPanel';
import { PlayerPicker } from '../components/builder/PlayerPicker';
import { CricketFieldSvg } from '../components/cricket-field/CricketFieldSvg';
import { TeamAnalysisPanel } from '../components/builder/TeamAnalysisPanel';
import { PlayerDetailModal } from '../components/player/PlayerDetailModal';
import {
  Sliders,
  Sparkles,
  Save,
  Copy,
  RotateCcw,
  Image as ImageIcon,
  CheckCircle2,
  Trophy,
  Users,
  Compass,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const BuilderPage: React.FC = () => {
  const { mode: routeMode } = useParams<{ mode: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentMode: BuilderMode = (
    ['franchise', 'dream', 'all-time', 'international', 'custom-pool', 'auto'].includes(routeMode || '')
      ? routeMode
      : 'dream'
  ) as BuilderMode;

  const editingTeamId = searchParams.get('id');

  // Master Data
  const [allPlayers, setAllPlayers] = useState<Player[]>(() => storageService.getPlayers());
  const [competitions, setCompetitions] = useState<Competition[]>(() => storageService.getCompetitions());
  const [teams, setTeams] = useState<TeamEntity[]>(() => storageService.getTeams());
  const [customPools, setCustomPools] = useState<any[]>(() => storageService.getCustomPools());

  // Workspace State
  const [teamId, setTeamId] = useState<string>(`team-user-${Date.now()}`);
  const [title, setTitle] = useState<string>('My Tactical Playing XI');
  const [format, setFormat] = useState<CricketFormat>('T20');
  const [selectedCompId, setSelectedCompId] = useState<string>('comp-ipl');
  const [selectedSeason, setSelectedSeason] = useState<string>('2025');
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string>('team-csk');
  const [selectedPoolId, setSelectedPoolId] = useState<string>('');
  const [selectedPlayers, setSelectedPlayers] = useState<UserTeamPlayer[]>([]);
  const [impactPlayerId, setImpactPlayerId] = useState<string | undefined>();
  const [substituteIds, setSubstituteIds] = useState<string[]>([]);
  const [tacticalNotes, setTacticalNotes] = useState<string>('');

  // UI Tabs & Inspect
  const [activeTab, setActiveTab] = useState<'lineup' | 'field' | 'analysis'>('lineup');
  const [inspectPlayer, setInspectPlayer] = useState<Player | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Load Initial and handle external team ID
  useEffect(() => {
    const pList = storageService.getPlayers();
    const cList = storageService.getCompetitions();
    const tList = storageService.getTeams();
    const pools = storageService.getCustomPools();

    setAllPlayers(pList);
    setCompetitions(cList);
    setTeams(tList);
    setCustomPools(pools);

    if (pools.length > 0) {
      setSelectedPoolId(pools[0].id);
    }

    if (editingTeamId) {
      const existing = storageService.getUserTeamById(editingTeamId);
      if (existing) {
        setTeamId(existing.id);
        setTitle(existing.title);
        setFormat(existing.format);
        setSelectedCompId(existing.competitionId || 'comp-ipl');
        setSelectedSeason(existing.season || '2025');
        setSelectedFranchiseId(existing.franchiseId || 'team-csk');
        setSelectedPoolId(existing.customPoolId || (pools[0]?.id || ''));
        setSelectedPlayers(existing.players);
        setImpactPlayerId(existing.impactPlayerId);
        setSubstituteIds(existing.substituteIds || []);
        setTacticalNotes(existing.tacticalNotes || '');
        return;
      }
    }

    // Default title based on mode
    if (currentMode === 'franchise') {
      setTitle('Chennai Super Kings Playing XI 2025');
      setSelectedCompId('comp-ipl');
    } else if (currentMode === 'all-time') {
      setTitle('All-Time Cricket Dream XI');
    } else if (currentMode === 'international') {
      setTitle('India National Playing XI');
      setSelectedCompId('comp-t20-wc');
    }
  }, [editingTeamId, currentMode]);

  // Find active competition
  const activeCompetition = useMemo(() => {
    return (
      competitions.find((c) => c.id === selectedCompId) ||
      competitions[0] ||
      storageService.getCompetitions()[0]
    );
  }, [competitions, selectedCompId]);

  // Franchise squad filter if franchise mode
  const activeSquad = useMemo(() => {
    if (currentMode !== 'franchise') return undefined;
    return storageService.getSquad(selectedFranchiseId, selectedSeason, selectedCompId);
  }, [currentMode, selectedFranchiseId, selectedSeason, selectedCompId]);

  // Custom pool filter if custom pool mode
  const activeCustomPool = useMemo(() => {
    if (currentMode !== 'custom-pool') return undefined;
    return storageService.getCustomPoolById(selectedPoolId);
  }, [currentMode, selectedPoolId]);

  // Filter candidate players according to mode
  const eligiblePlayers = useMemo(() => {
    if (currentMode === 'franchise' && activeSquad) {
      return allPlayers.filter((p) => activeSquad.playerIds.includes(p.id));
    }
    if (currentMode === 'custom-pool' && activeCustomPool) {
      return allPlayers.filter((p) => activeCustomPool.playerIds.includes(p.id));
    }
    if (currentMode === 'international') {
      return allPlayers.filter((p) => p.country === 'India' || p.country === 'Australia' || p.teamsPlayed.includes('team-ind'));
    }
    return allPlayers;
  }, [allPlayers, currentMode, activeSquad, activeCustomPool]);

  // Rules Validation
  const validationResult = useMemo(() => {
    return validateTeamRules({
      selectedPlayers,
      allPlayers,
      competition: activeCompetition,
      mode: currentMode,
      squad: activeSquad,
    });
  }, [selectedPlayers, allPlayers, activeCompetition, currentMode, activeSquad]);

  // Team Analysis
  const teamAnalysis = useMemo(() => {
    return analyzeTeam(selectedPlayers, allPlayers, format);
  }, [selectedPlayers, allPlayers, format]);

  // Player Selection Handlers
  const handleTogglePlayer = (player: Player) => {
    const isAlreadySelected = selectedPlayers.some((p) => p.playerId === player.id);

    if (isAlreadySelected) {
      // Remove
      const filtered = selectedPlayers
        .filter((p) => p.playerId !== player.id)
        .map((p, idx) => ({ ...p, battingOrder: idx + 1 }));
      setSelectedPlayers(filtered);
    } else {
      // Check maximum 11
      if (selectedPlayers.length >= 11) {
        alert('Starting Playing XI already has 11 players. Remove a player or add as a Bench Substitute below.');
        return;
      }

      // Check overseas quota
      if (activeCompetition?.slug === 'ipl' || currentMode === 'franchise') {
        const currentOverseas = selectedPlayers.filter((sp) => {
          const match = allPlayers.find((p) => p.id === sp.playerId);
          return match?.isOverseasIPL;
        }).length;

        if (player.isOverseasIPL && currentOverseas >= (activeCompetition?.rules.maxOverseas ?? 4)) {
          alert(`Cannot exceed ${activeCompetition?.rules.maxOverseas ?? 4} overseas players in an IPL lineup.`);
          return;
        }
      }

      // Determine default roles
      const isFirstKeeper =
        (player.primaryRole === 'Wicketkeeper' || player.secondaryRoles.includes('Wicketkeeper')) &&
        !selectedPlayers.some((p) => p.isWicketkeeper);

      const isFirstCaptain = selectedPlayers.length === 0;

      const newPlayer: UserTeamPlayer = {
        playerId: player.id,
        battingOrder: selectedPlayers.length + 1,
        isCaptain: isFirstCaptain,
        isViceCaptain: false,
        isWicketkeeper: isFirstKeeper,
        fieldingPosition: isFirstKeeper ? 'Wicketkeeper' : undefined,
      };

      setSelectedPlayers([...selectedPlayers, newPlayer]);
    }
  };

  const handleSetCaptain = (playerId: string) => {
    setSelectedPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        isCaptain: p.playerId === playerId ? !p.isCaptain : false,
        isViceCaptain: p.playerId === playerId ? false : p.isViceCaptain,
      }))
    );
  };

  const handleSetViceCaptain = (playerId: string) => {
    setSelectedPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        isViceCaptain: p.playerId === playerId ? !p.isViceCaptain : false,
        isCaptain: p.playerId === playerId ? false : p.isCaptain,
      }))
    );
  };

  const handleSetWicketkeeper = (playerId: string) => {
    setSelectedPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        isWicketkeeper: p.playerId === playerId ? !p.isWicketkeeper : false,
        fieldingPosition: p.playerId === playerId ? 'Wicketkeeper' : p.fieldingPosition,
      }))
    );
  };

  const handleMovePlayer = (fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= selectedPlayers.length || toIndex >= selectedPlayers.length)
      return;

    const list = [...selectedPlayers].sort((a, b) => a.battingOrder - b.battingOrder);
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);

    const reordered = list.map((p, idx) => ({ ...p, battingOrder: idx + 1 }));
    setSelectedPlayers(reordered);
  };

  const handleUpdateFieldPosition = (playerId: string, pos: FieldingPosition) => {
    setSelectedPlayers((prev) =>
      prev.map((p) => (p.playerId === playerId ? { ...p, fieldingPosition: pos } : p))
    );
  };

  // Save Handlers
  const handleSaveTeam = (status: 'draft' | 'completed') => {
    const team: UserTeam = {
      id: teamId,
      title: title.trim() || 'My Tactical Playing XI',
      description: `Tactical lineup for ${activeCompetition?.name || 'Cricket'} (${format})`,
      mode: currentMode,
      format,
      competitionId: selectedCompId,
      season: selectedSeason,
      franchiseId: currentMode === 'franchise' ? selectedFranchiseId : undefined,
      customPoolId: currentMode === 'custom-pool' ? selectedPoolId : undefined,
      players: selectedPlayers,
      impactPlayerId,
      substituteIds,
      status,
      authorName: 'TacticalManager',
      authorId: 'user-default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likesCount: 0,
      bookmarksCount: 0,
      isPublic: true,
      tags: [format, currentMode.toUpperCase(), 'Lineup'],
      tacticalNotes,
    };

    storageService.saveUserTeam(team);

    if (status === 'completed') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    setSaveSuccessMsg(`Team successfully saved as ${status.toUpperCase()}!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleDuplicate = () => {
    const copy = storageService.duplicateUserTeam(teamId);
    if (copy) {
      navigate(`/builder/${copy.mode}?id=${copy.id}`);
    }
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the entire lineup?')) {
      setSelectedPlayers([]);
      setImpactPlayerId(undefined);
      setSubstituteIds([]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      {/* Top Workspace Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 bg-[#121720] border border-white/10 rounded-2xl shadow-xl">
        {/* Left: Title & Mode Badge */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#20C878]/20 text-[#20C878] uppercase tracking-wider border border-[#20C878]/30">
              {currentMode.toUpperCase()} BUILDER
            </span>
            <span className="text-xs text-[#929BA8]">•</span>
            <span className="text-xs text-[#929BA8] font-semibold">
              {selectedPlayers.length}/11 Selected
            </span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl sm:text-2xl font-bold font-heading text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-[#20C878] focus:outline-none w-full transition-colors"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            to={`/poster?id=${teamId}`}
            className="px-3 py-2 rounded-xl bg-[#181F29] hover:bg-[#202938] text-xs font-semibold text-[#3BA7FF] border border-[#3BA7FF]/30 flex items-center gap-1.5 transition-all"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Generate Poster</span>
          </Link>

          <button
            type="button"
            onClick={handleDuplicate}
            className="p-2 rounded-xl bg-[#181F29] hover:bg-[#202938] text-[#929BA8] hover:text-white border border-white/5 transition-colors"
            title="Duplicate XI"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="p-2 rounded-xl bg-[#181F29] hover:bg-rose-500/20 text-[#929BA8] hover:text-rose-400 border border-white/5 transition-colors"
            title="Reset Lineup"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleSaveTeam('draft')}
            className="px-4 py-2 bg-[#181F29] hover:bg-[#202938] text-white font-semibold text-xs rounded-xl border border-white/10 transition-all cursor-pointer"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => handleSaveTeam('completed')}
            className="px-5 py-2 bg-[#20C878] hover:bg-[#1bb56c] text-[#090B0F] font-bold text-xs rounded-xl shadow-lg shadow-[#20C878]/25 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Publish XI</span>
          </button>
        </div>
      </div>

      {/* Mode Specific Parameters Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-[#181F29] border border-white/5 rounded-2xl text-xs">
        {/* Format Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#929BA8] font-bold">Format:</span>
          {(['T20', 'ODI', 'TEST'] as const).map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => setFormat(fmt)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                format === fmt
                  ? 'bg-[#20C878] text-[#090B0F]'
                  : 'bg-[#121720] text-[#929BA8] hover:text-white'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>

        {/* Competition */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#929BA8] font-bold">Comp:</span>
          <select
            value={selectedCompId}
            onChange={(e) => setSelectedCompId(e.target.value)}
            className="bg-[#121720] text-white p-1.5 rounded-lg border border-white/10 focus:outline-none"
          >
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.format})
              </option>
            ))}
          </select>
        </div>

        {/* Season */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#929BA8] font-bold">Season:</span>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="bg-[#121720] text-white p-1.5 rounded-lg border border-white/10 focus:outline-none"
          >
            {(activeCompetition?.seasons || ['2025', '2024', 'All-Time']).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Franchise Picker if Franchise Mode */}
        {currentMode === 'franchise' && (
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 font-bold">Franchise:</span>
            <select
              value={selectedFranchiseId}
              onChange={(e) => setSelectedFranchiseId(e.target.value)}
              className="bg-[#121720] text-white p-1.5 rounded-lg border border-amber-400/30 focus:outline-none"
            >
              {teams
                .filter((t) => t.type === 'Franchise')
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.code})
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Custom Pool Picker if Custom Pool Mode */}
        {currentMode === 'custom-pool' && customPools.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-pink-400 font-bold">Pool:</span>
            <select
              value={selectedPoolId}
              onChange={(e) => setSelectedPoolId(e.target.value)}
              className="bg-[#121720] text-white p-1.5 rounded-lg border border-pink-400/30 focus:outline-none"
            >
              {customPools.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.playerIds.length} players)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Rules Engine Validation Bar */}
      <RulesValidationBar
        validation={validationResult}
        onSaveDraft={() => handleSaveTeam('draft')}
        onSaveCompleted={() => handleSaveTeam('completed')}
      />

      {/* Save Toast */}
      {saveSuccessMsg && (
        <div className="p-3 bg-[#20C878]/20 border border-[#20C878] rounded-xl text-center text-xs font-bold text-[#20C878] animate-in fade-in">
          {saveSuccessMsg}
        </div>
      )}

      {/* Workspace Tabs (Lineup vs Field vs Analysis) */}
      <div className="grid grid-cols-3 rounded-t-2xl border-b border-white/5 bg-[#121720] px-2 sm:px-4">
        {(
          [
            { id: 'lineup', label: '1. Lineup & Squad Picker' },
            { id: 'field', label: '2. Visual Cricket Ground' },
            { id: 'analysis', label: '3. Team Analysis & Intelligence' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            aria-label={tab.label}
            className={`min-w-0 px-1 py-3.5 text-center text-[11px] font-bold leading-tight transition-all cursor-pointer sm:px-4 sm:text-sm ${
              activeTab === tab.id
                ? 'border-b-2 border-[#20C878] text-[#20C878]'
                : 'border-b-2 border-transparent text-[#929BA8] hover:text-white'
            }`}
          >
            <span className="sm:hidden">
              {tab.id === 'lineup' ? '1. Lineup' : tab.id === 'field' ? '2. Ground' : '3. Analysis'}
            </span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Lineup Table + Substitutes + Player Picker */}
      {activeTab === 'lineup' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (Lineup + Subs) - 6 cols */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <PlayingXITable
              selectedPlayers={selectedPlayers}
              allPlayers={allPlayers}
              onRemovePlayer={(id) => handleTogglePlayer(allPlayers.find((p) => p.id === id)!)}
              onSetCaptain={handleSetCaptain}
              onSetViceCaptain={handleSetViceCaptain}
              onSetWicketkeeper={handleSetWicketkeeper}
              onMovePlayer={handleMovePlayer}
              onViewPlayer={setInspectPlayer}
            />

            <SubstitutesPanel
              allPlayers={allPlayers}
              selectedPlayerIds={selectedPlayers.map((p) => p.playerId)}
              impactPlayerId={impactPlayerId}
              substituteIds={substituteIds}
              competition={activeCompetition}
              onSetImpactPlayer={setImpactPlayerId}
              onAddSubstitute={(id) => setSubstituteIds([...substituteIds, id])}
              onRemoveSubstitute={(id) => setSubstituteIds(substituteIds.filter((x) => x !== id))}
            />
          </div>

          {/* Right Column (Searchable Player Picker) - 6 cols */}
          <div className="lg:col-span-6">
            <PlayerPicker
              allPlayers={eligiblePlayers}
              selectedPlayerIds={selectedPlayers.map((p) => p.playerId)}
              onTogglePlayer={handleTogglePlayer}
              onViewPlayer={setInspectPlayer}
              format={format}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Visual Cricket Field */}
      {activeTab === 'field' && (
        <div className="flex flex-col gap-6">
          <CricketFieldSvg
            teamPlayers={selectedPlayers}
            allPlayers={allPlayers}
            onUpdateFieldingPosition={handleUpdateFieldPosition}
            editable={true}
          />
        </div>
      )}

      {/* Tab 3: Tactical Analysis */}
      {activeTab === 'analysis' && (
        <div className="flex flex-col gap-6">
          <TeamAnalysisPanel analysis={teamAnalysis} />
        </div>
      )}

      {/* Player Inspect Modal */}
      <PlayerDetailModal
        player={inspectPlayer}
        onClose={() => setInspectPlayer(null)}
        onSelectForXI={handleTogglePlayer}
        isInTeam={inspectPlayer ? selectedPlayers.some((p) => p.playerId === inspectPlayer.id) : false}
      />
    </div>
  );
};
