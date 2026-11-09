/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DifficultyLevel,
  GameAnswerRecord,
  GameState,
  Question,
  ScoreBreakdown,
  CategoryId,
} from '../types/trivia.ts';
import { INITIAL_QUESTIONS } from '../data/seedQuestions.ts';

export const GAME_CONSTANTS = {
  MAX_LIVES: 3,
  QUESTIONS_PER_GAME: 10,
  BASE_POINTS_PER_CORRECT: 100,
  COMPLETION_BONUS: 200,
  POINTS_PER_REMAINING_LIFE: 50,
  STREAK_THRESHOLDS: {
    TIER_1: { count: 3, bonus: 50 },
    TIER_2: { count: 5, bonus: 100 },
    TIER_3: { count: 7, bonus: 150 },
  },
  ADAPTIVE_RULES: {
    CONSECUTIVE_CORRECT_TO_INCREASE: 3,
    CONSECUTIVE_INCORRECT_TO_DECREASE: 2,
  },
};

/**
 * Returns the next difficulty level according to the adaptive algorithm:
 * - 3 consecutive correct answers: increase difficulty by 1 level
 * - 2 consecutive incorrect answers: decrease difficulty by 1 level
 * - Boundaries: 'easy' <= current <= 'hard'
 */
export function calculateNextDifficulty(
  currentDifficulty: DifficultyLevel,
  consecutiveCorrect: number,
  consecutiveIncorrect: number
): { nextDifficulty: DifficultyLevel; changed: 'up' | 'down' | 'none' } {
  if (consecutiveCorrect >= GAME_CONSTANTS.ADAPTIVE_RULES.CONSECUTIVE_CORRECT_TO_INCREASE) {
    if (currentDifficulty === 'easy') return { nextDifficulty: 'medium', changed: 'up' };
    if (currentDifficulty === 'medium') return { nextDifficulty: 'hard', changed: 'up' };
    return { nextDifficulty: 'hard', changed: 'none' };
  }

  if (consecutiveIncorrect >= GAME_CONSTANTS.ADAPTIVE_RULES.CONSECUTIVE_INCORRECT_TO_DECREASE) {
    if (currentDifficulty === 'hard') return { nextDifficulty: 'medium', changed: 'down' };
    if (currentDifficulty === 'medium') return { nextDifficulty: 'easy', changed: 'down' };
    return { nextDifficulty: 'easy', changed: 'none' };
  }

  return { nextDifficulty: currentDifficulty, changed: 'none' };
}

/**
 * Calculate streak bonus for current streak count
 */
export function calculateStreakBonus(currentStreak: number): number {
  if (currentStreak >= GAME_CONSTANTS.STREAK_THRESHOLDS.TIER_3.count) {
    return GAME_CONSTANTS.STREAK_THRESHOLDS.TIER_3.bonus;
  }
  if (currentStreak >= GAME_CONSTANTS.STREAK_THRESHOLDS.TIER_2.count) {
    return GAME_CONSTANTS.STREAK_THRESHOLDS.TIER_2.bonus;
  }
  if (currentStreak >= GAME_CONSTANTS.STREAK_THRESHOLDS.TIER_1.count) {
    return GAME_CONSTANTS.STREAK_THRESHOLDS.TIER_1.bonus;
  }
  return 0;
}

/**
 * Select questions for a new game based on category and starting difficulty
 */
