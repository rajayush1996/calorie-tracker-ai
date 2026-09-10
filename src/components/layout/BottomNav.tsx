'use client';

import React from 'react';
import { Home, Plus, UtensilsCrossed, TrendingUp, Dumbbell } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'workout' | 'logger' | 'diet' | 'analytics' | 'community' | 'audit' | 'profile';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'dashboard' as const, label: 'Today', icon: Home },
    { id: 'workout' as const, label: 'Workout', icon: Dumbbell },
    { id: 'logger' as const, label: 'Log Food', icon: Plus, isHighlight: true },
    { id: 'diet' as const, label: 'Diet Plan', icon: UtensilsCrossed },
    { id: 'analytics' as const, label: 'Journey', icon: TrendingUp },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 pb-safe transition-colors">
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isHighlight) {
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className="relative -top-4 flex flex-col items-center group focus:outline-none"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-emerald-500/30 scale-105'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25 group-hover:scale-105'
                  }`}
                >
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span
                  className={`text-[11px] font-bold mt-1 transition-colors ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-emerald-50 dark:bg-emerald-950/40' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.25]' : 'stroke-[1.75]'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
