'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Sparkles, Mail, MapPin, Heart, Clock } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 pt-12 pb-8 text-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">NutriAI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Autonomous AI nutrition tracking and clinical macro safety engine. Built for Indian diets, plate vision, and sustained discipline.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Secured by Razorpay • 256-bit Encrypted</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Product & Plans</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing Plans (₹149/mo & ₹999/yr)
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About NutriAI & Founder
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  7-Day Free Trial (₹0)
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Live Web Application
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Compliance Pages (Required by Razorpay & RBI) */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Legal & Policies</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-white transition-colors">
                  Cancellation & Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-white transition-colors">
                  Shipping & Delivery (Digital Services)
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us & Grievance Officer
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact / Operating Details */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Operating Address</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>NutriAI Technologies, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="mailto:support@nutriai.app" className="hover:text-emerald-400 transition-colors">
                  support@nutriai.app
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Support: Mon - Sat, 9:00 AM - 6:00 PM IST</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} NutriAI (Founder: Ayush Raj). All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/refund-policy" className="hover:underline">Refunds</Link>
            <Link href="/shipping-policy" className="hover:underline">Delivery</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
