'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MealType, FoodItem, MealLog, UserProfile } from '@/types';
import { parseMealSentence, refineMealItems, parseMealImage } from '@/services/aiService';
import {
  Utensils,
  Camera,
  Check,
  AlertCircle,
  RefreshCw,
  Trash2,
  MessageSquareText,
  Calendar,
  X,
  RotateCcw,
} from 'lucide-react';
import { getTodayDateString, getYesterdayDateString } from '@/utils/dateUtils';

interface AILoggerTabProps {
  initialMealType?: MealType;
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  userProfile: UserProfile;
  onMealSaved: (meal: MealLog) => void;
  onOpenRescue?: (tab: 'craving' | 'cheat') => void;
}

export const AILoggerTab: React.FC<AILoggerTabProps> = ({
  initialMealType = 'lunch',
  selectedDate,
  onSelectDate,
  userProfile,
  onMealSaved,
  onOpenRescue,
}) => {
  const [logDate, setLogDate] = useState<string>(selectedDate || getTodayDateString());
  const [mealType, setMealType] = useState<MealType>(initialMealType);
  const [mealNamingMode, setMealNamingMode] = useState<'lifestyle' | 'classic'>('lifestyle');
  const [inputSentence, setInputSentence] = useState('');
  const [correctionSentence, setCorrectionSentence] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (selectedDate) {
      setLogDate(selectedDate);
    }
  }, [selectedDate]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result state
  const [parsedItems, setParsedItems] = useState<FoodItem[]>([]);
  const [assumptions, setAssumptions] = useState<string[]>([]);
  const [clarification, setClarification] = useState<string | null>(null);
  const [refineSummary, setRefineSummary] = useState<string | null>(null);
  const [lastLoggedMeal, setLastLoggedMeal] = useState<MealLog | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Single direct action: Log meal internally calculates and saves in 1 step!
  const handleDirectLog = async (sentenceToUse?: string) => {
    const text = sentenceToUse || inputSentence;
    if (!text.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setRefineSummary(null);
    setIsSaved(false);

    try {
      const res = await parseMealSentence(text, userProfile.apiKey, userProfile.aiProvider);
      if (!res.items || res.items.length === 0) {
        throw new Error('Could not identify food items. Please describe what you ate with approximate portions.');
      }

      const totCals = res.items.reduce((sum, it) => sum + (it.calories || 0), 0);
      const totProt = res.items.reduce((sum, it) => sum + (it.proteinG || 0), 0);
      const totCarbs = res.items.reduce((sum, it) => sum + (it.carbsG || 0), 0);
      const totFat = res.items.reduce((sum, it) => sum + (it.fatG || 0), 0);

      const newMeal: MealLog = {
        id: `meal-${Date.now()}`,
        date: logDate,
        mealType,
        items: res.items,
        totalCalories: totCals,
        totalProtein: totProt,
        totalCarbs: totCarbs,
        totalFat: totFat,
        rawInput: text,
        assumptions: res.assumptions || [],
        createdAt: new Date().toISOString(),
      };

      // Automatically commit to log
      onMealSaved(newMeal);

      // Display breakdown information directly below
      setLastLoggedMeal(newMeal);
      setParsedItems(res.items);
      setAssumptions(res.assumptions || []);
      setClarification(res.clarification || null);
      setInputSentence('');
      setPhotoPreview(null);
      setIsSaved(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to log meal');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setPhotoPreview(base64);
      setIsAnalyzingPhoto(true);
      setErrorMessage(null);
      setRefineSummary(null);
      setIsSaved(false);

      try {
        const res = await parseMealImage(base64, userProfile.apiKey, userProfile.aiProvider);
        if (!res.items || res.items.length === 0) {
          throw new Error('Could not identify food on plate. Please describe what you ate.');
        }

        const totCals = res.items.reduce((sum, it) => sum + (it.calories || 0), 0);
        const totProt = res.items.reduce((sum, it) => sum + (it.proteinG || 0), 0);
        const totCarbs = res.items.reduce((sum, it) => sum + (it.carbsG || 0), 0);
        const totFat = res.items.reduce((sum, it) => sum + (it.fatG || 0), 0);

        const newMeal: MealLog = {
          id: `meal-${Date.now()}`,
          date: logDate,
          mealType,
          items: res.items,
          totalCalories: totCals,
          totalProtein: totProt,
          totalCarbs: totCarbs,
          totalFat: totFat,
          rawInput: res.plateSummary || 'Photo plate recognition',
          assumptions: res.assumptions || [],
          createdAt: new Date().toISOString(),
        };

        onMealSaved(newMeal);
        setLastLoggedMeal(newMeal);
        setParsedItems(res.items);
        setAssumptions(res.assumptions || []);
        setPhotoPreview(null);
        setIsSaved(true);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to analyze plate photo');
      } finally {
        setIsAnalyzingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRefine = async () => {
    if (!correctionSentence.trim() || parsedItems.length === 0) return;

    setIsRefining(true);
    setErrorMessage(null);

    try {
      const res = await refineMealItems(parsedItems, correctionSentence, userProfile.apiKey, userProfile.aiProvider);
      setParsedItems(res.items);
      setRefineSummary(res.changesSummary);
      setCorrectionSentence('');
      if (res.assumptions) {
        setAssumptions(res.assumptions);
      }

      // Update the active meal in the daily log
      if (lastLoggedMeal) {
        const totC = res.items.reduce((s, it) => s + (it.calories || 0), 0);
        const totP = res.items.reduce((s, it) => s + (it.proteinG || 0), 0);
        const totCb = res.items.reduce((s, it) => s + (it.carbsG || 0), 0);
        const totF = res.items.reduce((s, it) => s + (it.fatG || 0), 0);

        const updatedMeal: MealLog = {
          ...lastLoggedMeal,
          items: res.items,
          totalCalories: totC,
          totalProtein: totP,
          totalCarbs: totCb,
          totalFat: totF,
          assumptions: res.assumptions || lastLoggedMeal.assumptions,
        };
        onMealSaved(updatedMeal);
        setLastLoggedMeal(updatedMeal);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update meal');
    } finally {
      setIsRefining(false);
    }
  };

  const handleDeleteItem = (id: string) => {
    const updated = parsedItems.filter((it) => it.id !== id);
    setParsedItems(updated);
    if (lastLoggedMeal) {
      const totC = updated.reduce((s, it) => s + (it.calories || 0), 0);
      const totP = updated.reduce((s, it) => s + (it.proteinG || 0), 0);
      const totCb = updated.reduce((s, it) => s + (it.carbsG || 0), 0);
      const totF = updated.reduce((s, it) => s + (it.fatG || 0), 0);
      const updatedMeal: MealLog = {
        ...lastLoggedMeal,
        items: updated,
        totalCalories: totC,
        totalProtein: totP,
        totalCarbs: totCb,
        totalFat: totF,
      };
      onMealSaved(updatedMeal);
      setLastLoggedMeal(updatedMeal);
    }
  };

  const handleResetDraft = () => {
    setInputSentence('');
    setCorrectionSentence('');
    setParsedItems([]);
    setLastLoggedMeal(null);
    setPhotoPreview(null);
    setAssumptions([]);
    setClarification(null);
    setErrorMessage(null);
    setRefineSummary(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Aggregated totals
  const totalCalories = parsedItems.reduce((sum, it) => sum + (it.calories || 0), 0);
  const totalProtein = parsedItems.reduce((sum, it) => sum + (it.proteinG || 0), 0);
  const totalCarbs = parsedItems.reduce((sum, it) => sum + (it.carbsG || 0), 0);
  const totalFat = parsedItems.reduce((sum, it) => sum + (it.fatG || 0), 0);

  const lifestyleMeals: { id: MealType; label: string }[] = [
    { id: 'meal_1', label: 'Meal 1 (Brunch / First)' },
    { id: 'meal_2', label: 'Meal 2 (Afternoon / Mid)' },
    { id: 'meal_3', label: 'Meal 3 (Dinner / Evening)' },
    { id: 'meal_4', label: 'Meal 4 (Late Snack)' },
    { id: 'snack', label: 'Snack' },
  ];

  const classicMeals: { id: MealType; label: string }[] = [
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'dinner', label: 'Dinner' },
    { id: 'snack', label: 'Snack' },
  ];

  const activeMealSlots = mealNamingMode === 'lifestyle' ? lifestyleMeals : classicMeals;

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <Utensils className="w-4 h-4" />
            <span>Log Food</span>
          </div>

          {/* Lifestyle / Classic schedule toggle */}
          <button
            type="button"
            onClick={() =>
              setMealNamingMode((prev) => (prev === 'lifestyle' ? 'classic' : 'lifestyle'))
            }
            className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {mealNamingMode === 'lifestyle' ? '☀️ Late Riser Mode' : '⏰ Classic Slots'}
          </button>
        </div>

        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          What did you eat?
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Type naturally in plain words or snap a photo of your plate.
        </p>

        {/* Date Selector */}
        <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[11px] font-bold">Meal Date:</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                const y = getYesterdayDateString();
                setLogDate(y);
                onSelectDate?.(y);
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                logDate === getYesterdayDateString()
                  ? 'bg-emerald-500 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Yesterday
            </button>
            <button
              type="button"
              onClick={() => {
                const t = getTodayDateString();
                setLogDate(t);
                onSelectDate?.(t);
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                logDate === getTodayDateString()
                  ? 'bg-emerald-500 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Today
            </button>
            <input
              type="date"
              max={getTodayDateString()}
              value={logDate}
              onChange={(e) => {
                if (e.target.value) {
                  setLogDate(e.target.value);
                  onSelectDate?.(e.target.value);
                }
              }}
              className="px-2 py-1 text-[11px] font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            />
          </div>
        </div>

        {/* Meal Slots (Lifestyle 11 AM Friendly or Classic) */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 no-scrollbar">
          {activeMealSlots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => setMealType(slot.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                mealType === slot.id
                  ? 'bg-emerald-500 text-white shadow-2xs scale-102'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {slot.label}
            </button>
          ))}
        </div>

        {/* Photo Thumbnail if uploaded */}
        {photoPreview && (
          <div className="mt-3 relative inline-block rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs">
            <img src={photoPreview} alt="Plate Capture" className="h-28 w-auto object-cover rounded-2xl" />
            <button
              type="button"
              onClick={() => setPhotoPreview(null)}
              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Input Text Box with Camera Trigger */}
        <div className="mt-3 relative">
          <textarea
            value={inputSentence}
            onChange={(e) => setInputSentence(e.target.value)}
            placeholder="e.g., 2 parathas with curd and 1 cup chai..."
            rows={3}
            className="w-full p-3.5 pb-10 text-sm rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none transition-all"
          />

          {/* Hidden File Input for Camera OCR */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoCapture}
          />

          {/* Action Bar inside/below input */}
          <div className="flex items-center justify-between mt-1 px-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzingPhoto}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
              title="Snap photo of plate"
            >
              {isAnalyzingPhoto ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Analyzing Plate...
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Snap Plate Photo</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleDirectLog()}
              disabled={isLoading || !inputSentence.trim()}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-md active:scale-98 disabled:opacity-50 disabled:pointer-events-none transition-all"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Logging Meal...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Log Meal</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Logged Meal Breakdown Information */}
      {lastLoggedMeal && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-emerald-200 dark:border-emerald-900/50 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                  Logged to {lastLoggedMeal.mealType.replace('_', ' ').toUpperCase()}
                </span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white capitalize">
                  {lastLoggedMeal.rawInput || 'Meal Breakdown'}
                </h3>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {lastLoggedMeal.totalCalories}
              </span>
              <span className="text-[10px] text-slate-400 block -mt-1">kcal added</span>
            </div>
          </div>

          {/* Macro Mini Cards */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl p-2">
              <div className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">PROTEIN</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{lastLoggedMeal.totalProtein}g</div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-xl p-2">
              <div className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">CARBS</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{lastLoggedMeal.totalCarbs}g</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 rounded-xl p-2">
              <div className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">FATS</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{lastLoggedMeal.totalFat}g</div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-2">
              <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">ITEMS</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{lastLoggedMeal.items.length}</div>
            </div>
          </div>

          {/* Itemized List */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Items Identified:</div>
            {lastLoggedMeal.items.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100">{item.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.portionDescription} (~{item.weightG}g)
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[10px]">
                    <span className="text-blue-600 dark:text-blue-400">P: {item.proteinG}g</span>
                    <span>•</span>
                    <span className="text-amber-600 dark:text-amber-400">C: {item.carbsG}g</span>
                    <span>•</span>
                    <span className="text-purple-600 dark:text-purple-400">F: {item.fatG}g</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">
                      {item.calories}
                    </span>
                    <span className="text-[10px] text-slate-400 block -mt-1">kcal</span>
                  </div>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Clarification Alert if present */}
          {clarification && (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
              <div>
                <span className="font-bold">Note: </span>
                {clarification}
              </div>
            </div>
          )}

          {/* Assumptions */}
          {assumptions.length > 0 && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/30 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">
                Portion Estimates Used:
              </span>
              <ul className="list-disc pl-4 space-y-0.5">
                {assumptions.map((assump, i) => (
                  <li key={i}>{assump}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Conversational Correction Section */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              <MessageSquareText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Adjust Logged Portion</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              Want to adjust? E.g., <em>"Make it 3 rotis without butter"</em> or <em>"Add 1 cup dahi"</em>.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={correctionSentence}
                onChange={(e) => setCorrectionSentence(e.target.value)}
                placeholder="e.g. Change to 3 rotis, remove ghee..."
                className="flex-1 p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRefine();
                }}
              />
              <button
                onClick={handleRefine}
                disabled={isRefining || !correctionSentence.trim()}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1 shrink-0 active:scale-95 disabled:opacity-50 transition-all shadow-xs"
              >
                {isRefining ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Update'}
              </button>
            </div>

            {refineSummary && (
              <div className="mt-2 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {refineSummary}
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Added to today&apos;s food journal</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setLastLoggedMeal(null);
                setParsedItems([]);
              }}
              className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[11px] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Discreet Sectional Reset Button */}
      {(inputSentence || parsedItems.length > 0 || photoPreview) && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleResetDraft}
            className="text-[11px] text-slate-400 hover:text-rose-500 underline inline-flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear current meal draft</span>
          </button>
        </div>
      )}
    </div>
  );
};
