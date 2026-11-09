/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ScreenId, UserProfile } from '../../types/trivia.ts';
import { Volume2, VolumeX, User, Shield } from 'lucide-react';
import { soundManager } from '../../utils/audio.ts';

interface NavbarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  userProfile: UserProfile;
  isMuted: boolean;
  onToggleMute: () => void;
}

/**
 * Top navigation bar adhering to the Strict Top Bar Contract:
 * Zone 1: Brand wordmark (single text element)
 * Zone 2: 4-5 clean single-line text navigation links
 * Zone 3: 1 primary action / user status affordance
 */
export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  userProfile,
  isMuted,
  onToggleMute,
}) => {
  const navItems: { id: ScreenId; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'category_selection', label: 'Categories' },
    { id: 'game_configuration', label: 'Play' },
    { id: 'statistics', label: 'Statistics' },
    { id: 'admin_dashboard', label: 'Editorial' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0B132B]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => {
            soundManager.playClick();
            onNavigate('home');
          }}
          className="group flex items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-sm"
        >
          <span className="font-mono text-xs font-semibold tracking-widest text-violet-400 uppercase">
            Axiom
          </span>
          <span className="text-lg font-extrabold tracking-tight text-white group-hover:text-violet-300 transition-colors whitespace-nowrap">
            TRIVIA 001
          </span>
        </button>

        {/* Zone 2: 4-5 Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          {navItems.map((item) => {
            const isActive =
              currentScreen === item.id ||
              (item.id === 'game_configuration' &&
                (currentScreen === 'active_gameplay' ||
                  currentScreen === 'answer_feedback' ||
                  currentScreen === 'game_results'));
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundManager.playClick();
                  onNavigate(item.id);
                }}
                className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 text-sm font-medium ${
                  isActive
                    ? 'border-violet-500 text-white font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action & Utilities */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Audio toggle button */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute game audio' : 'Mute game audio'}
            aria-label={isMuted ? 'Unmute game audio' : 'Mute game audio'}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-violet-400" />}
          </button>

          {/* Settings button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onNavigate('settings');
            }}
            title="Settings"
            className={`p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors text-xs font-medium ${
              currentScreen === 'settings' ? 'bg-slate-800 text-white' : ''
            }`}
          >
            Settings
          </button>

          {/* Primary Action: Profile / Sign In */}
          <button
            onClick={() => {
              soundManager.playClick();
              onNavigate('auth');
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 whitespace-nowrap shrink-0"
          >
            {userProfile.isGuest ? (
              <>
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Guest</span>
                <span className="text-[10px] text-violet-400 font-normal">· Sync</span>
              </>
            ) : (
              <>
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-medium">{userProfile.username}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar for small viewports */}
      <div className="flex md:hidden overflow-x-auto scrollbar-none border-t border-slate-800/50 px-4 py-2 gap-4 text-xs font-medium text-slate-400">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                soundManager.playClick();
                onNavigate(item.id);
              }}
              className={`whitespace-nowrap py-1 ${
                isActive ? 'text-violet-400 font-semibold' : 'hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
