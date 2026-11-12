import React from 'react';
import { Competition, Player } from '../../types/cricket';
import { Plus, Shield, Trash2, Zap } from 'lucide-react';

interface SubstitutesPanelProps {
  allPlayers: Player[];
  selectedPlayerIds: string[];
  eligiblePlayerIds?: string[];
  impactPlayerId?: string;
  substituteIds: string[];
  competition?: Competition;
  onSetImpactPlayer: (playerId?: string) => void;
  onReplaceImpactPlayer: (playerId: string) => void;
  onAddSubstitute: (playerId: string) => void;
  onReplaceSubstitute: (oldPlayerId: string, newPlayerId: string) => void;
  onRemoveSubstitute: (playerId: string) => void;
}

export const SubstitutesPanel: React.FC<SubstitutesPanelProps> = ({
  allPlayers,
  selectedPlayerIds,
  eligiblePlayerIds,
  impactPlayerId,
  substituteIds,
  competition,
  onSetImpactPlayer,
  onReplaceImpactPlayer,
  onAddSubstitute,
  onReplaceSubstitute,
  onRemoveSubstitute,
}) => {
  const playersById = new Map(allPlayers.map((player) => [player.id, player]));
  const allowedIds = eligiblePlayerIds ? new Set(eligiblePlayerIds) : null;
  const impactPlayer = impactPlayerId ? playersById.get(impactPlayerId) : undefined;
  const substitutes = substituteIds
    .map((id) => playersById.get(id))
    .filter((player): player is Player => Boolean(player));
  const maxSubstitutes = competition?.rules.maxSubstitutes ?? 5;
  const allowsImpact = competition?.rules.allowImpactPlayer ?? true;
  const availableCandidates = allPlayers.filter(
    (player) =>
      !selectedPlayerIds.includes(player.id) &&
      player.id !== impactPlayerId &&
      !substituteIds.includes(player.id) &&
      (!allowedIds || allowedIds.has(player.id)),
  );

  const candidateSelect = (
    label: string,
    onChange: (playerId: string) => void,
  ) => (
    <select
      value=""
      aria-label={label}
      onChange={(event) => {
        if (event.target.value) onChange(event.target.value);
      }}
      className="min-h-10 w-full rounded-lg border border-[#343943] bg-[#111318] px-3 text-xs text-[#E3E5E9] focus:border-[#AEB3BC] focus:outline-none"
    >
      <option value="">{label}</option>
      {availableCandidates.map((player) => (
        <option key={player.id} value={player.id}>
          {player.displayName} · {player.primaryRole}
        </option>
      ))}
    </select>
  );

  return (
    <section className="rounded-2xl border border-[#262A32] bg-[#111318] p-4 sm:p-5" aria-labelledby="bench-title">
      <div className="flex items-start justify-between gap-3 border-b border-white/[0.07] pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em] text-[#AEB3BC]">
            <Shield className="h-4 w-4" />
            BENCH & IMPACT
          </div>
          <h3 id="bench-title" className="mt-1 font-heading text-base font-semibold text-[#F5F5F6]">
            Substitutes
          </h3>
          <p className="mt-1 text-[11px] leading-5 text-[#858B96]">
            Bench selections are separate from the starting XI.
          </p>
        </div>
        <span className="rounded-lg border border-[#343943] bg-[#171A20] px-2.5 py-1.5 text-[10px] text-[#AEB3BC]">
          XI {selectedPlayerIds.length} · Bench {substitutes.length}/{maxSubstitutes}
        </span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/[0.07] bg-[#171A20] p-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="flex items-center gap-2 text-xs font-semibold text-[#E3E5E9]">
              <Zap className="h-4 w-4 text-[#B7BBC4]" />
              Impact player
            </h4>
            <span className="text-[9px] text-[#858B96]">
              {allowsImpact ? 'Competition enabled' : 'Not allowed'}
            </span>
          </div>
          {impactPlayer ? (
            <div className="mt-3 flex items-center gap-3 rounded-lg border border-white/[0.07] bg-[#111318] p-3">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#262A32]">
                {impactPlayer.imageUrl ? (
                  <img src={impactPlayer.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover object-top" />
                ) : <span className="grid h-full place-items-center text-xs text-white/60">{impactPlayer.displayName[0]}</span>}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-[#E3E5E9]">{impactPlayer.displayName}</p>
                <p className="mt-0.5 truncate text-[10px] text-[#858B96]">
                  {impactPlayer.country} · {impactPlayer.primaryRole}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSetImpactPlayer(undefined)}
                aria-label={`Remove ${impactPlayer.displayName} as impact player`}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#858B96] hover:bg-white/[0.05] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#B7BBC4]"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <p className="mt-3 rounded-lg border border-dashed border-[#343943] px-3 py-4 text-center text-[11px] text-[#858B96]">
              No impact player selected
            </p>
          )}
          {allowsImpact && availableCandidates.length > 0 && (
            <div className="mt-3">
              {candidateSelect(
                impactPlayer ? 'Replace impact player' : 'Choose impact player',
                  impactPlayer ? onReplaceImpactPlayer : onSetImpactPlayer,
              )}
            </div>
          )}
          {!allowsImpact && impactPlayer && (
            <p className="mt-2 text-[10px] text-amber-200">Remove the assignment to match this competition’s rules.</p>
          )}
        </div>

        <div className="rounded-xl border border-white/[0.07] bg-[#171A20] p-4">
          <h4 className="text-xs font-semibold text-[#E3E5E9]">Bench substitutes</h4>
          {substitutes.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {substitutes.map((player) => (
                <li key={player.id} className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-[#111318] p-2">
                  <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md bg-[#262A32]">
                    {player.imageUrl ? (
                      <img src={player.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover object-top" />
                    ) : <span className="grid h-full place-items-center text-[10px] text-white/60">{player.displayName[0]}</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium text-[#E3E5E9]">{player.displayName}</p>
                    <p className="text-[9px] text-[#858B96]">{player.country} · {player.primaryRole}</p>
                  </div>
                  {availableCandidates.length > 0 && (
                    <div className="w-9 shrink-0">
                      <label className="sr-only" htmlFor={`replace-sub-${player.id}`}>Replace {player.displayName}</label>
                      <select
                        id={`replace-sub-${player.id}`}
                        value=""
                        aria-label={`Replace ${player.displayName}`}
                        onChange={(event) => {
                          if (event.target.value) onReplaceSubstitute(player.id, event.target.value);
                        }}
                        className="h-9 w-full rounded-lg border border-[#343943] bg-[#171A20] px-1 text-xs text-[#E3E5E9]"
                      >
                        <option value="">↻</option>
                        {availableCandidates.map((candidate) => (
                          <option key={candidate.id} value={candidate.id}>{candidate.displayName}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemoveSubstitute(player.id)}
                    aria-label={`Remove ${player.displayName} from bench`}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#858B96] hover:bg-white/[0.05] hover:text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-lg border border-dashed border-[#343943] px-3 py-4 text-center text-[11px] text-[#858B96]">
              No bench players selected
            </p>
          )}
          {substitutes.length < maxSubstitutes && availableCandidates.length > 0 && (
            <div className="mt-3">
              {candidateSelect('Add a bench substitute', onAddSubstitute)}
            </div>
          )}
          {substitutes.length >= maxSubstitutes && (
            <p className="mt-3 text-[10px] text-[#858B96]">The competition’s substitute limit has been reached.</p>
          )}
          {availableCandidates.length === 0 && substitutes.length < maxSubstitutes && (
            <p className="mt-3 text-[10px] text-[#858B96]">No other eligible players are available.</p>
          )}
          <p className="mt-3 inline-flex items-center gap-1 text-[9px] text-[#747B86]">
            <Plus className="h-3 w-3" /> Maximum {maxSubstitutes} reserves under current competition rules
          </p>
        </div>
      </div>
    </section>
  );
};
