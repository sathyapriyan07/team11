import type { PlayerStats } from '../types/cricket';

export type CricketApiStatsFormat = 'T20' | 'ODI' | 'TEST';
export type CricketApiStatsPreview = Partial<Record<CricketApiStatsFormat, Partial<PlayerStats>>>;

export interface CricketApiPlayer {
  name: string;
  country: string;
  imageUrl: string;
  role: string;
  stats: CricketApiStatsPreview;
}

interface ApiFormatStats {
  matches?: unknown;
  runs?: unknown;
  highest_score?: unknown;
  average?: unknown;
  strike_rate?: unknown;
  hundreds?: unknown;
  fifties?: unknown;
  wickets?: unknown;
  best_bowling_innings?: unknown;
  economy?: unknown;
  five_wickets?: unknown;
}

interface ApiPlayerResponse {
  name?: unknown;
  country?: unknown;
  image?: unknown;
  role?: unknown;
  batting_stats?: Record<string, ApiFormatStats>;
  bowling_stats?: Record<string, ApiFormatStats>;
  error?: unknown;
}

type NumericStatsField =
  | 'matches'
  | 'runs'
  | 'battingAverage'
  | 'strikeRate'
  | 'centuries'
  | 'fifties'
  | 'wickets'
  | 'economy'
  | 'fiveWickets';

const API_BASE_URL = import.meta.env.VITE_CRICKET_API_BASE_URL?.trim().replace(/\/+$/, '');

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseNumber(value: unknown): number | undefined {
  if (typeof value !== 'string' && typeof value !== 'number') return undefined;
  const text = String(value).replace(/,/g, '').trim();
  if (!text || ['-', '—', '–', 'n/a'].includes(text.toLowerCase())) return undefined;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const text = value.trim();
  return text && !['-', '—', '–', 'n/a'].includes(text.toLowerCase()) ? text : undefined;
}

function isApiFormatStats(value: unknown): value is ApiFormatStats {
  return isRecord(value);
}

function formatStats(
  batting: ApiFormatStats | undefined,
  bowling: ApiFormatStats | undefined,
): Partial<PlayerStats> {
  const stats: Partial<PlayerStats> = {};
  const numericFields: Array<[NumericStatsField, unknown]> = [
    ['matches', batting?.matches],
    ['runs', batting?.runs],
    ['battingAverage', batting?.average],
    ['strikeRate', batting?.strike_rate],
    ['centuries', batting?.hundreds],
    ['fifties', batting?.fifties],
    ['wickets', bowling?.wickets],
    ['economy', bowling?.economy],
    ['fiveWickets', bowling?.five_wickets],
  ];

  for (const [field, value] of numericFields) {
    const parsed = parseNumber(value);
    if (parsed !== undefined) stats[field] = parsed;
  }

  const highestScore = parseText(batting?.highest_score);
  if (highestScore) stats.highestScore = highestScore;

  const bestBowling = parseText(bowling?.best_bowling_innings);
  if (bestBowling) stats.bestBowling = bestBowling;

  return stats;
}

function readFormatStats(value: unknown): Record<string, ApiFormatStats> {
  if (!isRecord(value)) return {};
  const formats: Record<string, ApiFormatStats> = {};
  for (const [format, stats] of Object.entries(value)) {
    if (isApiFormatStats(stats)) formats[format.toLowerCase()] = stats;
  }
  return formats;
}

export async function getCricketApiPlayer(playerName: string): Promise<CricketApiPlayer> {
  if (!API_BASE_URL) {
    throw new Error('Set VITE_CRICKET_API_BASE_URL to your deployed Cricket-API service URL before importing stats.');
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/players/${encodeURIComponent(playerName)}`, {
      headers: { Accept: 'application/json' },
    });
  } catch {
    throw new Error('Could not reach the Cricket API. Check its URL and ensure the service allows browser CORS requests.');
  }

  if (!response.ok) {
    throw new Error(`Cricket API request failed (${response.status}). Check the player name and try again.`);
  }

  const payload: unknown = await response.json();
  if (!isRecord(payload)) {
    throw new Error('The Cricket API returned an unexpected response.');
  }

  const data = payload as ApiPlayerResponse;
  if (typeof data.error === 'string') {
    throw new Error(`Cricket API: ${data.error}`);
  }

  const name = parseText(data.name);
  if (!name) {
    throw new Error('The Cricket API response did not include a player name.');
  }

  const batting = readFormatStats(data.batting_stats);
  const bowling = readFormatStats(data.bowling_stats);
  const stats: CricketApiStatsPreview = {};
  const formats: Array<[CricketApiStatsFormat, string[]]> = [
    ['TEST', ['test']],
    ['ODI', ['odi']],
    ['T20', ['t20', 't20i']],
  ];

  for (const [format, aliases] of formats) {
    const battingStats = aliases.map((alias) => batting[alias]).find(Boolean);
    const bowlingStats = aliases.map((alias) => bowling[alias]).find(Boolean);
    const formatPreview = formatStats(battingStats, bowlingStats);
    if (Object.keys(formatPreview).length > 0) stats[format] = formatPreview;
  }

  if (Object.keys(stats).length === 0) {
    throw new Error('The Cricket API returned no recognizable Test, ODI, or T20 statistics for this player.');
  }

  return {
    name,
    country: parseText(data.country) ?? '',
    imageUrl: parseText(data.image) ?? '',
    role: parseText(data.role) ?? '',
    stats,
  };
}
