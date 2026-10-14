import React from 'react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Sparkles, Camera, Bot, ShieldCheck, Award, Heart, ArrowRight, Check } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About NutriAI • Clinical AI Nutrition & Discipline Platform',
  description: 'Learn about NutriAI, the autonomous clinical nutrition platform founded by Ayush Raj for Indian diets, plate vision, and sustained recomposition.',
};

export default function AboutPage() {
  const pillars = [
    {
      icon: Camera,
      title: 'AI Plate Vision & Desi Heuristics',
      desc: 'Snap a picture of your meal plate or type in conversational Hinglish. Our vision intelligence estimates portion sizes in standard 150ml katoris, accounts for hidden cooking oils in gravies, and flags saturated fats in bakery items.',
    },
    {
      icon: Bot,
      title: '24/7 Agentic Coach with RAG Memory',
      desc: 'An AI nutrition coach synced directly with your daily logged meals, calorie targets, water intake, and blood reports. Ask questions or tell it to log meals directly from conversation.',
    },
    {
      icon: ShieldCheck,
      title: 'Cardiovascular & Lipid Guardrails',
      desc: 'Upload your blood lipid panel (LDL & Triglycerides). NutriAI dynamically caps daily saturated fats to under 15g and nudges you toward daily soluble fiber targets for arterial protection.',
    },
    {
      icon: Award,
      title: 'Cult.fit Ninja Badges & 30-Day Certificate',
      desc: 'Behavioral gamification engineered for lasting discipline. Conquer the 30-day streak to unlock the official 24K Gold Transformation Certificate signed by Founder Ayush Raj.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <PublicHeader />

      <main className="flex-1 py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Hero */}
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3.5 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE NUTRIAI MISSION</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Clinical nutrition intelligence for genuine discipline.
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Founded by <strong>Ayush Raj</strong>, NutriAI bridges the gap between generic Western calorie counters and real Indian home cooking.
            </p>
          </div>

          {/* Core Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-7 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{p.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Founder Statement */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-900/60 border border-emerald-500/30 rounded-3xl p-8 sm:p-10 space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-white">Founder&apos;s Note</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
              &quot;Most calorie counters fail in India because they don&apos;t understand how dal, sabzi, rotis, and cooking fats actually work. At NutriAI, we combined AI vision with clinical sports nutrition to build a tool that feels like having an attentive personal dietitian in your pocket every single meal.&quot;
            </p>
            <div className="pt-2">
              <strong className="text-white text-sm block">Ayush Raj</strong>
              <span className="text-xs text-emerald-400">Founder & Lead Engineer, NutriAI</span>
            </div>
          </div>

          {/* CTA Bar */}
          <div className="text-center space-y-4 pt-4">
            <h3 className="text-xl font-black text-white">Ready to take control of your nutrition?</h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/pricing"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
              >
                Start 7-Day Free Trial
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold hover:bg-slate-800 transition-all"
              >
                Open Live Web App
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
