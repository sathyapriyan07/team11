import type { PlayerStats } from '../types/cricket';

export interface WikipediaSearchResult {
  pageId: number;
  title: string;
  description: string;
}

export interface WikipediaPagePreview {
  title: string;
  extract: string;
  imageUrl: string;
  pageUrl: string;
}

export type ImportedStatsFormat = 'T20' | 'ODI' | 'TEST' | 'IPL';

export type WikipediaStatsPreview = Partial<Record<ImportedStatsFormat, Partial<PlayerStats>>>;

interface WikipediaSearchResponse {
  query?: {
    search?: Array<{ pageid: number; title: string; snippet: string }>;
  };
}

interface WikipediaSummaryResponse {
  title?: string;
  extract?: string;
  thumbnail?: { source?: string };
  content_urls?: { desktop?: { page?: string } };
}

interface WikipediaQuerySummaryResponse {
  query?: {
    pages?: Record<string, {
      title?: string;
      extract?: string;
      thumbnail?: { source?: string };
      fullurl?: string;
    }>;
  };
}

interface WikipediaParseResponse {
  parse?: { text?: string | { '*': string } };
}

const API_URL = 'https://en.wikipedia.org/w/api.php';

async function fetchJson<T>(url: URL): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Wikipedia request failed (${response.status}). Try again in a moment.`);
  }
  return response.json() as Promise<T>;
}

export async function searchWikipedia(query: string): Promise<WikipediaSearchResult[]> {
  const url = new URL(API_URL);
  url.search = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: query,
    srlimit: '8',
    format: 'json',
    origin: '*',
    utf8: '1',
  }).toString();

  const data = await fetchJson<WikipediaSearchResponse>(url);
  return (data.query?.search ?? []).map((item) => ({
    pageId: item.pageid,
    title: item.title,
    description: item.snippet.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&'),
  }));
}

export async function getWikipediaPagePreview(title: string): Promise<WikipediaPagePreview> {
  const url = new URL(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
  let data: WikipediaSummaryResponse;
  try {
    data = await fetchJson<WikipediaSummaryResponse>(url);
  } catch {
    const fallbackUrl = new URL(API_URL);
    fallbackUrl.search = new URLSearchParams({
      action: 'query',
      prop: 'extracts|pageimages|info',
      exintro: '1',
      explaintext: '1',
      piprop: 'thumbnail',
      pithumbsize: '600',
      inprop: 'url',
      titles: title,
      format: 'json',
      origin: '*',
    }).toString();
    const fallback = await fetchJson<WikipediaQuerySummaryResponse>(fallbackUrl);
    const page = Object.values(fallback.query?.pages ?? {})[0];
    if (!page) throw new Error('Wikipedia did not return this article.');
    return {
      title: page.title ?? title,
      extract: page.extract ?? '',
      imageUrl: page.thumbnail?.source ?? '',
      pageUrl: page.fullurl ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`,
    };
  }
  return {
    title: data.title ?? title,
    extract: data.extract ?? '',
    imageUrl: data.thumbnail?.source ?? '',
    pageUrl: data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`,
  };
}

function normalizeText(text: string): string {
  return text.replace(/\[[^\]]*]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function parseNumber(text: string): number | undefined {
  const cleaned = text.replace(/,/g, '').replace(/\*/g, '').trim();
  if (!cleaned || ['—', '-', '–', 'n/a'].includes(cleaned.toLowerCase())) return undefined;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : undefined;
}

function metricForHeader(header: string, context = ''): keyof PlayerStats | undefined {
  const value = normalizeText(header).replace(/\./g, '');
  if (/^(mat|matches)$/.test(value)) return 'matches';
  if (/^(inns|innings)$/.test(value)) return 'innings';
  if (/^(runs|r)$/.test(value)) return 'runs';
  if (/^(hs|high score|highest score)$/.test(value)) return 'highestScore';
  if (/^(sr|strike rate)$/.test(value)) return 'strikeRate';
  if (/^(100|100s|centuries)$/.test(value)) return 'centuries';
  if (/^(50|50s|fifties)$/.test(value)) return 'fifties';
  if (/^(wkts|wickets|wkt)$/.test(value)) return 'wickets';
  if (/^(econ|economy|economy rate)$/.test(value)) return 'economy';
  if (/^(bbi|best bowling)$/.test(value)) return 'bestBowling';
  if (/^(5w|5wickets|five wickets)$/.test(value)) return 'fiveWickets';
  if (/^(ct|catches)$/.test(value)) return 'catches';
  if (/^(st|stumpings)$/.test(value)) return 'stumpings';
  if (/^(ave|avg|average|batting average|bowling average)$/.test(value)) {
    return /bowl/i.test(context) || value === 'bowling average' ? 'bowlingAverage' : 'battingAverage';
  }
  return undefined;
}

function formatForText(text: string): ImportedStatsFormat | undefined {
  const value = normalizeText(text);
  if (/\bipl\b/.test(value)) return 'IPL';
  if (/\bt20i?\b|twenty20/.test(value)) return 'T20';
  if (/\bodi\b|one day international/.test(value)) return 'ODI';
  if (/\btest\b|test cricket/.test(value)) return 'TEST';
  return undefined;
}

function headingForTable(table: HTMLTableElement): string {
  const headings = Array.from(table.ownerDocument.querySelectorAll('h2, h3, h4'));
  let closestHeading = '';
  for (const heading of headings) {
    if (heading.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING) {
      closestHeading = heading.textContent ?? '';
    }
  }
  return `${table.caption?.textContent ?? ''} ${closestHeading}`;
}

function assignCellValue(stats: Partial<PlayerStats>, metric: keyof PlayerStats, text: string): void {
  if (metric === 'highestScore' || metric === 'bestBowling') {
    if (text.trim()) stats[metric] = text.trim();
    return;
  }
  const value = parseNumber(text);
  if (value !== undefined) stats[metric] = value;
}

export async function getWikipediaPlayerStats(title: string): Promise<WikipediaStatsPreview> {
  const url = new URL(API_URL);
  url.search = new URLSearchParams({
    action: 'parse',
    page: title,
    prop: 'text',
    format: 'json',
    origin: '*',
  }).toString();

  const response = await fetchJson<WikipediaParseResponse>(url);
  const html = typeof response.parse?.text === 'string'
    ? response.parse.text
    : response.parse?.text?.['*'];
  if (!html) throw new Error('Wikipedia did not return page tables for this article.');

  const document = new DOMParser().parseFromString(html, 'text/html');
  const result: WikipediaStatsPreview = {};

  for (const table of Array.from(document.querySelectorAll<HTMLTableElement>('table'))) {
    const rows = Array.from(table.querySelectorAll('tr'));
    if (rows.length < 2) continue;

    const headerCells = Array.from(rows[0].querySelectorAll('th, td'));
    const headers = headerCells.map((cell) => cell.textContent?.trim() ?? '');
    const formatColumns = headers.map(formatForText);
    const tableContext = headingForTable(table);
    const metricColumns = headers.map((header) => metricForHeader(header, tableContext));

    if (formatColumns.some(Boolean)) {
      for (const row of rows.slice(1)) {
        const cells = Array.from(row.querySelectorAll('th, td'));
        const rowLabel = cells[0]?.textContent?.trim() ?? '';
        const metric = metricForHeader(rowLabel);
        if (!metric) continue;
        cells.forEach((cell, index) => {
          const format = formatColumns[index];
          if (!format) return;
          const stats = result[format] ?? (result[format] = {});
          assignCellValue(stats, metric, cell.textContent ?? '');
        });
      }
    }

    for (const row of rows.slice(1)) {
      const cells = Array.from(row.querySelectorAll('th, td'));
      const rowFormat = formatForText(cells[0]?.textContent ?? '');
      if (!rowFormat || !metricColumns.some(Boolean)) continue;
      const stats = result[rowFormat] ?? (result[rowFormat] = {});
      cells.forEach((cell, index) => {
        const metric = metricColumns[index];
        if (metric) assignCellValue(stats, metric, cell.textContent ?? '');
      });
    }

    const contextFormat = formatForText(tableContext);
    if (contextFormat && metricColumns.some(Boolean)) {
      const dataRows = rows.slice(1);
      const totalRow = dataRows.find((row) => /\b(total|career|overall)\b/i.test(row.textContent ?? ''));
      const candidateRows = totalRow ? [totalRow] : dataRows.slice(-1);
      for (const row of candidateRows) {
        const cells = Array.from(row.querySelectorAll('th, td'));
        const stats = result[contextFormat] ?? (result[contextFormat] = {});
        cells.forEach((cell, index) => {
          const metric = metricColumns[index];
          if (metric) assignCellValue(stats, metric, cell.textContent ?? '');
        });
      }
    }
  }

  for (const [format, stats] of Object.entries(result) as [ImportedStatsFormat, Partial<PlayerStats>][]) {
    if (!stats.innings && !stats.runs && !stats.wickets) {
      delete result[format];
      continue;
    }
  }
  return result;
}
