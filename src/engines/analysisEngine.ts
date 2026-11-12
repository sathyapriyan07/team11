import { Player, UserTeamPlayer, TeamAnalysis, CricketFormat } from '../types/cricket';

interface ResolvedTeamPlayer extends UserTeamPlayer {
  player: Player;
}

const average = (values: number[]): number | null =>
  values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;

export function analyzeTeam(
  teamPlayers: UserTeamPlayer[],
  allPlayers: Player[],
  format: CricketFormat = 'T20',
): TeamAnalysis {
  const playersMap = new Map(allPlayers.map((player) => [player.id, player]));
  const resolved = teamPlayers
    .map((teamPlayer) => {
      const player = playersMap.get(teamPlayer.playerId);
      return player ? { ...teamPlayer, player } : null;
    })
    .filter((player): player is ResolvedTeamPlayer => player !== null)
    .sort((a, b) => a.battingOrder - b.battingOrder);

  const emptyAnalysis: TeamAnalysis = {
    overallRating: null,
    battingStrength: null,
    bowlingStrength: null,
    paceAttackStrength: null,
    spinAttackStrength: null,
    allRoundStrength: null,
    fieldingStrength: null,
    wicketkeepingStrength: null,
    finishingStrength: null,
    battingDepth: null,
    openingCombination: null,
    middleOrderStability: null,
    deathOverBowlingStrength: null,
    experienceRating: null,
    openingPair: [],
    leftRightBalance: { rightHanders: 0, leftHanders: 0 },
    roleDistribution: { batters: 0, wicketkeepers: 0, allRounders: 0, bowlers: 0 },
    bowlingBreakdown: { paceBowlers: 0, spinBowlers: 0, sixthBowlingOption: false },
    strengths: [],
    weaknesses: [],
    recommendations: ['Select players to begin team analysis.'],
  };
  if (!resolved.length) return emptyAnalysis;

  const formatRatingKey = format === 'ODI' ? 'ODI' : format === 'TEST' ? 'TEST' : 'T20';
  const overallRating = average(
    resolved.map(({ player }) => player.formatRatings[formatRatingKey] ?? player.overallRating),
  );
  const battingWeights = resolved.map(({ battingOrder }) =>
    battingOrder <= 4 ? 1.2 : battingOrder <= 7 ? 1 : battingOrder <= 9 ? 0.6 : 0.3,
  );
  const battingWeightTotal = battingWeights.reduce((sum, weight) => sum + weight, 0);
  const battingStrength = battingWeightTotal
    ? Math.round(
        resolved.reduce((sum, item, index) => {
          const attributes = item.player.attributes;
          const score =
            attributes.technique * 0.25 +
            attributes.powerHitting * 0.25 +
            attributes.timing * 0.2 +
            attributes.againstPace * 0.15 +
            attributes.againstSpin * 0.15;
          return sum + score * battingWeights[index];
        }, 0) / battingWeightTotal,
      )
    : null;

  const bowlingOptions = resolved.filter(
    ({ player }) =>
      player.primaryRole === 'Bowler' ||
      player.primaryRole === 'All-rounder' ||
      player.attributes.control > 65,
  );
  const bowlingScores = bowlingOptions
    .map(({ player }) => {
      const attributes = player.attributes;
      return (
        attributes.accuracy * 0.25 +
        attributes.variations * 0.25 +
        attributes.control * 0.2 +
        attributes.deathBowling * 0.15 +
        attributes.powerplayBowling * 0.15
      );
    })
    .sort((a, b) => b - a)
    .slice(0, 5);
  const bowlingStrength = average(bowlingScores);

  const paceBowlers = resolved.filter(
    ({ player }) =>
      player.bowlingStyle.includes('fast') || player.bowlingStyle.includes('medium'),
  );
  const spinBowlers = resolved.filter(
    ({ player }) =>
      player.bowlingStyle.includes('break') ||
      player.bowlingStyle.includes('spin') ||
      player.bowlingStyle.includes('orthodox'),
  );
  const paceAttackStrength = average(
    paceBowlers.map(({ player }) =>
      player.attributes.pace * 0.4 +
      player.attributes.swing * 0.3 +
      player.attributes.deathBowling * 0.3,
    ),
  );
  const spinAttackStrength = average(
    spinBowlers.map(({ player }) =>
      player.attributes.spin * 0.5 +
      player.attributes.variations * 0.3 +
      player.attributes.control * 0.2,
    ),
  );

  const allRounders = resolved.filter(({ player }) => player.primaryRole === 'All-rounder');
  const allRoundStrength = average(allRounders.map(({ player }) => player.attributes.versatility));
  const fieldingStrength = average(
    resolved.map(({ player }) =>
      (player.attributes.catching + player.attributes.groundFielding + player.attributes.throwing) / 3,
    ),
  );
  const keepers = resolved.filter(
    ({ isWicketkeeper, player }) =>
      isWicketkeeper ||
      player.primaryRole === 'Wicketkeeper' ||
      player.secondaryRoles.includes('Wicketkeeper'),
  );
  const wicketkeepingAttributes = keepers.flatMap(({ player }) =>
    [
      player.attributes.wkCatching,
      player.attributes.wkReflexes,
      player.attributes.wkStumping,
      player.attributes.wkGlovework,
      player.attributes.wkPositioning,
    ].filter((value): value is number => typeof value === 'number'),
  );
  const wicketkeepingStrength = average(wicketkeepingAttributes);

  const finishers = resolved.filter(({ battingOrder }) => battingOrder >= 5 && battingOrder <= 8);
  const finishingStrength = average(
    finishers.map(({ player }) =>
      player.attributes.powerHitting * 0.5 + player.attributes.finishing * 0.5,
    ),
  );
  const topNine = resolved.filter(({ battingOrder }) => battingOrder <= 9);
  const reliableBatters = topNine.filter(
    ({ player }) => player.attributes.technique >= 70 || player.attributes.powerHitting >= 75,
  );
  const battingDepth = topNine.length
    ? Math.round((reliableBatters.length / topNine.length) * 100)
    : null;

  const openingPlayers = resolved.filter(({ battingOrder }) => battingOrder <= 2);
  const openingPair = openingPlayers.map(({ player }) => player.displayName);
  const openingCombination = openingPlayers.length === 2
    ? average(
        openingPlayers.map(({ player }) =>
          player.attributes.technique * 0.3 +
          player.attributes.timing * 0.25 +
          player.attributes.shotSelection * 0.2 +
          player.attributes.strikeRotation * 0.15 +
          player.attributes.consistency * 0.1,
        ),
      )
    : null;
  const middleOrder = resolved.filter(({ battingOrder }) => battingOrder >= 3 && battingOrder <= 6);
  const middleOrderStability = middleOrder.length
    ? average(
        middleOrder.map(({ player }) =>
          player.attributes.technique * 0.4 +
          player.attributes.consistency * 0.4 +
          player.attributes.shotSelection * 0.2,
        ),
      )
    : null;
  const deathOverBowlingStrength = average(
    bowlingOptions.map(({ player }) =>
      player.attributes.deathBowling * 0.45 +
      player.attributes.variations * 0.25 +
      player.attributes.accuracy * 0.15 +
      player.attributes.control * 0.15,
    ),
  );
  const experienceRating = average(resolved.map(({ player }) => player.attributes.experience));

  const leftHanders = resolved.filter(({ player }) => player.battingHand === 'Left-hand bat').length;
  const rightHanders = resolved.length - leftHanders;
  const roleDistribution = {
    batters: resolved.filter(({ isWicketkeeper, player }) => !isWicketkeeper && player.primaryRole === 'Batter').length,
    wicketkeepers: keepers.length,
    allRounders: allRounders.length,
    bowlers: resolved.filter(({ player }) => player.primaryRole === 'Bowler').length,
  };

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];
  if (battingStrength !== null && battingStrength >= 85) strengths.push('Strong batting attributes across the selected order.');
  if (bowlingStrength !== null && bowlingStrength >= 85) strengths.push('High ratings across the strongest available bowling options.');
  if (paceAttackStrength !== null && paceAttackStrength >= 85) strengths.push('Strong pace attributes, including swing and death bowling.');
  if (spinAttackStrength !== null && spinAttackStrength >= 85) strengths.push('Strong spin, variation and control attributes.');
  if (finishingStrength !== null && finishingStrength >= 85) strengths.push('Strong finishing and power-hitting attributes in positions 5–8.');
  if (leftHanders > 0 && rightHanders > 0) strengths.push('The XI includes both left- and right-handed batters.');

  if (battingStrength !== null && battingStrength < 65) weaknesses.push('Batting attributes are below the analysis benchmark.');
  if (bowlingStrength === null) weaknesses.push('No bowling options are present in the selected XI.');
  else if (bowlingStrength < 65) weaknesses.push('Bowling attributes are below the analysis benchmark.');
  if (paceBowlers.length < 2) weaknesses.push(`Only ${paceBowlers.length} pace option${paceBowlers.length === 1 ? '' : 's'} identified.`);
  if (bowlingOptions.length > 0 && spinBowlers.length === 0) weaknesses.push('No specialist spin option is identified.');
  if (finishingStrength !== null && finishingStrength < 65) weaknesses.push('Finishing attributes in positions 5–8 are comparatively low.');

  if (bowlingOptions.length > 0 && bowlingOptions.length < 5) {
    recommendations.push(`Review bowling depth: ${bowlingOptions.length} bowling option${bowlingOptions.length === 1 ? '' : 's'} identified.`);
  }
  if (leftHanders === 0 && resolved.length > 0) {
    recommendations.push('Consider a left-handed batter to add a different batting matchup.');
  }
  if (paceBowlers.length < 2) recommendations.push('Consider adding another pace option.');
  if (middleOrder.length < 2) recommendations.push('Add batting depth in positions 3–6 for a more complete middle order.');

  return {
    overallRating,
    battingStrength,
    bowlingStrength,
    paceAttackStrength,
    spinAttackStrength,
    allRoundStrength,
    fieldingStrength,
    wicketkeepingStrength,
    finishingStrength,
    battingDepth,
    openingCombination,
    middleOrderStability,
    deathOverBowlingStrength,
    experienceRating,
    openingPair,
    leftRightBalance: { rightHanders, leftHanders },
    roleDistribution,
    bowlingBreakdown: {
      paceBowlers: paceBowlers.length,
      spinBowlers: spinBowlers.length,
      sixthBowlingOption: bowlingOptions.length >= 6,
    },
    strengths,
    weaknesses,
    recommendations,
  };
}
