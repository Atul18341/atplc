'use client';

import React from 'react';
import Image from 'next/image';
import { User, GraduationCap } from 'lucide-react';

// --- TYPESCRIPT INTERFACES ---
export interface FeedbackCardProps {
  id?: string | number;
  Name: string;
  College_Name: string;
  Batch: string | number;
  Branch: string;
  Profile_Pic?: string;
  Feedback: string;
  Feedback_Type: 'Trainee' | 'Intern' | string;
  full?: boolean;
}

export default function FeedbackCard({
  Name,
  College_Name,
  Batch,
  Branch,
  Profile_Pic,
  Feedback,
  Feedback_Type,
  full = false,
}: FeedbackCardProps) {
  
  const BACKEND_PATH = process.env.NEXT_PUBLIC_BACKEND_PATH || "";

  return (
    <div className="group flex flex-col justify-between p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 box-border w-full select-none">
      
      <div className="space-y-4">
        {/* --- CARD HEADER LAYER --- */}
        <div className="flex items-start gap-4">
          
          {/* Profile Avatar Frame */}
          <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-shrink-0 items-center justify-center border border-slate-200/40 dark:border-slate-700 shadow-inner">
            {Profile_Pic && Profile_Pic !== "/media/" ? (
              <Image
                src={
                  Profile_Pic.startsWith('http') 
                    ? Profile_Pic 
                    : `${BACKEND_PATH}${Profile_Pic}`
                }
                alt={`${Name} student testimonial profile picture`}
                fill
                className="object-cover pointer-events-none select-none transition-transform duration-300 group-hover:scale-105"
                sizes="48px"
              />
            ) : (
              <User size={20} className="text-slate-400 dark:text-slate-500" />
            )}
          </div>

          {/* User Core Bio Data */}
          <div className="space-y-0.5 min-w-0 flex-1">
            <h3 className="text-[24px] font-black text-slate-800 dark:text-white tracking-tight m-0 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {Name}
            </h3>
            
            <p className="text-[14px] font-medium text-slate-400 dark:text-slate-500 m-0 flex items-center gap-1">
              <GraduationCap size={15} className="flex-shrink-0" />
              <span className="">{College_Name}</span>
            </p>
          </div>

        </div>

        {/* --- RECONSTRUCTED METADATA BADGE ROW --- */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className={`inline-flex items-center px-2 py-0.5 text-[14px] font-extrabold uppercase tracking-wider rounded-md border ${
            Feedback_Type === 'Intern'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
          }`}>
            {Feedback_Type}
          </span>

          <span className="text-[14px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/40 dark:border-slate-700/60 font-mono tracking-tight">
            {Branch} • {Batch}
          </span>
        </div>

        {/* --- CARD CONTENT PANEL --- */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <p className={`text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium font-sans m-0 ${
            full 
              ? "whitespace-pre-wrap" 
              : "line-clamp-4 text-ellipsis overflow-hidden"
          }`}>
            "{Feedback}"
          </p>
        </div>

      </div>
      
    </div>
  );
}