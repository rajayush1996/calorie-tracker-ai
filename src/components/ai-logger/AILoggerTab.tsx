'use client';

import React, { useState, useEffect } from 'react';
import { MealType, FoodItem, MealLog, UserProfile } from '@/types';
import { parseMealSentence, refineMealItems } from '@/services/aiService';
import { Sparkles, ArrowRight, Check, AlertCircle, RefreshCw, Trash2, Edit3, MessageSquareText, Calendar } from 'lucide-react';
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
  const [inputSentence, setInputSentence] = useState('');
  const [correctionSentence, setCorrectionSentence] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

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
  const [isSaved, setIsSaved] = useState(false);

  const quickPrompts = [
    '2 rotis with a small bowl of dal tadka and 1 cup curd',
    '3 boiled eggs, 2 slices brown bread, and black coffee',
    '150g chicken breast with 1 cup steamed rice and salad',
    '1 scoop whey protein with 250ml milk and 1 banana',
    '1 plate poha with peanuts and 1 cup chai without sugar',
  ];

  const handleParse = async (sentenceToUse?: string) => {
    const text = sentenceToUse || inputSentence;
    if (!text.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setRefineSummary(null);
    setIsSaved(false);

    try {
      const res = await parseMealSentence(text, userProfile.apiKey, userProfile.aiProvider);
      setParsedItems(res.items);
      setAssumptions(res.assumptions || []);
      setClarification(res.clarification || null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to analyze meal');
    } finally {
      setIsLoading(false);
    }
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
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to refine meal');
    } finally {
      setIsRefining(false);
    }
  };

  const handleDeleteItem = (id: string) => {
    setParsedItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Aggregated totals
  const totalCalories = parsedItems.reduce((sum, it) => sum + (it.calories || 0), 0);
  const totalProtein = parsedItems.reduce((sum, it) => sum + (it.proteinG || 0), 0);
  const totalCarbs = parsedItems.reduce((sum, it) => sum + (it.carbsG || 0), 0);
  const totalFat = parsedItems.reduce((sum, it) => sum + (it.fatG || 0), 0);

  const handleSaveToLog = () => {
    if (parsedItems.length === 0) return;

    const newMeal: MealLog = {
      id: `meal-${Date.now()}`,
      date: logDate,
      mealType,
      items: parsedItems,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      rawInput: inputSentence,
      assumptions,
      createdAt: new Date().toISOString(),
    };

    onMealSaved(newMeal);
    setIsSaved(true);
    setTimeout(() => {
      // Reset after brief success message
      setParsedItems([]);
      setInputSentence('');
      setIsSaved(false);
    }, 1800);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Conversational AI Meal Logger</span>
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          Log What You Ate in Plain English
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Type or dictate naturally. The AI will estimate portions, breakdown calories and macros, and allow interactive self-correction.
        </p>

        {/* Date Selector for Past/Today Logging */}
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

        {/* Meal Type Pills */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => (
            <button
              key={type}
              onClick={() => setMealType(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all shrink-0 ${
                mealType === type
                  ? 'bg-emerald-500 text-white shadow-xs scale-102'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Input Text Box */}
        <div className="mt-3 relative">
          <textarea
            value={inputSentence}
            onChange={(e) => setInputSentence(e.target.value)}
            placeholder="e.g. Ate 2 butter rotis with a bowl of dal makhani, half plate rice and 1 diet coke..."
            rows={3}
            className="w-full p-3.5 text-sm rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none transition-all"
          />

          <div className="flex justify-between items-center mt-2">
            <span className="text-[11px] text-slate-400">
              💡 Mention quantities like bowls, slices, spoons, or cups
            </span>

            <button
              onClick={() => handleParse()}
              disabled={isLoading || !inputSentence.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-xs shadow-xs active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Analyze with AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Quick Examples:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => {
                  setInputSentence(prompt);
                  handleParse(prompt);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 border border-slate-200/60 dark:border-slate-700/60 text-left transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {onOpenRescue && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <span>🆘 Craving or Overate?</span>
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => onOpenRescue('craving')}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80 hover:bg-amber-100 transition-colors"
                >
                  🍫 Craving Swapper
                </button>
                <button
                  type="button"
                  onClick={() => onOpenRescue('cheat')}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/80 hover:bg-rose-100 transition-colors"
                >
                  🍕 Cheat Recovery
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Parsed Result Display */}
      {parsedItems.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                AI Nutritional Breakdown
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white capitalize">
                {mealType} Summary
              </h3>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {totalCalories}
              </span>
              <span className="text-xs text-slate-400 block -mt-1">total kcal</span>
            </div>
          </div>

          {/* Macro Mini Cards */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl p-2">
              <div className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">PROTEIN</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{totalProtein}g</div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-xl p-2">
              <div className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">CARBS</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{totalCarbs}g</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 rounded-xl p-2">
              <div className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">FATS</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{totalFat}g</div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-2">
              <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">ITEMS</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{parsedItems.length}</div>
            </div>
          </div>

          {/* Itemized List */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Itemized Components:</div>
            {parsedItems.map((item) => (
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
                Assumptions made by AI:
              </span>
              <ul className="list-disc pl-4 space-y-0.5">
                {assumptions.map((assump, i) => (
                  <li key={i}>{assump}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Conversational Correction Section */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-2xl p-3.5 border border-emerald-100 dark:border-emerald-900/30">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1.5">
              <MessageSquareText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Correct or Fine-Tune with AI</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              Want to adjust anything? Tell the AI: <em>"Actually make it plain roti with no butter"</em> or <em>"Remove the dessert and add 1 cup curd"</em>.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={correctionSentence}
                onChange={(e) => setCorrectionSentence(e.target.value)}
                placeholder="e.g. Remove ghee, change to 3 rotis, half rice..."
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
                {isRefining ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Refine'}
              </button>
            </div>

            {refineSummary && (
              <div className="mt-2 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {refineSummary}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={handleSaveToLog}
              disabled={isSaved}
              className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
                isSaved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 active:scale-98'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved to Today's Log!
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Confirm & Log {mealType} ({totalCalories} kcal)
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
