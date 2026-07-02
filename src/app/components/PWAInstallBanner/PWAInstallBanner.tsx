'use client';

import React from 'react';
import { Download, MonitorSmartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAinstall';

export default function PWAInstallBanner() {
  const { isInstallable, isInstalled, handleInstallClick } = usePWAInstall();
  const [dismissed, setDismissed] = React.useState<boolean>(false);

  // If it's already installed, not supported by the browser session, or explicitly dismissed, hide it
  if (!isInstallable || isInstalled || dismissed) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-6 p-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-blue-800/60 rounded-2xl shadow-lg shadow-indigo-950/20 text-white flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn box-border relative overflow-hidden group">
      {/* Background ambient lighting glow */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-start gap-3.5 text-center sm:text-left">
        <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center shrink-0 mx-auto sm:mx-0 shadow-inner">
          <MonitorSmartphone size={20} className="text-blue-400" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold tracking-tight m-0">Install ATPLC Platform App</h4>
          <p className="text-xs text-slate-400 font-medium max-w-md m-0 leading-relaxed">
            Install this application on your home screen for an offline-first experience, instant dashboard access, and faster loading speeds.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-center sm:justify-end">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-slate-800 rounded-xl cursor-pointer transition-all box-border"
          aria-label="Dismiss banner"
        >
          <X size={15} />
        </button>

        <button
          type="button"
          onClick={handleInstallClick}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 transition-all transform active:scale-98 tracking-wide uppercase border-none cursor-pointer box-border w-full sm:w-auto"
        >
          <Download size={14} />
          <span>Install App</span>
        </button>
      </div>
    </div>
  );
}