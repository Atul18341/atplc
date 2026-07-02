'use client';

import React, { useEffect, useState } from 'react';
import CircularProgress from '../CircularProgress/CircularProgress';

// Define strict typing parameters for the incoming score matrix
interface ProgressCardProps {
  heading: string;
  icon: string;
  obtainedScore: number;
  totalScore: number;
}

export default function ProgressCard({ 
  heading, 
  icon, 
  obtainedScore, 
  totalScore 
}: ProgressCardProps) {
  const [overallPercentage, setOverallPercentage] = useState<number | string>(0);

  useEffect(() => {
    // Edge-case guard clause: Prevent Division by Zero throwing NaN errors
    if (totalScore === 0) {
      setOverallPercentage(0);
      return;
    }
    
    const percentage = (obtainedScore / totalScore) * 100;
    // Keep a clean string decimal representation if fractional, otherwise pass a whole integer
    setOverallPercentage(percentage % 1 === 0 ? percentage : percentage.toFixed(1));
  }, [obtainedScore, totalScore]);

  return (
    <div className="flex flex-col w-full bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-md">
      
      {/* --- ICON HEADER STRIP --- */}
      <div className="flex items-center mb-4">
        <div className="flex items-center justify-center h-9 w-9 bg-slate-50 border border-slate-100 rounded-xl text-slate-600">
          {/* Supports dynamic icon font classes natively styled via Tailwind */}
          <i className={`${icon} text-base`} />
        </div>
      </div>

      {/* --- CONTENT BLOCK LAYER --- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Left Side text parameters column */}
        <div className="flex flex-col space-y-1.5">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            {heading}
          </h3>
          <div className="text-3xl font-black text-slate-950 tracking-tight flex items-baseline gap-1">
            <span>{obtainedScore}</span>
            <span className="text-lg font-medium text-slate-400">/</span>
            <span className="text-lg font-medium text-slate-500">{totalScore}</span>
          </div>
        </div>

        {/* Right Side circular canvas visual graph block */}
        <div className="flex-shrink-0 self-center sm:self-auto">
          {/* Ensure the CircularProgress component handles dynamic number/string inputs cleanly */}
          <CircularProgress width="100" percentage={overallPercentage} />
        </div>

      </div>

    </div>
  );
}