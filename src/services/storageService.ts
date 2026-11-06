import {
  Player,
  Competition,
  TeamEntity,
  SquadMembership,
  CustomPool,
  UserTeam,
} from '../types/cricket';
import { isSupabaseAdmin, isSupabaseConfigured, supabase } from './supabaseClient';

type CatalogPayload = {
  players: Player[];
  competitions: Competition[];
  teams: TeamEntity[];
  squads: SquadMembership[];
};

export interface CloudStorageStatus {
  configured: boolean;
  state: 'local' | 'loading' | 'synced' | 'error';
  message: string;
  isAdmin: boolean;
}

const STORAGE_KEYS = {
  PLAYERS: 'xi_arena_players_v1',
  COMPETITIONS: 'xi_arena_competitions_v1',
  TEAMS: 'xi_arena_teams_v1',
  SQUADS: 'xi_arena_squads_v1',
  CUSTOM_POOLS: 'xi_arena_custom_pools_v1',
  USER_TEAMS: 'xi_arena_user_teams_v1',
  USER_LIKES: 'xi_arena_user_likes_v1',
  USER_BOOKMARKS: 'xi_arena_user_bookmarks_v1',
};

class StorageService {
  private players: Player[] = [];
  private competitions: Competition[] = [];
  private teams: TeamEntity[] = [];
  private squads: SquadMembership[] = [];
  private customPools: CustomPool[] = [];
  private userTeams: UserTeam[] = [];
  private userLikes: Set<string> = new Set();
  private userBookmarks: Set<string> = new Set();
  private listeners: Set<() => void> = new Set();
  private cloudReady = false;
  private authListenerRegistered = false;
  private syncQueue: Promise<void> = Promise.resolve();
  private cloudStatus: CloudStorageStatus = {
    configured: isSupabaseConfigured,
    state: 'local',
    message: isSupabaseConfigured ? 'Connecting to Supabase…' : 'Using browser storage.',
    isAdmin: false,
  };

  constructor() {
    this.initData();
  }

  private initData() {
    try {
      const storedPlayers = localStorage.getItem(STORAGE_KEYS.PLAYERS);
      this.players = storedPlayers ? JSON.parse(storedPlayers) : [];

      const storedComps = localStorage.getItem(STORAGE_KEYS.COMPETITIONS);
      this.competitions = storedComps ? JSON.parse(storedComps) : [];

      const storedTeams = localStorage.getItem(STORAGE_KEYS.TEAMS);
      this.teams = storedTeams ? JSON.parse(storedTeams) : [];

      const storedSquads = localStorage.getItem(STORAGE_KEYS.SQUADS);
      this.squads = storedSquads ? JSON.parse(storedSquads) : [];

      const storedPools = localStorage.getItem(STORAGE_KEYS.CUSTOM_POOLS);
      this.customPools = storedPools ? JSON.parse(storedPools) : [];

      const storedUserTeams = localStorage.getItem(STORAGE_KEYS.USER_TEAMS);
      this.userTeams = storedUserTeams ? JSON.parse(storedUserTeams) : [];

      const storedLikes = localStorage.getItem(STORAGE_KEYS.USER_LIKES);
      this.userLikes = storedLikes ? new Set(JSON.parse(storedLikes)) : new Set();

      const storedBookmarks = localStorage.getItem(STORAGE_KEYS.USER_BOOKMARKS);
      this.userBookmarks = storedBookmarks ? new Set(JSON.parse(storedBookmarks)) : new Set();
    } catch {
      this.players = [];
      this.competitions = [];
      this.teams = [];
      this.squads = [];
      this.customPools = [];
      this.userTeams = [];
      this.userLikes = new Set();
      this.userBookmarks = new Set();
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public getCloudStorageStatus(): CloudStorageStatus {
    return { ...this.cloudStatus };
  }

  private setCloudStatus(
    state: CloudStorageStatus['state'],
    message: string,
    isAdmin = this.cloudStatus.isAdmin
  ) {
    this.cloudStatus = { configured: isSupabaseConfigured, state, message, isAdmin };
    this.notify();
  }

  private getCatalogPayload(): CatalogPayload {
    return {
      players: this.players,
      competitions: this.competitions,
      teams: this.teams,
      squads: this.squads,
    };
  }

  private persistCatalogLocally() {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(this.players));
    localStorage.setItem(STORAGE_KEYS.COMPETITIONS, JSON.stringify(this.competitions));
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(this.teams));
    localStorage.setItem(STORAGE_KEYS.SQUADS, JSON.stringify(this.squads));
    this.queueCloudSync();
  }

