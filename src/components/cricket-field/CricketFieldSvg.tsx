import React, { useState } from 'react';
import { Player, UserTeamPlayer, FieldingPosition } from '../../types/cricket';
import { Shield, Sparkles, Move, Crown, Crosshair } from 'lucide-react';

interface CricketFieldSvgProps {
  teamPlayers: UserTeamPlayer[];
  allPlayers: Player[];
  onUpdateFieldingPosition?: (playerId: string, newPos: FieldingPosition) => void;
  editable?: boolean;
}

// Preset standard coordinate mappings (percentage X: 0-100, Y: 0-100)
// Field center is (50, 50). Pitch runs vertically from Y: 43 to 57.
export const FIELD_POSITION_COORDINATES: Record<FieldingPosition, { x: number; y: number; label: string }> = {
  Wicketkeeper: { x: 50, y: 37, label: 'WK' },
  Bowler: { x: 50, y: 63, label: 'BOWLER' },
  'Slip 1': { x: 44, y: 34, label: 'SLIP 1' },
  'Slip 2': { x: 40, y: 32, label: 'SLIP 2' },
  Gully: { x: 33, y: 35, label: 'GULLY' },
  Point: { x: 25, y: 46, label: 'POINT' },
  Cover: { x: 26, y: 56, label: 'COVER' },
  'Extra Cover': { x: 30, y: 65, label: 'EX-COVER' },
  'Mid-off': { x: 43, y: 68, label: 'MID-OFF' },
  'Mid-on': { x: 57, y: 68, label: 'MID-ON' },
  Midwicket: { x: 74, y: 56, label: 'MIDWKT' },
  'Square Leg': { x: 75, y: 46, label: 'SQ LEG' },
  'Fine Leg': { x: 67, y: 35, label: 'FINE LEG' },
  'Third Man': { x: 28, y: 22, label: 'THIRD MAN' },
  'Long-on': { x: 60, y: 86, label: 'LONG-ON' },
  'Long-off': { x: 40, y: 86, label: 'LONG-OFF' },
  'Deep Cover': { x: 15, y: 60, label: 'DP COVER' },
  'Deep Midwicket': { x: 84, y: 65, label: 'DP MIDWKT' },
  'Deep Square Leg': { x: 86, y: 45, label: 'DP SQ LEG' },
  'Short Leg': { x: 56, y: 44, label: 'SHORT LEG' },
  'Silly Point': { x: 44, y: 44, label: 'SILLY PT' },
};

export const FIELD_PRESETS: Record<
  'balanced' | 'attacking' | 'defensive',
  { name: string; icon: string; positions: FieldingPosition[] }
> = {
  balanced: {
    name: 'Balanced (Standard)',
    icon: 'scale',
    positions: [
      'Wicketkeeper',
      'Bowler',
      'Point',
      'Cover',
      'Extra Cover',
      'Mid-off',
      'Mid-on',
      'Midwicket',
      'Square Leg',
      'Deep Midwicket',
      'Third Man',
    ],
  },
  attacking: {
    name: 'Attacking (Powerplay / Red Ball)',
    icon: 'flame',
    positions: [
      'Wicketkeeper',
      'Bowler',
      'Slip 1',
      'Slip 2',
      'Gully',
      'Point',
      'Cover',
      'Mid-off',
      'Mid-on',
      'Midwicket',
      'Fine Leg',
    ],
  },
  defensive: {
    name: 'Death Overs Boundary Lockdown',
    icon: 'shield',
    positions: [
      'Wicketkeeper',
      'Bowler',
      'Third Man',
      'Deep Cover',
      'Long-off',
      'Long-on',
      'Deep Midwicket',
      'Deep Square Leg',
      'Point',
      'Extra Cover',
      'Fine Leg',
    ],
  },
};

