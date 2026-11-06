import React, { useState } from 'react';
import { Player } from '../../types/cricket';
import { X, Award, Shield, Activity, BarChart3, User, Globe, Trophy } from 'lucide-react';

interface PlayerDetailModalProps {
  player: Player | null;
  onClose: () => void;
  onSelectForXI?: (player: Player) => void;
  isInTeam?: boolean;
}

type TabType = 'overview' | 'stats' | 'attributes' | 'teams';

export const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({
  player,
  onClose,
  onSelectForXI,
  isInTeam = false,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [statFormat, setStatFormat] = useState<'IPL' | 'T20' | 'ODI' | 'TEST'>('IPL');

  if (!player) return null;

  const currentStats =
    statFormat === 'IPL'
      ? player.stats.IPL || player.stats.T20
      : statFormat === 'ODI'
      ? player.stats.ODI
      : statFormat === 'TEST'
      ? player.stats.TEST
      : player.stats.T20;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#121720] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header Cover Bar */}
        <div className="relative h-32 sm:h-40 bg-gradient-to-r from-[#182420] via-[#1b2f28] to-[#142334] p-6 flex items-end justify-between">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {onSelectForXI && (
              <button
                type="button"
                onClick={() => onSelectForXI(player)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                  isInTeam
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                    : 'bg-[#20C878] text-[#090B0F] hover:bg-[#1bb56c]'
                }`}
              >
                {isInTeam ? 'Remove from Lineup' : '+ Select for XI'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-[#20C878] bg-[#090B0F] shadow-xl shrink-0 -mb-8">
              <img
                src={player.imageUrl}
                alt={player.displayName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-[#20C878] tracking-wider">
                  {player.country}
                </span>
                {player.careerStatus === 'Legend' && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold uppercase">
                    All-Time Legend
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
                {player.fullName}
              </h2>
              <p className="text-xs text-[#929BA8]">{player.specialization}</p>
            </div>
          </div>

          {/* Ratings Pill */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] text-[#929BA8] uppercase font-bold">Overall Rating</span>
            <span className="text-3xl font-extrabold font-heading text-[#20C878]">
              {player.overallRating}
            </span>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-white/5 bg-[#181F29] px-6 pt-8">
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
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
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

        {/* Tab Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {player.teamsPlayed.map((teamId) => (
                  <div
                    key={teamId}
                    className="flex items-center gap-3 p-3 bg-[#181F29] rounded-xl border border-white/5"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#121720] flex items-center justify-center font-bold font-heading text-white">
                      {teamId.replace('team-', '').toUpperCase()}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">
                        {teamId === 'team-csk' && 'Chennai Super Kings'}
                        {teamId === 'team-mi' && 'Mumbai Indians'}
                        {teamId === 'team-rcb' && 'Royal Challengers Bengaluru'}
                        {teamId === 'team-kkr' && 'Kolkata Knight Riders'}
                        {teamId === 'team-srh' && 'Sunrisers Hyderabad'}
                        {teamId === 'team-rr' && 'Rajasthan Royals'}
                        {teamId === 'team-gt' && 'Gujarat Titans'}
                        {teamId === 'team-dc' && 'Delhi Capitals'}
                        {teamId === 'team-ind' && 'India National Team'}
                        {teamId === 'team-aus' && 'Australia National Team'}
                        {teamId === 'team-sa' && 'South Africa National Team'}
                      </span>
                      <span className="text-xs text-[#929BA8]">Eligible Squad Member</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
