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
import {
  generateWorkoutPlan,
  generateMultiWeekWorkoutProgram,
  parseWorkoutDocument,
} from '@/services/aiService';
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
  Upload,
  FileText,
  Check,
} from 'lucide-react';

interface ExerciseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile;
  onLogExercise?: (exercise: ExerciseItem) => void;
  onLogWorkout?: (plan: WorkoutPlan) => void;
  initialSelectedDayIndex?: number;
}

export const ExerciseGuideModal: React.FC<ExerciseGuideModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onLogExercise,
  onLogWorkout,
  initialSelectedDayIndex,
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

  // Sub-mode: AI Coach Intake vs Upload Gym/Trainer Chart
  const [programSubMode, setProgramSubMode] = useState<'intake' | 'upload'>('intake');
  const [uploadWorkoutText, setUploadWorkoutText] = useState<string>('');
  const [uploadedWorkoutFileName, setUploadedWorkoutFileName] = useState<string | null>(null);
  const [isParsingWorkoutDoc, setIsParsingWorkoutDoc] = useState<boolean>(false);
  const workoutFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Day Switcher & Gym Focus Mode State
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'gym_focus' | 'all_days'>('gym_focus');
  const [completedSets, setCompletedSets] = useState<Record<string, boolean[]>>({});

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

  const selectedWeek =
    activeProgram?.weeks?.find((w) => w.weekNumber === selectedWeekNum) ||
    activeProgram?.weeks?.[0];

  const isDayToday = (dayName: string, dayTitle: string): boolean => {
    const currentDayIndex = new Date().getDay(); // 0: Sun, 1: Mon, ..., 6: Sat
    const dayNamesShort = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayNamesFull = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const text = `${dayName} ${dayTitle}`.toLowerCase();
    return text.includes(dayNamesShort[currentDayIndex]) || text.includes(dayNamesFull[currentDayIndex]);
  };

  const getExerciseTypeBadge = (ex: ProgramExercise, idx: number, total: number): string => {
    if (ex.exerciseType) return ex.exerciseType;
    if (idx === 0) return 'Primary Compound Lift';
    if (idx === 1) return 'Secondary Builder';
    if (idx === total - 1) return 'Finisher / Core Burn';
    if (idx === total - 2) return 'Core Movement';
    return 'Isolation Accessory';
  };

  // Automatically select today's day when week or program changes or modal opens
  useEffect(() => {
    if (selectedWeek?.days && selectedWeek.days.length > 0) {
      if (
        initialSelectedDayIndex !== undefined &&
        initialSelectedDayIndex >= 0 &&
        initialSelectedDayIndex < selectedWeek.days.length
      ) {
        setSelectedDayIdx(initialSelectedDayIndex);
        return;
      }
      const todayIndex = selectedWeek.days.findIndex((d) => isDayToday(d.dayName, d.dayTitle));
      if (todayIndex !== -1) {
        setSelectedDayIdx(todayIndex);
      } else {
        const currentDay = new Date().getDay();
        const defaultMap: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3, 0: 0 };
        const fallbackIdx = Math.min(defaultMap[currentDay] ?? 0, selectedWeek.days.length - 1);
        setSelectedDayIdx(fallbackIdx);
      }
    }
  }, [selectedWeekNum, activeProgram, isOpen, initialSelectedDayIndex]);

  if (!isOpen) return null;

  // Handler: Generate Multi-Week Program via Coach Intake
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
      setSelectedDayIdx(0);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to generate progressive workout schedule');
    } finally {
      setIsGeneratingProgram(false);
    }
  };

  // Handler: Upload Gym Chart / Routine Document
  const handleWorkoutFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedWorkoutFileName(file.name);
    const reader = new FileReader();

    if (file.type.includes('text') || file.name.endsWith('.txt')) {
      reader.onload = (event) => {
        setUploadWorkoutText(event.target?.result as string);
      };
      reader.readAsText(file);
    } else {
      reader.onload = (event) => {
        const resultStr = (event.target?.result as string) || '';
        setUploadWorkoutText(
          `[Attached Gym/Trainer Document: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]\n${resultStr.slice(0, 350)}`
        );
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler: Parse & Import Workout Document
  const handleImportWorkoutDoc = async () => {
    if (!uploadWorkoutText.trim()) {
      setErrorMessage('Please upload a workout file or paste your gym routine / trainer notes first.');
      return;
    }

    setIsParsingWorkoutDoc(true);
    setErrorMessage(null);
    try {
      const program = await parseWorkoutDocument({
        fileText: uploadWorkoutText,
        fileName: uploadedWorkoutFileName || 'Trainer Workout Schedule',
        experienceLevel: programLevel,
        equipmentAccess: programEquipment,
        apiKey: userProfile?.apiKey,
        provider: userProfile?.aiProvider,
      });

      setActiveProgram(program);
      saveActiveWorkoutProgram(program, userProfile?.userId);
      setShowProgramConfig(false);
      setSelectedWeekNum(1);
      setSelectedDayIdx(0);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to import workout routine document');
    } finally {
      setIsParsingWorkoutDoc(false);
    }
  };

  // Handler: Toggle Set Check in Gym Mode
  const handleToggleSet = (dayId: string, exId: string, setIdx: number, totalSets: number) => {
    const key = `${dayId}_${exId}`;
    setCompletedSets((prev) => {
      const current = prev[key] ? [...prev[key]] : Array(totalSets).fill(false);
      current[setIdx] = !current[setIdx];
      return { ...prev, [key]: current };
    });
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
                  {/* Sub-mode Toggle: AI Coach Intake vs Upload Gym Chart */}
                  <div className="grid grid-cols-2 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl gap-1 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setProgramSubMode('intake')}
                      className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        programSubMode === 'intake'
                          ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>AI Coach Intake</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setProgramSubMode('upload')}
                      className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        programSubMode === 'upload'
                          ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Gym Chart</span>
                    </button>
                  </div>

                  {programSubMode === 'intake' ? (
                    <>
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
                        className="w-full h-11 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isGeneratingProgram ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                            <span>Coach is Architecting 5-6 Exercise Routine...</span>
                          </>
                        ) : (
                          <>
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>{activeProgram ? 'Regenerate Multi-Week Program' : 'Generate Progressive Overload Schedule'}</span>
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    /* UPLOAD GYM CHART / ROUTINE FORM */
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Upload Workout Plan / Gym Whiteboard Photo (PDF / Image / TXT)
                        </label>
                        <div
                          onClick={() => workoutFileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-white/50 dark:bg-slate-900/50"
                        >
                          <input
                            type="file"
                            ref={workoutFileInputRef}
                            onChange={handleWorkoutFileUpload}
                            accept="image/*,application/pdf,text/plain"
                            className="hidden"
                          />
                          <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                          {uploadedWorkoutFileName ? (
                            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              Attached: {uploadedWorkoutFileName}
                            </div>
                          ) : (
                            <>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Click to upload gym routine photo or PDF
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Whiteboard photos, trainer sheets, PDFs, and workout text supported
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Or Paste Routine Notes / WhatsApp Workout
                        </label>
                        <textarea
                          rows={3}
                          value={uploadWorkoutText}
                          onChange={(e) => setUploadWorkoutText(e.target.value)}
                          placeholder="e.g. Day 1: Bench Press 4x8, Incline DB 3x10, Chest Flyes 3x12, Lateral Raises 4x15, Skull Crushers 3x12, Cable Crunch 3x15..."
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 resize-none font-mono text-[11px]"
                        />
                      </div>

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
                            Equipment Access
                          </label>
                          <select
                            value={programEquipment}
                            onChange={(e) => setProgramEquipment(e.target.value)}
                            className="w-full px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                          >
                            <option value="Full commercial gym">Commercial Gym</option>
                            <option value="Home with dumbbells & bands">Home Dumbbells</option>
                            <option value="Garage gym (Barbell & rack)">Barbell & Rack</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isParsingWorkoutDoc}
                        onClick={handleImportWorkoutDoc}
                        className="w-full h-11 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isParsingWorkoutDoc ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                            <span>Parsing & Structuring 5-6 Exercise Days...</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-3.5 h-3.5" />
                            <span>Import & Structure 4-Week Schedule</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
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

                    {/* View Mode Header & Toggle */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                          Training Days
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          ({selectedWeek.days?.length || 0} Sessions • 5-6 Exercises)
                        </span>
                      </div>

                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => setViewMode('gym_focus')}
                          className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                            viewMode === 'gym_focus'
                              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs font-black'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <span>📱 Today / Focused</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode('all_days')}
                          className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                            viewMode === 'all_days'
                              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs font-black'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <span>📋 All Days</span>
                        </button>
                      </div>
                    </div>

                    {/* Day Switcher Button Bar */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                      {selectedWeek.days?.map((day, dIdx) => {
                        const isToday = isDayToday(day.dayName, day.dayTitle);
                        const isSelected = selectedDayIdx === dIdx;
                        const isDayLogged = !!loggedDayIds[day.id];

                        return (
                          <button
                            key={day.id || dIdx}
                            type="button"
                            onClick={() => {
                              setSelectedDayIdx(dIdx);
                              setViewMode('gym_focus');
                            }}
                            className={`shrink-0 py-2 px-3 rounded-2xl text-left border transition-all relative ${
                              isSelected
                                ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                                : isToday
                                ? 'bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:border-emerald-500'
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span
                                className={`text-[10px] font-black uppercase tracking-wider ${
                                  isSelected ? 'text-emerald-100' : 'text-emerald-600 dark:text-emerald-400'
                                }`}
                              >
                                {day.dayName}
                              </span>
                              {isToday && (
                                <span
                                  className={`text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase ${
                                    isSelected
                                      ? 'bg-white text-emerald-700 font-bold'
                                      : 'bg-emerald-600 text-white animate-pulse font-bold'
                                  }`}
                                >
                                  TODAY
                                </span>
                              )}
                              {isDayLogged && (
                                <CheckCircle2
                                  className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-emerald-500'}`}
                                />
                              )}
                            </div>
                            <div className="text-xs font-bold truncate max-w-[130px]">
                              {day.dayTitle}
                            </div>
                            <div
                              className={`text-[10px] flex items-center gap-1.5 mt-0.5 ${
                                isSelected ? 'text-emerald-100' : 'text-slate-400'
                              }`}
                            >
                              <span>{day.exercises?.length || 0} ex</span>
                              <span>•</span>
                              <span>~{day.estimatedCaloriesBurn} kcal</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* FOCUSED GYM MODE (TODAY'S DAY ONLY - ZERO SCROLLING) */}
                    {viewMode === 'gym_focus' && (
                      (() => {
                        const activeDay = selectedWeek.days?.[selectedDayIdx] || selectedWeek.days?.[0];
                        if (!activeDay) return null;
                        const isDayLogged = !!loggedDayIds[activeDay.id];
                        const isToday = isDayToday(activeDay.dayName, activeDay.dayTitle);

                        return (
                          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-slate-800 shadow-sm space-y-3.5 animate-in fade-in duration-150">
                            {/* Gym Day Header */}
                            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                      {activeDay.dayName}
                                    </span>
                                    {isToday && (
                                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                        ● TODAY&apos;S WORKOUT
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                                    {activeDay.dayTitle}
                                  </h4>
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    Focus: {activeDay.focus}
                                  </span>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">
                                    ~{activeDay.estimatedCaloriesBurn} kcal
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    ⏱️ {activeDay.estimatedDurationMinutes}m • {activeDay.exercises?.length || 6} exercises
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Warmup & Cooldown */}
                            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                                  Warm-Up:
                                </span>
                                <p className="line-clamp-2">{activeDay.warmup}</p>
                              </div>
                              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                                <span className="font-bold text-blue-600 dark:text-blue-400 block mb-0.5">
                                  Cool-Down:
                                </span>
                                <p className="line-clamp-2">{activeDay.cooldown}</p>
                              </div>
                            </div>

                            {/* Exercises Table (Authentic 5 to 6 Exercises) */}
                            <div className="space-y-2.5">
                              {activeDay.exercises?.map((ex, exIdx) => {
                                const numSets = Number(ex.sets) || 3;
                                const setKey = `${activeDay.id}_${ex.id}`;
                                const setsStatus = completedSets[setKey] || Array(numSets).fill(false);
                                const allSetsDone = setsStatus.length > 0 && setsStatus.every(Boolean);

                                return (
                                  <div
                                    key={ex.id || exIdx}
                                    className={`p-3 rounded-2xl border transition-all ${
                                      allSetsDone
                                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200/70 dark:border-slate-800'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-3 text-xs">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                          <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black flex items-center justify-center shrink-0">
                                            {exIdx + 1}
                                          </span>
                                          <span className="font-black text-slate-900 dark:text-white truncate">
                                            {ex.name}
                                          </span>
                                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/40 shrink-0">
                                            {getExerciseTypeBadge(ex, exIdx, activeDay.exercises?.length || 6)}
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
                                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                {ex.rpeOrIntensity}
                                              </span>
                                            </>
                                          )}
                                        </div>

                                        <p className="text-[10px] text-slate-600 dark:text-slate-400 italic mb-1.5">
                                          Rule: {ex.progressionRule}
                                        </p>

                                        {ex.coachingTips?.length > 0 && (
                                          <ul className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5 mb-1">
                                            {ex.coachingTips.slice(0, 2).map((tip, tIdx) => (
                                              <li key={tIdx} className="flex items-start gap-1">
                                                <span className="text-emerald-500 font-bold">•</span>
                                                <span className="line-clamp-1">{tip}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                      </div>

                                      <div className="shrink-0 w-14 h-14 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center p-0.5">
                                        <ExerciseDiagram type={ex.diagramType} className="w-12 h-12" />
                                      </div>
                                    </div>

                                    {/* Gym Interactive Set Tracker Bubbles */}
                                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/80">
                                      <span className="text-[10px] font-bold text-slate-400 mr-0.5">
                                        Sets:
                                      </span>
                                      {Array.from({ length: numSets }).map((_, sIdx) => {
                                        const isSetDone = !!setsStatus[sIdx];
                                        return (
                                          <button
                                            key={sIdx}
                                            type="button"
                                            onClick={() =>
                                              handleToggleSet(activeDay.id, ex.id, sIdx, numSets)
                                            }
                                            className={`h-7 px-2 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                                              isSetDone
                                                ? 'bg-emerald-500 text-white shadow-2xs font-black'
                                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-400'
                                            }`}
                                          >
                                            {isSetDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                            <span>Set {sIdx + 1}</span>
                                          </button>
                                        );
                                      })}
                                      {allSetsDone && (
                                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 ml-auto flex items-center gap-1">
                                          <CheckCircle2 className="w-3 h-3" />
                                          <span>Done</span>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Action: Log Today's Program Day */}
                            <button
                              type="button"
                              onClick={() => handleLogProgramDay(activeDay)}
                              disabled={isDayLogged}
                              className={`w-full h-11 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs ${
                                isDayLogged
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : 'bg-emerald-500 hover:bg-emerald-600 text-white active:scale-98'
                              }`}
                            >
                              {isDayLogged ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                                  <span>Workout Logged to Daily Activity!</span>
                                </>
                              ) : (
                                <>
                                  <Flame className="w-4 h-4 text-amber-300" />
                                  <span>Log {activeDay.dayName} (~{activeDay.estimatedCaloriesBurn} kcal)</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })()
                    )}

                    {/* ALL DAYS VIEW (FULL SCHEDULE OVERVIEW) */}
                    {viewMode === 'all_days' && (
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
                                    ⏱️ {day.estimatedDurationMinutes}m • {day.exercises?.length || 6} ex
                                  </span>
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
                                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                        <span className="font-bold text-slate-900 dark:text-white truncate">
                                          {ex.name}
                                        </span>
                                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/40 shrink-0">
                                          {getExerciseTypeBadge(ex, exIdx, day.exercises?.length || 6)}
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
                                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{ex.rpeOrIntensity}</span>
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
                                className={`w-full h-11 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                                  isDayLogged
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'bg-emerald-500 hover:bg-emerald-600 text-white active:scale-98 shadow-xs'
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
                    )}
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
                    className="w-full h-11 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
                    className={`w-full h-11 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 shadow-xs ${
                      isWholeSingleLogged
                        ? 'bg-emerald-600 text-white shadow-2xs'
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
                            className={`h-9 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shrink-0 ${
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
                        className={`h-9 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shrink-0 ${
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
