'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CalendarRange, Laptop, Smile } from 'lucide-react';

// --- TYPESCRIPT INTERFACES ---
interface CounterProps {
  number: number;
  label: string;
  icon: React.ReactNode;
}

export default function PageStatics() {
  return (
    <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 box-border">
      <div className="w-full">
        <Counter 
          number={6} // Updated tracking to match real-time milestones seamlessly 
          label="Years of Establishment" 
          icon={<CalendarRange size={24} className="text-blue-600 dark:text-blue-400" />} 
        />
      </div>
      <div className="w-full">
        <Counter 
          number={100} 
          label="Practical Sessions" 
          icon={<Laptop size={24} className="text-indigo-600 dark:text-indigo-400" />} 
        />
      </div>
      <div className="w-full">
        <Counter 
          number={100} 
          label="Satisfied Students" 
          icon={<Smile size={24} className="text-emerald-600 dark:text-emerald-400" />} 
        />
      </div>
    </section>
  );
}

function Counter({ number, icon, label }: CounterProps) {
  const counterRef = useRef<HTMLDivElement | null>(null);
  const [counterNumber, setCounterNumber] = useState<number>(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    const currentRef = counterRef.current;

    const animateCounter = () => {
      // Dynamic duration parsing: ensures both high and low numbers take ~1.5s total to finish
      const duration = 1500; 
      const frameDuration = 1000 / 60; // Smooth 60fps execution timeline
      const totalFrames = Math.round(duration / frameDuration);
      const incrementPerFrame = number / totalFrames;
      
      let currentFrame = 0;

      intervalId = setInterval(() => {
        currentFrame++;
        const nextValue = Math.ceil(incrementPerFrame * currentFrame);
        
        if (nextValue >= number) {
          setCounterNumber(number);
          if (intervalId) clearInterval(intervalId);
        } else {
          setCounterNumber(nextValue);
        }
      }, frameDuration);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry.isIntersecting) return;

        animateCounter();

        if (currentRef) {
          observer.unobserve(currentRef);
        }
      },
      {
        root: null,
        threshold: 0,
        rootMargin: '0px 0px -50px 0px', // Trigger precisely when cards approach the viewport base
      }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    // Clean up loop to destroy intervals and prevent background performance leaks
    return () => {
      if (intervalId) clearInterval(intervalId);
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [number]);

  return (
    <div 
      ref={counterRef} 
      className="group relative flex flex-col items-center text-center p-6 sm:p-8 bg-white border border-slate-200/60 rounded-2xl shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md box-border overflow-hidden select-none"
    >
      {/* Structural Accent Top Lighting Bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

      {/* Decorative Icon Wrapper Circle */}
      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 transition-colors duration-300 group-hover:bg-blue-50/50 border border-slate-100/80">
        {icon}
      </div>

      {/* Incremental Numerical Header */}
      <h4 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight m-0 flex items-center gap-0.5">
        <span>{counterNumber}</span>
        <span className="text-blue-600 font-bold transition-transform duration-300 group-hover:translate-x-0.5">+</span>
      </h4>

      {/* Context Metric Label */}
      <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-2 mb-0 tracking-wide uppercase">
        {label}
      </p>
    </div>
  );
}