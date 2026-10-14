import React from 'react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Mail, MapPin, Clock, MessageSquare, ShieldCheck, PhoneCall } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us • NutriAI Customer Support',
  description: 'Contact NutriAI support team and Founder Ayush Raj for billing, refund, or app assistance.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <PublicHeader />

      <main className="flex-1 py-14 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Header */}
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Customer Support</span>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Get in Touch
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Have questions regarding your subscription, 7-day trial, or app features? Our team is here to help you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Email Support */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Mail className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white">Email Support</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Send your queries, payment screenshots, or feature feedback to our official inbox.
              </p>
              <a
                href="mailto:support@nutriai.app"
                className="inline-block text-xs font-black text-emerald-400 hover:text-emerald-300 underline pt-1"
              >
                support@nutriai.app
              </a>
            </div>

            {/* Response Time */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-base font-bold text-white">Operating Hours</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Monday to Saturday: 9:00 AM – 6:00 PM IST.<br />
                Turnaround time: Within 24 hours.
              </p>
              <span className="inline-block text-[11px] font-bold text-amber-300/80 pt-1">
                Fast Priority Response
              </span>
            </div>

            {/* Operating Office */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-sky-400" />
              </div>
              <h3 className="text-base font-bold text-white">Office Location</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                NutriAI Technologies<br />
                Patna, Bihar 800001, India
              </p>
              <span className="inline-block text-[11px] font-bold text-sky-300/80 pt-1">
                Registered in India
              </span>
            </div>
          </div>

          {/* Grievance & Compliance Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <h2 className="text-base sm:text-lg font-black text-white">Grievance Redressal & Legal Officer</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              In accordance with the Information Technology Act 2000, Consumer Protection (E-Commerce) Rules 2020, and RBI Payment Aggregator Guidelines, if you have any unresolved issues regarding payments or privacy:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-slate-300">
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Nodal Officer</span>
                <strong className="text-white text-sm">Ayush Raj</strong>
                <p className="text-slate-400 mt-0.5">Founder & Compliance Lead</p>
              </div>
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Contact Email</span>
                <a href="mailto:support@nutriai.app" className="text-emerald-400 font-semibold text-sm underline">
                  support@nutriai.app
                </a>
                <p className="text-slate-400 mt-0.5">Subject: Attn: Grievance Officer</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
