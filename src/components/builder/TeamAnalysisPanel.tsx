import React from 'react';
import { TeamAnalysis } from '../../types/cricket';
import {
  TrendingUp,
  Shield,
  Zap,
  Target,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';

interface TeamAnalysisPanelProps {
  analysis: TeamAnalysis;
}

export const TeamAnalysisPanel: React.FC<TeamAnalysisPanelProps> = ({ analysis }) => {
  const metrics = [
    { label: 'Overall Rating', val: analysis.overallRating, color: 'from-[#20C878] to-emerald-400', icon: Sparkles },
    { label: 'Batting Firepower', val: analysis.battingStrength, color: 'from-sky-500 to-[#3BA7FF]', icon: Target },
    { label: 'Bowling Venom', val: analysis.bowlingStrength, color: 'from-rose-500 to-red-400', icon: Shield },
    { label: 'Pace Attack', val: analysis.paceAttackStrength, color: 'from-amber-500 to-orange-400', icon: Zap },
    { label: 'Spin Attack', val: analysis.spinAttackStrength, color: 'from-purple-500 to-indigo-400', icon: TrendingUp },
    { label: 'Finishing (#5-#8)', val: analysis.finishingStrength, color: 'from-emerald-500 to-teal-400', icon: Zap },
    { label: 'Fielding & Agility', val: analysis.fieldingStrength, color: 'from-blue-500 to-cyan-400', icon: Shield },
    { label: 'Batting Depth', val: analysis.battingDepth, color: 'from-lime-500 to-green-400', icon: Target },
  ];

  const totalBatters = analysis.leftRightBalance.rightHanders + analysis.leftRightBalance.leftHanders || 1;
  const rhbPercent = Math.round((analysis.leftRightBalance.rightHanders / totalBatters) * 100);
  const lhbPercent = 100 - rhbPercent;

  return (
    <div className="flex flex-col gap-6 bg-[#121720] border border-white/10 rounded-2xl p-6 shadow-xl">
      <div>
        <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#20C878]" />
          Tactical Lineup Analysis & Squad Intelligence
        </h3>
        <p className="text-xs text-[#929BA8] mt-1">
          Derives genuine strengths, weaknesses, and tactical metrics strictly from verified player attributes.
        </p>
      </div>

      {/* Metrics Bar Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="bg-[#181F29] p-4 rounded-xl border border-white/5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#929BA8] font-semibold">{m.label}</span>
                <Icon className="w-4 h-4 text-[#929BA8]" />
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <span className="text-2xl font-extrabold font-heading text-white">{m.val}</span>
                <span className="text-[11px] font-bold text-[#929BA8]">/ 100</span>
              </div>

              <div className="w-full h-2 bg-[#090B0F] rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${m.color} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(100, m.val)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Team Balance Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left vs Right Hand Batting Split */}
        <div className="bg-[#181F29] p-4 rounded-xl border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Batting Hand Distribution
            </span>
            <span className="text-xs text-[#929BA8]">
              {analysis.leftRightBalance.rightHanders} RHB • {analysis.leftRightBalance.leftHanders} LHB
            </span>
          </div>

          <div className="w-full h-4 bg-[#090B0F] rounded-full overflow-hidden flex my-2 border border-white/10">
            <div
              style={{ width: `${rhbPercent}%` }}
              className="bg-[#3BA7FF] h-full transition-all"
              title={`Right Handers: ${rhbPercent}%`}
            />
            <div
              style={{ width: `${lhbPercent}%` }}
              className="bg-[#20C878] h-full transition-all"
              title={`Left Handers: ${lhbPercent}%`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#929BA8]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3BA7FF]" />
              Right-Hand ({rhbPercent}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#20C878]" />
              Left-Hand ({lhbPercent}%)
            </span>
          </div>
        </div>

        {/* Pace vs Spin Attack Split */}
        <div className="bg-[#181F29] p-4 rounded-xl border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Bowling Attack Arsenal
            </span>
            <span className="text-xs text-[#929BA8]">
              {analysis.bowlingBreakdown.paceBowlers} Pacers • {analysis.bowlingBreakdown.spinBowlers} Spinners
            </span>
          </div>

          <div className="flex items-center gap-4 my-2">
            <div className="flex-1 bg-[#121720] p-3 rounded-lg text-center">
              <span className="text-[10px] text-[#929BA8] block uppercase">Pace Options</span>
              <span className="text-lg font-bold text-amber-400 mt-0.5 block">
                {analysis.bowlingBreakdown.paceBowlers}
              </span>
            </div>
            <div className="flex-1 bg-[#121720] p-3 rounded-lg text-center">
              <span className="text-[10px] text-[#929BA8] block uppercase">Spin Options</span>
              <span className="text-lg font-bold text-purple-400 mt-0.5 block">
                {analysis.bowlingBreakdown.spinBowlers}
              </span>
            </div>
            <div className="flex-1 bg-[#121720] p-3 rounded-lg text-center">
              <span className="text-[10px] text-[#929BA8] block uppercase">6th Bowler</span>
              <span
                className={`text-sm font-bold mt-1 block ${
                  analysis.bowlingBreakdown.sixthBowlingOption ? 'text-[#20C878]' : 'text-rose-400'
                }`}
              >
                {analysis.bowlingBreakdown.sixthBowlingOption ? 'Active' : 'Missing'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic SWOT & Tactical Advice */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Strengths */}
        <div className="bg-[#181F29] p-4 rounded-xl border border-emerald-500/20">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#20C878] mb-3">
            <CheckCircle className="w-4 h-4" />
            Tactical Strengths
          </div>
          <ul className="flex flex-col gap-2 text-xs text-[#F5F7FA]">
            {analysis.strengths.map((s, idx) => (
              <li key={`str-${idx}`} className="flex items-start gap-2">
                <span className="text-[#20C878] font-bold">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-[#181F29] p-4 rounded-xl border border-rose-500/20">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400 mb-3">
            <AlertTriangle className="w-4 h-4" />
            Tactical Vulnerabilities
          </div>
          <ul className="flex flex-col gap-2 text-xs text-[#F5F7FA]">
            {analysis.weaknesses.map((w, idx) => (
              <li key={`weak-${idx}`} className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="bg-[#181F29] p-4 rounded-xl border border-[#3BA7FF]/20">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3BA7FF] mb-3">
            <Lightbulb className="w-4 h-4" />
            Analyst Advice
          </div>
          <ul className="flex flex-col gap-2 text-xs text-[#F5F7FA]">
            {analysis.recommendations.map((r, idx) => (
              <li key={`rec-${idx}`} className="flex items-start gap-2">
                <span className="text-[#3BA7FF] font-bold">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
