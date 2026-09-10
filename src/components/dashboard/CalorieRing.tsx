'use client';

import React from 'react';
import { UserProfile } from '@/types';
import { Flame, Zap } from 'lucide-react';

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
  const target = profile.targetCalories || 2000;
  const remaining = target - consumed.calories;
  const percent = Math.min(100, Math.round((consumed.calories / target) * 100));

  // Circular progress math (compact & catchy)
  const size = 104;
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  // Macro percentages
  const proteinTarget = profile.targetProteinG || 140;
  const carbsTarget = profile.targetCarbsG || 180;
  const fatTarget = profile.targetFatG || 50;

  const proteinPercent = Math.min(100, Math.round((consumed.protein / proteinTarget) * 100));
  const carbsPercent = Math.min(100, Math.round((consumed.carbs / carbsTarget) * 100));
  const fatPercent = Math.min(100, Math.round((consumed.fat / fatTarget) * 100));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm transition-all">
      {/* Top Section: Hero numbers + Compact Radial Progress */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Calorie Target
            </span>
            {profile.goal === 'muscle_gain' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300">
                💪 Muscle Building
              </span>
            )}
            {profile.goal === 'weight_gain' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300">
                📈 Weight Gain
              </span>
            )}
            {profile.goal === 'fat_loss' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                🔥 Fat Loss
              </span>
            )}
            {profile.goal === 'maintenance' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300">
                ⚖️ Maintenance
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {consumed.calories.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
              / {target.toLocaleString()} kcal
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {remaining >= 0 ? (
                <>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {remaining.toLocaleString()} kcal
                  </strong>{' '}
                  left
                </>
              ) : (
                <>
                  <strong className="text-rose-600 dark:text-rose-400 font-bold">
                    {Math.abs(remaining).toLocaleString()} kcal
                  </strong>{' '}
                  over budget
                </>
              )}
            </span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
              remaining >= 0
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                : (profile.goal === 'muscle_gain' || profile.goal === 'weight_gain')
                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
            }`}>
              <Flame className="w-2.5 h-2.5" />
              {remaining >= 0
                ? `${percent}% eaten`
                : (profile.goal === 'muscle_gain' || profile.goal === 'weight_gain')
                ? 'Surplus Reached'
                : 'Over Target'}
            </span>
          </div>
        </div>

        {/* Catchy Radial Progress Ring */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              className="text-slate-100 dark:text-slate-800"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#calorieHeroGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="calorieHeroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-base font-black text-slate-900 dark:text-white leading-none">
              {percent}%
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
              Goal
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section: 3 Catchy Macro Pill Cards */}
      <div className="grid grid-cols-3 gap-2.5 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        {/* Protein Card */}
        <div className="bg-blue-50/70 dark:bg-blue-950/30 rounded-2xl p-2.5 border border-blue-100/60 dark:border-blue-900/30">
          <div className="flex items-center justify-between text-[10px] font-bold text-blue-700 dark:text-blue-300 mb-1">
            <span>Protein</span>
            <span>{proteinPercent}%</span>
          </div>
          <div className="text-xs font-black text-slate-900 dark:text-white">
            {consumed.protein}g
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mb-1.5">
            / {proteinTarget}g
          </div>
          <div className="w-full h-1.5 rounded-full bg-blue-200/50 dark:bg-blue-900/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${proteinPercent}%` }}
            />
          </div>
        </div>

        {/* Carbs Card */}
        <div className="bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl p-2.5 border border-amber-100/60 dark:border-amber-900/30">
          <div className="flex items-center justify-between text-[10px] font-bold text-amber-700 dark:text-amber-300 mb-1">
            <span>Carbs</span>
            <span>{carbsPercent}%</span>
          </div>
          <div className="text-xs font-black text-slate-900 dark:text-white">
            {consumed.carbs}g
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mb-1.5">
            / {carbsTarget}g
          </div>
          <div className="w-full h-1.5 rounded-full bg-amber-200/50 dark:bg-amber-900/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-500"
              style={{ width: `${carbsPercent}%` }}
            />
          </div>
        </div>

        {/* Fat Card */}
        <div className="bg-purple-50/70 dark:bg-purple-950/30 rounded-2xl p-2.5 border border-purple-100/60 dark:border-purple-900/30">
          <div className="flex items-center justify-between text-[10px] font-bold text-purple-700 dark:text-purple-300 mb-1">
            <span>Fats</span>
            <span>{fatPercent}%</span>
          </div>
          <div className="text-xs font-black text-slate-900 dark:text-white">
            {consumed.fat}g
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mb-1.5">
            / {fatTarget}g
          </div>
          <div className="w-full h-1.5 rounded-full bg-purple-200/50 dark:bg-purple-900/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-purple-500 transition-all duration-500"
              style={{ width: `${fatPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
