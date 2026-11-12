export type CricketFormat = 'T20' | 'ODI' | 'TEST';

export type PlayerRole = 'Wicketkeeper' | 'Batter' | 'All-rounder' | 'Bowler';

export type PlayerSpecialization =
  | 'Opening batter'
  | 'Top-order batter'
  | 'Middle-order batter'
  | 'Finisher'
  | 'Pace bowler'
  | 'Swing bowler'
  | 'Fast-medium bowler'
  | 'Leg-spinner'
  | 'Off-spinner'
  | 'Left-arm orthodox'
  | 'Wrist spinner';

export type BattingHand = 'Right-hand bat' | 'Left-hand bat';

export type BowlingStyle =
  | 'Right-arm fast'
  | 'Right-arm fast-medium'
  | 'Right-arm medium'
  | 'Left-arm fast'
  | 'Left-arm fast-medium'
  | 'Right-arm off-break'
  | 'Right-arm leg-break'
  | 'Left-arm orthodox'
  | 'Left-arm wrist-spin'
  | 'None';

export interface PlayerAttributes {
  // Batting (1-100)
  technique: number;
  powerHitting: number;
  timing: number;
  shotSelection: number;
  strikeRotation: number;
  againstPace: number;
  againstSpin: number;
  finishing: number;
  consistency: number;

  // Bowling (1-100)
  pace: number;
  swing: number;
  seam: number;
  spin: number;
  accuracy: number;
  variations: number;
  deathBowling: number;
  powerplayBowling: number;
  control: number;

  // Fielding (1-100)
  catching: number;
  groundFielding: number;
  throwing: number;
  reflexes: number;
  agility: number;

  // Wicketkeeping (1-100)
  wkReflexes?: number;
  wkCatching?: number;
  wkStumping?: number;
  wkGlovework?: number;
  wkPositioning?: number;

  // General (1-100)
  fitness: number;
  experience: number;
  leadership: number;
  pressureHandling: number;
  versatility: number;
}

export interface PlayerStats {
  matches: number;
  innings: number;
  runs: number;
  highestScore: string;
  battingAverage: number;
  strikeRate: number;
  centuries: number;
  fifties: number;
  wickets: number;
  bowlingAverage: number;
  economy: number;
  bestBowling: string;
  fiveWickets: number;
  catches: number;
  stumpings: number;
}

export interface Player {
  id: string;
  createdAt?: string;
  fullName: string;
  displayName: string;
  country: string;
  nationality: string;
  dob?: string;
  imageUrl: string;
  countryFlagUrl?: string;
  primaryRole: PlayerRole;
  secondaryRoles: PlayerRole[];
  specialization: PlayerSpecialization;
  battingHand: BattingHand;
  bowlingStyle: BowlingStyle;
  careerStatus: 'Active' | 'Retired' | 'Legend';
  bio: string;
  overallRating: number;
  formatRatings: {
    T20: number;
    ODI: number;
    TEST: number;
  };
  attributes: PlayerAttributes;
  stats: {
    T20: PlayerStats;
    ODI: PlayerStats;
    TEST: PlayerStats;
    IPL?: PlayerStats;
  };
  teamsPlayed: string[]; // franchise/team IDs
  teamYears?: Record<string, string>;
  isOverseasIPL?: boolean; // convenient tag for IPL rule checking
}

export interface Competition {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  logo: string;
  competitionType: 'Franchise' | 'International' | 'Domestic';
  format: CricketFormat;
  country: string;
  seasons: string[];
  currentSeason: string;
  description: string;
  rules: CompetitionRules;
}

export interface CompetitionRules {
  maxOverseas: number;
  exactPlayersCount: number;
  minWicketkeepers: number;
  maxWicketkeepers: number;
  minBowlersOrAllRounders: number;
  allowImpactPlayer: boolean;
  maxSubstitutes: number;
  requireCaptain: boolean;
  requireViceCaptain: boolean;
}

