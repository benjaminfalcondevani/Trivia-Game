/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Question, CategoryId, DifficultyLevel } from '../types/trivia.ts';
import { CATEGORIES } from '../data/seedQuestions.ts';
import { Modal } from '../components/common/Modal.tsx';
import { soundManager } from '../utils/audio.ts';
import {
  Plus,
  Upload,
  Search,
  Filter,
  Edit2,
  Archive,
  CheckCircle,
  FileText,
  AlertCircle,
  BookOpen,
  Sparkles,
} from 'lucide-react';

interface AdminDashboardScreenProps {
  questions: Question[];
  onAddQuestion: (q: Question) => void;
  onUpdateQuestion: (q: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onImportQuestions: (imported: Question[]) => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onImportQuestions,
}) => {
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Form state
  const [formPrompt, setFormPrompt] = useState('');
  const [formCategory, setFormCategory] = useState<CategoryId>('science');
  const [formDifficulty, setFormDifficulty] = useState<DifficultyLevel>('medium');
  const [formOptions, setFormOptions] = useState<[string, string, string, string]>([
    '',
    '',
    '',
    '',
  ]);
  const [formCorrectIndex, setFormCorrectIndex] = useState(0);
  const [formExplanation, setFormExplanation] = useState('');
  const [formSource, setFormSource] = useState('');
  const [formStatus, setFormStatus] = useState<'published' | 'draft' | 'archived'>('published');

  // CSV input state
  const [csvText, setCsvText] = useState('');
  const [csvPreviewRows, setCsvPreviewRows] = useState<Question[]>([]);
  const [csvError, setCsvError] = useState('');

  // Open modal for new question
  const handleOpenCreateModal = () => {
    soundManager.playClick();
    setEditingQuestion(null);
    setFormPrompt('');
    setFormCategory('science');
    setFormDifficulty('medium');
    setFormOptions(['', '', '', '']);
    setFormCorrectIndex(0);
    setFormExplanation('');
    setFormSource('');
    setFormStatus('published');
    setIsEditorOpen(true);
  };

  // Open modal for editing existing question
  const handleOpenEditModal = (q: Question) => {
    soundManager.playClick();
    setEditingQuestion(q);
    setFormPrompt(q.prompt);
    setFormCategory(q.categoryId);
    setFormDifficulty(q.difficulty);
    setFormOptions([
      q.options[0]?.text || '',
      q.options[1]?.text || '',
      q.options[2]?.text || '',
      q.options[3]?.text || '',
    ]);
    setFormCorrectIndex(q.correctOptionIndex);
    setFormExplanation(q.explanation);
    setFormSource(q.source);
    setFormStatus(q.status);
    setIsEditorOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPrompt.trim()) return;

    soundManager.playCorrect();
    const formattedOptions: Question['options'] = [
      { id: 'opt-a', text: formOptions[0] || 'Option A' },
      { id: 'opt-b', text: formOptions[1] || 'Option B' },
      { id: 'opt-c', text: formOptions[2] || 'Option C' },
      { id: 'opt-d', text: formOptions[3] || 'Option D' },
    ];

    if (editingQuestion) {
      const updated: Question = {
        ...editingQuestion,
        version: editingQuestion.version + 1,
        prompt: formPrompt.trim(),
        categoryId: formCategory,
        difficulty: formDifficulty,
        options: formattedOptions,
        correctOptionIndex: formCorrectIndex,
        explanation: formExplanation.trim(),
        source: formSource.trim(),
        status: formStatus,
        updatedAt: new Date().toISOString(),
      };
      onUpdateQuestion(updated);
    } else {
      const newQ: Question = {
        id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        version: 1,
        prompt: formPrompt.trim(),
        categoryId: formCategory,
        difficulty: formDifficulty,
        options: formattedOptions,
        correctOptionIndex: formCorrectIndex,
        explanation: formExplanation.trim(),
        source: formSource.trim(),
        status: formStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onAddQuestion(newQ);
    }

    setIsEditorOpen(false);
  };

  // Parse and preview CSV text
  const handleParseCsv = () => {
    setCsvError('');
    setCsvPreviewRows([]);
    try {
      const lines = csvText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
      if (lines.length < 2) {
        setCsvError('CSV must include a header line and at least one question record.');
        return;
      }

      // Expected CSV format: prompt,categoryId,difficulty,optA,optB,optC,optD,correctIndex,explanation,source
      const parsed: Question[] = [];
      const dataLines = lines.slice(1);

      for (let i = 0; i < dataLines.length; i++) {
        const parts = dataLines[i].split(',').map((p) => p.trim());
        if (parts.length < 8) continue;

        const [prompt, catId, diff, o1, o2, o3, o4, correctIdxStr, expl = '', src = ''] = parts;
        const validCategory = (['general-knowledge', 'science', 'history', 'geography', 'technology'].includes(catId)
          ? catId
          : 'general-knowledge') as CategoryId;
        const validDiff = (['easy', 'medium', 'hard'].includes(diff) ? diff : 'medium') as DifficultyLevel;
        const correctIdx = Math.min(3, Math.max(0, parseInt(correctIdxStr, 10) || 0));

        parsed.push({
          id: `csv-${Date.now()}-${i}`,
          version: 1,
          prompt,
          categoryId: validCategory,
          difficulty: validDiff,
          options: [
            { id: 'opt-a', text: o1 || 'Option 1' },
            { id: 'opt-b', text: o2 || 'Option 2' },
            { id: 'opt-c', text: o3 || 'Option 3' },
            { id: 'opt-d', text: o4 || 'Option 4' },
          ],
          correctOptionIndex: correctIdx,
          explanation: expl || 'Verified editorial reference.',
          source: src || 'Standard Reference Archive',
          status: 'published',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      if (parsed.length === 0) {
        setCsvError('No valid rows found in provided CSV text.');
        return;
      }

      setCsvPreviewRows(parsed);
      soundManager.playStreak();
    } catch (err) {
      setCsvError('Failed to parse CSV format. Please check delimiter and columns.');
    }
  };

  const handleCommitCsv = () => {
    if (csvPreviewRows.length === 0) return;
    soundManager.playCorrect();
    onImportQuestions(csvPreviewRows);
    setIsCsvModalOpen(false);
    setCsvText('');
    setCsvPreviewRows([]);
  };

  // Sample template insertion
  const insertSampleCsv = () => {
    const template = `prompt,category,difficulty,optA,optB,optC,optD,correctIndex,explanation,source
"What is the capital of Canada?",geography,easy,"Toronto","Ottawa","Montreal","Vancouver",1,"Ottawa was chosen as capital in 1857 by Queen Victoria.","Library of Parliament Canada"
"Which telescope succeeded the Hubble Space Telescope in 2021?",science,medium,"Spitzer Space Telescope","James Webb Space Telescope","Nancy Grace Roman Telescope","Chandra Observatory",1,"The James Webb Space Telescope operates at the Sun-Earth L2 Lagrange point.","NASA JWST Mission Office"`;
    setCsvText(template);
  };

  // Filtered question set
  const filteredQuestions = questions.filter((q) => {
    const matchSearch =
      q.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === 'all' || q.categoryId === categoryFilter;
    const matchDiff = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
    const matchStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchSearch && matchCat && matchDiff && matchStatus;
  });

  const publishedCount = questions.filter((q) => q.status === 'published').length;
  const draftCount = questions.filter((q) => q.status === 'draft').length;
  const archivedCount = questions.filter((q) => q.status === 'archived').length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Question Editorial Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Curate, edit, version, and import questions for production trivia games.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              soundManager.playClick();
              setIsCsvModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
          >
            <Upload className="w-4 h-4 text-slate-400" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-all shadow-md shadow-violet-950/40"
          >
            <Plus className="w-4 h-4" />
            <span>Create Question</span>
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-slate-400 uppercase tracking-wider text-[11px] block">Total Questions</span>
          <span className="font-mono text-2xl font-bold text-white tabular-nums mt-1 block">{questions.length}</span>
        </div>
        <div className="p-4 rounded-xl border border-emerald-900/40 bg-emerald-950/20">
          <span className="text-emerald-400 uppercase tracking-wider text-[11px] block">Published & Active</span>
          <span className="font-mono text-2xl font-bold text-emerald-300 tabular-nums mt-1 block">{publishedCount}</span>
        </div>
        <div className="p-4 rounded-xl border border-amber-900/40 bg-amber-950/20">
          <span className="text-amber-400 uppercase tracking-wider text-[11px] block">Editorial Drafts</span>
          <span className="font-mono text-2xl font-bold text-amber-300 tabular-nums mt-1 block">{draftCount}</span>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-slate-400 uppercase tracking-wider text-[11px] block">Archived</span>
          <span className="font-mono text-2xl font-bold text-slate-400 tabular-nums mt-1 block">{archivedCount}</span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search prompt or citation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-9 py-2 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          {/* Category filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty filter */}
          <div>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Question Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-mono uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Ver</th>
                <th className="py-3 px-4">Prompt</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No questions match the current filter selection.
                  </td>
                </tr>
              ) : (
                filteredQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500">v{q.version}</td>
                    <td className="py-3 px-4 max-w-sm">
                      <p className="font-semibold text-white line-clamp-2 leading-relaxed">{q.prompt}</p>
                      <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        Answer: {q.options[q.correctOptionIndex]?.text}
                      </span>
                    </td>
                    <td className="py-3 px-4 capitalize whitespace-nowrap text-slate-300">
                      {q.categoryId.replace('-', ' ')}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`font-mono text-[10px] uppercase font-semibold px-2 py-0.5 rounded border ${
                          q.difficulty === 'easy'
                            ? 'text-emerald-300 border-emerald-800/60 bg-emerald-950/40'
                            : q.difficulty === 'medium'
                            ? 'text-sky-300 border-sky-800/60 bg-sky-950/40'
                            : 'text-amber-300 border-amber-800/60 bg-amber-950/40'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                          q.status === 'published'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : q.status === 'draft'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-[180px] truncate text-slate-400 italic">
                      {q.source || 'Standard Reference'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(q)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Edit question"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            soundManager.playClick();
                            const nextStatus = q.status === 'published' ? 'archived' : 'published';
                            onUpdateQuestion({ ...q, status: nextStatus, updatedAt: new Date().toISOString() });
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                          title={q.status === 'published' ? 'Archive question' : 'Publish question'}
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Question Modal */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingQuestion ? `Edit Question v${editingQuestion.version}` : 'Create New Curated Question'}
        subtitle="Ensure factual verification and editorial sourcing before publishing"
        maxWidth="xl"
      >
        <form onSubmit={handleSaveQuestion} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Question Prompt
            </label>
            <textarea
              required
              rows={2}
              value={formPrompt}
              onChange={(e) => setFormPrompt(e.target.value)}
              placeholder="What physical constant characterizes the fundamental quantum of action?"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as CategoryId)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Difficulty</label>
              <select
                value={formDifficulty}
                onChange={(e) => setFormDifficulty(e.target.value as DifficultyLevel)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as 'published' | 'draft' | 'archived')}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* 4 Options with Radio selection for correct answer */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-300 block">
              Four Answer Options (Select radio next to correct answer)
            </span>

            {['Option A', 'Option B', 'Option C', 'Option D'].map((optLabel, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correctOption"
                  checked={formCorrectIndex === idx}
                  onChange={() => setFormCorrectIndex(idx)}
                  className="h-4 w-4 text-violet-600 focus:ring-violet-500 bg-slate-900 border-slate-700"
                  title="Mark as correct answer"
                />
                <input
                  type="text"
                  required
                  placeholder={`${optLabel} text`}
                  value={formOptions[idx]}
                  onChange={(e) => {
                    const next = [...formOptions] as [string, string, string, string];
                    next[idx] = e.target.value;
                    setFormOptions(next);
                  }}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Editorial Explanation (Shown to user post-answer)
            </label>
            <textarea
              required
              rows={2}
              value={formExplanation}
              onChange={(e) => setFormExplanation(e.target.value)}
              placeholder="Detailed scientific or historical context..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Authoritative Source Citation
            </label>
            <input
              type="text"
              required
              placeholder="e.g. NIST Fundamental Constants Archive / NASA Origins"
              value={formSource}
              onChange={(e) => setFormSource(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditorOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors shadow-md shadow-violet-950/40"
            >
              {editingQuestion ? 'Save Changes' : 'Publish Question'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CSV Import Modal */}
      <Modal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        title="Batch Import Questions via CSV"
        subtitle="Import questions in standardized comma-separated format"
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Format: prompt, category, difficulty, optA, optB, optC, optD, correctIndex (0-3), explanation, source</span>
            <button
              type="button"
              onClick={insertSampleCsv}
              className="text-violet-400 hover:underline font-semibold"
            >
              Paste Sample Template
            </button>
          </div>

          <textarea
            rows={6}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="Paste your CSV content here..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 font-mono text-xs text-white p-3 focus:border-violet-500 focus:outline-none"
          />

          <div className="flex items-center justify-between">
            <button
              onClick={handleParseCsv}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              Validate & Preview Rows
            </button>
            {csvPreviewRows.length > 0 && (
              <span className="text-xs text-emerald-400 font-medium">
                {csvPreviewRows.length} valid question(s) parsed
              </span>
            )}
          </div>

          {csvError && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{csvError}</span>
            </div>
          )}

          {/* Preview list */}
          {csvPreviewRows.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-2">
              <span className="text-[11px] font-mono uppercase text-slate-500 block">Preview parsed questions</span>
              {csvPreviewRows.map((q, idx) => (
                <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800 text-xs">
                  <span className="font-semibold text-white">{q.prompt}</span>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Category: {q.categoryId} · Diff: {q.difficulty} · Answer: {q.options[q.correctOptionIndex]?.text}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={() => setIsCsvModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              disabled={csvPreviewRows.length === 0}
              onClick={handleCommitCsv}
              className="px-5 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors shadow-md shadow-violet-950/40"
            >
              Commit Import ({csvPreviewRows.length} Questions)
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