export const CricketFieldSvg: React.FC<CricketFieldSvgProps> = ({
  teamPlayers,
  allPlayers,
  onUpdateFieldingPosition,
  editable = true,
}) => {
  const [selectedFielderId, setSelectedFielderId] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<'balanced' | 'attacking' | 'defensive'>('balanced');

  const playersMap = new Map<string, Player>();
  allPlayers.forEach((p) => playersMap.set(p.id, p));

  // Determine positions for players
  const currentPositions = FIELD_PRESETS[activePreset].positions;

  const fielders = teamPlayers.slice(0, 11).map((tp, idx) => {
    const player = playersMap.get(tp.playerId);
    const assignedPos: FieldingPosition =
      tp.fieldingPosition || (tp.isWicketkeeper ? 'Wicketkeeper' : currentPositions[idx] || 'Point');
    const coords = FIELD_POSITION_COORDINATES[assignedPos] || { x: 50, y: 50, label: assignedPos };

    return {
      teamPlayer: tp,
      player,
      position: assignedPos,
      coords,
    };
  });

  const mobileRoleGroups = [
    {
      label: 'Wicket Keepers',
      icon: Shield,
      players: fielders.filter(
        ({ teamPlayer, player }) => teamPlayer.isWicketkeeper || player?.primaryRole === 'Wicketkeeper',
      ),
    },
    {
      label: 'Batters',
      icon: Sparkles,
      players: fielders.filter(
        ({ teamPlayer, player }) => !teamPlayer.isWicketkeeper && player?.primaryRole === 'Batter',
      ),
    },
    {
      label: 'All Rounders',
      icon: Move,
      players: fielders.filter(({ player }) => player?.primaryRole === 'All-rounder'),
    },
    {
      label: 'Bowlers',
      icon: Crosshair,
      players: fielders.filter(({ player }) => player?.primaryRole === 'Bowler'),
    },
  ].filter((group) => group.players.length > 0);

  const handleApplyPreset = (presetKey: 'balanced' | 'attacking' | 'defensive') => {
    setActivePreset(presetKey);
    if (!onUpdateFieldingPosition) return;

    const presetPositions = FIELD_PRESETS[presetKey].positions;
    teamPlayers.slice(0, 11).forEach((tp, idx) => {
      if (tp.isWicketkeeper) {
        onUpdateFieldingPosition(tp.playerId, 'Wicketkeeper');
      } else {
        const nextPos = presetPositions[idx] === 'Wicketkeeper' ? presetPositions[10] : presetPositions[idx];
        onUpdateFieldingPosition(tp.playerId, nextPos);
      }
    });
  };

  const handlePositionSwap = (targetPosition: FieldingPosition) => {
    if (!selectedFielderId || !onUpdateFieldingPosition) return;
    onUpdateFieldingPosition(selectedFielderId, targetPosition);
    setSelectedFielderId(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Field Preset Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#121720] rounded-xl border border-white/5 text-sm">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#929BA8]">
          <Crosshair className="w-4 h-4 text-[#20C878]" />
          Fielding Presets:
        </div>
        <div className="flex flex-wrap gap-2">
          {(['balanced', 'attacking', 'defensive'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleApplyPreset(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activePreset === key
                  ? 'bg-[#20C878] text-[#090B0F] font-semibold shadow-lg shadow-[#20C878]/20'
                  : 'bg-[#181F29] text-[#929BA8] hover:text-white hover:bg-[#202938]'
              }`}
            >
              {key === 'balanced' && '⚖️ Balanced'}
              {key === 'attacking' && '⚡ Attacking (Slips)'}
              {key === 'defensive' && '🛡️ Death (Boundary)'}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile role-based team view */}
      <div className="relative isolate min-h-[560px] overflow-hidden rounded-2xl border border-emerald-300/20 bg-[#078a12] px-3 py-4 shadow-2xl sm:hidden">
        <div className="pointer-events-none absolute inset-x-3 inset-y-3 rounded-[50%] border border-emerald-200/30" />
        <div className="pointer-events-none absolute inset-x-[12%] inset-y-[17%] rounded-[50%] border border-emerald-200/20" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-36 w-10 -translate-x-1/2 -translate-y-1/2 rounded-sm border-y-2 border-white/20 bg-[#bdad62]/50" />

        <div className="relative z-10 flex min-h-[528px] flex-col justify-between gap-5">
          {mobileRoleGroups.map((group) => {
            const GroupIcon = group.icon;
            return (
              <section key={group.label} className="flex flex-col items-center">
                <h3 className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-950/30 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                  <GroupIcon className="h-3 w-3" />
                  {group.label}
                </h3>
                <div className="grid w-full grid-cols-3 justify-items-center gap-x-1 gap-y-3">
                  {group.players.map(({ teamPlayer, player, position }) => {
                    const isSelected = selectedFielderId === teamPlayer.playerId;
                    return (
                      <button
                        key={teamPlayer.playerId}
                        type="button"
                        onClick={() => editable && setSelectedFielderId(isSelected ? null : teamPlayer.playerId)}
                        aria-pressed={isSelected}
                        aria-label={`${player?.displayName || 'Player'}, ${position}${teamPlayer.isCaptain ? ', captain' : ''}${teamPlayer.isViceCaptain ? ', vice captain' : ''}`}
                        className={`relative flex min-w-0 flex-col items-center rounded-xl px-1 pb-0.5 transition-transform active:scale-95 ${
                          editable ? 'cursor-pointer' : 'cursor-default'
                        }`}
                      >
                        <div
                          className={`relative h-10 w-10 overflow-visible rounded-full border-2 bg-[#181F29] shadow-md ${
                            isSelected ? 'border-white ring-2 ring-emerald-300' : 'border-white/80'
                          }`}
                        >
                          {player?.imageUrl ? (
                            <img
                              src={player.imageUrl}
                              alt=""
                              className="h-full w-full rounded-full object-cover object-top"
                              loading="lazy"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                              {`P${teamPlayer.battingOrder}`}
                            </span>
                          )}
                          {(teamPlayer.isCaptain || teamPlayer.isViceCaptain) && (
                            <span
                              className={`absolute -right-1 -top-1 rounded-full px-1 py-0.5 text-[7px] font-extrabold leading-none text-black ${
                                teamPlayer.isCaptain ? 'bg-amber-300' : 'bg-sky-300'
                              }`}
                            >
                              {teamPlayer.isCaptain ? 'C' : 'VC'}
                            </span>
                          )}
                        </div>
                        <span className="mt-1 block w-full max-w-[86px] truncate rounded-full bg-[#181F29]/90 px-2 py-1 text-center text-[9px] font-semibold leading-none text-white">
                          {player?.displayName || `Player ${teamPlayer.battingOrder}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {editable && selectedFielderId && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-300/30 bg-[#101820]/95 p-2 text-[10px] text-white shadow-lg">
              <label htmlFor="mobile-field-position" className="shrink-0 font-semibold">
                Move to
              </label>
              <select
                id="mobile-field-position"
                defaultValue=""
                onChange={(event) => {
                  if (event.target.value) handlePositionSwap(event.target.value as FieldingPosition);
                }}
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#181F29] px-2 py-1.5 text-white"
              >
                <option value="" disabled>
                  Select field position
                </option>
                {Object.keys(FIELD_POSITION_COORDINATES).map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setSelectedFielderId(null)}
                className="shrink-0 rounded-lg bg-white/10 px-2 py-1.5"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main SVG Cricket Ground */}
      <div className="relative hidden w-full aspect-4/3 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#0c131a] shadow-2xl sm:flex sm:aspect-16/11">
        <svg viewBox="0 0 1000 750" className="w-full h-full select-none">
          <defs>
            {/* Realistic grass radial gradient */}
            <radialGradient id="grassGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e5437" />
              <stop offset="45%" stopColor="#18462e" />
              <stop offset="85%" stopColor="#143c26" />
              <stop offset="100%" stopColor="#0f2e1d" />
            </radialGradient>

            {/* Mown pitch ring pattern */}
            <radialGradient id="infieldGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#256441" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#1a4d32" stopOpacity="0.4" />
            </radialGradient>

            {/* Pitch clay color */}
            <linearGradient id="pitchClay" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d3b17d" />
              <stop offset="50%" stopColor="#c7a16b" />
              <stop offset="100%" stopColor="#d3b17d" />
            </linearGradient>

            <filter id="playerGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.8" />
            </filter>
            <filter id="activeGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#20C878" floodOpacity="0.9" />
            </filter>
          </defs>

          {/* Outfield Grass */}
          <ellipse cx="500" cy="375" rx="470" ry="345" fill="url(#grassGradient)" stroke="#225b39" strokeWidth="4" />

          {/* Boundary Rope Line */}
          <ellipse cx="500" cy="375" rx="450" ry="330" fill="none" stroke="#ffffff" strokeWidth="3" strokeDasharray="14,6" opacity="0.85" />
          <ellipse cx="500" cy="375" rx="453" ry="333" fill="none" stroke="#20C878" strokeWidth="1" opacity="0.4" />

          {/* 30-Yard Inner Circle */}
          <ellipse cx="500" cy="375" rx="270" ry="195" fill="url(#infieldGradient)" stroke="#ffffff" strokeWidth="2" strokeDasharray="8,6" opacity="0.6" />

          {/* Pitch Area (Center Rectangle) */}
          <rect x="475" y="300" width="50" height="150" rx="3" fill="url(#pitchClay)" stroke="#b8935c" strokeWidth="2" />

          {/* Bowling Creases & Return Creases (Top & Bottom of pitch) */}
          {/* Top Crease (Striker/Non-Striker) */}
          <line x1="465" y1="320" x2="535" y2="320" stroke="#ffffff" strokeWidth="2" opacity="0.9" />
          <line x1="470" y1="312" x2="530" y2="312" stroke="#ffffff" strokeWidth="1" opacity="0.7" />
          {/* Top Stumps */}
          <circle cx="495" cy="316" r="2.5" fill="#ffffff" />
          <circle cx="500" cy="316" r="2.5" fill="#ffffff" />
          <circle cx="505" cy="316" r="2.5" fill="#ffffff" />

          {/* Bottom Crease */}
          <line x1="465" y1="430" x2="535" y2="430" stroke="#ffffff" strokeWidth="2" opacity="0.9" />
          <line x1="470" y1="438" x2="530" y2="438" stroke="#ffffff" strokeWidth="1" opacity="0.7" />
          {/* Bottom Stumps */}
          <circle cx="495" cy="434" r="2.5" fill="#ffffff" />
          <circle cx="500" cy="434" r="2.5" fill="#ffffff" />
          <circle cx="505" cy="434" r="2.5" fill="#ffffff" />

          {/* Compass / Orientation indicator */}
          <g opacity="0.3" transform="translate(60, 60)">
            <circle cx="0" cy="0" r="24" fill="none" stroke="#ffffff" strokeWidth="1" />
            <text x="0" y="-8" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">N</text>
            <line x1="0" y1="-20" x2="0" y2="20" stroke="#ffffff" strokeWidth="1" />
            <line x1="-20" y1="0" x2="20" y2="0" stroke="#ffffff" strokeWidth="1" />
          </g>

          {/* Available Target Spots for Click/Swap */}
          {selectedFielderId &&
            Object.entries(FIELD_POSITION_COORDINATES).map(([posKey, spotCoords]) => {
              const svgX = (spotCoords.x / 100) * 1000;
              const svgY = (spotCoords.y / 100) * 750;
              return (
                <g
                  key={`spot-${posKey}`}
                  className="cursor-pointer transition-all hover:scale-125"
                  onClick={() => handlePositionSwap(posKey as FieldingPosition)}
                >
                  <circle cx={svgX} cy={svgY} r="16" fill="#3BA7FF" fillOpacity="0.3" stroke="#3BA7FF" strokeWidth="2" strokeDasharray="3,3" />
                  <text x={svgX} y={svgY + 4} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                    +
                  </text>
                </g>
              );
            })}

          {/* Render 11 Fielders */}
          {fielders.map(({ teamPlayer, player, position, coords }) => {
            const svgX = (coords.x / 100) * 1000;
            const svgY = (coords.y / 100) * 750;
            const isSelected = selectedFielderId === teamPlayer.playerId;
            const isKeeper = teamPlayer.isWicketkeeper || position === 'Wicketkeeper';
            const isBowler = position === 'Bowler';

            return (
              <g
                key={teamPlayer.playerId}
                transform={`translate(${svgX}, ${svgY})`}
                className="cursor-pointer transition-transform duration-200"
                onClick={() => {
                  if (editable) {
                    setSelectedFielderId(isSelected ? null : teamPlayer.playerId);
                  }
                }}
                filter={isSelected ? 'url(#activeGlow)' : 'url(#playerGlow)'}
              >
                {/* Selection ring animation */}
                {isSelected && (
                  <circle cx="0" cy="0" r="30" fill="none" stroke="#20C878" strokeWidth="3" strokeDasharray="5,3">
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0"
                      to="360"
                      dur="8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Outer Player Badge Disc */}
                <circle
                  cx="0"
                  cy="0"
                  r="20"
                  fill={isKeeper ? '#F59E0B' : isBowler ? '#EF4444' : '#181F29'}
                  stroke={isSelected ? '#20C878' : '#ffffff'}
                  strokeWidth={isSelected ? '3' : '2'}
                />

                {/* Captain / VC / Role indicator icon */}
                {teamPlayer.isCaptain && (
                  <g transform="translate(-16, -18)">
                    <circle cx="0" cy="0" r="8" fill="#F9CD05" stroke="#000" strokeWidth="1" />
                    <text x="0" y="3" textAnchor="middle" fill="#000" fontSize="8" fontWeight="bold">C</text>
                  </g>
                )}
                {teamPlayer.isViceCaptain && !teamPlayer.isCaptain && (
                  <g transform="translate(-16, -18)">
                    <circle cx="0" cy="0" r="8" fill="#3BA7FF" stroke="#000" strokeWidth="1" />
                    <text x="0" y="3" textAnchor="middle" fill="#000" fontSize="7" fontWeight="bold">VC</text>
                  </g>
                )}
                {isKeeper && (
                  <g transform="translate(16, -18)">
                    <circle cx="0" cy="0" r="8" fill="#10B981" stroke="#000" strokeWidth="1" />
                    <text x="0" y="3" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold">WK</text>
                  </g>
                )}

                {/* Player Initials */}
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="Montserrat, sans-serif"
                >
                  {player?.displayName ? player.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : `P${teamPlayer.battingOrder}`}
                </text>

                {/* Player Label Pill under node */}
                <g transform="translate(0, 31)">
                  <rect
                    x="-42"
                    y="-10"
                    width="84"
                    height="18"
                    rx="9"
                    fill="#090B0F"
                    fillOpacity="0.88"
                    stroke={isSelected ? '#20C878' : 'rgba(255,255,255,0.2)'}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="2"
                    textAnchor="middle"
                    fill="#F5F7FA"
                    fontSize="9.5"
                    fontWeight="600"
                    fontFamily="Montserrat, sans-serif"
                  >
                    {player?.displayName?.split(' ').pop() || `Player ${teamPlayer.battingOrder}`}
                  </text>
                </g>

                {/* Tactical Position Sub-tag */}
                <g transform="translate(0, 48)">
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    fill="#20C878"
                    fontSize="8"
                    fontWeight="700"
                    letterSpacing="0.5"
                  >
                    {coords.label}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Floating guidance helper */}
        {selectedFielderId && (
          <div className="absolute top-4 left-4 right-4 bg-[#181F29]/95 backdrop-blur-md border border-[#20C878]/40 p-3 rounded-xl shadow-xl flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#20C878] animate-ping" />
              <span>
                Click any <strong>highlighted blue spot</strong> on the field to move{' '}
                <strong>
                  {playersMap.get(selectedFielderId)?.displayName || 'Fielder'}
                </strong>.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedFielderId(null)}
              className="text-[#929BA8] hover:text-white px-2 py-0.5 rounded bg-white/5"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Field Positions legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-[11px] text-[#929BA8] bg-[#121720] p-3 rounded-xl border border-white/5">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
          <span>Wicketkeeper</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
          <span>Bowler (Crease)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#181F29] border border-white/40" />
          <span>Infield / Ring</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#20C878]" />
          <span>Boundary Rider</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Crown className="w-3 h-3 text-[#F9CD05]" />
          <span>Captain (C)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-[#3BA7FF]" />
          <span>Vice-Captain (VC)</span>
        </div>
      </div>
    </div>
  );
};
