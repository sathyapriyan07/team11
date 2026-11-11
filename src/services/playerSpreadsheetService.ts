import type {
  BattingHand,
  BowlingStyle,
  CricketFormat,
  Player,
  PlayerAttributes,
  PlayerRole,
  PlayerSpecialization,
  PlayerStats,
} from '../types/cricket';

const EMPTY_STATS: PlayerStats = {
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

const ATTRIBUTE_KEYS: Array<keyof PlayerAttributes> = [
  'technique', 'powerHitting', 'timing', 'shotSelection', 'strikeRotation',
  'againstPace', 'againstSpin', 'finishing', 'consistency', 'pace', 'swing',
  'seam', 'spin', 'accuracy', 'variations', 'deathBowling', 'powerplayBowling',
  'control', 'catching', 'groundFielding', 'throwing', 'reflexes', 'agility',
  'wkReflexes', 'wkCatching', 'wkStumping', 'wkGlovework', 'wkPositioning',
  'fitness', 'experience', 'leadership', 'pressureHandling', 'versatility',
];

const SPECIALIZATIONS: PlayerSpecialization[] = [
  'Opening batter', 'Top-order batter', 'Middle-order batter', 'Finisher',
  'Pace bowler', 'Swing bowler', 'Fast-medium bowler', 'Leg-spinner',
  'Off-spinner', 'Left-arm orthodox', 'Wrist spinner',
];

const ROLES: PlayerRole[] = ['Wicketkeeper', 'Batter', 'All-rounder', 'Bowler'];
const BATTING_HANDS: BattingHand[] = ['Right-hand bat', 'Left-hand bat'];
const BOWLING_STYLES: BowlingStyle[] = [
  'Right-arm fast', 'Right-arm fast-medium', 'Right-arm medium', 'Left-arm fast',
  'Left-arm fast-medium', 'Right-arm off-break', 'Right-arm leg-break',
  'Left-arm orthodox', 'Left-arm wrist-spin', 'None',
];
const FORMATS: CricketFormat[] = ['T20', 'ODI', 'TEST'];
type NumericStatsKey = Exclude<keyof PlayerStats, 'highestScore' | 'bestBowling'>;

const NUMERIC_STATS: NumericStatsKey[] = [
  'matches', 'innings', 'runs', 'battingAverage', 'strikeRate', 'centuries',
  'fifties', 'wickets', 'bowlingAverage', 'economy', 'fiveWickets', 'catches',
  'stumpings',
];

export const PLAYER_SPREADSHEET_HEADERS = [
  'fullName', 'displayName', 'country', 'nationality', 'dob', 'imageUrl',
  'primaryRole', 'secondaryRoles', 'specialization', 'battingHand',
  'bowlingStyle', 'careerStatus', 'bio', 'overallRating', 't20Rating',
  'odiRating', 'testRating', 'teamsPlayed', 'isOverseasIPL',
  ...ATTRIBUTE_KEYS,
  ...FORMATS.flatMap((format) => [
    `${format} Matches`, `${format} Innings`, `${format} Runs`,
    `${format} Highest Score`, `${format} Batting Average`,
    `${format} Strike Rate`, `${format} Centuries`, `${format} Fifties`,
    `${format} Wickets`, `${format} Bowling Average`, `${format} Economy`,
    `${format} Best Bowling`, `${format} Five Wickets`,
    `${format} Catches`, `${format} Stumpings`,
  ]),
];

export interface PlayerSpreadsheetParseResult {
  players: Player[];
  rowErrors: string[];
}

function normalizeHeader(value: unknown): string {
  return String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function cellText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  return String(value).trim();
}

function readCell(row: Map<string, unknown>, ...headers: string[]): string {
  for (const header of headers) {
    const value = cellText(row.get(normalizeHeader(header)));
    if (value) return value;
  }
  return '';
}

function parseNumber(value: string, field: string, rowNumber: number, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value.replace(/,/g, ''));
  if (!Number.isFinite(parsed)) throw new Error(`row ${rowNumber}: ${field} must be a number`);
  return parsed;
}

function parseRating(value: string, field: string, rowNumber: number, fallback: number): number {
  const parsed = parseNumber(value, field, rowNumber, fallback);
  if (parsed < 0 || parsed > 100) throw new Error(`row ${rowNumber}: ${field} must be between 0 and 100`);
  return parsed;
}

function parseStatNumber(value: string, field: string, rowNumber: number): number {
  const parsed = parseNumber(value, field, rowNumber, 0);
  if (parsed < 0) throw new Error(`row ${rowNumber}: ${field} cannot be negative`);
  return parsed;
}

