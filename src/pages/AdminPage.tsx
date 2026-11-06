import React, { useState, useEffect, useRef } from 'react';
import { storageService } from '../services/storageService';
import { isSupabaseAdmin, supabase, uploadPlayerImage } from '../services/supabaseClient';
import {
  BattingHand,
  BowlingStyle,
  Competition,
  CompetitionRules,
  CricketFormat,
  Player,
  PlayerAttributes,
  PlayerRole,
  PlayerSpecialization,
  SquadMembership,
  TeamEntity,
} from '../types/cricket';
import {
  Settings,
  Users,
  Trophy,
  Database,
  Upload,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  FileCode,
  RotateCcw,
  Sparkles,
  Search,
  X,
  AlertTriangle,
} from 'lucide-react';

const EMPTY_PLAYER_ATTRIBUTES: PlayerAttributes = {
  technique: 50,
  powerHitting: 50,
  timing: 50,
  shotSelection: 50,
  strikeRotation: 50,
  againstPace: 50,
  againstSpin: 50,
  finishing: 50,
  consistency: 50,
  pace: 50,
  swing: 50,
  seam: 50,
  spin: 50,
  accuracy: 50,
  variations: 50,
  deathBowling: 50,
  powerplayBowling: 50,
  control: 50,
  catching: 50,
  groundFielding: 50,
  throwing: 50,
  reflexes: 50,
  agility: 50,
  wkReflexes: 50,
  wkCatching: 50,
  wkStumping: 50,
  wkGlovework: 50,
  wkPositioning: 50,
  fitness: 50,
  experience: 50,
  leadership: 50,
  pressureHandling: 50,
  versatility: 50,
};

const ATTRIBUTE_GROUPS: { title: string; fields: { key: keyof PlayerAttributes; label: string }[] }[] = [
  {
    title: 'Batting',
    fields: [
      { key: 'technique', label: 'Technique' },
      { key: 'powerHitting', label: 'Power hitting' },
      { key: 'timing', label: 'Timing' },
      { key: 'shotSelection', label: 'Shot selection' },
      { key: 'strikeRotation', label: 'Strike rotation' },
      { key: 'againstPace', label: 'Against pace' },
      { key: 'againstSpin', label: 'Against spin' },
      { key: 'finishing', label: 'Finishing' },
      { key: 'consistency', label: 'Consistency' },
    ],
  },
  {
    title: 'Bowling',
    fields: [
      { key: 'pace', label: 'Pace' },
      { key: 'swing', label: 'Swing' },
      { key: 'seam', label: 'Seam' },
      { key: 'spin', label: 'Spin' },
      { key: 'accuracy', label: 'Accuracy' },
      { key: 'variations', label: 'Variations' },
      { key: 'deathBowling', label: 'Death bowling' },
      { key: 'powerplayBowling', label: 'Powerplay bowling' },
      { key: 'control', label: 'Control' },
    ],
  },
  {
    title: 'Fielding & wicketkeeping',
    fields: [
      { key: 'catching', label: 'Catching' },
      { key: 'groundFielding', label: 'Ground fielding' },
      { key: 'throwing', label: 'Throwing' },
      { key: 'reflexes', label: 'Reflexes' },
      { key: 'agility', label: 'Agility' },
      { key: 'wkReflexes', label: 'WK reflexes' },
      { key: 'wkCatching', label: 'WK catching' },
      { key: 'wkStumping', label: 'WK stumping' },
      { key: 'wkGlovework', label: 'WK glovework' },
      { key: 'wkPositioning', label: 'WK positioning' },
    ],
  },
  {
    title: 'General',
    fields: [
      { key: 'fitness', label: 'Fitness' },
      { key: 'experience', label: 'Experience' },
      { key: 'leadership', label: 'Leadership' },
      { key: 'pressureHandling', label: 'Pressure handling' },
      { key: 'versatility', label: 'Versatility' },
    ],
  },
];

const DEFAULT_COMPETITION_RULES: CompetitionRules = {
  maxOverseas: 4,
  exactPlayersCount: 11,
  minWicketkeepers: 1,
  maxWicketkeepers: 3,
  minBowlersOrAllRounders: 5,
  allowImpactPlayer: false,
  maxSubstitutes: 5,
  requireCaptain: true,
  requireViceCaptain: true,
};

const DEFAULT_PLAYER_STATS: Player['stats'][keyof Player['stats']] = {
  matches: 0,
  innings: 0,
  runs: 0,
  highestScore: '0',
  battingAverage: 0,
  strikeRate: 0,
  centuries: 0,
  fifties: 0,
  wickets: 0,
  bowlingAverage: 0,
  economy: 0,
  bestBowling: '0/0',
  fiveWickets: 0,
  catches: 0,
  stumpings: 0,
};

