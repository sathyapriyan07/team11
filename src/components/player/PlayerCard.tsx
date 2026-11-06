import React from 'react';
import { Player, CricketFormat } from '../../types/cricket';
import { Shield, Sparkles, Plus, Check, Eye, BarChart2 } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  onSelect?: (player: Player) => void;
  onViewDetails?: (player: Player) => void;
  onCompare?: (player: Player) => void;
  isSelected?: boolean;
  format?: CricketFormat;
  compact?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onSelect,
  onViewDetails,
  onCompare,
  isSelected = false,
  format = 'T20',
  compact = false,
}) => {
  const formatRating =
    format === 'ODI'
      ? player.formatRatings.ODI
      : format === 'TEST'
      ? player.formatRatings.TEST
      : player.formatRatings.T20;

  // Role color token
  const getRoleBadgeColor = () => {
    switch (player.primaryRole) {
      case 'Wicketkeeper':
        return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Batter':
        return 'text-sky-400 bg-sky-400/10 border-sky-400/20';
      case 'All-rounder':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Bowler':
        return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border transition-all duration-200 overflow-hidden ${
        isSelected
          ? 'bg-[#182420] border-[#20C878] shadow-lg shadow-[#20C878]/10'
          : 'bg-[#181F29] border-white/5 hover:border-white/20 hover:bg-[#1a2330]'
      } ${compact ? 'p-3' : 'p-4'}`}
    >
      {/* Top Banner: Country & Rating */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-[#929BA8] uppercase tracking-wider">
            {player.country}
          </span>
          {player.careerStatus === 'Legend' && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold uppercase tracking-wider">
              Legend
            </span>
          )}
          {player.isOverseasIPL && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold uppercase">
              Overseas
            </span>
          )}
        </div>

        {/* Rating Disc */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/40 border border-white/10">
          <span className="text-[10px] text-[#929BA8] font-bold">{format}</span>
          <span className="text-sm font-bold font-heading text-[#20C878]">
            {formatRating || player.overallRating}
          </span>
        </div>
      </div>

      {/* Main Avatar & Identity */}
      <div className="flex items-center gap-3.5 my-1">
        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#121720] border border-white/10 shrink-0">
          <img
            src={player.imageUrl}
            alt={player.displayName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {isSelected && (
            <div className="absolute inset-0 bg-[#20C878]/30 flex items-center justify-center backdrop-blur-[1px]">
              <Check className="w-5 h-5 text-white stroke-[3]" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm sm:text-base font-bold text-white truncate font-heading group-hover:text-[#20C878] transition-colors">
            {player.displayName}
          </h4>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getRoleBadgeColor()}`}
            >
              {player.primaryRole}
            </span>
            <span className="text-[11px] text-[#929BA8] truncate">
              {player.specialization}
            </span>
          </div>
        </div>
      </div>

      {/* Attributes Bar Snippet */}
      {!compact && (
        <div className="grid grid-cols-3 gap-1.5 py-2.5 my-2 border-y border-white/5 text-[11px] text-center">
          <div className="bg-[#121720] p-1 rounded-lg">
            <span className="text-[#929BA8] block text-[9px] uppercase">Bat</span>
            <span className="font-bold text-white">
              {player.attributes.powerHitting}
            </span>
          </div>
          <div className="bg-[#121720] p-1 rounded-lg">
            <span className="text-[#929BA8] block text-[9px] uppercase">Bowl</span>
            <span className="font-bold text-white">
              {player.attributes.accuracy}
            </span>
          </div>
          <div className="bg-[#121720] p-1 rounded-lg">
            <span className="text-[#929BA8] block text-[9px] uppercase">Field</span>
            <span className="font-bold text-white">
              {player.attributes.catching}
            </span>
          </div>
        </div>
      )}

      {/* Action Footers */}
      <div className="flex items-center gap-2 mt-2 pt-1">
        {onSelect && (
          <button
            type="button"
            onClick={() => onSelect(player)}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isSelected
                ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                : 'bg-[#20C878] text-[#090B0F] hover:bg-[#1bb56c] font-semibold'
            }`}
          >
            {isSelected ? (
              <>
                <span>Remove</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Select</span>
              </>
            )}
          </button>
        )}

        {onViewDetails && (
          <button
            type="button"
            onClick={() => onViewDetails(player)}
            title="View Player Profile"
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#929BA8] hover:text-white transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}

        {onCompare && (
          <button
            type="button"
            onClick={() => onCompare(player)}
            title="Compare Player"
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#929BA8] hover:text-[#3BA7FF] transition-colors"
          >
            <BarChart2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
