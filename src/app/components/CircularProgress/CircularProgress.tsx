'use client';

import React from 'react';

// Define strict typing parameters for incoming properties matrix
interface CircularProgressProps {
  width: string | number;
  percentage: string | number;
}

export default function CircularProgress({ width, percentage }: CircularProgressProps) {
  // Parse inputs safely to numbers to ensure mathematical precision
  const numericWidth = typeof width === 'string' ? parseFloat(width) : width;
  const numericPercentage = typeof percentage === 'string' ? parseFloat(percentage) : percentage;

  // Validate percentages fall between safe boundary limits (0 - 100)
  const sanitizedPercentage = Math.min(Math.max(numericPercentage || 0, 0), 100);

  // Dynamic vector math computations
  const radius = (numericWidth / 2) - 5;
  const stroke = (numericWidth / 12);
  const dashArray = radius * Math.PI * 2;
  const dashOffset = dashArray - (dashArray * sanitizedPercentage) / 100;

  return (
    <div className="relative flex items-center justify-center w-fit select-none font-sans">
      <svg
        width={numericWidth}
        height={numericWidth}
        viewBox={`0 0 ${numericWidth} ${numericWidth}`}
        className="block"
      >
        {/* --- Background Outer Track Ring --- */}
        <circle
          cx={numericWidth / 2}
          cy={numericWidth / 2}
          strokeWidth={stroke}
          r={radius}
          className="fill-none stroke-slate-100"
        />
        
        {/* --- Dynamic Filled Loading Indicator Track --- */}
        <circle
          cx={numericWidth / 2}
          cy={numericWidth / 2}
          strokeWidth={stroke}
          r={radius}
          className="fill-none stroke-blue-600 stroke-linecap-round transition-all duration-500 ease-out"
          style={{
            strokeDasharray: dashArray,
            strokeDashoffset: dashOffset,
          }}
          transform={`rotate(-90 ${numericWidth / 2} ${numericWidth / 2})`} // Rotates starting anchor to 12 o'clock node[cite: 6]
        />
      </svg>
      
      {/* --- Center Display Value Floating Badge --- */}
      <span className="absolute text-xs font-black text-slate-800 tracking-tight">
        {sanitizedPercentage}%
      </span>
    </div>
  );
}