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
      <div className="flex flex-col items-start gap-2 p-3 bg-[#181F29] border-b border-white/5 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-bold font-heading text-white flex items-center gap-2">
            <span>🏏</span> Starting Playing XI
          </h3>
          <p className="text-[10px] sm:text-xs text-[#929BA8] mt-0.5">
            Arrange batting order (1–11) and designate Captain (C), Vice Captain (VC) and Keeper (WK).
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#20C878]/10 text-[#20C878] border border-[#20C878]/20">
          <span>{sortedPlayers.length} / 11 Picked</span>
        </div>
      </div>

      {/* Selected players */}
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
        <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4">
          {sortedPlayers.map((item, index) => {
            const player = playersMap.get(item.playerId);
            if (!player) return null;

            return (
              <div
                key={item.playerId}
                className="relative min-h-40 min-w-0 rounded-xl border border-white/5 bg-[#181F29] p-3 pr-[4.5rem] transition-colors hover:border-white/15"
              >
                <div className="flex items-center">
                  <div className="flex shrink-0 items-center gap-0.5">
                    <span className="w-4 text-center text-[10px] font-bold font-heading text-[#20C878]">{index + 1}</span>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => onMovePlayer(index, index - 1)}
                      className="rounded p-1 text-[#929BA8] hover:text-white disabled:opacity-20"
                      title="Move Up"
                      aria-label={`Move ${player.displayName} up`}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      disabled={index === sortedPlayers.length - 1}
                      onClick={() => onMovePlayer(index, index + 1)}
                      className="rounded p-1 text-[#929BA8] hover:text-white disabled:opacity-20"
                      title="Move Down"
                      aria-label={`Move ${player.displayName} down`}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="absolute bottom-0 left-3 right-[4.5rem] flex min-h-24 min-w-0 items-center gap-2">
                  <div
                    onClick={() => onViewPlayer && onViewPlayer(player)}
                    className="relative h-36 w-28 shrink-0 cursor-pointer lg:h-24 lg:w-16"
                  >
                    <img
                      src={player.imageUrl}
                      alt={player.displayName}
                      className="h-full w-full object-contain object-bottom"
                    />
                    {player.isOverseasIPL && (
                      <span
                        title="Overseas Player"
                        className="absolute bottom-1 right-0 h-3 w-3 rounded-full border border-black bg-purple-500"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        onClick={() => onViewPlayer && onViewPlayer(player)}
                        className="min-w-0 truncate text-sm font-bold text-white hover:text-[#20C878] cursor-pointer"
                      >
                        {player.displayName}
                      </span>
                      {player.careerStatus === 'Legend' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold uppercase">
                          Legend
                        </span>
                      )}
                    </div>
                    <span className="mt-0.5 block truncate text-[10px] text-[#929BA8]">
                      {player.primaryRole} • {player.specialization}
                    </span>
                    <span className="block truncate text-[9px] italic text-white/40">
                      ({getBattingSlotSuggestion(index + 1)})
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-2 right-2 top-2 flex w-12 flex-col items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onRemovePlayer(item.playerId)}
                    title="Remove Player from Lineup"
                    aria-label={`Remove ${player.displayName} from lineup`}
                    className="rounded p-1.5 text-[#929BA8] transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {/* Captain Toggle */}
                  <button
                    type="button"
                    onClick={() => onSetCaptain(item.playerId)}
                    title={item.isCaptain ? 'Captain (Click to change)' : 'Appoint as Captain'}
                    className={`flex w-12 items-center justify-center gap-1 rounded-lg px-1 py-1 text-[10px] font-bold transition-all cursor-pointer ${
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
                    className={`flex w-12 items-center justify-center gap-1 rounded-lg px-1 py-1 text-[10px] font-bold transition-all cursor-pointer ${
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
                    className={`flex w-12 items-center justify-center gap-1 rounded-lg px-1 py-1 text-[10px] font-bold transition-all cursor-pointer ${
                      item.isWicketkeeper
                        ? 'bg-[#10B981] text-white shadow-md shadow-[#10B981]/20'
                        : 'bg-white/5 text-[#929BA8] hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>🧤</span>
                    <span>WK</span>
                  </button>

                  <div className="flex h-7 w-12 items-center justify-center rounded-lg bg-black/40 text-xs font-bold font-heading text-[#20C878]">
                    {player.overallRating}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
