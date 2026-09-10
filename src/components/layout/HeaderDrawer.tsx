'use client';

import React from 'react';
import {
  X,
  Dumbbell,
  FileUp,
  User,
  RotateCcw,
  Sun,
  Moon,
  LogOut,
  Flame,
  ChevronRight,
  Trash2,
  Users,
} from 'lucide-react';
import { UserAccount } from '@/types';

interface HeaderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserAccount;
  theme: 'light' | 'dark';
  streakDays?: number;
  onToggleTheme: () => void;
  onOpenExerciseGuide: () => void;
  onOpenUploadDiet: () => void;
  onOpenCommunity?: () => void;
  onOpenProfile: () => void;
  onOpenResetCenter: () => void;
  onLogout?: () => void;
  onFreshStart?: () => void;
}

export const HeaderDrawer: React.FC<HeaderDrawerProps> = ({
  isOpen,
  onClose,
  user,
  theme,
  streakDays = 6,
  onToggleTheme,
  onOpenExerciseGuide,
  onOpenUploadDiet,
  onOpenCommunity,
  onOpenProfile,
  onOpenResetCenter,
  onLogout,
  onFreshStart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full shadow-2xl border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-5 z-10 animate-in slide-in-from-left duration-250">
        {/* Top Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-base shadow-xs shadow-emerald-500/20">
                🥑
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-sm">NutriAI</h3>
                <p className="text-[11px] text-slate-400 truncate">
                  {user?.name || 'Ayush'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Streak pill in drawer */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-bold">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
              <span>{streakDays} Day Streak</span>
            </div>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Consistent!</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenExerciseGuide();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <span>Workout & Exercise Guide</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenUploadDiet();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FileUp className="w-4 h-4" />
                </div>
                <span>Upload Diet Chart (PDF/Photo)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenProfile();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span>Profile & Daily Targets</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {onOpenCommunity && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCommunity();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <span>Community & Leaderboard</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenResetCenter();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <span>Data & Reset Options</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </nav>
        </div>

        {/* Bottom Actions: Theme & Logout */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {/* Light/Dark Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
              <span>Theme: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">Toggle</span>
          </button>

          {/* Fresh Start / Delete All Data */}
          {onFreshStart && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Delete all meal logs, goals, and history for a completely fresh start?')) {
                  onClose();
                  onFreshStart();
                }
              }}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors text-left"
            >
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span>Delete All Data & Fresh Start</span>
            </button>
          )}

          {/* Logout */}
          {onLogout && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out Account</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
