'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Activity } from 'lucide-react';

interface AppSplashScreenProps {
  onComplete?: () => void;
}

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'visible' | 'fading' | 'hidden'>('visible');
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    // Fill progress smoothly
    const t1 = setTimeout(() => setProgress(60), 200);
    const t2 = setTimeout(() => setProgress(100), 550);

    // Fade out stage
    const t3 = setTimeout(() => {
      setStage('fading');
    }, 750);

    // Complete & hide
    const t4 = setTimeout(() => {
      setStage('hidden');
      onComplete?.();
    }, 1150);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  if (stage === 'hidden') return null;

  return (
    <div
      onClick={() => {
        setStage('hidden');
        onComplete?.();
      }}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 text-white cursor-pointer select-none transition-all duration-400 ease-out ${
        stage === 'fading' ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Ambient background glow */}
      <div className="absolute w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute w-48 h-48 rounded-full bg-teal-500/10 blur-2xl pointer-events-none -top-10" />

      {/* Main emblem */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-400 p-0.5 shadow-2xl shadow-emerald-500/30 flex items-center justify-center transform transition-transform hover:scale-105">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <span className="text-4xl select-none animate-bounce">🥑</span>
            </div>
          </div>

          {/* Micro pulsing ring */}
          <div className="absolute -inset-1 rounded-[28px] border border-emerald-500/40 animate-ping pointer-events-none opacity-40" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
          <span>NutriAI</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
        </h1>

        <p className="text-xs text-slate-400 font-medium mt-1 tracking-wide">
          Your Daily Nutrition & Calorie Companion
        </p>

        {/* Athletic Pill Progress Bar */}
        <div className="w-40 h-1.5 bg-slate-800/90 rounded-full overflow-hidden mt-6 border border-slate-700/50 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 rounded-full transition-all duration-500 ease-out shadow-sm shadow-emerald-400/50"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Quick hint */}
        <span className="text-[10px] text-slate-500 font-medium mt-3 tracking-tight">
          Tap anywhere to skip
        </span>
      </div>
    </div>
  );
};
