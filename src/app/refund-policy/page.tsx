import React from 'react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { ShieldCheck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cancellation & Refund Policy • NutriAI',
  description: 'Official 7-Day Free Trial, Cancellation, and Refund Policy for NutriAI Pro memberships.',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <PublicHeader />

      <main className="flex-1 py-14 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-8 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Customer Protection</span>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1">
              Cancellation & Refund Policy
            </h1>
            <p className="text-xs text-slate-400 mt-2">Last updated: October 14, 2026</p>
          </div>

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-emerald-200 leading-relaxed">
              <strong>Our Fair Discipline Commitment:</strong> We want you to experience genuine transformation. That is why every new user receives a <strong>100% Free 7-Day Trial</strong> of NutriAI Pro, and we offer a transparent, hassle-free cancellation process.
            </div>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white">1. 7-Day Free Trial Policy</h2>
              <p>
                All new users are eligible for a <strong>7-Day NutriAI Pro Free Trial</strong>:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li>During the 7-day trial period, you have unlimited access to AI Food Plate Scanning, 24/7 AI Coach, and Diet Plan generation.</li>
                <li><strong>No charges</strong> are deducted during the trial period.</li>
                <li>If you do not wish to continue to a paid membership after 7 days, your account will simply revert to the standard Free tier. You will not be billed automatically without your explicit consent.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white">2. Subscription Cancellation</h2>
              <p>
                You can cancel your active paid subscription (NutriAI Pro Monthly or Annual Pass) at any time:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li>To cancel, simply navigate to the in-app subscription settings or email our support team at <a href="mailto:support@nutriai.app" className="text-emerald-400 underline">support@nutriai.app</a> with your registered email or Razorpay Payment ID.</li>
                <li>Upon cancellation, your Pro features will remain active until the end of your currently paid billing cycle (e.g., till the end of the month or year), after which no further charges will occur.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white">3. Refund Eligibility & Window</h2>
              <p>
                We stand firmly behind the quality of our AI nutrition intelligence. If you are dissatisfied with NutriAI Pro or experience technical issues preventing service access:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li><strong>7-Day Money-Back Guarantee:</strong> You may request a 100% full refund within <strong>7 calendar days</strong> from the date of your initial paid transaction.</li>
                <li><strong>Duplicate / Accidental Transactions:</strong> If your bank account is debited multiple times due to a network glitch during Razorpay checkout, the extra payment is flagged and refunded automatically within 48 hours.</li>
                <li>Refund requests submitted after 7 days of payment are generally evaluated on a case-by-case basis (e.g. prolonged server downtime).</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white">4. Refund Processing Timeline</h2>
              <p>
                Once your refund request is verified and approved by our team:
              </p>
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-xs text-slate-300">
                  Refunds are credited back to the original payment source (UPI, Debit Card, Credit Card, or Netbanking) within <strong>5 to 7 business days</strong> as per standard RBI and banking settlement guidelines.
                </span>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white">5. How to Initiate a Refund</h2>
              <p>
                Please email us at <a href="mailto:support@nutriai.app" className="text-emerald-400 underline">support@nutriai.app</a> with the following details:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>Your Registered Name / Mobile Number</li>
                <li>Razorpay Payment ID (e.g., <code>pay_xxxxxxxxx</code>)</li>
                <li>Brief reason for requesting a refund (optional, helps us improve)</li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
