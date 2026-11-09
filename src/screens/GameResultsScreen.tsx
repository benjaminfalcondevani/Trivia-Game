/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameState, ScreenId, UserProfile } from '../types/trivia.ts';
import { Trophy, RotateCcw, UserPlus, BarChart3, Check, X, ChevronDown, ChevronUp, Shield, Flame, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio.ts';

interface GameResultsScreenProps {
  gameState: GameState;
  userProfile: UserProfile;
  onPlayAgain: () => void;
  onNavigate: (screen: ScreenId) => void;
}

export const GameResultsScreen: React.FC<GameResultsScreenProps> = ({
  gameState,
  userProfile,
  onPlayAgain,
  onNavigate,
}) => {
  const [showQuestionLog, setShowQuestionLog] = useState(false);

  const isCompleted = gameState.status === 'completed';
  const totalAnswers = gameState.answersHistory.length;
  const correctCount = gameState.answersHistory.filter((a) => a.isCorrect).length;
  const accuracyPercent = totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 0;

  const { basePoints, streakBonuses, completionBonus, remainingLivesBonus, totalScore } =
    gameState.scoreBreakdown;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Result Hero Header */}
      <div className="text-center space-y-3 pt-2">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-950/70 border border-violet-700/60 text-violet-400 shadow-xl">
          {isCompleted ? <Trophy className="w-8 h-8 text-amber-400" /> : <Shield className="w-8 h-8 text-rose-400" />}
        </div>

        <div className="text-xs font-mono tracking-widest text-violet-400 uppercase">
          Match Concluded
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          {isCompleted ? 'Tournament Cleared!' : 'All Lives Exhausted'}
        </h1>

        <p className="text-sm text-slate-300 max-w-md mx-auto">
          {isCompleted
            ? 'You successfully navigated all 10 adaptive questions and earned completion bonus dividends.'
            : 'You reached question ' + (gameState.currentQuestionIndex + 1) + ' before lives depleted. Try again to push deeper.'}
        </p>
      </div>

      {/* Authoritative Score Breakdown Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-7 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Authoritative Server Calculation
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-slate-400">Final Authoritative Score:</span>
            <span className="font-mono text-3xl sm:text-4xl font-extrabold text-white tabular-nums tracking-tight">
              {totalScore.toLocaleString()}
            </span>
            <span className="text-sm font-mono text-violet-400">pts</span>
          </div>
        </div>

        {/* Detailed ledger lines */}
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              Base Points ({correctCount} correct × 100 pts)
            </span>
            <span className="font-mono font-medium text-white tabular-nums">+{basePoints}</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Streak Bonuses (Milestones 3x, 5x, 7x)
            </span>
            <span className="font-mono font-medium text-amber-300 tabular-nums">+{streakBonuses}</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-violet-400" />
              Game Completion Bonus
            </span>
            <span className="font-mono font-medium text-white tabular-nums">
              {completionBonus > 0 ? `+${completionBonus}` : '0'}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-400" />
              Remaining Lives Bonus ({gameState.livesRemaining} lives × 50 pts)
            </span>
            <span className="font-mono font-medium text-white tabular-nums">
              {remainingLivesBonus > 0 ? `+${remainingLivesBonus}` : '0'}
            </span>
          </div>
        </div>

        {/* Metric summary strip */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-center">
          <div className="rounded-xl bg-slate-800/40 p-3">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Accuracy</span>
            <span className="font-mono text-lg font-bold text-white tabular-nums">{accuracyPercent}%</span>
          </div>
          <div className="rounded-xl bg-slate-800/40 p-3">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Best Streak</span>
            <span className="font-mono text-lg font-bold text-amber-300 tabular-nums">{gameState.bestStreak}</span>
          </div>
          <div className="rounded-xl bg-slate-800/40 p-3">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Final Tier</span>
            <span className="font-mono text-lg font-bold capitalize text-sky-300">{gameState.currentDifficulty}</span>
          </div>
        </div>
      </div>

      {/* Guest registration prompt if guest */}
      {userProfile.isGuest && (
        <div className="rounded-xl border border-violet-800/50 bg-violet-950/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-violet-400" />
              Preserve This Match To Your Profile
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Create an account now to record this high score and unlock permanent achievement progress.
            </p>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onNavigate('auth');
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Register / Sign In
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => {
            soundManager.playClick();
            onPlayAgain();
          }}
          className="flex items-center gap-2 px-6 py-3.5 text-base font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-all shadow-lg shadow-violet-950/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Play Again</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            onNavigate('statistics');
          }}
          className="flex items-center gap-2 px-5 py-3.5 text-base font-semibold text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors"
        >
          <BarChart3 className="w-5 h-5 text-slate-400" />
          <span>View Statistics</span>
        </button>
      </div>

      {/* Question by Question Review Accordion */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
        <button
          onClick={() => setShowQuestionLog(!showQuestionLog)}
          className="w-full flex items-center justify-between text-left text-sm font-bold text-slate-300 hover:text-white"
        >
          <span>Question-by-Question Audit Log ({gameState.answersHistory.length} recorded)</span>
          {showQuestionLog ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showQuestionLog && (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            {gameState.answersHistory.map((rec, i) => (
              <div
                key={rec.questionId + i}
                className={`p-3.5 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                  rec.isCorrect
                    ? 'border-emerald-900/60 bg-emerald-950/20 text-emerald-200'
                    : 'border-rose-900/60 bg-rose-950/20 text-rose-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">Q{i + 1}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize text-slate-400">{rec.categoryId} ({rec.difficulty})</span>
                  </div>
                  <p className="text-white font-medium">{rec.questionPrompt}</p>
                </div>
                <div className="text-right shrink-0">
                  {rec.isCorrect ? (
                    <span className="font-mono text-emerald-400 font-bold">+{rec.basePoints + rec.streakBonus} pts</span>
                  ) : (
                    <span className="font-mono text-rose-400 font-bold">-1 Life</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
