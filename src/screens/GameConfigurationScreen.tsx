/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScreenId, CategoryId, DifficultyLevel } from '../types/trivia.ts';
import { CATEGORIES } from '../data/seedQuestions.ts';
import { Play, Shield, Flame, Zap, ArrowLeft, Info, HelpCircle } from 'lucide-react';
import { soundManager } from '../utils/audio.ts';

interface GameConfigurationScreenProps {
  initialCategoryId: CategoryId | 'all';
  onNavigate: (screen: ScreenId) => void;
  onLaunchGame: (categoryId: CategoryId | 'all', startingDifficulty: DifficultyLevel) => void;
}

export const GameConfigurationScreen: React.FC<GameConfigurationScreenProps> = ({
  initialCategoryId,
  onNavigate,
  onLaunchGame,
}) => {
  const [categoryId, setCategoryId] = useState<CategoryId | 'all'>(initialCategoryId);
  const [startingDifficulty, setStartingDifficulty] = useState<DifficultyLevel>('medium');

  const selectedCategory = categoryId === 'all'
    ? { name: 'All Categories (Mixed)', description: 'Indiscriminate mix across all domains' }
    : CATEGORIES.find(c => c.id === categoryId) || { name: 'Custom Domain', description: '' };

  const difficulties: { id: DifficultyLevel; label: string; desc: string; badge: string }[] = [
    {
      id: 'easy',
      label: 'Easy',
      desc: 'Introductory domain facts, common scientific constants, and landmark events.',
      badge: 'Forgiving Ramp',
    },
    {
      id: 'medium',
      label: 'Medium (Standard)',
      desc: 'Recommended baseline. Balanced questions testing thorough domain literacy.',
      badge: 'Specification Standard',
    },
    {
      id: 'hard',
      label: 'Hard',
      desc: 'Graduate-level theorems, precise dates, and intricate technical proofs.',
      badge: 'High Precision',
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header with Back button */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <button
          onClick={() => {
            soundManager.playClick();
            onNavigate('category_selection');
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Change Category</span>
        </button>
        <span className="text-xs font-mono text-violet-400 font-medium">Standard Match · 10 Questions</span>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Game Configuration
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Review rules, set your initial difficulty calibration, and launch match.
        </p>
      </div>

      {/* Selected Domain Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 block mb-1">
            Active Domain
          </span>
          <h3 className="text-base font-bold text-white">{selectedCategory.name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{selectedCategory.description}</p>
        </div>
        <button
          onClick={() => {
            soundManager.playClick();
            onNavigate('category_selection');
          }}
          className="text-xs font-semibold text-violet-400 hover:text-violet-300 py-1.5 px-3 rounded-lg border border-slate-700 hover:border-violet-500 bg-slate-800/80 transition-colors"
        >
          Change
        </button>
      </div>

      {/* Initial Difficulty Calibration Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Initial Difficulty Calibration
          </label>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" /> Engine will adapt during play
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {difficulties.map((d) => {
            const isSelected = startingDifficulty === d.id;
            return (
              <button
                key={d.id}
                onClick={() => {
                  soundManager.playSelect();
                  setStartingDifficulty(d.id);
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-violet-500 bg-violet-950/40 ring-1 ring-violet-500'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-base">{d.label}</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {d.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rules and Scoring Engine Architecture */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-violet-400" />
          Deterministic Rules & Authoritative Scoring
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-md bg-rose-950/70 border border-rose-800/60 flex items-center justify-center text-rose-400 shrink-0">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div>
              <strong className="text-white block font-semibold">3 Lives Available</strong>
              <span>Each incorrect answer forfeits 1 life. Game ends if all 3 lives expire.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-md bg-violet-950/70 border border-violet-800/60 flex items-center justify-center text-violet-400 shrink-0">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div>
              <strong className="text-white block font-semibold">100 Base Points</strong>
              <span>Awarded per correct answer. Validated authoritatively by the engine.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-md bg-amber-950/70 border border-amber-800/60 flex items-center justify-center text-amber-400 shrink-0">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <div>
              <strong className="text-white block font-semibold">Streak Bonuses</strong>
              <span>Bonus at 3 (+50 pts), 5 (+100 pts), and 7 (+150 pts) consecutive correct answers.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-md bg-emerald-950/70 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
              <Play className="w-3.5 h-3.5" />
            </div>
            <div>
              <strong className="text-white block font-semibold">Victory Completion</strong>
              <span>+200 completion bonus + 50 points per remaining life when all 10 answered.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Launch CTA */}
      <button
        onClick={() => {
          soundManager.playStreak();
          onLaunchGame(categoryId, startingDifficulty);
        }}
        className="w-full flex items-center justify-center gap-3 py-4 text-base font-bold text-white bg-violet-600 hover:bg-violet-500 active:bg-violet-700 rounded-xl transition-all shadow-xl shadow-violet-950/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 hover:scale-[1.01]"
      >
        <Play className="w-5 h-5 fill-current" />
        <span>Launch Game Session</span>
      </button>
    </div>
  );
};