export function selectGameQuestions(
  pool: Question[],
  categoryId: CategoryId | 'all',
  count = GAME_CONSTANTS.QUESTIONS_PER_GAME
): Question[] {
  let filtered = pool.filter((q) => q.status === 'published');
  if (categoryId !== 'all') {
    filtered = filtered.filter((q) => q.categoryId === categoryId);
  }

  // If pool is smaller than count, include questions from all categories to ensure standard 10-question game
  if (filtered.length < count) {
    const backup = pool.filter((q) => q.status === 'published');
    const combined = [...filtered];
    for (const q of backup) {
      if (!combined.some((item) => item.id === q.id)) {
        combined.push(q);
      }
      if (combined.length >= count) break;
    }
    filtered = combined;
  }

  // Shuffle deterministic pool copy
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Initialize a fresh game state
 */
export function createInitialGameState(
  categoryId: CategoryId | 'all' = 'all',
  initialDifficulty: DifficultyLevel = 'medium',
  customQuestions?: Question[]
): GameState {
  const questions = customQuestions || selectGameQuestions(INITIAL_QUESTIONS, categoryId);

  return {
    id: `game-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    startedAt: Date.now(),
    selectedCategoryId: categoryId,
    initialDifficulty,
    currentDifficulty: initialDifficulty,
    questions,
    currentQuestionIndex: 0,
    livesRemaining: GAME_CONSTANTS.MAX_LIVES,
    maxLives: GAME_CONSTANTS.MAX_LIVES,
    currentStreak: 0,
    bestStreak: 0,
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    status: 'in_progress',
    answersHistory: [],
    scoreBreakdown: {
      basePoints: 0,
      streakBonuses: 0,
      completionBonus: 0,
      remainingLivesBonus: 0,
      totalScore: 0,
    },
    selectedOptionIndex: null,
    lastAnswerResult: null,
  };
}

/**
 * Authoritatively process an answer submission
 */
export function processAnswerSubmission(
  state: GameState,
  selectedOptionIndex: number,
  elapsedSeconds = 5
): GameState {
  if (state.status !== 'in_progress') return state;

  const currentQuestion = state.questions[state.currentQuestionIndex];
  if (!currentQuestion) return state;

  const isCorrect = selectedOptionIndex === currentQuestion.correctOptionIndex;

  let newLives = state.livesRemaining;
  let newCurrentStreak = state.currentStreak;
  let newConsecutiveCorrect = state.consecutiveCorrect;
  let newConsecutiveIncorrect = state.consecutiveIncorrect;
  let pointsAwarded = 0;
  let streakBonusAwarded = 0;
  const livesLost = isCorrect ? 0 : 1;

  if (isCorrect) {
    newCurrentStreak += 1;
    newConsecutiveCorrect += 1;
    newConsecutiveIncorrect = 0;
    pointsAwarded = GAME_CONSTANTS.BASE_POINTS_PER_CORRECT;
    streakBonusAwarded = calculateStreakBonus(newCurrentStreak);
  } else {
    newLives = Math.max(0, newLives - 1);
    newCurrentStreak = 0;
    newConsecutiveCorrect = 0;
    newConsecutiveIncorrect += 1;
  }

  const newBestStreak = Math.max(state.bestStreak, newCurrentStreak);

  // Calculate adaptive difficulty transition
  const { nextDifficulty, changed: diffChange } = calculateNextDifficulty(
    state.currentDifficulty,
    newConsecutiveCorrect,
    newConsecutiveIncorrect
  );

  // If difficulty shifted, reset streak counters for the next step threshold
  if (diffChange !== 'none') {
    newConsecutiveCorrect = 0;
    newConsecutiveIncorrect = 0;
  }

  const answerRecord: GameAnswerRecord = {
    questionId: currentQuestion.id,
    questionPrompt: currentQuestion.prompt,
    categoryId: currentQuestion.categoryId,
    difficulty: currentQuestion.difficulty,
    selectedOptionIndex,
    correctOptionIndex: currentQuestion.correctOptionIndex,
    isCorrect,
    basePoints: pointsAwarded,
    streakBonus: streakBonusAwarded,
    elapsedSeconds,
  };

  const newScoreBreakdown: ScoreBreakdown = {
    basePoints: state.scoreBreakdown.basePoints + pointsAwarded,
    streakBonuses: state.scoreBreakdown.streakBonuses + streakBonusAwarded,
    completionBonus: 0,
    remainingLivesBonus: 0,
    totalScore:
      state.scoreBreakdown.basePoints +
      pointsAwarded +
      state.scoreBreakdown.streakBonuses +
      streakBonusAwarded,
  };

  return {
    ...state,
    livesRemaining: newLives,
    currentStreak: newCurrentStreak,
    bestStreak: newBestStreak,
    consecutiveCorrect: newConsecutiveCorrect,
    consecutiveIncorrect: newConsecutiveIncorrect,
    currentDifficulty: nextDifficulty,
    status: 'feedback',
    answersHistory: [...state.answersHistory, answerRecord],
    scoreBreakdown: newScoreBreakdown,
    selectedOptionIndex,
    lastAnswerResult: {
      isCorrect,
      pointsAwarded,
      streakBonusAwarded,
      livesLost,
      difficultyChanged: diffChange,
    },
  };
}

/**
 * Move to next question or finalize game
 */
export function proceedToNextQuestion(state: GameState): GameState {
  if (state.status !== 'feedback') return state;

  // Check game over by lives
  if (state.livesRemaining <= 0) {
    return {
      ...state,
      status: 'game_over',
    };
  }

  const nextIndex = state.currentQuestionIndex + 1;
  const isFinished = nextIndex >= state.questions.length;

  if (isFinished) {
    // Add completion and remaining life bonuses
    const completionBonus = GAME_CONSTANTS.COMPLETION_BONUS;
    const remainingLivesBonus = state.livesRemaining * GAME_CONSTANTS.POINTS_PER_REMAINING_LIFE;
    const finalTotal =
      state.scoreBreakdown.basePoints +
      state.scoreBreakdown.streakBonuses +
      completionBonus +
      remainingLivesBonus;

    return {
      ...state,
      status: 'completed',
      scoreBreakdown: {
        ...state.scoreBreakdown,
        completionBonus,
        remainingLivesBonus,
        totalScore: finalTotal,
      },
    };
  }

  return {
    ...state,
    currentQuestionIndex: nextIndex,
    status: 'in_progress',
    selectedOptionIndex: null,
    lastAnswerResult: null,
  };
}
