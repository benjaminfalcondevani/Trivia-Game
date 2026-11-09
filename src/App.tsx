/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ScreenId,
  CategoryId,
  DifficultyLevel,
  GameState,
  Question,
  UserProfile,
} from './types/trivia.ts';
import { INITIAL_QUESTIONS } from './data/seedQuestions.ts';
import {
  createInitialGameState,
  processAnswerSubmission,
  proceedToNextQuestion,
  selectGameQuestions,
} from './engine/gameEngine.ts';
import { Navbar } from './components/common/Navbar.tsx';
import { HomeScreen } from './screens/HomeScreen.tsx';
import { CategorySelectionScreen } from './screens/CategorySelectionScreen.tsx';
import { GameConfigurationScreen } from './screens/GameConfigurationScreen.tsx';
import { ActiveGameplayScreen } from './screens/ActiveGameplayScreen.tsx';
import { AnswerFeedbackScreen } from './screens/AnswerFeedbackScreen.tsx';
import { GameResultsScreen } from './screens/GameResultsScreen.tsx';
import { StatisticsScreen } from './screens/StatisticsScreen.tsx';
import { AuthScreen } from './screens/AuthScreen.tsx';
import { SettingsScreen } from './screens/SettingsScreen.tsx';
import { AdminDashboardScreen } from './screens/AdminDashboardScreen.tsx';
import { soundManager } from './utils/audio.ts';

