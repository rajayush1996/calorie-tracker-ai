'use client';

import React, { useState, useEffect } from 'react';
import { FoodItem, MealType } from '@/types';
import { X, Check, Trash2, Flame, Scale, Utensils } from 'lucide-react';

interface EditFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FoodItem | null;
  currentMealType?: MealType;
  onSave: (updatedItem: FoodItem, targetMealType?: MealType) => void;
  onDelete?: (itemId: string) => void;
}

const MEAL_OPTIONS: { id: MealType; label: string }[] = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snacks' },
  { id: 'meal_1', label: 'Meal 1 (First Meal / Brunch)' },
  { id: 'meal_2', label: 'Meal 2 (Afternoon)' },
  { id: 'meal_3', label: 'Meal 3 (Evening / Dinner)' },
  { id: 'meal_4', label: 'Meal 4 (Late Night)' },
];

export const EditFoodModal: React.FC<EditFoodModalProps> = ({
  isOpen,
  onClose,
  item,
  currentMealType = 'lunch',
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [portionDescription, setPortionDescription] = useState('');
  const [weightG, setWeightG] = useState<number | string>('');
  const [calories, setCalories] = useState<number | string>('');
  const [proteinG, setProteinG] = useState<number | string>('');
  const [carbsG, setCarbsG] = useState<number | string>('');
  const [fatG, setFatG] = useState<number | string>('');
  const [mealType, setMealType] = useState<MealType>(currentMealType);
  const [scaleMultiplier, setScaleMultiplier] = useState<number>(1);

  // Sync state when item or modal opens
  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setPortionDescription(item.portionDescription || `${item.quantity || 1} ${item.unit || 'serving'}`);
      setWeightG(item.weightG ?? 0);
      setCalories(item.calories ?? 0);
      setProteinG(item.proteinG ?? 0);
      setCarbsG(item.carbsG ?? 0);
      setFatG(item.fatG ?? 0);
      setMealType(currentMealType);
      setScaleMultiplier(1);
    }
  }, [item, currentMealType, isOpen]);

  if (!isOpen || !item) return null;

  // Quick portion multiplier (e.g. 0.5x, 1.5x, 2x)
  const applyMultiplier = (factor: number) => {
    if (!item) return;
    const baseCals = item.calories ?? 0;
    const baseP = item.proteinG ?? 0;
    const baseC = item.carbsG ?? 0;
    const baseF = item.fatG ?? 0;
    const baseW = item.weightG ?? 0;

    setScaleMultiplier(factor);
    setCalories(Math.round(baseCals * factor));
    setProteinG(Math.round(baseP * factor * 10) / 10);
    setCarbsG(Math.round(baseC * factor * 10) / 10);
    setFatG(Math.round(baseF * factor * 10) / 10);
    if (baseW > 0) {
      setWeightG(Math.round(baseW * factor));
    }
  };

  const handleSave = () => {
    if (!item) return;
    const parsedCalories = Math.max(0, Math.round(Number(calories) || 0));
    const parsedProtein = Math.max(0, Math.round((Number(proteinG) || 0) * 10) / 10);
    const parsedCarbs = Math.max(0, Math.round((Number(carbsG) || 0) * 10) / 10);
    const parsedFat = Math.max(0, Math.round((Number(fatG) || 0) * 10) / 10);
    const parsedWeight = Math.max(0, Math.round(Number(weightG) || 0));

    const updatedItem: FoodItem = {
      ...item,
      name: name.trim() || item.name,
      portionDescription: portionDescription.trim() || item.portionDescription,
      calories: parsedCalories,
      proteinG: parsedProtein,
      carbsG: parsedCarbs,
      fatG: parsedFat,
      weightG: parsedWeight,
    };

    onSave(updatedItem, mealType);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-100 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Edit Food Item
              </h3>
              <p className="text-[10px] text-slate-400">
                Adjust portion, calories, or macros
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4">
          {/* Quick Multiplier Pills */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-emerald-500" />
                <span>Quick Portion Adjust:</span>
              </span>
              <span className="text-[10px] text-slate-400">
                Current: {scaleMultiplier}x
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { factor: 0.5, label: '½ Half' },
                { factor: 1, label: '1x Normal' },
                { factor: 1.5, label: '1.5x' },
                { factor: 2, label: '2x Double' },
              ].map(({ factor, label }) => (
                <button
                  key={factor}
                  type="button"
                  onClick={() => applyMultiplier(factor)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    scaleMultiplier === factor
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Food Name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              Food / Dish Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 2 Whole Wheat Rotis"
              className="w-full h-10 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Meal Slot / Category */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              Meal Category
            </label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as MealType)}
              className="w-full h-10 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {MEAL_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Portion Description & Weight */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Portion Details
              </label>
              <input
                type="text"
                value={portionDescription}
                onChange={(e) => setPortionDescription(e.target.value)}
                placeholder="e.g. 2 pieces / 1 bowl"
                className="w-full h-10 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Weight (grams)
              </label>
              <input
                type="number"
                min="0"
                value={weightG}
                onChange={(e) => setWeightG(e.target.value)}
                placeholder="~ grams"
                className="w-full h-10 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          {/* Calories Highlight Card */}
          <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-emerald-600" />
                <span>Total Calories</span>
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-24 h-9 px-2.5 text-right font-black text-sm rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">kcal</span>
              </div>
            </div>
          </div>

          {/* Macro Breakdown Inputs */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              Macros (Grams)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase block mb-1">
                  Protein
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={proteinG}
                    onChange={(e) => setProteinG(e.target.value)}
                    className="w-full h-8 px-2 text-xs font-bold rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400">g</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase block mb-1">
                  Carbs
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={carbsG}
                    onChange={(e) => setCarbsG(e.target.value)}
                    className="w-full h-8 px-2 text-xs font-bold rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-slate-400">g</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
                <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase block mb-1">
                  Fat
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={fatG}
                    onChange={(e) => setFatG(e.target.value)}
                    className="w-full h-8 px-2 text-xs font-bold rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <span className="text-[10px] text-slate-400">g</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-900/50 sticky bottom-0">
          {onDelete ? (
            <button
              type="button"
              onClick={() => {
                onDelete(item.id);
                onClose();
              }}
              className="h-10 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 transition-colors active:scale-95"
              title="Delete this food item"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
