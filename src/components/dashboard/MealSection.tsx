'use client';

import React, { useState } from 'react';
import { MealType, MealLog } from '@/types';
import { Plus, ChevronDown, ChevronUp, Trash2, Sparkles } from 'lucide-react';

interface MealSectionProps {
  meals: MealLog[];
  onOpenLoggerForMeal: (mealType: MealType) => void;
  onDeleteMealItem: (mealId: string, itemId: string) => void;
}

const MEAL_CONFIG: Record<MealType, { label: string; icon: string; timeRecommendation: string }> = {
  breakfast: { label: 'Breakfast', icon: '🌅', timeRecommendation: 'Recommended: 8:00 - 9:30 AM' },
  lunch: { label: 'Lunch', icon: '☀️', timeRecommendation: 'Recommended: 1:00 - 2:30 PM' },
  dinner: { label: 'Dinner', icon: '🌆', timeRecommendation: 'Recommended: 8:00 - 9:00 PM' },
  snack: { label: 'Snacks', icon: '🍎', timeRecommendation: 'Recommended: 4:30 - 6:00 PM' },
};

export const MealSection: React.FC<MealSectionProps> = ({
  meals,
  onOpenLoggerForMeal,
  onDeleteMealItem,
}) => {
  const [expandedMeal, setExpandedMeal] = useState<MealType | null>('breakfast');

  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Today's Meals</h2>
        <span className="text-xs text-slate-400">Tap + to log with AI</span>
      </div>

      {mealTypes.map((type) => {
        const config = MEAL_CONFIG[type];
        const mealLogs = meals.filter((m) => m.mealType === type);
        const totalCals = mealLogs.reduce((acc, m) => acc + m.totalCalories, 0);
        const totalProtein = mealLogs.reduce((acc, m) => acc + m.totalProtein, 0);
        const allItems = mealLogs.flatMap((m) => m.items.map((it) => ({ ...it, parentMealId: m.id })));
        const isExpanded = expandedMeal === type;

        return (
          <div
            key={type}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden transition-all duration-200"
          >
            {/* Header / Summary */}
            <div
              className="p-3.5 flex items-center justify-between cursor-pointer select-none"
              onClick={() => setExpandedMeal(isExpanded ? null : type)}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{config.icon}</span>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {config.label}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {allItems.length > 0 ? (
                      <span>
                        {allItems.length} {allItems.length === 1 ? 'item' : 'items'} •{' '}
                        <strong className="font-semibold text-blue-600 dark:text-blue-400">
                          {totalProtein}g protein
                        </strong>
                      </span>
                    ) : (
                      config.timeRecommendation
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {totalCals}
                  </span>
                  <span className="text-[10px] text-slate-400 block -mt-0.5">kcal</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenLoggerForMeal(type);
                  }}
                  className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 flex items-center justify-center transition-colors active:scale-95"
                  title="Log food with AI"
                >
                  <Plus className="w-4 h-4" />
                </button>

                <div className="text-slate-400 ml-0.5">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </div>

            {/* Expanded Item List */}
            {isExpanded && (
              <div className="border-t border-slate-50 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 p-3 pt-2">
                {allItems.length === 0 ? (
                  <div className="py-4 text-center">
                    <p className="text-xs text-slate-400 mb-2">No food logged yet for {config.label.toLowerCase()}</p>
                    <button
                      onClick={() => onOpenLoggerForMeal(type)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs transition-transform active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Log with AI
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {allItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white dark:bg-slate-900 rounded-xl p-2.5 flex items-center justify-between border border-slate-100 dark:border-slate-800 text-xs shadow-xs"
                      >
                        <div className="pr-2 flex-1 min-w-0">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {item.portionDescription} ({item.weightG}g)
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                            <span className="text-blue-600 dark:text-blue-400 font-medium">P: {item.proteinG}g</span>
                            <span>•</span>
                            <span className="text-amber-600 dark:text-amber-400 font-medium">C: {item.carbsG}g</span>
                            <span>•</span>
                            <span className="text-purple-600 dark:text-purple-400 font-medium">F: {item.fatG}g</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {item.calories}
                            </span>
                            <span className="text-[10px] text-slate-400 block -mt-0.5">kcal</span>
                          </div>
                          <button
                            onClick={() => onDeleteMealItem(item.parentMealId, item.id)}
                            className="p-1.5 text-slate-300 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Delete item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => onOpenLoggerForMeal(type)}
                        className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add more to {config.label}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
