import React from 'react';
import { Player, Competition } from '../../types/cricket';
import { Zap, Users, Plus, Trash2 } from 'lucide-react';

interface SubstitutesPanelProps {
  allPlayers: Player[];
  selectedPlayerIds: string[];
  impactPlayerId?: string;
  substituteIds: string[];
  competition?: Competition;
  onSetImpactPlayer: (playerId?: string) => void;
  onAddSubstitute: (playerId: string) => void;
  onRemoveSubstitute: (playerId: string) => void;
}

export const SubstitutesPanel: React.FC<SubstitutesPanelProps> = ({
  allPlayers,
  selectedPlayerIds,
  impactPlayerId,
  substituteIds,
  competition,
  onSetImpactPlayer,
  onAddSubstitute,
  onRemoveSubstitute,
}) => {
  const playersMap = new Map<string, Player>();
  allPlayers.forEach((p) => playersMap.set(p.id, p));

  const impactPlayer = impactPlayerId ? playersMap.get(impactPlayerId) : undefined;
  const substitutes = substituteIds.map((id) => playersMap.get(id)).filter(Boolean) as Player[];

  // Eligible pool for subs (exclude starting 11)
  const availableCandidates = allPlayers.filter(
    (p) => !selectedPlayerIds.includes(p.id) && p.id !== impactPlayerId && !substituteIds.includes(p.id)
  );

  const allowsImpact = competition ? competition.rules.allowImpactPlayer : true;

  return (
    <div className="flex flex-col gap-4 bg-[#121720] border border-white/10 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div>
          <h4 className="text-sm font-bold font-heading text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-[#3BA7FF]" />
            Impact Player & Bench Substitutes
          </h4>
          <p className="text-xs text-[#929BA8] mt-0.5">
            Select 1 tactical Impact Player and up to 5 bench substitutes (does not count towards Starting 11).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Impact Player Slot */}
        <div className="bg-[#181F29] p-4 rounded-xl border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Impact Player Slot
              </span>
              {!allowsImpact && (
                <span className="text-[10px] text-rose-400 font-semibold">
                  Not applicable in this format
                </span>
              )}
            </div>

            {impactPlayer ? (
              <div className="flex items-center justify-between p-2.5 bg-[#121720] rounded-xl border border-amber-400/20">
                <div className="flex items-center gap-2.5">
                  <img
                    src={impactPlayer.imageUrl}
                    alt={impactPlayer.displayName}
                    className="w-10 h-10 rounded-lg object-cover border border-white/10"
                  />
                  <div>
                    <span className="text-sm font-bold text-white block">
                      {impactPlayer.displayName}
                    </span>
                    <span className="text-xs text-[#929BA8]">
                      {impactPlayer.primaryRole} • {impactPlayer.specialization}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onSetImpactPlayer(undefined)}
                  className="p-1 text-[#929BA8] hover:text-rose-400"
                  title="Remove Impact Player"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="p-4 text-center border border-dashed border-white/10 rounded-xl">
                <p className="text-xs text-[#929BA8]">No Impact Player assigned yet.</p>
                {availableCandidates.length > 0 && allowsImpact && (
                  <select
                    onChange={(e) => {
                      if (e.target.value) onSetImpactPlayer(e.target.value);
                    }}
                    value=""
                    className="mt-2 text-xs bg-[#121720] text-white p-2 rounded-lg border border-white/10 w-full focus:outline-none focus:border-[#20C878]"
                  >
                    <option value="">+ Assign an Impact Player...</option>
                    {availableCandidates.map((cand) => (
                      <option key={cand.id} value={cand.id}>
                        {cand.displayName} ({cand.primaryRole} - Rating: {cand.overallRating})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bench Substitutes */}
        <div className="bg-[#181F29] p-4 rounded-xl border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3BA7FF]">
                Bench Reserves ({substitutes.length} / 5)
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {substitutes.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-2 bg-[#121720] rounded-xl border border-white/5 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={sub.imageUrl}
                      alt={sub.displayName}
                      className="w-7 h-7 rounded-lg object-cover"
                    />
                    <span className="font-semibold text-white">{sub.displayName}</span>
                    <span className="text-[#929BA8]">({sub.primaryRole})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveSubstitute(sub.id)}
                    className="text-[#929BA8] hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {substitutes.length < 5 && availableCandidates.length > 0 && (
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      onAddSubstitute(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  value=""
                  className="text-xs bg-[#121720] text-white p-2 rounded-lg border border-white/10 w-full focus:outline-none focus:border-[#3BA7FF]"
                >
                  <option value="">+ Add Bench Substitute...</option>
                  {availableCandidates.map((cand) => (
                    <option key={cand.id} value={cand.id}>
                      {cand.displayName} ({cand.primaryRole})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
