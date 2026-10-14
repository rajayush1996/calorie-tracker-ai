'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Shield, Smartphone, ArrowRight } from 'lucide-react';

export const PublicHeader: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
              NutriAI
              <span className="text-[10px] uppercase font-black tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                PRO
              </span>
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-300">
          <Link href="/pricing" className="hover:text-emerald-400 transition-colors">
            Pricing & Plans
          </Link>
          <Link href="/about" className="hover:text-emerald-400 transition-colors">
            About NutriAI
          </Link>
          <Link href="/refund-policy" className="hover:text-emerald-400 transition-colors">
            7-Day Trial & Refund
          </Link>
          <Link href="/contact" className="hover:text-emerald-400 transition-colors">
            Contact Us
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/pricing"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full hover:bg-amber-500/20 transition-all"
          >
            ₹0 For 7 Days
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-black bg-emerald-500 text-slate-950 px-4 py-2 rounded-xl hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
          >
            Launch App
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>
      </div>
    </header>
  );
};
