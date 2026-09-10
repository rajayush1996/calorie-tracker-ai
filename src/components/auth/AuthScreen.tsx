'use client';

import React, { useState } from 'react';
import { UserAccount } from '@/types';
import { signupUser, loginUser } from '@/utils/auth';
import { Sparkles, ArrowRight, ShieldCheck, ChevronLeft } from 'lucide-react';

interface AuthScreenProps {
  onAuthenticated: (user: UserAccount) => void;
  onBackToCarousel?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated, onBackToCarousel }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (isSignUp) {
      if (!name.trim()) {
        setError('Please enter your full name');
        return;
      }
      const user = signupUser(name, email);
      onAuthenticated(user);
    } else {
      const { user } = loginUser(email);
      onAuthenticated(user);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center p-4 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 space-y-6">
        
        {/* Top Header with Back button if carousel available */}
        <div className="flex items-center justify-between">
          {onBackToCarousel ? (
            <button
              type="button"
              onClick={onBackToCarousel}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 py-1 px-2.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>App Intro</span>
            </button>
          ) : (
            <div />
          )}

          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Secure Sign In
          </span>
        </div>

        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center mx-auto text-2xl shadow-md shadow-emerald-500/25 text-white font-black">
            🥑
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            NutriAI
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Conversational AI Calorie Tracker, Pantry-Matched Diet Planner & Fat Loss Coach
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setError(null);
            }}
            className={`py-2 rounded-xl transition-all ${
              isSignUp
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setError(null);
            }}
            className={`py-2 rounded-xl transition-all ${
              !isSignUp
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {isSignUp && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ayush Raj"
                className="w-full p-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full p-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <span>{isSignUp ? 'Continue to Personal Calibration' : 'Sign In to My Diary'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="relative flex items-center justify-center py-0.5">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full absolute" />
            <span className="bg-white px-2.5 text-[10px] uppercase font-bold text-slate-400 relative z-10">
              or
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              const freshUser = signupUser('Fresh User', `user_${Date.now()}@nutriai.local`);
              onAuthenticated(freshUser);
            }}
            className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Start Fresh as New User (Instant)</span>
          </button>
        </form>

        {/* Value props footer */}
        <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-400 text-center border-t border-slate-100">
          <div className="flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Private Disk Storage</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>AI Nutrition Intelligence</span>
          </div>
        </div>
      </div>
    </div>
  );
};
