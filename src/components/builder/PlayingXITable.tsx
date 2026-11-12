import React, { useMemo, useState } from 'react';
import { CricketFormat, Player, TeamEntity, UserTeamPlayer } from '../../types/cricket';
import {
  ArrowDown,
  ArrowUp,
  Crown,
  GripVertical,
  Plus,
  Shield,
  Trash2,
} from 'lucide-react';

type LineupView = 'cards' | 'table';

interface PlayingXITableProps {
  selectedPlayers: UserTeamPlayer[];
  allPlayers: Player[];
  teams?: TeamEntity[];
  format?: CricketFormat;
  maxPlayers?: number;
  replacementCandidates?: Player[];
  onRemovePlayer: (playerId: string) => void;
  onSetCaptain: (playerId: string) => void;
  onSetViceCaptain: (playerId: string) => void;
  onSetWicketkeeper: (playerId: string) => void;
  onMovePlayer: (fromIndex: number, toIndex: number) => void;
  onReplacePlayer?: (oldPlayerId: string, newPlayerId: string) => void;
  onViewPlayer?: (player: Player) => void;
}

export const PlayingXITable: React.FC<PlayingXITableProps> = ({
  selectedPlayers,
  allPlayers,
  teams = [],
  format = 'T20',
  maxPlayers = 11,
  replacementCandidates = [],
  onRemovePlayer,
  onSetCaptain,
  onSetViceCaptain,
  onSetWicketkeeper,
  onMovePlayer,
  onReplacePlayer,
  onViewPlayer,
}) => {
  const [view, setView] = useState<LineupView>('cards');
  const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null);
  const playersById = useMemo(() => new Map(allPlayers.map((player) => [player.id, player])), [allPlayers]);
  const teamsById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);
  const lineup = useMemo(
    () => [...selectedPlayers].sort((a, b) => a.battingOrder - b.battingOrder),
    [selectedPlayers],
  );
  const selectedIds = useMemo(() => new Set(lineup.map((player) => player.playerId)), [lineup]);

  const moveBy = (index: number, amount: -1 | 1) => {
    const target = index + amount;
    if (target >= 0 && target < lineup.length) onMovePlayer(index, target);
  };
  const handleDrop = (targetIndex: number) => {
    if (!draggedPlayerId) return;
    const sourceIndex = lineup.findIndex((player) => player.playerId === draggedPlayerId);
    if (sourceIndex >= 0 && sourceIndex !== targetIndex) onMovePlayer(sourceIndex, targetIndex);
    setDraggedPlayerId(null);
  };

  const renderPlayer = (teamPlayer: UserTeamPlayer, index: number) => {
    const player = playersById.get(teamPlayer.playerId);
    if (!player) {
      return (
        <li key={teamPlayer.playerId} className="rounded-xl border border-rose-300/20 bg-rose-300/[0.04] p-3 text-xs text-rose-100">
          Player record missing · <button type="button" onClick={() => onRemovePlayer(teamPlayer.playerId)} className="underline">remove from XI</button>
        </li>
      );
    }

    const team = player.teamsPlayed.map((teamId) => teamsById.get(teamId)).find(Boolean);
    const rating = format === 'ODI'
      ? player.formatRatings.ODI
      : format === 'TEST'
      ? player.formatRatings.TEST
      : player.formatRatings.T20;

    return (
      <li
        key={teamPlayer.playerId}
        draggable={lineup.length > 1}
        onDragStart={(event) => {
          setDraggedPlayerId(teamPlayer.playerId);
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('text/plain', teamPlayer.playerId);
        }}
        onDragEnd={() => setDraggedPlayerId(null)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          handleDrop(index);
        }}
        className={`min-w-0 rounded-xl border bg-[#171A20] transition-colors ${
          draggedPlayerId === teamPlayer.playerId ? 'border-[#B7BBC4]/60 opacity-50' : 'border-white/[0.07]'
        } p-3 sm:p-4`}
      >
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              draggable={false}
              aria-label={`Drag or move ${player.displayName}`}
              title="Drag to reorder"
              className="hidden cursor-grab text-[#737984] active:cursor-grabbing sm:grid sm:h-8 sm:w-5 sm:place-items-center"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-[#454B56] bg-[#111318] font-heading text-xs font-semibold tabular-nums text-[#D4D7DC]">
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onViewPlayer?.(player)}
            aria-label={`View ${player.displayName}'s profile`}
            className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#262A32] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#B7BBC4]"
          >
            {player.imageUrl ? (
              <img src={player.imageUrl} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover object-top" />
            ) : <span className="grid h-full place-items-center text-sm text-white/50">{player.displayName[0]}</span>}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => onViewPlayer?.(player)}
                className="max-w-full truncate text-left text-xs font-semibold text-[#F2F3F5] hover:text-white"
              >
                {player.displayName}
              </button>
              {teamPlayer.isCaptain && <span className="rounded border border-[#737984] px-1.5 py-0.5 text-[8px] font-semibold text-[#E1E3E7]">C</span>}
              {teamPlayer.isViceCaptain && <span className="rounded border border-[#555B66] px-1.5 py-0.5 text-[8px] font-semibold text-[#BFC3CA]">VC</span>}
              {teamPlayer.isWicketkeeper && <span className="rounded border border-[#555B66] px-1.5 py-0.5 text-[8px] font-semibold text-[#BFC3CA]">WK</span>}
            </div>
            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-[#858B96]">
              <span>{player.primaryRole}</span>
              <span aria-hidden="true">·</span>
              <span>{player.country}</span>
              {team && (
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  {team.logo && <img src={team.logo} alt="" loading="lazy" className="h-3.5 w-3.5 object-contain" />}
                  <span className="truncate">{team.shortName || team.name}</span>
                </span>
              )}
            </div>
          </div>

          <div className="hidden shrink-0 text-right sm:block">
            <p className="font-heading text-sm font-semibold tabular-nums text-[#E3E5E9]">{rating ?? player.overallRating}</p>
            <p className="mt-0.5 text-[8px] uppercase tracking-[0.1em] text-[#737984]">{format}</p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => moveBy(index, -1)}
              disabled={index === 0}
              aria-label={`Move ${player.displayName} up`}
              title="Move up"
              className="grid h-9 w-8 place-items-center rounded-md text-[#858B96] hover:bg-white/[0.05] hover:text-white disabled:opacity-30 sm:hidden"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => moveBy(index, 1)}
              disabled={index === lineup.length - 1}
              aria-label={`Move ${player.displayName} down`}
              title="Move down"
              className="grid h-9 w-8 place-items-center rounded-md text-[#858B96] hover:bg-white/[0.05] hover:text-white disabled:opacity-30 sm:hidden"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onSetCaptain(teamPlayer.playerId)}
              aria-pressed={teamPlayer.isCaptain}
              aria-label={`${teamPlayer.isCaptain ? 'Remove captaincy from' : 'Make'} ${player.displayName} captain`}
              className={`grid h-9 w-9 place-items-center rounded-lg border transition-colors ${
                teamPlayer.isCaptain ? 'border-[#737984] bg-[#343943] text-[#F5F5F6]' : 'border-[#343943] text-[#858B96] hover:text-white'
              }`}
            >
              <Crown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onSetViceCaptain(teamPlayer.playerId)}
              aria-pressed={teamPlayer.isViceCaptain}
              aria-label={`${teamPlayer.isViceCaptain ? 'Remove vice-captaincy from' : 'Make'} ${player.displayName} vice-captain`}
              className={`hidden h-9 w-9 place-items-center rounded-lg border transition-colors sm:grid ${
                teamPlayer.isViceCaptain ? 'border-[#737984] bg-[#343943] text-[#F5F5F6]' : 'border-[#343943] text-[#858B96] hover:text-white'
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onSetWicketkeeper(teamPlayer.playerId)}
              aria-pressed={teamPlayer.isWicketkeeper}
              aria-label={`${teamPlayer.isWicketkeeper ? 'Remove wicketkeeper role from' : 'Assign wicketkeeper role to'} ${player.displayName}`}
              className={`hidden h-9 w-9 place-items-center rounded-lg border text-[9px] font-bold transition-colors sm:grid ${
                teamPlayer.isWicketkeeper ? 'border-[#737984] bg-[#343943] text-[#F5F5F6]' : 'border-[#343943] text-[#858B96] hover:text-white'
              }`}
            >
              WK
            </button>
            <button
              type="button"
              onClick={() => onRemovePlayer(teamPlayer.playerId)}
              aria-label={`Remove ${player.displayName} from XI`}
              title="Remove player"
              className="grid h-9 w-8 place-items-center rounded-md text-[#858B96] hover:bg-rose-400/10 hover:text-rose-200"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] pt-3 sm:hidden">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onSetViceCaptain(teamPlayer.playerId)}
              aria-pressed={teamPlayer.isViceCaptain}
              className={`min-h-8 rounded-md border px-2 text-[9px] font-semibold ${teamPlayer.isViceCaptain ? 'border-[#737984] bg-[#343943] text-white' : 'border-[#343943] text-[#858B96]'}`}
            >
              Vice-captain
            </button>
            <button
              type="button"
              onClick={() => onSetWicketkeeper(teamPlayer.playerId)}
              aria-pressed={teamPlayer.isWicketkeeper}
              className={`min-h-8 rounded-md border px-2 text-[9px] font-semibold ${teamPlayer.isWicketkeeper ? 'border-[#737984] bg-[#343943] text-white' : 'border-[#343943] text-[#858B96]'}`}
            >
              Wicketkeeper
            </button>
          </div>
          <span className="text-[9px] tabular-nums text-[#858B96]">{rating ?? player.overallRating} · {format}</span>
        </div>

        {onReplacePlayer && replacementCandidates.length > 0 && (
          <div className="mt-3 border-t border-white/[0.07] pt-3">
            <label className="sr-only" htmlFor={`replace-${teamPlayer.playerId}`}>Replace {player.displayName}</label>
            <select
              id={`replace-${teamPlayer.playerId}`}
              value=""
              onChange={(event) => {
                if (event.target.value) onReplacePlayer(teamPlayer.playerId, event.target.value);
              }}
              className="min-h-9 w-full rounded-lg border border-[#343943] bg-[#111318] px-3 text-[10px] text-[#AEB3BC] focus:border-[#AEB3BC] focus:outline-none"
            >
              <option value="">Replace player…</option>
              {replacementCandidates.filter((candidate) => !selectedIds.has(candidate.id)).map((candidate) => (
                <option key={candidate.id} value={candidate.id}>{candidate.displayName} · {candidate.country}</option>
              ))}
            </select>
          </div>
        )}
      </li>
    );
  };

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-[#262A32] bg-[#111318]" aria-labelledby="playing-xi-title">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#262A32] p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em] text-[#AEB3BC]">
            <Shield className="h-4 w-4" />
            STARTING LINEUP
          </div>
          <h2 id="playing-xi-title" className="mt-1 font-heading text-base font-semibold text-[#F5F5F6]">
            Playing XI
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-[#343943] bg-[#171A20] px-3 py-2 text-[10px] font-semibold tabular-nums text-[#C3C7CE]">
            {lineup.length} / {maxPlayers}
          </span>
          <div className="flex rounded-lg border border-[#343943] bg-[#171A20] p-0.5" role="group" aria-label="Lineup view">
            <button
              type="button"
              aria-label="Card view"
              aria-pressed={view === 'cards'}
              onClick={() => setView('cards')}
              className={`min-h-8 rounded-md px-2.5 text-[9px] font-medium ${view === 'cards' ? 'bg-[#343943] text-white' : 'text-[#858B96]'}`}
            >
              Cards
            </button>
            <button
              type="button"
              aria-label="Compact table view"
              aria-pressed={view === 'table'}
              onClick={() => setView('table')}
              className={`min-h-8 rounded-md px-2.5 text-[9px] font-medium ${view === 'table' ? 'bg-[#343943] text-white' : 'text-[#858B96]'}`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {lineup.length === 0 ? (
        <div className="px-5 py-10 text-center sm:py-12">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl border border-[#343943] bg-[#171A20] text-[#AEB3BC]">
            <Plus className="h-5 w-5" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-[#E3E5E9]">Your XI is ready to take shape</h3>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-[#858B96]">
            Select players from the pool to start building your lineup.
          </p>
        </div>
      ) : view === 'table' ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[740px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#262A32] text-[9px] font-medium uppercase tracking-wide text-[#858B96]">
                <th scope="col" className="px-4 py-3">Order</th>
                <th scope="col" className="px-3 py-3">Player</th>
                <th scope="col" className="px-3 py-3">Team</th>
                <th scope="col" className="px-3 py-3">Nationality</th>
                <th scope="col" className="px-3 py-3">Role</th>
                <th scope="col" className="px-3 py-3 text-right">Rating</th>
                <th scope="col" className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lineup.map((item, index) => {
                const player = playersById.get(item.playerId);
                if (!player) return null;
                const team = player.teamsPlayed.map((teamId) => teamsById.get(teamId)).find(Boolean);
                const rating = format === 'ODI' ? player.formatRatings.ODI : format === 'TEST' ? player.formatRatings.TEST : player.formatRatings.T20;
                return (
                  <tr
                    key={item.playerId}
                    draggable
                    onDragStart={(event) => {
                      setDraggedPlayerId(item.playerId);
                      event.dataTransfer.effectAllowed = 'move';
                      event.dataTransfer.setData('text/plain', item.playerId);
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDragEnd={() => setDraggedPlayerId(null)}
                    onDrop={(event) => {
                      event.preventDefault();
                      handleDrop(index);
                    }}
                    className="border-b border-white/[0.05] text-xs last:border-0"
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 font-heading font-semibold tabular-nums text-[#C3C7CE]">
                        <GripVertical className="h-3.5 w-3.5 text-[#737984]" />
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <button type="button" onClick={() => onViewPlayer?.(player)} className="inline-flex items-center gap-2 text-left font-medium text-[#E3E5E9] hover:text-white">
                        <span className="h-8 w-8 overflow-hidden rounded-md bg-[#262A32]">
                          {player.imageUrl && <img src={player.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover object-top" />}
                        </span>
                        <span className="flex items-center gap-1.5">
                          {player.displayName}
                          {item.isCaptain && <span className="text-[8px] text-[#C3C7CE]">C</span>}
                          {item.isViceCaptain && <span className="text-[8px] text-[#A0A5AE]">VC</span>}
                          {item.isWicketkeeper && <span className="text-[8px] text-[#A0A5AE]">WK</span>}
                        </span>
                      </button>
                    </td>
                    <td className="px-3 py-3 text-[#A0A5AE]">
                      {team && <span className="inline-flex items-center gap-1.5">{team.logo && <img src={team.logo} alt="" loading="lazy" className="h-4 w-4 object-contain" />}{team.shortName || team.name}</span>}
                    </td>
                    <td className="px-3 py-3 text-[#A0A5AE]">{player.country}</td>
                    <td className="px-3 py-3 text-[#A0A5AE]">{player.primaryRole}</td>
                    <td className="px-3 py-3 text-right font-heading tabular-nums text-[#E3E5E9]">{rating ?? player.overallRating}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => moveBy(index, -1)} disabled={index === 0} aria-label={`Move ${player.displayName} up`} className="grid h-8 w-8 place-items-center rounded-md text-[#858B96] hover:bg-white/[0.05] disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
                        <button type="button" onClick={() => moveBy(index, 1)} disabled={index === lineup.length - 1} aria-label={`Move ${player.displayName} down`} className="grid h-8 w-8 place-items-center rounded-md text-[#858B96] hover:bg-white/[0.05] disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
                        <button
                          type="button"
                          onClick={() => onSetCaptain(item.playerId)}
                          aria-label={`${item.isCaptain ? 'Remove captaincy from' : 'Make'} ${player.displayName} captain`}
                          aria-pressed={item.isCaptain}
                          className={`grid h-8 w-8 place-items-center rounded-md ${item.isCaptain ? 'bg-[#343943] text-white' : 'text-[#858B96] hover:bg-white/[0.05]'}`}
                        >
                          <Crown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onSetViceCaptain(item.playerId)}
                          aria-label={`${item.isViceCaptain ? 'Remove vice-captaincy from' : 'Make'} ${player.displayName} vice-captain`}
                          aria-pressed={item.isViceCaptain}
                          className={`grid h-8 w-8 place-items-center rounded-md ${item.isViceCaptain ? 'bg-[#343943] text-white' : 'text-[#858B96] hover:bg-white/[0.05]'}`}
                        >
                          <Shield className="h-3.5 w-3.5" />
                        </button>
                        {onReplacePlayer && (
                          <select
                            aria-label={`Replace ${player.displayName}`}
                            value=""
                            onChange={(event) => {
                              if (event.target.value) onReplacePlayer(item.playerId, event.target.value);
                            }}
                            className="max-w-28 rounded-md border border-[#343943] bg-[#111318] px-1.5 text-[9px] text-[#AEB3BC]"
                          >
                            <option value="">Replace</option>
                            {replacementCandidates.filter((candidate) => !selectedIds.has(candidate.id)).map((candidate) => (
                              <option key={candidate.id} value={candidate.id}>{candidate.displayName}</option>
                            ))}
                          </select>
                        )}
                        <button type="button" onClick={() => onRemovePlayer(item.playerId)} aria-label={`Remove ${player.displayName}`} className="grid h-8 w-8 place-items-center rounded-md text-[#858B96] hover:bg-rose-400/10 hover:text-rose-200"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <ol className="grid gap-2 p-3 sm:grid-cols-2 sm:p-4 xl:grid-cols-1">
          {lineup.map((item, index) => renderPlayer(item, index))}
        </ol>
      )}
    </section>
  );
};
