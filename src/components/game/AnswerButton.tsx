/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Check, X } from 'lucide-react';

interface AnswerButtonProps {
  index: number;
  labelKey: string; // "A", "B", "C", "D"
  text: string;
  isSelected: boolean;
  isCorrect?: boolean;
  showFeedback?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export const AnswerButton: React.FC<AnswerButtonProps> = ({
  labelKey,
  text,
  isSelected,
  isCorrect,
  showFeedback,
  disabled,
  onClick,
}) => {
  // Determine color states
  let containerStyle = 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-violet-500/80 hover:bg-slate-850';
  let badgeStyle = 'bg-slate-800 text-slate-400 border-slate-700';
  let icon = null;

  if (showFeedback) {
    if (isCorrect) {
      containerStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-100 shadow-md shadow-emerald-950/40';
      badgeStyle = 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold';
      icon = <Check className="w-5 h-5 text-emerald-400 shrink-0 ml-auto" />;
    } else if (isSelected && !isCorrect) {
      containerStyle = 'bg-rose-950/80 border-rose-500 text-rose-100 shadow-md shadow-rose-950/40';
      badgeStyle = 'bg-rose-500 text-slate-950 border-rose-400 font-bold';
      icon = <X className="w-5 h-5 text-rose-400 shrink-0 ml-auto" />;
    } else {
      containerStyle = 'bg-slate-900/40 border-slate-800/60 text-slate-500 opacity-60';
      badgeStyle = 'bg-slate-800/60 text-slate-600 border-slate-800';
    }
  } else if (isSelected) {
    containerStyle = 'bg-violet-950/80 border-violet-500 text-white shadow-md shadow-violet-950/40 ring-1 ring-violet-500';
    badgeStyle = 'bg-violet-600 text-white border-violet-500 font-bold';
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative flex w-full items-center gap-4 rounded-xl border p-4 sm:p-5 text-left transition-all duration-150 min-h-[64px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 disabled:cursor-not-allowed ${containerStyle}`}
    >
      {/* Option Key Tag (A, B, C, D) */}
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-semibold transition-colors ${badgeStyle}`}
      >
        {labelKey}
      </span>

      {/* Answer text */}
      <span className="text-base sm:text-lg font-medium leading-snug tracking-normal flex-1">
        {text}
      </span>

      {/* State icon (checkmark or cross) */}
      {icon}
    </button>
  );
};
