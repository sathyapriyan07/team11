import React, { useState } from 'react';
import { CheckCircle2, ExternalLink, Search } from 'lucide-react';
import { storageService } from '../../services/storageService';
import {
  Competition,
  CompetitionRules,
  CricketFormat,
  Player,
  PlayerAttributes,
  PlayerStats,
  TeamEntity,
} from '../../types/cricket';
import {
  getWikipediaPagePreview,
  getWikipediaPlayerStats,
  getWikipediaSquadPlayers,
  ImportedStatsFormat,
  searchWikipedia,
  WikipediaPagePreview,
  WikipediaSearchResult,
  WikipediaSquadPlayer,
  WikipediaStatsPreview,
} from '../../services/wikipediaService';
import { getCricketApiPlayer } from '../../services/cricketApiService';

type ImportKind = 'player' | 'squad' | 'team' | 'competition' | 'stats' | 'cricket-stats';

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

const EMPTY_ATTRIBUTES: PlayerAttributes = {
  technique: 50, powerHitting: 50, timing: 50, shotSelection: 50, strikeRotation: 50,
  againstPace: 50, againstSpin: 50, finishing: 50, consistency: 50, pace: 50,
  swing: 50, seam: 50, spin: 50, accuracy: 50, variations: 50, deathBowling: 50,
  powerplayBowling: 50, control: 50, catching: 50, groundFielding: 50, throwing: 50,
  reflexes: 50, agility: 50, wkReflexes: 50, wkCatching: 50, wkStumping: 50,
  wkGlovework: 50, wkPositioning: 50, fitness: 50, experience: 50, leadership: 50,
  pressureHandling: 50, versatility: 50,
};

