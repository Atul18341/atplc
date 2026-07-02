'use client';

import React, { useEffect } from 'react';
import { WifiOff } from 'lucide-react';

// Define a strict TypeScript interface for the incoming error tracking matrix
interface ErrorBoxProps {
  error: {
    message?: string;
    response?: {
      status?: number;
      statusText?: string;
    };
  } | any;
}

export default function ErrorBox({ error }: ErrorBoxProps) {
  
  useEffect(() => {
    // Basic viewport scroll reset upon component mount safely
    window.scrollTo(0, 0);
  }, []);

  // Safe fallback evaluations for error strings and network codes
  const errorMessage = error?.response?.statusText || error?.message || "An unexpected communication error occurred.";
  const statusCode = error?.response?.status || 408;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-6 bg-white border border-slate-200 rounded-2xl shadow-sm text-center space-y-4 animate-fadeIn">
      
      {/* --- ICON BLOCK LAYER --- */}
      <div className="flex items-center justify-center h-14 w-14 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 shadow-sm animate-pulse">
        {/* Swapped static icon font classes over to clean Lucide vector graphic component */}
        <WifiOff size={24} />
      </div>

      {/* --- CONTENT DESCRIPTION LAYER --- */}
      <div className="space-y-1.5 w-full">
        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
          Pipeline Alert
        </h4>
        <p className="text-sm font-medium text-slate-700 leading-relaxed bg-slate-50 border border-slate-100 p-3 rounded-xl font-mono break-words">
          {errorMessage}
        </p>
      </div>

      {/* --- HTTP STATUS CODE BADGE --- */}
      <div className="pt-2">
        <span className="inline-flex items-center gap-1 text-[11px] font-black tracking-widest uppercase bg-slate-900 text-white px-2.5 py-1 rounded-md shadow-inner">
          Code {statusCode}
        </span>
      </div>

    </div>
  );
}