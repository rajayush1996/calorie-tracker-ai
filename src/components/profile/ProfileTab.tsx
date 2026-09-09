'use client';

import React, { useState } from 'react';
import { UserProfile, Gender, ActivityLevel, FitnessGoal, TransformationPace, DietType } from '@/types';
import { calculateTargets, ACTIVITY_LABELS, GOAL_PACES } from '@/utils/nutritionCalculations';
import { verifyTargetsWithAI } from '@/services/aiService';
import { User, Check, Calculator, Sparkles, RefreshCw, RotateCcw, Trash2, AlertTriangle } from 'lucide-react';

interface ProfileTabProps {
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onRestartOnboarding?: () => void;
  onResetMeals?: () => void;
}

type ProfileFormData = Omit<
  UserProfile,
  | 'age'
  | 'heightCm'
  | 'currentWeightKg'
  | 'targetWeightKg'
  | 'targetCalories'
  | 'targetProteinG'
  | 'targetCarbsG'
  | 'targetFatG'
  | 'waterTargetMl'
> & {
  age: number | string;
  heightCm: number | string;
  currentWeightKg: number | string;
  targetWeightKg: number | string;
  targetCalories: number | string;
  targetProteinG: number | string;
  targetCarbsG: number | string;
  targetFatG: number | string;
  waterTargetMl: number | string;
};

