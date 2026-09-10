'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, DietType, DietPlan, MealLog } from '@/types';
import { generateDietPlan, parseDietDocument } from '@/services/aiService';
import { loadActiveDietPlan, saveActiveDietPlan } from '@/utils/storage';
import {
  UtensilsCrossed,
  Clock,
  Check,
  RefreshCw,
  Flame,
  ShoppingBag,
  Plus,
  FileUp,
  RotateCcw,
  AlertCircle,
  ChefHat,
} from 'lucide-react';

interface DietPlannerTabProps {
  userProfile: UserProfile;
  onLogMealDirectly: (meal: MealLog) => void;
  defaultMode?: 'pantry' | 'upload';
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
  defaultMode = 'pantry',
}) => {
  const [planMode, setPlanMode] = useState<'pantry' | 'upload'>(defaultMode);
  const [dietType, setDietType] = useState<DietType>(userProfile.dietType || 'veg');
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
    'Meal 1: 11:30 AM, Meal 2: 4:00 PM, Meal 3: 8:30 PM'
  );
  const [uploadText, setUploadText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [activePlan, setActivePlan] = useState<DietPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loggedMeals, setLoggedMeals] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleGeneratePantryPlan = async () => {
    setIsLoading(true);
    setErrorMessage(null);
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
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate meal plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();

    // If text file
    if (file.type.includes('text') || file.name.endsWith('.txt')) {
      reader.onload = (event) => {
        setUploadText(event.target?.result as string);
      };
      reader.readAsText(file);
    } else {
      // For PDF / Images: read as data text representation
      reader.onload = (event) => {
        const textPreview = `Uploaded Diet Document: ${file.name} (Size: ${(file.size / 1024).toFixed(1)} KB)`;
        setUploadText(textPreview);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImportUploadedDiet = async () => {
    if (!uploadText.trim()) {
      setErrorMessage('Please upload a file or paste your diet chart text first.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const plan = await parseDietDocument({
        fileText: uploadText,
        fileName: uploadedFileName || 'Diet Chart',
        targetCalories: userProfile.targetCalories,
        targetProteinG: userProfile.targetProteinG,
        apiKey: userProfile.apiKey,
        provider: userProfile.aiProvider,
      });

      setActivePlan(plan);
      saveActiveDietPlan(plan);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to import diet document');
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
        id: `item-${Date.now()}-${idx}`,
        name: it.name,
        quantity: 1,
        unit: 'serving',
        portionDescription: it.portion,
        weightG: 150,
        calories: it.calories,
        proteinG: it.proteinG,
        carbsG: it.carbsG,
        fatG: it.fatG,
        fiberG: 3,
        confidence: 'high',
      })),
      totalCalories: pm.totalCalories,
      totalProtein: pm.proteinG,
      totalCarbs: pm.items.reduce((s, it) => s + (it.carbsG || 0), 0),
      totalFat: pm.items.reduce((s, it) => s + (it.fatG || 0), 0),
      rawInput: `Plan: ${pm.title}`,
      createdAt: new Date().toISOString(),
    };

    onLogMealDirectly(newMeal);
    setLoggedMeals((prev) => ({ ...prev, [mealIndex]: true }));
  };

  const handleResetPlan = () => {
    setActivePlan(null);
    setLoggedMeals({});
    setUploadText('');
    setUploadedFileName(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nutriai_active_diet_plan');
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-1">
          <UtensilsCrossed className="w-4 h-4" />
          <span>Diet Plan</span>
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          Tailored to Your Kitchen & Schedule
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Create a meal plan using what you already have at home, or upload a diet chart you received from a trainer.
        </p>

        {/* Mode Switcher: Kitchen Pantry vs Upload Chart */}
        <div className="grid grid-cols-2 gap-2 mt-4 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80">
          <button
            type="button"
            onClick={() => setPlanMode('pantry')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              planMode === 'pantry'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5 text-emerald-500" />
            <span>From Kitchen Pantry</span>
          </button>
          <button
            type="button"
            onClick={() => setPlanMode('upload')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              planMode === 'upload'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileUp className="w-3.5 h-3.5 text-blue-500" />
            <span>Upload Diet Chart</span>
          </button>
        </div>

        {/* Mode 1: Kitchen Pantry Form */}
        {planMode === 'pantry' && (
          <div className="mt-4 space-y-4 pt-1">
            {/* Diet Type Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Diet Preference:
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
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                Select Foods You Have at Home:
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
                placeholder="Type extra ingredients (e.g. Rajma, Chia seeds, Soya chunks)..."
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            {/* Meal Timings (11 AM Late Riser friendly default) */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Your Eating Schedule:
              </label>
              <input
                type="text"
                value={scheduleText}
                onChange={(e) => setScheduleText(e.target.value)}
                placeholder="e.g. Meal 1: 11:30 AM, Meal 2: 4:00 PM, Meal 3: 8:30 PM"
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <button
              onClick={handleGeneratePantryPlan}
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-98 disabled:opacity-50 transition-all"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Plan from Your Kitchen...
                </>
              ) : (
                'Generate Meal Plan'
              )}
            </button>
          </div>
        )}

        {/* Mode 2: Upload Existing Diet Plan */}
        {planMode === 'upload' && (
          <div className="mt-4 space-y-4 pt-1">
            <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 text-center space-y-2">
              <FileUp className="w-6 h-6 text-blue-500 mx-auto" />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Upload PDF, Photo, or Screenshot of your Diet Chart
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Got a diet chart from your gym trainer or nutritionist? Upload it here.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-800 transition-colors"
                >
                  {uploadedFileName ? `Change File (${uploadedFileName})` : 'Choose Diet File (PDF/Image)'}
                </button>
              </div>
            </div>

            {/* Paste or Extracted Text */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Or Paste Diet Chart Text:
              </label>
              <textarea
                value={uploadText}
                onChange={(e) => setUploadText(e.target.value)}
                placeholder="Paste your diet instructions or meal chart text here..."
                rows={4}
                className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              />
            </div>

            <button
              onClick={handleImportUploadedDiet}
              disabled={isLoading || !uploadText.trim()}
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-98 disabled:opacity-50 transition-all"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Importing & Organizing Meals...
                </>
              ) : (
                'Import Diet Plan'
              )}
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Generated or Uploaded Plan Display */}
      {activePlan && (
        <div className="space-y-4">
          <div className="bg-emerald-50/80 dark:bg-emerald-950/40 p-4 rounded-3xl border border-emerald-200/80 dark:border-emerald-800/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                Active Daily Plan
              </span>
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                Target: {activePlan.targetCalories} kcal • {activePlan.targetProteinG}g protein
              </span>
            </div>
            <p className="text-xs text-emerald-900/90 dark:text-emerald-300/90 mt-1.5 leading-relaxed">
              {activePlan.summaryNotes}
            </p>
          </div>

          {/* Meals */}
          <div className="space-y-3">
            {activePlan.meals.map((meal, index) => {
              const isLogged = loggedMeals[index];
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                        <Clock className="w-3 h-3 text-slate-400" /> {meal.time}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white capitalize">
                        {meal.title}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {meal.totalCalories} kcal
                      </span>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 block font-bold">
                        {meal.proteinG}g protein
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {meal.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl"
                      >
                        <span className="font-semibold">{item.name}</span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <span>{item.portion}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {item.calories} kcal
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {meal.tips && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                      💡 {meal.tips}
                    </p>
                  )}

                  <div className="pt-1">
                    <button
                      onClick={() => handleQuickLog(index)}
                      disabled={isLogged}
                      className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        isLogged
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 cursor-default'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 active:scale-98'
                      }`}
                    >
                      {isLogged ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Logged to Today
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 text-emerald-500" /> Log This Meal to Today
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Discreet Reset Section Button */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleResetPlan}
              className="text-[11px] text-slate-400 hover:text-rose-500 underline inline-flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset active meal plan</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