export interface TeamEntity {
  id: string;
  name: string;
  shortName: string;
  code: string;
  competitionId: string;
  type: 'Franchise' | 'National' | 'Domestic';
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  homeGround: string;
  championships: number[];
  establishedYear: number;
}

export interface SquadMembership {
  id: string;
  teamId: string;
  season: string;
  competitionId: string;
  playerIds: string[];
}

export interface CustomPool {
  id: string;
  name: string;
  description: string;
  creatorName: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  playerIds: string[];
  tags: string[];
  likesCount: number;
}

export type BuilderMode =
  | 'franchise'
  | 'dream'
  | 'all-time'
  | 'international'
  | 'custom-pool'
  | 'auto';

export type FieldingPosition =
  | 'Wicketkeeper'
  | 'Bowler'
  | 'Slip 1'
  | 'Slip 2'
  | 'Gully'
  | 'Point'
  | 'Cover'
  | 'Extra Cover'
  | 'Mid-off'
  | 'Mid-on'
  | 'Midwicket'
  | 'Square Leg'
  | 'Fine Leg'
  | 'Third Man'
  | 'Long-on'
  | 'Long-off'
  | 'Deep Cover'
  | 'Deep Midwicket'
  | 'Deep Square Leg'
  | 'Short Leg'
  | 'Silly Point';

export interface FieldPlacement {
  playerId: string;
  position: FieldingPosition;
  x: number; // percentage on field (0-100)
  y: number; // percentage on field (0-100)
}

export interface FieldArrangement {
  id: string;
  name: string;
  placements: FieldPlacement[];
}

export interface UserTeamPlayer {
  playerId: string;
  battingOrder: number; // 1 to 11
  isCaptain: boolean;
  isViceCaptain: boolean;
  isWicketkeeper: boolean;
  fieldingPosition?: FieldingPosition;
}

export interface UserTeam {
  id: string;
  title: string;
  description: string;
  mode: BuilderMode;
  competitionId?: string;
  teamId?: string;
  season?: string;
  franchiseId?: string;
  customPoolId?: string;
  format: CricketFormat;
  players: UserTeamPlayer[];
  impactPlayerId?: string;
  substituteIds: string[];
  fieldPlacements?: FieldPlacement[];
  fieldingArrangements?: FieldArrangement[];
  status: 'draft' | 'completed' | 'published';
  authorName: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  bookmarksCount: number;
  isPublic: boolean;
  tags: string[];
  tacticalNotes?: string;
}

export interface ValidationResult {
  isValid: boolean;
  status: 'valid' | 'warning' | 'invalid';
  errors: string[];
  warnings: string[];
  requiredPlayersCount: number;
  minWicketkeepers: number;
  maxWicketkeepers: number;
  requireCaptain: boolean;
  requireViceCaptain: boolean;
  overseasCount: number;
  maxOverseas: number;
  playersCount: number;
  hasCaptain: boolean;
  hasViceCaptain: boolean;
  hasWicketkeeper: boolean;
  wicketkeepersCount: number;
  bowlerOptionsCount: number;
}

export interface TeamAnalysis {
  overallRating: number | null;
  battingStrength: number | null;
  bowlingStrength: number | null;
  paceAttackStrength: number | null;
  spinAttackStrength: number | null;
  allRoundStrength: number | null;
  fieldingStrength: number | null;
  wicketkeepingStrength: number | null;
  finishingStrength: number | null;
  battingDepth: number | null;
  openingCombination: number | null;
  middleOrderStability: number | null;
  deathOverBowlingStrength: number | null;
  experienceRating: number | null;
  openingPair: string[];
  leftRightBalance: {
    rightHanders: number;
    leftHanders: number;
  };
  roleDistribution: {
    batters: number;
    wicketkeepers: number;
    allRounders: number;
    bowlers: number;
  };
  bowlingBreakdown: {
    paceBowlers: number;
    spinBowlers: number;
    sixthBowlingOption: boolean;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}
