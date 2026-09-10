'use client';

import React, { useState, useEffect } from 'react';
import { EXERCISE_LIBRARY } from '@/data/exerciseLibrary';
import { ExerciseItem, WorkoutPlan, UserProfile } from '@/types';
import { ExerciseDiagram } from './ExerciseDiagram';
import { generateWorkoutPlan } from '@/services/aiService';
import { loadActiveWorkoutPlan, saveActiveWorkoutPlan } from '@/utils/storage';
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
  const [activeTab, setActiveTab] = useState<'generator' | 'library'>('generator');

  // Generator inputs
  const [focusArea, setFocusArea] = useState<string>('full_body');
  const [equipment, setEquipment] = useState<string>('home');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [fitnessLevel, setFitnessLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [showConfig, setShowConfig] = useState<boolean>(true);

  // Generated Plan State
  const [generatedPlan, setGeneratedPlan] = useState<WorkoutPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loggedExerciseIds, setLoggedExerciseIds] = useState<Record<string, boolean>>({});
  const [isWholeWorkoutLogged, setIsWholeWorkoutLogged] = useState<boolean>(false);

  // Library category
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const saved = loadActiveWorkoutPlan(userProfile?.userId);
    if (saved) {
      setGeneratedPlan(saved);
      setShowConfig(false);
    }
  }, [userProfile?.userId]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const plan = await generateWorkoutPlan({
        goal: userProfile?.goal || 'fat_loss',
        equipment,
        targetMuscle: focusArea,
        durationMinutes,
        fitnessLevel,
        customNotes,
        apiKey: userProfile?.apiKey,
      });

      setGeneratedPlan(plan);
      saveActiveWorkoutPlan(plan, userProfile?.userId);
      setShowConfig(false);
      setIsWholeWorkoutLogged(false);
      setLoggedExerciseIds({});
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to generate workout plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogSingleExercise = (ex: ExerciseItem) => {
    setLoggedExerciseIds((prev) => ({ ...prev, [ex.id]: true }));
    onLogExercise?.(ex);
    setTimeout(() => {
      setLoggedExerciseIds((prev) => ({ ...prev, [ex.id]: false }));
    }, 2500);
  };

  const handleLogWholeWorkout = () => {
    if (!generatedPlan) return;
    setIsWholeWorkoutLogged(true);
    onLogWorkout?.(generatedPlan);
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
                Workout & Form Guide
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Backend AI-generated routine & form cues
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

        {/* Top Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 mx-4 mt-3 bg-slate-100 dark:bg-slate-800/80 rounded-2xl gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('generator')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'generator'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>AI Workout Routine</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'library'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Movement Library</span>
          </button>
        </div>

        {/* Tab 1: AI Workout Generator */}
        {activeTab === 'generator' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Collapsible Input Configuration Box */}
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 space-y-3">
              <div
                onClick={() => setShowConfig(!showConfig)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Workout Customizer
                  </span>
                </div>
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {showConfig && (
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
                          onClick={() => setFocusArea(item.id)}
                          className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all ${
                            focusArea === item.id
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
                          onClick={() => setEquipment(item.id)}
                          className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all ${
                            equipment === item.id
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
                            onClick={() => setDurationMinutes(m)}
                            className={`flex-1 py-1 px-1 rounded-xl text-[11px] font-bold transition-all ${
                              durationMinutes === m
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
                            onClick={() => setFitnessLevel(lvl)}
                            className={`flex-1 py-1 px-1 rounded-xl text-[10px] font-bold transition-all ${
                              fitnessLevel === lvl
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

                  {/* Custom Notes / Restrictions */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Restrictions / Focus (Optional)
                    </label>
                    <input
                      type="text"
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      placeholder="e.g. Bad knees (no jumping), focus on upper chest..."
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Generate Button */}
                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={handleGenerate}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        <span>Formulating Custom Routine...</span>
                      </>
                    ) : (
                      <>
                        <Dumbbell className="w-3.5 h-3.5" />
                        <span>{generatedPlan ? 'Regenerate Workout' : 'Generate Workout with AI'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs border border-rose-100 dark:border-rose-900/50">
                {errorMessage}
              </div>
            )}

            {/* Generated Workout Plan Presentation */}
            {generatedPlan && (
              <div className="space-y-3.5 animate-in fade-in duration-200">
                {/* Routine Hero Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-50 to-emerald-500/5 dark:from-emerald-950/40 dark:via-slate-900 dark:to-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/60 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                        Personalized Session
                      </span>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        {generatedPlan.title}
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0">
                      {generatedPlan.difficulty}
                    </span>
                  </div>

                  {/* Stat Pills */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {generatedPlan.durationMinutes} mins
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      ~{generatedPlan.totalCaloriesBurnEstimate} kcal burn
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      {generatedPlan.exercises.length} movements
                    </span>
                  </div>

                  {/* Coach Cue */}
                  {generatedPlan.coachTip && (
                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-100 dark:border-emerald-900/40 text-[11px] text-slate-600 dark:text-slate-300">
                      <strong className="text-emerald-700 dark:text-emerald-400 font-bold block mb-0.5">
                        Coach Cue:
                      </strong>
                      {generatedPlan.coachTip}
                    </div>
                  )}

                  {/* Log Entire Workout Action */}
                  <button
                    type="button"
                    onClick={handleLogWholeWorkout}
                    disabled={isWholeWorkoutLogged}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 shadow-xs ${
                      isWholeWorkoutLogged
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
                  >
                    {isWholeWorkoutLogged ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        <span>Workout Logged to Daily Activity!</span>
                      </>
                    ) : (
                      <>
                        <Flame className="w-4 h-4 text-amber-300" />
                        <span>Log Whole Workout (~{generatedPlan.totalCaloriesBurnEstimate} kcal)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Warmup & Cooldown Tips */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                      Warm-Up
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 line-clamp-2">
                      {generatedPlan.warmupTip}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="font-bold text-blue-600 dark:text-blue-400 block mb-0.5">
                      Cool-Down
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 line-clamp-2">
                      {generatedPlan.cooldownTip}
                    </p>
                  </div>
                </div>

                {/* Exercise Cards */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Prescribed Movements:
                  </div>

                  {generatedPlan.exercises.map((ex, idx) => {
                    const isDone = !!loggedExerciseIds[ex.id];
                    return (
                      <div
                        key={ex.id || idx}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 transition-all hover:border-emerald-300 dark:hover:border-emerald-800"
                      >
                        {/* Details */}
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

                        {/* Movement Diagram */}
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

        {/* Tab 2: Movement Library */}
        {activeTab === 'library' && (
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Category Pills */}
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

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {filteredLibrary.map((ex) => {
                const isDone = !!loggedExerciseIds[ex.id];
                return (
                  <div
                    key={ex.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 transition-all hover:border-emerald-300 dark:hover:border-emerald-800"
                  >
                    {/* Left: Content & Tips */}
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

                    {/* Right: Simple Visual Diagram */}
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
