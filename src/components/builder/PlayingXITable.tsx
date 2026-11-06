import React from 'react';
import { Player, UserTeamPlayer } from '../../types/cricket';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Crown,
  Shield,
  Sparkles,
  ArrowUpDown,
  MoveUp,
  MoveDown,
} from 'lucide-react';

interface PlayingXITableProps {
  selectedPlayers: UserTeamPlayer[];
  allPlayers: Player[];
  onRemovePlayer: (playerId: string) => void;
  onSetCaptain: (playerId: string) => void;
  onSetViceCaptain: (playerId: string) => void;
  onSetWicketkeeper: (playerId: string) => void;
  onMovePlayer: (fromIndex: number, toIndex: number) => void;
  onViewPlayer?: (player: Player) => void;
}

export const PlayingXITable: React.FC<PlayingXITableProps> = ({
  selectedPlayers,
  allPlayers,
  onRemovePlayer,
  onSetCaptain,
  onSetViceCaptain,
  onSetWicketkeeper,
  onMovePlayer,
  onViewPlayer,
}) => {
  const playersMap = new Map<string, Player>();
  allPlayers.forEach((p) => playersMap.set(p.id, p));

  const sortedPlayers = [...selectedPlayers].sort((a, b) => a.battingOrder - b.battingOrder);

  const getBattingSlotSuggestion = (order: number) => {
    if (order === 1 || order === 2) return 'Opening Batter';
    if (order === 3) return 'Number 3 Anchor';
    if (order === 4 || order === 5) return 'Middle Order Engine';
    if (order === 6 || order === 7) return 'Finisher / All-rounder';
    return 'Lower Order / Bowler';
  };

  return (
    <div className="flex flex-col bg-[#121720] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#181F29] border-b border-white/5">
        <div>
          <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
            <span>🏏</span> Starting Playing XI
          </h3>
          <p className="text-xs text-[#929BA8] mt-0.5">
            Arrange batting order (1–11) and designate Captain (C), Vice Captain (VC) and Keeper (WK).
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#20C878]/10 text-[#20C878] border border-[#20C878]/20">
          <span>{sortedPlayers.length} / 11 Picked</span>
        </div>
      </div>

      {/* Players List Table */}
      {sortedPlayers.length === 0 ? (
        <div className="p-12 text-center text-[#929BA8] flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[#181F29] flex items-center justify-center mb-3 text-2xl border border-white/5">
            📋
          </div>
          <p className="text-sm font-semibold text-white">Your Starting Lineup is Empty</p>
          <p className="text-xs text-[#929BA8] mt-1 max-w-sm">
            Select players from the pool on the right or use the "Auto-Generate" feature to automatically compose a balanced cricket XI.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {sortedPlayers.map((item, index) => {
            const player = playersMap.get(item.playerId);
            if (!player) return null;

            return (
              <div
                key={item.playerId}
                className="flex items-center justify-between p-3.5 hover:bg-[#181F29]/60 transition-colors group"
              >
                {/* Left: Reorder Controls + Order Number */}
                <div className="flex items-center gap-2.5">
                  <div className="flex flex-col items-center justify-center">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => onMovePlayer(index, index - 1)}
                      className="p-1 text-[#929BA8] hover:text-white disabled:opacity-20 disabled:hover:text-[#929BA8]"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold font-heading text-[#20C878] w-5 text-center">
                      {index + 1}
                    </span>
                    <button
                      type="button"
                      disabled={index === sortedPlayers.length - 1}
                      onClick={() => onMovePlayer(index, index + 1)}
                      className="p-1 text-[#929BA8] hover:text-white disabled:opacity-20 disabled:hover:text-[#929BA8]"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Player Avatar */}
                  <div
                    onClick={() => onViewPlayer && onViewPlayer(player)}
                    className="relative w-11 h-11 rounded-xl overflow-hidden bg-[#181F29] border border-white/10 shrink-0 cursor-pointer"
                  >
                    <img
                      src={player.imageUrl}
                      alt={player.displayName}
                      className="w-full h-full object-cover"
                    />
                    {player.isOverseasIPL && (
                      <span
                        title="Overseas Player"
                        className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-purple-500 border border-black"
                      />
                    )}
                  </div>

                  {/* Player Name & Role */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        onClick={() => onViewPlayer && onViewPlayer(player)}
                        className="text-sm font-bold text-white truncate hover:text-[#20C878] cursor-pointer"
                      >
                        {player.displayName}
                      </span>
                      {player.careerStatus === 'Legend' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold uppercase">
                          Legend
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[#929BA8]">
                        {player.primaryRole} • {player.specialization}
                      </span>
                      <span className="hidden md:inline text-[9px] text-white/40 italic">
                        ({getBattingSlotSuggestion(index + 1)})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Role Badges (C, VC, WK) + Rating + Remove */}
                <div className="flex items-center gap-2">
                  {/* Captain Toggle */}
                  <button
                    type="button"
                    onClick={() => onSetCaptain(item.playerId)}
                    title={item.isCaptain ? 'Captain (Click to change)' : 'Appoint as Captain'}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      item.isCaptain
                        ? 'bg-[#F9CD05] text-[#090B0F] shadow-md shadow-[#F9CD05]/20'
                        : 'bg-white/5 text-[#929BA8] hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Crown className="w-3 h-3" />
                    <span>C</span>
                  </button>

                  {/* Vice Captain Toggle */}
                  <button
                    type="button"
                    onClick={() => onSetViceCaptain(item.playerId)}
                    title={
                      item.isViceCaptain ? 'Vice Captain (Click to change)' : 'Appoint as Vice Captain'
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      item.isViceCaptain
                        ? 'bg-[#3BA7FF] text-[#090B0F] shadow-md shadow-[#3BA7FF]/20'
                        : 'bg-white/5 text-[#929BA8] hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    <span>VC</span>
                  </button>

                  {/* Wicketkeeper Toggle */}
                  <button
                    type="button"
                    onClick={() => onSetWicketkeeper(item.playerId)}
                    title={
                      item.isWicketkeeper ? 'Designated Wicketkeeper' : 'Assign Wicketkeeping Gloves'
                    }
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      item.isWicketkeeper
                        ? 'bg-[#10B981] text-white shadow-md shadow-[#10B981]/20'
                        : 'bg-white/5 text-[#929BA8] hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>🧤</span>
                    <span>WK</span>
                  </button>

                  {/* Overall Rating Disc */}
                  <div className="hidden sm:flex items-center justify-center w-7 h-7 rounded-lg bg-black/40 text-xs font-bold font-heading text-[#20C878]">
                    {player.overallRating}
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => onRemovePlayer(item.playerId)}
                    title="Remove Player from Lineup"
                    className="p-1.5 rounded-lg text-[#929BA8] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
