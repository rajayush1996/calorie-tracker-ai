'use client';

import React from 'react';
import { FoodItem, MealType } from '@/types';
import { Plus, Zap } from 'lucide-react';

interface QuickFoodShortcutsProps {
  onQuickAdd: (item: FoodItem, targetMeal: MealType) => void;
  currentMealType?: MealType;
}

const FREQUENT_FOODS: Array<{
  name: string;
  emoji: string;
  portion: string;
  weightG: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  defaultMeal: MealType;
}> = [
  {
    name: '2 Whole Wheat Roti',
    emoji: '🫓',
    portion: '2 standard rotis',
    weightG: 80,
    calories: 160,
    proteinG: 5.5,
    carbsG: 32,
    fatG: 1.2,
    fiberG: 4,
    defaultMeal: 'lunch',
  },
  {
    name: '1 Cup Milk Chai',
    emoji: '☕',
    portion: '1 regular cup with milk & 1 tsp sugar',
    weightG: 150,
    calories: 85,
    proteinG: 2.2,
    carbsG: 12,
    fatG: 3,
    fiberG: 0,
    defaultMeal: 'snack',
  },
  {
    name: '1 Scoop Whey Protein',
    emoji: '🥤',
    portion: '1 scoop (30g) in water',
    weightG: 30,
    calories: 120,
    proteinG: 24,
    carbsG: 2.5,
    fatG: 1.5,
    fiberG: 0.5,
    defaultMeal: 'snack',
  },
  {
    name: '2 Boiled Eggs',
    emoji: '🥚',
    portion: '2 large whole boiled eggs',
    weightG: 100,
    calories: 140,
    proteinG: 12.6,
    carbsG: 1.1,
    fatG: 9.8,
    fiberG: 0,
    defaultMeal: 'breakfast',
  },
  {
    name: '1 Medium Banana',
    emoji: '🍌',
    portion: '1 medium fresh banana',
    weightG: 118,
    calories: 105,
    proteinG: 1.3,
    carbsG: 27,
    fatG: 0.3,
    fiberG: 3.1,
    defaultMeal: 'snack',
  },
  {
    name: 'Dal & Steamed Rice',
    emoji: '🍲',
    portion: '1 small katori dal + 1 cup rice',
    weightG: 250,
    calories: 320,
    proteinG: 10.5,
    carbsG: 58,
    fatG: 4.5,
    fiberG: 4.2,
    defaultMeal: 'lunch',
  },
  {
    name: '100g Low-Fat Paneer',
    emoji: '🧀',
    portion: '100g raw paneer cubes',
    weightG: 100,
    calories: 265,
    proteinG: 18.5,
    carbsG: 5.5,
    fatG: 19,
    fiberG: 0,
    defaultMeal: 'dinner',
  },
  {
    name: '150g Grilled Chicken Breast',
    emoji: '🍗',
    portion: '150g boneless grilled chicken',
    weightG: 150,
    calories: 220,
    proteinG: 38,
    carbsG: 0,
    fatG: 4.5,
    fiberG: 0,
    defaultMeal: 'lunch',
  },
];

export const QuickFoodShortcuts: React.FC<QuickFoodShortcutsProps> = ({
  onQuickAdd,
  currentMealType = 'lunch',
}) => {
  const handleItemClick = (food: (typeof FREQUENT_FOODS)[0]) => {
    const item: FoodItem = {
      id: `quick-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: food.name,
      quantity: 1,
      unit: 'serving',
      portionDescription: food.portion,
      weightG: food.weightG,
      calories: food.calories,
      proteinG: food.proteinG,
      carbsG: food.carbsG,
      fatG: food.fatG,
      fiberG: food.fiberG,
      confidence: 'high',
    };
    onQuickAdd(item, currentMealType || food.defaultMeal);
  };

  return (
    <div className="pt-2">
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span className="text-xs font-black text-slate-900 dark:text-white">
            Quick 1-Tap Foods
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">Frequent shortcuts</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar">
        {FREQUENT_FOODS.map((food, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleItemClick(food)}
            className="flex-shrink-0 p-2.5 bg-white dark:bg-slate-900 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-left transition-all active:scale-95 group shadow-2xs w-36"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xl">{food.emoji}</span>
              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center transition-colors">
                <Plus className="w-3 h-3 stroke-[2.5]" />
              </span>
            </div>
            <h4 className="text-[11px] font-bold text-slate-900 dark:text-slate-100 leading-tight truncate">
              {food.name}
            </h4>
            <div className="flex items-center justify-between mt-1 text-[10px]">
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                {food.calories} kcal
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                {food.proteinG}g P
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
