import { Player, UserTeamPlayer, TeamAnalysis, CricketFormat } from '../types/cricket';

interface ResolvedTeamPlayer extends UserTeamPlayer {
  player: Player;
}

export function analyzeTeam(
  teamPlayers: UserTeamPlayer[],
  allPlayers: Player[],
  format: CricketFormat = 'T20'
): TeamAnalysis {
  const playersMap = new Map<string, Player>();
  allPlayers.forEach((p) => playersMap.set(p.id, p));

  const resolved: ResolvedTeamPlayer[] = [];
  teamPlayers.forEach((tp) => {
    const player = playersMap.get(tp.playerId);
    if (player) {
      resolved.push({ ...tp, player });
    }
  });

  resolved.sort((a, b) => a.battingOrder - b.battingOrder);

  if (resolved.length === 0) {
    return {
      overallRating: 0,
      battingStrength: 0,
      bowlingStrength: 0,
      paceAttackStrength: 0,
      spinAttackStrength: 0,
      allRoundStrength: 0,
      fieldingStrength: 0,
      wicketkeepingStrength: 0,
      finishingStrength: 0,
      battingDepth: 0,
      experienceRating: 0,
      leftRightBalance: { rightHanders: 0, leftHanders: 0 },
      roleDistribution: { batters: 0, wicketkeepers: 0, allRounders: 0, bowlers: 0 },
      bowlingBreakdown: { paceBowlers: 0, spinBowlers: 0, sixthBowlingOption: false },
      strengths: ['Add players to begin tactical team analysis.'],
      weaknesses: ['Team lineup incomplete.'],
      recommendations: ['Select 11 players including top order, middle order, all-rounders and frontline bowlers.'],
    };
  }

  // Calculate format-specific rating
  const formatRatingKey = format === 'ODI' ? 'ODI' : format === 'TEST' ? 'TEST' : 'T20';
  const avgOverall = Math.round(
    resolved.reduce((sum, item) => sum + (item.player.formatRatings[formatRatingKey] || item.player.overallRating), 0) /
      resolved.length
  );

  // Batting Strength (weighted heavily towards top 7)
  let battingTotal = 0;
  resolved.forEach((item, index) => {
    const attr = item.player.attributes;
    const baseBat = (attr.technique * 0.25 + attr.powerHitting * 0.25 + attr.timing * 0.2 + attr.againstPace * 0.15 + attr.againstSpin * 0.15);
    const weight = index < 4 ? 1.2 : index < 7 ? 1.0 : index < 9 ? 0.6 : 0.3;
    battingTotal += baseBat * weight;
  });
  const battingStrength = Math.min(99, Math.round(battingTotal / (4 * 1.2 + 3 * 1.0 + 2 * 0.6 + (resolved.length - 9) * 0.3 || 1)));

  // Bowling Strength (weighted towards specialists and all-rounders)
  const bowlers = resolved.filter(
    (item) => item.player.primaryRole === 'Bowler' || item.player.primaryRole === 'All-rounder' || item.player.attributes.control > 65
  );
  let bowlingStrength = 0;
  if (bowlers.length > 0) {
    const bowlingScores = bowlers.map((b) => {
      const a = b.player.attributes;
      return (a.accuracy * 0.25 + a.variations * 0.25 + a.control * 0.2 + a.deathBowling * 0.15 + a.powerplayBowling * 0.15);
    });
    // take top 5 bowlers
    bowlingScores.sort((a, b) => b - a);
    const top5 = bowlingScores.slice(0, 5);
    bowlingStrength = Math.min(99, Math.round(top5.reduce((sum, val) => sum + val, 0) / (top5.length || 1)));
  }

  // Pace Attack vs Spin Attack
  const paceBowlersList = resolved.filter(
    (item) => item.player.bowlingStyle.includes('fast') || item.player.bowlingStyle.includes('medium')
  );
  const spinBowlersList = resolved.filter(
    (item) => item.player.bowlingStyle.includes('break') || item.player.bowlingStyle.includes('spin') || item.player.bowlingStyle.includes('orthodox')
  );

  const paceAttackStrength = paceBowlersList.length > 0
    ? Math.min(99, Math.round(paceBowlersList.reduce((s, p) => s + (p.player.attributes.pace * 0.4 + p.player.attributes.swing * 0.3 + p.player.attributes.deathBowling * 0.3), 0) / paceBowlersList.length))
    : 40;

  const spinAttackStrength = spinBowlersList.length > 0
    ? Math.min(99, Math.round(spinBowlersList.reduce((s, p) => s + (p.player.attributes.spin * 0.5 + p.player.attributes.variations * 0.3 + p.player.attributes.control * 0.2), 0) / spinBowlersList.length))
    : 35;

  // All-round Strength
  const allRounders = resolved.filter((item) => item.player.primaryRole === 'All-rounder');
  const allRoundStrength = Math.min(99, Math.round(
    resolved.reduce((s, item) => s + item.player.attributes.versatility, 0) / resolved.length + (allRounders.length >= 2 ? 6 : 0)
  ));

  // Fielding & Wicketkeeping Strength
  const fieldingStrength = Math.min(99, Math.round(
    resolved.reduce((s, item) => s + (item.player.attributes.catching + item.player.attributes.groundFielding + item.player.attributes.throwing) / 3, 0) / resolved.length
  ));

  const keepers = resolved.filter((item) => item.isWicketkeeper || item.player.primaryRole === 'Wicketkeeper');
  const wicketkeepingStrength = keepers.length > 0
    ? Math.min(99, Math.round(Math.max(...keepers.map((k) => k.player.attributes.wkCatching || 85))))
    : 50;

  // Finishing Strength (Batting #5 to #8)
  const finishers = resolved.slice(4, 8);
  const finishingStrength = finishers.length > 0
    ? Math.min(99, Math.round(finishers.reduce((s, f) => s + (f.player.attributes.powerHitting * 0.5 + f.player.attributes.finishing * 0.5), 0) / finishers.length))
    : 60;

  // Batting Depth (count players in top 9 who have batting technique/power >= 70)
  const reliableBatters = resolved.filter((item, idx) => idx < 9 && (item.player.attributes.technique >= 70 || item.player.attributes.powerHitting >= 75));
  const battingDepth = Math.min(99, Math.round((reliableBatters.length / 9) * 100));

  // Experience
  const experienceRating = Math.round(
    resolved.reduce((s, item) => s + item.player.attributes.experience, 0) / resolved.length
  );

  // Left/Right Hand balance
  let leftHanders = 0;
  let rightHanders = 0;
  resolved.forEach((item) => {
    if (item.player.battingHand === 'Left-hand bat') leftHanders++;
    else rightHanders++;
  });

  // Roles
  let batters = 0;
  let wicketkeepers = 0;
  let allRoundersCount = 0;
  let bowlersCount = 0;
  resolved.forEach((item) => {
    if (item.isWicketkeeper || item.player.primaryRole === 'Wicketkeeper') wicketkeepers++;
    else if (item.player.primaryRole === 'Batter') batters++;
    else if (item.player.primaryRole === 'All-rounder') allRoundersCount++;
    else if (item.player.primaryRole === 'Bowler') bowlersCount++;
  });

  // Strengths, Weaknesses, Recommendations
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  if (battingStrength >= 88) strengths.push('Formidable batting lineup with deep firepower and elite top order pedigree.');
  if (bowlingStrength >= 88) strengths.push('Championship-grade bowling attack with supreme control and wicket-taking ability.');
  if (paceAttackStrength >= 85) strengths.push('Devastating express pace unit with high-impact powerplay and death-overs execution.');
  if (spinAttackStrength >= 85) strengths.push('Elite spin combination offering mystery, drift, and middle-overs choke.');
  if (finishingStrength >= 88) strengths.push('Exceptional death-overs hitting capability to maximize the final 5 overs.');
  if (leftHanders >= 3 && rightHanders >= 3) strengths.push('Superb Left/Right batting pairing to disrupt bowling plans and match-ups.');
  if (fieldingStrength >= 88) strengths.push('Athletic fielding unit capable of saving 15-20 crucial runs in high-pressure matches.');

  if (battingStrength < 80) weaknesses.push('Batting lineup may lack firepower or consistency against disciplined attacks.');
  if (bowlingStrength < 80) weaknesses.push('Bowling options may leak boundaries during middle and death overs.');
  if (paceBowlersList.length < 2) weaknesses.push('Thin pace reserves; vulnerable on green or bouncy decks.');
  if (spinBowlersList.length === 0) weaknesses.push('No recognized specialist spinner; will struggle on turning subcontinental wickets.');
  if (leftHanders === 0) weaknesses.push('Exclusively right-handed batting order makes it easy for opposition captains to set defensive fields.');
  if (bowlers.length < 5) weaknesses.push(`Only ${bowlers.length} bowling options. Minimum 5 bowlers needed to complete the quota.`);
  if (finishingStrength < 75) weaknesses.push('Lack of established death-overs powerhitters may result in sub-par target finishes.');

  if (bowlers.length === 5) {
    recommendations.push('Add an all-rounder to provide a 6th bowling option for tactical insurance.');
  }
  if (leftHanders === 0 || leftHanders === resolved.length) {
    recommendations.push('Integrate a left-handed batter in the top 4 to create dynamic LHB-RHB partnerships.');
  }
  if (paceBowlersList.length < 2) {
    recommendations.push('Include at least 2 frontline quicks with 140+ kmph or swing capability.');
  }
  if (battingDepth < 75) {
    recommendations.push('Strengthen batting depth at #7 and #8 with capable bowling all-rounders.');
  }
  if (strengths.length === 0) strengths.push('Good basic structure with potential for strategic refinement.');
  if (weaknesses.length === 0) weaknesses.push('No obvious tactical vulnerabilities detected in this elite lineup.');
  if (recommendations.length === 0) recommendations.push('Team composition is balanced and primed for tournament competition.');

  return {
    overallRating: avgOverall,
    battingStrength,
    bowlingStrength,
    paceAttackStrength,
    spinAttackStrength,
    allRoundStrength,
    fieldingStrength,
    wicketkeepingStrength,
    finishingStrength,
    battingDepth,
    experienceRating,
    leftRightBalance: { rightHanders, leftHanders },
    roleDistribution: { batters, wicketkeepers, allRounders: allRoundersCount, bowlers: bowlersCount },
    bowlingBreakdown: {
      paceBowlers: paceBowlersList.length,
      spinBowlers: spinBowlersList.length,
      sixthBowlingOption: bowlers.length >= 6,
    },
    strengths,
    weaknesses,
    recommendations,
  };
}
