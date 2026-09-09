'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, ChevronRight, Sparkles, Check } from 'lucide-react';

interface AppOnboardingCarouselProps {
  onFinish: () => void;
}

interface SlideData {
  step: number;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  imageSrc: string;
}

const SLIDES: SlideData[] = [
  {
    step: 1,
    badge: 'AI CONVERSATIONAL LOGGING',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    title: 'Log Meals in Plain Everyday Words',
    subtitle:
      'No tedious gram searching. Just write "2 rotis with dal tadka & 1 bowl curd". AI extracts calories, protein, and lets you self-correct on the fly.',
    imageSrc: '/images/slide1.jpg',
  },
  {
    step: 2,
    badge: 'PANTRY-MATCHED DIET',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    title: 'Diets Tailored to Your Own Kitchen',
    subtitle:
      'No exotic foods you don\'t own. Tell AI what groceries you have at home (eggs, oats, paneer, dal, rice) and get a high-satiety fat loss meal schedule.',
    imageSrc: '/images/slide2.jpg',
  },
  {
    step: 3,
    badge: 'JOURNEY TRAJECTORY',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    title: 'Predict Your Exact Target Date',
    subtitle:
      'Choose your pace (Sustainable, Standard, or Fast Extreme Cut). See a scientific week-by-week projection to hit your target goal weight.',
    imageSrc: '/images/slide3.jpg',
  },
  {
    step: 4,
    badge: 'NIGHTLY AI AUDIT',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    title: 'Daily Mistake Analyzer & Coach Retro',
    subtitle:
      'Every night, AI audits what went wrong, highlights your wins, scores your discipline, and provides a 2-step actionable fix for tomorrow.',
    imageSrc: '/images/slide4.jpg',
  },
];

export const AppOnboardingCarousel: React.FC<AppOnboardingCarouselProps> = ({ onFinish }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slide = SLIDES[currentSlide];
  const isLast = currentSlide === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      onFinish();
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-4 selection:bg-emerald-500 selection:text-white">
      {/* Top Bar with Brand & Skip */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between pt-2 pb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-base shadow-xs shadow-emerald-500/20 text-white font-black">
            🥑
          </div>
          <span className="font-black text-slate-900 text-sm tracking-tight">NutriAI</span>
        </div>

        {/* Top Skip Button */}
        <button
          onClick={onFinish}
          className="text-xs font-bold text-slate-400 hover:text-slate-800 flex items-center gap-0.5 px-2.5 py-1 rounded-full hover:bg-slate-100 transition-colors"
        >
          <span>Skip</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Slide Card Container */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center my-auto">
        <div className="bg-white rounded-3xl p-5 shadow-lg shadow-slate-200/60 border border-slate-200/70 flex flex-col items-center text-center space-y-4 transition-all duration-300">
          {/* Image Container with Smooth Aspect Ratio */}
          <div className="relative w-full aspect-square max-w-[280px] rounded-2xl overflow-hidden shadow-inner border border-slate-100 bg-slate-50">
            <Image
              src={slide.imageSrc}
              alt={slide.title}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              priority
              sizes="(max-width: 448px) 280px, 280px"
            />
          </div>

          {/* Badge */}
          <div>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${slide.badgeColor}`}
            >
              <Sparkles className="w-2.5 h-2.5" />
              {slide.badge}
            </span>
          </div>

          {/* Slide Text */}
          <div className="space-y-1.5 px-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-snug">
              {slide.title}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              {slide.subtitle}
            </p>
          </div>

          {/* Slide Dots Indicator */}
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === idx
                    ? 'w-6 bg-emerald-500 shadow-xs shadow-emerald-500/30'
                    : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Buttons */}
      <div className="w-full max-w-md mx-auto space-y-2.5 pt-4 pb-2">
        {/* Next / Get Started Button */}
        <button
          onClick={handleNext}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <span>{isLast ? 'Get Started & Create Account' : 'Continue'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Bottom Skip Button (on every slide) */}
        <button
          onClick={onFinish}
          className="w-full py-2.5 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-bold transition-colors"
        >
          Skip to Sign In / Sign Up
        </button>
      </div>
    </div>
  );
};
