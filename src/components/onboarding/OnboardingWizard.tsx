'use client';

import React, { useState } from 'react';
import { UserProfile, Gender, ActivityLevel, FitnessGoal, TransformationPace, DietType } from '@/types';
import {
  calculateTargets,
  calculateBMI,
  calculateWeightLossJourney,
  ACTIVITY_LABELS,
  PACE_CONFIG,
  GOAL_PACES,
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
  const [age, setAge] = useState<number | string>(initialProfile.age ?? 25);
  const [gender, setGender] = useState<Gender>(initialProfile.gender || 'male');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    initialProfile.activityLevel || 'moderate'
  );

  const [heightCm, setHeightCm] = useState<number | string>(initialProfile.heightCm ?? 172);
  const [currentWeightKg, setCurrentWeightKg] = useState<number | string>(
    initialProfile.currentWeightKg ?? 78
  );
  const [waistCm, setWaistCm] = useState<number | string>(initialProfile.waistCm ?? 86);
  const [chestCm, setChestCm] = useState<number | string>(initialProfile.chestCm ?? 98);

  const [goal, setGoal] = useState<FitnessGoal>(initialProfile.goal || 'fat_loss');
  const [dietType, setDietType] = useState<DietType>(initialProfile.dietType || 'veg');
  const [targetWeightKg, setTargetWeightKg] = useState<number | string>(
    initialProfile.targetWeightKg ?? 70
  );
  const [pace, setPace] = useState<TransformationPace>(initialProfile.pace || 'recommended');

  // Normalized numbers for calculations
  const numCurrentWeight = Number(currentWeightKg) || 75;
  const numTargetWeight = Number(targetWeightKg) || 70;
  const numHeight = Number(heightCm) || 170;
  const numAge = Number(age) || 24;

  const handleGoalSelect = (selectedGoal: FitnessGoal) => {
    setGoal(selectedGoal);
    if (selectedGoal === 'fat_loss') {
      if (numTargetWeight >= numCurrentWeight) {
        setTargetWeightKg(Math.max(30, Number((numCurrentWeight - 5).toFixed(1))));
      }
    } else if (selectedGoal === 'muscle_gain') {
      if (numTargetWeight <= numCurrentWeight) {
        setTargetWeightKg(Number((numCurrentWeight + 4).toFixed(1)));
      }
    } else if (selectedGoal === 'weight_gain') {
      if (numTargetWeight <= numCurrentWeight) {
        setTargetWeightKg(Number((numCurrentWeight + 6).toFixed(1)));
      }
    } else if (selectedGoal === 'maintenance') {
      setTargetWeightKg(numCurrentWeight);
    }
  };

  // Internal AI Metabolic Engine automatically calculates accurate calories & macros
  const activeTargets = calculateTargets(
    numCurrentWeight,
    numHeight,
    numAge,
    gender,
    activityLevel,
    goal,
    pace,
    dietType,
    numTargetWeight
  );

  const bmi = calculateBMI(numCurrentWeight, numHeight);
  const targetBmi = calculateBMI(numTargetWeight, numHeight);
  const journey = calculateWeightLossJourney(numCurrentWeight, numTargetWeight, pace, goal);

  const handleFinish = () => {
    const finalProfile: UserProfile = {
      ...initialProfile,
      name,
      age: Number(age) || 25,
      gender,
      heightCm: Number(heightCm) || 172,
      currentWeightKg: Number(currentWeightKg) || 78,
      targetWeightKg: Number(targetWeightKg) || 70,
      waistCm: waistCm === '' ? undefined : Number(waistCm),
      chestCm: chestCm === '' ? undefined : Number(chestCm),
      activityLevel,
      goal,
      dietType,
      pace,
      targetCalories: activeTargets.targetCalories,
      targetProteinG: activeTargets.targetProteinG,
      targetCarbsG: activeTargets.targetCarbsG,
      targetFatG: activeTargets.targetFatG,
      waterTargetMl: activeTargets.waterTargetMl,
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
                    onChange={(e) => setAge(e.target.value)}
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

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Dietary Preference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'veg' as DietType, label: '🌱 Veg' },
                    { id: 'non_veg' as DietType, label: '🍗 Non-Veg' },
                    { id: 'eggetarian' as DietType, label: '🥚 Eggetarian' },
                    { id: 'vegan' as DietType, label: '🥗 Vegan' },
                    { id: 'jain' as DietType, label: '🌿 Jain' },
                    { id: 'keto' as DietType, label: '🥑 Keto' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setDietType(d.id);
                      }}
                      className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                        dietType === d.id
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs ring-1 ring-emerald-500/20'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
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
                    onChange={(e) => setHeightCm(e.target.value)}
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
                    onChange={(e) => setCurrentWeightKg(e.target.value)}
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
                    onChange={(e) => setWaistCm(e.target.value)}
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
                    onChange={(e) => setChestCm(e.target.value)}
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
                Phase 3 • Goal & Strategy
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Select Your Agenda & Pace
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Whether cutting fat, building muscle, or bulking, we calibrate your exact energy surplus or deficit.
              </p>
            </div>

            {/* Goal Selector (4 Clear Agenda Cards) */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                1. What is your primary objective?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'fat_loss' as FitnessGoal, label: 'Fat Loss', sub: 'Burn fat & get lean', icon: '🔥' },
                  { id: 'muscle_gain' as FitnessGoal, label: 'Muscle Growth', sub: 'Hypertrophy & clean bulk', icon: '💪' },
                  { id: 'weight_gain' as FitnessGoal, label: 'Weight Gain', sub: 'Healthy mass & bulking', icon: '📈' },
                  { id: 'maintenance' as FitnessGoal, label: 'Maintenance', sub: 'TDEE balance & tone', icon: '⚖️' },
                ].map((g) => {
                  const isSelected = goal === g.id;
                  return (
                    <button
                      type="button"
                      key={g.id}
                      onClick={() => handleGoalSelect(g.id)}
                      className={`p-2.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{g.icon}</span>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">
                          {g.label}
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                        {g.sub}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Weight Input */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                2. Target Weight (kg)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.5"
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(e.target.value)}
                  className="flex-1 p-3 text-base font-bold rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
                <span className="text-xs font-bold px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {numTargetWeight > numCurrentWeight
                    ? `+${(numTargetWeight - numCurrentWeight).toFixed(1)} kg ${goal === 'muscle_gain' ? 'Muscle' : 'Weight'}`
                    : numTargetWeight < numCurrentWeight
                    ? `-${(numCurrentWeight - numTargetWeight).toFixed(1)} kg Fat Loss`
                    : 'Maintain Weight'}
                </span>
              </div>
            </div>

            {/* Pace Options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                3. Choose Transformation Pace:
              </label>

              {(['sustainable', 'recommended', 'aggressive'] as const).map((pKey) => {
                const pConf = GOAL_PACES[goal][pKey];
                const isSelected = pace === pKey;

                return (
                  <div
                    key={pKey}
                    onClick={() => setPace(pKey)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-xs ring-1 ring-emerald-500/20'
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
                          {goal === 'maintenance'
                            ? 'Stable'
                            : pConf.calorieDelta > 0
                            ? `+${pConf.estimatedWeeklyKg} kg/wk`
                            : `~${pConf.estimatedWeeklyKg} kg/wk`}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {pConf.calorieDelta > 0
                            ? `+${pConf.calorieDelta} kcal surplus`
                            : pConf.calorieDelta < 0
                            ? `${pConf.calorieDelta} kcal deficit`
                            : 'TDEE Match'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                {goal === 'muscle_gain'
                  ? '💪 Muscle Growth Blueprint'
                  : goal === 'weight_gain'
                  ? '📈 Mass Bulking Blueprint'
                  : goal === 'fat_loss'
                  ? '🔥 Fat Loss Transformation Plan'
                  : '⚖️ Body Recomposition Blueprint'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Calibrated energy and macros specifically tuned for your {goal.replace('_', ' ')} goal.
              </p>
            </div>

            {/* Target Numbers Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-3xl p-4 shadow-md shadow-emerald-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                    Daily Calorie Target {activeTargets.targetCalories > activeTargets.tdee ? `(+${activeTargets.targetCalories - activeTargets.tdee} Surplus)` : activeTargets.targetCalories < activeTargets.tdee ? `(-${activeTargets.tdee - activeTargets.targetCalories} Deficit)` : '(Maintenance)'}
                  </span>
                  <div className="text-3xl font-black">{activeTargets.targetCalories} kcal</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                    Maintenance (TDEE)
                  </span>
                  <div className="text-sm font-extrabold">{activeTargets.tdee} kcal</div>
                </div>
              </div>

              {/* Macro breakdown */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/20 text-center">
                <div className="bg-white/15 rounded-xl p-2">
                  <div className="text-[10px] text-emerald-100">Protein</div>
                  <div className="text-sm font-bold">{activeTargets.targetProteinG}g</div>
                </div>
                <div className="bg-white/15 rounded-xl p-2">
                  <div className="text-[10px] text-emerald-100">Carbs</div>
                  <div className="text-sm font-bold">{activeTargets.targetCarbsG}g</div>
                </div>
                <div className="bg-white/15 rounded-xl p-2">
                  <div className="text-[10px] text-emerald-100">Fats</div>
                  <div className="text-sm font-bold">{activeTargets.targetFatG}g</div>
                </div>
              </div>
            </div>

            {/* Automatic AI Calibration Info */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">AI Calibrated Strategy</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {activeTargets.explanation}
                  </span>
                </div>
              </div>
            </div>

            {/* Journey Milestone Banner */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Projected Goal Date:
                  </span>
                  <strong className="text-emerald-900 dark:text-emerald-200 font-black">
                    {journey.estimatedTargetDate} {journey.weeksNeeded > 0 ? `(~${journey.weeksNeeded} weeks)` : ''}
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
