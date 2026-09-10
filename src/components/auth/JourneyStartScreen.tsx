'use client';

import React, { useState } from 'react';
import { UserAccount } from '@/types';
import { signupUser, loginUser } from '@/utils/auth';
import {
  ArrowRight,
  Target,
  Ruler,
  MessageSquare,
  Trophy,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

interface JourneyStartScreenProps {
  onAuthenticated: (user: UserAccount) => void;
}

const PHASES = [
  {
    step: 1,
    title: 'Phase 1: Body Calibration',
    shortTitle: '1. Baseline',
    icon: Ruler,
    color: 'text-blue-500 bg-blue-50 border-blue-200',
    description: 'Calculate BMR, TDEE & body metrics (weight, waist, chest) using Mifflin-St Jeor science.',
  },
  {
    step: 2,
    title: 'Phase 2: Target & Speed Selection',
    shortTitle: '2. Pace',
    icon: Target,
    color: 'text-emerald-500 bg-emerald-50 border-emerald-200',
    description: 'Choose your timeline: Slow & Sustainable, Standard, or Fast Extreme Cut with exact milestone dates.',
  },
  {
    step: 3,
    title: 'Phase 3: Conversational AI Food Logger',
    shortTitle: '3. AI Log',
    icon: MessageSquare,
    color: 'text-amber-500 bg-amber-50 border-amber-200',
    description: "Write in natural English: 'Had 2 rotis with dal tadka'. AI parses portions, macros, and allows live self-correction.",
  },
  {
    step: 4,
    title: 'Phase 4: Nightly AI Audit & Results',
    shortTitle: '4. Results',
    icon: Trophy,
    color: 'text-purple-500 bg-purple-50 border-purple-200',
    description: 'Every evening, AI audits what went wrong, highlights wins, and generates a concrete action plan for tomorrow.',
  },
];

export const JourneyStartScreen: React.FC<JourneyStartScreenProps> = ({ onAuthenticated }) => {
  const [selectedPhase, setSelectedPhase] = useState(1);
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
        setError('Please enter your name');
        return;
      }
      const user = signupUser(name, email);
      onAuthenticated(user);
    } else {
      const { user } = loginUser(email);
      onAuthenticated(user);
    }
  };

  const activePhase = PHASES.find((p) => p.step === selectedPhase) || PHASES[0];
  const PhaseIcon = activePhase.icon;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center p-4 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-5 sm:p-6 space-y-5">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-xl shadow-sm shadow-emerald-500/20 text-white font-black">
              🥑
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-slate-900 text-base tracking-tight">NutriAI</h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  AI Journey
                </span>
              </div>
              <p className="text-[11px] text-slate-400">4-Phase Transformation Architecture</p>
            </div>
          </div>
        </div>

        {/* Interactive Journey Phase Navigation Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            <span>Your Transformation Roadmap:</span>
            <span className="text-emerald-600 font-extrabold">{selectedPhase}/4</span>
          </div>

          {/* Phase Tabs */}
          <div className="grid grid-cols-4 gap-1.5">
            {PHASES.map((p) => {
              const Icon = p.icon;
              const isCurrent = selectedPhase === p.step;
              return (
                <button
                  key={p.step}
                  type="button"
                  onClick={() => setSelectedPhase(p.step)}
                  className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 text-center transition-all ${
                    isCurrent
                      ? 'bg-emerald-500 text-white shadow-xs scale-102 font-bold'
                      : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600 text-normal'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : 'text-slate-500'}`} />
                  <span className="text-[10px] tracking-tight">{p.shortTitle}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Phase Detail Preview Card */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 transition-all">
            <div className={`p-2 rounded-xl border shrink-0 ${activePhase.color}`}>
              <PhaseIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-slate-800">{activePhase.title}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                {activePhase.description}
              </p>
            </div>
          </div>
        </div>

        {/* Compact Login & Sign Up Box (Chota & Sleek) */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          {/* Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError(null);
              }}
              className={`py-1.5 rounded-xl transition-all ${
                isSignUp
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Start New Journey
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError(null);
              }}
              className={`py-1.5 rounded-xl transition-all ${
                !isSignUp
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5">
            {isSignUp && (
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-0.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ayush Raj"
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-0.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-sm shadow-emerald-500/20 flex items-center justify-center gap-1.5 active:scale-98 transition-all"
            >
              <span>{isSignUp ? 'Enter Phase 1 Calibration' : 'Access My Diary'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Footer Guarantee */}
        <div className="text-center pt-1 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            100% Private local persistence • Zero cloud subscription required
          </p>
        </div>

      </div>
    </div>
  );
};