export const AdminPage: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [teams, setTeams] = useState<TeamEntity[]>([]);
  const [squads, setSquads] = useState<SquadMembership[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'players' | 'teams' | 'competitions' | 'import' | 'schema'>('dashboard');

  // Player Form Modal State
  const [playerModalOpen, setPlayerModalOpen] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formCountry, setFormCountry] = useState('India');
  const [formRole, setFormRole] = useState<PlayerRole>('Batter');
  const [formSpec, setFormSpec] = useState('Top-order batter');
  const [formBatHand, setFormBatHand] = useState<'Right-hand bat' | 'Left-hand bat'>('Right-hand bat');
  const [formBowlStyle, setFormBowlStyle] = useState('Right-arm medium');
  const [formOverall, setFormOverall] = useState(85);
  const [formT20, setFormT20] = useState(85);
  const [formODI, setFormODI] = useState(85);
  const [formTest, setFormTest] = useState(80);
  const [formOverseas, setFormOverseas] = useState(false);
  const [formImage, setFormImage] = useState('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&auto=format&fit=crop&q=80');
  const [formAttributes, setFormAttributes] = useState<PlayerAttributes>({ ...EMPTY_PLAYER_ATTRIBUTES });
  const [competitionName, setCompetitionName] = useState('');
  const [competitionShortName, setCompetitionShortName] = useState('');
  const [competitionCountry, setCompetitionCountry] = useState('');
  const [competitionType, setCompetitionType] = useState<Competition['competitionType']>('Franchise');
  const [competitionFormat, setCompetitionFormat] = useState<CricketFormat>('T20');
  const [competitionSeason, setCompetitionSeason] = useState(new Date().getFullYear().toString());
  const [competitionDescription, setCompetitionDescription] = useState('');
  const [competitionRules, setCompetitionRules] = useState<CompetitionRules>({ ...DEFAULT_COMPETITION_RULES });
  const [teamName, setTeamName] = useState('');
  const [teamShortName, setTeamShortName] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [teamCompetitionId, setTeamCompetitionId] = useState('');
  const [teamType, setTeamType] = useState<TeamEntity['type']>('Franchise');
  const [teamLogo, setTeamLogo] = useState('');
  const [teamPrimaryColor, setTeamPrimaryColor] = useState('#20C878');
  const [teamSecondaryColor, setTeamSecondaryColor] = useState('#181F29');
  const [teamHomeGround, setTeamHomeGround] = useState('');
  const [teamEstablishedYear, setTeamEstablishedYear] = useState(new Date().getFullYear());
  const [formError, setFormError] = useState('');

  // CSV Import State
  const [importJsonText, setImportJsonText] = useState('');
  const [importResult, setImportResult] = useState<{ imported: number; duplicates: number } | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [cloudStatus, setCloudStatus] = useState(storageService.getCloudStorageStatus());
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [imageUploadError, setImageUploadError] = useState('');
  const [imageUploadSuccess, setImageUploadSuccess] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    refreshData();
    const unsub = storageService.subscribe(refreshData);
    const updateCloudStatus = () => setCloudStatus(storageService.getCloudStorageStatus());
    const unsubStatus = storageService.subscribe(updateCloudStatus);
    updateCloudStatus();
    return () => {
      unsub();
      unsubStatus();
    };
  }, []);

  const refreshData = () => {
    setPlayers(storageService.getPlayers());
    setCompetitions(storageService.getCompetitions());
    setTeams(storageService.getTeams());
    setSquads(storageService.getSquads());
  };

  const requireAdminAccess = () => {
    if (cloudStatus.configured && !cloudStatus.isAdmin) {
      setAuthError('Sign in with an authorized Supabase admin account before changing the shared catalog.');
      return false;
    }
    return true;
  };

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setAuthError('');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });
    if (error) {
      setAuthError(error.message);
      return;
    }
    if (!isSupabaseAdmin(data.user)) {
      await supabase.auth.signOut();
      setAuthError('Admin role missing. In Supabase Dashboard > Authentication > Users, set this user’s app_metadata to {"role":"admin"} (not user_metadata), then sign in again.');
      return;
    }
    setAdminPassword('');
    await storageService.syncCatalogToSupabase();
  };

  const handleAdminSignOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) setAuthError(error.message);
  };

  const handleUploadPlayerImage = async (file?: File) => {
    if (!file) return;
    if (!cloudStatus.configured) {
      setImageUploadError('Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the app.');
      return;
    }
    if (!requireAdminAccess()) return;
    setImageUploadError('');
    setImageUploadSuccess('');
    setUploadingImage(true);
    try {
      setFormImage(await uploadPlayerImage(file));
      setImageUploadSuccess(`${file.name} uploaded. Save the player to keep this image.`);
    } catch (error) {
      setImageUploadError(error instanceof Error ? error.message : 'Image upload failed.');
    } finally {
      setUploadingImage(false);
      if (imageFileInputRef.current) imageFileInputRef.current.value = '';
    }
  };

  const handleOpenAddPlayer = () => {
    if (!requireAdminAccess()) return;
    setEditingPlayerId(null);
    setFormName('');
    setFormCountry('India');
    setFormRole('Batter');
    setFormSpec('Top-order batter');
    setFormBatHand('Right-hand bat');
    setFormBowlStyle('Right-arm medium');
    setFormOverall(85);
    setFormT20(85);
    setFormODI(85);
    setFormTest(80);
    setFormOverseas(false);
    setFormImage('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&auto=format&fit=crop&q=80');
    setFormAttributes({ ...EMPTY_PLAYER_ATTRIBUTES });
    setFormError('');
    setPlayerModalOpen(true);
  };

  const handleOpenEditPlayer = (p: Player) => {
    if (!requireAdminAccess()) return;
    setEditingPlayerId(p.id);
    setFormName(p.fullName);
    setFormCountry(p.country);
    setFormRole(p.primaryRole);
    setFormSpec(p.specialization);
    setFormBatHand(p.battingHand);
    setFormBowlStyle(p.bowlingStyle);
    setFormOverall(p.overallRating);
    setFormT20(p.formatRatings.T20);
    setFormODI(p.formatRatings.ODI);
    setFormTest(p.formatRatings.TEST);
    setFormOverseas(p.isOverseasIPL || false);
    setFormImage(p.imageUrl);
    setFormAttributes({ ...EMPTY_PLAYER_ATTRIBUTES, ...p.attributes });
    setFormError('');
    setPlayerModalOpen(true);
  };

  const handleSavePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAdminAccess() || !formName.trim()) return;

    const existingPlayer = editingPlayerId ? storageService.getPlayerById(editingPlayerId) : undefined;
    const newPlayer: Player = {
      id: editingPlayerId || `p-${Date.now()}`,
      fullName: formName.trim(),
      displayName: formName.trim().split(' ').slice(0, 2).join(' '),
      country: formCountry,
      nationality: formCountry,
      imageUrl: formImage,
      primaryRole: formRole,
      secondaryRoles: [],
      specialization: formSpec as PlayerSpecialization,
      battingHand: formBatHand,
      bowlingStyle: formBowlStyle as BowlingStyle,
      careerStatus: 'Active',
      bio: `Professional cricketer representing ${formCountry} with high caliber tactical versatility.`,
      overallRating: formOverall,
      formatRatings: { T20: formT20, ODI: formODI, TEST: formTest },
      attributes: { ...formAttributes },
      stats: existingPlayer?.stats ?? {
        T20: { ...DEFAULT_PLAYER_STATS },
        ODI: { ...DEFAULT_PLAYER_STATS },
        TEST: { ...DEFAULT_PLAYER_STATS },
      },
      teamsPlayed: existingPlayer?.teamsPlayed ?? [],
      isOverseasIPL: formOverseas,
    };

    storageService.savePlayer(newPlayer);
    setPlayerModalOpen(false);
    setFormError('');
  };

  const handleSaveCompetition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAdminAccess()) return;
    const slug = competitionName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!slug) {
      setFormError('Enter a competition name.');
      return;
    }
    if (competitions.some((competition) => competition.slug === slug)) {
      setFormError('A competition with that name already exists.');
      return;
    }

    storageService.saveCompetition({
      id: `comp-${slug}`,
      name: competitionName.trim(),
      shortName: competitionShortName.trim(),
      slug,
      logo: '',
      competitionType,
      format: competitionFormat,
      country: competitionCountry.trim(),
      seasons: [competitionSeason.trim()],
      currentSeason: competitionSeason.trim(),
      description: competitionDescription.trim(),
      rules: { ...competitionRules },
    });
    setCompetitionName('');
    setCompetitionShortName('');
    setCompetitionCountry('');
    setCompetitionDescription('');
    setFormError('');
  };

  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAdminAccess()) return;
    const code = teamCode.trim().toUpperCase();
    if (teams.some((team) => team.code.toUpperCase() === code)) {
      setFormError('A team with that code already exists.');
      return;
    }

    storageService.saveTeam({
      id: `team-${code.toLowerCase()}`,
      name: teamName.trim(),
      shortName: teamShortName.trim(),
      code,
      competitionId: teamCompetitionId,
      type: teamType,
      logo: teamLogo.trim(),
      primaryColor: teamPrimaryColor,
      secondaryColor: teamSecondaryColor,
      homeGround: teamHomeGround.trim(),
      championships: [],
      establishedYear: teamEstablishedYear,
    });
    setTeamName('');
    setTeamShortName('');
    setTeamCode('');
    setTeamLogo('');
    setTeamHomeGround('');
    setFormError('');
  };

  const updateCompetitionRule = <K extends keyof CompetitionRules>(
    key: K,
    value: CompetitionRules[K]
  ) => setCompetitionRules((rules) => ({ ...rules, [key]: value }));

  const handleDeletePlayer = (id: string) => {
    if (!requireAdminAccess()) return;
    if (confirm('Delete this player record?')) {
      storageService.deletePlayer(id);
    }
  };

  const handleBulkImport = () => {
    if (!requireAdminAccess()) return;
    try {
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed)) {
        alert('Data must be a JSON array of player objects.');
        return;
      }
      const res = storageService.bulkImportPlayers(parsed);
      setImportResult(res);
      setImportJsonText('');
    } catch (err: any) {
      alert(`Invalid JSON: ${err.message}`);
    }
  };

  const handleCopySchema = () => {
    const sql = storageService.generateSupabaseSQL();
    navigator.clipboard.writeText(sql);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  const handleResetDatabase = () => {
    if (!requireAdminAccess()) return;
    if (confirm('Clear all app data from this browser and replace the shared Supabase catalog with an empty catalog?')) {
      storageService.clearAllData();
      alert('App data cleared.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#20C878] mb-1">
            <Settings className="w-4 h-4" />
            <span>Master Administration Panel</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
            System Dashboard & Database Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#929BA8] mt-1">
            Manage the shared player catalog, upload player images, and inspect Supabase setup.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDatabase}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-[#929BA8] hover:text-rose-400 border border-white/5 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Clear All App Data</span>
        </button>
      </div>

      {cloudStatus.configured && (
        <section className="flex flex-col gap-3 bg-[#121720] p-5 rounded-2xl border border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-white">Supabase shared catalog</p>
              <p className={`text-xs mt-1 ${cloudStatus.state === 'error' ? 'text-rose-400' : 'text-[#929BA8]'}`}>
                {cloudStatus.message}
              </p>
            </div>
            {cloudStatus.isAdmin ? (
              <button
                type="button"
                onClick={handleAdminSignOut}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white hover:bg-white/10"
              >
                Sign out admin
              </button>
            ) : null}
          </div>
          {!cloudStatus.isAdmin && (
            <>
              <form onSubmit={handleAdminSignIn} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  autoComplete="username"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Admin email"
                  className="flex-1 p-2.5 bg-[#181F29] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#20C878]"
                />
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Password"
                  className="flex-1 p-2.5 bg-[#181F29] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#20C878]"
                />
                <button
                  type="submit"
                  disabled={cloudStatus.state === 'loading'}
                  className="px-4 py-2.5 bg-[#20C878] text-[#090B0F] font-bold text-xs rounded-xl disabled:opacity-50"
                >
                  {cloudStatus.state === 'loading' ? 'Connecting…' : 'Admin sign in'}
                </button>
              </form>
              <p className="text-[11px] text-[#929BA8]">
                Admin access requires <code className="text-white">app_metadata.role = "admin"</code> in Supabase Auth → Users, plus the app’s setup SQL applied. Do not set this role in user-editable metadata.
              </p>
            </>
          )}
          {authError && <p role="alert" className="text-xs text-rose-400">{authError}</p>}
        </section>
      )}

      {/* Tabs */}
      <div className="flex border-b border-white/5 bg-[#121720] px-4 rounded-2xl">
        {(
          [
            { id: 'dashboard', label: 'Metrics & Health', icon: Database },
            { id: 'players', label: `Manage Players (${players.length})`, icon: Users },
            { id: 'teams', label: `Teams (${teams.length})`, icon: Users },
            { id: 'competitions', label: `Competitions (${competitions.length})`, icon: Trophy },
            { id: 'import', label: 'Bulk Data Importer', icon: Upload },
            { id: 'schema', label: 'Supabase PostgreSQL Schema', icon: FileCode },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#20C878] text-[#20C878]'
                  : 'border-transparent text-[#929BA8] hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Dashboard Overview */}
      {activeTab === 'dashboard' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-[#121720] p-4 rounded-2xl border border-white/5 text-center">
              <span className="text-[10px] uppercase font-bold text-[#929BA8]">Total Players</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-heading text-white mt-1 block">
                {players.length}
              </span>
            </div>
            <div className="bg-[#121720] p-4 rounded-2xl border border-white/5 text-center">
              <span className="text-[10px] uppercase font-bold text-[#929BA8]">Competitions</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-heading text-[#20C878] mt-1 block">
                {competitions.length}
              </span>
            </div>
            <div className="bg-[#121720] p-4 rounded-2xl border border-white/5 text-center">
              <span className="text-[10px] uppercase font-bold text-[#929BA8]">Teams / Franchises</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-heading text-[#3BA7FF] mt-1 block">
                {teams.length}
              </span>
            </div>
            <div className="bg-[#121720] p-4 rounded-2xl border border-white/5 text-center">
              <span className="text-[10px] uppercase font-bold text-[#929BA8]">Active Squads</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-heading text-amber-400 mt-1 block">
                {squads.length}
              </span>
            </div>
            <div className="bg-[#121720] p-4 rounded-2xl border border-white/5 text-center">
              <span className="text-[10px] uppercase font-bold text-[#929BA8]">User Playing XIs</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-heading text-purple-400 mt-1 block">
                {storageService.getUserTeams().length}
              </span>
            </div>
            <div className="bg-[#121720] p-4 rounded-2xl border border-white/5 text-center">
              <span className="text-[10px] uppercase font-bold text-[#929BA8]">Custom Pools</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-heading text-pink-400 mt-1 block">
                {storageService.getCustomPools().length}
              </span>
            </div>
          </div>

          <div className="bg-[#121720] p-6 rounded-3xl border border-white/10 flex flex-col gap-4">
            <h3 className="text-base font-bold font-heading text-white">System Architecture & Integrity</h3>
            <p className="text-xs text-[#929BA8] leading-relaxed">
              XI ARENA uses a normalized relational data model. Each player is a singular master entity referencing career statistics, format ratings, and season-specific squad rosters without duplicating records across leagues.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-[#181F29] border border-white/5 text-[#20C878]">
                ✓ Centralized Player Registry
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-[#181F29] border border-white/5 text-[#3BA7FF]">
                ✓ Format-Specific Ratings (T20, ODI, Test)
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-[#181F29] border border-white/5 text-amber-400">
                ✓ Season-Specific Squad Memberships
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-[#181F29] border border-white/5 text-purple-400">
                ✓ Supabase PostgreSQL RLS Ready
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Players Management */}
      {activeTab === 'players' && (
        <div className="flex flex-col gap-4 bg-[#121720] p-6 rounded-3xl border border-white/10 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-heading text-white">
              Player Registry Directory
            </h3>
            <button
              type="button"
              onClick={handleOpenAddPlayer}
              className="px-4 py-2 bg-[#20C878] hover:bg-[#1bb56c] text-[#090B0F] font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Player</span>
            </button>
          </div>

          <div className="divide-y divide-white/5 max-h-[60vh] overflow-y-auto">
            {players.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 hover:bg-[#181F29] rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={p.imageUrl}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover border border-white/10"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{p.fullName}</span>
                      <span className="text-xs text-[#929BA8]">({p.country})</span>
                      {p.isOverseasIPL && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold">
                          Overseas
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#929BA8]">
                      {p.primaryRole} • {p.specialization} • Rating: {p.overallRating}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditPlayer(p)}
                    className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePlayer(p.id)}
                    className="p-1 rounded-lg text-[#929BA8] hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'teams' && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <form onSubmit={handleSaveTeam} className="flex flex-col gap-4 bg-[#121720] p-6 rounded-3xl border border-white/10">
            <div>
              <h3 className="text-base font-bold font-heading text-white">Create a team</h3>
              <p className="text-xs text-[#929BA8] mt-1">Add a franchise, national side, or domestic team to the shared catalog.</p>
            </div>
            <label className="text-xs text-[#929BA8]">Team name
              <input required value={teamName} onChange={(e) => setTeamName(e.target.value)} className="mt-1 w-full p-2.5 bg-[#181F29] border border-white/10 rounded-xl text-white" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-[#929BA8]">Short name
                <input required value={teamShortName} onChange={(e) => setTeamShortName(e.target.value)} className="mt-1 w-full p-2.5 bg-[#181F29] border border-white/10 rounded-xl text-white" />
              </label>
              <label className="text-xs text-[#929BA8]">Team code
                <input required maxLength={8} value={teamCode} onChange={(e) => setTeamCode(e.target.value)} className="mt-1 w-full p-2.5 bg-[#181F29] border border-white/10 rounded-xl text-white uppercase" />
              </label>
            </div>
            <label className="text-xs text-[#929BA8]">Competition
              <select value={teamCompetitionId} onChange={(e) => setTeamCompetitionId(e.target.value)} className="mt-1 w-full p-2.5 bg-[#181F29] border border-white/10 rounded-xl text-white">
                <option value="">No competition</option>
                {competitions.map((competition) => <option key={competition.id} value={competition.id}>{competition.name}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-[#929BA8]">Team type
                <select value={teamType} onChange={(e) => setTeamType(e.target.value as TeamEntity['type'])} className="mt-1 w-full p-2.5 bg-[#181F29] border border-white/10 rounded-xl text-white">
                  <option value="Franchise">Franchise</option>
                  <option value="National">National</option>
                  <option value="Domestic">Domestic</option>
                </select>
              </label>
              <label className="text-xs text-[#929BA8]">Established
                <input type="number" min={1800} max={2100} value={teamEstablishedYear} onChange={(e) => setTeamEstablishedYear(Number(e.target.value))} className="mt-1 w-full p-2.5 bg-[#181F29] border border-white/10 rounded-xl text-white" />
              </label>
            </div>
            <label className="text-xs text-[#929BA8]">Logo URL
              <input type="url" value={teamLogo} onChange={(e) => setTeamLogo(e.target.value)} className="mt-1 w-full p-2.5 bg-[#181F29] border border-white/10 rounded-xl text-white" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-[#929BA8]">Primary color
                <input type="color" value={teamPrimaryColor} onChange={(e) => setTeamPrimaryColor(e.target.value)} className="mt-1 h-10 w-full rounded-lg bg-[#181F29]" />
              </label>
              <label className="text-xs text-[#929BA8]">Secondary color
                <input type="color" value={teamSecondaryColor} onChange={(e) => setTeamSecondaryColor(e.target.value)} className="mt-1 h-10 w-full rounded-lg bg-[#181F29]" />
              </label>
            </div>
            <label className="text-xs text-[#929BA8]">Home ground
              <input value={teamHomeGround} onChange={(e) => setTeamHomeGround(e.target.value)} className="mt-1 w-full p-2.5 bg-[#181F29] border border-white/10 rounded-xl text-white" />
            </label>
            {formError && activeTab === 'teams' && <p role="alert" className="text-xs text-rose-400">{formError}</p>}
            <button type="submit" className="px-4 py-2.5 bg-[#20C878] text-[#090B0F] font-bold text-xs rounded-xl">Create team</button>
          </form>

          <section className="bg-[#121720] p-6 rounded-3xl border border-white/10">
            <h3 className="text-base font-bold font-heading text-white mb-4">Teams in catalog</h3>
            <div className="divide-y divide-white/5 max-h-[70vh] overflow-y-auto">
              {teams.map((team) => (
                <div key={team.id} className="flex items-center gap-3 py-3">
                  {team.logo ? <img src={team.logo} alt="" className="w-10 h-10 rounded-xl object-cover" /> : <div className="w-10 h-10 rounded-xl bg-[#181F29] grid place-items-center text-xs font-bold text-[#20C878]">{team.code}</div>}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">{team.name} <span className="text-[#929BA8]">({team.code})</span></p>
                    <p className="text-xs text-[#929BA8]">{team.type}{team.competitionId ? ` · ${storageService.getCompetitionById(team.competitionId)?.name ?? team.competitionId}` : ''}</p>
                  </div>
                </div>
              ))}
              {teams.length === 0 && <p className="text-sm text-[#929BA8]">No teams have been created yet.</p>}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'competitions' && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <form onSubmit={handleSaveCompetition} className="flex flex-col gap-4 bg-[#121720] p-6 rounded-3xl border border-white/10">
            <div>
              <h3 className="text-base font-bold font-heading text-white">Create a competition</h3>
              <p className="text-xs text-[#929BA8] mt-1">Configure its format, season, and XI selection rules.</p>
            </div>
            <label className="text-xs text-[#929BA8]">Competition name
              <input required value={competitionName} onChange={(e) => setCompetitionName(e.target.value)} className="mt-1 w-full p-2.5 bg-[#181F29] border border-white/10 rounded-xl text-white" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-[#929BA8]">Short name
                <input required value={competitionShortName} onChange={(e) => setCompetitionShortName(e.target.value)} className="mt-1 w-full p-2.5 bg-[#181F29] border border-white/10 rounded-xl text-white" />
              </label>
              <label className="text-xs text-[#929BA8]">Country
                <input required value={competitionCountry} onChange={(e) => setCompetitionCountry(e.target.value)} className="mt-1 w-full p-2.5 bg-[#181F29] border border-white/10 rounded-xl text-white" />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-[#929BA8]">Competition type
                <select value={competitionType} onChange={(e) => setCompetitionType(e.target.value as Competition['competitionType'])} className="mt-1 w-full p-2.5 bg-[#181F29] border border-white/10 rounded-xl text-white">
                  <option value="Franchise">Franchise</option>
                  <option value="International">International</option>
                  <option value="Domestic">Domestic</option>
                </select>
              </label>
              <label className="text-xs text-[#929BA8]">Format
                <select value={competitionFormat} onChange={(e) => setCompetitionFormat(e.target.value as CricketFormat)} className="mt-1 w-full p-2.5 bg-[#181F29] border border-white/10 rounded-xl text-white">
                  <option value="T20">T20</option>
                  <option value="ODI">ODI</option>
                  <option value="TEST">Test</option>
                </select>
              </label>
            </div>
            <label className="text-xs text-[#929BA8]">Current season
              <input required value={competitionSeason} onChange={(e) => setCompetitionSeason(e.target.value)} className="mt-1 w-full p-2.5 bg-[#181F29] border border-white/10 rounded-xl text-white" />
            </label>
            <label className="text-xs text-[#929BA8]">Description
              <textarea rows={2} value={competitionDescription} onChange={(e) => setCompetitionDescription(e.target.value)} className="mt-1 w-full p-2.5 bg-[#181F29] border border-white/10 rounded-xl text-white" />
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {([
                ['maxOverseas', 'Max overseas'],
                ['exactPlayersCount', 'Players per XI'],
                ['minWicketkeepers', 'Min wicketkeepers'],
                ['maxWicketkeepers', 'Max wicketkeepers'],
                ['minBowlersOrAllRounders', 'Min bowlers/all-rounders'],
                ['maxSubstitutes', 'Max substitutes'],
              ] as const).map(([key, label]) => (
                <label key={key} className="text-[11px] text-[#929BA8]">{label}
                  <input type="number" min={0} max={30} value={competitionRules[key]} onChange={(e) => updateCompetitionRule(key, Number(e.target.value))} className="mt-1 w-full p-2 bg-[#181F29] border border-white/10 rounded-lg text-white" />
                </label>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-[#929BA8]">
              <label className="flex items-center gap-2"><input type="checkbox" checked={competitionRules.allowImpactPlayer} onChange={(e) => updateCompetitionRule('allowImpactPlayer', e.target.checked)} /> Allow impact player</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={competitionRules.requireCaptain} onChange={(e) => updateCompetitionRule('requireCaptain', e.target.checked)} /> Require captain</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={competitionRules.requireViceCaptain} onChange={(e) => updateCompetitionRule('requireViceCaptain', e.target.checked)} /> Require vice-captain</label>
            </div>
            {formError && activeTab === 'competitions' && <p role="alert" className="text-xs text-rose-400">{formError}</p>}
            <button type="submit" className="px-4 py-2.5 bg-[#20C878] text-[#090B0F] font-bold text-xs rounded-xl">Create competition</button>
          </form>

          <section className="bg-[#121720] p-6 rounded-3xl border border-white/10">
            <h3 className="text-base font-bold font-heading text-white mb-4">Competitions in catalog</h3>
            <div className="divide-y divide-white/5 max-h-[70vh] overflow-y-auto">
              {competitions.map((competition) => (
                <div key={competition.id} className="py-3">
                  <p className="text-sm font-bold text-white">{competition.name} <span className="text-[#929BA8]">({competition.shortName})</span></p>
                  <p className="text-xs text-[#929BA8]">{competition.competitionType} · {competition.format} · {competition.currentSeason}</p>
                </div>
              ))}
              {competitions.length === 0 && <p className="text-sm text-[#929BA8]">No competitions have been created yet.</p>}
            </div>
          </section>
        </div>
      )}

      {/* Tab 3: Bulk Importer */}
      {activeTab === 'import' && (
        <div className="flex flex-col gap-6 bg-[#121720] p-6 rounded-3xl border border-white/10 shadow-xl">
          <div>
            <h3 className="text-base font-bold font-heading text-white">
              Bulk Player Import Engine
            </h3>
            <p className="text-xs text-[#929BA8] mt-1 leading-relaxed">
              Import multiple player records simultaneously using JSON arrays. Includes duplicate detection and automatic attribute normalization.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#929BA8]">
                Paste Player JSON Array:
              </label>
              <button
                type="button"
                onClick={() => {
                  const sample = [
                    {
                      id: `p-sample-${Date.now()}`,
                      fullName: 'Rajat Patidar',
                      displayName: 'Rajat Patidar',
                      country: 'India',
                      nationality: 'Indian',
                      imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&auto=format&fit=crop&q=80',
                      primaryRole: 'Batter',
                      secondaryRoles: [],
                      specialization: 'Middle-order batter',
                      battingHand: 'Right-hand bat',
                      bowlingStyle: 'Right-arm off-break',
                      careerStatus: 'Active',
                      bio: 'Dynamic spin-hitter and RCB middle-order mainstay.',
                      overallRating: 88,
                      formatRatings: { T20: 89, ODI: 82, TEST: 78 },
                      attributes: {
                        technique: 88, powerHitting: 92, timing: 90, shotSelection: 86, strikeRotation: 85, againstPace: 88, againstSpin: 96, finishing: 86, consistency: 85, pace: 20, swing: 20, seam: 20, spin: 60, accuracy: 60, variations: 55, deathBowling: 10, powerplayBowling: 20, control: 60, catching: 88, groundFielding: 86, throwing: 85, reflexes: 88, agility: 86, fitness: 90, experience: 82, leadership: 78, pressureHandling: 89, versatility: 85
                      },
                      stats: {
                        T20: { matches: 27, innings: 24, runs: 799, highestScore: '112*', battingAverage: 34.7, strikeRate: 158.8, centuries: 1, fifties: 7, wickets: 0, bowlingAverage: 0, economy: 0, bestBowling: '0/0', fiveWickets: 0, catches: 14, stumpings: 0 },
                        ODI: { matches: 1, innings: 1, runs: 22, highestScore: '22', battingAverage: 22.0, strikeRate: 137.5, centuries: 0, fifties: 0, wickets: 0, bowlingAverage: 0, economy: 0, bestBowling: '0/0', fiveWickets: 0, catches: 1, stumpings: 0 },
                        TEST: { matches: 3, innings: 6, runs: 63, highestScore: '32', battingAverage: 10.5, strikeRate: 50.0, centuries: 0, fifties: 0, wickets: 0, bowlingAverage: 0, economy: 0, bestBowling: '0/0', fiveWickets: 0, catches: 2, stumpings: 0 }
                      },
                      teamsPlayed: ['team-rcb', 'team-ind'],
                      isOverseasIPL: false
                    }
                  ];
                  setImportJsonText(JSON.stringify(sample, null, 2));
                }}
                className="text-xs text-[#20C878] hover:underline"
              >
                + Load Sample Record
              </button>
            </div>

            <textarea
              rows={8}
              placeholder="[{ fullName: '...', country: '...' }]"
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              className="w-full p-4 bg-[#181F29] border border-white/10 rounded-2xl text-xs font-mono text-white focus:outline-none focus:border-[#20C878]"
            />
          </div>

          <button
            type="button"
            onClick={handleBulkImport}
            disabled={!importJsonText.trim()}
            className="px-6 py-2.5 bg-[#20C878] hover:bg-[#1bb56c] disabled:opacity-40 text-[#090B0F] font-bold text-xs rounded-xl shadow-md self-start flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Process & Validate Import</span>
          </button>

          {importResult && (
            <div className="p-4 bg-[#181F29] border border-white/10 rounded-2xl text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#20C878]" />
              <span>
                Import complete: <strong>{importResult.imported} players imported</strong>,{' '}
                <strong>{importResult.duplicates} duplicates ignored</strong>.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Supabase PostgreSQL Schema */}
      {activeTab === 'schema' && (
        <div className="flex flex-col gap-4 bg-[#121720] p-6 rounded-3xl border border-white/10 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-heading text-white">
                Supabase Database and Storage Setup
              </h3>
              <p className="text-xs text-[#929BA8] mt-0.5">
                Copy and run in the Supabase SQL Editor to create the shared catalog, image bucket, and admin-only write policies.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopySchema}
              className="px-4 py-2 bg-[#20C878] hover:bg-[#1bb56c] text-[#090B0F] font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              {copiedSchema ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSchema ? 'SQL Copied!' : 'Copy SQL Schema'}</span>
            </button>
          </div>

          <pre className="p-4 bg-[#090B0F] border border-white/10 rounded-2xl text-xs font-mono text-emerald-400 overflow-x-auto max-h-[50vh]">
            {storageService.generateSupabaseSQL()}
          </pre>
        </div>
      )}

      {/* Add / Edit Player Modal */}
      {playerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-[#121720] border border-white/10 rounded-2xl p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <h3 className="text-lg font-bold font-heading text-white">
                {editingPlayerId ? 'Edit Player Record' : 'Register New Player'}
              </h3>
              <button
                type="button"
                onClick={() => setPlayerModalOpen(false)}
                className="p-1 text-[#929BA8] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlayer} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="text-[#929BA8] font-semibold block mb-1">Full Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jasprit Bumrah"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 bg-[#181F29] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#20C878]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[#929BA8] font-semibold block mb-1">Player image URL:</label>
                <input
                  type="url"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full p-2.5 bg-[#181F29] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#20C878]"
                />
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <input
                    ref={imageFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => void handleUploadPlayerImage(e.target.files?.[0])}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => imageFileInputRef.current?.click()}
                    disabled={uploadingImage || !cloudStatus.configured || !cloudStatus.isAdmin}
                    className="px-3 py-2 rounded-lg text-xs font-semibold bg-white/5 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingImage ? 'Uploading…' : 'Choose image file'}
                  </button>
                  <span className="text-[11px] text-[#929BA8]">JPEG, PNG, WebP, or GIF; up to 5 MB.</span>
                </div>
                {!cloudStatus.configured && (
                  <p className="mt-2 text-[11px] text-amber-300">
                    Supabase is not configured. Add the URL and anon key to .env.local, then restart the dev server to enable uploads.
                  </p>
                )}
                {cloudStatus.configured && !cloudStatus.isAdmin && (
                  <p className="mt-2 text-[11px] text-amber-300">
                    Sign in with an authorized Supabase admin account above to upload images.
                  </p>
                )}
                {imageUploadError && <p role="alert" className="mt-2 text-xs text-rose-400">{imageUploadError}</p>}
                {imageUploadSuccess && <p role="status" className="mt-2 text-xs text-emerald-400">{imageUploadSuccess}</p>}
                {formImage && <img src={formImage} alt="Player image preview" className="mt-3 h-24 w-24 rounded-xl border border-white/10 object-cover" />}
              </div>

              <div>
                <label className="text-[#929BA8] font-semibold block mb-1">Country:</label>
                <input
                  type="text"
                  required
                  value={formCountry}
                  onChange={(e) => setFormCountry(e.target.value)}
                  className="w-full p-2.5 bg-[#181F29] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#20C878]"
                />
              </div>

              <div>
                <label className="text-[#929BA8] font-semibold block mb-1">Primary Role:</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as PlayerRole)}
                  className="w-full p-2.5 bg-[#181F29] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#20C878]"
                >
                  <option value="Batter">Batter</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-rounder">All-rounder</option>
                  <option value="Wicketkeeper">Wicketkeeper</option>
                </select>
              </div>

              <div>
                <label className="text-[#929BA8] font-semibold block mb-1">Specialization:</label>
                <input
                  type="text"
                  value={formSpec}
                  onChange={(e) => setFormSpec(e.target.value)}
                  className="w-full p-2.5 bg-[#181F29] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#20C878]"
                />
              </div>

              <div>
                <label className="text-[#929BA8] font-semibold block mb-1">Batting Hand:</label>
                <select
                  value={formBatHand}
                  onChange={(e) => setFormBatHand(e.target.value as BattingHand)}
                  className="w-full p-2.5 bg-[#181F29] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#20C878]"
                >
                  <option value="Right-hand bat">Right-hand bat</option>
                  <option value="Left-hand bat">Left-hand bat</option>
                </select>
              </div>

              <div>
                <label className="text-[#929BA8] font-semibold block mb-1">Bowling Style:</label>
                <select
                  value={formBowlStyle}
                  onChange={(e) => setFormBowlStyle(e.target.value)}
                  className="w-full p-2.5 bg-[#181F29] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#20C878]"
                >
                  {([
                    'Right-arm fast',
                    'Right-arm fast-medium',
                    'Right-arm medium',
                    'Left-arm fast',
                    'Left-arm fast-medium',
                    'Right-arm off-break',
                    'Right-arm leg-break',
                    'Left-arm orthodox',
                    'Left-arm wrist-spin',
                    'None',
                  ] satisfies BowlingStyle[]).map((style) => <option key={style} value={style}>{style}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[#929BA8] font-semibold block mb-1">Overall Master Rating (1-100):</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formOverall}
                  onChange={(e) => setFormOverall(Math.max(1, Math.min(100, Number(e.target.value))))}
                  className="w-full p-2.5 bg-[#181F29] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#20C878]"
                />
              </div>

              {([
                ['T20', formT20, setFormT20],
                ['ODI', formODI, setFormODI],
                ['Test', formTest, setFormTest],
              ] as const).map(([format, rating, setRating]) => (
                <label key={format} className="text-[#929BA8] font-semibold">
                  {format} rating (1-100)
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={rating}
                    onChange={(e) => setRating(Math.max(1, Math.min(100, Number(e.target.value))))}
                    className="mt-1 w-full p-2.5 bg-[#181F29] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#20C878]"
                  />
                </label>
              ))}

              <div className="sm:col-span-2 flex flex-col gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Player attribute ratings</h4>
                  <p className="text-[11px] text-[#929BA8] mt-1">Set each skill from 1 to 100. These values power player comparisons and team analysis.</p>
                </div>
                {ATTRIBUTE_GROUPS.map((group) => (
                  <fieldset key={group.title} className="border border-white/10 rounded-xl p-4">
                    <legend className="px-2 text-xs font-bold text-[#20C878]">{group.title}</legend>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      {group.fields.map(({ key, label }) => (
                        <label key={key} className="text-[11px] text-[#929BA8]">{label}
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={formAttributes[key] ?? 50}
                            onChange={(e) => setFormAttributes((attributes) => ({
                              ...attributes,
                              [key]: Math.max(1, Math.min(100, Number(e.target.value))),
                            }))}
                            className="mt-1 w-full p-2 bg-[#181F29] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#20C878]"
                          />
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="overseasCheckbox"
                  checked={formOverseas}
                  onChange={(e) => setFormOverseas(e.target.checked)}
                  className="w-4 h-4 accent-[#20C878]"
                />
                <label htmlFor="overseasCheckbox" className="text-white font-medium cursor-pointer">
                  Overseas / Non-Indian Player (Counts towards 4-player cap in IPL)
                </label>
              </div>

              {formError && <p role="alert" className="sm:col-span-2 text-xs text-rose-400">{formError}</p>}
              <div className="sm:col-span-2 flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setPlayerModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#929BA8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#20C878] hover:bg-[#1bb56c] text-[#090B0F] font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Save Player
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
