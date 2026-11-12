import React from 'react';
import { ValidationResult } from '../../types/cricket';
import { AlertTriangle, Check, ChevronRight, CircleAlert, ShieldCheck } from 'lucide-react';

export interface BuilderConfigurationIssue {
  label: string;
  message: string;
  field: 'competition' | 'team' | 'pool';
}

interface RulesValidationBarProps {
  validation: ValidationResult;
  configurationIssues?: BuilderConfigurationIssue[];
  onFixConfiguration?: (field: BuilderConfigurationIssue['field']) => void;
  onReviewLineup?: () => void;
  onSaveDraft?: () => void;
  onSaveCompleted?: () => void;
  canSave?: boolean;
}

export const RulesValidationBar: React.FC<RulesValidationBarProps> = ({
  validation,
  configurationIssues = [],
  onFixConfiguration,
  onReviewLineup,
  onSaveDraft,
  onSaveCompleted,
  canSave = true,
}) => {
  const isReady = validation.isValid &&
    validation.playersCount === validation.requiredPlayersCount &&
    configurationIssues.length === 0;
  const blockingCount = validation.errors.length + configurationIssues.length;
  const statusLabel = isReady
    ? 'Ready to publish'
    : blockingCount > 0
    ? `${blockingCount} item${blockingCount === 1 ? '' : 's'} to fix`
    : 'Requirements met · review advisories';

  const requirementRows = [
    {
      label: 'Starting XI',
      value: `${validation.playersCount} / ${validation.requiredPlayersCount}`,
      complete: validation.playersCount === validation.requiredPlayersCount,
    },
    {
      label: 'Captain',
      value: validation.hasCaptain ? 'Assigned' : validation.requireCaptain ? 'Required' : 'Optional',
      complete: validation.hasCaptain || !validation.requireCaptain,
    },
    {
      label: 'Vice-captain',
      value: validation.hasViceCaptain ? 'Assigned' : validation.requireViceCaptain ? 'Required' : 'Optional',
      complete: validation.hasViceCaptain || !validation.requireViceCaptain,
    },
    {
      label: 'Wicketkeepers',
      value: `${validation.wicketkeepersCount} · ${validation.minWicketkeepers}–${validation.maxWicketkeepers}`,
      complete: validation.wicketkeepersCount >= validation.minWicketkeepers &&
        validation.wicketkeepersCount <= validation.maxWicketkeepers,
    },
    {
      label: 'Overseas',
      value: `${validation.overseasCount} / ${validation.maxOverseas}`,
      complete: validation.overseasCount <= validation.maxOverseas,
    },
  ];

  return (
    <section className="rounded-2xl border border-[#262A32] bg-[#111318]" aria-label="Lineup validation">
      <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${
            isReady
              ? 'border-[#4A505B] bg-[#242830] text-[#D4D7DC]'
              : blockingCount
              ? 'border-rose-400/20 bg-rose-400/10 text-rose-300'
              : 'border-amber-300/20 bg-amber-300/10 text-amber-200'
          }`}>
            {isReady ? <ShieldCheck className="h-4 w-4" /> : blockingCount ? <CircleAlert className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-[#F2F3F5]">{statusLabel}</h2>
            <p className="mt-1 text-xs leading-5 text-[#858B96]">
              {isReady
                ? 'Competition requirements are satisfied for this lineup.'
                : 'Required rules block publishing; advisories are recommendations only.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-wrap lg:justify-end">
          {requirementRows.map((row) => (
            <div key={row.label} className="min-w-[104px] rounded-lg border border-white/[0.07] bg-[#171A20] px-3 py-2">
              <p className="text-[9px] text-[#858B96]">{row.label}</p>
              <p className={`mt-1 flex items-center gap-1 text-[11px] font-semibold ${
                row.complete ? 'text-[#D2D5DB]' : 'text-amber-200'
              }`}>
                {row.complete && <Check className="h-3 w-3" />}
                {row.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {(configurationIssues.length > 0 || validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="grid gap-4 border-t border-[#262A32] p-4 md:grid-cols-2">
          {(configurationIssues.length > 0 || validation.errors.length > 0) && (
            <div>
              <h3 className="text-[10px] font-semibold tracking-[0.12em] text-rose-200">Must fix</h3>
              <ul className="mt-2 space-y-2">
                {configurationIssues.map((issue) => (
                  <li key={issue.field} className="flex items-start justify-between gap-3 text-xs text-[#C7CBD2]">
                    <span>{issue.message}</span>
                    <button
                      type="button"
                      onClick={() => onFixConfiguration?.(issue.field)}
                      className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold text-[#D2D5DB] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B7BBC4]"
                    >
                      Fix <ChevronRight className="h-3 w-3" />
                    </button>
                  </li>
                ))}
                {validation.errors.map((error) => (
                  <li key={error} className="flex items-start justify-between gap-3 text-xs text-[#C7CBD2]">
                    <span>{error}</span>
                    <button
                      type="button"
                      onClick={onReviewLineup}
                      className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold text-[#D2D5DB] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B7BBC4]"
                    >
                      Review XI <ChevronRight className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {validation.warnings.length > 0 && (
            <div>
              <h3 className="text-[10px] font-semibold tracking-[0.12em] text-amber-100">Tactical advisories</h3>
              <ul className="mt-2 space-y-2 text-xs leading-5 text-[#AEB3BC]">
                {validation.warnings.map((warning) => (
                  <li key={warning} className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-200/80" />
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {(onSaveDraft || onSaveCompleted) && (
        <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 border-t border-[#262A32] bg-[#111318]/95 p-3 backdrop-blur-md sm:static sm:bg-transparent sm:backdrop-blur-none">
          <span className="text-[10px] text-[#858B96]">
            {validation.requireViceCaptain ? 'Captain and vice-captain are required by competition rules.' : 'Competition rules are applied to this XI.'}
          </span>
          <div className="ml-auto flex items-center gap-2">
            {onSaveDraft && (
              <button
                type="button"
                onClick={onSaveDraft}
                disabled={!canSave}
                className="min-h-10 rounded-lg border border-[#343943] px-4 text-xs font-medium text-[#D2D5DB] transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save draft
              </button>
            )}
            {onSaveCompleted && (
              <button
                type="button"
                onClick={onSaveCompleted}
                disabled={!canSave || !isReady}
                className="min-h-10 rounded-lg bg-[#B7BBC4] px-4 text-xs font-semibold text-[#111318] transition hover:bg-[#D5D8DE] disabled:cursor-not-allowed disabled:bg-[#3B4049] disabled:text-[#858B96]"
              >
                Publish XI
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
