/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ScreenId, UserProfile, Achievement } from '../types/trivia.ts';
import { CATEGORIES, INITIAL_ACHIEVEMENTS } from '../data/seedQuestions.ts';
import { MetricCard } from '../components/common/MetricCard.tsx';
import { Trophy, Flame, Target, Award, Play, UserCheck, Shield } from 'lucide-react';
import { soundManager } from '../utils/audio.ts';

interface StatisticsScreenProps {
  userProfile: UserProfile;
  onNavigate: (screen: ScreenId) => void;
  onStartQuickGame: () => void;
}

export const StatisticsScreen: React.FC<StatisticsScreenProps> = ({
  userProfile,
  onNavigate,
  onStartQuickGame,
}) => {
  const winRate = userProfile.totalGamesPlayed > 0
    ? Math.round((userProfile.gamesWon / userProfile.totalGamesPlayed) * 100)
    : 0;

  const overallAccuracy = userProfile.totalAnswers > 0
    ? Math.round((userProfile.totalCorrectAnswers / userProfile.totalAnswers) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Personal Statistics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Deterministic player telemetry, domain proficiencies, and career milestones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {userProfile.isGuest ? (
            <button
              onClick={() => {
                soundManager.playClick();
                onNavigate('auth');
              }}
              className="px-4 py-2 text-xs font-semibold text-violet-300 bg-violet-950/60 hover:bg-violet-900/60 border border-violet-700/60 rounded-lg transition-colors"
            >
              Guest Session · Sign In to Sync
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs font-medium">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Synced Account: {userProfile.username}</span>
            </div>
          )}

          <button
            onClick={() => {
              soundManager.playClick();
              onStartQuickGame();
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors shadow-md shadow-violet-950/40"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Play Match</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="High Score"
          value={userProfile.highScore.toLocaleString()}
          subtext="Authoritative Peak"
          trend="positive"
          icon={<Trophy className="w-4 h-4 text-amber-400" />}
        />
        <MetricCard
          label="Overall Accuracy"
          value={`${overallAccuracy}%`}
          subtext={`${userProfile.totalCorrectAnswers}/${userProfile.totalAnswers} answered`}
          trend="neutral"
          icon={<Target className="w-4 h-4 text-emerald-400" />}
        />
        <MetricCard
          label="Best Streak"
          value={userProfile.bestStreak}
          subtext="Consecutive correct"
          trend="positive"
          icon={<Flame className="w-4 h-4 text-amber-400" />}
        />
        <MetricCard
          label="Matches Won"
          value={`${userProfile.gamesWon} / ${userProfile.totalGamesPlayed}`}
          subtext={`${winRate}% Win Rate`}
          trend="neutral"
          icon={<Shield className="w-4 h-4 text-violet-400" />}
        />
      </div>

      {/* Category Performance Breakdown */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-5">
        <div>
          <h2 className="text-base font-bold text-white">Knowledge Domain Breakdown</h2>
          <p className="text-xs text-slate-400 mt-0.5">Authoritative accuracy categorized across curricula</p>
        </div>

        <div className="space-y-4">
          {CATEGORIES.map((cat) => {
            const data = userProfile.categoryAccuracy[cat.id] || { correct: 0, total: 0 };
            const percent = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;

            return (
              <div key={cat.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{cat.name}</span>
                  <div className="flex items-center gap-2 font-mono tabular-nums">
                    <span className="text-slate-400">{data.correct}/{data.total} correct</span>
                    <span className="font-bold text-white">{percent}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-violet-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Difficulty Calibration Distribution */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-white">Difficulty Tier Distribution</h2>
          <p className="text-xs text-slate-400 mt-0.5">Performance scaled by question complexity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['easy', 'medium', 'hard'] as const).map((diff) => {
            const data = userProfile.difficultyAccuracy[diff] || { correct: 0, total: 0 };
            const percent = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
            return (
              <div key={diff} className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 capitalize">
                    {diff}
                  </span>
                  <span className="font-mono text-sm font-bold text-white tabular-nums">{percent}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      diff === 'easy' ? 'bg-emerald-500' : diff === 'medium' ? 'bg-sky-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                  {data.correct} correct of {data.total} attempted
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Career Achievements Showcase */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-violet-400" />
            Curated Career Achievements
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Authoritative milestone unlocks and progression trackers</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INITIAL_ACHIEVEMENTS.map((ach) => {
            const isUnlocked = ach.progress >= 100;
            return (
              <div
                key={ach.id}
                className={`rounded-xl border p-4 transition-all ${
                  isUnlocked
                    ? 'border-violet-700/60 bg-violet-950/20'
                    : 'border-slate-800/80 bg-slate-900/40 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-white">{ach.title}</h4>
                  {isUnlocked ? (
                    <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                      Unlocked
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">
                      {ach.progress}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{ach.description}</p>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full ${isUnlocked ? 'bg-violet-500' : 'bg-slate-600'}`}
                    style={{ width: `${ach.progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