const DEFAULT_RULES: CompetitionRules = {
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

const inputClass = 'mt-1 w-full rounded-xl border border-white/10 bg-[#181F29] p-2.5 text-sm text-white focus:border-[#20C878] focus:outline-none';
const labelClass = 'block text-xs font-semibold text-[#929BA8]';
const formats: ImportedStatsFormat[] = ['T20', 'ODI', 'TEST', 'IPL'];

interface WikipediaImportPanelProps {
  cloudConfigured: boolean;
  isAdmin: boolean;
}

function makeSlug(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export const WikipediaImportPanel: React.FC<WikipediaImportPanelProps> = ({ cloudConfigured, isAdmin }) => {
  const [kind, setKind] = useState<ImportKind>('player');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<WikipediaSearchResult[]>([]);
  const [preview, setPreview] = useState<WikipediaPagePreview | null>(null);
  const [statsPreview, setStatsPreview] = useState<WikipediaStatsPreview>({});
  const [squadPlayers, setSquadPlayers] = useState<WikipediaSquadPlayer[]>([]);
  const [selectedSquadPlayers, setSelectedSquadPlayers] = useState<string[]>([]);
  const [squadPlayerCountries, setSquadPlayerCountries] = useState<Record<string, string>>({});
  const [selectedStatsFormats, setSelectedStatsFormats] = useState<ImportedStatsFormat[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [draftName, setDraftName] = useState('');
  const [draftCountry, setDraftCountry] = useState('');
  const [draftShortName, setDraftShortName] = useState('');
  const [draftCode, setDraftCode] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftImageUrl, setDraftImageUrl] = useState('');
  const [squadCountry, setSquadCountry] = useState('');
  const [squadTeamId, setSquadTeamId] = useState('');
  const [teamType, setTeamType] = useState<TeamEntity['type']>('Franchise');
  const [teamCompetitionId, setTeamCompetitionId] = useState('');
  const [competitionType, setCompetitionType] = useState<Competition['competitionType']>('Franchise');
  const [competitionFormat, setCompetitionFormat] = useState<CricketFormat>('T20');
  const [season, setSeason] = useState(new Date().getFullYear().toString());

  const canWrite = !cloudConfigured || isAdmin;
  const savedPlayers = storageService.getPlayers();
  const savedTeams = storageService.getTeams();
  const savedCompetitions = storageService.getCompetitions();

  const clearPreview = () => {
    setPreview(null);
    setStatsPreview({});
    setSquadPlayers([]);
    setSelectedSquadPlayers([]);
    setSquadPlayerCountries({});
    setSelectedStatsFormats([]);
    setError('');
    setNotice('');
  };

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    setLoading(true);
    setError('');
    setNotice('');
    setResults([]);
    clearPreview();
    try {
      if (kind === 'cricket-stats') {
        const player = await getCricketApiPlayer(trimmedQuery);
        const availableFormats = (['TEST', 'ODI', 'T20'] as const)
          .filter((format) => Object.keys(player.stats[format] ?? {}).length > 0);
        setPreview({
          title: player.name,
          extract: [player.country, player.role].filter(Boolean).join(' · '),
          imageUrl: player.imageUrl,
          pageUrl: 'https://github.com/tarun7r/Cricket-API',
        });
        setStatsPreview(player.stats);
        setSelectedStatsFormats(availableFormats);
        if (availableFormats.length === 0) {
          setNotice('The Cricket API returned no recognizable career statistics for this player.');
        }
      } else {
        setResults(await searchWikipedia(trimmedQuery));
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Player stats search failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResult = async (result: WikipediaSearchResult) => {
    setLoading(true);
    setError('');
    setNotice('');
    setPreview(null);
    setStatsPreview({});
    setSquadPlayers([]);
    setSelectedSquadPlayers([]);
    setSquadPlayerCountries({});
    setSelectedStatsFormats([]);
    try {
      const page = await getWikipediaPagePreview(result.title);
      setPreview(page);
      setDraftName(page.title);
      setDraftCountry('');
      setDraftShortName(page.title);
      setDraftCode('');
      setDraftDescription(page.extract);
      setDraftImageUrl(page.imageUrl);
      if (kind === 'squad') {
        const players = await getWikipediaSquadPlayers(result.title);
        const existingNames = new Set(savedPlayers.map((player) => player.fullName.toLocaleLowerCase()));
        setSquadPlayers(players);
        setSelectedSquadPlayers(players
          .filter((player) => !existingNames.has(player.title.toLocaleLowerCase()))
          .map((player) => player.title));
        if (players.length === 0) {
          setNotice('No squad table with linked player names was found. Try a team squad or roster article.');
        } else if (players.every((player) => existingNames.has(player.title.toLocaleLowerCase()))) {
          setNotice('All players in this squad already exist in your catalog.');
        }
      } else if (kind === 'stats') {
        const stats = await getWikipediaPlayerStats(result.title);
        const availableFormats = formats.filter((format) => Object.keys(stats[format] ?? {}).length > 0);
        setStatsPreview(stats);
        setSelectedStatsFormats(availableFormats);
        if (availableFormats.length === 0) {
          setNotice('No recognizable career-stat tables were found on this article. Try a player article with a career statistics table.');
        }
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load the Wikipedia article.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatsFormat = (format: ImportedStatsFormat) => {
    setSelectedStatsFormats((selected) => selected.includes(format)
      ? selected.filter((item) => item !== format)
      : [...selected, format]);
  };

  const toggleSquadPlayer = (name: string) => {
    setSelectedSquadPlayers((selected) => selected.includes(name)
      ? selected.filter((item) => item !== name)
      : [...selected, name]);
  };

  const handleImport = () => {
    setError('');
    setNotice('');
    if (!canWrite) {
      setError('Sign in as an authorized admin before importing data.');
      return;
    }
    if (!preview) return;

    if (kind === 'squad') {
      const selectedPlayers = squadPlayers.filter((player) => selectedSquadPlayers.includes(player.title));
      if (selectedPlayers.length === 0) {
        setError('Select at least one player to import.');
        return;
      }
      if (selectedPlayers.some((player) => !(squadPlayerCountries[player.title] || squadCountry).trim())) {
        setError('Enter a country or nationality for every selected player, either as the default or individually.');
        return;
      }
      const existingNames = new Set(savedPlayers.map((player) => player.fullName.toLocaleLowerCase()));
      const teamIds = squadTeamId ? [squadTeamId] : [];
      const newPlayers = selectedPlayers.filter((player) => !existingNames.has(player.title.toLocaleLowerCase()));
      if (newPlayers.length === 0) {
        setError('All selected players already exist in your catalog.');
        return;
      }
      newPlayers.forEach(({ title: playerName }) => {
        const country = (squadPlayerCountries[playerName] || squadCountry).trim();
        const player: Player = {
          id: `p-${makeSlug(playerName)}-${crypto.randomUUID().slice(0, 8)}`,
          fullName: playerName,
          displayName: playerName,
          country,
          nationality: country,
          imageUrl: '',
          primaryRole: 'Batter',
          secondaryRoles: [],
          specialization: 'Top-order batter',
          battingHand: 'Right-hand bat',
          bowlingStyle: 'None',
          careerStatus: 'Active',
          bio: `Listed in the ${preview.title} squad on Wikipedia.`,
          overallRating: 50,
          formatRatings: { T20: 50, ODI: 50, TEST: 50 },
          attributes: { ...EMPTY_ATTRIBUTES },
          stats: { T20: { ...EMPTY_STATS }, ODI: { ...EMPTY_STATS }, TEST: { ...EMPTY_STATS } },
          teamsPlayed: teamIds,
          isOverseasIPL: false,
        };
        storageService.savePlayer(player);
      });
      setNotice(`${newPlayers.length} squad player${newPlayers.length === 1 ? '' : 's'} imported. Review each saved record before using it.`);
      setPreview(null);
      setSquadPlayers([]);
      setSelectedSquadPlayers([]);
      setSquadPlayerCountries({});
      setResults([]);
      setQuery('');
      return;
    }

    const name = draftName.trim();
    if (kind !== 'stats' && kind !== 'cricket-stats' && !name) {
      setError('Enter a name before importing.');
      return;
    }

    if (kind === 'player') {
      if (!draftCountry.trim()) {
        setError('Enter the player’s country before importing.');
        return;
      }
      if (savedPlayers.some((player) => player.fullName.toLowerCase() === name.toLowerCase())) {
        setError('A player with this name already exists. Edit the existing player instead of importing a duplicate.');
        return;
      }
      const player: Player = {
        id: `p-${makeSlug(name)}-${crypto.randomUUID().slice(0, 8)}`,
        fullName: name,
        displayName: name,
        country: draftCountry.trim(),
        nationality: draftCountry.trim(),
        imageUrl: draftImageUrl.trim(),
        primaryRole: 'Batter',
        secondaryRoles: [],
        specialization: 'Top-order batter',
        battingHand: 'Right-hand bat',
        bowlingStyle: 'None',
        careerStatus: 'Active',
        bio: draftDescription.trim(),
        overallRating: 50,
        formatRatings: { T20: 50, ODI: 50, TEST: 50 },
        attributes: { ...EMPTY_ATTRIBUTES },
        stats: { T20: { ...EMPTY_STATS }, ODI: { ...EMPTY_STATS }, TEST: { ...EMPTY_STATS } },
        teamsPlayed: [],
        isOverseasIPL: false,
      };
      storageService.savePlayer(player);
    } else if (kind === 'team') {
      const code = draftCode.trim().toUpperCase();
      if (!code) {
        setError('Enter a team code before importing.');
        return;
      }
      if (savedTeams.some((team) => team.code.toUpperCase() === code)) {
        setError('A team with this code already exists.');
        return;
      }
      storageService.saveTeam({
        id: `team-${makeSlug(code)}`,
        name,
        shortName: draftShortName.trim() || name,
        code,
        competitionId: teamCompetitionId,
        type: teamType,
        logo: draftImageUrl.trim(),
        primaryColor: '#20C878',
        secondaryColor: '#181F29',
        homeGround: '',
        championships: [],
        establishedYear: new Date().getFullYear(),
      });
    } else if (kind === 'competition') {
      const slug = makeSlug(name);
      if (!slug) {
        setError('Enter a valid competition name.');
        return;
      }
      if (savedCompetitions.some((competition) => competition.slug === slug)) {
        setError('A competition with this name already exists.');
        return;
      }
      storageService.saveCompetition({
        id: `comp-${slug}`,
        name,
        shortName: draftShortName.trim() || name,
        slug,
        logo: draftImageUrl.trim(),
        competitionType,
        format: competitionFormat,
        country: draftCountry.trim(),
        seasons: [season.trim()],
        currentSeason: season.trim(),
        description: draftDescription.trim(),
        rules: { ...DEFAULT_RULES },
      });
    } else if (kind === 'stats' || kind === 'cricket-stats') {
      const player = savedPlayers.find((item) => item.id === selectedPlayerId);
      if (!player) {
        setError('Select the existing player whose statistics you want to update.');
        return;
      }
      if (selectedStatsFormats.length === 0) {
        setError('Select at least one format with statistics to import.');
        return;
      }
      const updatedStats = { ...player.stats };
      for (const format of selectedStatsFormats) {
        const imported = statsPreview[format];
        if (imported) {
          updatedStats[format] = { ...EMPTY_STATS, ...updatedStats[format], ...imported };
        }
      }
      storageService.savePlayer({ ...player, stats: updatedStats });
    }

    setNotice(`${kind === 'stats' || kind === 'cricket-stats' ? 'Player statistics' : kind} imported. Review the saved record before using it.`);
    setPreview(null);
    setStatsPreview({});
    setSelectedStatsFormats([]);
    setResults([]);
    setQuery('');
  };

  return (
    <section className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-[#121720] p-4 shadow-xl sm:p-6">
      <div>
        <h3 className="text-base font-bold font-heading text-white">Import player and competition data</h3>
        <p className="mt-1 text-xs leading-relaxed text-[#929BA8]">
          Search Wikipedia for player, squad, team, or competition records; use the Cricket API for player career statistics.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {([
          ['player', 'Player'],
          ['squad', 'Team squad'],
          ['team', 'Team'],
          ['competition', 'Competition'],
          ['stats', 'Player stats'],
          ['cricket-stats', 'Cricket API stats'],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setKind(value);
              setResults([]);
              setQuery('');
              clearPreview();
            }}
            className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
              kind === value ? 'bg-[#20C878] text-[#090B0F]' : 'bg-[#181F29] text-[#929BA8] hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {(kind === 'stats' || kind === 'cricket-stats') && (
        <label className={labelClass}>Update statistics for
          <select
            value={selectedPlayerId}
            onChange={(event) => {
              const playerId = event.target.value;
              setSelectedPlayerId(playerId);
              if (kind === 'cricket-stats') {
                setQuery(savedPlayers.find((player) => player.id === playerId)?.fullName ?? '');
              }
            }}
            className={inputClass}
          >
            <option value="">Select a player</option>
            {savedPlayers.map((player) => <option key={player.id} value={player.id}>{player.fullName}</option>)}
          </select>
        </label>
      )}

      <form onSubmit={(event) => void handleSearch(event)} className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="player-data-search">
          {kind === 'cricket-stats' ? 'Cricket API player search' : 'Wikipedia article search'}
        </label>
        <input
          id="player-data-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={kind === 'cricket-stats'
            ? 'Enter a player name for Cricket API stats'
            : kind === 'stats'
              ? 'Search player article for stats'
              : kind === 'squad'
                ? 'Search Wikipedia for a team squad'
                : `Search Wikipedia for a ${kind}`}
          className={`${inputClass} mt-0 min-w-0 flex-1`}
        />
        <button type="submit" disabled={loading || !query.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50">
          <Search className="h-4 w-4" /> {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && <p role="alert" className="text-xs text-rose-400">{error}</p>}
      {notice && <p role="status" className="text-xs text-[#20C878]">{notice}</p>}

      {results.length > 0 && (
        <div className="max-h-64 divide-y divide-white/5 overflow-y-auto rounded-xl border border-white/10">
          {results.map((result) => (
            <button key={result.pageId} type="button" onClick={() => void handleSelectResult(result)} className="block w-full p-3 text-left hover:bg-[#181F29]">
              <span className="block text-sm font-semibold text-white">{result.title}</span>
              {result.description && <span className="mt-1 block text-xs text-[#929BA8]">{result.description}</span>}
            </button>
          ))}
        </div>
      )}

      {preview && (
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#090B0F] p-4">
          <div className="flex flex-wrap items-start gap-3">
            {preview.imageUrl && <img src={preview.imageUrl} alt="" className="h-16 w-16 rounded-xl border border-white/10 object-cover" />}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white">{preview.title}</p>
              <a href={preview.pageUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-[#20C878] hover:underline">
                {kind === 'cricket-stats' ? 'Review Cricket API source' : 'Review Wikipedia source'} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {kind !== 'stats' && kind !== 'cricket-stats' && kind !== 'squad' ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={labelClass}>Name
                <input value={draftName} onChange={(event) => setDraftName(event.target.value)} className={inputClass} />
              </label>
              {kind === 'player' && (
                <label className={labelClass}>Country (required)
                  <input value={draftCountry} onChange={(event) => setDraftCountry(event.target.value)} className={inputClass} />
                </label>
              )}
              {kind === 'team' && (
                <>
                  <label className={labelClass}>Short name
                    <input value={draftShortName} onChange={(event) => setDraftShortName(event.target.value)} className={inputClass} />
                  </label>
                  <label className={labelClass}>Team code (required)
                    <input value={draftCode} onChange={(event) => setDraftCode(event.target.value)} maxLength={8} className={inputClass} />
                  </label>
                  <label className={labelClass}>Team type
                    <select value={teamType} onChange={(event) => setTeamType(event.target.value as TeamEntity['type'])} className={inputClass}>
                      <option value="Franchise">Franchise</option><option value="National">National</option><option value="Domestic">Domestic</option>
                    </select>
                  </label>
                  <label className={labelClass}>Competition
                    <select value={teamCompetitionId} onChange={(event) => setTeamCompetitionId(event.target.value)} className={inputClass}>
                      <option value="">No competition</option>
                      {savedCompetitions.map((competition) => <option key={competition.id} value={competition.id}>{competition.name}</option>)}
                    </select>
                  </label>
                </>
              )}
              {kind === 'competition' && (
                <>
                  <label className={labelClass}>Short name
                    <input value={draftShortName} onChange={(event) => setDraftShortName(event.target.value)} className={inputClass} />
                  </label>
                  <label className={labelClass}>Country
                    <input value={draftCountry} onChange={(event) => setDraftCountry(event.target.value)} className={inputClass} />
                  </label>
                  <label className={labelClass}>Competition type
                    <select value={competitionType} onChange={(event) => setCompetitionType(event.target.value as Competition['competitionType'])} className={inputClass}>
                      <option value="Franchise">Franchise</option><option value="International">International</option><option value="Domestic">Domestic</option>
                    </select>
                  </label>
                  <label className={labelClass}>Format
                    <select value={competitionFormat} onChange={(event) => setCompetitionFormat(event.target.value as CricketFormat)} className={inputClass}>
                      <option value="T20">T20</option><option value="ODI">ODI</option><option value="TEST">Test</option>
                    </select>
                  </label>
                  <label className={labelClass}>Current season
                    <input value={season} onChange={(event) => setSeason(event.target.value)} className={inputClass} />
                  </label>
                </>
              )}
              <label className={`${labelClass} sm:col-span-2`}>Logo / image URL
                <input value={draftImageUrl} onChange={(event) => setDraftImageUrl(event.target.value)} className={inputClass} />
              </label>
              {kind !== 'team' && (
                <label className={`${labelClass} sm:col-span-2`}>Description / biography
                  <textarea rows={4} value={draftDescription} onChange={(event) => setDraftDescription(event.target.value)} className={inputClass} />
                </label>
              )}
            </div>
          ) : kind === 'squad' ? (
            <div className="flex flex-col gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={labelClass}>Default country / nationality (optional)
                  <input value={squadCountry} onChange={(event) => setSquadCountry(event.target.value)} className={inputClass} />
                </label>
                <label className={labelClass}>Assign to team (optional)
                  <select value={squadTeamId} onChange={(event) => setSquadTeamId(event.target.value)} className={inputClass}>
                    <option value="">Do not assign a team</option>
                    {savedTeams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                  </select>
                </label>
              </div>
              {squadPlayers.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-white/10">
                  <div className="flex items-center justify-between gap-3 bg-white/5 px-3 py-2">
                    <span className="text-xs font-semibold text-white">{squadPlayers.length} players found</span>
                    <button
                      type="button"
                      onClick={() => {
                        const existingNames = new Set(savedPlayers.map((player) => player.fullName.toLocaleLowerCase()));
                        setSelectedSquadPlayers(squadPlayers
                          .filter((player) => !existingNames.has(player.title.toLocaleLowerCase()))
                          .map((player) => player.title));
                      }}
                      className="text-xs font-semibold text-[#20C878] hover:underline"
                    >
                      Select new players
                    </button>
                  </div>
                  <div className="max-h-64 divide-y divide-white/5 overflow-y-auto">
                    {squadPlayers.map((player) => {
                      const exists = savedPlayers.some((saved) => saved.fullName.toLocaleLowerCase() === player.title.toLocaleLowerCase());
                      return (
                        <label key={player.pageUrl} className="flex flex-wrap items-center gap-3 px-3 py-2 text-sm text-white">
                          <input
                            type="checkbox"
                            checked={selectedSquadPlayers.includes(player.title)}
                            disabled={exists}
                            onChange={() => toggleSquadPlayer(player.title)}
                          />
                          <span className="min-w-0 flex-1 truncate">{player.title}</span>
                          {exists && <span className="text-[11px] text-[#929BA8]">Already imported</span>}
                          {!exists && (
                            <input
                              aria-label={`${player.title} country or nationality`}
                              placeholder={squadCountry || 'Country / nationality'}
                              value={squadPlayerCountries[player.title] ?? ''}
                              onChange={(event) => setSquadPlayerCountries((countries) => ({
                                ...countries,
                                [player.title]: event.target.value,
                              }))}
                              className="w-36 rounded-lg border border-white/10 bg-[#181F29] px-2 py-1 text-xs text-white"
                            />
                          )}
                          <a href={player.pageUrl} target="_blank" rel="noreferrer" aria-label={`Open ${player.title} on Wikipedia`} className="text-[#20C878] hover:underline">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
              <p className="text-[11px] leading-relaxed text-[#929BA8]">
                Squad imports create player records with basic defaults. Set a default or individual nationality, then review and complete each player’s role, ratings, stats, and photo in Manage Players.
              </p>
            </div>
          ) : (
            <div>
              {savedPlayers.length === 0 && <p className="text-xs text-amber-300">Create or import a player before importing statistics.</p>}
              {Object.keys(statsPreview).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-xs">
                    <thead className="text-[#929BA8]">
                      <tr><th className="p-2">Import</th><th className="p-2">Format</th><th className="p-2">Matches</th><th className="p-2">Runs</th><th className="p-2">Average</th><th className="p-2">Wickets</th><th className="p-2">Economy</th></tr>
                    </thead>
                    <tbody>
                      {formats.filter((format) => statsPreview[format]).map((format) => {
                        const stats = statsPreview[format]!;
                        return (
                          <tr key={format} className="border-t border-white/10 text-white">
                            <td className="p-2"><input type="checkbox" checked={selectedStatsFormats.includes(format)} onChange={() => toggleStatsFormat(format)} /></td>
                            <td className="p-2 font-semibold">{format}</td>
                            <td className="p-2">{stats.matches ?? '—'}</td>
                            <td className="p-2">{stats.runs ?? '—'}</td>
                            <td className="p-2">{stats.battingAverage ?? '—'}</td>
                            <td className="p-2">{stats.wickets ?? '—'}</td>
                            <td className="p-2">{stats.economy ?? '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <p className="mt-2 text-[11px] text-[#929BA8]">
                    Only returned values replace saved values. Review the {kind === 'cricket-stats' ? 'Cricket API' : 'Wikipedia'} source before applying.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[#929BA8]">No recognized statistics found in this article.</p>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
            <span className="text-[11px] text-[#929BA8]">
              {kind === 'cricket-stats'
                ? 'Cricket-API data is scraped from Cricbuzz; verify imported values.'
                : 'Wikipedia content is community-maintained; verify the article and imported values.'}
            </span>
            <button type="button" onClick={handleImport} disabled={!canWrite || loading || ((kind === 'stats' || kind === 'cricket-stats') && savedPlayers.length === 0)} className="inline-flex items-center gap-2 rounded-xl bg-[#20C878] px-4 py-2.5 text-xs font-bold text-[#090B0F] hover:bg-[#1bb56c] disabled:cursor-not-allowed disabled:opacity-50">
              <CheckCircle2 className="h-4 w-4" /> {(kind === 'stats' || kind === 'cricket-stats') ? 'Apply selected stats' : kind === 'squad' ? `Import ${selectedSquadPlayers.length} selected players` : 'Import reviewed record'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
