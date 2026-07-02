'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, ArrowRight, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext'; // 🔑 Grab your initialized user context

export default function Hero() {
  const { user } = useAuth(); // 🔑 Extract authenticated user object

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const target = document.getElementById('our-experties');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col justify-center items-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white overflow-hidden px-4 sm:px-6 lg:px-8">
      
      {/* Decorative Atmospheric Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 bg-blue-600/20 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none animate-pulse duration-[6000ms]" />
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 bg-indigo-500/15 rounded-full blur-[60px] sm:blur-[100px] pointer-events-none" />

      {/* Main Grid Wrapper */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center pt-12 pb-24 relative z-10 box-border">
        
        {/* LEFT COLUMN: Text Content Content Module */}
        <div className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left space-y-6 max-w-2xl mx-auto lg:mx-0">
          
          {/* Dynamic Badge State */}
          <div className="inline-flex items-center justify-center lg:justify-start gap-2 self-center lg:self-start bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 rounded-full backdrop-blur-md">
            <span className={`w-2 h-2 rounded-full ${user ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400 animate-ping'}`} />
            <span className={`text-xs font-semibold tracking-wider uppercase ${user ? 'text-emerald-400' : 'text-blue-400'}`}>
              {user ? 'Active Session' : 'Established 2020'}
            </span>
          </div>

          {/* Dynamic Greetings Headers */}
          <div className="space-y-3">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-blue-400 drop-shadow-sm select-none">
              {user ? `Welcome Back!` : 'ATPLC'}
            </h1>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-200">
              {user ? (user.Name || user.Username) : 'A Technical & Practical Learning Club'}
            </h2>
          </div>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-medium">
            {user ? (
              "Ready to keep building your tech stack today? Jump straight back into your specialized training tracker, check pending practical milestone modules, and keep working with your mentors."
            ) : (
              "ATPLC is a professional club designed to enhance practical learning among tech students in their fields of interest. We aim to motivate and empower students to master real-world skill stacks beyond the standard semester syllabus, ensuring you graduate professionally fit for the global industry."
            )}
          </p>

          {/* 🔑 DYNAMIC CALL TO ACTIONS CTA CONTROLS */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4 w-full">
            {user ? (
              /* AUTHENTICATED TARGET FLOWS */
              <>
                <Link 
                  href="/my-courses"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 transition-all transform active:scale-98 tracking-wide uppercase group border-none cursor-pointer w-full sm:w-auto box-border text-decoration-none"
                >
                  <span>Go To My courses</span>
                  <LayoutDashboard size={14} className="transform transition-transform group-hover:scale-105" />
                </Link>
              </>
            ) : (
              /* STANDARD ANONYMOUS GUEST VISITOR FLOWS */
              <>
                <a 
                  href="#our-experties" 
                  onClick={handleScroll}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 transition-all transform active:scale-98 tracking-wide uppercase group border-none cursor-pointer w-full sm:w-auto box-border text-decoration-none"
                >
                  <span>Explore Programs</span>
                  <ArrowRight size={14} className="transform transition-transform group-hover:translate-x-1" />
                </a>
                <Link 
                  href="/login"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 rounded-xl font-bold text-xs transition-all transform active:scale-98 tracking-wide uppercase cursor-pointer w-full sm:w-auto box-border text-decoration-none"
                >
                  Sign In Access
                </Link>
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Enhanced Graphic Montage Showcase */}
        <div className="lg:col-span-5 flex items-center justify-center relative min-h-[300px] sm:min-h-[400px] w-full select-none">
          {/* Main Backdrop Grid Ring Accent */}
          <div className="absolute inset-0 border border-dashed border-slate-800 rounded-full scale-90 max-w-[400px] aspect-square mx-auto pointer-events-none hidden sm:block" />
          
          <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
            
            {/* Center Frame Component: Hand Illustration */}
            <div className="absolute z-20 transform scale-95 sm:scale-100 hover:scale-105 transition-transform duration-500 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
              <Image 
                src="/Assets/Illustrator/hand.png" 
                alt="Practical Hand-on Execution Illustration"
                width={200}
                height={200}
                priority
                className="object-contain"
              />
            </div>

            {/* Top-Left Floating Frame: Female Peer Icon */}
            <div className="absolute top-4 left-4 z-10 animate-bounce duration-[4000ms] hover:scale-110 transition-transform filter drop-shadow-lg">
              <div className="bg-slate-800/80 border border-slate-700/50 p-3 rounded-2xl backdrop-blur-xs shadow-xl">
                <Image 
                  src="/Assets/Illustrator/female.png" 
                  alt="Student Collaboration Profile View"
                  width={90}
                  height={90}
                  className="object-contain rounded-xl"
                />
              </div>
            </div>

            {/* Bottom-Right Floating Frame: Male Peer Icon */}
            <div className="absolute bottom-4 right-4 z-10 animate-bounce duration-[5000ms] hover:scale-110 transition-transform filter drop-shadow-lg">
              <div className="bg-slate-800/80 border border-slate-700/50 p-3 rounded-2xl backdrop-blur-xs shadow-xl">
                <Image 
                  src="/Assets/Illustrator/male.png" 
                  alt="Tech Developer Profile View"
                  width={90}
                  height={90}
                  className="object-contain rounded-xl"
                />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* BOTTOM SCROLL INDICATOR BAR */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 hidden sm:block">
        <a 
          href="#our-experties" 
          onClick={handleScroll}
          tabIndex={0} 
          className="flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity group text-decoration-none"
        >
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 group-hover:text-blue-400 transition-colors">
            Scroll Down
          </span>
          <div className="w-8 h-8 rounded-full bg-slate-800/40 border border-slate-700/50 flex items-center justify-center shadow-inner group-hover:border-blue-500/50 transition-colors animate-bounce">
            <ChevronDown size={14} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
          </div>
        </a>
      </div>
      
    </div>
  );
}