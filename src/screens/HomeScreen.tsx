/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ScreenId, CategoryId, UserProfile } from '../types/trivia.ts';
import { CATEGORIES } from '../data/seedQuestions.ts';
import { Play, Sparkles, Flame, Shield, ArrowRight, Zap, Target, BookOpen, Atom, Landmark, Globe, Cpu } from 'lucide-react';
import { soundManager } from '../utils/audio.ts';

interface HomeScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onStartQuickGame: (categoryId: CategoryId | 'all') => void;
  userProfile: UserProfile;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  onStartQuickGame,
  userProfile,
}) => {
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'science': return <Atom className="w-5 h-5 text-cyan-400" />;
      case 'history': return <Landmark className="w-5 h-5 text-amber-400" />;
      case 'geography': return <Globe className="w-5 h-5 text-emerald-400" />;
      case 'technology': return <Cpu className="w-5 h-5 text-blue-400" />;
      default: return <BookOpen className="w-5 h-5 text-violet-400" />;
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 space-y-14">
      {/* Hero Section */}
      <div className="text-center space-y-6 pt-4">
        {/* Subtle kicker */}
        <div className="inline-flex items-center gap-2 text-xs font-mono tracking-wider text-violet-400 uppercase">
          <span>Deterministic Game Engine</span>
          <span aria-hidden="true">·</span>
          <span>Adaptive Difficulty</span>
          <span aria-hidden="true">·</span>
          <span>Curated Questions</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto" style={{ textWrap: 'balance' }}>
          Pure Minimalist Trivia for the Rigorous Mind
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Ten curated questions per match. Real-time difficulty calibration. Three lives, streak multipliers, and authoritative score validation.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
          <button
            onClick={() => {
              soundManager.playClick();
              onStartQuickGame('all');
            }}
            className="flex items-center gap-2.5 px-7 py-3.5 text-base font-bold text-white bg-violet-600 hover:bg-violet-500 active:bg-violet-700 rounded-xl transition-all shadow-lg shadow-violet-950/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 hover:scale-[1.02] active:scale-[0.99]"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Start Game Immediately</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onNavigate('category_selection');
            }}
            className="flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <span>Choose Category</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Guest info banner */}
        <div className="text-xs text-slate-400 flex items-center justify-center gap-2 pt-1">
          {userProfile.isGuest ? (
            <>
              <span>Playing as Guest. No account needed to play.</span>
              <span aria-hidden="true">·</span>
              <button
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('auth');
                }}
                className="text-violet-400 hover:underline font-medium"
              >
                Register to preserve statistics
              </button>
            </>
          ) : (
            <>
              <span className="text-emerald-400">Signed in as {userProfile.username}</span>
              <span aria-hidden="true">·</span>
              <span>High score: <strong className="text-white font-mono tabular-nums">{userProfile.highScore}</strong></span>
            </>
          )}
        </div>
      </div>

      {/* Engine Architecture Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-violet-950/70 border border-violet-800/60 flex items-center justify-center text-violet-400">
            <Zap className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Adaptive Difficulty</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Every match begins at Medium. Three consecutive correct answers escalate questions to Hard; two consecutive mistakes lower difficulty.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950/70 border border-amber-800/60 flex items-center justify-center text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Streak Bonus Multipliers</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Earn 100 base points per correct answer, with escalating bonus tiers at streaks of 3, 5, and 7 consecutive correct responses.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-950/70 border border-rose-800/60 flex items-center justify-center text-rose-400">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Authoritative Scoring</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Three lives per match. Complete the full 10-question sequence to claim the 200-point victory bonus plus 50 points per remaining life.
          </p>
        </div>
      </div>

      {/* Curated Categories Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Curated Categories</h2>
            <p className="text-xs text-slate-400 mt-0.5">Editorially validated across five knowledge domains</p>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onNavigate('category_selection');
            }}
            className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                soundManager.playSelect();
                onStartQuickGame(cat.id);
              }}
              className="group cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition-all hover:border-violet-500/70 hover:bg-slate-850"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                  {getCategoryIcon(cat.id)}
                </div>
                <span className="text-xs font-mono text-slate-400 tabular-nums">
                  {cat.questionCount} Questions
                </span>
              </div>
              <h3 className="mt-3.5 text-base font-bold text-white group-hover:text-violet-300 transition-colors">
                {cat.name}
              </h3>
              <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                {cat.description}
              </p>
              <div className="mt-3 flex items-center text-xs font-semibold text-violet-400 group-hover:translate-x-0.5 transition-transform">
                <span>Play Category</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
