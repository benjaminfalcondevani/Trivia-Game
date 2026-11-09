/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScreenId, UserProfile } from '../types/trivia.ts';
import { Shield, User, Lock, Mail, ArrowRight, CheckCircle2, UserCheck, LogOut } from 'lucide-react';
import { soundManager } from '../utils/audio.ts';

interface AuthScreenProps {
  userProfile: UserProfile;
  onUpdateUserProfile: (updated: UserProfile) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  userProfile,
  onUpdateUserProfile,
  onNavigate,
}) => {
  const [tab, setTab] = useState<'register' | 'login' | 'guest'>(
    userProfile.isGuest ? 'register' : 'guest'
  );
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [migrateGuestData, setMigrateGuestData] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    soundManager.playCorrect();
    const updated: UserProfile = {
      ...userProfile,
      isGuest: false,
      username: username.trim(),
      email: email.trim() || `${username.trim().toLowerCase()}@trivia.local`,
    };
    onUpdateUserProfile(updated);
    setSuccessMsg(`Welcome, ${username.trim()}! Your profile has been registered.`);
    setTimeout(() => {
      onNavigate('statistics');
    }, 1200);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    soundManager.playCorrect();
    const updated: UserProfile = {
      ...userProfile,
      isGuest: false,
      username: username.trim(),
      email: email.trim() || `${username.trim().toLowerCase()}@trivia.local`,
    };
    onUpdateUserProfile(updated);
    setSuccessMsg(`Signed in as ${username.trim()}. Synchronized.`);
    setTimeout(() => {
      onNavigate('home');
    }, 1200);
  };

  const handleSignOutToGuest = () => {
    soundManager.playClick();
    const guestProfile: UserProfile = {
      ...userProfile,
      isGuest: true,
      username: 'Guest Player',
      email: undefined,
    };
    onUpdateUserProfile(guestProfile);
    setSuccessMsg('Reverted to anonymous guest session.');
    setTab('login');
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-violet-950/70 border border-violet-800/60 text-violet-400">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Account & History Sync
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
          Start playing as a guest with zero barriers. Register whenever you desire cross-device sync.
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1">
        <button
          onClick={() => {
            soundManager.playSelect();
            setTab('register');
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
            tab === 'register' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Create Account
        </button>
        <button
          onClick={() => {
            soundManager.playSelect();
            setTab('login');
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
            tab === 'login' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => {
            soundManager.playSelect();
            setTab('guest');
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
            tab === 'guest' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Guest Status
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Register Form */}
      {tab === 'register' && (
        <form onSubmit={handleRegister} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Player Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. AthenaScholar"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-10 py-2.5 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Email Address (Optional)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-10 py-2.5 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-10 py-2.5 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Guest migration check */}
          <div className="flex items-start gap-2.5 pt-2 border-t border-slate-800">
            <input
              id="migrate"
              type="checkbox"
              checked={migrateGuestData}
              onChange={(e) => setMigrateGuestData(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-950 text-violet-600 focus:ring-violet-500"
            />
            <label htmlFor="migrate" className="text-xs text-slate-300">
              <strong className="text-white block font-medium">Migrate current guest history</strong>
              Transfer match history, high score ({userProfile.highScore} pts), and category accuracy to this new account.
            </label>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-all shadow-lg shadow-violet-950/60 mt-4"
          >
            <span>Create Registered Profile</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Login Form */}
      {tab === 'login' && (
        <form onSubmit={handleLogin} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Player Username or Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="AthenaScholar"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-10 py-2.5 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-10 py-2.5 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-all shadow-lg shadow-violet-950/60 mt-4"
          >
            <span>Sign In to Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Guest Status Screen */}
      {tab === 'guest' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono uppercase text-slate-500">Session Mode</span>
              <h3 className="text-lg font-bold text-white">
                {userProfile.isGuest ? 'Active Guest Session' : `Signed in as ${userProfile.username}`}
              </h3>
            </div>
            {userProfile.isGuest ? (
              <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                Anonymous
              </span>
            ) : (
              <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" /> Synced
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <p>
              Guest sessions retain temporary scores in local memory. You can continue playing matches indefinitely without creating an account.
            </p>
            <p className="text-slate-400">
              When ready, registration enables multi-device persistence and leaderboard qualification.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {userProfile.isGuest ? (
              <button
                onClick={() => setTab('register')}
                className="w-full py-2.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-colors text-center"
              >
                Register to Preserve Progress
              </button>
            ) : (
              <button
                onClick={handleSignOutToGuest}
                className="w-full py-2.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/40 border border-rose-800/40 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out to Anonymous Guest Session</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('home')}
              className="w-full py-2 text-xs font-medium text-slate-400 hover:text-slate-200 text-center"
            >
              Continue Playing as Guest
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
