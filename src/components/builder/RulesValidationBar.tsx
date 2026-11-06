import React, { useState } from 'react';
import { ValidationResult } from '../../types/cricket';
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp, Shield, Crown } from 'lucide-react';

interface RulesValidationBarProps {
  validation: ValidationResult;
  onSaveDraft?: () => void;
  onSaveCompleted?: () => void;
}

export const RulesValidationBar: React.FC<RulesValidationBarProps> = ({
  validation,
  onSaveDraft,
  onSaveCompleted,
}) => {
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const isCompletedReady = validation.isValid && validation.playersCount === 11;

  return (
    <div className="flex flex-col bg-[#121720] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
      {/* Top Banner Status Bar */}
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        {/* Main Status Pill */}
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              validation.status === 'valid'
                ? 'bg-[#20C878]/20 text-[#20C878]'
                : validation.status === 'warning'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-rose-500/20 text-rose-400'
            }`}
          >
            {validation.status === 'valid' && <CheckCircle2 className="w-5 h-5" />}
            {validation.status === 'warning' && <AlertTriangle className="w-5 h-5" />}
            {validation.status === 'invalid' && <XCircle className="w-5 h-5" />}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  validation.status === 'valid'
                    ? 'text-[#20C878]'
                    : validation.status === 'warning'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {validation.status === 'valid'
                  ? 'Rules Compliant & Match-Ready'
                  : validation.status === 'warning'
                  ? 'Lineup Advisory Warning'
                  : 'Rules Infraction Detected'}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#929BA8]">
              {validation.errors.length > 0
                ? validation.errors[0]
                : validation.warnings.length > 0
                ? validation.warnings[0]
                : 'Lineup meets all competition parameters, quota limits and role constraints.'}
            </p>
          </div>
        </div>

        {/* Tactical Counters */}
        <div className="flex w-full flex-wrap items-center gap-2 text-xs sm:w-auto sm:gap-3">
          {/* Starting Count */}
          <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/5 bg-[#181F29] px-3 py-1.5">
            <span className="text-[#929BA8]">XI:</span>
            <span
              className={`font-bold ${
                validation.playersCount === 11 ? 'text-[#20C878]' : 'text-amber-400'
              }`}
            >
              {validation.playersCount} / 11
            </span>
          </div>

          {/* Overseas Count */}
          <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/5 bg-[#181F29] px-3 py-1.5">
            <span className="text-[#929BA8]">Overseas:</span>
            <span
              className={`font-bold ${
                validation.overseasCount <= validation.maxOverseas ? 'text-[#20C878]' : 'text-rose-400'
              }`}
            >
              {validation.overseasCount} / {validation.maxOverseas}
            </span>
          </div>

          {/* Captain & Keeper Status */}
          <div className="hidden sm:flex items-center gap-2">
            <span
              title={validation.hasCaptain ? 'Captain Assigned' : 'Missing Captain'}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold ${
                validation.hasCaptain
                  ? 'bg-amber-400/20 text-amber-300'
                  : 'bg-white/5 text-[#929BA8] line-through'
              }`}
            >
              C
            </span>
            <span
              title={validation.hasViceCaptain ? 'Vice Captain Assigned' : 'Missing Vice Captain'}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold ${
                validation.hasViceCaptain
                  ? 'bg-sky-400/20 text-sky-300'
                  : 'bg-white/5 text-[#929BA8] line-through'
              }`}
            >
              VC
            </span>
            <span
              title={validation.hasWicketkeeper ? 'Keeper Assigned' : 'Missing Keeper'}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold ${
                validation.hasWicketkeeper
                  ? 'bg-emerald-400/20 text-emerald-300'
                  : 'bg-white/5 text-[#929BA8] line-through'
              }`}
            >
              WK
            </span>
          </div>

          {/* Toggle breakdown details */}
          {(validation.errors.length > 0 || validation.warnings.length > 0) && (
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              aria-label={showDetails ? 'Hide validation details' : 'Show validation details'}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#929BA8] hover:text-white transition-colors"
            >
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}

          {/* Action buttons */}
          <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-2 sm:ml-0">
            {onSaveDraft && (
              <button
                type="button"
                onClick={onSaveDraft}
                className="min-h-9 flex-1 whitespace-nowrap rounded-xl border border-white/5 bg-[#181F29] px-3 py-1.5 text-xs font-semibold text-[#929BA8] transition-colors hover:bg-[#202938] hover:text-white sm:flex-none"
              >
                Save Draft
              </button>
            )}

            {onSaveCompleted && (
              <button
                type="button"
                onClick={onSaveCompleted}
                disabled={!isCompletedReady}
                className={`min-h-9 flex-1 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-md sm:flex-none sm:px-4 ${
                  isCompletedReady
                    ? 'bg-[#20C878] hover:bg-[#1bb56c] text-[#090B0F]'
                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                }`}
              >
                Save Completed XI
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Breakdown Drawer */}
      {showDetails && (validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="p-4 bg-[#181F29] border-t border-white/5 flex flex-col gap-2 text-xs">
          {validation.errors.map((err, i) => (
            <div key={`err-${i}`} className="flex items-center gap-2 text-rose-400">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{err}</span>
            </div>
          ))}
          {validation.warnings.map((warn, i) => (
            <div key={`warn-${i}`} className="flex items-center gap-2 text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{warn}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
