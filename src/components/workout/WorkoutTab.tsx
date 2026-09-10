'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { ExerciseDiagram } from '@/components/exercise/ExerciseDiagram';
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
  Dumbbell,
  Flame,
  CheckCircle2,
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
  Plus,
  X,
} from 'lucide-react';

interface WorkoutTabProps {
  userProfile?: UserProfile | null;
  onLogExercise?: (exercise: ExerciseItem) => void;
  onLogWorkout?: (plan: WorkoutPlan) => void;
  initialSelectedDayIndex?: number;
}

export const WorkoutTab: React.FC<WorkoutTabProps> = ({
  userProfile,
  onLogExercise,
  onLogWorkout,
  initialSelectedDayIndex,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'program' | 'single' | 'library'>('program');

  // Multi-Week Program State
  const [activeProgram, setActiveProgram] = useState<MultiWeekWorkoutProgram | null>(null);
  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(1);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean[]>>({});
  const [loggedDayIds, setLoggedDayIds] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'focused' | 'all_days'>('focused');

  // Intake & Program Config Modal/Sheet (Hidden by default when a program exists)
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [programSubMode, setProgramSubMode] = useState<'intake' | 'upload'>('intake');
  const [programGoal, setProgramGoal] = useState<string>('Muscle hypertrophy');
  const [programLevel, setProgramLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [programDays, setProgramDays] = useState<string>('4 days a week - Mon, Tue, Thu, Fri');
  const [programEquipment, setProgramEquipment] = useState<string>('Full commercial gym');
  const [programInjuries, setProgramInjuries] = useState<string>('None');
  const [programBaseline, setProgramBaseline] = useState<string>('Can bench 60kg, run 3km');
  const [programNotes, setProgramNotes] = useState<string>('');
  const [isGeneratingProgram, setIsGeneratingProgram] = useState<boolean>(false);
  const [uploadWorkoutText, setUploadWorkoutText] = useState<string>('');
  const [uploadedWorkoutFileName, setUploadedWorkoutFileName] = useState<string | null>(null);
  const [isParsingWorkoutDoc, setIsParsingWorkoutDoc] = useState<boolean>(false);
  const workoutFileInputRef = useRef<HTMLInputElement | null>(null);

  // Single-Day State
  const [singleFocus, setSingleFocus] = useState<string>('full_body');
  const [singleEquipment, setSingleEquipment] = useState<string>('home');
  const [singleDuration, setSingleDuration] = useState<number>(30);
  const [singleLevel, setSingleLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [singleNotes, setSingleNotes] = useState<string>('');
  const [isGeneratingSingle, setIsGeneratingSingle] = useState<boolean>(false);
  const [activeSinglePlan, setActiveSinglePlan] = useState<WorkoutPlan | null>(null);
  const [loggedExerciseIds, setLoggedExerciseIds] = useState<Record<string, boolean>>({});
  const [isWholeSingleLogged, setIsWholeSingleLogged] = useState<boolean>(false);

  // Library State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedDiagramId, setExpandedDiagramId] = useState<string | null>(null);

  // Initial Load from local storage
  useEffect(() => {
    const savedProgram = loadActiveWorkoutProgram(userProfile?.userId);
    if (savedProgram) {
      setActiveProgram(savedProgram);
    }
    const savedSingle = loadActiveWorkoutPlan(userProfile?.userId);
    if (savedSingle) {
      setActiveSinglePlan(savedSingle);
    }
    // Prefill user profile preferences if available
    if (userProfile?.goal) {
      if (userProfile.goal === 'fat_loss') setProgramGoal('Fat loss & conditioning');
      else if (userProfile.goal === 'muscle_gain') setProgramGoal('Muscle hypertrophy');
      else setProgramGoal('Body recomposition');
    }
  }, [userProfile?.userId, userProfile?.goal]);

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

  const getExerciseTypeBadge = (ex: ProgramExercise, idx: number, total: number): { label: string; color: string } => {
    if (ex.exerciseType) {
      const et = ex.exerciseType.toLowerCase();
      if (et.includes('compound') || et.includes('primary')) {
        return { label: ex.exerciseType, color: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' };
      }
      if (et.includes('secondary') || et.includes('builder')) {
        return { label: ex.exerciseType, color: 'bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800' };
      }
      if (et.includes('core')) {
        return { label: ex.exerciseType, color: 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800' };
      }
      if (et.includes('finisher') || et.includes('burn')) {
        return { label: ex.exerciseType, color: 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800' };
      }
      return { label: ex.exerciseType, color: 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800' };
    }
    if (idx === 0) {
      return { label: 'Primary Compound Lift', color: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' };
    }
    if (idx === 1) {
      return { label: 'Secondary Builder', color: 'bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800' };
    }
    if (idx === total - 1) {
      return { label: 'Finisher / Core Burn', color: 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800' };
    }
    if (idx === total - 2) {
      return { label: 'Core Movement', color: 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800' };
    }
    return { label: 'Isolation Accessory', color: 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800' };
  };

  // Automatically select today's day when week or program changes
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
  }, [selectedWeekNum, activeProgram, initialSelectedDayIndex]);

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
      setIsConfigOpen(false);
      setSelectedWeekNum(1);
      setSelectedDayIdx(0);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to generate progressive workout schedule');
    } finally {
      setIsGeneratingProgram(false);
    }
  };

  // Handler: Upload File
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

  // Handler: Import Doc
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
      setIsConfigOpen(false);
      setSelectedWeekNum(1);
      setSelectedDayIdx(0);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to import workout routine document');
    } finally {
      setIsParsingWorkoutDoc(false);
    }
  };

  // Handler: Interactive Set Toggle
  const handleToggleSet = (dayId: string, exId: string, setIdx: number, totalSets: number) => {
    const key = `${dayId}_${exId}`;
    setCompletedSets((prev) => {
      const current = prev[key] ? [...prev[key]] : Array(totalSets).fill(false);
      current[setIdx] = !current[setIdx];
      return { ...prev, [key]: current };
    });
  };

  // Handler: Log Program Day
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
      coachTip: `Progressive overload session: ${day.focus}.`,
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
        goal: (userProfile?.goal || 'general_health') as any,
        equipment: singleEquipment,
        durationMinutes: singleDuration,
        targetMuscle: singleFocus,
        fitnessLevel: singleLevel,
        customNotes: singleNotes,
        apiKey: userProfile?.apiKey,
      });

      setActiveSinglePlan(plan);
      saveActiveWorkoutPlan(plan, userProfile?.userId);
      setLoggedExerciseIds({});
      setIsWholeSingleLogged(false);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to generate custom workout');
    } finally {
      setIsGeneratingSingle(false);
    }
  };

  // Handler: Log 1-Day Whole
  const handleLogWholeSingle = () => {
    if (!activeSinglePlan) return;
    setIsWholeSingleLogged(true);
    onLogWorkout?.(activeSinglePlan);
  };

  // Handler: Log Single Exercise
  const handleLogSingleExercise = (ex: ExerciseItem) => {
    setLoggedExerciseIds((prev) => ({ ...prev, [ex.id]: true }));
    onLogExercise?.(ex);
  };

  const libraryCategories = [
    { id: 'all', label: 'All Lifts' },
    { id: 'chest', label: 'Chest' },
    { id: 'back', label: 'Back & Lats' },
    { id: 'legs', label: 'Legs & Glutes' },
    { id: 'core', label: 'Core / Abs' },
    { id: 'cardio', label: 'Conditioning' },
  ];

  const filteredLibrary =
    selectedCategory === 'all'
      ? EXERCISE_LIBRARY
      : EXERCISE_LIBRARY.filter((ex) => ex.category === selectedCategory);

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-150">
      {/* Top 3-Way Sub-Nav: Multi-Week (Default) | 1-Day | Library */}
      <div className="flex items-center justify-between gap-2">
        <div className="grid grid-cols-3 p-1 flex-1 bg-slate-100 dark:bg-slate-900 rounded-2xl gap-1 text-[11px] font-bold border border-slate-200/70 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveSubTab('program')}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'program'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Gym Split</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('single')}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'single'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Quick 1-Day</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('library')}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'library'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Form Guide</span>
          </button>
        </div>

        {/* Change/Edit Routine Button (Only shown in program tab if program exists) */}
        {activeSubTab === 'program' && activeProgram && (
          <button
            type="button"
            onClick={() => setIsConfigOpen(true)}
            className="h-9 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all shrink-0"
            title="Configure or upload new workout split"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>New Split</span>
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs border border-rose-200 dark:border-rose-900/50 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: MULTI-WEEK PROGRESSIVE GYM ROUTINE (HEVY / NIKE STYLE)             */}
      {/* ========================================================================= */}
      {activeSubTab === 'program' && (
        <div className="space-y-4">
          {activeProgram ? (
            <>
              {/* Routine Header Banner (Clean & High-Contrast) */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-slate-50 to-teal-500/10 dark:from-emerald-950/50 dark:via-slate-900 dark:to-teal-950/20 border border-emerald-200/80 dark:border-emerald-900/60 shadow-xs space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        {activeProgram.daysPerWeek} • {activeProgram.equipmentAccess}
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                        {activeProgram.experienceLevel}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {activeProgram.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {activeProgram.periodizationModel}
                </p>

                {activeProgram.injuryAccommodations &&
                  activeProgram.injuryAccommodations !== 'Standard biomechanical progression' && (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                      <span>Joint Accommodations: {activeProgram.injuryAccommodations}</span>
                    </div>
                  )}
              </div>

              {/* Week Selector Carousel */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Training Cycle
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    Week {selectedWeekNum} of {activeProgram.weeks?.length || 4}
                  </span>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {activeProgram.weeks?.map((wk) => {
                    const isSelected = selectedWeekNum === wk.weekNumber;
                    const isDeload = wk.weekFocus.toLowerCase().includes('deload');

                    return (
                      <button
                        key={wk.weekNumber}
                        type="button"
                        onClick={() => setSelectedWeekNum(wk.weekNumber)}
                        className={`flex-1 min-w-[100px] py-2 px-3 rounded-2xl text-left border transition-all ${
                          isSelected
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-[10px] font-black uppercase tracking-wider opacity-80">
                          Week {wk.weekNumber}
                        </div>
                        <div className="text-xs font-black truncate">
                          {isDeload ? 'Active Deload' : wk.weekFocus.split(':')[0]}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Day Switcher Carousel (Hevy / Strong Style) */}
              {selectedWeek && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Sessions for Week {selectedWeek.weekNumber}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({selectedWeek.days?.length || 4} Days • 5-6 Exercises)
                      </span>
                    </div>

                    {/* View Switcher: Today Focused vs All Days */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl text-[10px] font-bold border border-slate-200/60 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setViewMode('focused')}
                        className={`px-2 py-1 rounded-lg transition-all ${
                          viewMode === 'focused'
                            ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs font-black'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('all_days')}
                        className={`px-2 py-1 rounded-lg transition-all ${
                          viewMode === 'all_days'
                            ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs font-black'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        All Days
                      </button>
                    </div>
                  </div>

                  {/* Day Pills Bar */}
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {selectedWeek.days?.map((day, dIdx) => {
                      const isToday = isDayToday(day.dayName, day.dayTitle);
                      const isSelected = selectedDayIdx === dIdx;
                      const isLogged = !!loggedDayIds[day.id];

                      return (
                        <button
                          key={day.id || dIdx}
                          type="button"
                          onClick={() => {
                            setSelectedDayIdx(dIdx);
                            setViewMode('focused');
                          }}
                          className={`shrink-0 py-2.5 px-3.5 rounded-2xl text-left border transition-all relative ${
                            isSelected
                              ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                              : isToday
                              ? 'bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
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
                                    ? 'bg-white text-emerald-700'
                                    : 'bg-emerald-600 text-white animate-pulse'
                                }`}
                              >
                                TODAY
                              </span>
                            )}
                            {isLogged && (
                              <CheckCircle2
                                className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-emerald-500'}`}
                              />
                            )}
                          </div>
                          <div className="text-xs font-black truncate max-w-[140px]">
                            {day.dayTitle}
                          </div>
                          <div
                            className={`text-[10px] flex items-center gap-1.5 mt-0.5 font-medium ${
                              isSelected ? 'text-emerald-100' : 'text-slate-400'
                            }`}
                          >
                            <span>{day.exercises?.length || 6} exercises</span>
                            <span>•</span>
                            <span>~{day.estimatedCaloriesBurn} kcal</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* ACTIVE DAY FOCUSED GYM SESSION VIEW */}
                  {viewMode === 'focused' && (() => {
                    const activeDay = selectedWeek.days?.[selectedDayIdx] || selectedWeek.days?.[0];
                    if (!activeDay) return null;
                    const isDayLogged = !!loggedDayIds[activeDay.id];
                    const isToday = isDayToday(activeDay.dayName, activeDay.dayTitle);

                    return (
                      <div className="space-y-3.5 pt-1">
                        {/* Day Card Header & Quick Metrics */}
                        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                  {activeDay.dayName} • {selectedWeek.weekFocus}
                                </span>
                                {isToday && (
                                  <span className="text-[8px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500 text-white uppercase animate-pulse">
                                    ● TODAY
                                  </span>
                                )}
                              </div>
                              <h3 className="text-base font-black text-slate-900 dark:text-white">
                                {activeDay.dayTitle}
                              </h3>
                              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                Focus: {activeDay.focus}
                              </span>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-sm font-black text-amber-600 dark:text-amber-400 block">
                                ~{activeDay.estimatedCaloriesBurn} kcal
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold">
                                ⏱️ {activeDay.estimatedDurationMinutes} Min • {activeDay.exercises?.length || 6} Lifts
                              </span>
                            </div>
                          </div>

                          {/* Warmup & Cooldown Cards */}
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div className="p-2.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                              <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">
                                🏃 Warm-Up:
                              </span>
                              <p className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2">
                                {activeDay.warmup}
                              </p>
                            </div>
                            <div className="p-2.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                              <span className="font-bold text-blue-700 dark:text-blue-400 block mb-0.5">
                                🧘 Cool-Down:
                              </span>
                              <p className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2">
                                {activeDay.cooldown}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 5 to 6 Exercise Cards (Authentic Gym Session) */}
                        <div className="space-y-3">
                          {activeDay.exercises?.map((ex, exIdx) => {
                            const numSets = Number(ex.sets) || 3;
                            const setKey = `${activeDay.id}_${ex.id}`;
                            const setsStatus = completedSets[setKey] || Array(numSets).fill(false);
                            const allSetsDone = setsStatus.length > 0 && setsStatus.every(Boolean);
                            const typeBadge = getExerciseTypeBadge(ex, exIdx, activeDay.exercises?.length || 6);
                            const isDiagramOpen = expandedDiagramId === ex.id;

                            return (
                              <div
                                key={ex.id || exIdx}
                                className={`p-4 rounded-3xl border transition-all ${
                                  allSetsDone
                                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3 text-xs">
                                  <div className="flex-1 min-w-0">
                                    {/* Number & Name */}
                                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                      <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black flex items-center justify-center shrink-0">
                                        {exIdx + 1}
                                      </span>
                                      <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                                        {ex.name}
                                      </h4>
                                    </div>

                                    {/* Badges: Type & Target Sets x Reps */}
                                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                      <span
                                        className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${typeBadge.color}`}
                                      >
                                        {typeBadge.label}
                                      </span>
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                        {ex.sets} Sets × {ex.repRange}
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-medium">
                                        ⏱️ {ex.restSeconds}s rest
                                      </span>
                                    </div>

                                    {/* Progression Rule */}
                                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-300 mb-2 font-medium">
                                      <strong className="text-slate-800 dark:text-slate-200 font-bold">
                                        Progression Rule:{' '}
                                      </strong>
                                      {ex.progressionRule}
                                    </div>

                                    {/* Coaching Tips Bullet Points */}
                                    {ex.coachingTips?.length > 0 && (
                                      <ul className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5 mb-2">
                                        {ex.coachingTips.slice(0, 2).map((tip, tIdx) => (
                                          <li key={tIdx} className="flex items-start gap-1">
                                            <span className="text-emerald-500 font-bold">•</span>
                                            <span>{tip}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    )}

                                    {/* Toggle Form Diagram Expander */}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setExpandedDiagramId(isDiagramOpen ? null : ex.id)
                                      }
                                      className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                                    >
                                      <span>{isDiagramOpen ? 'Hide Diagram' : 'View Form Diagram & Cues'}</span>
                                      {isDiagramOpen ? (
                                        <ChevronUp className="w-3 h-3" />
                                      ) : (
                                        <ChevronDown className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>

                                  {/* Diagram Thumbnail */}
                                  <div className="shrink-0 w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-center p-1">
                                    <ExerciseDiagram type={ex.diagramType} className="w-14 h-14" />
                                  </div>
                                </div>

                                {/* Expanded Diagram View */}
                                {isDiagramOpen && (
                                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3 animate-in fade-in duration-150">
                                    <div className="w-28 h-28 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-2 border border-slate-200/60 dark:border-slate-700/60">
                                      <ExerciseDiagram type={ex.diagramType} className="w-24 h-24" />
                                    </div>
                                    <div className="flex-1 text-xs space-y-1">
                                      <div className="font-black text-slate-800 dark:text-slate-200">
                                        Key Biomechanical Cues:
                                      </div>
                                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Target: {ex.targetMuscle}
                                      </p>
                                      <ul className="text-[10px] text-slate-600 dark:text-slate-300 space-y-1">
                                        {ex.coachingTips.map((tip, idx) => (
                                          <li key={idx} className="flex items-start gap-1">
                                            <span className="text-emerald-500 font-bold">•</span>
                                            <span>{tip}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                )}

                                {/* Interactive Set Tracker Bubbles (Hevy / Strong Style) */}
                                <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                                  <span className="text-[10px] font-bold text-slate-400 mr-1">
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
                                        className={`h-8 px-2.5 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 active:scale-95 ${
                                          isSetDone
                                            ? 'bg-emerald-500 text-white shadow-2xs font-black'
                                            : 'bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-400'
                                        }`}
                                      >
                                        {isSetDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                        <span>Set {sIdx + 1}</span>
                                      </button>
                                    );
                                  })}
                                  {allSetsDone && (
                                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 ml-auto flex items-center gap-1">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>All Sets Done!</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Bottom Athletic Complete Workout Button */}
                        <button
                          type="button"
                          onClick={() => handleLogProgramDay(activeDay)}
                          className={`w-full h-11 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all ${
                            isDayLogged
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                          }`}
                        >
                          {isDayLogged ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                              <span>✓ Workout Logged to Daily Burn (~{activeDay.estimatedCaloriesBurn} kcal)</span>
                            </>
                          ) : (
                            <>
                              <Flame className="w-4 h-4 text-amber-300" />
                              <span>Finish & Log Workout Burn (~{activeDay.estimatedCaloriesBurn} kcal)</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })()}

                  {/* ALL DAYS VIEW (OVERVIEW OF WHOLE WEEK) */}
                  {viewMode === 'all_days' && (
                    <div className="space-y-4 pt-1">
                      {selectedWeek.days?.map((day, dIdx) => {
                        const isDayLogged = !!loggedDayIds[day.id];
                        const isToday = isDayToday(day.dayName, day.dayTitle);

                        return (
                          <div
                            key={day.id || dIdx}
                            className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
                          >
                            <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                              <div>
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                    {day.dayName}
                                  </span>
                                  {isToday && (
                                    <span className="text-[8px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500 text-white uppercase animate-pulse">
                                      TODAY
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                                  {day.dayTitle}
                                </h4>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  Focus: {day.focus}
                                </span>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">
                                  ~{day.estimatedCaloriesBurn} kcal
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  ⏱️ {day.estimatedDurationMinutes}m • {day.exercises?.length || 6} lifts
                                </span>
                              </div>
                            </div>

                            {/* Exercises overview */}
                            <div className="space-y-2">
                              {day.exercises?.map((ex, exIdx) => {
                                const typeBadge = getExerciseTypeBadge(ex, exIdx, day.exercises?.length || 6);
                                return (
                                  <div
                                    key={ex.id || exIdx}
                                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2 text-xs"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className="font-bold text-slate-900 dark:text-white truncate">
                                          {ex.name}
                                        </span>
                                        <span className={`text-[8px] font-black px-1.5 py-0.2 rounded-full border ${typeBadge.color}`}>
                                          {typeBadge.label}
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                        {ex.sets} Sets × {ex.repRange} • {ex.restSeconds}s rest
                                      </div>
                                    </div>
                                    <div className="shrink-0 w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center p-0.5">
                                      <ExerciseDiagram type={ex.diagramType} className="w-8 h-8" />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleLogProgramDay(day)}
                              className={`w-full h-10 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                                isDayLogged
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                              }`}
                            >
                              {isDayLogged ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Logged to Daily Burn!</span>
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
            </>
          ) : (
            /* ONBOARDING STATE: NO WORKOUT ROUTINE GENERATED YET */
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-center space-y-4">
              <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                <Dumbbell className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Personalized AI Strength Coach
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Build a structured, 4-week progressive overload routine with 5-6 exercises per day, periodized sets/reps, and joint-friendly alternatives.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
                {/* Option 1: AI Coach Intake */}
                <div
                  onClick={() => {
                    setProgramSubMode('intake');
                    setIsConfigOpen(true);
                  }}
                  className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 cursor-pointer hover:border-emerald-500 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-black text-emerald-900 dark:text-emerald-300">
                      Build With AI Coach
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Takes 30 seconds: Choose days, fitness baseline, and injury restrictions for a custom 4-week schedule.
                  </p>
                </div>

                {/* Option 2: Upload Routine Document */}
                <div
                  onClick={() => {
                    setProgramSubMode('upload');
                    setIsConfigOpen(true);
                  }}
                  className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-900/60 cursor-pointer hover:border-sky-500 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Upload className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span className="text-xs font-black text-sky-900 dark:text-sky-300">
                      Scan / Upload Gym Sheet
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Upload a photo of your gym whiteboard, coach PDF, or paste WhatsApp notes to auto-structure it.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setProgramSubMode('intake');
                  setIsConfigOpen(true);
                }}
                className="w-full h-11 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Build My 4-Week Schedule Now</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SINGLE 1-DAY WORKOUT (QUICK TARGETED BURNOUT)                      */}
      {/* ========================================================================= */}
      {activeSubTab === 'single' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Quick 1-Day Workout Builder
              </h3>
            </div>

            {/* Target Area */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Target Muscle Group
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'full_body', label: 'Full Body' },
                  { id: 'chest_arms', label: 'Chest & Arms' },
                  { id: 'back_shoulders', label: 'Back & Delts' },
                  { id: 'legs_glutes', label: 'Legs & Glutes' },
                  { id: 'core_abs', label: 'Core / Abs' },
                  { id: 'cardio_hiit', label: 'Cardio HIIT' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSingleFocus(item.id)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all ${
                      singleFocus === item.id
                        ? 'bg-emerald-500 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Equipment & Duration */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Location & Gear
                </label>
                <select
                  value={singleEquipment}
                  onChange={(e) => setSingleEquipment(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="home">Home Bodyweight</option>
                  <option value="dumbbells">Dumbbells</option>
                  <option value="gym">Full Gym</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Duration (Mins)
                </label>
                <div className="flex gap-1">
                  {[20, 30, 45].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSingleDuration(d)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold ${
                        singleDuration === d
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {d}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={isGeneratingSingle}
              onClick={handleGenerateSingle}
              className="w-full h-11 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              {isGeneratingSingle ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating Routine...</span>
                </>
              ) : (
                <>
                  <Flame className="w-3.5 h-3.5" />
                  <span>Generate 1-Day Workout</span>
                </>
              )}
            </button>
          </div>

          {/* Single Workout Output */}
          {activeSinglePlan && (
            <div className="space-y-3">
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {activeSinglePlan.title}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      ⏱️ {activeSinglePlan.durationMinutes} Min • {activeSinglePlan.exercises.length} Exercises
                    </span>
                  </div>
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                    ~{activeSinglePlan.totalCaloriesBurnEstimate} kcal
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  {activeSinglePlan.coachTip}
                </p>

                <button
                  type="button"
                  onClick={handleLogWholeSingle}
                  className={`w-full h-10 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    isWholeSingleLogged
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
                >
                  {isWholeSingleLogged ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Logged to Daily Burn!</span>
                    </>
                  ) : (
                    <>
                      <Flame className="w-3.5 h-3.5 text-amber-300" />
                      <span>Log Whole Workout (~{activeSinglePlan.totalCaloriesBurnEstimate} kcal)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Single Exercises */}
              <div className="space-y-2.5">
                {activeSinglePlan.exercises.map((ex, idx) => {
                  const isDone = !!loggedExerciseIds[ex.id];
                  return (
                    <div
                      key={ex.id || idx}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {ex.name}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            {ex.recommendedSets} • {ex.repsOrDuration}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1.5">
                          {ex.targetMuscle}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleLogSingleExercise(ex)}
                          className={`h-8 px-2.5 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all ${
                            isDone
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {isDone ? 'Logged ✓' : `Log Lift (~${ex.caloriesBurnEstimate} kcal)`}
                        </button>
                      </div>
                      <div className="shrink-0 w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-1">
                        <ExerciseDiagram type={ex.diagramType} className="w-12 h-12" />
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
      {/* TAB 3: MOVEMENT LIBRARY (FORM & DIAGRAM ENCYCLOPEDIA)                      */}
      {/* ========================================================================= */}
      {activeSubTab === 'library' && (
        <div className="space-y-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {libraryCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500 text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredLibrary.map((ex) => {
              const isDone = !!loggedExerciseIds[ex.id];
              return (
                <div
                  key={ex.id}
                  className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 shadow-xs"
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

                    <ul className="text-[10px] text-slate-600 dark:text-slate-300 space-y-1 mb-2.5">
                      {ex.coachingTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-emerald-500 font-bold shrink-0">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={() => handleLogSingleExercise(ex)}
                      className={`h-8 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {isDone ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Logged ({ex.caloriesBurnEstimate} kcal)!</span>
                        </>
                      ) : (
                        <>
                          <Flame className="w-3 h-3 text-amber-500" />
                          <span>Log Lift (~{ex.caloriesBurnEstimate} kcal)</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="shrink-0 w-20 h-20 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex items-center justify-center p-1">
                    <ExerciseDiagram type={ex.diagramType} className="w-16 h-16" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROGRAM RE-CONFIGURATION & UPLOAD MODAL (ONLY SHOWN ON EXPLICIT USER TAP) */}
      {/* ========================================================================= */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Program Setup & Intake
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Architect a 4-week split with 5-6 exercises per day
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConfigOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              {/* Sub-mode Toggle: Intake vs Upload */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl gap-1 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setProgramSubMode('intake')}
                  className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    programSubMode === 'intake'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs font-black'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>AI Coach Generator</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProgramSubMode('upload')}
                  className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    programSubMode === 'upload'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs font-black'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
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
                        'Strength & power',
                        'Body recomposition',
                      ].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setProgramGoal(g)}
                          className={`py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all text-left ${
                            programGoal === g
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Level & Days */}
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
                            className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold ${
                              programLevel === lvl
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
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
                        className="w-full px-2 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 border-none"
                      >
                        <option value="3 days a week - Mon, Wed, Fri">3 Days (Full Body)</option>
                        <option value="4 days a week - Mon, Tue, Thu, Fri">4 Days (Upper / Lower)</option>
                        <option value="5 days a week - Push, Pull, Legs, Upper, Lower">5 Days (PPLUL)</option>
                        <option value="6 days a week - Push, Pull, Legs x 2">6 Days (PPL x 2)</option>
                      </select>
                    </div>
                  </div>

                  {/* Equipment */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Equipment Access
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
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
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {eq}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Injuries */}
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
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
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
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 border-none"
                    />
                  </div>

                  {/* Baseline Fitness */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Current Baseline
                    </label>
                    <input
                      type="text"
                      value={programBaseline}
                      onChange={(e) => setProgramBaseline(e.target.value)}
                      placeholder="e.g. Can bench 60kg, run 3km, do 12 pullups"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 border-none"
                    />
                  </div>

                  {/* Optional Notes */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Retained Exercises / Custom Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={programNotes}
                      onChange={(e) => setProgramNotes(e.target.value)}
                      placeholder="e.g. Keep incline dumbbell press and Romanian deadlifts in the routine..."
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 border-none resize-none"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={isGeneratingProgram}
                    onClick={handleGenerateProgram}
                    className="w-full h-11 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-60"
                  >
                    {isGeneratingProgram ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        <span>Coach is Structuring 5-6 Exercises...</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Generate 4-Week Schedule</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                /* UPLOAD GYM CHART FORM */
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Upload Workout Plan / Whiteboard Photo
                    </label>
                    <div
                      onClick={() => workoutFileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/40"
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
                            Click to upload whiteboard photo or PDF
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Whiteboard photos, PDFs, and workout text supported
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
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 border-none resize-none font-mono text-[11px]"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={isParsingWorkoutDoc}
                    onClick={handleImportWorkoutDoc}
                    className="w-full h-11 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-60"
                  >
                    {isParsingWorkoutDoc ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        <span>Structuring 5-6 Exercise Routine...</span>
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
          </div>
        </div>
      )}
    </div>
  );
};
