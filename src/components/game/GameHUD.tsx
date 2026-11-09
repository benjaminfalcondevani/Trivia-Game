/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DifficultyLevel } from '../../types/trivia.ts';
import { Heart, Flame, ShieldAlert, Sparkles } from 'lucide-react';
import { GAME_CONSTANTS } from '../../engine/gameEngine.ts';

interface GameHUDProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  categoryName: string;
  difficulty: DifficultyLevel;
  livesRemaining: number;
  maxLives: number;
  currentStreak: number;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  totalScore: number;
  lastDifficultyChanged?: 'up' | 'down' | 'none';
}

export const GameHUD: React.FC<GameHUDProps> = ({
  currentQuestionIndex,
  totalQuestions,
  categoryName,
  difficulty,
  livesRemaining,
  maxLives,
  currentStreak,
  consecutiveCorrect,
  totalScore,
  lastDifficultyChanged,
}) => {
  // Difficulty styling
  const difficultyDisplay = {
    easy: { label: 'Easy', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60' },
    medium: { label: 'Medium', color: 'text-sky-400 bg-sky-950/60 border-sky-800/60' },
    hard: { label: 'Hard', color: 'text-amber-400 bg-amber-950/60 border-amber-800/60' },
  }[difficulty];

  // Progress percentage
  const progressPercent = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

  return (
    <div className="w-full bg-slate-900/80 border-b border-slate-800/90 py-3.5 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl flex flex-col gap-3">
        {/* Top row: Category, Adaptive Difficulty, and Score */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Category & Question Index */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-medium text-slate-200">{categoryName}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>
              Question <span className="font-mono text-slate-200 font-semibold">{currentQuestionIndex + 1}</span> of {totalQuestions}
            </span>
          </div>

          {/* Center: Adaptive Difficulty Status Indicator */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-xs font-semibold ${difficultyDisplay.color}`}>
              {lastDifficultyChanged === 'up' && <span className="text-emerald-400 text-[10px]">↑</span>}
              {lastDifficultyChanged === 'down' && <span className="text-rose-400 text-[10px]">↓</span>}
              {difficultyDisplay.label}
            </span>
            {difficulty !== 'hard' && consecutiveCorrect > 0 && (
              <span className="hidden sm:inline-block text-[11px] text-slate-400">
                ({consecutiveCorrect}/{GAME_CONSTANTS.ADAPTIVE_RULES.CONSECUTIVE_CORRECT_TO_INCREASE} for next tier)
              </span>
            )}
          </div>

          {/* Right: Authoritative Score Counter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium hidden sm:inline">
              Authoritative Score
            </span>
            <span className="font-mono text-xl font-extrabold text-white tabular-nums tracking-tight">
              {totalScore.toLocaleString()}
            </span>
            <span className="text-xs text-violet-400 font-mono font-medium">pts</span>
          </div>
        </div>

        {/* Bottom row: Lives, Streak Meter, and Question Progress Bar */}
        <div className="flex items-center justify-between gap-4 pt-1">
          {/* Lives Indicator */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium sr-only sm:not-sr-only">Lives:</span>
            <div className="flex items-center gap-1" aria-label={`${livesRemaining} of ${maxLives} lives remaining`}>
              {Array.from({ length: maxLives }).map((_, i) => {
                const isActive = i < livesRemaining;
                return (
                  <Heart
                    key={i}
                    className={`w-4 h-4 transition-all ${
                      isActive
                        ? 'fill-rose-500 text-rose-500 scale-100'
                        : 'fill-transparent text-slate-700 scale-90 opacity-40'
                    }`}
                  />
                );
              })}
            </div>
            {livesRemaining === 1 && (
              <span className="flex items-center gap-1 text-[11px] text-rose-400 font-medium animate-pulse ml-1">
                <ShieldAlert className="w-3 h-3" /> Last life
              </span>
            )}
          </div>

          {/* Streak Indicator & Threshold Badges */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Flame
                className={`w-4 h-4 ${
                  currentStreak >= 3 ? 'text-amber-400 fill-amber-400 animate-bounce' : 'text-slate-600'
                }`}
              />
              <span className="text-xs font-medium text-slate-300">
                Streak: <span className="font-mono font-bold text-amber-300 tabular-nums">{currentStreak}</span>
              </span>
            </div>

            {/* Streak Tier Badges */}
            <div className="hidden sm:flex items-center gap-1">
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  currentStreak >= 3
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                    : 'bg-slate-800 text-slate-600 border border-slate-800'
                }`}
              >
                3x (+50)
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  currentStreak >= 5
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                    : 'bg-slate-800 text-slate-600 border border-slate-800'
                }`}
              >
                5x (+100)
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  currentStreak >= 7
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 font-semibold'
                    : 'bg-slate-800 text-slate-600 border border-slate-800'
                }`}
              >
                7x (+150)
              </span>
            </div>
          </div>
        </div>

        {/* Thin progress bar line */}
        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
          <div
            className="bg-violet-500 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