const INITIAL_GUEST_PROFILE: UserProfile = {
  id: 'guest-session-1',
  isGuest: true,
  username: 'Guest Player',
  avatarSeed: 'scholar',
  createdAt: new Date().toISOString(),
  totalGamesPlayed: 3,
  gamesWon: 2,
  highScore: 1450,
  bestStreak: 6,
  totalCorrectAnswers: 23,
  totalAnswers: 30,
  categoryAccuracy: {
    'general-knowledge': { correct: 5, total: 6 },
    science: { correct: 6, total: 8 },
    history: { correct: 4, total: 6 },
    geography: { correct: 4, total: 5 },
    technology: { correct: 4, total: 5 },
  },
  difficultyAccuracy: {
    easy: { correct: 10, total: 11 },
    medium: { correct: 9, total: 12 },
    hard: { correct: 4, total: 7 },
  },
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_GUEST_PROFILE);
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryId | 'all'>('all');
  const [isMuted, setIsMuted] = useState(soundManager.isMuted());

  // Active game session state
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialGameState('all', 'medium', INITIAL_QUESTIONS)
  );

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
  };

  const handleNavigate = (screen: ScreenId) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Launch a new match
  const handleLaunchGame = (
    catId: CategoryId | 'all' = selectedCategoryId,
    diff: DifficultyLevel = 'medium'
  ) => {
    setSelectedCategoryId(catId);
    const customSubset = selectGameQuestions(questions, catId);
    const newGame = createInitialGameState(catId, diff, customSubset);
    setGameState(newGame);
    setCurrentScreen('active_gameplay');
  };

  // Start quick game directly from home or stats
  const handleStartQuickGame = (catId: CategoryId | 'all' = 'all') => {
    handleLaunchGame(catId, 'medium');
  };

  // Select category and navigate to configuration
  const handleSelectCategoryAndConfigure = (catId: CategoryId | 'all') => {
    setSelectedCategoryId(catId);
    setCurrentScreen('game_configuration');
  };

  // Process player answer in active gameplay
  const handleSelectAnswer = (optionIndex: number) => {
    const updated = processAnswerSubmission(gameState, optionIndex);
    setGameState(updated);

    if (updated.lastAnswerResult?.isCorrect) {
      if (updated.currentStreak >= 3) {
        soundManager.playStreak();
      } else {
        soundManager.playCorrect();
      }
    } else {
      soundManager.playWrong();
    }

    setCurrentScreen('answer_feedback');
  };

  // Update persistent user profile with match results
  const recordMatchResults = (finalState: GameState) => {
    const correctAnswersInMatch = finalState.answersHistory.filter((a) => a.isCorrect).length;
    const totalAnswersInMatch = finalState.answersHistory.length;
    const isWon = finalState.status === 'completed';

    setUserProfile((prev) => {
      const updatedCatAccuracy = { ...prev.categoryAccuracy };
      const updatedDiffAccuracy = { ...prev.difficultyAccuracy };

      finalState.answersHistory.forEach((ans) => {
        if (!updatedCatAccuracy[ans.categoryId]) {
          updatedCatAccuracy[ans.categoryId] = { correct: 0, total: 0 };
        }
        updatedCatAccuracy[ans.categoryId].total += 1;
        if (ans.isCorrect) updatedCatAccuracy[ans.categoryId].correct += 1;

        if (!updatedDiffAccuracy[ans.difficulty]) {
          updatedDiffAccuracy[ans.difficulty] = { correct: 0, total: 0 };
        }
        updatedDiffAccuracy[ans.difficulty].total += 1;
        if (ans.isCorrect) updatedDiffAccuracy[ans.difficulty].correct += 1;
      });

      return {
        ...prev,
        totalGamesPlayed: prev.totalGamesPlayed + 1,
        gamesWon: prev.gamesWon + (isWon ? 1 : 0),
        highScore: Math.max(prev.highScore, finalState.scoreBreakdown.totalScore),
        bestStreak: Math.max(prev.bestStreak, finalState.bestStreak),
        totalCorrectAnswers: prev.totalCorrectAnswers + correctAnswersInMatch,
        totalAnswers: prev.totalAnswers + totalAnswersInMatch,
        categoryAccuracy: updatedCatAccuracy,
        difficultyAccuracy: updatedDiffAccuracy,
      };
    });
  };

  // Proceed from feedback to next question or results
  const handleContinueFromFeedback = () => {
    const nextState = proceedToNextQuestion(gameState);
    setGameState(nextState);

    if (nextState.status === 'completed') {
      soundManager.playStreak();
      recordMatchResults(nextState);
      setCurrentScreen('game_results');
    } else if (nextState.status === 'game_over') {
      soundManager.playGameOver();
      recordMatchResults(nextState);
      setCurrentScreen('game_results');
    } else {
      setCurrentScreen('active_gameplay');
    }
  };

  // Abandon active game
  const handleAbandonGame = () => {
    if (window.confirm('Abandon active trivia match and return home?')) {
      soundManager.playClick();
      setCurrentScreen('home');
    }
  };

  // Play again with current configuration
  const handlePlayAgain = () => {
    handleLaunchGame(gameState.selectedCategoryId, gameState.initialDifficulty);
  };

  // Admin Question Handlers
  const handleAddQuestion = (newQ: Question) => {
    setQuestions((prev) => [newQ, ...prev]);
  };

  const handleUpdateQuestion = (updatedQ: Question) => {
    setQuestions((prev) => prev.map((q) => (q.id === updatedQ.id ? updatedQ : q)));
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleImportQuestions = (imported: Question[]) => {
    setQuestions((prev) => [...imported, ...prev]);
  };

  // Reset local statistics
  const handleResetStats = () => {
    setUserProfile({
      ...INITIAL_GUEST_PROFILE,
      totalGamesPlayed: 0,
      gamesWon: 0,
      highScore: 0,
      bestStreak: 0,
      totalCorrectAnswers: 0,
      totalAnswers: 0,
      categoryAccuracy: {
        'general-knowledge': { correct: 0, total: 0 },
        science: { correct: 0, total: 0 },
        history: { correct: 0, total: 0 },
        geography: { correct: 0, total: 0 },
        technology: { correct: 0, total: 0 },
      },
      difficultyAccuracy: {
        easy: { correct: 0, total: 0 },
        medium: { correct: 0, total: 0 },
        hard: { correct: 0, total: 0 },
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 flex flex-col font-sans selection:bg-violet-500/30 selection:text-white">
      {/* Strict Top Bar Navigation */}
      <Navbar
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        userProfile={userProfile}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Screen Routing Content */}
      <main className="flex-1 pb-16">
        {currentScreen === 'home' && (
          <HomeScreen
            onNavigate={handleNavigate}
            onStartQuickGame={handleStartQuickGame}
            userProfile={userProfile}
          />
        )}

        {currentScreen === 'category_selection' && (
          <CategorySelectionScreen
            onNavigate={handleNavigate}
            onSelectCategoryAndConfigure={handleSelectCategoryAndConfigure}
            userProfile={userProfile}
          />
        )}

        {currentScreen === 'game_configuration' && (
          <GameConfigurationScreen
            initialCategoryId={selectedCategoryId}
            onNavigate={handleNavigate}
            onLaunchGame={handleLaunchGame}
          />
        )}

        {currentScreen === 'active_gameplay' && (
          <ActiveGameplayScreen
            gameState={gameState}
            onSelectAnswer={handleSelectAnswer}
            onAbandonGame={handleAbandonGame}
            onNavigate={handleNavigate}
          />
        )}

        {currentScreen === 'answer_feedback' && (
          <AnswerFeedbackScreen
            gameState={gameState}
            onContinue={handleContinueFromFeedback}
            onNavigate={handleNavigate}
          />
        )}

        {currentScreen === 'game_results' && (
          <GameResultsScreen
            gameState={gameState}
            userProfile={userProfile}
            onPlayAgain={handlePlayAgain}
            onNavigate={handleNavigate}
          />
        )}

        {currentScreen === 'statistics' && (
          <StatisticsScreen
            userProfile={userProfile}
            onNavigate={handleNavigate}
            onStartQuickGame={handleStartQuickGame}
          />
        )}

        {currentScreen === 'auth' && (
          <AuthScreen
            userProfile={userProfile}
            onUpdateUserProfile={setUserProfile}
            onNavigate={handleNavigate}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            userProfile={userProfile}
            onResetStats={handleResetStats}
            onNavigate={handleNavigate}
          />
        )}

        {currentScreen === 'admin_dashboard' && (
          <AdminDashboardScreen
            questions={questions}
            onAddQuestion={handleAddQuestion}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onImportQuestions={handleImportQuestions}
          />
        )}
      </main>

      {/* Minimalist Quiet Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/40 py-6 text-center text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-violet-400">TRIVIA 001</span>
            <span aria-hidden="true">·</span>
            <span>Deterministic Single-Player Engine</span>
            <span aria-hidden="true">·</span>
            <span>Phase 1 Architecture</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => handleNavigate('settings')}
              className="hover:text-slate-200 transition-colors"
            >
              Preferences
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => handleNavigate('admin_dashboard')}
              className="hover:text-slate-200 transition-colors"
            >
              Curator Portal
            </button>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px] text-slate-400">v1.0.0-phase1</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