  private queueCloudSync() {
    if (!supabase || !this.cloudReady) return;
    this.syncQueue = this.syncQueue.then(() => this.syncCatalogToSupabase());
  }

  public async syncCatalogToSupabase() {
    if (!supabase) return;
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const admin = isSupabaseAdmin(sessionData.session?.user);
      if (!admin) {
        this.setCloudStatus('error', 'Sign in with an authorized admin account to publish catalog changes.', false);
        return;
      }

      const { error } = await supabase.from('app_catalog').upsert({
        id: 'default',
        payload: this.getCatalogPayload(),
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      this.setCloudStatus('synced', 'Shared catalog synced with Supabase.', true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Supabase error.';
      this.setCloudStatus('error', `Supabase sync failed: ${message}`);
    }
  }

  public async initializeSupabase(): Promise<void> {
    if (!supabase || this.cloudReady) return;
    this.setCloudStatus('loading', 'Loading the shared catalog from Supabase.');

    if (!this.authListenerRegistered) {
      this.authListenerRegistered = true;
      supabase.auth.onAuthStateChange((_event, session) => {
        const admin = isSupabaseAdmin(session?.user);
        this.setCloudStatus(
          this.cloudStatus.state,
          admin ? 'Admin session active.' : 'Read-only shared catalog.',
          admin
        );
      });
    }

    try {
      const { data, error } = await supabase
        .from('app_catalog')
        .select('payload')
        .eq('id', 'default')
        .maybeSingle();
      if (error) throw error;

      if (data) {
        const payload = data.payload as Partial<CatalogPayload> | null;
        if (
          !payload ||
          !Array.isArray(payload.players) ||
          !Array.isArray(payload.competitions) ||
          !Array.isArray(payload.teams) ||
          !Array.isArray(payload.squads)
        ) {
          throw new Error('The saved Supabase catalog has an invalid shape.');
        }
        this.players = payload.players;
        this.competitions = payload.competitions;
        this.teams = payload.teams;
        this.squads = payload.squads;
        this.persistCatalogLocally();
        this.notify();
      }

      this.cloudReady = true;
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const admin = isSupabaseAdmin(sessionData.session?.user);
      this.setCloudStatus(
        data ? 'synced' : 'local',
        data ? 'Shared catalog loaded from Supabase.' : 'No shared catalog yet. An admin can publish this browser’s catalog.',
        admin
      );
      if (admin && !data) this.queueCloudSync();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Supabase error.';
      this.cloudReady = true;
      this.setCloudStatus('error', `Could not load the shared catalog: ${message}`);
    }
  }

  // --- PLAYERS ---
  public getPlayers(): Player[] {
    return [...this.players];
  }

  public getPlayerById(id: string): Player | undefined {
    return this.players.find((p) => p.id === id);
  }

  public savePlayer(player: Player): void {
    const idx = this.players.findIndex((p) => p.id === player.id);
    if (idx >= 0) {
      this.players[idx] = player;
    } else {
      this.players.push(player);
    }
    this.persistCatalogLocally();
    this.notify();
  }

  public deletePlayer(id: string): void {
    this.players = this.players.filter((p) => p.id !== id);
    this.persistCatalogLocally();
    this.notify();
  }

  public bulkImportPlayers(newPlayers: Player[]): { imported: number; duplicates: number } {
    let imported = 0;
    let duplicates = 0;
    for (const np of newPlayers) {
      const exists = this.players.some(
        (p) => p.id === np.id || p.fullName.toLowerCase() === np.fullName.toLowerCase()
      );
      if (exists) {
        duplicates++;
      } else {
        this.players.push(np);
        imported++;
      }
    }
    if (imported > 0) {
      this.persistCatalogLocally();
      this.notify();
    }
    return { imported, duplicates };
  }

  // --- COMPETITIONS ---
  public getCompetitions(): Competition[] {
    return [...this.competitions];
  }

  public getCompetitionById(id: string): Competition | undefined {
    return this.competitions.find((c) => c.id === id || c.slug === id);
  }

  public saveCompetition(comp: Competition): void {
    const idx = this.competitions.findIndex((c) => c.id === comp.id);
    if (idx >= 0) {
      this.competitions[idx] = comp;
    } else {
      this.competitions.push(comp);
    }
    this.persistCatalogLocally();
    this.notify();
  }

  // --- TEAMS / FRANCHISES ---
  public getTeams(): TeamEntity[] {
    return [...this.teams];
  }

  public getTeamById(id: string): TeamEntity | undefined {
    return this.teams.find((t) => t.id === id || t.code.toLowerCase() === id.toLowerCase());
  }

  public saveTeam(team: TeamEntity): void {
    const idx = this.teams.findIndex((t) => t.id === team.id);
    if (idx >= 0) {
      this.teams[idx] = team;
    } else {
      this.teams.push(team);
    }
    this.persistCatalogLocally();
    this.notify();
  }

  // --- SQUADS ---
  public getSquads(): SquadMembership[] {
    return [...this.squads];
  }

  public getSquad(teamId: string, season: string, competitionId?: string): SquadMembership | undefined {
    return this.squads.find((s) => {
      const matchTeam = s.teamId === teamId;
      const matchSeason = s.season === season || season === 'All-Time';
      const matchComp = competitionId ? s.competitionId === competitionId : true;
      return matchTeam && matchSeason && matchComp;
    });
  }

  public saveSquad(squad: SquadMembership): void {
    const idx = this.squads.findIndex((s) => s.id === squad.id);
    if (idx >= 0) {
      this.squads[idx] = squad;
    } else {
      this.squads.push(squad);
    }
    this.persistCatalogLocally();
    this.notify();
  }

  // --- CUSTOM POOLS ---
  public getCustomPools(): CustomPool[] {
    return [...this.customPools];
  }

  public getCustomPoolById(id: string): CustomPool | undefined {
    return this.customPools.find((p) => p.id === id);
  }

  public saveCustomPool(pool: CustomPool): void {
    const idx = this.customPools.findIndex((p) => p.id === pool.id);
    if (idx >= 0) {
      this.customPools[idx] = pool;
    } else {
      this.customPools.push(pool);
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOM_POOLS, JSON.stringify(this.customPools));
    this.notify();
  }

  public deleteCustomPool(id: string): void {
    this.customPools = this.customPools.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_POOLS, JSON.stringify(this.customPools));
    this.notify();
  }

  public addPlayerToPool(poolId: string, playerId: string): void {
    const pool = this.customPools.find((p) => p.id === poolId);
    if (pool && !pool.playerIds.includes(playerId)) {
      pool.playerIds.push(playerId);
      pool.updatedAt = new Date().toISOString();
      this.saveCustomPool(pool);
    }
  }

  public removePlayerFromPool(poolId: string, playerId: string): void {
    const pool = this.customPools.find((p) => p.id === poolId);
    if (pool) {
      pool.playerIds = pool.playerIds.filter((id) => id !== playerId);
      pool.updatedAt = new Date().toISOString();
      this.saveCustomPool(pool);
    }
  }

  // --- USER TEAMS / PLAYING XIs ---
  public getUserTeams(): UserTeam[] {
    return [...this.userTeams];
  }

  public getUserTeamById(id: string): UserTeam | undefined {
    return this.userTeams.find((t) => t.id === id);
  }

  public saveUserTeam(team: UserTeam): void {
    const idx = this.userTeams.findIndex((t) => t.id === team.id);
    if (idx >= 0) {
      this.userTeams[idx] = { ...team, updatedAt: new Date().toISOString() };
    } else {
      this.userTeams.unshift({ ...team, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEYS.USER_TEAMS, JSON.stringify(this.userTeams));
    this.notify();
  }

  public deleteUserTeam(id: string): void {
    this.userTeams = this.userTeams.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.USER_TEAMS, JSON.stringify(this.userTeams));
    this.notify();
  }

  public duplicateUserTeam(id: string): UserTeam | null {
    const original = this.getUserTeamById(id);
    if (!original) return null;

    const copy: UserTeam = {
      ...JSON.parse(JSON.stringify(original)),
      id: `team-user-${Date.now()}`,
      title: `${original.title} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likesCount: 0,
      bookmarksCount: 0,
      isPublic: false,
    };
    this.saveUserTeam(copy);
    return copy;
  }

  // --- LIKES & BOOKMARKS ---
  public isTeamLiked(teamId: string): boolean {
    return this.userLikes.has(teamId);
  }

  public toggleTeamLike(teamId: string): boolean {
    const team = this.userTeams.find((t) => t.id === teamId);
    if (!team) return false;

    if (this.userLikes.has(teamId)) {
      this.userLikes.delete(teamId);
      team.likesCount = Math.max(0, (team.likesCount || 0) - 1);
    } else {
      this.userLikes.add(teamId);
      team.likesCount = (team.likesCount || 0) + 1;
    }
    localStorage.setItem(STORAGE_KEYS.USER_LIKES, JSON.stringify([...this.userLikes]));
    localStorage.setItem(STORAGE_KEYS.USER_TEAMS, JSON.stringify(this.userTeams));
    this.notify();
    return this.userLikes.has(teamId);
  }

  public isTeamBookmarked(teamId: string): boolean {
    return this.userBookmarks.has(teamId);
  }

  public toggleTeamBookmark(teamId: string): boolean {
    const team = this.userTeams.find((t) => t.id === teamId);
    if (!team) return false;

    if (this.userBookmarks.has(teamId)) {
      this.userBookmarks.delete(teamId);
      team.bookmarksCount = Math.max(0, (team.bookmarksCount || 0) - 1);
    } else {
      this.userBookmarks.add(teamId);
      team.bookmarksCount = (team.bookmarksCount || 0) + 1;
    }
    localStorage.setItem(STORAGE_KEYS.USER_BOOKMARKS, JSON.stringify([...this.userBookmarks]));
    localStorage.setItem(STORAGE_KEYS.USER_TEAMS, JSON.stringify(this.userTeams));
    this.notify();
    return this.userBookmarks.has(teamId);
  }

  public clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.PLAYERS);
    localStorage.removeItem(STORAGE_KEYS.COMPETITIONS);
    localStorage.removeItem(STORAGE_KEYS.TEAMS);
    localStorage.removeItem(STORAGE_KEYS.SQUADS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_POOLS);
    localStorage.removeItem(STORAGE_KEYS.USER_TEAMS);
    localStorage.removeItem(STORAGE_KEYS.USER_LIKES);
    localStorage.removeItem(STORAGE_KEYS.USER_BOOKMARKS);
    this.players = [];
    this.competitions = [];
    this.teams = [];
    this.squads = [];
    this.customPools = [];
    this.userTeams = [];
    this.userLikes = new Set();
    this.userBookmarks = new Set();
    this.persistCatalogLocally();
    this.notify();
  }

  // Supabase migration script generator
  public generateSupabaseSQL(): string {
    return `-- ==============================================================================
-- XI ARENA – SUPABASE POSTGRESQL PRODUCTION SCHEMA
-- Fully Normalized Tables, Relationships, Indexes & RLS Policies
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  favorite_team_id TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. COMPETITIONS
CREATE TABLE IF NOT EXISTS public.competitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  competition_type TEXT NOT NULL,
  format TEXT NOT NULL,
  country TEXT NOT NULL,
  current_season TEXT NOT NULL,
  seasons TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. COMPETITION RULES
CREATE TABLE IF NOT EXISTS public.competition_rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  competition_id TEXT REFERENCES public.competitions(id) ON DELETE CASCADE,
  max_overseas INT NOT NULL DEFAULT 4,
  exact_players_count INT NOT NULL DEFAULT 11,
  min_wicketkeepers INT NOT NULL DEFAULT 1,
  max_wicketkeepers INT NOT NULL DEFAULT 3,
  min_bowlers_or_all_rounders INT NOT NULL DEFAULT 5,
  allow_impact_player BOOLEAN NOT NULL DEFAULT true,
  max_substitutes INT NOT NULL DEFAULT 5,
  require_captain BOOLEAN NOT NULL DEFAULT true,
  require_vice_captain BOOLEAN NOT NULL DEFAULT true
);

-- 4. TEAMS / FRANCHISES
CREATE TABLE IF NOT EXISTS public.teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  code TEXT NOT NULL,
  competition_id TEXT REFERENCES public.competitions(id) ON DELETE SET NULL,
  team_type TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#20C878',
  secondary_color TEXT NOT NULL DEFAULT '#181F29',
  home_ground TEXT,
  established_year INT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. PLAYERS
CREATE TABLE IF NOT EXISTS public.players (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  country TEXT NOT NULL,
  nationality TEXT NOT NULL,
  dob DATE,
  image_url TEXT,
  primary_role TEXT NOT NULL,
  secondary_roles TEXT[] DEFAULT '{}',
  specialization TEXT NOT NULL,
  batting_hand TEXT NOT NULL,
  bowling_style TEXT NOT NULL,
  career_status TEXT NOT NULL DEFAULT 'Active',
  bio TEXT,
  overall_rating INT NOT NULL DEFAULT 80,
  t20_rating INT NOT NULL DEFAULT 80,
  odi_rating INT NOT NULL DEFAULT 80,
  test_rating INT NOT NULL DEFAULT 80,
  is_overseas_ipl BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. PLAYER ATTRIBUTES
CREATE TABLE IF NOT EXISTS public.player_attributes (
  player_id TEXT REFERENCES public.players(id) ON DELETE CASCADE PRIMARY KEY,
  technique INT DEFAULT 75,
  power_hitting INT DEFAULT 75,
  timing INT DEFAULT 75,
  shot_selection INT DEFAULT 75,
  strike_rotation INT DEFAULT 75,
  against_pace INT DEFAULT 75,
  against_spin INT DEFAULT 75,
  finishing INT DEFAULT 75,
  consistency INT DEFAULT 75,
  pace INT DEFAULT 50,
  swing INT DEFAULT 50,
  seam INT DEFAULT 50,
  spin INT DEFAULT 50,
  accuracy INT DEFAULT 70,
  variations INT DEFAULT 70,
  death_bowling INT DEFAULT 65,
  powerplay_bowling INT DEFAULT 65,
  control INT DEFAULT 70,
  catching INT DEFAULT 75,
  ground_fielding INT DEFAULT 75,
  throwing INT DEFAULT 75,
  reflexes INT DEFAULT 75,
  agility INT DEFAULT 75,
  fitness INT DEFAULT 80,
  experience INT DEFAULT 80,
  leadership INT DEFAULT 75,
  pressure_handling INT DEFAULT 80,
  versatility INT DEFAULT 75
);

-- 7. SQUADS (Season-specific)
CREATE TABLE IF NOT EXISTS public.squads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id TEXT REFERENCES public.teams(id) ON DELETE CASCADE,
  competition_id TEXT REFERENCES public.competitions(id) ON DELETE CASCADE,
  season TEXT NOT NULL,
  player_ids TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. CUSTOM POOLS
CREATE TABLE IF NOT EXISTS public.custom_pools (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES auth.users ON DELETE CASCADE,
  creator_name TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  player_ids TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  likes_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. USER TEAMS (Playing XIs)
CREATE TABLE IF NOT EXISTS public.user_teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  mode TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'T20',
  competition_id TEXT REFERENCES public.competitions(id) ON DELETE SET NULL,
  season TEXT,
  franchise_id TEXT REFERENCES public.teams(id) ON DELETE SET NULL,
  custom_pool_id UUID REFERENCES public.custom_pools(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  author_id UUID REFERENCES auth.users ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  likes_count INT NOT NULL DEFAULT 0,
  bookmarks_count INT NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  tactical_notes TEXT,
  impact_player_id TEXT,
  substitute_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. USER TEAM PLAYERS (Ordered Lineup)
CREATE TABLE IF NOT EXISTS public.user_team_players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES public.user_teams(id) ON DELETE CASCADE,
  player_id TEXT REFERENCES public.players(id) ON DELETE CASCADE,
  batting_order INT NOT NULL,
  is_captain BOOLEAN NOT NULL DEFAULT false,
  is_vice_captain BOOLEAN NOT NULL DEFAULT false,
  is_wicketkeeper BOOLEAN NOT NULL DEFAULT false,
  fielding_position TEXT
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_team_players ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, owner update
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Custom Pools: Public read if is_public = true, owner full access
CREATE POLICY "Public pools are viewable by everyone" ON public.custom_pools FOR SELECT USING (is_public OR auth.uid() = creator_id);
CREATE POLICY "Users can insert own pool" ON public.custom_pools FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update own pool" ON public.custom_pools FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Users can delete own pool" ON public.custom_pools FOR DELETE USING (auth.uid() = creator_id);

-- User Teams: Public read if is_public = true, owner full access
CREATE POLICY "Public teams are viewable by everyone" ON public.user_teams FOR SELECT USING (is_public OR auth.uid() = author_id);
CREATE POLICY "Users can insert own team" ON public.user_teams FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own team" ON public.user_teams FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own team" ON public.user_teams FOR DELETE USING (auth.uid() = author_id);

-- Shared catalog used by the app. Public clients can read; only admins can write.
CREATE OR REPLACE FUNCTION public.is_xi_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(auth.jwt() -> 'app_metadata' ->> 'role' = 'admin', false);
$$;

CREATE TABLE IF NOT EXISTS public.app_catalog (
  id TEXT PRIMARY KEY CHECK (id = 'default'),
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.app_catalog ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.app_catalog TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.app_catalog TO authenticated;

DROP POLICY IF EXISTS "Shared catalog is publicly readable" ON public.app_catalog;
CREATE POLICY "Shared catalog is publicly readable"
  ON public.app_catalog FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage shared catalog" ON public.app_catalog;
CREATE POLICY "Admins manage shared catalog"
  ON public.app_catalog FOR ALL TO authenticated
  USING (public.is_xi_admin())
  WITH CHECK (public.is_xi_admin());

-- Protect the normalized catalog tables if they are used directly later.
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'competitions', 'competition_rules', 'teams', 'players', 'player_attributes', 'squads'
  ] LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated', table_name);
    EXECUTE format('GRANT INSERT, UPDATE, DELETE ON public.%I TO authenticated', table_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Public read ' || table_name, table_name);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT USING (true)', 'Public read ' || table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Admin manage ' || table_name, table_name);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.is_xi_admin()) WITH CHECK (public.is_xi_admin())',
      'Admin manage ' || table_name,
      table_name
    );
  END LOOP;
END;
$$;

-- Public player image URLs; uploads and deletion are restricted to admins.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('player-images', 'player-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Player images are publicly readable" ON storage.objects;
CREATE POLICY "Player images are publicly readable"
  ON storage.objects FOR SELECT USING (bucket_id = 'player-images');
DROP POLICY IF EXISTS "Admins upload player images" ON storage.objects;
CREATE POLICY "Admins upload player images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'player-images' AND public.is_xi_admin());
DROP POLICY IF EXISTS "Admins update player images" ON storage.objects;
CREATE POLICY "Admins update player images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'player-images' AND public.is_xi_admin())
  WITH CHECK (bucket_id = 'player-images' AND public.is_xi_admin());
DROP POLICY IF EXISTS "Admins delete player images" ON storage.objects;
CREATE POLICY "Admins delete player images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'player-images' AND public.is_xi_admin());
`;
  }
}

export const storageService = new StorageService();
