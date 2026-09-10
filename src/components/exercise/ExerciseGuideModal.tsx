'use client';

import React, { useState } from 'react';
import { EXERCISE_LIBRARY } from '@/data/exerciseLibrary';
import { ExerciseItem } from '@/types';
import { ExerciseDiagram } from './ExerciseDiagram';
import { X, Flame, CheckCircle2, Dumbbell, Filter } from 'lucide-react';

interface ExerciseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogExercise?: (exercise: ExerciseItem) => void;
}

export const ExerciseGuideModal: React.FC<ExerciseGuideModalProps> = ({
  isOpen,
  onClose,
  onLogExercise,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loggedIds, setLoggedIds] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'chest', label: 'Chest & Arms' },
    { id: 'legs', label: 'Legs & Glutes' },
    { id: 'back', label: 'Back' },
    { id: 'core', label: 'Core & Abs' },
    { id: 'cardio', label: 'Cardio' },
  ];

  const filtered =
    selectedCategory === 'all'
      ? EXERCISE_LIBRARY
      : EXERCISE_LIBRARY.filter((ex) => ex.category === selectedCategory);

  const handleLog = (ex: ExerciseItem) => {
    setLoggedIds((prev) => ({ ...prev, [ex.id]: true }));
    onLogExercise?.(ex);
    setTimeout(() => {
      setLoggedIds((prev) => ({ ...prev, [ex.id]: false }));
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Exercise & Form Guide
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Simple movement diagrams & coaching cues
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

        {/* Category Pills */}
        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
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
          {filtered.map((ex) => {
            const isDone = !!loggedIds[ex.id];
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
                    onClick={() => handleLog(ex)}
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
                        Log Workout (~{ex.caloriesBurnEstimate} kcal)
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
    </div>
  );
};
