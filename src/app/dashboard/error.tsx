'use client'; // 🔴 CRITICAL: Next.js App Router error boundaries MUST be Client Components

import React, { useEffect } from 'react';
import { WifiOff, RotateCcw } from 'lucide-react';

// Next.js native interface definitions for system error boundary structures
interface DashboardErrorProps {
  error: Error & { digest?: string; response?: { status?: number; statusText?: string } };
  reset: () => void; // Automated method to attempt re-rendering the broken route segment on-the-fly
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  
  useEffect(() => {
    // Safely reset viewport offset positions on mount
    window.scrollTo(0, 0);
    
    // Log exception payload to internal application console monitors or analytics sinks
    console.error("Dashboard Runtime Exception:", error);
  }, [error]);

  // Safe boundary fallbacks for resolving error descriptions and status metrics
  const errorMessage = error?.response?.statusText || error?.message || "An unhandled execution crash occurred within the local dashboard pipeline.";
  const statusCode = error?.response?.status || 500;

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[60vh] max-w-md mx-auto p-6 bg-white border border-slate-200 rounded-2xl shadow-sm text-center space-y-5 animate-fadeIn">
      
      {/* --- GRAPHIC STATUS ICON ACCENT --- */}
      <div className="flex items-center justify-center h-14 w-14 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 shadow-sm animate-pulse">
        <WifiOff size={24} />
      </div>

      {/* --- BODY TEXT EXPLANATIONS --- */}
      <div className="space-y-2 w-full">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Workspace Error Boundary
        </h4>
        <p className="text-sm font-medium text-slate-700 leading-relaxed bg-slate-50 border border-slate-100 p-3.5 rounded-xl font-mono break-words">
          {errorMessage}
        </p>
      </div>

      {/* --- METRIC STATUS ACCENT & INTERACTIVE ACTION SYSTEM --- */}
      <div className="flex items-center justify-between w-full pt-2 border-t border-slate-100 gap-4">
        <span className="inline-flex items-center gap-1 text-[10px] font-black tracking-wider uppercase bg-slate-900 text-white px-2.5 py-1 rounded-md shadow-inner">
          HTTP {statusCode}
        </span>

        {/* Next.js pattern providing users a way to clear the error loop without full page reloads */}
        <button
          onClick={() => reset()}
          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors py-1 px-2 hover:bg-blue-50 rounded-lg"
          type="button"
        >
          <RotateCcw size={14} />
          <span>Retry Operation</span>
        </button>
      </div>

    </div>
  );
}