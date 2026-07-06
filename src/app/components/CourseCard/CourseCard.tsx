'use client';

import React from "react";
import Link from "next/link";
import { convertToUrlSlug } from "../../lib/utils";

// Define strict typing parameters for the incoming payload matrix
interface CourseCardProps {
  enrolled?: boolean;
  id: string | number;
  courseName: string;
  courseDuration?: string;
  coverImage?: string;
  courseCompletionStatus?: boolean;
  coursePrice?: number | string | null;
  courseTechnologies?: string | null;
}

export default function CourseCard({
  enrolled = false,
  id,
  courseName,
  courseDuration = '',
  coverImage,
  courseCompletionStatus = false,
  coursePrice = null,
  courseTechnologies = null,
}: CourseCardProps) {
  
  // Use Next.js standard runtime ecosystem variable strings
  const BACKEND_PATH = process.env.NEXT_PUBLIC_BACKEND_PATH || "";

  // Structure routing layouts using Next.js route parameter guidelines
  const url = enrolled
    ? `/dashboard/${id}/${convertToUrlSlug(courseName)}`
    : `/course/${convertToUrlSlug(courseName)}`;

  return (
    <div className="group relative flex flex-col w-full h-full bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      
      {/* Dynamic Navigation Container wrapper block */}
      <Link href={url} className="flex flex-col flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-2xl">
        
        {/* --- COURSE HEADER HERO & COVER --- */}
        <div className="relative w-full aspect-video bg-slate-900 overflow-hidden">
          {coverImage && coverImage !== "/media/" ? (
            <img
              src={`${BACKEND_PATH}${coverImage}`}
              alt={courseName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-950 font-mono text-xl font-bold text-slate-700 selection:bg-transparent">
              {"</>"}
            </div>
          )}
          
          {/* Subtle elegant gradient overlay text title scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-4 flex items-end">
            <h4 className="text-base font-bold text-white tracking-tight line-clamp-2 leading-snug drop-shadow-sm text-[18px]">
              {courseName}
            </h4>
          </div>
        </div>

        {/* --- METRICS & CONTENTS BODY LAYER --- */}
        <div className="flex flex-col flex-1 p-5 space-y-4">
          
          {/* Duration & Price Indicators container */}
          {(courseDuration !== '' || (coursePrice !== null && !enrolled)) && (
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium">
              {courseDuration !== '' && (
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg text-[14px]">
                  <i className="fi fi-rr-hourglass-start text-blue-500 mt-0.5" />
                  <span>{courseDuration}</span>
                </div>
              )}
              
              {coursePrice !== null && !enrolled && (
                <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg text-emerald-700 font-bold text-[16px]">
                  <i className="fi fi-rr-indian-rupee-sign mt-0.5 text-xs" />
                  <span>&#8377; {coursePrice} <span className="text-[12px] text-emerald-600/70 font-medium">+ 18% GST</span></span>
                </div>
              )}
            </div>
          )}

          {/* Technology Mapping Badges array matrix parsing logic */}
          {courseTechnologies !== null && (
            <div className="flex flex-wrap gap-1.5">
              {courseTechnologies.split(",").map((tech, index) => (
                <span 
                  className="text-[12px] font-bold tracking-wide uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200/40" 
                  key={index}
                >
                  {tech.trim()}
                </span>
              ))}
            </div>
          )}

          {/* --- LOWER INTERACTIVE ROUTE TRIGGER BUTTON BAR --- */}
          <div className="pt-2 mt-auto">
            {enrolled ? (
              <div className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-colors group-hover:bg-blue-600">
                <i className="fi fi-rr-dashboard text-sm" />
                <span>Continue to Workspace</span>
              </div>
            ) : (
              <div className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-colors">
                <i className="fi fi-rr-file-signature text-sm" />
                <span>Enroll in Syllabus Curriculum</span>
              </div>
            )}
          </div>

        </div>
      </Link>

      {/* --- FLOATING COMPLETION BADGE STATUS BAR --- */}
      {courseCompletionStatus && (
        <div className="absolute top-3 right-3 z-10 bg-emerald-500 text-white text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm border border-emerald-400 animate-fadeIn">
          Completed 🎉
        </div>
      )}
    </div>
  );
}