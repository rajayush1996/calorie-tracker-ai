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
  const target = targetMl || 2500;
  const percent = Math.min(100, Math.round((consumedMl / target) * 100));

  return (
    <div className="bg-gradient-to-br from-cyan-50/80 to-blue-50/50 dark:from-cyan-950/30 dark:to-blue-950/20 rounded-3xl p-4 border border-cyan-100/70 dark:border-cyan-900/40 shadow-2xs">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-cyan-500 text-white flex items-center justify-center shadow-xs shadow-cyan-500/20 shrink-0">
            <Droplets className="w-4.5 h-4.5 fill-white/80" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-700 dark:text-cyan-400 block">
              Hydration
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-slate-900 dark:text-white leading-none">
                {(consumedMl / 1000).toFixed(1)}L
              </span>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                / {(target / 1000).toFixed(1)}L ({percent}%)
              </span>
            </div>
          </div>
        </div>

        {/* Quick Tap Chips */}
        <div className="flex items-center gap-1.5 shrink-0">
          {consumedMl > 0 && (
            <button
              type="button"
              onClick={() => onUpdateWater(Math.max(0, consumedMl - 250))}
              className="w-7 h-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-500 hover:text-slate-900 flex items-center justify-center active:scale-95 transition-all text-xs"
              title="Remove 250ml"
            >
              <Minus className="w-3 h-3" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onUpdateWater(consumedMl + 250)}
            className="px-2.5 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-600 active:scale-95 text-white font-bold text-[11px] shadow-2xs transition-all flex items-center gap-0.5"
          >
            <Plus className="w-3 h-3" /> 250ml
          </button>
          <button
            type="button"
            onClick={() => onUpdateWater(consumedMl + 500)}
            className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-cyan-200 dark:border-cyan-800/60 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 font-bold text-[11px] transition-all"
          >
            +500ml
          </button>
        </div>
      </div>

      {/* Sleek Progress Bar */}
      <div className="w-full h-2 rounded-full bg-cyan-100 dark:bg-cyan-950/60 mt-3 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
