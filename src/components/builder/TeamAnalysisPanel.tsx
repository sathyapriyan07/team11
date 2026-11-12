import React from 'react';
import { TeamAnalysis } from '../../types/cricket';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Lightbulb,
  Shield,
  Target,
  TrendingUp,
} from 'lucide-react';

interface TeamAnalysisPanelProps {
  analysis: TeamAnalysis;
}

const MetricCard: React.FC<{ label: string; value: number | null; featured?: boolean }> = ({
  label,
  value,
  featured = false,
}) => (
  <div className={`rounded-xl border p-4 ${featured ? 'border-[#4A505B] bg-[#1C2027]' : 'border-white/[0.07] bg-[#171A20]'}`}>
    <div className="flex items-start justify-between gap-2">
      <p className="text-xs font-medium text-[#A0A5AE]">{label}</p>
      {value !== null && <span className="text-[9px] text-[#747B86]">/ 100</span>}
    </div>
    <p className={`mt-3 font-heading font-semibold tabular-nums text-[#F3F4F6] ${featured ? 'text-3xl' : 'text-2xl'}`}>
      {value === null ? '—' : value}
    </p>
    {value !== null && (
      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#090B0F]"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      >
        <div className="h-full rounded-full bg-[#B7BBC4] transition-[width] duration-300" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    )}
    {value === null && <p className="mt-2 text-[10px] text-[#747B86]">Not enough role-specific data</p>}
  </div>
);

export const TeamAnalysisPanel: React.FC<TeamAnalysisPanelProps> = ({ analysis }) => {
  const metrics = [
    { label: 'Batting strength', value: analysis.battingStrength },
    { label: 'Bowling strength', value: analysis.bowlingStrength },
    { label: 'Pace attack', value: analysis.paceAttackStrength },
    { label: 'Spin attack', value: analysis.spinAttackStrength },
    { label: 'All-rounder strength', value: analysis.allRoundStrength },
    { label: 'Fielding strength', value: analysis.fieldingStrength },
    { label: 'Wicketkeeping strength', value: analysis.wicketkeepingStrength },
    { label: 'Batting depth', value: analysis.battingDepth },
    { label: 'Finishing (5–8)', value: analysis.finishingStrength },
    { label: 'Death-over bowling', value: analysis.deathOverBowlingStrength },
  ];

  const { rightHanders, leftHanders } = analysis.leftRightBalance;
  const batterTotal = rightHanders + leftHanders;
  const rightPercent = batterTotal ? Math.round((rightHanders / batterTotal) * 100) : null;
  const leftPercent = rightPercent === null ? null : 100 - rightPercent;

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-[#111318] p-4 sm:p-6" aria-labelledby="team-analysis-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.14em] text-[#AEB3BC]">
            <TrendingUp className="h-4 w-4" />
            TEAM PROFILE
          </div>
          <h2 id="team-analysis-title" className="mt-2 font-heading text-xl font-semibold text-[#F5F5F6]">
            Tactical analysis
          </h2>
          <p className="mt-1 text-xs text-[#858B96]">
            Ratings are calculated from the selected players’ attributes and batting order.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[#343943] bg-[#171A20] px-4 py-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg border border-[#454B56] text-[#B7BBC4]">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[9px] font-medium text-[#858B96]">Overall rating</p>
            <p className="font-heading text-xl font-semibold tabular-nums text-[#F5F5F6]">
              {analysis.overallRating === null ? '—' : analysis.overallRating}
              {analysis.overallRating !== null && <span className="ml-1 text-[10px] font-normal text-[#858B96]">/ 100</span>}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.label} {...metric} featured={index < 2} />
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-xl border border-white/[0.07] bg-[#171A20] p-4" aria-label="Batting structure">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#E3E5E9]">
            <Shield className="h-4 w-4 text-[#AEB3BC]" />
            Batting structure
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-[#111318] p-3">
              <p className="text-[9px] font-medium text-[#858B96]">Opening combination</p>
              <p className="mt-1 truncate text-xs font-semibold text-[#E3E5E9]">
                {analysis.openingPair.length === 2 ? analysis.openingPair.join(' + ') : 'Not set'}
              </p>
              <p className="mt-2 font-heading text-lg font-semibold tabular-nums text-[#F3F4F6]">
                {analysis.openingCombination === null ? '—' : analysis.openingCombination}
              </p>
            </div>
            <div className="rounded-lg bg-[#111318] p-3">
              <p className="text-[9px] font-medium text-[#858B96]">Middle-order stability</p>
              <p className="mt-1 text-xs text-[#858B96]">Batting positions 3–6</p>
              <p className="mt-2 font-heading text-lg font-semibold tabular-nums text-[#F3F4F6]">
                {analysis.middleOrderStability === null ? '—' : analysis.middleOrderStability}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-[10px] text-[#858B96]">
              <span>Right hand · {rightHanders}</span>
              <span>Left hand · {leftHanders}</span>
            </div>
            <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-[#090B0F]" aria-label="Batting hand distribution">
              {rightPercent !== null && <div className="bg-[#B7BBC4]" style={{ width: `${rightPercent}%` }} />}
              {leftPercent !== null && <div className="bg-[#626975]" style={{ width: `${leftPercent}%` }} />}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-white/[0.07] bg-[#171A20] p-4" aria-label="Tactical findings">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <h3 className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.1em] text-[#BFC3CA]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Strengths
              </h3>
              {analysis.strengths.length ? (
                <ul className="mt-3 space-y-2 text-xs leading-5 text-[#C3C7CE]">
                  {analysis.strengths.map((item) => <li key={item}>{item}</li>)}
                </ul>
              ) : <p className="mt-3 text-xs text-[#858B96]">More players are needed to identify strengths.</p>}
            </div>
            <div>
              <h3 className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.1em] text-[#BFC3CA]">
                <AlertTriangle className="h-3.5 w-3.5" />
                Risks
              </h3>
              {analysis.weaknesses.length ? (
                <ul className="mt-3 space-y-2 text-xs leading-5 text-[#C3C7CE]">
                  {analysis.weaknesses.map((item) => <li key={item}>{item}</li>)}
                </ul>
              ) : <p className="mt-3 text-xs text-[#858B96]">No clear risks from the current selection.</p>}
            </div>
            <div>
              <h3 className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.1em] text-[#BFC3CA]">
                <Lightbulb className="h-3.5 w-3.5" />
                Consider
              </h3>
              {analysis.recommendations.length ? (
                <ul className="mt-3 space-y-2 text-xs leading-5 text-[#C3C7CE]">
                  {analysis.recommendations.map((item) => (
                    <li key={item} className="flex items-start gap-1.5">
                      <ArrowUpRight className="mt-0.5 h-3 w-3 shrink-0 text-[#858B96]" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : <p className="mt-3 text-xs text-[#858B96]">No recommendations from the current selection.</p>}
            </div>
          </div>
        </section>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-white/[0.07] pt-4 text-[10px] text-[#858B96]">
        <span>{analysis.roleDistribution.batters} batters</span>
        <span>{analysis.roleDistribution.wicketkeepers} wicketkeepers</span>
        <span>{analysis.roleDistribution.allRounders} all-rounders</span>
        <span>{analysis.roleDistribution.bowlers} specialist bowlers</span>
        <span>{analysis.bowlingBreakdown.paceBowlers} pace options</span>
        <span>{analysis.bowlingBreakdown.spinBowlers} spin options</span>
      </div>
    </section>
  );
};
