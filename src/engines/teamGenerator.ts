import { Player, UserTeamPlayer, CricketFormat } from '../types/cricket';

export type AutoStrategy =
  | 'best-overall'
  | 'best-batting'
  | 'best-bowling'
  | 'balanced'
  | 'all-round'
  | 't20-power'
  | 'odi-master'
  | 'test-purist'
  | 'custom';

export interface AutoGeneratorConfig {
  strategy: AutoStrategy;
  format?: CricketFormat;
  maxOverseas?: number;
  lockedPlayerIds?: string[];
  minBatters?: number;
  minBowlers?: number;
  minAllRounders?: number;
  minWicketkeepers?: number;
  minPacers?: number;
  minSpinners?: number;
}

export function generateAutomatedXI(
  candidatePlayers: Player[],
  config: AutoGeneratorConfig
): {
  players: UserTeamPlayer[];
  impactPlayer?: Player;
  substitutes: Player[];
  summary: string;
} {
  const {
    strategy = 'balanced',
    format = 'T20',
    maxOverseas = 4,
    lockedPlayerIds = [],
    minBatters = 4,
    minBowlers = 3,
    minAllRounders = 2,
    minWicketkeepers = 1,
    minPacers = 2,
    minSpinners = 1,
  } = config;

  // Score each player according to strategy
  const scoredPlayers = candidatePlayers.map((player) => {
    let score = player.overallRating;
    const attr = player.attributes;

    if (strategy === 'best-batting') {
      score = attr.technique * 0.3 + attr.powerHitting * 0.35 + attr.timing * 0.25 + attr.finishing * 0.1;
      if (player.primaryRole === 'Batter') score += 12;
      if (player.primaryRole === 'Wicketkeeper') score += 6;
    } else if (strategy === 'best-bowling') {
      score = attr.accuracy * 0.3 + attr.variations * 0.25 + attr.control * 0.25 + attr.deathBowling * 0.2;
      if (player.primaryRole === 'Bowler') score += 12;
      if (player.primaryRole === 'All-rounder') score += 6;
    } else if (strategy === 'all-round') {
      score = attr.versatility * 0.4 + (attr.powerHitting + attr.variations) * 0.3 + attr.fitness * 0.3;
      if (player.primaryRole === 'All-rounder') score += 15;
    } else if (strategy === 't20-power') {
      score = (player.formatRatings.T20 || player.overallRating) * 0.4 + attr.powerHitting * 0.3 + attr.deathBowling * 0.3;
    } else if (strategy === 'odi-master') {
      score = (player.formatRatings.ODI || player.overallRating) * 0.5 + attr.consistency * 0.3 + attr.technique * 0.2;
    } else if (strategy === 'test-purist') {
      score = (player.formatRatings.TEST || player.overallRating) * 0.5 + attr.technique * 0.3 + attr.accuracy * 0.2;
    } else {
      // balanced / best-overall
      const formatScore = format === 'ODI' ? player.formatRatings.ODI : format === 'TEST' ? player.formatRatings.TEST : player.formatRatings.T20;
      score = (formatScore || player.overallRating) * 0.6 + (attr.pressureHandling + attr.experience) * 0.2 + attr.fitness * 0.2;
    }

    return { player, score };
  });

  // Sort by score descending
  scoredPlayers.sort((a, b) => b.score - a.score);

  const selected: Player[] = [];
  let overseasCount = 0;

  // 1. First add locked players
  for (const lockedId of lockedPlayerIds) {
    const sp = scoredPlayers.find((s) => s.player.id === lockedId);
    if (sp && !selected.some((p) => p.id === sp.player.id)) {
      selected.push(sp.player);
      if (sp.player.isOverseasIPL) overseasCount++;
    }
  }

  // 2. Ensure at least one Wicketkeeper
  const hasKeeper = selected.some((p) => p.primaryRole === 'Wicketkeeper' || p.secondaryRoles.includes('Wicketkeeper'));
  if (!hasKeeper) {
    const bestKeeper = scoredPlayers.find(
      (s) =>
        !selected.some((p) => p.id === s.player.id) &&
        (s.player.primaryRole === 'Wicketkeeper' || s.player.secondaryRoles.includes('Wicketkeeper')) &&
        (!s.player.isOverseasIPL || overseasCount < maxOverseas)
    );
    if (bestKeeper) {
      selected.push(bestKeeper.player);
      if (bestKeeper.player.isOverseasIPL) overseasCount++;
    }
  }

  // 3. Ensure minimum pacers
  const currentPacers = selected.filter((p) => p.bowlingStyle.includes('fast') || p.bowlingStyle.includes('medium')).length;
  for (let i = currentPacers; i < minPacers; i++) {
    const bestPacer = scoredPlayers.find(
      (s) =>
        !selected.some((p) => p.id === s.player.id) &&
        (s.player.bowlingStyle.includes('fast') || s.player.bowlingStyle.includes('medium')) &&
        (!s.player.isOverseasIPL || overseasCount < maxOverseas)
    );
    if (bestPacer && selected.length < 11) {
      selected.push(bestPacer.player);
      if (bestPacer.player.isOverseasIPL) overseasCount++;
    }
  }

  // 4. Ensure minimum spinners
  const currentSpinners = selected.filter((p) => p.bowlingStyle.includes('spin') || p.bowlingStyle.includes('break') || p.bowlingStyle.includes('orthodox')).length;
  for (let i = currentSpinners; i < minSpinners; i++) {
    const bestSpinner = scoredPlayers.find(
      (s) =>
        !selected.some((p) => p.id === s.player.id) &&
        (s.player.bowlingStyle.includes('spin') || s.player.bowlingStyle.includes('break') || s.player.bowlingStyle.includes('orthodox')) &&
        (!s.player.isOverseasIPL || overseasCount < maxOverseas)
    );
    if (bestSpinner && selected.length < 11) {
      selected.push(bestSpinner.player);
      if (bestSpinner.player.isOverseasIPL) overseasCount++;
    }
  }

  // 5. Fill remaining spots up to 11
  for (const candidate of scoredPlayers) {
    if (selected.length >= 11) break;
    if (selected.some((p) => p.id === candidate.player.id)) continue;

    if (candidate.player.isOverseasIPL && overseasCount >= maxOverseas) {
      continue;
    }

    selected.push(candidate.player);
    if (candidate.player.isOverseasIPL) overseasCount++;
  }

  // If still under 11 (if overseas filter was strict or candidate pool was small), fill with any available
  if (selected.length < 11) {
    for (const candidate of scoredPlayers) {
      if (selected.length >= 11) break;
      if (!selected.some((p) => p.id === candidate.player.id)) {
        selected.push(candidate.player);
      }
    }
  }

  // Organize batting order logically:
  // Openers / Top-order first, then Middle order, then All-rounders, then Bowlers
  const sortedByRole = [...selected].sort((a, b) => {
    const roleRank = (p: Player) => {
      if (p.specialization === 'Opening batter') return 1;
      if (p.specialization === 'Top-order batter') return 2;
      if (p.primaryRole === 'Batter') return 3;
      if (p.primaryRole === 'Wicketkeeper') return 4;
      if (p.primaryRole === 'All-rounder') return 5;
      return 6;
    };
    return roleRank(a) - roleRank(b);
  });

  // Pick Captain (highest leadership attribute) & Vice-Captain (second highest)
  const byLeadership = [...sortedByRole].sort((a, b) => b.attributes.leadership - a.attributes.leadership);
  const captainId = byLeadership[0]?.id;
  const viceCaptainId = byLeadership[1]?.id;

  // Pick primary wicketkeeper
  const primaryKeeper = sortedByRole.find(
    (p) => p.primaryRole === 'Wicketkeeper' || p.secondaryRoles.includes('Wicketkeeper')
  );

  const teamPlayers: UserTeamPlayer[] = sortedByRole.map((p, idx) => ({
    playerId: p.id,
    battingOrder: idx + 1,
    isCaptain: p.id === captainId,
    isViceCaptain: p.id === viceCaptainId,
    isWicketkeeper: p.id === (primaryKeeper?.id || sortedByRole[0].id),
  }));

  // Pick Impact Player and Substitutes from remaining candidates
  const remainingCandidates = candidatePlayers.filter((p) => !selected.some((sel) => sel.id === p.id));
  const impactPlayer = remainingCandidates[0];
  const substitutes = remainingCandidates.slice(1, 5);

  let summary = `Optimized for ${strategy.toUpperCase()} strategy with ${overseasCount} overseas players and ${teamPlayers.length} starters.`;
  if (strategy === 't20-power') {
    summary = `Assembled an explosive T20 lineup featuring maximum boundary hitters, clutch death bowlers, and 6 active bowling options.`;
  } else if (strategy === 'balanced') {
    summary = `Balanced 11 featuring solid anchors, high-octane middle-overs accelerators, and a diverse pace & spin bowling battery.`;
  }

  return {
    players: teamPlayers,
    impactPlayer,
    substitutes,
    summary,
  };
}
