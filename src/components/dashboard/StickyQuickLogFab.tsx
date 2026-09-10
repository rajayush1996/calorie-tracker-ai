'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Utensils, Droplets, Dumbbell, Check } from 'lucide-react';

interface StickyQuickLogFabProps {
  onOpenFoodLogger: () => void;
  onQuickLogWater: () => void;
  onOpenGymWorkout: () => void;
  currentWaterMl?: number;
}

export const StickyQuickLogFab: React.FC<StickyQuickLogFabProps> = ({
  onOpenFoodLogger,
  onQuickLogWater,
  onOpenGymWorkout,
  currentWaterMl = 0,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [waterLoggedToast, setWaterLoggedToast] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleWaterClick = () => {
    onQuickLogWater();
    setWaterLoggedToast(true);
    setTimeout(() => {
      setWaterLoggedToast(false);
      setIsOpen(false);
    }, 1200);
  };

  const handleFoodClick = () => {
    setIsOpen(false);
    onOpenFoodLogger();
  };

  const handleGymClick = () => {
    setIsOpen(false);
    onOpenGymWorkout();
  };

  return (
    <div
      ref={menuRef}
      className="fixed bottom-20 right-4 sm:right-[max(1rem,calc(50%-13rem+1rem))] z-40 flex flex-col items-end gap-2 pointer-events-auto"
    >
      {/* Backdrop overlay when open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs z-30 transition-opacity animate-in fade-in"
        />
      )}

      {/* Expanded Capsule Action Buttons */}
      {isOpen && (
        <div className="relative z-40 flex flex-col items-end gap-2 animate-in slide-in-from-bottom-3 fade-in duration-150 mb-1">
          {/* 1. Log Food / Meal Capsule */}
          <button
            type="button"
            onClick={handleFoodClick}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200/90 dark:border-slate-800 shadow-lg hover:border-emerald-500 active:scale-95 transition-all text-xs font-black group"
          >
            <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <Utensils className="w-3.5 h-3.5" />
            </div>
            <span>Log Food & Meals</span>
          </button>

          {/* 2. Log Water Capsule (+250ml) */}
          <button
            type="button"
            onClick={handleWaterClick}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200/90 dark:border-slate-800 shadow-lg hover:border-blue-500 active:scale-95 transition-all text-xs font-black group"
          >
            <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold group-hover:bg-blue-500 group-hover:text-white transition-colors">
              {waterLoggedToast ? (
                <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Droplets className="w-3.5 h-3.5" />
              )}
            </div>
            <span>
              {waterLoggedToast ? 'Added +250ml Water!' : 'Log Water (+250ml)'}
            </span>
          </button>

          {/* 3. Today's Gym Workout Capsule */}
          <button
            type="button"
            onClick={handleGymClick}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200/90 dark:border-slate-800 shadow-lg hover:border-amber-500 active:scale-95 transition-all text-xs font-black group"
          >
            <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Dumbbell className="w-3.5 h-3.5" />
            </div>
            <span>Today&apos;s Gym Workout</span>
          </button>
        </div>
      )}

      {/* Main Trigger Sticky Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close Quick Log Menu' : 'Open Quick Log Menu'}
        className={`relative z-40 h-12 px-4 rounded-full shadow-lg flex items-center gap-2 font-black text-xs text-white transition-all active:scale-95 ${
          isOpen
            ? 'bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600'
            : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25'
        }`}
      >
        <div
          className={`w-5 h-5 flex items-center justify-center transition-transform duration-200 ${
            isOpen ? 'rotate-90' : 'rotate-0'
          }`}
        >
          {isOpen ? <X className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4 stroke-[3]" />}
        </div>
        <span>{isOpen ? 'Close' : 'Quick Log'}</span>
      </button>
    </div>
  );
};
