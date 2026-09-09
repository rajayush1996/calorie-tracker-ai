'use client';

import React, { useState, useEffect } from 'react';
import { DailyLog, UserProfile, DailyAudit } from '@/types';
import { generateDailyAudit } from '@/services/aiService';
import { formatDateDisplay, isToday, isYesterday } from '@/utils/dateUtils';
import { Moon, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Trophy } from 'lucide-react';

interface DailyAuditTabProps {
  dailyLog: DailyLog;
  userProfile: UserProfile;
  onSaveAudit: (audit: DailyAudit) => void;
}

export const DailyAuditTab: React.FC<DailyAuditTabProps> = ({
  dailyLog,
  userProfile,
  onSaveAudit,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentAudit, setCurrentAudit] = useState<DailyAudit | null>(dailyLog.audit || null);

  // Sync state whenever selected date or log's audit changes
  useEffect(() => {
    setCurrentAudit(dailyLog.audit || null);
  }, [dailyLog.date, dailyLog.audit]);

  const isSelectedDateToday = isToday(dailyLog.date);
  const dateLabel = isSelectedDateToday
    ? 'Today'
    : isYesterday(dailyLog.date)
    ? 'Yesterday'
    : formatDateDisplay(dailyLog.date);

  const totalCalories = (dailyLog.meals || []).reduce((sum, m) => sum + m.totalCalories, 0);
  const totalProtein = (dailyLog.meals || []).reduce((sum, m) => sum + m.totalProtein, 0);
  const totalCarbs = (dailyLog.meals || []).reduce((sum, m) => sum + m.totalCarbs, 0);
  const totalFat = (dailyLog.meals || []).reduce((sum, m) => sum + m.totalFat, 0);

  const handleRunAudit = async () => {
    setIsLoading(true);
    try {
      const audit = await generateDailyAudit({
        dailyLog,
        userProfile,
        apiKey: userProfile.apiKey,
      });
      setCurrentAudit(audit);
      onSaveAudit(audit);
    } catch (err) {
      console.error('Failed to run daily audit', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            <Moon className="w-4 h-4" />
            <span>Daily AI Nutritional Audit</span>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
            {dateLabel}
          </span>
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          Review & Mistake Analyzer
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          The AI analyzes everything you logged on <strong>{dateLabel}</strong>, detects macro drift, celebrates wins, and provides an actionable game plan.
        </p>

        {currentAudit && (
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-3 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200/50 dark:border-emerald-800/40">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>AI Report Preserved for {dateLabel} • Score: {currentAudit.scoreOutOf10}/10</span>
          </div>
        )}

        {/* Quick intake summary */}
        <div className="grid grid-cols-4 gap-2 my-3 text-center">
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Calories</div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {totalCalories}
            </div>
            <div className="text-[10px] text-slate-400">/ {userProfile.targetCalories}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Protein</div>
            <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {totalProtein}g
            </div>
            <div className="text-[10px] text-slate-400">/ {userProfile.targetProteinG}g</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Carbs</div>
            <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
              {totalCarbs}g
            </div>
            <div className="text-[10px] text-slate-400">/ {userProfile.targetCarbsG}g</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Fats</div>
            <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
              {totalFat}g
            </div>
            <div className="text-[10px] text-slate-400">/ {userProfile.targetFatG}g</div>
          </div>
        </div>

        <button
          onClick={handleRunAudit}
          disabled={isLoading}
          className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 transition-all"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Auditing {dateLabel}&apos;s Nutrition...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {currentAudit ? `Re-Analyze ${dateLabel} with AI` : `Run AI Audit for ${dateLabel}`}
            </>
          )}
        </button>
      </div>

      {/* Audit Result Display */}
      {currentAudit && (
        <div className="space-y-3">
          {/* Score Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-5 shadow-sm border border-indigo-800/50">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-300">
                  Daily Nutrition Score
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-4xl font-black">{currentAudit.scoreOutOf10}</span>
                  <span className="text-sm text-indigo-300">/ 10</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-2xl">
                🏆
              </div>
            </div>

            <p className="text-xs text-indigo-100/90 mt-3 pt-3 border-t border-white/10 italic">
              "{currentAudit.coachSummary}"
            </p>
          </div>

          {/* Wins Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-2.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>What Went Well (Wins)</span>
            </div>
            <ul className="space-y-2">
              {currentAudit.wins.map((win, idx) => (
                <li
                  key={idx}
                  className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-100/60 dark:border-emerald-900/30"
                >
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{win}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mistakes Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm mb-2.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Mistakes & What Went Wrong</span>
            </div>
            <ul className="space-y-2">
              {currentAudit.mistakes.map((mistake, idx) => (
                <li
                  key={idx}
                  className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 bg-rose-50/50 dark:bg-rose-950/20 p-2.5 rounded-xl border border-rose-100/60 dark:border-rose-900/30"
                >
                  <span className="text-rose-500 font-bold">!</span>
                  <span>{mistake}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Plan for Tomorrow */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm mb-2.5">
              <ArrowRight className="w-4 h-4" />
              <span>Actionable Game Plan for Tomorrow</span>
            </div>
            <ul className="space-y-2">
              {currentAudit.tomorrowActionPlan.map((action, idx) => (
                <li
                  key={idx}
                  className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5 bg-blue-50/50 dark:bg-blue-950/20 p-2.5 rounded-xl border border-blue-100/60 dark:border-blue-900/30"
                >
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
