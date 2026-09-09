'use client';

import React, { useState } from 'react';
import { UserProfile, DailyLog, BodyMeasurement } from '@/types';
import { calculateBMI, calculateWeightLossJourney } from '@/utils/nutritionCalculations';
import { TrendingUp, Target, Plus, Check, Calendar, Activity, Scale } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface AnalyticsTabProps {
  userProfile: UserProfile;
  dailyLogs: Record<string, DailyLog>;
  measurements: BodyMeasurement[];
  onAddMeasurement: (measurement: BodyMeasurement) => void;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  userProfile,
  dailyLogs,
  measurements,
  onAddMeasurement,
}) => {
  const [newWeight, setNewWeight] = useState(userProfile.currentWeightKg.toString());
  const [newWaist, setNewWaist] = useState('');
  const [newChest, setNewChest] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // BMI calculations
  const currentBmi = calculateBMI(userProfile.currentWeightKg, userProfile.heightCm);
  const targetBmi = calculateBMI(userProfile.targetWeightKg, userProfile.heightCm);

  // Journey projection calculations
  const journey = calculateWeightLossJourney(
    userProfile.currentWeightKg,
    userProfile.targetWeightKg,
    userProfile.pace || 'recommended'
  );

  // Prepare past 7 days calorie data for BarChart
  const calorieChartData = Object.keys(dailyLogs)
    .sort()
    .slice(-7)
    .map((dateStr) => {
      const log = dailyLogs[dateStr];
      const totalCals = (log.meals || []).reduce((sum, m) => sum + m.totalCalories, 0);
      const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
      return {
        date: dayName,
        calories: totalCals,
        target: userProfile.targetCalories,
      };
    });

  // Prepare Weight trajectory chart data
  // Combine historical measurements with future projection points
  const trajectoryChartData = journey.projectionPoints.map((p, idx) => {
    // Find if there was an actual check-in around this week
    const actualLog = measurements[idx];
    return {
      name: `W${p.week}`,
      projected: p.projectedWeight,
      actual: actualLog ? actualLog.weightKg : null,
    };
  });

  const handleSaveMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(newWeight);
    if (isNaN(w) || w <= 0) return;

    const newEntry: BodyMeasurement = {
      id: `measure-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weightKg: w,
      waistCm: newWaist ? parseFloat(newWaist) : undefined,
      chestCm: newChest ? parseFloat(newChest) : undefined,
      notes: notes || 'Weekly check-in',
    };

    onAddMeasurement(newEntry);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const totalToLose = Math.max(0, userProfile.currentWeightKg - userProfile.targetWeightKg);

  return (
    <div className="space-y-4 pb-20">
      {/* Journey & Projected Weight Loss Timeline */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-5 text-white shadow-md shadow-emerald-500/15">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-200" />
            <span className="text-xs font-bold tracking-wider uppercase text-emerald-100">
              Weight Loss Journey
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
            ~{journey.weeklyLossKg} kg / week pace
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 my-3 text-center">
          <div className="bg-white/10 rounded-2xl p-2.5 backdrop-blur-xs">
            <div className="text-[10px] text-emerald-100 uppercase">Current</div>
            <div className="text-lg font-black">{userProfile.currentWeightKg} kg</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-2.5 backdrop-blur-xs">
            <div className="text-[10px] text-emerald-100 uppercase">To Lose</div>
            <div className="text-lg font-black text-amber-200">-{totalToLose} kg</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-2.5 backdrop-blur-xs">
            <div className="text-[10px] text-emerald-100 uppercase">Target</div>
            <div className="text-lg font-black">{userProfile.targetWeightKg} kg</div>
          </div>
        </div>

        <div className="pt-2 border-t border-white/20 text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-50">
            <Calendar className="w-4 h-4 text-emerald-200" />
            <span>Estimated Goal Date:</span>
          </div>
          <span className="font-extrabold text-white text-sm">
            {journey.estimatedTargetDate} (~{journey.weeksNeeded} weeks)
          </span>
        </div>
      </div>

      {/* Trajectory Graph (Projected vs Actual Weight) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Weight Loss Trajectory
            </h3>
            <p className="text-[11px] text-slate-400">
              Projected fat-loss curve vs. your recorded check-ins
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2.5 h-0.5 bg-emerald-500 inline-block"></span> Projected
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span> Actual
            </span>
          </div>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trajectoryChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis domain={['auto', 'auto']} stroke="#94a3b8" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <Line
                type="monotone"
                dataKey="projected"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Calorie Consistency (Intake vs Target) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-500" />
              Daily Calorie Consistency
            </h3>
            <p className="text-[11px] text-slate-400">Past 7 days vs {userProfile.targetCalories} kcal budget</p>
          </div>
        </div>

        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={calorieChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <ReferenceLine y={userProfile.targetCalories} stroke="#10b981" strokeDasharray="3 3" />
              <Bar dataKey="calories" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BMI & Health Status Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Current BMI
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {currentBmi.bmi}
            </span>
            <span className={`text-xs font-semibold ${currentBmi.color}`}>
              {currentBmi.category}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Height: {userProfile.heightCm}cm | Weight: {userProfile.currentWeightKg}kg
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Target BMI
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {targetBmi.bmi}
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              Healthy
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Target Goal: {userProfile.targetWeightKg}kg
          </p>
        </div>
      </div>

      {/* Log New Weight & Measurements */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm mb-1">
          <Scale className="w-4 h-4 text-emerald-500" />
          <span>Log Weight & Body Measurements</span>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Record your weight and circumference check-in to track body composition changes.
        </p>

        <form onSubmit={handleSaveMeasurement} className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Weight (kg)*
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="w-full p-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Waist (cm)
              </label>
              <input
                type="number"
                step="0.5"
                placeholder="e.g. 86"
                value={newWaist}
                onChange={(e) => setNewWaist(e.target.value)}
                className="w-full p-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Chest (cm)
              </label>
              <input
                type="number"
                step="0.5"
                placeholder="e.g. 98"
                value={newChest}
                onChange={(e) => setNewChest(e.target.value)}
                className="w-full p-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs ${
              isSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white active:scale-98'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5" /> Saved Check-In!
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" /> Save Measurement Check-in
              </>
            )}
          </button>
        </form>

        {/* Recent logs */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Recent Check-Ins:
          </div>
          <div className="space-y-1.5">
            {measurements.slice(0, 4).map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/40"
              >
                <span className="text-slate-500">{m.date}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {m.weightKg} kg
                </span>
                {m.waistCm && (
                  <span className="text-slate-400 text-[11px]">Waist: {m.waistCm}cm</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
