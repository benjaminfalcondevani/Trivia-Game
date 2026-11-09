/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, XCircle, ArrowRight, BookOpen, Flame, HeartCrack } from 'lucide-react';
import { soundManager } from '../../utils/audio.ts';

interface FeedbackCardProps {
  isCorrect: boolean;
  pointsAwarded: number;
  streakBonusAwarded: number;
  livesLost: number;
  explanation: string;
  source: string;
  difficultyChanged: 'up' | 'down' | 'none';
  isFinalQuestion: boolean;
  isGameOver: boolean;
  onContinue: () => void;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  isCorrect,
  pointsAwarded,
  streakBonusAwarded,
  livesLost,
  explanation,
  source,
  difficultyChanged,
  isFinalQuestion,
  isGameOver,
  onContinue,
}) => {
  return (
    <div
      className={`rounded-2xl border p-6 sm:p-7 shadow-xl transition-all ${
        isCorrect
          ? 'border-emerald-700/60 bg-emerald-950/40 text-emerald-100'
          : 'border-rose-700/60 bg-rose-950/40 text-rose-100'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          {isCorrect ? (
            <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-7 h-7 text-rose-400 shrink-0" />
          )}
          <div>
            <h4 className="text-xl font-bold tracking-tight text-white">
              {isCorrect ? 'Correct Answer' : 'Incorrect Answer'}
            </h4>
            <div className="flex items-center gap-2 text-xs mt-0.5">
              {isCorrect ? (
                <>
                  <span className="font-mono text-emerald-300 font-semibold">+{pointsAwarded} pts</span>
                  {streakBonusAwarded > 0 && (
                    <>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="flex items-center gap-1 font-mono text-amber-300 font-semibold">
                        <Flame className="w-3.5 h-3.5" /> +{streakBonusAwarded} Streak Bonus
                      </span>
                    </>
                  )}
                </>
              ) : (
                <span className="flex items-center gap-1 font-mono text-rose-400 font-medium">
                  <HeartCrack className="w-3.5 h-3.5" /> -{livesLost} Life
                </span>
              )}

              {difficultyChanged === 'up' && (
                <>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-sky-300 font-medium">↑ Difficulty Increased</span>
                </>
              )}
              {difficultyChanged === 'down' && (
                <>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-amber-300 font-medium">↓ Difficulty Decreased</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Primary Continue Button */}
        <button
          onClick={() => {
            soundManager.playClick();
            onContinue();
          }}
          className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 active:bg-violet-700 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 shrink-0 shadow-lg shadow-violet-950/50"
        >
          <span>{isGameOver ? 'View Final Results' : isFinalQuestion ? 'Finish Game' : 'Next Question'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Editorial Explanation & Source */}
      <div className="mt-5 space-y-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Editorial Note
          </span>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            {explanation}
          </p>
        </div>

        {source && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
            <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="text-slate-500">Source:</span>
            <span className="italic text-slate-300">{source}</span>
          </div>
        )}
      </div>
    </div>
  );
};
