import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { Player, CricketFormat } from '../types/cricket';
import { BarChart2, Plus, X, Sparkles, Check, ArrowRight } from 'lucide-react';

export const PlayerComparePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [allPlayers, setAllPlayers] = useState<Player[]>(() => storageService.getPlayers());
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [format, setFormat] = useState<CricketFormat>('T20');

  useEffect(() => {
    const list = storageService.getPlayers();
    setAllPlayers(list);

    const p1 = searchParams.get('player1');
    const p2 = searchParams.get('player2');

    if (p1 && p2) {
      setSelectedPlayerIds([p1, p2]);
    } else if (p1) {
      setSelectedPlayerIds([p1, list.find((p) => p.id !== p1)?.id || '']);
    } else {
      // default: compare Virat Kohli and Rohit Sharma
      const vk = list.find((p) => p.id === 'p-vk');
      const rohit = list.find((p) => p.id === 'p-rohit');
      if (vk && rohit) {
        setSelectedPlayerIds([vk.id, rohit.id]);
      } else if (list.length >= 2) {
        setSelectedPlayerIds([list[0].id, list[1].id]);
      }
    }
  }, [searchParams]);

  const playersToCompare = selectedPlayerIds
    .map((id) => allPlayers.find((p) => p.id === id))
    .filter(Boolean) as Player[];

  const handleAddPlayer = (playerId: string) => {
    if (selectedPlayerIds.length < 4 && !selectedPlayerIds.includes(playerId)) {
      setSelectedPlayerIds([...selectedPlayerIds, playerId]);
    }
  };

  const handleRemovePlayer = (playerId: string) => {
    setSelectedPlayerIds(selectedPlayerIds.filter((id) => id !== playerId));
  };

  const getStats = (p: Player) => {
    if (format === 'ODI') return p.stats.ODI;
    if (format === 'TEST') return p.stats.TEST;
    return p.stats.IPL || p.stats.T20;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3BA7FF] mb-1">
            <BarChart2 className="w-4 h-4" />
            <span>Statistical Matchup</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
            Player Head-to-Head Comparison
          </h1>
          <p className="text-xs sm:text-sm text-[#929BA8] mt-1">
            Compare tactical attributes, career records and format-specific master metrics side-by-side.
          </p>
        </div>

        {/* Format Selector */}
        <div className="flex items-center gap-2 bg-[#121720] p-1.5 rounded-xl border border-white/5 self-start sm:self-auto">
          <span className="text-xs text-[#929BA8] px-2 font-semibold">Stats Format:</span>
          {(['T20', 'ODI', 'TEST'] as const).map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => setFormat(fmt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                format === fmt ? 'bg-[#3BA7FF] text-black font-extrabold' : 'text-[#929BA8] hover:text-white'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Select Players Dropdown Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-[#121720] border border-white/10 rounded-2xl text-xs">
        <span className="text-[#929BA8] font-bold">Add Player to Compare:</span>
        <select
          onChange={(e) => {
            if (e.target.value) {
              handleAddPlayer(e.target.value);
              e.target.value = '';
            }
          }}
          value=""
          disabled={selectedPlayerIds.length >= 4}
          className="bg-[#181F29] text-white p-2 rounded-xl border border-white/10 focus:outline-none focus:border-[#3BA7FF] disabled:opacity-40"
        >
          <option value="">+ Select candidate cricketer...</option>
          {allPlayers
            .filter((p) => !selectedPlayerIds.includes(p.id))
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.displayName} ({p.country} • {p.primaryRole})
              </option>
            ))}
        </select>
        <span className="text-[11px] text-[#929BA8] ml-auto">
          Comparing {playersToCompare.length} / 4 players
        </span>
      </div>

      {/* Comparison Grid */}
      {playersToCompare.length > 0 && (
        <div className="bg-[#121720] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-8 overflow-x-auto">
          {/* Top Player Profile Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 min-w-[600px]">
            {playersToCompare.map((player) => {
              const formatRating =
                format === 'ODI'
                  ? player.formatRatings.ODI
                  : format === 'TEST'
                  ? player.formatRatings.TEST
                  : player.formatRatings.T20;

              return (
                <div
                  key={player.id}
                  className="relative bg-[#181F29] rounded-2xl p-4 border border-white/5 flex flex-col justify-between"
                >
                  <button
                    type="button"
                    onClick={() => handleRemovePlayer(player.id)}
                    className="absolute top-2 right-2 p-1 text-[#929BA8] hover:text-rose-400"
                    title="Remove from comparison"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex flex-col items-center text-center">
                    <img
                      src={player.imageUrl}
                      alt={player.displayName}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#3BA7FF] shadow-lg mb-2"
                    />
                    <span className="text-xs font-bold text-white font-heading truncate w-full">
                      {player.displayName}
                    </span>
                    <span className="text-[11px] text-[#929BA8]">{player.country}</span>
                    <span className="text-[10px] text-[#3BA7FF] font-semibold mt-0.5">
                      {player.primaryRole}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/5 text-center">
                    <span className="text-[10px] text-[#929BA8] block uppercase font-bold">
                      {format} Rating
                    </span>
                    <span className="text-2xl font-extrabold font-heading text-[#20C878] mt-0.5 block">
                      {formatRating || player.overallRating}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Format Career Records Table */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#20C878]" />
              {format} Career Statistics
            </h3>

            <div className="divide-y divide-white/5 text-xs min-w-[600px]">
              {[
                { label: 'Matches Played', key: 'matches' },
                { label: 'Runs Scored', key: 'runs', highlight: true },
                { label: 'Batting Average', key: 'battingAverage', highlight: true },
                { label: 'Strike Rate', key: 'strikeRate', highlight: true },
                { label: 'Centuries (100s)', key: 'centuries' },
                { label: 'Half-Centuries (50s)', key: 'fifties' },
                { label: 'Wickets Taken', key: 'wickets', highlight: true },
                { label: 'Bowling Economy', key: 'economy' },
                { label: 'Catches / Stumpings', custom: (p: Player) => `${getStats(p).catches} / ${getStats(p).stumpings}` },
              ].map((row) => (
                <div key={row.label} className="grid grid-cols-5 py-3 hover:bg-[#181F29]/40 transition-colors">
                  <div className="font-semibold text-[#929BA8]">{row.label}</div>
                  {playersToCompare.map((player) => {
                    const stats = getStats(player);
                    const val = row.custom ? row.custom(player) : (stats as any)[row.key!];
                    return (
                      <div
                        key={player.id}
                        className={`text-center font-bold ${
                          row.highlight ? 'text-white' : 'text-[#F5F7FA]'
                        }`}
                      >
                        {val ?? '-'}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Batting Attributes Comparison Bars */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#3BA7FF] mb-4">
              🏏 Batting Skill Attributes
            </h3>
            <div className="flex flex-col gap-3 min-w-[600px]">
              {[
                { label: 'Technique', key: 'technique' },
                { label: 'Power Hitting', key: 'powerHitting' },
                { label: 'Timing', key: 'timing' },
                { label: 'Strike Rotation', key: 'strikeRotation' },
                { label: 'Against Express Pace', key: 'againstPace' },
                { label: 'Against Quality Spin', key: 'againstSpin' },
                { label: 'Death Overs Finishing', key: 'finishing' },
              ].map((attr) => (
                <div key={attr.label} className="bg-[#181F29] p-3 rounded-xl border border-white/5">
                  <div className="flex justify-between text-xs font-semibold text-[#929BA8] mb-2">
                    <span>{attr.label}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {playersToCompare.map((player) => {
                      const val = (player.attributes as any)[attr.key];
                      return (
                        <div key={player.id}>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-white truncate">{player.displayName}</span>
                            <span className="font-bold text-[#3BA7FF]">{val}</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#090B0F] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-sky-500 to-[#3BA7FF] rounded-full"
                              style={{ width: `${val}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bowling & Fielding Attributes */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#20C878] mb-4">
              🎯 Bowling & Athleticism Attributes
            </h3>
            <div className="flex flex-col gap-3 min-w-[600px]">
              {[
                { label: 'Accuracy & Line', key: 'accuracy' },
                { label: 'Variations & Deception', key: 'variations' },
                { label: 'Death Overs Execution', key: 'deathBowling' },
                { label: 'Catching & Reflexes', key: 'catching' },
                { label: 'Ground Fielding', key: 'groundFielding' },
                { label: 'Pressure Handling & Clutch', key: 'pressureHandling' },
              ].map((attr) => (
                <div key={attr.label} className="bg-[#181F29] p-3 rounded-xl border border-white/5">
                  <div className="flex justify-between text-xs font-semibold text-[#929BA8] mb-2">
                    <span>{attr.label}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {playersToCompare.map((player) => {
                      const val = (player.attributes as any)[attr.key];
                      return (
                        <div key={player.id}>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-white truncate">{player.displayName}</span>
                            <span className="font-bold text-[#20C878]">{val}</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#090B0F] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-[#20C878] rounded-full"
                              style={{ width: `${val}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