function parseRole(value: string, rowNumber: number): PlayerRole {
  if (!value) return 'Batter';
  const normalized = value.toLowerCase().replace(/[^a-z]/g, '');
  const aliases: Record<string, PlayerRole> = {
    wicketkeeper: 'Wicketkeeper',
    keeper: 'Wicketkeeper',
    wk: 'Wicketkeeper',
    batter: 'Batter',
    batsman: 'Batter',
    batswoman: 'Batter',
    allrounder: 'All-rounder',
    bowler: 'Bowler',
  };
  const role = aliases[normalized];
  if (!role) throw new Error(`row ${rowNumber}: primaryRole must be Wicketkeeper, Batter, All-rounder, or Bowler`);
  return role;
}

function parseEnum<T extends string>(
  value: string,
  values: T[],
  field: string,
  rowNumber: number,
  fallback: T,
): T {
  if (!value) return fallback;
  const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, '');
  const match = values.find((item) => item.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized);
  if (!match) throw new Error(`row ${rowNumber}: invalid ${field} value "${value}"`);
  return match;
}

function makeSlug(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function parsePlayer(row: Map<string, unknown>, rowNumber: number): Player {
  const fullName = readCell(row, 'fullName', 'playerName', 'name');
  const country = readCell(row, 'country', 'nationality');
  if (!fullName) throw new Error(`row ${rowNumber}: fullName is required`);
  if (!country) throw new Error(`row ${rowNumber}: country is required`);

  const primaryRole = parseRole(readCell(row, 'primaryRole', 'role'), rowNumber);
  const secondaryRoles = readCell(row, 'secondaryRoles')
    .split(/[,;|]/)
    .map((role) => role.trim())
    .filter(Boolean)
    .map((role) => parseRole(role, rowNumber));
  const defaultSpecialization: PlayerSpecialization = primaryRole === 'Bowler'
    ? 'Pace bowler'
    : primaryRole === 'All-rounder'
      ? 'Finisher'
      : primaryRole === 'Wicketkeeper'
        ? 'Middle-order batter'
        : 'Top-order batter';
  const specialization = parseEnum(
    readCell(row, 'specialization'),
    SPECIALIZATIONS,
    'specialization',
    rowNumber,
    defaultSpecialization,
  );
  const battingHand = parseEnum(
    readCell(row, 'battingHand'),
    BATTING_HANDS,
    'battingHand',
    rowNumber,
    'Right-hand bat',
  );
  const bowlingStyle = parseEnum(
    readCell(row, 'bowlingStyle'),
    BOWLING_STYLES,
    'bowlingStyle',
    rowNumber,
    'None',
  );
  const statusValue = readCell(row, 'careerStatus', 'status');
  const careerStatus = parseEnum(
    statusValue,
    ['Active', 'Retired', 'Legend'],
    'careerStatus',
    rowNumber,
    'Active',
  );

  const attributes: PlayerAttributes = {
    technique: 50, powerHitting: 50, timing: 50, shotSelection: 50, strikeRotation: 50,
    againstPace: 50, againstSpin: 50, finishing: 50, consistency: 50, pace: 50,
    swing: 50, seam: 50, spin: 50, accuracy: 50, variations: 50, deathBowling: 50,
    powerplayBowling: 50, control: 50, catching: 50, groundFielding: 50, throwing: 50,
    reflexes: 50, agility: 50, wkReflexes: 50, wkCatching: 50, wkStumping: 50,
    wkGlovework: 50, wkPositioning: 50, fitness: 50, experience: 50, leadership: 50,
    pressureHandling: 50, versatility: 50,
  };
  for (const key of ATTRIBUTE_KEYS) {
    const value = readCell(row, key, `attributes.${key}`);
    if (value) attributes[key] = parseRating(value, key, rowNumber, 50);
  }

  const stats: Player['stats'] = {
    T20: { ...EMPTY_STATS },
    ODI: { ...EMPTY_STATS },
    TEST: { ...EMPTY_STATS },
  };
  for (const format of FORMATS) {
    for (const field of NUMERIC_STATS) {
      const value = readCell(row, `${format} ${field}`, `${format}.${field}`, `stats.${format}.${field}`);
      if (value) stats[format][field] = parseStatNumber(value, `${format} ${field}`, rowNumber);
    }
    const highestScore = readCell(row, `${format} Highest Score`, `${format}.highestScore`, `stats.${format}.highestScore`);
    if (highestScore) stats[format].highestScore = highestScore;
    const bestBowling = readCell(row, `${format} Best Bowling`, `${format}.bestBowling`, `stats.${format}.bestBowling`);
    if (bestBowling) stats[format].bestBowling = bestBowling;
  }

  const overallRating = parseRating(readCell(row, 'overallRating'), 'overallRating', rowNumber, 50);
  const t20Rating = parseRating(readCell(row, 't20Rating', 'formatRatings.T20'), 't20Rating', rowNumber, overallRating);
  const odiRating = parseRating(readCell(row, 'odiRating', 'formatRatings.ODI'), 'odiRating', rowNumber, overallRating);
  const testRating = parseRating(readCell(row, 'testRating', 'formatRatings.TEST'), 'testRating', rowNumber, overallRating);
  const overseasValue = readCell(row, 'isOverseasIPL').toLowerCase();
  if (overseasValue && !['true', 'yes', '1', 'false', 'no', '0'].includes(overseasValue)) {
    throw new Error(`row ${rowNumber}: isOverseasIPL must be true or false`);
  }
  const isOverseasIPL = ['true', 'yes', '1'].includes(overseasValue);
  const teamsPlayed = readCell(row, 'teamsPlayed')
    .split(/[,;|]/)
    .map((teamId) => teamId.trim())
    .filter(Boolean);

  return {
    id: `p-${makeSlug(fullName)}-${crypto.randomUUID().slice(0, 8)}`,
    fullName,
    displayName: readCell(row, 'displayName') || fullName,
    country,
    nationality: readCell(row, 'nationality') || country,
    dob: readCell(row, 'dob', 'dateOfBirth') || undefined,
    imageUrl: readCell(row, 'imageUrl', 'image', 'photo'),
    primaryRole,
    secondaryRoles,
    specialization,
    battingHand,
    bowlingStyle,
    careerStatus,
    bio: readCell(row, 'bio'),
    overallRating,
    formatRatings: { T20: t20Rating, ODI: odiRating, TEST: testRating },
    attributes,
    stats,
    teamsPlayed,
    isOverseasIPL,
  };
}

export function parsePlayerSpreadsheetRows(rows: unknown[][]): PlayerSpreadsheetParseResult {
  if (rows.length < 2) throw new Error('The spreadsheet must contain a header row and at least one player row.');
  if (rows.length > 5001) throw new Error('The spreadsheet can contain at most 5,000 player rows.');

  const headers = rows[0].map(normalizeHeader);
  if (!headers.includes('fullname') && !headers.includes('playername') && !headers.includes('name')) {
    throw new Error('The spreadsheet needs a fullName, playerName, or name column.');
  }
  if (!headers.includes('country') && !headers.includes('nationality')) {
    throw new Error('The spreadsheet needs a country or nationality column.');
  }

  const players: Player[] = [];
  const rowErrors: string[] = [];
  rows.slice(1).forEach((cells, index) => {
    if (!cells.some((cell) => cellText(cell))) return;
    const row = new Map(headers.map((header, cellIndex) => [header, cells[cellIndex]]));
    try {
      players.push(parsePlayer(row, index + 2));
    } catch (error) {
      rowErrors.push(error instanceof Error ? error.message : `row ${index + 2}: invalid data`);
    }
  });

  return { players, rowErrors };
}

export function parseCsvSpreadsheet(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  const content = text.replace(/^\uFEFF/, '');

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    if (character === '"') {
      if (quoted && content[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && content[index + 1] === '\n') index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += character;
    }
  }

  if (quoted) throw new Error('The CSV file contains an unclosed quoted field.');
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

export async function downloadPlayerSpreadsheetTemplate(): Promise<void> {
  const { default: writeXlsxFile } = await import('write-excel-file/browser');
  const sample: Record<string, string | number> = {
    fullName: 'Sample Player',
    displayName: 'Sample Player',
    country: 'India',
    nationality: 'Indian',
    primaryRole: 'Batter',
    secondaryRoles: '',
    specialization: 'Top-order batter',
    battingHand: 'Right-hand bat',
    bowlingStyle: 'None',
    careerStatus: 'Active',
    overallRating: 50,
    t20Rating: 50,
    odiRating: 50,
    testRating: 50,
    isOverseasIPL: 'false',
  };
  for (const format of FORMATS) {
    for (const field of NUMERIC_STATS) sample[`${format} ${field}`] = 0;
    sample[`${format} Highest Score`] = '0';
    sample[`${format} Best Bowling`] = '0/0';
  }
  const rows = [
    PLAYER_SPREADSHEET_HEADERS.map((header) => ({
      value: header,
      fontWeight: 'bold' as const,
      backgroundColor: '#20C878',
      wrap: true,
    })),
    PLAYER_SPREADSHEET_HEADERS.map((header) => sample[header] ?? ''),
  ];
  const workbook = await writeXlsxFile(rows, {
    sheet: 'Players',
    columns: PLAYER_SPREADSHEET_HEADERS.map(() => ({ width: 20 })),
    showGridLines: false,
  });
  await workbook.toFile('player-import-template.xlsx');
}
