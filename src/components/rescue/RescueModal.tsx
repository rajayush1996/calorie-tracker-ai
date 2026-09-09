'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/types';
import { getAICravingSwap, getAIDamageControl } from '@/services/aiService';
import {
  Sparkles,
  X,
  Flame,
  ShieldAlert,
  Cookie,
  Pizza,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Clock,
  Heart,
  Droplets,
} from 'lucide-react';

interface RescueModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  initialTab?: 'craving' | 'cheat';
}

export const RescueModal: React.FC<RescueModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  initialTab = 'craving',
}) => {
  const [activeTab, setActiveTab] = useState<'craving' | 'cheat'>(initialTab);

  // Craving state
  const [cravingInput, setCravingInput] = useState('');
  const [cravingLoading, setCravingLoading] = useState(false);
  const [cravingResult, setCravingResult] = useState<any>(null);

  // Cheat meal state
  const [cheatInput, setCheatInput] = useState('');
  const [cheatLoading, setCheatLoading] = useState(false);
  const [cheatResult, setCheatResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleSwapCraving = async (textToUse?: string) => {
    const text = textToUse || cravingInput;
    if (!text.trim()) return;

    setCravingLoading(true);
    try {
      const res = await getAICravingSwap(text, userProfile.apiKey);
      setCravingResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setCravingLoading(false);
    }
  };

  const handleDamageControl = async (textToUse?: string) => {
    const text = textToUse || cheatInput;
    if (!text.trim()) return;

    setCheatLoading(true);
    try {
      const res = await getAIDamageControl(text, userProfile.targetCalories, userProfile.apiKey);
      setCheatResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setCheatLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-5 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">AI Diet SOS & Rescue</h3>
              <p className="text-[11px] text-slate-400">Guilt-free support for real-life cravings & parties</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('craving')}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'craving'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Cookie className="w-3.5 h-3.5 text-amber-500" />
            <span>Craving Swapper</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cheat')}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'cheat'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Pizza className="w-3.5 h-3.5 text-rose-500" />
            <span>Cheat-Meal Recovery</span>
          </button>
        </div>

        {/* TAB 1: CRAVING SWAPPER */}
        {activeTab === 'craving' && (
          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                What are you craving right now?
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {[
                  { label: '🍫 Chocolate / Pastry', text: 'Chocolate pastry or brownie' },
                  { label: '🍟 Chips & Namkeen', text: 'Fried potato chips and salty namkeen' },
                  { label: '☕ Chai & Biscuits', text: 'Sweet chai with cookies' },
                  { label: '🍦 Ice Cream', text: 'Creamy vanilla ice cream' },
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCravingInput(chip.text);
                      handleSwapCraving(chip.text);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 transition-colors"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={cravingInput}
                  onChange={(e) => setCravingInput(e.target.value)}
                  placeholder="e.g. Samosa, ice cream, gulab jamun..."
                  className="flex-1 p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSwapCraving();
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleSwapCraving()}
                  disabled={cravingLoading || !cravingInput.trim()}
                  className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl active:scale-95 disabled:opacity-50 transition-all shadow-xs shrink-0 flex items-center gap-1"
                >
                  {cravingLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Find Swap</span>
                </button>
              </div>
            </div>

            {/* Craving Result Card */}
            {cravingResult && (
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 space-y-3">
                {/* Comparison Banner */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Craving</span>
                    <span className="text-xs font-bold text-rose-600 line-through">
                      ~{cravingResult.originalEstimatedCalories} kcal
                    </span>
                  </div>
                  <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-emerald-100 block">Smart AI Swap</span>
                    <span className="text-sm font-black">
                      {cravingResult.swapCalories} kcal ({cravingResult.swapProteinG}g P)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-emerald-800 px-1">
                  <span>Saved: ~{cravingResult.caloriesSaved} kcal! 🔥</span>
                  <span className="text-slate-500 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600" /> {cravingResult.prepTime}
                  </span>
                </div>

                {/* Recipe */}
                <div className="bg-white p-3 rounded-xl border border-emerald-100 space-y-1.5 text-xs">
                  <h4 className="font-extrabold text-slate-900">{cravingResult.swapTitle}</h4>
                  <ul className="text-[11px] text-slate-600 list-disc pl-4 space-y-0.5">
                    {cravingResult.ingredients?.map((ing: string, i: number) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
                    {cravingResult.quickRecipe}
                  </p>
                </div>

                {/* Why it works tip */}
                <p className="text-[11px] text-slate-600 bg-white/60 p-2.5 rounded-xl border border-emerald-100/60 leading-relaxed">
                  💡 <strong className="text-emerald-800">Why this works: </strong>
                  {cravingResult.psychologicalTip}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CHEAT-MEAL DAMAGE CONTROL */}
        {activeTab === 'cheat' && (
          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                What did you eat at the party / cheat meal?
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {[
                  { label: '🍕 Pizza & Coke Party', text: '3 slices pepperoni pizza and regular coke' },
                  { label: '🍗 Biryani & Gulab Jamun', text: '1 plate chicken biryani and 2 gulab jamuns' },
                  { label: '🍔 Burger & French Fries', text: 'Large double cheese burger with fries' },
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCheatInput(chip.text);
                      handleDamageControl(chip.text);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-300 text-slate-700 transition-colors"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={cheatInput}
                  onChange={(e) => setCheatInput(e.target.value)}
                  placeholder="e.g. 4 slices pizza, pasta, and 1 beer at dinner..."
                  className="flex-1 p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleDamageControl();
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleDamageControl()}
                  disabled={cheatLoading || !cheatInput.trim()}
                  className="px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl active:scale-95 disabled:opacity-50 transition-all shadow-xs shrink-0 flex items-center gap-1"
                >
                  {cheatLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                  <span>Rescue Me</span>
                </button>
              </div>
            </div>

            {/* Damage Control Result Card */}
            {cheatResult && (
              <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-rose-200/60 pb-2">
                  <div className="flex items-center gap-1.5 text-rose-700 font-extrabold text-xs">
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                    <span>No Guilt! You Are 100% Fine</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">
                    ~{cheatResult.estimatedCheatCalories} kcal
                  </span>
                </div>

                {/* Empathetic Reassurance */}
                <p className="text-xs text-slate-700 leading-relaxed font-medium bg-white p-3 rounded-xl border border-rose-100">
                  {cheatResult.reassuranceMessage}
                </p>

                {/* Tonight Steps */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
                    Tonight's Relief Plan:
                  </span>
                  <ul className="space-y-1">
                    {cheatResult.tonightSteps?.map((step: string, i: number) => (
                      <li key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                        <Droplets className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tomorrow's balanced plan */}
                <div className="p-3 bg-white rounded-xl border border-rose-100 text-xs space-y-1">
                  <span className="font-extrabold text-slate-900 block">Tomorrow's Gentle Fix:</span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {cheatResult.tomorrowPlan}
                  </p>
                </div>

                {/* Movement advice */}
                <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{cheatResult.movementTip}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
