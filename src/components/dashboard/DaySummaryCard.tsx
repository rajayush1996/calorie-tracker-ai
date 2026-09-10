'use client';

import React from 'react';
import { DailyLog, UserProfile, MealType } from '@/types';
import { Calendar, Flame, Droplets, Utensils, CheckCircle2, AlertCircle, Plus, Target } from 'lucide-react';
import { formatDateDisplay, isToday, isYesterday } from '@/utils/dateUtils';

interface DaySummaryCardProps {
  date: string;
  dailyLog: DailyLog;
  profile: UserProfile;
  onOpenLogger: (mealType?: MealType) => void;
  onOpenAudit?: () => void;
}

export const DaySummaryCard: React.FC<DaySummaryCardProps> = ({
  date,
  dailyLog,
  profile,
  onOpenLogger,
  onOpenAudit,
}) => {
  const meals = dailyLog.meals || [];
  const mealsCount = meals.length;

  const totalCalories = meals.reduce((sum, m) => sum + (m.totalCalories || 0), 0);
  const totalProtein = meals.reduce((sum, m) => sum + (m.totalProtein || 0), 0);
  const totalCarbs = meals.reduce((sum, m) => sum + (m.totalCarbs || 0), 0);
  const totalFat = meals.reduce((sum, m) => sum + (m.totalFat || 0), 0);
  const waterMl = dailyLog.waterConsumedMl || 0;

  const calTarget = profile.targetCalories || 2000;
  const proteinTarget = profile.targetProteinG || 140;
  const carbsTarget = profile.targetCarbsG || 180;
  const fatTarget = profile.targetFatG || 50;
  const waterTarget = profile.waterTargetMl || 2500;

  const calDiff = calTarget - totalCalories;
  const isSurplusGoal = profile.goal === 'muscle_gain' || profile.goal === 'weight_gain';

  const dateLabel = isToday(date)
    ? 'Today'
    : isYesterday(date)
    ? 'Yesterday'
    : formatDateDisplay(date);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
      {/* Header: Date + Status Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Day Summary
            </span>
            <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
              {dateLabel}
            </h3>
          </div>
        </div>

        {mealsCount > 0 ? (
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
              calDiff >= 0
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                : isSurplusGoal
                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300'
                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
            }`}
          >
            {calDiff >= 0 ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <AlertCircle className="w-3 h-3" />
            )}
            <span>
              {calDiff >= 0
                ? isSurplusGoal
                  ? `${calDiff} kcal to surplus`
                  : `${calDiff} kcal under budget`
                : `${Math.abs(calDiff)} kcal over`}
            </span>
          </span>
        ) : (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
            No entries yet
          </span>
        )}
      </div>

      {/* 4-Stat Totals Grid */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-2.5 border border-slate-100 dark:border-slate-800/60">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Calories</span>
          <span className="text-xs font-black text-slate-900 dark:text-white block mt-0.5">
            {totalCalories}
          </span>
          <span className="text-[9px] text-slate-400 block">/ {calTarget}</span>
        </div>

        <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl p-2.5 border border-blue-100/40 dark:border-blue-900/30">
          <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase block">Protein</span>
          <span className="text-xs font-black text-blue-950 dark:text-blue-200 block mt-0.5">
            {totalProtein}g
          </span>
          <span className="text-[9px] text-blue-400 block">/ {proteinTarget}g</span>
        </div>

        <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl p-2.5 border border-amber-100/40 dark:border-amber-900/30">
          <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase block">Carbs</span>
          <span className="text-xs font-black text-amber-950 dark:text-amber-200 block mt-0.5">
            {totalCarbs}g
          </span>
          <span className="text-[9px] text-amber-400 block">/ {carbsTarget}g</span>
        </div>

        <div className="bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl p-2.5 border border-purple-100/40 dark:border-purple-900/30">
          <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase block">Fats</span>
          <span className="text-xs font-black text-purple-950 dark:text-purple-200 block mt-0.5">
            {totalFat}g
          </span>
          <span className="text-[9px] text-purple-400 block">/ {fatTarget}g</span>
        </div>
      </div>

      {/* Active Workout Burn Badge */}
      {dailyLog.burnedCalories && dailyLog.burnedCalories > 0 ? (
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Active Workout Burn:</span>
          </div>
          <span className="font-black text-amber-600 dark:text-amber-400">
            ~{dailyLog.burnedCalories} kcal burned
          </span>
        </div>
      ) : null}

      {/* Preserved Daily Review Section for this Date */}
      {dailyLog.audit ? (
        <div className="p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-indigo-950 dark:text-indigo-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>Day Score: {dailyLog.audit.scoreOutOf10}/10</span>
            </div>
            {onOpenAudit && (
              <button
                type="button"
                onClick={onOpenAudit}
                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View Feedback ➔
              </button>
            )}
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            &ldquo;{dailyLog.audit.coachSummary}&rdquo;
          </p>
          {dailyLog.audit.tomorrowActionPlan && dailyLog.audit.tomorrowActionPlan.length > 0 && (
            <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5 pt-1 border-t border-indigo-100/60 dark:border-indigo-900/30">
              <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">Action Plan:</span>
              <span className="truncate">{dailyLog.audit.tomorrowActionPlan[0]}</span>
            </div>
          )}
        </div>
      ) : mealsCount > 0 && onOpenAudit ? (
        <div className="p-2.5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-900/30 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <Target className="w-3.5 h-3.5 text-indigo-500" />
            <span>Ready for your daily review?</span>
          </div>
          <button
            type="button"
            onClick={onOpenAudit}
            className="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] transition-colors"
          >
            Review Day
          </button>
        </div>
      ) : null}

      {/* Meals Logged on this Date or Quick Log Prompt */}
      {mealsCount > 0 ? (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Utensils className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              {mealsCount} {mealsCount === 1 ? 'meal' : 'meals'} logged • {waterMl}ml water
            </span>
          </div>
          <button
            type="button"
            onClick={() => onOpenLogger()}
            className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Add to this date</span>
          </button>
        </div>
      ) : (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            No food logged for {dateLabel}.
          </span>
          <button
            type="button"
            onClick={() => onOpenLogger()}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 active:scale-95 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Food</span>
          </button>
        </div>
      )}
    </div>
  );
};
