/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScreenId, UserProfile } from '../types/trivia.ts';
import { soundManager } from '../utils/audio.ts';
import { Volume2, VolumeX, Eye, Keyboard, Trash2, Download, RotateCcw, Check, Sparkles } from 'lucide-react';

interface SettingsScreenProps {
  isMuted: boolean;
  onToggleMute: () => void;
  userProfile: UserProfile;
  onResetStats: () => void;
  onNavigate: (screen: ScreenId) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  isMuted,
  onToggleMute,
  userProfile,
  onResetStats,
  onNavigate,
}) => {
  const [volume, setVolume] = useState(soundManager.getVolume());
  const [highContrast, setHighContrast] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState('');

  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    soundManager.setVolume(newVal);
  };

  const testAudio = () => {
    soundManager.playStreak();
    setFeedbackToast('Synthesized audio chime test played');
    setTimeout(() => setFeedbackToast(''), 2000);
  };

  const handleExportData = () => {
    soundManager.playClick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(userProfile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `trivia-profile-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setFeedbackToast('Telemetry snapshot exported.');
    setTimeout(() => setFeedbackToast(''), 2000);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Settings & Preferences
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure synthesized audio feedback, input shortcuts, accessibility, and local cache.
        </p>
      </div>

      {feedbackToast && (
        <div className="p-3.5 rounded-xl bg-violet-950/80 border border-violet-700/60 text-violet-200 text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Audio Engine Configuration */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700/60 text-violet-400">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Synthesized Audio Feedback</h2>
              <p className="text-xs text-slate-400 mt-0.5">Procedural Web Audio API sound effects for correct chimes and streaks</p>
            </div>
          </div>

          <button
            onClick={() => {
              onToggleMute();
              soundManager.playClick();
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              isMuted
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : 'bg-violet-600 text-white border-violet-500'
            }`}
          >
            {isMuted ? 'Muted' : 'Enabled'}
          </button>
        </div>

        {!isMuted && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Volume Calibration</span>
              <span className="font-mono tabular-nums text-white">{Math.round(volume * 100)}%</span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer"
              />
              <button
                onClick={testAudio}
                className="px-3 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 shrink-0"
              >
                Test Chime
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Reference */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700/60 text-sky-400">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Keyboard Interaction Guide</h2>
            <p className="text-xs text-slate-400 mt-0.5">Quick hotkeys supported across desktop matches</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
            <span className="text-slate-300">Answer Option 1</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-violet-300 font-bold">1 or A</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
            <span className="text-slate-300">Answer Option 2</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-violet-300 font-bold">2 or B</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
            <span className="text-slate-300">Answer Option 3</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-violet-300 font-bold">3 or C</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
            <span className="text-slate-300">Answer Option 4</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-violet-300 font-bold">4 or D</kbd>
          </div>
        </div>
      </div>

      {/* Accessibility & Viewport */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700/60 text-emerald-400">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Enhanced Contrast Borders</h2>
              <p className="text-xs text-slate-400 mt-0.5">Reinforce card boundaries for high ambient light conditions</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              setHighContrast(!highContrast);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              highContrast ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {highContrast ? 'Active' : 'Standard'}
          </button>
        </div>
      </div>

      {/* Data Maintenance & Reset */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Data Maintenance & Local Storage</h2>
        <p className="text-xs text-slate-400">
          Manage stored match sessions, export telemetry snapshots, or reset local guest statistics.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Profile JSON</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset all personal statistics, streaks, and match counts?')) {
                soundManager.playClick();
                onResetStats();
                setFeedbackToast('Statistics reset successfully.');
                setTimeout(() => setFeedbackToast(''), 2000);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Reset Statistics</span>
          </button>
        </div>
      </div>
    </div>
  );
};
