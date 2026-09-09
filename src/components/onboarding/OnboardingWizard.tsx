'use client';

import React, { useState } from 'react';
import { UserProfile, Gender, ActivityLevel, FitnessGoal, TransformationPace } from '@/types';
import {
  calculateTargets,
  calculateBMI,
  calculateWeightLossJourney,
  ACTIVITY_LABELS,
  PACE_CONFIG,
} from '@/utils/nutritionCalculations';
import { Sparkles, ArrowRight, ArrowLeft, Check, Target, Flame, Scale, Ruler } from 'lucide-react';

interface OnboardingWizardProps {
  initialProfile: UserProfile;
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  initialProfile,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [name, setName] = useState(initialProfile.name || '');
  const [age, setAge] = useState<number>(initialProfile.age || 25);
  const [gender, setGender] = useState<Gender>(initialProfile.gender || 'male');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    initialProfile.activityLevel || 'moderate'
  );

  const [heightCm, setHeightCm] = useState<number>(initialProfile.heightCm || 172);
  const [currentWeightKg, setCurrentWeightKg] = useState<number>(
    initialProfile.currentWeightKg || 78
  );
  const [waistCm, setWaistCm] = useState<number>(initialProfile.waistCm || 86);
  const [chestCm, setChestCm] = useState<number>(initialProfile.chestCm || 98);

  const [targetWeightKg, setTargetWeightKg] = useState<number>(
    initialProfile.targetWeightKg || 70
  );
  const [pace, setPace] = useState<TransformationPace>(initialProfile.pace || 'recommended');

  // Calculations
  const isLoss = targetWeightKg < currentWeightKg;
  const goal: FitnessGoal = isLoss ? 'fat_loss' : targetWeightKg > currentWeightKg ? 'muscle_gain' : 'maintenance';

  const targets = calculateTargets(
    currentWeightKg,
    heightCm,
    age,
    gender,
    activityLevel,
    goal,
    pace
  );

  const bmi = calculateBMI(currentWeightKg, heightCm);
  const targetBmi = calculateBMI(targetWeightKg, heightCm);
  const journey = calculateWeightLossJourney(currentWeightKg, targetWeightKg, pace);

  const handleFinish = () => {
    const finalProfile: UserProfile = {
      ...initialProfile,
      name,
      age,
      gender,
      heightCm,
      currentWeightKg,
      targetWeightKg,
      waistCm,
      chestCm,
      activityLevel,
      goal,
      pace,
      targetCalories: targets.targetCalories,
      targetProteinG: targets.targetProteinG,
      targetCarbsG: targets.targetCarbsG,
      targetFatG: targets.targetFatG,
      waterTargetMl: targets.waterTargetMl,
      targetDate: journey.estimatedTargetDate,
      isOnboarded: true,
    };

    onComplete(finalProfile);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === s
                    ? 'w-8 bg-emerald-500'
                    : step > s
                    ? 'w-4 bg-emerald-300 dark:bg-emerald-800'
                    : 'w-4 bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-bold text-slate-400">Step {step} of 4</span>
        </div>

        {/* STEP 1: Personal Basics */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Phase 1 • Profile
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Let's get to know you
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your age, sex, and activity determine your exact baseline metabolism.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  What should we call you?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 24)}
                    className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Daily Activity Level
                </label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                  className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                >
                  {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {ACTIVITY_LABELS[lvl]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full mt-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <span>Next: Body Measurements</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Body Measurements */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Phase 2 • Measurements
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Current Body Metrics
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your current measurements. These will calibrate your initial BMI and baseline.
              </p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                    <Ruler className="w-3.5 h-3.5 text-emerald-500" />
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(parseInt(e.target.value) || 170)}
                    className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                    <Scale className="w-3.5 h-3.5 text-emerald-500" />
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentWeightKg}
                    onChange={(e) => setCurrentWeightKg(parseFloat(e.target.value) || 75)}
                    className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Waist (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={waistCm}
                    onChange={(e) => setWaistCm(parseFloat(e.target.value) || 85)}
                    className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Chest (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={chestCm}
                    onChange={(e) => setChestCm(parseFloat(e.target.value) || 95)}
                    className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* BMI Card Preview */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Current BMI</span>
                  <div className="text-xl font-black text-slate-900 dark:text-white">
                    {bmi.bmi}{' '}
                    <span className={`text-xs font-bold ${bmi.color}`}>({bmi.category})</span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  Ideal Healthy Range: <br />
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                    18.5 - 24.9
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <span>Next: Target & Speed</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Target Weight & Pace */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Phase 3 • Goal & Speed
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Transformation Speed
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Choose how fast you want to reach your target weight.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Target Weight (kg)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.5"
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(parseFloat(e.target.value) || 68)}
                  className="flex-1 p-3 text-base font-bold rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
                <span className="text-xs font-bold px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {currentWeightKg > targetWeightKg
                    ? `-${(currentWeightKg - targetWeightKg).toFixed(1)} kg`
                    : `+${(targetWeightKg - currentWeightKg).toFixed(1)} kg`}
                </span>
              </div>
            </div>

            {/* Pace Options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Select Transformation Pace:
              </label>

              {(['sustainable', 'recommended', 'aggressive'] as TransformationPace[]).map(
                (pKey) => {
                  const pConf = PACE_CONFIG[pKey];
                  const isSelected = pace === pKey;

                  return (
                    <div
                      key={pKey}
                      onClick={() => setPace(pKey)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{pConf.icon}</span>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">
                              {pConf.label}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              {pConf.description}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                            ~{pConf.estimatedWeeklyKg} kg/wk
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {pConf.calorieDelta > 0 ? `+${pConf.calorieDelta}` : pConf.calorieDelta} kcal/day
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <span>Review Blueprint</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Reveal Custom Blueprint */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Phase 4 • Blueprint Ready
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Your AI Transformation Plan
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Here are your personalized calorie and macro targets calibrated for your goal.
              </p>
            </div>

            {/* Target Numbers Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-3xl p-4 shadow-md shadow-emerald-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                    Daily Calorie Target
                  </span>
                  <div className="text-3xl font-black">{targets.targetCalories} kcal</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                    Maintenance (TDEE)
                  </span>
                  <div className="text-sm font-extrabold">{targets.tdee} kcal</div>
                </div>
              </div>

              {/* Macro breakdown */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/20 text-center">
                <div className="bg-white/15 rounded-xl p-2">
                  <div className="text-[10px] text-emerald-100">Protein</div>
                  <div className="text-sm font-bold">{targets.targetProteinG}g</div>
                </div>
                <div className="bg-white/15 rounded-xl p-2">
                  <div className="text-[10px] text-emerald-100">Carbs</div>
                  <div className="text-sm font-bold">{targets.targetCarbsG}g</div>
                </div>
                <div className="bg-white/15 rounded-xl p-2">
                  <div className="text-[10px] text-emerald-100">Fats</div>
                  <div className="text-sm font-bold">{targets.targetFatG}g</div>
                </div>
              </div>
            </div>

            {/* Journey Milestone Banner */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Projected Goal Achievement:
                  </span>
                  <strong className="text-emerald-900 dark:text-emerald-200 font-black">
                    {journey.estimatedTargetDate} (~{journey.weeksNeeded} weeks)
                  </strong>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                {currentWeightKg}kg ➔ {targetWeightKg}kg
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-black text-xs shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Launch My Custom Tracker</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