export const ProfileTab: React.FC<ProfileTabProps> = ({
  userProfile,
  onSaveProfile,
  onRestartOnboarding,
  onResetMeals,
}) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    ...userProfile,
    dietType: userProfile.dietType || 'veg',
  });
  const [isSaved, setIsSaved] = useState(false);
  const [isVerifyingAI, setIsVerifyingAI] = useState(false);
  const [aiResult, setAiResult] = useState<{
    targetCalories: number;
    targetProteinG: number;
    targetCarbsG: number;
    targetFatG: number;
    waterTargetMl: number;
    aiExplanation: string;
    weeklyRateKg: number;
    confidence: string;
    provider?: string;
  } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  // Live recalculate preview safely
  const preview = calculateTargets(
    Number(formData.currentWeightKg) || userProfile.currentWeightKg || 75,
    Number(formData.heightCm) || userProfile.heightCm || 170,
    Number(formData.age) || userProfile.age || 25,
    formData.gender,
    formData.activityLevel,
    formData.goal,
    formData.pace || 'recommended'
  );

  const handleApplyCalculated = () => {
    setFormData((prev) => ({
      ...prev,
      targetCalories: preview.targetCalories,
      targetProteinG: preview.targetProteinG,
      targetCarbsG: preview.targetCarbsG,
      targetFatG: preview.targetFatG,
      waterTargetMl: preview.waterTargetMl,
    }));
  };

  const handleVerifyWithAI = async () => {
    setIsVerifyingAI(true);
    setAiResult(null);
    try {
      const res = await verifyTargetsWithAI({
        age: Number(formData.age) || userProfile.age || 25,
        gender: formData.gender,
        heightCm: Number(formData.heightCm) || userProfile.heightCm || 170,
        currentWeightKg: Number(formData.currentWeightKg) || userProfile.currentWeightKg || 75,
        targetWeightKg: Number(formData.targetWeightKg) || userProfile.targetWeightKg || 68,
        activityLevel: formData.activityLevel,
        goal: formData.goal,
        dietType: formData.dietType,
        pace: formData.pace || 'recommended',
        apiKey: userProfile.apiKey,
        provider: userProfile.aiProvider,
      });
      setAiResult(res);
    } catch (err) {
      console.warn('AI target verification error:', err);
    } finally {
      setIsVerifyingAI(false);
    }
  };

  const handleApplyAITargets = () => {
    if (!aiResult) return;
    setFormData((prev) => ({
      ...prev,
      targetCalories: aiResult.targetCalories,
      targetProteinG: aiResult.targetProteinG,
      targetCarbsG: aiResult.targetCarbsG,
      targetFatG: aiResult.targetFatG,
      waterTargetMl: aiResult.waterTargetMl,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanProfile: UserProfile = {
      ...formData,
      age: Number(formData.age) || userProfile.age || 25,
      heightCm: Number(formData.heightCm) || userProfile.heightCm || 170,
      currentWeightKg: Number(formData.currentWeightKg) || userProfile.currentWeightKg || 75,
      targetWeightKg: Number(formData.targetWeightKg) || userProfile.targetWeightKg || 68,
      targetCalories: Number(formData.targetCalories) || preview.targetCalories,
      targetProteinG: Number(formData.targetProteinG) || preview.targetProteinG,
      targetCarbsG: Number(formData.targetCarbsG) || preview.targetCarbsG,
      targetFatG: Number(formData.targetFatG) || preview.targetFatG,
      waterTargetMl: Number(formData.waterTargetMl) || preview.waterTargetMl,
    };
    onSaveProfile(cleanProfile);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm mb-1">
          <User className="w-4 h-4 text-emerald-500" />
          <span>Profile & Target Calorie Engine</span>
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          Personal Metrics & Goals
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Scientific metabolic calculations calibrated to your exact goal (fat loss deficit, muscle gain surplus, bulking, or maintenance).
        </p>

        {/* Live Calculation Card with AI Check & Calibrate */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5" />
              Calculated Energy Needs
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleVerifyWithAI}
                disabled={isVerifyingAI}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl shadow-2xs border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-50 flex items-center gap-1 disabled:opacity-50"
              >
                {isVerifyingAI ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    Verify with AI
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleApplyCalculated}
                className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 underline hover:text-emerald-800"
              >
                Sync
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                BMR:
              </span>
              <strong className="text-sm font-black text-slate-800 dark:text-slate-200">
                {preview.bmr} kcal
              </strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                TDEE:
              </span>
              <strong className="text-sm font-black text-slate-800 dark:text-slate-200">
                {preview.tdee} kcal
              </strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                Target:
              </span>
              <strong className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                {preview.targetCalories} kcal
              </strong>
              <span className="text-[10px] text-slate-400 block">
                {preview.targetCalories > preview.tdee
                  ? `+${preview.targetCalories - preview.tdee} surplus`
                  : preview.targetCalories < preview.tdee
                  ? `-${preview.tdee - preview.targetCalories} deficit`
                  : 'Balanced'}
              </span>
            </div>
          </div>

          {/* AI Verification Results Card */}
          {aiResult && (
            <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  AI Nutritionist Review
                </span>
                <button
                  type="button"
                  onClick={handleApplyAITargets}
                  className="px-2.5 py-0.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] shadow-2xs active:scale-95"
                >
                  Apply AI Targets
                </button>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {aiResult.aiExplanation}
              </p>
              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                <span>Cals: <strong className="text-slate-900 dark:text-white">{aiResult.targetCalories}</strong></span>
                <span>Protein: <strong className="text-blue-600 dark:text-blue-400">{aiResult.targetProteinG}g</strong></span>
                <span>Carbs: <strong className="text-amber-600 dark:text-amber-400">{aiResult.targetCarbsG}g</strong></span>
                <span>Fats: <strong className="text-purple-600 dark:text-purple-400">{aiResult.targetFatG}g</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Age
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                value={formData.heightCm}
                onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Current (kg)
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.currentWeightKg}
                onChange={(e) => setFormData({ ...formData, currentWeightKg: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Target Weight (kg)
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.targetWeightKg}
                onChange={(e) => setFormData({ ...formData, targetWeightKg: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Goal
              </label>
              <select
                value={formData.goal}
                onChange={(e) =>
                  setFormData({ ...formData, goal: e.target.value as FitnessGoal })
                }
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              >
                <option value="fat_loss">🔥 Fat Loss / Cut</option>
                <option value="muscle_gain">💪 Muscle Growth / Lean Bulk</option>
                <option value="weight_gain">📈 Weight Gain / Bulking</option>
                <option value="maintenance">⚖️ Maintenance / Recomposition</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Transformation Pace
              </label>
              <select
                value={formData.pace || 'recommended'}
                onChange={(e) =>
                  setFormData({ ...formData, pace: e.target.value as TransformationPace })
                }
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              >
                {(['sustainable', 'recommended', 'aggressive'] as const).map((pKey) => {
                  const pConf = (GOAL_PACES[formData.goal || 'fat_loss'] || GOAL_PACES.fat_loss)[pKey];
                  return (
                    <option key={pKey} value={pKey}>
                      {pConf.icon} {pConf.label} ({pConf.calorieDelta > 0 ? `+${pConf.calorieDelta}` : pConf.calorieDelta} kcal)
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Diet Preference
              </label>
              <select
                value={formData.dietType || 'veg'}
                onChange={(e) =>
                  setFormData({ ...formData, dietType: e.target.value as DietType })
                }
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              >
                <option value="veg">🥦 Vegetarian</option>
                <option value="non_veg">🍗 Non-Vegetarian</option>
                <option value="eggetarian">🥚 Eggetarian</option>
                <option value="vegan">🌱 Vegan</option>
                <option value="jain">🥗 Jain</option>
                <option value="keto">🥩 Keto</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
              Activity Level
            </label>
            <select
              value={formData.activityLevel}
              onChange={(e) =>
                setFormData({ ...formData, activityLevel: e.target.value as ActivityLevel })
              }
              className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            >
              {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((level) => (
                <option key={level} value={level}>
                  {ACTIVITY_LABELS[level]}
                </option>
              ))}
            </select>
          </div>

          {/* Target Overrides */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Active Daily Targets:
            </span>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Calories</label>
                <input
                  type="number"
                  value={formData.targetCalories}
                  onChange={(e) => setFormData({ ...formData, targetCalories: e.target.value })}
                  className="w-full p-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Protein (g)</label>
                <input
                  type="number"
                  value={formData.targetProteinG}
                  onChange={(e) => setFormData({ ...formData, targetProteinG: e.target.value })}
                  className="w-full p-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Carbs (g)</label>
                <input
                  type="number"
                  value={formData.targetCarbsG}
                  onChange={(e) => setFormData({ ...formData, targetCarbsG: e.target.value })}
                  className="w-full p-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-amber-600 dark:text-amber-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Fat (g)</label>
                <input
                  type="number"
                  value={formData.targetFatG}
                  onChange={(e) => setFormData({ ...formData, targetFatG: e.target.value })}
                  className="w-full p-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-purple-600 dark:text-purple-400"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs ${
              isSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white active:scale-98'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" /> Profile Updated!
              </>
            ) : (
              'Save Profile & Targets'
            )}
          </button>
        </form>
      </div>

      {/* Account & Data Management (Restart Onboarding / Clear Meals) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
          <RotateCcw className="w-4 h-4 text-emerald-500" />
          <span>Tracker Setup & Data Reset</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Want to change your baseline metrics, switch tracker goals, or clear your history?
        </p>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setShowRestartConfirm(true)}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-left transition-all"
          >
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5 text-emerald-500" /> Restart Setup
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Re-run onboarding wizard from step 1
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="p-3 rounded-2xl bg-rose-50/50 hover:bg-rose-100/50 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 border border-rose-100 dark:border-rose-900/30 text-left transition-all"
          >
            <span className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Clear Meal Logs
            </span>
            <span className="text-[10px] text-rose-600/70 dark:text-rose-400/80 block mt-0.5">
              Reset logged meals to clean slate
            </span>
          </button>
        </div>

        {/* Confirmation modals */}
        {showRestartConfirm && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 space-y-2">
            <p className="text-xs text-amber-900 dark:text-amber-200 font-bold">
              Restart Onboarding Wizard to recalibrate your baseline?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowRestartConfirm(false);
                  onRestartOnboarding?.();
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-2xs active:scale-95"
              >
                Yes, Restart Setup
              </button>
              <button
                type="button"
                onClick={() => setShowRestartConfirm(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showResetConfirm && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 space-y-2">
            <p className="text-xs text-rose-900 dark:text-rose-200 font-bold">
              Clear all logged meals? Your profile metrics will remain intact.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(false);
                  onResetMeals?.();
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-2xs active:scale-95"
              >
                Yes, Clear All Meals
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
