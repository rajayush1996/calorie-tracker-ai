'use client';

import React, { useState } from 'react';
import { UserProfile, Gender, ActivityLevel, FitnessGoal, TransformationPace, DietType } from '@/types';
import { calculateTargets, ACTIVITY_LABELS, GOAL_PACES } from '@/utils/nutritionCalculations';
import { User, Check, Calculator, RotateCcw, Trash2, LogOut } from 'lucide-react';

interface ProfileTabProps {
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onRestartOnboarding?: () => void;
  onResetMeals?: () => void;
  onLogout?: () => void;
  onFreshStart?: () => void;
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
  onLogout,
  onFreshStart,
}) => {
  const [formData, setFormData] = useState<ProfileFormData>(() => {
    const diet = userProfile.dietType || 'veg';
    const computed = calculateTargets(
      userProfile.currentWeightKg || 75,
      userProfile.heightCm || 170,
      userProfile.age || 25,
      userProfile.gender || 'male',
      userProfile.activityLevel || 'moderate',
      userProfile.goal || 'fat_loss',
      userProfile.pace || 'recommended',
      diet,
      userProfile.targetWeightKg || undefined
    );
    return {
      ...userProfile,
      dietType: diet,
      targetCalories: userProfile.targetCalories || computed.targetCalories,
      targetProteinG: userProfile.targetProteinG || computed.targetProteinG,
      targetCarbsG: userProfile.targetCarbsG || computed.targetCarbsG,
      targetFatG: userProfile.targetFatG || computed.targetFatG,
      waterTargetMl: userProfile.waterTargetMl || computed.waterTargetMl,
    };
  });

  const [isSaved, setIsSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showFreshStartConfirm, setShowFreshStartConfirm] = useState(false);

  // Live recalculate preview with all parameters
  const preview = calculateTargets(
    Number(formData.currentWeightKg) || userProfile.currentWeightKg || 75,
    Number(formData.heightCm) || userProfile.heightCm || 170,
    Number(formData.age) || userProfile.age || 25,
    formData.gender,
    formData.activityLevel,
    formData.goal,
    formData.pace || 'recommended',
    formData.dietType,
    Number(formData.targetWeightKg) || userProfile.targetWeightKg || undefined
  );

  // Internal AI engine calculation wrapper: auto-synchronizes macros whenever biometrics or goals change
  const updateMetric = (field: keyof ProfileFormData, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      const currentW = Number(next.currentWeightKg) || userProfile.currentWeightKg || 75;
      const height = Number(next.heightCm) || userProfile.heightCm || 170;
      const ageNum = Number(next.age) || userProfile.age || 25;
      const targetW = Number(next.targetWeightKg) || userProfile.targetWeightKg || undefined;

      const calc = calculateTargets(
        currentW,
        height,
        ageNum,
        next.gender,
        next.activityLevel,
        next.goal,
        next.pace || 'recommended',
        next.dietType,
        targetW
      );

      return {
        ...next,
        targetCalories: calc.targetCalories,
        targetProteinG: calc.targetProteinG,
        targetCarbsG: calc.targetCarbsG,
        targetFatG: calc.targetFatG,
        waterTargetMl: calc.waterTargetMl,
      };
    });
  };

  const updateDirectField = (field: keyof ProfileFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
          <span>Profile & Daily Targets</span>
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          Personal Metrics & Goals
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Your daily calorie and macronutrient targets calibrated to your fitness goal.
        </p>

        {/* Live Daily Target Card */}
        <div className="mt-4 p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-emerald-600" />
              Daily Calorie Target
            </span>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-white/90 dark:bg-slate-900/90 px-2.5 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs">
              Recommended
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                Base Energy:
              </span>
              <strong className="text-sm font-black text-slate-800 dark:text-slate-200">
                {preview.bmr} kcal
              </strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                Daily Burn:
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

          <div className="pt-2 border-t border-emerald-100/80 dark:border-emerald-900/40 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <span className="font-medium">{preview.explanation.replace(/Blueprint:|AI /gi, '').trim()}</span>
          </div>
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
                onChange={(e) => updateDirectField('name', e.target.value)}
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
                onChange={(e) => updateMetric('age', e.target.value)}
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
                onChange={(e) => updateMetric('gender', e.target.value as Gender)}
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
                onChange={(e) => updateMetric('heightCm', e.target.value)}
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
                onChange={(e) => updateMetric('currentWeightKg', e.target.value)}
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
                onChange={(e) => updateMetric('targetWeightKg', e.target.value)}
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
                  updateMetric('goal', e.target.value as FitnessGoal)
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
                  updateMetric('pace', e.target.value as TransformationPace)
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
                  updateMetric('dietType', e.target.value as DietType)
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
                updateMetric('activityLevel', e.target.value as ActivityLevel)
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
                  onChange={(e) => updateDirectField('targetCalories', e.target.value)}
                  className="w-full p-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Protein (g)</label>
                <input
                  type="number"
                  value={formData.targetProteinG}
                  onChange={(e) => updateDirectField('targetProteinG', e.target.value)}
                  className="w-full p-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Carbs (g)</label>
                <input
                  type="number"
                  value={formData.targetCarbsG}
                  onChange={(e) => updateDirectField('targetCarbsG', e.target.value)}
                  className="w-full p-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-amber-600 dark:text-amber-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Fat (g)</label>
                <input
                  type="number"
                  value={formData.targetFatG}
                  onChange={(e) => updateDirectField('targetFatG', e.target.value)}
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
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-emerald-500" /> Restart Setup
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Re-run onboarding wizard from step 1
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-left transition-all"
          >
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5 text-amber-500" /> Clear Meal Logs
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Delete logged meals & water entries
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowFreshStartConfirm(true)}
            className="p-3 rounded-2xl bg-rose-50/50 hover:bg-rose-100/50 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 border border-rose-100 dark:border-rose-900/30 text-left transition-all"
          >
            <span className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-rose-500" /> Fresh Start / Full Reset
            </span>
            <span className="text-[10px] text-rose-600/70 dark:text-rose-400/80 block mt-0.5">
              Wipe all local data & start 100% fresh
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-left transition-all"
          >
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <LogOut className="w-3.5 h-3.5 text-slate-500" /> Log Out Account
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Sign out of this session
            </span>
          </button>
        </div>

        {/* Confirmation modals */}
        {showRestartConfirm && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 space-y-2">
            <p className="text-xs text-emerald-900 dark:text-emerald-200 font-bold">
              Restart Onboarding Wizard to recalibrate your baseline?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowRestartConfirm(false);
                  onRestartOnboarding?.();
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-2xs active:scale-95"
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
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 space-y-2">
            <p className="text-xs text-amber-900 dark:text-amber-200 font-bold">
              Clear all logged meals? Your profile metrics will remain intact.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(false);
                  onResetMeals?.();
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-2xs active:scale-95"
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

        {showFreshStartConfirm && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 space-y-2">
            <p className="text-xs text-rose-900 dark:text-rose-200 font-bold">
              ⚠️ Start completely fresh? This will wipe all local logs, custom profile, and reset the app as a brand-new clean slate.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowFreshStartConfirm(false);
                  onFreshStart?.();
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-2xs active:scale-95"
              >
                Yes, Wipe & Start Fresh
              </button>
              <button
                type="button"
                onClick={() => setShowFreshStartConfirm(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showLogoutConfirm && (
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 space-y-2">
            <p className="text-xs text-slate-900 dark:text-slate-100 font-bold">
              Log out of your account on this device?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout?.();
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-2xs active:scale-95"
              >
                Yes, Log Out
              </button>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
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
