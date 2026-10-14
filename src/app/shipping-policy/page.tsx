import React from 'react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Zap, ShieldCheck, Smartphone } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy (Digital Services) • NutriAI',
  description: 'Shipping and Delivery policy for digital software services provided by NutriAI.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <PublicHeader />

      <main className="flex-1 py-14 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-8 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Fulfillment Policy</span>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1">
              Shipping & Delivery Policy
            </h1>
            <p className="text-xs text-slate-400 mt-2">Last updated: October 14, 2026</p>
          </div>

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
            <Zap className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-emerald-200 leading-relaxed">
              <strong>100% Digital Goods / Electronic Delivery:</strong> NutriAI is a cloud-powered mobile application and software-as-a-service (SaaS) platform. We provide <strong>instant digital delivery</strong> of our services immediately upon transaction completion. No physical goods or courier packages are dispatched.
            </div>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white">1. Mode of Delivery</h2>
              <p>
                All services, features, and subscriptions purchased on NutriAI (such as NutriAI Pro Monthly or Annual Pass) are delivered electronically through the NutriAI mobile application and web portal.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white">2. Delivery Timeline</h2>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li><strong>Instant Activation:</strong> Once your payment is successfully confirmed by Razorpay, your account is upgraded to Pro status <strong>immediately (within 5 to 10 seconds)</strong>.</li>
                <li>You will immediately gain unrestricted access to AI plate scanning, unlimited coach chat, custom diet plan revisions, and the Cult.fit Ninja honours cabinet.</li>
                <li>A digital transaction confirmation and invoice receipt are also emailed to you upon successful checkout.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white">3. Shipping Charges</h2>
              <p>
                Since all our services are entirely virtual and digitally delivered over the internet, there are <strong>zero shipping, handling, or courier fees</strong> applicable to any transaction.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white">4. Delivery Issues & Support</h2>
              <p>
                In the rare event that your account is not upgraded immediately after a successful payment (for example, due to a temporary internet disconnection), please contact our technical support team at <a href="mailto:support@nutriai.app" className="text-emerald-400 underline">support@nutriai.app</a> with your Razorpay Payment ID. Our team will verify and activate your access within <strong>2 to 4 business hours</strong>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
