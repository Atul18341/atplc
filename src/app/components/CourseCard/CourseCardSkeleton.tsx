'use client';

import React from "react";

export default function CourseCardSkeleton() {
  return (
    <div className="flex flex-col w-full h-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm p-5 space-y-4 animate-pulse">
      
      {/* Aspect ratio video block mimic for cover image */}
      <div className="w-full aspect-video bg-slate-200 rounded-xl" />
      
      {/* Title block line layout lines */}
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded w-5/6" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
      </div>
      
      {/* Tech badges strip mimic */}
      <div className="flex gap-2 pt-1">
        <div className="h-5 bg-slate-200 rounded-md w-12" />
        <div className="h-5 bg-slate-200 rounded-md w-16" />
        <div className="h-5 bg-slate-200 rounded-md w-14" />
      </div>
      
      {/* Lower button panel placeholders */}
      <div className="flex gap-3 pt-3 mt-auto">
        <div className="flex-1 h-10 bg-slate-200 rounded-xl" />
        <div className="w-12 h-10 bg-slate-200 rounded-xl" />
      </div>
      
    </div>
  );
}