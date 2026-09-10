'use client';

import React from 'react';

interface ExerciseDiagramProps {
  type: string;
  className?: string;
}

export const ExerciseDiagram: React.FC<ExerciseDiagramProps> = ({ type, className = 'w-24 h-24' }) => {
  switch (type) {
    case 'pushup':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Ground */}
          <line x1="10" y1="80" x2="90" y2="80" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          {/* Body line (inclined) */}
          <line x1="25" y1="76" x2="70" y2="52" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
          {/* Head */}
          <circle cx="75" cy="48" r="6" fill="#10B981" />
          {/* Arms (pushing down) */}
          <polyline points="63,56 60,78 68,78" stroke="#0F766E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Feet */}
          <circle cx="25" cy="78" r="2.5" fill="#64748B" />
          {/* Target highlight indicator */}
          <circle cx="60" cy="58" r="3" fill="#F59E0B" />
        </svg>
      );

    case 'squat':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Ground */}
          <line x1="15" y1="85" x2="85" y2="85" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          {/* Torso & Head */}
          <circle cx="46" cy="28" r="6" fill="#10B981" />
          <line x1="46" y1="34" x2="42" y2="56" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
          {/* Thigh (horizontal/parallel) */}
          <line x1="42" y1="56" x2="62" y2="58" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
          {/* Shin */}
          <line x1="62" y1="58" x2="58" y2="83" stroke="#0F766E" strokeWidth="3.5" strokeLinecap="round" />
          {/* Arms out front */}
          <line x1="45" y1="42" x2="72" y2="44" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
          {/* Quads highlight */}
          <circle cx="52" cy="57" r="3" fill="#F59E0B" />
        </svg>
      );

    case 'lunge':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Ground */}
          <line x1="15" y1="85" x2="85" y2="85" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          {/* Head & Torso vertical */}
          <circle cx="48" cy="24" r="6" fill="#10B981" />
          <line x1="48" y1="30" x2="48" y2="54" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
          {/* Front Leg (90 deg) */}
          <polyline points="48,54 68,56 68,83" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Back Leg (knee down) */}
          <polyline points="48,54 36,68 36,80 30,80" stroke="#0F766E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {/* Target highlight */}
          <circle cx="68" cy="62" r="3" fill="#F59E0B" />
        </svg>
      );

    case 'pullup':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Pullup Bar */}
          <line x1="15" y1="20" x2="85" y2="20" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
          {/* Hands & Arms */}
          <polyline points="38,20 44,38 50,38 56,38 62,20" stroke="#0F766E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Head near bar */}
          <circle cx="50" cy="28" r="6" fill="#10B981" />
          {/* Torso & Legs hanging */}
          <line x1="50" y1="34" x2="50" y2="62" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
          <line x1="50" y1="62" x2="52" y2="84" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" />
          {/* Lat highlight */}
          <circle cx="46" cy="42" r="3" fill="#F59E0B" />
          <circle cx="54" cy="42" r="3" fill="#F59E0B" />
        </svg>
      );

    case 'plank':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Ground */}
          <line x1="10" y1="80" x2="90" y2="80" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          {/* Rigid Horizontal Body line */}
          <line x1="22" y1="68" x2="72" y2="65" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
          {/* Head */}
          <circle cx="78" cy="63" r="5.5" fill="#10B981" />
          {/* Forearms on ground */}
          <polyline points="68,66 68,78 76,78" stroke="#0F766E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {/* Toes on ground */}
          <circle cx="22" cy="78" r="2.5" fill="#64748B" />
          {/* Core highlight */}
          <circle cx="47" cy="66" r="3.5" fill="#F59E0B" />
        </svg>
      );

    case 'crunch':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Mat */}
          <line x1="15" y1="78" x2="85" y2="78" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          {/* Back elevated slightly */}
          <polyline points="28,76 44,76 56,60" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Head */}
          <circle cx="62" cy="54" r="5.5" fill="#10B981" />
          {/* Bent Knee in air */}
          <polyline points="44,76 34,54 50,44" stroke="#0F766E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Abs highlight */}
          <circle cx="48" cy="64" r="3.5" fill="#F59E0B" />
        </svg>
      );

    case 'jumping_jack':
    default:
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Ground */}
          <line x1="15" y1="88" x2="85" y2="88" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
          {/* Head */}
          <circle cx="50" cy="22" r="6" fill="#10B981" />
          {/* Torso */}
          <line x1="50" y1="28" x2="50" y2="56" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
          {/* Wide Legs */}
          <line x1="50" y1="56" x2="28" y2="85" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="50" y1="56" x2="72" y2="85" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" />
          {/* High V Arms */}
          <line x1="50" y1="36" x2="26" y2="18" stroke="#0F766E" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="50" y1="36" x2="74" y2="18" stroke="#0F766E" strokeWidth="3.5" strokeLinecap="round" />
          {/* Dynamic motion ripples */}
          <circle cx="50" cy="42" r="3" fill="#F59E0B" />
        </svg>
      );
  }
};
