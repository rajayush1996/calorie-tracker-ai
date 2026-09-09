'use client';

import React from 'react';
import { Droplets, Plus, Minus } from 'lucide-react';

interface WaterTrackerProps {
  consumedMl: number;
  targetMl: number;
  onUpdateWater: (amountMl: number) => void;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({
  consumedMl,
  targetMl,
  onUpdateWater,
}) => {
  const percent = Math.min(100, Math.round((consumedMl / (targetMl || 2500)) * 100));

  return (
    <div className="bg-gradient-to-br from-cyan-50 to-blue-50/70 dark:from-cyan-950/20 dark:to-blue-950/20 rounded-3xl p-4 border border-cyan-100/80 dark:border-cyan-900/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500 text-white flex items-center justify-center shadow-xs shadow-cyan-500/30">
            <Droplets className="w-5 h-5 fill-white/80" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Water Intake
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                {(consumedMl / 1000).toFixed(1)}L
              </span>{' '}
              / {(targetMl / 1000).toFixed(1)}L ({percent}%)
            </p>
          </div>
        </div>

        {/* Quick Add Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onUpdateWater(Math.max(0, consumedMl - 250))}
            className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 active:scale-95 transition-all text-xs"
            title="Subtract 250ml"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onUpdateWater(consumedMl + 250)}
            className="px-2.5 h-8 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white flex items-center gap-1 font-semibold text-xs shadow-xs active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> 250ml
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-cyan-100 dark:bg-cyan-950/60 mt-3 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
