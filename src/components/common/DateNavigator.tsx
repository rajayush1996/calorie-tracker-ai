'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import { formatDisplayDate, shiftDate, getTodayDateString, getYesterdayDateString } from '@/utils/dateUtils';

interface DateNavigatorProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  className?: string;
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({
  selectedDate,
  onSelectDate,
  className = '',
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();
  const { label, subLabel, isToday, isYesterday } = formatDisplayDate(selectedDate);

  const canGoForward = selectedDate < today;

  const handlePrevDay = () => {
    onSelectDate(shiftDate(selectedDate, -1));
  };

  const handleNextDay = () => {
    if (canGoForward) {
      onSelectDate(shiftDate(selectedDate, 1));
    }
  };

  const handleOpenCalendar = () => {
    if (dateInputRef.current) {
      if ('showPicker' in HTMLInputElement.prototype) {
        try {
          dateInputRef.current.showPicker();
        } catch {
          dateInputRef.current.focus();
        }
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl p-2.5 border border-slate-100 dark:border-slate-800 shadow-2xs ${className}`}>
      <div className="flex items-center justify-between gap-1.5">
        {/* Previous Day Button */}
        <button
          type="button"
          onClick={handlePrevDay}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
          title="Previous Day"
          aria-label="Previous Day"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Center: Interactive Calendar & Date Display */}
        <div
          onClick={handleOpenCalendar}
          className="flex-1 flex items-center justify-center gap-2 py-1 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors relative"
          title="Click to open calendar"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CalendarIcon className="w-3.5 h-3.5" />
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 leading-none">
              <span className="text-xs font-black text-slate-900 dark:text-white">
                {label}
              </span>
              {isToday && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </div>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block mt-0.5 leading-none">
              {subLabel}
            </span>
          </div>

          {/* Hidden native date picker */}
          <input
            ref={dateInputRef}
            type="date"
            max={today}
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) {
                onSelectDate(e.target.value);
              }
            }}
            className="absolute inset-0 opacity-0 pointer-events-none w-full h-full"
            tabIndex={-1}
          />
        </div>

        {/* Next Day Button */}
        <button
          type="button"
          onClick={handleNextDay}
          disabled={!canGoForward}
          className={`p-2 rounded-xl transition-all ${
            canGoForward
              ? 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95'
              : 'text-slate-200 dark:text-slate-700 cursor-not-allowed'
          }`}
          title={canGoForward ? 'Next Day' : 'Cannot navigate to future days'}
          aria-label="Next Day"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Jump Shortcuts if not on Today */}
      {!isToday && (
        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 text-[10px]">
            Viewing past log ({selectedDate})
          </span>
          <div className="flex items-center gap-1">
            {!isYesterday && (
              <button
                type="button"
                onClick={() => onSelectDate(yesterday)}
                className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200"
              >
                Yesterday
              </button>
            )}
            <button
              type="button"
              onClick={() => onSelectDate(today)}
              className="px-2.5 py-0.5 rounded-lg bg-emerald-500 text-white font-bold flex items-center gap-1 hover:bg-emerald-600 shadow-2xs active:scale-95 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Today</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
