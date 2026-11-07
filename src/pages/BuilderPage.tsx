import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
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
  const location = useLocation();

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
  const [selectedCompId, setSelectedCompId] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedPoolId, setSelectedPoolId] = useState<string>('');
  const [selectedPlayers, setSelectedPlayers] = useState<UserTeamPlayer[]>([]);
  const [impactPlayerId, setImpactPlayerId] = useState<string | undefined>();
  const [substituteIds, setSubstituteIds] = useState<string[]>([]);
  const [tacticalNotes, setTacticalNotes] = useState<string>('');

  // UI Tabs & Inspect
  const [activeTab, setActiveTab] = useState<'lineup' | 'field' | 'analysis'>('lineup');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState('');
  const [pendingProfileSelection, setPendingProfileSelection] = useState<string | null>(null);

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
        setSelectedCompId(existing.competitionId || '');
        setSelectedSeason(existing.season || '');
        setSelectedTeamId(existing.teamId || existing.franchiseId || '');
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
    } else if (currentMode === 'all-time') {
      setTitle('All-Time Cricket Dream XI');
    } else if (currentMode === 'international') {
      setTitle('India National Playing XI');
    }
  }, [editingTeamId, currentMode]);

  // Find active competition
  const activeCompetition = useMemo(() => {
    return competitions.find((c) => c.id === selectedCompId);
  }, [competitions, selectedCompId]);

  // Franchise squad filter if franchise mode
  const activeSquad = useMemo(() => {
    if (currentMode !== 'franchise') return undefined;
    return storageService.getSquad(selectedTeamId, selectedSeason, selectedCompId);
  }, [currentMode, selectedTeamId, selectedSeason, selectedCompId]);

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

  useEffect(() => {
    const state = location.state as { selectPlayerId?: string } | null;
    if (!state?.selectPlayerId) return;
    setPendingProfileSelection(state.selectPlayerId);
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
  }, [location.key, allPlayers]);

  useEffect(() => {
    if (!pendingProfileSelection) return;
    const player = allPlayers.find((item) => item.id === pendingProfileSelection);
    if (player) handleTogglePlayer(player);
    setPendingProfileSelection(null);
  }, [pendingProfileSelection, allPlayers]);

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
    if (!selectedCompId || !selectedTeamId) {
      setSelectionError('Select a competition and team before saving your XI.');
      return;
    }
    setSelectionError('');
    const team: UserTeam = {
      id: teamId,
      title: title.trim() || 'My Tactical Playing XI',
      description: `Tactical lineup for ${activeCompetition?.name || 'Cricket'} (${format})`,
      mode: currentMode,
      format,
      competitionId: selectedCompId,
      teamId: selectedTeamId,
      season: selectedSeason,
      franchiseId: currentMode === 'franchise' ? selectedTeamId : undefined,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 flex flex-col gap-4 sm:gap-6">
      {/* Top Workspace Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 sm:gap-4 sm:p-5 bg-[#121720] border border-white/10 rounded-2xl shadow-xl">
        {/* Left: Title & Mode Badge */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[9px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#20C878]/20 text-[#20C878] uppercase tracking-wider border border-[#20C878]/30">
              {currentMode.toUpperCase()} BUILDER
            </span>
            <span className="text-[10px] sm:text-xs text-[#929BA8]">•</span>
            <span className="text-[10px] sm:text-xs text-[#929BA8] font-semibold">
              {selectedPlayers.length}/11 Selected
            </span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full truncate border-b border-transparent bg-transparent text-lg sm:text-2xl font-bold font-heading text-white hover:border-white/20 focus:border-[#20C878] focus:outline-none transition-colors"
          />
        </div>

        {/* Action Controls */}
        <div className="grid w-full grid-cols-4 items-center gap-1.5 sm:flex sm:w-auto sm:flex-wrap sm:gap-2 shrink-0">
          <Link
            to={`/poster?id=${teamId}`}
            className="col-span-2 flex items-center justify-center gap-1 rounded-lg border border-[#3BA7FF]/30 bg-[#181F29] px-2 py-1.5 text-[10px] font-semibold text-[#3BA7FF] transition-all hover:bg-[#202938] sm:col-span-1 sm:gap-1.5 sm:rounded-xl sm:px-3 sm:py-2 sm:text-xs"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Generate Poster</span>
          </Link>

          <button
            type="button"
            onClick={handleDuplicate}
            className="rounded-lg border border-white/5 bg-[#181F29] p-1.5 text-[#929BA8] transition-colors hover:bg-[#202938] hover:text-white sm:rounded-xl sm:p-2"
            title="Duplicate XI"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg border border-white/5 bg-[#181F29] p-1.5 text-[#929BA8] transition-colors hover:bg-rose-500/20 hover:text-rose-400 sm:rounded-xl sm:p-2"
            title="Reset Lineup"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleSaveTeam('draft')}
            disabled={!selectedCompId || !selectedTeamId}
            className="col-span-2 rounded-lg border border-white/10 bg-[#181F29] px-2 py-1.5 text-[10px] font-semibold text-white transition-all hover:bg-[#202938] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 sm:col-span-1 sm:rounded-xl sm:px-4 sm:py-2 sm:text-xs"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => handleSaveTeam('completed')}
            disabled={!selectedCompId || !selectedTeamId}
            className="col-span-2 flex items-center justify-center gap-1 rounded-lg bg-[#20C878] px-2 py-1.5 text-[10px] font-bold text-[#090B0F] shadow-lg shadow-[#20C878]/25 transition-all hover:bg-[#1bb56c] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 sm:col-span-1 sm:rounded-xl sm:gap-1.5 sm:px-5 sm:py-2 sm:text-xs"
          >
            <Save className="w-4 h-4" />
            <span>Publish XI</span>
          </button>
        </div>
      </div>

      {/* Mode Specific Parameters Bar */}
      <div className="grid grid-cols-2 items-center gap-x-2 gap-y-2 rounded-2xl border border-white/5 bg-[#181F29] p-2 text-[9px] sm:flex sm:flex-wrap sm:gap-3 sm:p-4 sm:text-xs">
        {/* Format Selector */}
        <div className="flex min-w-0 items-center gap-1">
          <span className="text-[#929BA8] font-bold">Format:</span>
          {(['T20', 'ODI', 'TEST'] as const).map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => setFormat(fmt)}
              className={`rounded-lg px-2 py-1 font-bold transition-all sm:px-2.5 ${
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
        <div className="flex min-w-0 items-center gap-1">
          <span className="shrink-0 text-[#929BA8] font-bold">Comp:</span>
          <select
            value={selectedCompId}
            required
            onChange={(e) => {
              const nextCompetitionId = e.target.value;
              setSelectedCompId(nextCompetitionId);
              const nextCompetition = competitions.find((competition) => competition.id === nextCompetitionId);
              setSelectedSeason(nextCompetition?.currentSeason ?? '');
              const nextTeamChoices = teams.filter((team) =>
                team.competitionId === nextCompetitionId &&
                (currentMode !== 'franchise' || team.type === 'Franchise')
              );
              if (!nextTeamChoices.some((team) => team.id === selectedTeamId)) {
                setSelectedTeamId('');
              }
              setSelectionError('');
            }}
            className="h-8 min-w-0 w-full truncate rounded-lg border border-white/10 bg-[#121720] px-1.5 text-[9px] text-white focus:outline-none sm:w-auto sm:max-w-[220px] sm:px-2.5 sm:text-xs"
          >
            <option value="">Select competition</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.format})
              </option>
            ))}
          </select>
        </div>

        {/* Season */}
        <div className="flex min-w-0 items-center gap-1">
          <span className="text-[#929BA8] font-bold">Season:</span>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="h-8 min-w-0 w-full rounded-lg border border-white/10 bg-[#121720] px-1.5 text-[9px] text-white focus:outline-none sm:w-auto sm:px-2.5 sm:text-xs"
          >
            {(activeCompetition?.seasons || []).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Team selection is required for every saved XI */}
        <div className="flex min-w-0 items-center gap-1">
            <span className="shrink-0 text-amber-400 font-bold">Team:</span>
            <select
              value={selectedTeamId}
              required
              onChange={(e) => {
                setSelectedTeamId(e.target.value);
                setSelectionError('');
              }}
              disabled={!selectedCompId}
              className="h-8 min-w-0 w-full truncate rounded-lg border border-amber-400/30 bg-[#121720] px-1.5 text-[9px] text-white focus:outline-none disabled:opacity-50 sm:w-auto sm:max-w-[220px] sm:px-2.5 sm:text-xs"
            >
              <option value="">{selectedCompId ? 'Select team' : 'Choose competition first'}</option>
              {teams
                .filter((team) =>
                  team.competitionId === selectedCompId &&
                  (currentMode !== 'franchise' || team.type === 'Franchise')
                )
                .map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.code})
                  </option>
                ))}
            </select>
            {selectedCompId && !teams.some((team) =>
              team.competitionId === selectedCompId &&
              (currentMode !== 'franchise' || team.type === 'Franchise')
            ) && <span className="text-[9px] text-amber-300">No teams for this competition</span>}
        </div>

        {/* Custom Pool Picker if Custom Pool Mode */}
        {currentMode === 'custom-pool' && customPools.length > 0 && (
          <div className="flex min-w-0 items-center gap-1">
            <span className="shrink-0 text-pink-400 font-bold">Pool:</span>
            <select
              value={selectedPoolId}
              onChange={(e) => setSelectedPoolId(e.target.value)}
              className="h-8 min-w-0 w-[112px] truncate rounded-lg border border-pink-400/30 bg-[#121720] px-2 text-[10px] text-white focus:outline-none sm:w-auto sm:max-w-[220px] sm:px-2.5 sm:text-xs"
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

      {(!selectedCompId || !selectedTeamId || selectionError) && (
        <p role={selectionError ? 'alert' : 'status'} className="text-xs text-amber-300">
          {selectionError || 'Select a competition and its team before saving your XI.'}
        </p>
      )}

      {/* Rules Engine Validation Bar */}
      <RulesValidationBar
        validation={validationResult}
        onSaveDraft={() => handleSaveTeam('draft')}
        onSaveCompleted={() => handleSaveTeam('completed')}
        canSave={Boolean(selectedCompId && selectedTeamId)}
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
              onViewPlayer={(player) =>
                navigate(`/players/${player.id}`, {
                  state: {
                    returnTo: `${location.pathname}${location.search}`,
                    selectForXI: true,
                    isInTeam: selectedPlayers.some((selected) => selected.playerId === player.id),
                  },
                })
              }
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
              onViewPlayer={(player) =>
                navigate(`/players/${player.id}`, {
                  state: {
                    returnTo: `${location.pathname}${location.search}`,
                    selectForXI: true,
                    isInTeam: selectedPlayers.some((selected) => selected.playerId === player.id),
                  },
                })
              }
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

    </div>
  );
};
