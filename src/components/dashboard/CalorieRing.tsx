'use client';

import React from 'react';
import { UserProfile } from '@/types';

interface CalorieRingProps {
  consumed: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  profile: UserProfile;
}

export const CalorieRing: React.FC<CalorieRingProps> = ({ consumed, profile }) => {
  const target = profile.targetCalories;
  const remaining = target - consumed.calories;
  const percent = Math.min(100, Math.round((consumed.calories / target) * 100));

  // SVG Circular progress math
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  // Macros calculations
  const proteinPercent = Math.min(100, Math.round((consumed.protein / (profile.targetProteinG || 1)) * 100));
  const carbsPercent = Math.min(100, Math.round((consumed.carbs / (profile.targetCarbsG || 1)) * 100));
  const fatPercent = Math.min(100, Math.round((consumed.fat / (profile.targetFatG || 1)) * 100));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
      <div className="flex flex-col items-center">
        {/* Circular Progress Ring */}
        <div className="relative flex items-center justify-center">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              className="text-slate-100 dark:text-slate-800"
            />
            {/* Animated Progress */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#calorieGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>

          {/* Inner Text */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {remaining > 0 ? remaining : 0}
            </span>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {remaining >= 0 ? 'kcal left' : 'kcal over'}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              Target: {target}
            </span>
          </div>
        </div>

        {/* Consumed / Burned Subtitle */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
          <div>
            <div className="text-xs text-slate-400 dark:text-slate-500">Consumed</div>
            <div className="text-base font-bold text-slate-800 dark:text-slate-200">
              {consumed.calories} <span className="text-xs font-normal text-slate-400">kcal</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 dark:text-slate-500">Status</div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {remaining >= 0 ? '🔥 Fat Loss Pace' : '⚠️ Over Budget'}
            </div>
          </div>
        </div>

        {/* Macro Progress Bars */}
        <div className="w-full mt-4 space-y-2.5">
          {/* Protein */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                Protein
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {consumed.protein}g <span className="text-slate-400 font-normal">/ {profile.targetProteinG}g</span>
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${proteinPercent}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                Carbs
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {consumed.carbs}g <span className="text-slate-400 font-normal">/ {profile.targetCarbsG}g</span>
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{ width: `${carbsPercent}%` }}
              />
            </div>
          </div>

          {/* Fats */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span>
                Fats
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {consumed.fat}g <span className="text-slate-400 font-normal">/ {profile.targetFatG}g</span>
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-purple-500 transition-all duration-500"
                style={{ width: `${fatPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
