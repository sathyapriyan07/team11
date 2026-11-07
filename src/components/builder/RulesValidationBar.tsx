import React, { useState } from 'react';
import { ValidationResult } from '../../types/cricket';
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp, Shield, Crown } from 'lucide-react';

interface RulesValidationBarProps {
  validation: ValidationResult;
  onSaveDraft?: () => void;
  onSaveCompleted?: () => void;
  canSave?: boolean;
}

export const RulesValidationBar: React.FC<RulesValidationBarProps> = ({
  validation,
  onSaveDraft,
  onSaveCompleted,
  canSave = true,
}) => {
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const isCompletedReady = validation.isValid && validation.playersCount === 11;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#121720]">
      {/* Top Banner Status Bar */}
      <div className="flex flex-col gap-2 p-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:p-3">
        {/* Main Status Pill */}
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
              validation.status === 'valid'
                ? 'bg-[#20C878]/20 text-[#20C878]'
                : validation.status === 'warning'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-rose-500/20 text-rose-400'
            }`}
          >
            {validation.status === 'valid' && <CheckCircle2 className="h-4 w-4" />}
            {validation.status === 'warning' && <AlertTriangle className="h-4 w-4" />}
            {validation.status === 'invalid' && <XCircle className="h-4 w-4" />}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`text-[9px] font-bold uppercase tracking-wide sm:text-[10px] ${
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
            <p className="mt-0.5 text-[9px] leading-snug text-[#929BA8] sm:text-[10px]">
              {validation.errors.length > 0
                ? validation.errors[0]
                : validation.warnings.length > 0
                ? validation.warnings[0]
                : 'Lineup meets all competition parameters, quota limits and role constraints.'}
            </p>
          </div>
        </div>

        {/* Tactical Counters */}
        <div className="flex w-full flex-wrap items-center gap-1.5 text-[9px] sm:w-auto sm:gap-2 sm:text-[10px]">
          {/* Starting Count */}
          <div className="flex shrink-0 items-center gap-1 rounded-lg border border-white/5 bg-[#181F29] px-2 py-1">
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
          <div className="flex shrink-0 items-center gap-1 rounded-lg border border-white/5 bg-[#181F29] px-2 py-1">
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
              className="rounded-lg bg-white/5 p-1 hover:bg-white/10 text-[#929BA8] hover:text-white transition-colors"
            >
              {showDetails ? <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            </button>
          )}

          {/* Action buttons */}
          <div className="ml-auto flex min-w-0 items-center gap-1.5 sm:ml-0">
            {onSaveDraft && (
              <button
                type="button"
                onClick={onSaveDraft}
                disabled={!canSave}
                className="min-h-7 whitespace-nowrap rounded-lg border border-white/5 bg-[#181F29] px-2 py-1 text-[9px] font-semibold text-[#929BA8] transition-colors hover:bg-[#202938] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-8 sm:px-2.5 sm:text-[10px]"
              >
                Save Draft
              </button>
            )}

            {onSaveCompleted && (
              <button
                type="button"
                onClick={onSaveCompleted}
                disabled={!canSave || !isCompletedReady}
                className={`min-h-7 whitespace-nowrap rounded-lg px-2 py-1 text-[9px] font-bold transition-all sm:min-h-8 sm:px-2.5 sm:text-[10px] ${
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
