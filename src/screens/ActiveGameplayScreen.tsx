/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { GameState, ScreenId } from '../types/trivia.ts';
import { GameHUD } from '../components/game/GameHUD.tsx';
import { AnswerButton } from '../components/game/AnswerButton.tsx';
import { CATEGORIES } from '../data/seedQuestions.ts';
import { soundManager } from '../utils/audio.ts';
import { Keyboard, ArrowLeft } from 'lucide-react';

interface ActiveGameplayScreenProps {
  gameState: GameState;
  onSelectAnswer: (optionIndex: number) => void;
  onAbandonGame: () => void;
  onNavigate: (screen: ScreenId) => void;
}

export const ActiveGameplayScreen: React.FC<ActiveGameplayScreenProps> = ({
  gameState,
  onSelectAnswer,
  onAbandonGame,
  onNavigate,
}) => {
  const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // Category name
  const category = CATEGORIES.find((c) => c.id === currentQuestion?.categoryId);
  const categoryName = category ? category.name : 'General Knowledge';

  // Keyboard shortcut listener (1-4 or A-D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.status !== 'in_progress') return;

      const key = e.key.toUpperCase();
      let index = -1;

      if (key === '1' || key === 'A') index = 0;
      else if (key === '2' || key === 'B') index = 1;
      else if (key === '3' || key === 'C') index = 2;
      else if (key === '4' || key === 'D') index = 3;

      if (index >= 0 && index < (currentQuestion?.options.length || 0)) {
        e.preventDefault();
        soundManager.playSelect();
        setSelectedIdx(index);
        onSelectAnswer(index);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.status, currentQuestion, onSelectAnswer]);

  if (!currentQuestion) {
    return (
      <div className="p-12 text-center text-slate-400">
        <p>No question loaded.</p>
        <button
          onClick={() => onNavigate('home')}
          className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm"
        >
          Return Home
        </button>
      </div>
    );
  }

  const optionKeys = ['A', 'B', 'C', 'D'];

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Game HUD */}
      <GameHUD
        currentQuestionIndex={gameState.currentQuestionIndex}
        totalQuestions={gameState.questions.length}
        categoryName={categoryName}
        difficulty={gameState.currentDifficulty}
        livesRemaining={gameState.livesRemaining}
        maxLives={gameState.maxLives}
        currentStreak={gameState.currentStreak}
        consecutiveCorrect={gameState.consecutiveCorrect}
        consecutiveIncorrect={gameState.consecutiveIncorrect}
        totalScore={gameState.scoreBreakdown.totalScore}
        lastDifficultyChanged={gameState.lastAnswerResult?.difficultyChanged}
      />

      {/* Main Gameplay Playfield */}
      <div className="flex-1 mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 flex flex-col justify-center space-y-8">
        {/* Abandon link / breadcrumb */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <button
            onClick={onAbandonGame}
            className="flex items-center gap-1 hover:text-rose-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Abandon Match</span>
          </button>
          <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <Keyboard className="w-3.5 h-3.5" />
            <span>Press keys 1–4 or A–D to submit</span>
          </div>
        </div>

        {/* Question Prompt Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 shadow-xl">
          <div className="text-xs font-mono font-semibold tracking-wider text-violet-400 uppercase mb-3">
            Prompt #{gameState.currentQuestionIndex + 1}
          </div>
          <h2
            className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug"
            style={{ textWrap: 'balance' }}
          >
            {currentQuestion.prompt}
          </h2>
        </div>

        {/* 4 Interactive Answer Area Buttons */}
        <div className="grid grid-cols-1 gap-3.5">
          {currentQuestion.options.map((option, idx) => (
            <AnswerButton
              key={option.id}
              index={idx}
              labelKey={optionKeys[idx]}
              text={option.text}
              isSelected={selectedIdx === idx}
              disabled={gameState.status !== 'in_progress'}
              onClick={() => {
                soundManager.playSelect();
                setSelectedIdx(idx);
                onSelectAnswer(idx);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
