import React, { useId, useRef, useState } from 'react';
import {
  FieldArrangement,
  FieldingPosition,
  FieldPlacement,
  Player,
  UserTeamPlayer,
} from '../../types/cricket';
import { Crown, Crosshair, Shield } from 'lucide-react';

interface CricketFieldSvgProps {
  teamPlayers: UserTeamPlayer[];
  allPlayers: Player[];
  fieldPlacements?: FieldPlacement[];
  savedArrangements?: FieldArrangement[];
  onUpdateFieldingPosition?: (playerId: string, newPos: FieldingPosition) => void;
  onSaveArrangement?: (name: string) => void;
  onLoadArrangement?: (arrangementId: string) => void;
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
  fieldPlacements = [],
  savedArrangements = [],
  onUpdateFieldingPosition,
  onSaveArrangement,
  onLoadArrangement,
  editable = true,
}) => {
  const [selectedFielderId, setSelectedFielderId] = useState<string | null>(null);
  const [draggedFielderId, setDraggedFielderId] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<'balanced' | 'attacking' | 'defensive'>('balanced');
  const [arrangementName, setArrangementName] = useState('');
  const idPrefix = useId().replace(/:/g, '');
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const playersMap = new Map<string, Player>();
  allPlayers.forEach((p) => playersMap.set(p.id, p));

  // Determine positions for players
  const currentPositions = FIELD_PRESETS[activePreset].positions;
  const placementsByPlayerId = new Map(fieldPlacements.map((placement) => [placement.playerId, placement]));

  const fielders = [...teamPlayers]
    .sort((a, b) => a.battingOrder - b.battingOrder)
    .slice(0, 11)
    .map((tp, idx) => {
    const player = playersMap.get(tp.playerId);
    const savedPlacement = placementsByPlayerId.get(tp.playerId);
    const assignedPos: FieldingPosition =
      savedPlacement?.position ||
      tp.fieldingPosition ||
      (tp.isWicketkeeper ? 'Wicketkeeper' : currentPositions[idx] || 'Point');
    const coords = FIELD_POSITION_COORDINATES[assignedPos] || { x: 50, y: 50, label: assignedPos };

      return {
        teamPlayer: tp,
        player,
        position: assignedPos,
        coords,
      };
    });

  const handleApplyPreset = (presetKey: 'balanced' | 'attacking' | 'defensive') => {
    setActivePreset(presetKey);
    if (!onUpdateFieldingPosition) return;

    const presetPositions = FIELD_PRESETS[presetKey].positions.filter(
      (position) => position !== 'Wicketkeeper',
    );
    const orderedPlayers = [...teamPlayers]
      .sort((a, b) => a.battingOrder - b.battingOrder)
      .slice(0, 11);
    const wicketkeeperId = orderedPlayers.find((player) => player.isWicketkeeper)?.playerId;
    let positionIndex = 0;
    orderedPlayers.forEach((tp) => {
      if (tp.playerId === wicketkeeperId) {
        onUpdateFieldingPosition(tp.playerId, 'Wicketkeeper');
      } else {
        const nextPos = presetPositions[positionIndex] || 'Point';
        positionIndex += 1;
        onUpdateFieldingPosition(tp.playerId, nextPos);
      }
    });
  };

  const assignPosition = (playerId: string, targetPosition: FieldingPosition) => {
    if (!onUpdateFieldingPosition) return;
    const currentFielder = fielders.find(({ teamPlayer }) => teamPlayer.playerId === playerId);
    const occupyingFielder = fielders.find(
      ({ teamPlayer, position }) =>
        teamPlayer.playerId !== playerId && position === targetPosition,
    );
    if (occupyingFielder && currentFielder) {
      onUpdateFieldingPosition(occupyingFielder.teamPlayer.playerId, currentFielder.position);
    }
    onUpdateFieldingPosition(playerId, targetPosition);
    setSelectedFielderId(null);
    setDraggedFielderId(null);
  };

  const handlePositionSwap = (targetPosition: FieldingPosition) => {
    if (selectedFielderId) assignPosition(selectedFielderId, targetPosition);
  };

  const handleFieldPointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!editable || !draggedFielderId) return;
    const start = dragStart.current;
    dragStart.current = null;
    if (!start || Math.hypot(event.clientX - start.x, event.clientY - start.y) < 6) {
      setDraggedFielderId(null);
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const pointerX = ((event.clientX - bounds.left) / bounds.width) * 100;
    const pointerY = ((event.clientY - bounds.top) / bounds.height) * 100;
    const nearestPosition = Object.entries(FIELD_POSITION_COORDINATES)
      .map(([position, coordinates]) => ({
        position: position as FieldingPosition,
        distance: Math.hypot(coordinates.x - pointerX, coordinates.y - pointerY),
      }))
      .sort((a, b) => a.distance - b.distance)[0];

    if (nearestPosition && nearestPosition.distance < 12) {
      assignPosition(draggedFielderId, nearestPosition.position);
    } else {
      setDraggedFielderId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Field Preset Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#121720] rounded-xl border border-white/5 text-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#AEB3BC]">
          <Crosshair className="h-4 w-4" />
          Fielding presets
        </div>
        <div className="flex flex-wrap gap-2">
          {(['balanced', 'attacking', 'defensive'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleApplyPreset(key)}
              className={`min-h-9 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                activePreset === key
                  ? 'border-[#747B86] bg-[#343943] text-[#F5F5F6] font-semibold'
                  : 'border-[#343943] bg-[#171A20] text-[#A0A5AE] hover:text-white'
              }`}
            >
              {key === 'balanced' && 'Balanced'}
              {key === 'attacking' && 'Attacking'}
              {key === 'defensive' && 'Defensive'}
            </button>
          ))}
        </div>
      </div>

      {editable && (
        <div className="flex flex-col gap-2 rounded-xl border border-[#262A32] bg-[#111318] p-3 sm:flex-row sm:items-center">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Arrangement name</span>
            <input
              value={arrangementName}
              onChange={(event) => setArrangementName(event.target.value)}
              placeholder="Name this field arrangement"
              maxLength={40}
              className="min-h-10 w-full rounded-lg border border-[#343943] bg-[#171A20] px-3 text-xs text-[#F5F5F6] placeholder:text-[#747B86] focus:border-[#AEB3BC] focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              const name = arrangementName.trim();
              if (!name) return;
              onSaveArrangement?.(name);
              setArrangementName('');
            }}
            disabled={!arrangementName.trim() || !fielders.length || !onSaveArrangement}
            className="min-h-10 rounded-lg border border-[#454B56] px-3 text-xs font-medium text-[#D2D4D9] hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save arrangement
          </button>
          <label className="min-w-0 flex-1">
            <span className="sr-only">Load saved field arrangement</span>
            <select
              defaultValue=""
              onChange={(event) => {
                if (event.target.value) onLoadArrangement?.(event.target.value);
                event.target.value = '';
              }}
              disabled={!savedArrangements.length || !onLoadArrangement}
              className="min-h-10 w-full rounded-lg border border-[#343943] bg-[#171A20] px-3 text-xs text-[#D2D4D9] focus:border-[#AEB3BC] focus:outline-none disabled:opacity-50"
            >
              <option value="">Load saved arrangement</option>
              {savedArrangements.map((arrangement) => (
                <option key={arrangement.id} value={arrangement.id}>{arrangement.name}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      {/* Main SVG Cricket Ground */}
      <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#0c131a]">
        <svg
          viewBox="0 0 1000 750"
          className="h-full w-full select-none touch-none"
          onPointerUp={handleFieldPointerUp}
          onPointerCancel={() => setDraggedFielderId(null)}
          role="group"
          aria-label="Top-down cricket field with assigned player positions"
        >
          <style>{`
            @media (max-width: 640px) {
              .field-player-disc { r: 28px; }
              .field-player-portrait { x: -24px; y: -24px; width: 48px; height: 48px; }
              .field-player-name { font-size: 19px; }
              .field-role-tag { font-size: 15px; }
              .field-role-badge { r: 10px; }
              .field-role-letter { font-size: 9px; }
            }
          `}</style>
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

          </defs>

          {/* Outfield Grass */}
          <ellipse cx="500" cy="375" rx="470" ry="345" fill="url(#grassGradient)" stroke="#225b39" strokeWidth="4" />

          {/* Boundary Rope Line */}
          <ellipse cx="500" cy="375" rx="450" ry="330" fill="none" stroke="#ffffff" strokeWidth="3" strokeDasharray="14,6" opacity="0.85" />
          <ellipse cx="500" cy="375" rx="453" ry="333" fill="none" stroke="#B7BBC4" strokeWidth="1" opacity="0.4" />

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

          <title>Cricket field positions</title>
          <desc>Drag a player marker to a named position. Select a player, then choose a marked position to move them.</desc>

          {/* Available Target Spots for Click/Swap */}
          {selectedFielderId &&
            Object.entries(FIELD_POSITION_COORDINATES).map(([posKey, spotCoords]) => {
              const svgX = (spotCoords.x / 100) * 1000;
              const svgY = (spotCoords.y / 100) * 750;
              return (
                <g
                  key={`spot-${posKey}`}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label={`Move selected player to ${posKey}`}
                  onClick={() => handlePositionSwap(posKey as FieldingPosition)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handlePositionSwap(posKey as FieldingPosition);
                    }
                  }}
                >
                  <circle cx={svgX} cy={svgY} r="16" fill="#B7BBC4" fillOpacity="0.25" stroke="#D2D4D9" strokeWidth="2" strokeDasharray="3,3" />
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
            const isKeeper = teamPlayer.isWicketkeeper;
            const isBowler = position === 'Bowler';

            return (
              <g
                key={teamPlayer.playerId}
                transform={`translate(${svgX}, ${svgY})`}
                className={`${editable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
                role={editable ? 'button' : undefined}
                tabIndex={editable ? 0 : undefined}
                aria-label={`${player?.displayName || 'Player'}, ${position}${teamPlayer.isCaptain ? ', captain' : ''}${teamPlayer.isViceCaptain ? ', vice-captain' : ''}${isKeeper ? ', wicketkeeper' : ''}`}
                onPointerDown={(event) => {
                  if (!editable) return;
                  event.stopPropagation();
                  setSelectedFielderId(teamPlayer.playerId);
                  setDraggedFielderId(teamPlayer.playerId);
                  dragStart.current = { x: event.clientX, y: event.clientY };
                  event.currentTarget.ownerSVGElement?.setPointerCapture(event.pointerId);
                }}
                onKeyDown={(event) => {
                  if (!editable || (event.key !== 'Enter' && event.key !== ' ')) return;
                  event.preventDefault();
                  setSelectedFielderId(isSelected ? null : teamPlayer.playerId);
                }}
                onClick={() => {
                  if (editable) {
                    setSelectedFielderId(isSelected ? null : teamPlayer.playerId);
                  }
                }}
              >
                {/* Selection ring animation */}
                {isSelected && (
                  <circle cx="0" cy="0" r="30" fill="none" stroke="#D2D4D9" strokeWidth="3" strokeDasharray="5,3" />
                )}

                {/* Outer Player Badge Disc */}
                <circle
                  cx="0"
                  cy="0"
                  r="20"
                  className="field-player-disc"
                  fill={isKeeper ? '#C3C7CE' : isBowler ? '#858B96' : '#171A20'}
                  stroke={isSelected ? '#F5F5F6' : '#ffffff'}
                  strokeWidth={isSelected ? '3' : '2'}
                />

                {player?.imageUrl && (
                  <>
                    <defs>
                      <clipPath id={`field-player-${idPrefix}-${teamPlayer.playerId.replace(/[^a-zA-Z0-9_-]/g, '-')}`}>
                        <circle cx="0" cy="0" r="18" />
                      </clipPath>
                    </defs>
                    <image
                      href={player.imageUrl}
                      x="-18"
                      y="-18"
                      width="36"
                      height="36"
                      preserveAspectRatio="xMidYMid slice"
                      clipPath={`url(#field-player-${idPrefix}-${teamPlayer.playerId.replace(/[^a-zA-Z0-9_-]/g, '-')})`}
                      className="field-player-portrait"
                    />
                  </>
                )}

                {/* Captain / VC / Role indicator icon */}
                {teamPlayer.isCaptain && (
                  <g transform="translate(-16, -18)">
                    <circle className="field-role-badge" cx="0" cy="0" r="8" fill="#D2D4D9" stroke="#111318" strokeWidth="1" />
                    <text className="field-role-letter" x="0" y="3" textAnchor="middle" fill="#111318" fontSize="8" fontWeight="bold">C</text>
                  </g>
                )}
                {teamPlayer.isViceCaptain && !teamPlayer.isCaptain && (
                  <g transform="translate(-16, -18)">
                    <circle className="field-role-badge" cx="0" cy="0" r="8" fill="#858B96" stroke="#111318" strokeWidth="1" />
                    <text className="field-role-letter" x="0" y="3" textAnchor="middle" fill="#111318" fontSize="7" fontWeight="bold">VC</text>
                  </g>
                )}
                {isKeeper && (
                  <g transform="translate(16, -18)">
                    <circle className="field-role-badge" cx="0" cy="0" r="8" fill="#D2D4D9" stroke="#111318" strokeWidth="1" />
                    <text className="field-role-letter" x="0" y="3" textAnchor="middle" fill="#111318" fontSize="7" fontWeight="bold">WK</text>
                  </g>
                )}

                {/* Player Initials */}
                <text
                  className="field-player-name"
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="Inter Tight, sans-serif"
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
                    stroke={isSelected ? '#D2D4D9' : 'rgba(255,255,255,0.2)'}
                    strokeWidth="1"
                  />
                  <text
                    className="field-role-tag"
                    x="0"
                    y="2"
                    textAnchor="middle"
                    fill="#F5F7FA"
                    fontSize="9.5"
                    fontWeight="600"
                    fontFamily="Inter Tight, sans-serif"
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
                    fill="#E3E5E9"
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
          <div className="absolute left-2 right-2 top-2 flex items-center justify-between gap-2 rounded-xl border border-white/15 bg-[#111318]/95 p-2 text-[10px] text-white sm:left-4 sm:right-4 sm:top-4 sm:p-3 sm:text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#B7BBC4]" />
              <span>
                Drag to a fielding position or select a position below for{' '}
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
          <span className="h-2.5 w-2.5 rounded-full bg-[#C3C7CE]" />
          <span>Wicketkeeper</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#858B96]" />
          <span>Bowler (Crease)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-white/40 bg-[#171A20]" />
          <span>Infield / Ring</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#D2D4D9]" />
          <span>Boundary Rider</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Crown className="h-3 w-3 text-[#C3C7CE]" />
          <span>Captain (C)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield className="h-3 w-3 text-[#A0A5AE]" />
          <span>Vice-Captain (VC)</span>
        </div>
      </div>
    </div>
  );
};
