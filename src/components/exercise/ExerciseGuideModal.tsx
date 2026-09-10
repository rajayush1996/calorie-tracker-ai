'use client';

import React, { useState, useEffect } from 'react';
import { EXERCISE_LIBRARY } from '@/data/exerciseLibrary';
import {
  ExerciseItem,
  WorkoutPlan,
  MultiWeekWorkoutProgram,
  ProgramWeek,
  ProgramTrainingDay,
  ProgramExercise,
  UserProfile,
} from '@/types';
import { ExerciseDiagram } from './ExerciseDiagram';
import { generateWorkoutPlan, generateMultiWeekWorkoutProgram } from '@/services/aiService';
import {
  loadActiveWorkoutPlan,
  saveActiveWorkoutPlan,
  loadActiveWorkoutProgram,
  saveActiveWorkoutProgram,
} from '@/utils/storage';
import {
  X,
  Flame,
  CheckCircle2,
  Dumbbell,
  Clock,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sliders,
  Calendar,
  TrendingUp,
  Target,
  Award,
  Activity,
  AlertCircle,
} from 'lucide-react';

interface ExerciseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile;
  onLogExercise?: (exercise: ExerciseItem) => void;
  onLogWorkout?: (plan: WorkoutPlan) => void;
}

export const ExerciseGuideModal: React.FC<ExerciseGuideModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onLogExercise,
  onLogWorkout,
}) => {
  const [activeTab, setActiveTab] = useState<'program' | 'single' | 'library'>('program');

  // ==========================================
  // MULTI-WEEK PROGRESSIVE PROGRAM STATE
  // ==========================================
  const [programGoal, setProgramGoal] = useState<string>('Muscle hypertrophy');
  const [programLevel, setProgramLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [programDays, setProgramDays] = useState<string>('4 days a week - Mon, Tue, Thu, Fri');
  const [programEquipment, setProgramEquipment] = useState<string>('Full commercial gym');
  const [programInjuries, setProgramInjuries] = useState<string>('None');
  const [programBaseline, setProgramBaseline] = useState<string>('Can bench 60kg, run 3km');
  const [programNotes, setProgramNotes] = useState<string>('');
  const [showProgramConfig, setShowProgramConfig] = useState<boolean>(true);
  const [isGeneratingProgram, setIsGeneratingProgram] = useState<boolean>(false);
  const [activeProgram, setActiveProgram] = useState<MultiWeekWorkoutProgram | null>(null);
  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(1);
  const [loggedDayIds, setLoggedDayIds] = useState<Record<string, boolean>>({});

  // ==========================================
  // SINGLE 1-DAY WORKOUT STATE
  // ==========================================
  const [singleFocus, setSingleFocus] = useState<string>('full_body');
  const [singleEquipment, setSingleEquipment] = useState<string>('home');
  const [singleDuration, setSingleDuration] = useState<number>(30);
  const [singleLevel, setSingleLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [singleNotes, setSingleNotes] = useState<string>('');
  const [showSingleConfig, setShowSingleConfig] = useState<boolean>(true);
  const [isGeneratingSingle, setIsGeneratingSingle] = useState<boolean>(false);
  const [activeSinglePlan, setActiveSinglePlan] = useState<WorkoutPlan | null>(null);
  const [loggedExerciseIds, setLoggedExerciseIds] = useState<Record<string, boolean>>({});
  const [isWholeSingleLogged, setIsWholeSingleLogged] = useState<boolean>(false);

  // ==========================================
  // LIBRARY STATE
  // ==========================================
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedProgram = loadActiveWorkoutProgram(userProfile?.userId);
    if (savedProgram) {
      setActiveProgram(savedProgram);
      setShowProgramConfig(false);
    }
    const savedSingle = loadActiveWorkoutPlan(userProfile?.userId);
    if (savedSingle) {
      setActiveSinglePlan(savedSingle);
      setShowSingleConfig(false);
    }
  }, [userProfile?.userId]);

  if (!isOpen) return null;

  // Handler: Generate Multi-Week Program
  const handleGenerateProgram = async () => {
    setIsGeneratingProgram(true);
    setErrorMessage(null);
    try {
      const program = await generateMultiWeekWorkoutProgram({
        primaryGoal: programGoal,
        experienceLevel: programLevel,
        daysAvailable: programDays,
        equipmentAccess: programEquipment,
        injuries: programInjuries,
        baselineFitness: programBaseline,
        existingRoutineNotes: programNotes,
        apiKey: userProfile?.apiKey,
      });

      setActiveProgram(program);
      saveActiveWorkoutProgram(program, userProfile?.userId);
      setShowProgramConfig(false);
      setSelectedWeekNum(1);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to generate progressive workout schedule');
    } finally {
      setIsGeneratingProgram(false);
    }
  };

  // Handler: Log a Day from the Multi-Week Program
  const handleLogProgramDay = (day: ProgramTrainingDay) => {
    setLoggedDayIds((prev) => ({ ...prev, [day.id]: true }));
    const pseudoPlan: WorkoutPlan = {
      id: day.id,
      title: `${day.dayName}: ${day.dayTitle}`,
      targetMuscle: day.focus,
      equipment: programEquipment,
      difficulty: programLevel,
      durationMinutes: day.estimatedDurationMinutes,
      totalCaloriesBurnEstimate: day.estimatedCaloriesBurn,
      coachTip: `Progressive overload day: ${day.focus}.`,
      warmupTip: day.warmup,
      cooldownTip: day.cooldown,
      exercises: day.exercises.map((e) => ({
        id: e.id,
        name: e.name,
        category: e.category,
        targetMuscle: e.targetMuscle,
        recommendedSets: `${e.sets} Sets`,
        repsOrDuration: e.repRange,
        difficulty: programLevel,
        coachingTips: e.coachingTips,
        caloriesBurnEstimate: e.caloriesBurnEstimate,
        diagramType: e.diagramType,
      })),
      createdAt: new Date().toISOString(),
    };
    onLogWorkout?.(pseudoPlan);
  };

  // Handler: Generate 1-Day Single Workout
  const handleGenerateSingle = async () => {
    setIsGeneratingSingle(true);
    setErrorMessage(null);
    try {
      const plan = await generateWorkoutPlan({
        goal: userProfile?.goal || 'fat_loss',
        equipment: singleEquipment,
        targetMuscle: singleFocus,
        durationMinutes: singleDuration,
        fitnessLevel: singleLevel,
        customNotes: singleNotes,
        apiKey: userProfile?.apiKey,
      });

      setActiveSinglePlan(plan);
      saveActiveWorkoutPlan(plan, userProfile?.userId);
      setShowSingleConfig(false);
      setIsWholeSingleLogged(false);
      setLoggedExerciseIds({});
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to generate single workout');
    } finally {
      setIsGeneratingSingle(false);
    }
  };

  const handleLogSingleExercise = (ex: ExerciseItem) => {
    setLoggedExerciseIds((prev) => ({ ...prev, [ex.id]: true }));
    onLogExercise?.(ex);
    setTimeout(() => {
      setLoggedExerciseIds((prev) => ({ ...prev, [ex.id]: false }));
    }, 2500);
  };

  const handleLogWholeSingle = () => {
    if (!activeSinglePlan) return;
    setIsWholeSingleLogged(true);
    onLogWorkout?.(activeSinglePlan);
  };

  const libraryCategories = [
    { id: 'all', label: 'All' },
    { id: 'chest', label: 'Chest & Arms' },
    { id: 'legs', label: 'Legs & Glutes' },
    { id: 'back', label: 'Back' },
    { id: 'core', label: 'Core & Abs' },
    { id: 'cardio', label: 'Cardio' },
  ];

  const filteredLibrary =
    selectedCategory === 'all'
      ? EXERCISE_LIBRARY
      : EXERCISE_LIBRARY.filter((ex) => ex.category === selectedCategory);

  const selectedWeek = activeProgram?.weeks?.find((w) => w.weekNumber === selectedWeekNum) || activeProgram?.weeks?.[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Personal Trainer & Coach
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Week-by-week progressive overload & form guide
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Way Top Tab Switcher */}
        <div className="grid grid-cols-3 p-1 mx-4 mt-3 bg-slate-100 dark:bg-slate-800/80 rounded-2xl gap-1 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('program')}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeTab === 'program'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>Multi-Week</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeTab === 'single'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Dumbbell className="w-3 h-3" />
            <span>1-Day Routine</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeTab === 'library'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Movement Form</span>
          </button>
        </div>

        {errorMessage && (
          <div className="mx-4 mt-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs border border-rose-100 dark:border-rose-900/50 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: MULTI-WEEK PROGRESSIVE PROGRAM (USER'S COMPLETE REQUEST)           */}
        {/* ========================================================================= */}
        {activeTab === 'program' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Input Config Accordion */}
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 space-y-3">
              <div
                onClick={() => setShowProgramConfig(!showProgramConfig)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Program Parameters & Coach Intake
                  </span>
                </div>
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showProgramConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {showProgramConfig && (
                <div className="space-y-3 pt-1 text-xs">
                  {/* Primary Goal */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Primary Goal
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 mb-1.5">
                      {[
                        'Muscle hypertrophy',
                        'Fat loss & conditioning',
                        'Raw strength & power',
                        'Body recomposition',
                      ].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setProgramGoal(g)}
                          className={`py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all text-left truncate ${
                            programGoal === g
                              ? 'bg-emerald-500 text-white shadow-2xs'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={programGoal}
                      onChange={(e) => setProgramGoal(e.target.value)}
                      placeholder="e.g. Muscle hypertrophy, athletic performance..."
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Experience Level & Days Available */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Experience Level
                      </label>
                      <div className="flex gap-1">
                        {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setProgramLevel(lvl)}
                            className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                              programLevel === lvl
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800'
                            }`}
                          >
                            {lvl.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Days Available
                      </label>
                      <select
                        value={programDays}
                        onChange={(e) => setProgramDays(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="3 days a week - Mon, Wed, Fri">3 Days (Full Body)</option>
                        <option value="4 days a week - Mon, Tue, Thu, Fri">4 Days (Upper / Lower)</option>
                        <option value="5 days a week - Push, Pull, Legs, Upper, Lower">5 Days (PPLUL)</option>
                        <option value="6 days a week - Push, Pull, Legs x 2">6 Days (PPL x 2)</option>
                      </select>
                    </div>
                  </div>

                  {/* Equipment Access */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Equipment Access
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 mb-1.5">
                      {[
                        'Full commercial gym',
                        'Home with dumbbells & bands',
                        'Home bodyweight only',
                        'Garage gym (Barbell & rack)',
                      ].map((eq) => (
                        <button
                          key={eq}
                          type="button"
                          onClick={() => setProgramEquipment(eq)}
                          className={`py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all text-left truncate ${
                            programEquipment === eq
                              ? 'bg-emerald-500 text-white shadow-2xs'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800'
                          }`}
                        >
                          {eq}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Injuries or Limitations */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Injuries or Limitations
                    </label>
                    <div className="flex gap-1.5 mb-1.5 overflow-x-auto no-scrollbar">
                      {['None', 'Bad lower back', 'Shoulder impingement', 'Bad knees'].map((inj) => (
                        <button
                          key={inj}
                          type="button"
                          onClick={() => setProgramInjuries(inj)}
                          className={`py-1 px-2 rounded-lg text-[10px] font-bold whitespace-nowrap ${
                            programInjuries === inj
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800'
                          }`}
                        >
                          {inj}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={programInjuries}
                      onChange={(e) => setProgramInjuries(e.target.value)}
                      placeholder="e.g. Bad lower back, shoulder impingement, or 'None'"
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Current Fitness Baseline */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Current Fitness Baseline
                    </label>
                    <input
                      type="text"
                      value={programBaseline}
                      onChange={(e) => setProgramBaseline(e.target.value)}
                      placeholder="e.g. Can bench 60kg, run 5km, do 12 pull-ups..."
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Optional Notes / Retained Exercises */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Existing Routine Notes / Retained Exercises (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={programNotes}
                      onChange={(e) => setProgramNotes(e.target.value)}
                      placeholder="e.g. Keep incline dumbbell press and Romanian deadlifts in the routine..."
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    disabled={isGeneratingProgram}
                    onClick={handleGenerateProgram}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
                  >
                    {isGeneratingProgram ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        <span>Coach is Architecting Your Progressive Schedule...</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{activeProgram ? 'Regenerate Multi-Week Program' : 'Generate Progressive Overload Schedule'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Program Output Presentation */}
            {activeProgram && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Program Header Hero */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-50 to-blue-500/5 dark:from-emerald-950/40 dark:via-slate-900 dark:to-blue-950/20 border border-emerald-200/80 dark:border-emerald-900/60 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                        Multi-Week Progressive Program
                      </span>
                      <h4 className="text-base font-black text-slate-900 dark:text-white">
                        {activeProgram.title}
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0">
                      {activeProgram.experienceLevel}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {activeProgram.periodizationModel}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      📅 {activeProgram.daysPerWeek}
                    </span>
                    <span>•</span>
                    <span>🏋️ {activeProgram.equipmentAccess}</span>
                    {activeProgram.injuryAccommodations && activeProgram.injuryAccommodations !== 'Standard biomechanical progression' && (
                      <>
                        <span>•</span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                          🛡️ {activeProgram.injuryAccommodations}
                        </span>
                      </>
                    )}
                  </div>

                  {activeProgram.coachVerdict && (
                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-100 dark:border-emerald-900/40 text-[11px] text-slate-700 dark:text-slate-300">
                      <strong className="text-emerald-700 dark:text-emerald-400 font-bold block mb-0.5">
                        Trainer's Overload Strategy:
                      </strong>
                      {activeProgram.coachVerdict}
                    </div>
                  )}

                  {/* Progression Rules List */}
                  {activeProgram.progressionRules?.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-[11px] space-y-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        Progression Rules to Follow:
                      </span>
                      <ul className="space-y-1 pl-3 list-disc text-slate-600 dark:text-slate-300 text-[10px]">
                        {activeProgram.progressionRules.map((rule, idx) => (
                          <li key={idx}>{rule}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Week Selector Tabs */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Schedule by Week
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {activeProgram.weeks?.length || 0} Weeks Planned
                    </span>
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    {activeProgram.weeks?.map((wk) => (
                      <button
                        key={wk.weekNumber}
                        type="button"
                        onClick={() => setSelectedWeekNum(wk.weekNumber)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                          selectedWeekNum === wk.weekNumber
                            ? 'bg-emerald-500 text-white shadow-2xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        Week {wk.weekNumber}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Week View */}
                {selectedWeek && (
                  <div className="space-y-3">
                    {/* Week Focus Callout */}
                    <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-0.5">
                        <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{selectedWeek.weekFocus}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        {selectedWeek.progressionNote}
                      </p>
                    </div>

                    {/* Days in Selected Week */}
                    <div className="space-y-3">
                      {selectedWeek.days?.map((day, dIdx) => {
                        const isDayLogged = !!loggedDayIds[day.id];
                        return (
                          <div
                            key={day.id || dIdx}
                            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3"
                          >
                            {/* Day Header */}
                            <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                  {day.dayName}
                                </span>
                                <h5 className="text-xs font-black text-slate-900 dark:text-white">
                                  {day.dayTitle}
                                </h5>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                  Focus: {day.focus}
                                </span>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block">
                                  ~{day.estimatedCaloriesBurn} kcal
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  ⏱️ {day.estimatedDurationMinutes}m
                                </span>
                              </div>
                            </div>

                            {/* Warmup & Cooldown */}
                            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                                  Warm-Up:
                                </span>
                                <p className="line-clamp-2">{day.warmup}</p>
                              </div>
                              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                                <span className="font-bold text-blue-600 dark:text-blue-400 block mb-0.5">
                                  Cool-Down:
                                </span>
                                <p className="line-clamp-2">{day.cooldown}</p>
                              </div>
                            </div>

                            {/* Exercises Table / List */}
                            <div className="space-y-2">
                              {day.exercises?.map((ex, exIdx) => (
                                <div
                                  key={ex.id || exIdx}
                                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                      <span className="font-bold text-slate-900 dark:text-white truncate">
                                        {ex.name}
                                      </span>
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0">
                                        {ex.sets} × {ex.repRange}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                                      <span>⏱️ {ex.restSeconds}s rest</span>
                                      <span>•</span>
                                      <span>🔥 ~{ex.caloriesBurnEstimate} kcal</span>
                                      {ex.rpeOrIntensity && (
                                        <>
                                          <span>•</span>
                                          <span className="font-semibold text-emerald-600">{ex.rpeOrIntensity}</span>
                                        </>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-600 dark:text-slate-400 italic">
                                      Rule: {ex.progressionRule}
                                    </p>
                                  </div>

                                  <div className="shrink-0 w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center p-0.5">
                                    <ExerciseDiagram type={ex.diagramType} className="w-10 h-10" />
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Action: Log Today's Program Day */}
                            <button
                              type="button"
                              onClick={() => handleLogProgramDay(day)}
                              disabled={isDayLogged}
                              className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                                isDayLogged
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-emerald-500 hover:bg-emerald-600 text-white active:scale-98'
                              }`}
                            >
                              {isDayLogged ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                                  <span>Logged to Today&apos;s Workout Burn!</span>
                                </>
                              ) : (
                                <>
                                  <Flame className="w-3.5 h-3.5 text-amber-300" />
                                  <span>Log {day.dayName} (~{day.estimatedCaloriesBurn} kcal)</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SINGLE 1-DAY WORKOUT (QUICK TARGETED SESSION)                      */}
        {/* ========================================================================= */}
        {activeTab === 'single' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Collapsible Input Configuration Box */}
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 space-y-3">
              <div
                onClick={() => setShowSingleConfig(!showSingleConfig)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Quick Session Customizer
                  </span>
                </div>
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showSingleConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {showSingleConfig && (
                <div className="space-y-3 pt-1 text-xs">
                  {/* Focus Area */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                      Target Focus
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'full_body', label: 'Full Body' },
                        { id: 'chest_arms', label: 'Chest & Arms' },
                        { id: 'back_shoulders', label: 'Back & Delts' },
                        { id: 'legs_glutes', label: 'Legs & Glutes' },
                        { id: 'core_abs', label: 'Core & Abs' },
                        { id: 'cardio_hiit', label: 'Cardio HIIT' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSingleFocus(item.id)}
                          className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all ${
                            singleFocus === item.id
                              ? 'bg-emerald-500 text-white shadow-2xs'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Equipment / Location */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                      Location & Gear
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'home', label: '🏠 Bodyweight' },
                        { id: 'dumbbells', label: '💪 Dumbbells' },
                        { id: 'gym', label: '🏋️ Gym Access' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSingleEquipment(item.id)}
                          className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all ${
                            singleEquipment === item.id
                              ? 'bg-emerald-500 text-white shadow-2xs'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration & Fitness Level */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                        Duration
                      </label>
                      <div className="flex gap-1">
                        {[20, 30, 45].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setSingleDuration(m)}
                            className={`flex-1 py-1 px-1 rounded-xl text-[11px] font-bold transition-all ${
                              singleDuration === m
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800'
                            }`}
                          >
                            {m}m
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                        Experience
                      </label>
                      <div className="flex gap-1">
                        {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setSingleLevel(lvl)}
                            className={`flex-1 py-1 px-1 rounded-xl text-[10px] font-bold transition-all ${
                              singleLevel === lvl
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800'
                            }`}
                          >
                            {lvl.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Custom Notes */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Restrictions / Focus (Optional)
                    </label>
                    <input
                      type="text"
                      value={singleNotes}
                      onChange={(e) => setSingleNotes(e.target.value)}
                      placeholder="e.g. Bad knees (no jumping), focus on upper chest..."
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    disabled={isGeneratingSingle}
                    onClick={handleGenerateSingle}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
                  >
                    {isGeneratingSingle ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        <span>Formulating Custom Session...</span>
                      </>
                    ) : (
                      <>
                        <Dumbbell className="w-3.5 h-3.5" />
                        <span>{activeSinglePlan ? 'Regenerate 1-Day Routine' : 'Generate 1-Day Workout with AI'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Generated Single Plan Presentation */}
            {activeSinglePlan && (
              <div className="space-y-3.5 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-50 to-emerald-500/5 dark:from-emerald-950/40 dark:via-slate-900 dark:to-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/60 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                        Targeted Single Session
                      </span>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        {activeSinglePlan.title}
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0">
                      {activeSinglePlan.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {activeSinglePlan.durationMinutes} mins
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      ~{activeSinglePlan.totalCaloriesBurnEstimate} kcal burn
                    </span>
                  </div>

                  {activeSinglePlan.coachTip && (
                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-100 dark:border-emerald-900/40 text-[11px] text-slate-600 dark:text-slate-300">
                      <strong className="text-emerald-700 dark:text-emerald-400 font-bold block mb-0.5">
                        Coach Cue:
                      </strong>
                      {activeSinglePlan.coachTip}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleLogWholeSingle}
                    disabled={isWholeSingleLogged}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 shadow-xs ${
                      isWholeSingleLogged
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
                  >
                    {isWholeSingleLogged ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        <span>Workout Logged to Daily Activity!</span>
                      </>
                    ) : (
                      <>
                        <Flame className="w-4 h-4 text-amber-300" />
                        <span>Log Whole Workout (~{activeSinglePlan.totalCaloriesBurnEstimate} kcal)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Exercises list */}
                <div className="space-y-3">
                  {activeSinglePlan.exercises.map((ex, idx) => {
                    const isDone = !!loggedExerciseIds[ex.id];
                    return (
                      <div
                        key={ex.id || idx}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 transition-all hover:border-emerald-300 dark:hover:border-emerald-800"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {ex.name}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0">
                              {ex.recommendedSets} • {ex.repsOrDuration}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                            {ex.targetMuscle}
                          </p>

                          <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 mb-2.5">
                            {ex.coachingTips.map((tip, tipIdx) => (
                              <li key={tipIdx} className="flex items-start gap-1.5">
                                <span className="text-emerald-500 font-bold shrink-0">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>

                          <button
                            type="button"
                            onClick={() => handleLogSingleExercise(ex)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                              isDone
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                            }`}
                          >
                            {isDone ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Logged (~{ex.caloriesBurnEstimate} kcal)!
                              </>
                            ) : (
                              <>
                                <Flame className="w-3.5 h-3.5 text-amber-500" />
                                Log Exercise (~{ex.caloriesBurnEstimate} kcal)
                              </>
                            )}
                          </button>
                        </div>

                        <div className="shrink-0 w-24 h-24 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 flex items-center justify-center p-1 shadow-2xs">
                          <ExerciseDiagram type={ex.diagramType} className="w-20 h-20" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: MOVEMENT LIBRARY                                                   */}
        {/* ========================================================================= */}
        {activeTab === 'library' && (
          <div className="flex-1 overflow-y-auto flex flex-col">
            <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {libraryCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-500 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {filteredLibrary.map((ex) => {
                const isDone = !!loggedExerciseIds[ex.id];
                return (
                  <div
                    key={ex.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 transition-all hover:border-emerald-300 dark:hover:border-emerald-800"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {ex.name}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          {ex.recommendedSets} • {ex.repsOrDuration}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                        {ex.targetMuscle}
                      </p>

                      <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 mb-2.5">
                        {ex.coachingTips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold shrink-0">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        type="button"
                        onClick={() => handleLogSingleExercise(ex)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                          isDone
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                        }`}
                      >
                        {isDone ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Logged ({ex.caloriesBurnEstimate} kcal)!
                          </>
                        ) : (
                          <>
                            <Flame className="w-3.5 h-3.5 text-amber-500" />
                            Log Exercise (~{ex.caloriesBurnEstimate} kcal)
                          </>
                        )}
                      </button>
                    </div>

                    <div className="shrink-0 w-24 h-24 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 flex items-center justify-center p-1 shadow-2xs">
                      <ExerciseDiagram type={ex.diagramType} className="w-20 h-20" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
