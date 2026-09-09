'use client';

import React, { useState } from 'react';
import { UserProfile, Gender, ActivityLevel, FitnessGoal } from '@/types';
import { calculateTargets, ACTIVITY_LABELS } from '@/utils/nutritionCalculations';
import { User, Key, Check, Calculator, Sparkles } from 'lucide-react';

interface ProfileTabProps {
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
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

export const ProfileTab: React.FC<ProfileTabProps> = ({ userProfile, onSaveProfile }) => {
  const [formData, setFormData] = useState<ProfileFormData>({ ...userProfile });
  const [isSaved, setIsSaved] = useState(false);

  // Live recalculate preview safely
  const preview = calculateTargets(
    Number(formData.currentWeightKg) || userProfile.currentWeightKg || 75,
    Number(formData.heightCm) || userProfile.heightCm || 170,
    Number(formData.age) || userProfile.age || 25,
    formData.gender,
    formData.activityLevel,
    formData.goal
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
          Accurate scientific calculations using the Mifflin-St Jeor equation to find your true BMR, TDEE, and optimal calorie deficit.
        </p>

        {/* Live Calculation Card */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-100 dark:border-emerald-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5" />
              Calculated Energy Needs
            </span>
            <button
              type="button"
              onClick={handleApplyCalculated}
              className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 underline hover:text-emerald-800"
            >
              Sync to Targets
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                Basal Metabolic Rate (BMR):
              </span>
              <strong className="text-sm font-black text-slate-800 dark:text-slate-200">
                {preview.bmr} kcal/day
              </strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                Maintenance Burn (TDEE):
              </span>
              <strong className="text-sm font-black text-slate-800 dark:text-slate-200">
                {preview.tdee} kcal/day
              </strong>
            </div>
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
                <option value="fat_loss">Fat Loss (-500 kcal)</option>
                <option value="maintenance">Maintenance</option>
                <option value="muscle_gain">Muscle Gain (+350 kcal)</option>
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

          {/* Multi-Model AI Factory Settings */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-500" />
                AI Model Engine (Multi-Provider Factory):
              </label>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                Plug & Play
              </span>
            </div>

            {/* Provider Selector */}
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: undefined, label: 'Auto' },
                { id: 'gemini' as const, label: 'Gemini' },
                { id: 'groq' as const, label: 'Groq' },
                { id: 'openai' as const, label: 'OpenAI' },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setFormData({ ...formData, aiProvider: p.id })}
                  className={`py-1.5 text-[11px] font-bold rounded-xl border transition-all ${
                    formData.aiProvider === p.id
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <input
              type="password"
              placeholder={
                formData.aiProvider === 'gemini'
                  ? 'Gemini API Key (AIzaSy...)'
                  : formData.aiProvider === 'groq'
                  ? 'Groq API Key (gsk_...)'
                  : formData.aiProvider === 'claude'
                  ? 'Claude API Key (sk-ant-...)'
                  : 'API Key (OpenAI / Gemini / Groq / Claude)...'
              }
              value={formData.apiKey || ''}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              className="w-full p-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
            />
            <p className="text-[10px] text-slate-400 leading-relaxed">
              💡 <strong>Zero friction:</strong> If left empty, NutriAI automatically uses your server <code className="text-emerald-600">.env.local</code> key or falls back to the built-in smart offline heuristic engine (₹0 cost).
            </p>
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
    </div>
  );
};
