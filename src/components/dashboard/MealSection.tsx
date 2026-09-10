'use client';

import React, { useState } from 'react';
import { MealType, MealLog } from '@/types';
import { Plus, ChevronDown, ChevronUp, Trash2, Utensils, RotateCcw } from 'lucide-react';

interface MealSectionProps {
  meals: MealLog[];
  yesterdayMeals?: MealLog[];
  onOpenLoggerForMeal: (mealType: MealType) => void;
  onDeleteMealItem: (mealId: string, itemId: string) => void;
  onCopyYesterdayMeal?: (mealType: MealType) => void;
}

const MEAL_CONFIG: Record<MealType, { label: string; icon: string; subtitle: string }> = {
  breakfast: { label: 'Breakfast', icon: '🌅', subtitle: 'Morning fuel' },
  lunch: { label: 'Lunch', icon: '☀️', subtitle: 'Midday nutrition' },
  snack: { label: 'Snacks', icon: '🍎', subtitle: 'Energy boosts' },
  dinner: { label: 'Dinner', icon: '🌆', subtitle: 'Evening recovery' },
  meal_1: { label: 'Meal 1', icon: '🌅', subtitle: 'First meal / brunch' },
  meal_2: { label: 'Meal 2', icon: '☀️', subtitle: 'Midday nutrition' },
  meal_3: { label: 'Meal 3', icon: '🌆', subtitle: 'Evening recovery' },
  meal_4: { label: 'Meal 4', icon: '🌙', subtitle: 'Night sustenance' },
  meal_5: { label: 'Meal 5', icon: '🍇', subtitle: 'Late snack / night bite' },
};

export const MealSection: React.FC<MealSectionProps> = ({
  meals,
  yesterdayMeals = [],
  onOpenLoggerForMeal,
  onDeleteMealItem,
  onCopyYesterdayMeal,
}) => {
  const [expandedMeal, setExpandedMeal] = useState<MealType | null>(null);

  const loggedTypes = Array.from(new Set(meals.map((m) => m.mealType)));
  const hasNumberedMeals = loggedTypes.some((t) => t.startsWith('meal_'));
  const mealTypes: MealType[] = hasNumberedMeals
    ? Array.from(new Set([...loggedTypes, 'meal_1', 'meal_2', 'meal_3', 'snack']))
    : ['breakfast', 'lunch', 'snack', 'dinner'];
  const totalMealsLogged = meals.length;

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Utensils className="w-4 h-4 text-emerald-500" />
          <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
            Daily Meals
          </h2>
        </div>
        <span className="text-[11px] font-bold text-slate-400">
          {totalMealsLogged > 0 ? `${totalMealsLogged} logged` : 'Tap + to log'}
        </span>
      </div>

      {/* Empty State Banner if no meals logged */}
      {totalMealsLogged === 0 && (
        <div className="p-4 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 text-center space-y-1 py-4">
          <span className="text-2xl block select-none">🥗</span>
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-200">
            No meals logged yet today
          </h3>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
            Tap a meal below, snap a plate photo, or use 1-tap quick foods to start your day!
          </p>
        </div>
      )}

      {/* 4 Clean Meal Cards */}
      <div className="space-y-2.5">
        {mealTypes.map((type) => {
          const config = MEAL_CONFIG[type];
          const mealLogs = meals.filter((m) => m.mealType === type);
          const totalCals = mealLogs.reduce((acc, m) => acc + m.totalCalories, 0);
          const totalProtein = mealLogs.reduce((acc, m) => acc + m.totalProtein, 0);
          const totalCarbs = mealLogs.reduce((acc, m) => acc + m.totalCarbs, 0);
          const totalFat = mealLogs.reduce((acc, m) => acc + m.totalFat, 0);
          const allItems = mealLogs.flatMap((m) => m.items.map((it) => ({ ...it, parentMealId: m.id })));
          const hasItems = allItems.length > 0;
          const isExpanded = expandedMeal === type;
          const yMealLogs = yesterdayMeals.filter((m) => m.mealType === type);
          const canRepeatYesterday = yMealLogs.length > 0 && Boolean(onCopyYesterdayMeal);

          return (
            <div
              key={type}
              className={`rounded-2xl transition-all border ${
                hasItems
                  ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-2xs'
                  : 'bg-white/60 dark:bg-slate-900/40 border-slate-100/80 dark:border-slate-800/40'
              }`}
            >
              {/* Card Header */}
              <div
                className="p-3.5 flex items-center justify-between cursor-pointer select-none"
                onClick={() => hasItems && setExpandedMeal(isExpanded ? null : type)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl select-none">{config.icon}</span>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-slate-100">
                      {config.label}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      {hasItems ? (
                        <span>
                          {allItems.length} {allItems.length === 1 ? 'item' : 'items'} •{' '}
                          <strong className="text-blue-600 dark:text-blue-400 font-bold">{totalProtein}g P</strong>
                        </span>
                      ) : (
                        config.subtitle
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {hasItems ? (
                    <>
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {totalCals}
                        </span>
                        <span className="text-[9px] text-slate-400 block -mt-0.5">kcal</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenLoggerForMeal(type);
                        }}
                        className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 flex items-center justify-center transition-colors active:scale-95"
                        title="Add food"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      {canRepeatYesterday && (
                        <button
                          type="button"
                          onClick={() => onCopyYesterdayMeal?.(type)}
                          className="h-7 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-[11px] font-bold inline-flex items-center gap-1 transition-all active:scale-95"
                          title="Repeat yesterday's meal"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>Repeat</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onOpenLoggerForMeal(type)}
                        className="h-7 px-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 text-[11px] font-bold inline-flex items-center gap-1 transition-all active:scale-95"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Log</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Collapsed Preview Tags (if items present and not expanded) */}
              {hasItems && !isExpanded && (
                <div className="px-3.5 pb-3 flex flex-wrap gap-1">
                  {allItems.map((it) => (
                    <span
                      key={it.id}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800"
                    >
                      {it.name} <span className="text-slate-400 font-normal">({it.calories} kcal)</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Expanded Item List with Delete Options */}
              {hasItems && isExpanded && (
                <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-100 dark:border-slate-800/60 space-y-2">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Macro Breakdown:
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[10px] text-center bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl">
                    <div>
                      <span className="text-slate-400 block">Protein</span>
                      <strong className="text-blue-600 dark:text-blue-400 font-black">{totalProtein}g</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Carbs</span>
                      <strong className="text-amber-600 dark:text-amber-400 font-black">{totalCarbs}g</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Fat</span>
                      <strong className="text-purple-600 dark:text-purple-400 font-black">{totalFat}g</strong>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {allItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate">
                            {item.name}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {item.portionDescription || `${item.quantity} ${item.unit}`} • {item.calories} kcal
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onDeleteMealItem(item.parentMealId, item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
