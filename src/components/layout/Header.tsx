'use client';

import React from 'react';
import { Flame, Calendar, Sun, Moon } from 'lucide-react';
import { UserAccount } from '@/types';

interface HeaderProps {
  user?: UserAccount;
  theme: 'light' | 'dark';
  streakDays?: number;
  onToggleTheme: () => void;
  onOpenMenu?: () => void;
  onOpenProfile?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  theme,
  streakDays = 6,
  onToggleTheme,
  onOpenMenu,
}) => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800/80 px-4 py-3 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-xs shadow-emerald-500/20 text-white font-black text-lg">
            🥑
          </div>
          <div>
            <h1 className="font-black text-slate-900 dark:text-white text-base tracking-tight">
              NutriAI
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {today}
            </p>
          </div>
        </div>

        {/* Right actions: clean streak + theme toggle + Hamburger Menu */}
        <div className="flex items-center gap-1.5">
          {/* Streak pill */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 text-xs font-semibold shadow-xs">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{streakDays}d</span>
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle light/dark theme"
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4.5 h-4.5 text-amber-400" />
            ) : (
              <Moon className="w-4.5 h-4.5 text-slate-600" />
            )}
          </button>

          {/* Hamburger Menu Button */}
          {onOpenMenu && (
            <button
              onClick={onOpenMenu}
              aria-label="Open Navigation Menu"
              className="p-2 rounded-xl text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              title="Menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
