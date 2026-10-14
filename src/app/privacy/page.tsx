import React from 'react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy • NutriAI',
  description: 'Privacy Policy for NutriAI. We value health confidentiality with 256-bit encryption and zero third-party data selling.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <PublicHeader />

      <main className="flex-1 py-14 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-8 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Data Protection</span>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-400 mt-2">Last updated: October 14, 2026</p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white">1. Introduction</h2>
              <p>
                At <strong>NutriAI</strong> (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;), we respect your personal privacy and are committed to safeguarding the sensitive health, body composition, and dietary information you entrust to us. This Privacy Policy details how we collect, store, process, and protect your information when you use our mobile application or web dashboard.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white">2. Information We Collect</h2>
              <p>We collect only information necessary to power your personalized nutrition and fitness coach:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li><strong>Profile & Physical Metrics:</strong> Name, age, gender, height (cm), current weight (kg), target weight, and daily activity level.</li>
                <li><strong>Dietary & Meal Logs:</strong> Food descriptions, plate photos taken via camera or gallery, meal timestamps, and macro breakdowns.</li>
                <li><strong>Optional Health Guardrails:</strong> Lipid panel numbers (LDL, Triglycerides, HDL) if you choose to upload a blood test report for cardiovascular safety checks.</li>
                <li><strong>Transaction Data:</strong> Razorpay payment identifiers, plan type, and order timestamps. <em>(Note: Your credit/debit card numbers, CVV, and UPI passwords are never handled or stored by us; they are securely processed by Razorpay).</em></li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white">3. How We Use Your Data</h2>
              <p>Your information is strictly utilized to:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li>Calculate your BMR, total daily energy expenditure (TDEE), and custom calorie/protein targets.</li>
                <li>Process food plate images and voice notes into itemized calorie and macronutrient records using clinical AI.</li>
                <li>Enforce saturated fat and soluble fiber guardrails based on your lipid profile.</li>
                <li>Synchronize your progress streaks, awards, and certificates.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white">4. Zero Data Selling Commitment</h2>
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-200">
                <strong>Our Privacy Guarantee:</strong> We do <strong>NOT</strong> sell, rent, monetize, or trade your personal health metrics, diet photos, or blood reports to insurance companies, advertising brokers, or third-party marketers.
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white">5. Security & Storage</h2>
              <p>
                All data transfers between the mobile app, web dashboard, and server utilize industry-standard TLS/SSL encryption. Sensitive biometric data is stored securely with restricted access controls.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white">6. Your Rights & Data Deletion</h2>
              <p>
                You retain complete ownership of your personal health data. You have the right to request a full export or permanent deletion of your profile, meals, and account history at any time through the in-app &quot;Reset All Data&quot; button or by contacting <a href="mailto:support@nutriai.app" className="text-emerald-400 underline">support@nutriai.app</a>.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white">7. Grievance Officer</h2>
              <p>
                In accordance with the Information Technology Act, 2000 and the rules made thereunder, the Grievance Officer for the platform is:
              </p>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1 text-slate-400">
                <p><strong className="text-white">Name:</strong> Ayush Raj</p>
                <p><strong className="text-white">Role:</strong> Founder & Data Protection Officer</p>
                <p><strong className="text-white">Email:</strong> support@nutriai.app</p>
                <p><strong className="text-white">Address:</strong> NutriAI Technologies, Patna, Bihar, India</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
