import React from 'react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Check, Sparkles, Zap, ShieldCheck, ArrowRight, Star } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing & Plans • NutriAI Pro',
  description: 'Official pricing for NutriAI Pro. Free 7-Day Trial, Pro Monthly at ₹149, and Annual Pass at ₹999. Secured by Razorpay.',
};

export default function PricingPage() {
  const plans = [
    {
      id: 'free_trial',
      name: '7-Day Free Trial',
      badge: '100% FREE',
      price: '₹0',
      period: 'for 7 days',
      subtext: 'No credit card or upfront payment needed.',
      features: [
        'Full access to AI Food Plate Scanner',
        '24/7 Agentic AI Nutrition Coach with Memory',
        'Dynamic Diet Plan generation based on pantry foods',
        'Lipid Profile & Health Safety Guardrails',
        '1-Tap Water and Workout Tracker',
      ],
      ctaText: 'Start 7-Day Free Trial',
      ctaHref: '/',
      isHero: false,
    },
    {
      id: 'pro_monthly',
      name: 'NutriAI Pro Monthly',
      badge: 'FLEXIBLE',
      price: '₹149',
      period: 'per month',
      subtext: 'Billed monthly. Cancel anytime with 1 tap.',
      features: [
        'Everything in Free Trial',
        'Unlimited AI Plate Vision Scans',
        '24/7 Agentic AI Nutrition Coach with live RAG memory',
        'Cult.fit Ninja Badges & Honors Cabinet',
        'Dynamic saturated fat & soluble fiber safety shield',
        'Standard customer support via email',
      ],
      ctaText: 'Subscribe Monthly @ ₹149',
      ctaHref: '/',
      isHero: false,
    },
    {
      id: 'pro_annual',
      name: 'NutriAI Pro Annual Pass',
      badge: 'BEST VALUE • SAVE 45%',
      price: '₹999',
      period: 'per year',
      subtext: 'Just ₹83 per month. Complete year-long transformation.',
      features: [
        'Everything in Pro Monthly',
        'Official 30-Day Gold Transformation Certificate signed by Ayush Raj',
        'Priority AI Coach Response Speed & Extended Context',
        'Full 365-day body recomposition & progress analytics',
        'Exclusive Clan Alpha Founder Status & community badge',
        'Priority 24-hour email support',
      ],
      ctaText: 'Get Annual Pass @ ₹999',
      ctaHref: '/',
      isHero: true,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <PublicHeader />

      <main className="flex-1 py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-4">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3.5 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TRANSPARENT PRICING • NO HIDDEN FEES</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Invest in your discipline, not expensive dietitians.
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Every plan starts with a <strong>100% Free 7-Day Trial</strong>. Cancel anytime with zero hassle.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-16">
            {plans.map((p) => (
              <div
                key={p.id}
                className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all ${
                  p.isHero
                    ? 'bg-slate-900 border-2 border-amber-500/80 shadow-2xl shadow-amber-500/10 scale-100 md:scale-105'
                    : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {p.badge && (
                  <div
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      p.isHero ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {p.badge}
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-black text-white mt-1">{p.name}</h3>
                  <div className="mt-4 mb-2 flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-white tracking-tight">{p.price}</span>
                    <span className="text-xs font-semibold text-slate-400">{p.period}</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed">{p.subtext}</p>

                  <div className="border-t border-slate-800 pt-5 space-y-3 mb-6">
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Features Included:</p>
                    {p.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-emerald-400 stroke-[3]" />
                        </div>
                        <span className="leading-snug">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={p.ctaHref}
                  className={`w-full py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    p.isHero
                      ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20'
                      : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/10'
                  }`}
                >
                  {p.ctaText}
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </Link>
              </div>
            ))}
          </div>

          {/* Trust Banner */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">Payment Security & RBI Compliance</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  All transactions are securely handled by Razorpay Payment Gateway. We support UPI (GPay, PhonePe, Paytm, CRED), Netbanking, and Debit/Credit Cards with 256-bit bank encryption.
                </p>
              </div>
            </div>

            <Link
              href="/refund-policy"
              className="shrink-0 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline"
            >
              Read Refund & 7-Day Trial Policy →
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
