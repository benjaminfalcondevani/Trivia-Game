/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScreenId, CategoryId, UserProfile } from '../types/trivia.ts';
import { CATEGORIES } from '../data/seedQuestions.ts';
import { Layers, Atom, Landmark, Globe, Cpu, BookOpen, ArrowRight, Play, CheckCircle } from 'lucide-react';
import { soundManager } from '../utils/audio.ts';

interface CategorySelectionScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onSelectCategoryAndConfigure: (categoryId: CategoryId | 'all') => void;
  userProfile: UserProfile;
}

export const CategorySelectionScreen: React.FC<CategorySelectionScreenProps> = ({
  onNavigate,
  onSelectCategoryAndConfigure,
  userProfile,
}) => {
  const [selectedId, setSelectedId] = useState<CategoryId | 'all'>('all');

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'science': return <Atom className="w-6 h-6 text-cyan-400" />;
      case 'history': return <Landmark className="w-6 h-6 text-amber-400" />;
      case 'geography': return <Globe className="w-6 h-6 text-emerald-400" />;
      case 'technology': return <Cpu className="w-6 h-6 text-blue-400" />;
      default: return <BookOpen className="w-6 h-6 text-violet-400" />;
    }
  };

  const totalQuestionsAll = CATEGORIES.reduce((acc, c) => acc + c.questionCount, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Category Selection
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Choose an individual subject domain or play with all five categories mixed.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            soundManager.playClick();
            onSelectCategoryAndConfigure(selectedId);
          }}
          className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-all shadow-lg shadow-violet-950/60 shrink-0"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Configure Game ({selectedId === 'all' ? 'All Domains' : CATEGORIES.find(c => c.id === selectedId)?.name})</span>
        </button>
      </div>

      {/* Primary Mixed Categories Card */}
      <div
        onClick={() => {
          soundManager.playSelect();
          setSelectedId('all');
        }}
        className={`cursor-pointer rounded-2xl border p-6 transition-all ${
          selectedId === 'all'
            ? 'border-violet-500 bg-violet-950/40 ring-1 ring-violet-500 shadow-xl'
            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-850'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-900/40 border border-violet-700/60 text-violet-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">All Categories (Standard Tournament Mix)</h3>
                <span className="text-[10px] font-mono uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Dynamic questions drawn indiscriminately across Science, History, Geography, Tech, and General Knowledge.
              </p>
            </div>
          </div>
          {selectedId === 'all' && (
            <CheckCircle className="w-6 h-6 text-violet-400 shrink-0 hidden sm:block" />
          )}
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-slate-400 pt-3 border-t border-slate-800/80">
          <span>{totalQuestionsAll} Curated Questions</span>
          <span aria-hidden="true">·</span>
          <span>Adaptive Progression: Easy → Medium → Hard</span>
          <span aria-hidden="true">·</span>
          <span>10 Questions / Match</span>
        </div>
      </div>

      {/* 5 Individual Domain Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Or Focus On Specific Domain
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedId === cat.id;
            const accuracyStats = userProfile.categoryAccuracy[cat.id];
            const accuracyPercent = accuracyStats && accuracyStats.total > 0
              ? Math.round((accuracyStats.correct / accuracyStats.total) * 100)
              : null;

            return (
              <div
                key={cat.id}
                onClick={() => {
                  soundManager.playSelect();
                  setSelectedId(cat.id);
                }}
                className={`cursor-pointer rounded-xl border p-5 transition-all ${
                  isSelected
                    ? 'border-violet-500 bg-violet-950/40 ring-1 ring-violet-500'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 border border-slate-700/60">
                      {getCategoryIcon(cat.id)}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">{cat.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{cat.description}</p>
                    </div>
                  </div>
                  {isSelected && <CheckCircle className="w-5 h-5 text-violet-400 shrink-0" />}
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/60">
                  <span className="font-mono tabular-nums">{cat.questionCount} Curated Questions</span>
                  {accuracyPercent !== null ? (
                    <span className="text-emerald-400 font-mono font-medium">
                      {accuracyPercent}% Accuracy ({accuracyStats.correct}/{accuracyStats.total})
                    </span>
                  ) : (
                    <span className="text-slate-500">Unplayed</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
