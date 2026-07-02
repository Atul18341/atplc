'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check if the app is already running as an installed PWA (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');
    
    setIsInstalled(isStandalone);

    // 2. Listen for the native browser install interceptor
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // Prevent the default mini-infobar from appearing
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // 3. Listen for successful installations
    const handleAppInstalled = async() => {
      setIsInstallable(false);
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log('PWA was successfully installed on this device.');
      try {
      await axios.post('/api/analytics/pwa-install', {
        devicePlatform: navigator.userAgent,
        timestamp: new Date().toISOString(),
        action: 'INSTALL_SUCCESS'
      });
    } catch (err) {
      console.error('Failed to log installation telemetry:', err);
    }
    };
     
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the browser's native install confirmation dialog window
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt choice
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User installation choice outcome: ${outcome}`);

    // Clean up the deferred prompt state loop; it can only be used once
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return { isInstallable, isInstalled, handleInstallClick };
}