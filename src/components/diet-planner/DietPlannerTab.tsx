'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, DietType, DietPlan, MealLog } from '@/types';
import { generateDietPlan } from '@/services/aiService';
import { loadActiveDietPlan, saveActiveDietPlan } from '@/utils/storage';
import { UtensilsCrossed, Sparkles, Clock, Check, RefreshCw, Flame, ShoppingBag, Plus } from 'lucide-react';

interface DietPlannerTabProps {
  userProfile: UserProfile;
  onLogMealDirectly: (meal: MealLog) => void;
}

const COMMON_PANTRY_TAGS = [
  'Eggs',
  'Rolled Oats',
  'Paneer',
  'Chicken Breast',
  'Toor/Moong Dal',
  'White/Brown Rice',
  'Curd / Dahi',
  'Brown Bread',
  'Peanut Butter',
  'Apples & Bananas',
  'Soya Chunks',
  'Whey Protein',
  'Green Salad & Cucumbers',
];

export const DietPlannerTab: React.FC<DietPlannerTabProps> = ({
  userProfile,
  onLogMealDirectly,
}) => {
  const [dietType, setDietType] = useState<DietType>('veg');
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Rolled Oats',
    'Paneer',
    'Toor/Moong Dal',
    'White/Brown Rice',
    'Curd / Dahi',
    'Apples & Bananas',
  ]);
  const [customPantry, setCustomPantry] = useState('');
  const [scheduleText, setScheduleText] = useState(
    'Breakfast: 8:30 AM, Lunch: 1:30 PM, Evening Snack: 5:00 PM, Dinner: 8:30 PM'
  );
  const [activePlan, setActivePlan] = useState<DietPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loggedMeals, setLoggedMeals] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = loadActiveDietPlan();
    if (saved) {
      setActivePlan(saved);
      setDietType(saved.dietType);
    }
  }, []);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const combinedPantry = [
        ...selectedTags,
        ...customPantry.split(',').map((s) => s.trim()).filter(Boolean),
      ].join(', ');

      const plan = await generateDietPlan({
        dietType,
        pantryText: combinedPantry,
        scheduleText,
        targetCalories: userProfile.targetCalories,
        targetProteinG: userProfile.targetProteinG,
        goal: userProfile.goal,
        apiKey: userProfile.apiKey,
      });

      setActivePlan(plan);
      saveActiveDietPlan(plan);
    } catch (err) {
      console.error('Failed to generate diet plan', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLog = (mealIndex: number) => {
    if (!activePlan || !activePlan.meals[mealIndex]) return;
    const pm = activePlan.meals[mealIndex];

    const newMeal: MealLog = {
      id: `planned-${Date.now()}-${mealIndex}`,
      date: new Date().toISOString().split('T')[0],
      mealType: pm.mealType,
      items: pm.items.map((it, idx) => ({
        id: `item-plan-${Date.now()}-${idx}`,
        name: it.name,
        quantity: 1,
        unit: 'portion',
        portionDescription: it.portion,
        weightG: 100,
        calories: it.calories,
        proteinG: it.proteinG,
        carbsG: it.carbsG,
        fatG: it.fatG,
        fiberG: 3,
        confidence: 'high',
      })),
      totalCalories: pm.totalCalories,
      totalProtein: pm.proteinG,
      totalCarbs: pm.items.reduce((s, it) => s + it.carbsG, 0),
      totalFat: pm.items.reduce((s, it) => s + it.fatG, 0),
      rawInput: `Logged from AI Diet Plan: ${pm.title}`,
      createdAt: new Date().toISOString(),
    };

    onLogMealDirectly(newMeal);
    setLoggedMeals((prev) => ({ ...prev, [mealIndex]: true }));
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-1">
          <UtensilsCrossed className="w-4 h-4" />
          <span>Personalized AI Diet Planner</span>
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          Tailored to Your Kitchen & Schedule
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          No unrealistic meal plans. Tell the AI what you already have in your kitchen, your preferred eating times, and it will calculate exact portions to hit your {userProfile.goal.replace('_', ' ')} targets.
        </p>

        {/* Diet Type Selector */}
        <div className="mt-4">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
            1. Your Diet Preference:
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'veg', label: 'Vegetarian 🥦' },
              { id: 'non_veg', label: 'Non-Vegetarian 🍗' },
              { id: 'eggetarian', label: 'Eggetarian 🥚' },
              { id: 'vegan', label: 'Vegan 🌱' },
              { id: 'jain', label: 'Jain 🥗' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDietType(d.id as DietType)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  dietType === d.id
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pantry Tags */}
        <div className="mt-4">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
            2. Foods & Groceries You Have Access To:
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {COMMON_PANTRY_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {tag}
                </button>
              );
            })}
          </div>

          <input
            type="text"
            value={customPantry}
            onChange={(e) => setCustomPantry(e.target.value)}
            placeholder="Add any extra ingredients you have (e.g. Rajma, Chia seeds, Soya chunks)..."
            className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        {/* Schedule & Timings */}
        <div className="mt-4">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            3. Meal Timings & Schedule:
          </label>
          <input
            type="text"
            value={scheduleText}
            onChange={(e) => setScheduleText(e.target.value)}
            placeholder="e.g. Breakfast 8:30 AM, Lunch 1:30 PM, Snack 5 PM, Dinner 8:30 PM"
            className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        {/* Target Indicator & Generate Button */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs">
            <span className="text-slate-400">Target Budget: </span>
            <strong className="font-bold text-slate-800 dark:text-slate-200">
              {userProfile.targetCalories} kcal
            </strong>{' '}
            •{' '}
            <strong className="font-bold text-blue-600 dark:text-blue-400">
              {userProfile.targetProteinG}g protein
            </strong>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 active:scale-95 disabled:opacity-50 transition-all"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Generating Plan...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Generate AI Diet Plan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Diet Plan Display */}
      {activePlan && (
        <div className="space-y-3">
          {/* Plan Summary Card */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/30 dark:to-teal-950/20 rounded-3xl p-4 border border-emerald-200/60 dark:border-emerald-800/40">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Active Fat-Loss Blueprint
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <Flame className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                <span>~{activePlan.projectedWeeklyFatLossKg} kg fat loss / week</span>
              </div>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              {activePlan.summaryNotes}
            </p>
          </div>

          {/* Planned Meals List */}
          {activePlan.meals.map((meal, idx) => {
            const isAlreadyLogged = loggedMeals[idx];
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {meal.time}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {meal.title}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                      {meal.totalCalories} kcal
                    </span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 block -mt-0.5 font-semibold">
                      {meal.proteinG}g protein
                    </span>
                  </div>
                </div>

                {/* Items & Portions */}
                <div className="space-y-1.5">
                  {meal.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/40"
                    >
                      <div>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-slate-400 ml-1.5">
                          ({item.portion})
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        {item.calories} kcal • {item.proteinG}g P
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coach Tip */}
                {meal.tips && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-emerald-50/50 dark:bg-emerald-950/30 p-2 rounded-xl flex items-start gap-1.5">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 shrink-0">💡 Tip:</span>
                    <span>{meal.tips}</span>
                  </div>
                )}

                {/* Log meal shortcut */}
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => handleQuickLog(idx)}
                    disabled={isAlreadyLogged}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all ${
                      isAlreadyLogged
                        ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 active:scale-95'
                    }`}
                  >
                    {isAlreadyLogged ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Logged to Today
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> Log this meal
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
