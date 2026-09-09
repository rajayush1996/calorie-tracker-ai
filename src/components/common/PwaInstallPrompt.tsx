'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share2, MoreVertical, Check } from 'lucide-react';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Register Service Worker for PWA installability
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration skipped:', err);
      });
    }

    // Check if already in standalone (installed) mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsStandalone(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Capture Chrome/Edge install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem('nutriai_pwa_dismissed_v2');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // If on mobile browser and not standalone, show install prompt after brief delay
    const isMobile = /android|iphone|ipad|ipod/.test(userAgent);
    const dismissed = localStorage.getItem('nutriai_pwa_dismissed_v2');
    if (isMobile && !dismissed) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
        setDeferredPrompt(null);
      }
    } else {
      // If native deferred prompt isn't directly triggered, show the 2-step visual instructions
      setShowInstructionsModal(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('nutriai_pwa_dismissed_v2', 'true');
  };

  if (isStandalone || !showBanner) return null;

  return (
    <>
      {/* Sleek Floating Install Banner */}
      <div className="fixed bottom-20 left-3 right-3 z-40 max-w-md mx-auto">
        <div className="bg-slate-900/95 text-white p-3 rounded-2xl shadow-2xl border border-emerald-500/30 backdrop-blur-md flex items-center justify-between gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black text-white truncate">Install NutriAI App</h4>
              <p className="text-[10px] text-slate-300 truncate">1-tap home screen access on mobile</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Instruction Modal (if browser requires manual 2-tap add) */}
      {showInstructionsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                Add NutriAI to Home Screen
              </h3>
              <button
                onClick={() => setShowInstructionsModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Open NutriAI like a native app anytime without typing the URL.
            </p>

            <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
              {isIOS ? (
                <>
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">1</span>
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      Tap the <strong>Share</strong> button <Share2 className="w-3.5 h-3.5 text-blue-500 inline" /> at the bottom of Safari.
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">2</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong> (+).
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">1</span>
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      Tap the <strong>menu</strong> <MoreVertical className="w-3.5 h-3.5 text-slate-500 inline" /> at top-right in Chrome.
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">2</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      Tap <strong>&ldquo;Install app&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong>.
                    </span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowInstructionsModal(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
