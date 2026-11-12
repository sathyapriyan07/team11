import {
  Player,
  UserTeamPlayer,
  Competition,
  ValidationResult,
  BuilderMode,
  CustomPool,
  SquadMembership,
} from '../types/cricket';

export interface RuleValidationParams {
  selectedPlayers: UserTeamPlayer[];
  allPlayers: Player[];
  competition?: Competition;
  mode: BuilderMode;
  squad?: SquadMembership;
  customPool?: CustomPool;
  eligiblePlayerIds?: string[];
  impactPlayerId?: string;
  substituteIds?: string[];
}

export function validateTeamRules(params: RuleValidationParams): ValidationResult {
  const {
    selectedPlayers,
    allPlayers,
    competition,
    mode,
    squad,
    customPool,
    eligiblePlayerIds,
    impactPlayerId,
    substituteIds = [],
  } = params;
  const errors: string[] = [];
  const warnings: string[] = [];

  const playersMap = new Map<string, Player>();
  allPlayers.forEach((p) => playersMap.set(p.id, p));

  const resolvedPlayers: { teamPlayer: UserTeamPlayer; player: Player }[] = [];
  selectedPlayers.forEach((tp) => {
    const p = playersMap.get(tp.playerId);
    if (p) {
      resolvedPlayers.push({ teamPlayer: tp, player: p });
    }
  });

  const count = resolvedPlayers.length;
  const exactCount = competition?.rules.exactPlayersCount ?? 11;
  const minWicketkeepers = competition?.rules.minWicketkeepers ?? 1;
  const maxWicketkeepers = competition?.rules.maxWicketkeepers ?? 3;
  const requireCaptain = competition?.rules.requireCaptain ?? true;
  const requireViceCaptain = competition?.rules.requireViceCaptain ?? false;

  // 1. Player Count Check
  if (count < exactCount) {
    errors.push(`Need ${exactCount - count} more player${exactCount - count > 1 ? 's' : ''} to complete Starting XI (${count}/${exactCount}).`);
  } else if (count > exactCount) {
    errors.push(`Starting XI exceeds maximum of ${exactCount} players (Currently ${count}).`);
  }
  if (new Set(selectedPlayers.map((player) => player.playerId)).size !== selectedPlayers.length) {
    errors.push('The same player appears more than once in the Starting XI.');
  }
  const missingPlayers = selectedPlayers.filter((player) => !playersMap.has(player.playerId));
  if (missingPlayers.length > 0) {
    errors.push(`${missingPlayers.length} selected player${missingPlayers.length === 1 ? ' could' : 's could'} not be found in the player catalog.`);
  }
  if (eligiblePlayerIds) {
    for (const rp of resolvedPlayers) {
      if (!eligiblePlayerIds.includes(rp.player.id)) {
        errors.push(`${rp.player.displayName} is not eligible for the selected builder pool.`);
      }
    }
  }

  // 2. Captain and Vice-Captain Check
  const captains = resolvedPlayers.filter((rp) => rp.teamPlayer.isCaptain);
  const viceCaptains = resolvedPlayers.filter((rp) => rp.teamPlayer.isViceCaptain);

  if (captains.length === 0 && requireCaptain) {
    errors.push('No Captain (C) selected. This competition requires a captain.');
  } else if (captains.length > 1) {
    errors.push('Only 1 Captain can be appointed.');
  }

  if (viceCaptains.length === 0 && requireViceCaptain) {
    errors.push('No Vice-Captain (VC) selected. This competition requires a vice-captain.');
  } else if (viceCaptains.length === 0) {
    warnings.push('No Vice-Captain (VC) selected.');
  } else if (viceCaptains.length > 1) {
    errors.push('Only 1 Vice-Captain can be appointed.');
  }

  if (captains.length === 1 && viceCaptains.length === 1 && captains[0].player.id === viceCaptains[0].player.id) {
    errors.push('The same player cannot be both Captain and Vice-Captain.');
  }

  // 3. Wicketkeeper Check
  const keepers = resolvedPlayers.filter(
    (rp) => rp.teamPlayer.isWicketkeeper || rp.player.primaryRole === 'Wicketkeeper' || rp.player.secondaryRoles.includes('Wicketkeeper')
  );
  const designatedKeepers = resolvedPlayers.filter((rp) => rp.teamPlayer.isWicketkeeper);

  if (designatedKeepers.length < minWicketkeepers) {
    errors.push(`Designate at least ${minWicketkeepers} wicketkeeper${minWicketkeepers === 1 ? '' : 's'} for this competition.`);
  } else if (designatedKeepers.length > maxWicketkeepers) {
    errors.push(`Too many designated wicketkeepers: ${designatedKeepers.length}/${maxWicketkeepers} allowed.`);
  }

  // Check if assigned keeper actually has wicketkeeping skill
  for (const dk of designatedKeepers) {
    const isKeeperCapable =
      dk.player.primaryRole === 'Wicketkeeper' ||
      dk.player.secondaryRoles.includes('Wicketkeeper') ||
      (dk.player.attributes.wkCatching && dk.player.attributes.wkCatching > 60);

    if (!isKeeperCapable) {
      warnings.push(`${dk.player.displayName} has no recognized wicketkeeping specialization.`);
    }
  }

  // 4. Overseas Players Quota (IPL or specific competitions)
  let overseasCount = 0;
  resolvedPlayers.forEach((rp) => {
    if (rp.player.isOverseasIPL || (rp.player.country !== 'India' && competition?.slug === 'ipl')) {
      overseasCount++;
    }
  });

  const maxOverseas = competition?.rules.maxOverseas ?? 4;
  if (competition?.slug === 'ipl' || mode === 'franchise') {
    if (overseasCount > maxOverseas) {
      errors.push(`Overseas limit exceeded: ${overseasCount}/${maxOverseas} foreign players selected.`);
    }
  }

  // 5. Squad Eligibility (Franchise mode)
  if (mode === 'franchise' && !squad) {
    errors.push('No eligible squad is loaded for the selected franchise and season.');
  } else if (mode === 'franchise' && squad) {
    for (const rp of resolvedPlayers) {
      if (!squad.playerIds.includes(rp.player.id)) errors.push(`${rp.player.displayName} is not eligible in the selected franchise squad.`);
    }
  }
  if (mode === 'custom-pool' && !customPool) {
    errors.push('Select a custom player pool before completing this XI.');
  } else if (mode === 'custom-pool' && customPool) {
    for (const rp of resolvedPlayers) {
      if (!customPool.playerIds.includes(rp.player.id)) {
        errors.push(`${rp.player.displayName} is not included in the selected custom pool.`);
      }

      const maxSubstitutes = competition?.rules.maxSubstitutes ?? 5;
      const allowsImpactPlayer = competition?.rules.allowImpactPlayer ?? true;
      if (substituteIds.length > maxSubstitutes) {
        errors.push(`The bench exceeds the competition limit of ${maxSubstitutes} substitutes.`);
      }
      if (impactPlayerId && !allowsImpactPlayer) {
        errors.push('The selected competition does not allow an impact player.');
      }
      const reserveIds = [impactPlayerId, ...substituteIds].filter((id): id is string => Boolean(id));
      if (new Set(reserveIds).size !== reserveIds.length) {
        errors.push('A player cannot be selected as both impact player and bench substitute.');
      }
      for (const reserveId of reserveIds) {
        if (selectedPlayers.some((player) => player.playerId === reserveId)) {
          errors.push('A starting XI player cannot also be selected as a substitute.');
          break;
        }
        if (!playersMap.has(reserveId)) {
          errors.push('A selected substitute could not be found in the player catalog.');
          break;
        }
        if (eligiblePlayerIds && !eligiblePlayerIds.includes(reserveId)) {
          errors.push('All substitutes must belong to the selected builder pool.');
          break;
        }
      }
    }
  }

  // 6. Bowling Options Check
  const bowlingOptions = resolvedPlayers.filter(
    (rp) =>
      rp.player.primaryRole === 'Bowler' ||
      rp.player.primaryRole === 'All-rounder' ||
      rp.player.attributes.control > 65
  );

  const minBowlers = competition?.rules.minBowlersOrAllRounders ?? 5;
  if (count >= exactCount && bowlingOptions.length < minBowlers) {
    errors.push(`Not enough bowling options: Only ${bowlingOptions.length} recognized bowlers/all-rounders (Minimum ${minBowlers} required to complete 20/50 overs).`);
  } else if (bowlingOptions.length === 5) {
    warnings.push('Only 5 bowling options selected. Having a 6th bowling option provides crucial injury/off-day insurance.');
  }

  // Status calculation
  let status: 'valid' | 'warning' | 'invalid' = 'valid';
  if (errors.length > 0) {
    status = 'invalid';
  } else if (warnings.length > 0) {
    status = 'warning';
  }

  return {
    isValid: errors.length === 0,
    status,
    errors,
    warnings,
    requiredPlayersCount: exactCount,
    minWicketkeepers,
    maxWicketkeepers,
    requireCaptain,
    requireViceCaptain,
    overseasCount,
    maxOverseas,
    playersCount: count,
    hasCaptain: captains.length === 1,
    hasViceCaptain: viceCaptains.length === 1,
    hasWicketkeeper: designatedKeepers.length >= 1,
    wicketkeepersCount: designatedKeepers.length,
    bowlerOptionsCount: bowlingOptions.length,
  };
}
