'use client';

import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function AppInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // 1. Listen for the native browser PWA installation event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // 🔑 1-DAY EXPIRATION CHECK ENGINE
      const dismissedAt = localStorage.getItem('app_badge_dismissed_time');
      
      if (dismissedAt) {
        const dismissedTime = parseInt(dismissedAt, 10);
        const currentTime = Date.now();
        const oneDayInMilliseconds = 24 * 60 * 60 * 1000; // 24 hours
        
        // If more than 24 hours have passed, clear the old lock state
        if (currentTime - dismissedTime > oneDayInMilliseconds) {
          localStorage.removeItem('app_badge_dismissed_time');
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } else {
        // No dismissal history found, safe to show the prompt card
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 2. Hide immediately if the app is already running natively as an installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // 🔑 Save the exact millisecond timestamp when the user hit close
    localStorage.setItem('app_badge_dismissed_time', Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    /* 🔑 THE FLOATING ANCHOR FRAME */
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-sm w-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-2xl shadow-xl z-50 transition-all duration-300 animate-slideUp select-none box-border">
      <div className="flex items-start gap-3.5 relative">
        
        {/* Modern Accent Icon Capsule */}
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-500/10">
          <Smartphone size={18} className="animate-pulse" />
        </div>

        {/* Content Segment */}
        <div className="space-y-3 flex-1 min-w-0 pr-4">
          <div className="space-y-0.5">
            <h5 className="text-xs font-black text-slate-900 dark:text-white tracking-tight uppercase m-0">
              Install ATPLC WebApp
            </h5>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed m-0">
              Access your training modules instantly from your home screen with smooth, offline-first performance.
            </p>
          </div>

          {/* Action Trigger Row */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleInstallClick}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-xl shadow-xs border-none cursor-pointer transition-all active:scale-97"
            >
              <Download size={11} className="stroke-[3]" />
              <span>Add to Home Screen</span>
            </button>
          </div>
        </div>

        {/* Absolute Close Handle Pin */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-0 right-0 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-transparent border-none cursor-pointer transition-colors"
          title="Dismiss Prompt"
        >
          <X size={14} />
        </button>

      </div>
    </div>
  );
}