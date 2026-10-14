import React from 'react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions • NutriAI',
  description: 'Official Terms of Service for NutriAI application and web platform by Ayush Raj.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <PublicHeader />

      <main className="flex-1 py-14 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-8 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Legal Agreements</span>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1">
              Terms & Conditions
            </h1>
            <p className="text-xs text-slate-400 mt-2">Last updated: October 14, 2026</p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white">1. Introduction & Acceptance of Terms</h2>
              <p>
                Welcome to <strong>NutriAI</strong> (&quot;Application&quot;, &quot;Platform&quot;, &quot;Service&quot;), operated by <strong>Ayush Raj</strong> (&quot;Founder&quot;, &quot;we&quot;, &quot;our&quot;, &quot;us&quot;). By accessing or using our mobile application, web dashboard, or purchasing any subscription plans, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please discontinue using the service.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white">2. Medical & Clinical Health Disclaimer</h2>
              <p className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-200">
                <strong>IMPORTANT:</strong> NutriAI provides computational macronutrient tracking, heuristic dietary habit feedback, and general wellness insights. <strong>NutriAI is NOT a substitute for professional medical advice, clinical diagnosis, or medical prescription.</strong>
              </p>
              <p>
                Always consult a certified medical practitioner or registered dietitian before embarking on any extreme calorie restriction, intense exercise protocol, or dietary changes—especially if you have underlying cardiovascular, diabetic, or metabolic conditions.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white">3. User Accounts & Responsibilities</h2>
              <p>
                When creating a profile or account on NutriAI, you agree to provide truthful and accurate physiological information (e.g., current body weight, height, age, activity levels) to ensure calorie and protein targets are appropriately estimated. You are solely responsible for maintaining the confidentiality of your account credentials.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white">4. Subscriptions, Free Trials & Billing</h2>
              <p>
                NutriAI offers both free and premium subscription tiers:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li><strong>7-Day Free Trial:</strong> New users are granted a complimentary 7-day trial of NutriAI Pro features with zero upfront fee.</li>
                <li><strong>Pro Monthly Pass:</strong> Billed at ₹149 per month (taxes included).</li>
                <li><strong>Pro Annual Pass:</strong> Billed at ₹999 per year (taxes included).</li>
                <li><strong>Payment Processing:</strong> Payments are processed securely via our authorized payment partner, <strong>Razorpay</strong>. We do not store your raw credit/debit card numbers or UPI MPIN on our servers.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white">5. Intellectual Property Rights</h2>
              <p>
                All proprietary software algorithms, desi food heuristic logic, AI prompts, visual designs, Cult.fit Ninja badge designs, certificates, and source code are the intellectual property of Ayush Raj and NutriAI. You may not reverse-engineer, decompile, or copy any portion of our algorithms without express written permission.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white">6. Termination of Service</h2>
              <p>
                We reserve the right to suspend or terminate your access to the platform without notice if you engage in fraudulent payment chargebacks, abuse of community features, or violation of these terms.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white">7. Governing Law & Jurisdiction</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts in Patna, Bihar, India.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white">8. Contact Information</h2>
              <p>
                For legal inquiries or questions regarding these terms, reach out to us at <a href="mailto:support@nutriai.app" className="text-emerald-400 underline">support@nutriai.app</a> or visit our <Link href="/contact" className="text-emerald-400 underline">Contact Page</Link>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
