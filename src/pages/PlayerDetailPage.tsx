import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Player } from '../types/cricket';
import { ArrowLeft, Activity, BarChart3, User, Trophy } from 'lucide-react';
import { storageService } from '../services/storageService';

type TabType = 'overview' | 'stats' | 'attributes' | 'teams';

export const PlayerDetailPage: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [player, setPlayer] = useState<Player | undefined>(() =>
    playerId ? storageService.getPlayerById(playerId) : undefined,
  );
  const navigationState = location.state as { returnTo?: string; selectForXI?: boolean; isInTeam?: boolean } | null;
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [statFormat, setStatFormat] = useState<'IPL' | 'T20' | 'ODI' | 'TEST'>('IPL');

  useEffect(() => {
    const refreshPlayer = () => setPlayer(playerId ? storageService.getPlayerById(playerId) : undefined);
    refreshPlayer();
    return storageService.subscribe(refreshPlayer);
  }, [playerId]);

  if (!player) {
    return (
      <div className="min-h-[60vh] w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <button type="button" onClick={() => navigate('/players')} className="inline-flex items-center gap-2 text-sm text-[#929BA8] hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to players
          </button>
          <p role="alert" className="mt-8 text-rose-400">Player not found.</p>
        </div>
      </div>
    );
  }

  const currentStats =
    statFormat === 'IPL'
      ? player.stats.IPL || player.stats.T20
      : statFormat === 'ODI'
      ? player.stats.ODI
      : statFormat === 'TEST'
      ? player.stats.TEST
      : player.stats.T20;
  const legacyTeamNames: Record<string, string> = {
    'team-csk': 'Chennai Super Kings',
    'team-mi': 'Mumbai Indians',
    'team-rcb': 'Royal Challengers Bengaluru',
    'team-kkr': 'Kolkata Knight Riders',
    'team-srh': 'Sunrisers Hyderabad',
    'team-rr': 'Rajasthan Royals',
    'team-gt': 'Gujarat Titans',
    'team-dc': 'Delhi Capitals',
    'team-ind': 'India National Team',
    'team-aus': 'Australia National Team',
    'team-sa': 'South Africa National Team',
  };
  const associatedTeams = player.teamsPlayed.map((teamId) => ({
    id: teamId,
    name: storageService.getTeamById(teamId)?.name ?? legacyTeamNames[teamId] ?? teamId,
  }));

  return (
    <div className="min-h-[70vh] w-full">
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-[#182420] via-[#14221f] to-[#101a26]">
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate(navigationState?.returnTo || '/players')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#C0C7D1] transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            {navigationState?.selectForXI && (
              <button
                type="button"
                onClick={() => navigate(navigationState.returnTo || '/players', { state: { selectPlayerId: player.id } })}
                className={`rounded-xl px-3 py-2 text-xs font-bold shadow-md transition-colors ${
                  navigationState.isInTeam
                    ? 'border border-rose-500/30 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                    : 'bg-[#20C878] text-[#090B0F] hover:bg-[#1bb56c]'
                }`}
              >
                {navigationState.isInTeam ? 'Remove from XI' : '+ Select for XI'}
              </button>
            )}
          </div>

          <div className="flex min-w-0 flex-wrap items-end gap-5 sm:gap-8">
            <img
              src={player.imageUrl}
              alt={player.displayName}
              className="h-32 w-28 shrink-0 self-end object-contain object-bottom sm:h-40 sm:w-36 lg:h-48 lg:w-44"
            />
            <div className="pb-4 sm:pb-6">
              <div className="flex items-center gap-2">
                {player.countryFlagUrl && (
                  <img
                    src={player.countryFlagUrl}
                    alt={`${player.country} flag`}
                    className="h-4 w-6 rounded-sm object-cover"
                  />
                )}
                <span className="text-xs uppercase font-bold text-[#20C878] tracking-wider">
                  {player.country}
                </span>
                {player.careerStatus === 'Legend' && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold uppercase">
                    All-Time Legend
                  </span>
                )}
              </div>
              <h2 className="mt-1 line-clamp-2 text-lg font-bold font-heading text-white sm:text-2xl">
                {player.fullName}
              </h2>
              <p className="mt-1 text-sm text-[#B0BAC8]">{player.specialization}</p>
            </div>
          </div>
        </div>
      </section>

      <nav aria-label="Player details" className="border-b border-white/10 bg-[#121720]">
        <div className="mx-auto flex max-w-7xl overflow-x-auto px-2 sm:px-6 lg:px-8">
          {(
            [
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'stats', label: 'Statistics', icon: BarChart3 },
              { id: 'attributes', label: 'Attributes & Skills', icon: Activity },
              { id: 'teams', label: 'Franchises & History', icon: Trophy },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-3 text-xs font-semibold border-b-2 transition-all sm:px-4 ${
                  activeTab === tab.id
                    ? 'border-[#20C878] text-[#20C878]'
                    : 'border-transparent text-[#929BA8] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="mx-auto min-h-[420px] w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-6">
              {/* Bio */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#929BA8] mb-2">
                  Player Biography
                </h4>
                <p className="text-sm text-[#F5F7FA] leading-relaxed bg-[#181F29] p-4 rounded-xl border border-white/5">
                  {player.bio}
                </p>
              </div>

              {/* Technical Specifications */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#181F29] p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-[#929BA8] uppercase block">Primary Role</span>
                  <span className="text-sm font-bold text-white mt-1 block">
                    {player.primaryRole}
                  </span>
                </div>
                <div className="bg-[#181F29] p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-[#929BA8] uppercase block">Batting Hand</span>
                  <span className="text-sm font-bold text-white mt-1 block">
                    {player.battingHand}
                  </span>
                </div>
                <div className="bg-[#181F29] p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-[#929BA8] uppercase block">Bowling Style</span>
                  <span className="text-sm font-bold text-white mt-1 block">
                    {player.bowlingStyle}
                  </span>
                </div>
                <div className="bg-[#181F29] p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-[#929BA8] uppercase block">Status</span>
                  <span className="text-sm font-bold text-[#20C878] mt-1 block">
                    {player.careerStatus}
                  </span>
                </div>
              </div>

              {/* Format Ratings Trio */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#929BA8] mb-3">
                  Format-Specific Master Ratings
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gradient-to-br from-[#181F29] to-[#121720] p-4 rounded-xl border border-white/5 text-center">
                    <span className="text-xs font-bold text-[#929BA8] block">T20 Rating</span>
                    <span className="text-2xl font-extrabold font-heading text-[#20C878] mt-1 block">
                      {player.formatRatings.T20}
                    </span>
                  </div>
                  <div className="bg-gradient-to-br from-[#181F29] to-[#121720] p-4 rounded-xl border border-white/5 text-center">
                    <span className="text-xs font-bold text-[#929BA8] block">ODI Rating</span>
                    <span className="text-2xl font-extrabold font-heading text-[#3BA7FF] mt-1 block">
                      {player.formatRatings.ODI}
                    </span>
                  </div>
                  <div className="bg-gradient-to-br from-[#181F29] to-[#121720] p-4 rounded-xl border border-white/5 text-center">
                    <span className="text-xs font-bold text-[#929BA8] block">TEST Rating</span>
                    <span className="text-2xl font-extrabold font-heading text-[#F9CD05] mt-1 block">
                      {player.formatRatings.TEST}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="flex flex-col gap-4">
              {/* Format Selector Pills */}
              <div className="flex items-center gap-2">
                {(['IPL', 'T20', 'ODI', 'TEST'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setStatFormat(fmt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      statFormat === fmt
                        ? 'bg-[#20C878] text-[#090B0F]'
                        : 'bg-[#181F29] text-[#929BA8] hover:text-white'
                    }`}
                  >
                    {fmt} Record
                  </button>
                ))}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#181F29] p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-[#929BA8] uppercase block">Matches</span>
                  <span className="text-lg font-bold text-white mt-1 block">{currentStats.matches}</span>
                </div>
                <div className="bg-[#181F29] p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-[#929BA8] uppercase block">Runs</span>
                  <span className="text-lg font-bold text-white mt-1 block">{currentStats.runs}</span>
                </div>
                <div className="bg-[#181F29] p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-[#929BA8] uppercase block">Batting Avg</span>
                  <span className="text-lg font-bold text-emerald-400 mt-1 block">
                    {currentStats.battingAverage}
                  </span>
                </div>
                <div className="bg-[#181F29] p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-[#929BA8] uppercase block">Strike Rate</span>
                  <span className="text-lg font-bold text-sky-400 mt-1 block">
                    {currentStats.strikeRate}
                  </span>
                </div>
                <div className="bg-[#181F29] p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-[#929BA8] uppercase block">Centuries / 50s</span>
                  <span className="text-lg font-bold text-white mt-1 block">
                    {currentStats.centuries} / {currentStats.fifties}
                  </span>
                </div>
                <div className="bg-[#181F29] p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-[#929BA8] uppercase block">Highest Score</span>
                  <span className="text-lg font-bold text-white mt-1 block">
                    {currentStats.highestScore}
                  </span>
                </div>
                <div className="bg-[#181F29] p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-[#929BA8] uppercase block">Wickets</span>
                  <span className="text-lg font-bold text-rose-400 mt-1 block">{currentStats.wickets}</span>
                </div>
                <div className="bg-[#181F29] p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-[#929BA8] uppercase block">Economy Rate</span>
                  <span className="text-lg font-bold text-white mt-1 block">{currentStats.economy}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attributes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Batting Attributes */}
              <div className="bg-[#181F29] p-4 rounded-xl border border-white/5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#3BA7FF] mb-3 flex items-center gap-1.5">
                  <span>🏏</span> Batting Metrics
                </h4>
                <div className="flex flex-col gap-2.5">
                  {[
                    { label: 'Technique', val: player.attributes.technique },
                    { label: 'Power Hitting', val: player.attributes.powerHitting },
                    { label: 'Timing & Placement', val: player.attributes.timing },
                    { label: 'Against Express Pace', val: player.attributes.againstPace },
                    { label: 'Against Quality Spin', val: player.attributes.againstSpin },
                    { label: 'Finishing & Death Overs', val: player.attributes.finishing },
                  ].map((attr) => (
                    <div key={attr.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#929BA8]">{attr.label}</span>
                        <span className="font-bold text-white">{attr.val}</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#121720] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 to-[#3BA7FF] rounded-full"
                          style={{ width: `${attr.val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bowling & Fielding Attributes */}
              <div className="bg-[#181F29] p-4 rounded-xl border border-white/5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#20C878] mb-3 flex items-center gap-1.5">
                  <span>🎯</span> Bowling & Athleticism
                </h4>
                <div className="flex flex-col gap-2.5">
                  {[
                    { label: 'Accuracy & Line', val: player.attributes.accuracy },
                    { label: 'Variations & Deception', val: player.attributes.variations },
                    { label: 'Death Over Execution', val: player.attributes.deathBowling },
                    { label: 'Catching & Reflexes', val: player.attributes.catching },
                    { label: 'Ground Fielding Speed', val: player.attributes.groundFielding },
                    { label: 'Pressure Handling', val: player.attributes.pressureHandling },
                  ].map((attr) => (
                    <div key={attr.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#929BA8]">{attr.label}</span>
                        <span className="font-bold text-white">{attr.val}</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#121720] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-[#20C878] rounded-full"
                          style={{ width: `${attr.val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#929BA8]">
                Associated Teams & Franchises
              </h4>
              {associatedTeams.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {associatedTeams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#181F29] p-3"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#121720] font-bold font-heading text-white">
                        {team.id.replace('team-', '').toUpperCase()}
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-white">{team.name}</span>
                        <span className="text-xs text-[#929BA8]">Eligible Squad Member</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-[#929BA8]">
                  No associated teams or franchises have been added yet.
                </p>
              )}
            </div>
          )}
      </div>
    </div>
  );
};
