/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameState, ScreenId } from '../types/trivia.ts';
import { GameHUD } from '../components/game/GameHUD.tsx';
import { AnswerButton } from '../components/game/AnswerButton.tsx';
import { FeedbackCard } from '../components/game/FeedbackCard.tsx';
import { CATEGORIES } from '../data/seedQuestions.ts';

interface AnswerFeedbackScreenProps {
  gameState: GameState;
  onContinue: () => void;
  onNavigate: (screen: ScreenId) => void;
}

export const AnswerFeedbackScreen: React.FC<AnswerFeedbackScreenProps> = ({
  gameState,
  onContinue,
  onNavigate,
}) => {
  const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
  const lastResult = gameState.lastAnswerResult;

  if (!currentQuestion || !lastResult) {
    return (
      <div className="p-12 text-center text-slate-400">
        <p>No feedback state available.</p>
        <button
          onClick={() => onNavigate('home')}
          className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm"
        >
          Return Home
        </button>
      </div>
    );
  }

  const category = CATEGORIES.find((c) => c.id === currentQuestion.categoryId);
  const categoryName = category ? category.name : 'General Knowledge';
  const optionKeys = ['A', 'B', 'C', 'D'];

  const isFinalQuestion = gameState.currentQuestionIndex >= gameState.questions.length - 1;
  const isGameOver = gameState.livesRemaining <= 0;

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
        lastDifficultyChanged={lastResult.difficultyChanged}
      />

      <div className="flex-1 mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 space-y-6">
        {/* Question Prompt */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
          <div className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase mb-2">
            Question #{gameState.currentQuestionIndex + 1} Review
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
            {currentQuestion.prompt}
          </h2>
        </div>

        {/* 4 Answer Options showing Correct vs Selected States */}
        <div className="grid grid-cols-1 gap-3">
          {currentQuestion.options.map((option, idx) => {
            const isCorrect = idx === currentQuestion.correctOptionIndex;
            const isSelected = idx === gameState.selectedOptionIndex;

            return (
              <AnswerButton
                key={option.id}
                index={idx}
                labelKey={optionKeys[idx]}
                text={option.text}
                isSelected={isSelected}
                isCorrect={isCorrect}
                showFeedback={true}
                disabled={true}
                onClick={() => {}}
              />
            );
          })}
        </div>

        {/* Detailed Feedback & Editorial Card */}
        <FeedbackCard
          isCorrect={lastResult.isCorrect}
          pointsAwarded={lastResult.pointsAwarded}
          streakBonusAwarded={lastResult.streakBonusAwarded}
          livesLost={lastResult.livesLost}
          explanation={currentQuestion.explanation}
          source={currentQuestion.source}
          difficultyChanged={lastResult.difficultyChanged}
          isFinalQuestion={isFinalQuestion}
          isGameOver={isGameOver}
          onContinue={onContinue}
        />
      </div>
    </div>
  );
};
