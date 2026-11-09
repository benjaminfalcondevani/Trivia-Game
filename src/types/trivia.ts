/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CategoryId = 'general-knowledge' | 'science' | 'history' | 'geography' | 'technology';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  iconName: string;
  questionCount: number;
  colorAccent: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  version: number;
  categoryId: CategoryId;
  difficulty: DifficultyLevel;
  prompt: string;
  options: [QuestionOption, QuestionOption, QuestionOption, QuestionOption];
  correctOptionIndex: number; // 0, 1, 2, 3
  explanation: string;
  source: string;
  status: 'published' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface GameAnswerRecord {
  questionId: string;
  questionPrompt: string;
  categoryId: CategoryId;
  difficulty: DifficultyLevel;
  selectedOptionIndex: number;
  correctOptionIndex: number;
  isCorrect: boolean;
  basePoints: number;
  streakBonus: number;
  elapsedSeconds: number;
}

export interface ScoreBreakdown {
  basePoints: number;
  streakBonuses: number;
  completionBonus: number;
  remainingLivesBonus: number;
  totalScore: number;
}

export type GameStatus = 'idle' | 'in_progress' | 'feedback' | 'completed' | 'game_over';

export interface GameState {
  id: string;
  startedAt: number;
  selectedCategoryId: CategoryId | 'all';
  initialDifficulty: DifficultyLevel;
  currentDifficulty: DifficultyLevel;
  questions: Question[];
  currentQuestionIndex: number;
  livesRemaining: number;
  maxLives: number;
  currentStreak: number;
  bestStreak: number;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  status: GameStatus;
  answersHistory: GameAnswerRecord[];
  scoreBreakdown: ScoreBreakdown;
  selectedOptionIndex: number | null;
  lastAnswerResult: {
    isCorrect: boolean;
    pointsAwarded: number;
    streakBonusAwarded: number;
    livesLost: number;
    difficultyChanged: 'up' | 'down' | 'none';
  } | null;
}

export interface UserProfile {
  id: string;
  isGuest: boolean;
  username: string;
  email?: string;
  avatarSeed: string;
  createdAt: string;
  totalGamesPlayed: number;
  gamesWon: number;
  highScore: number;
  bestStreak: number;
  totalCorrectAnswers: number;
  totalAnswers: number;
  categoryAccuracy: Record<CategoryId, { correct: number; total: number }>;
  difficultyAccuracy: Record<DifficultyLevel, { correct: number; total: number }>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number; // 0 to 100
  category: 'accuracy' | 'streak' | 'endurance' | 'mastery';
}

export type ScreenId =
  | 'home'
  | 'category_selection'
  | 'game_configuration'
  | 'active_gameplay'
  | 'answer_feedback'
  | 'game_results'
  | 'statistics'
  | 'auth'
  | 'settings'
  | 'admin_dashboard';
