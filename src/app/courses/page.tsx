'use client';

import React, { useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { BookOpen, GraduationCap } from 'lucide-react';

// --- CUSTOM HOOK & STATE IMPORTS ---
import { useApp } from '../Context/AppContext';
import { useAuth } from '../Context/AuthContext';
import CourseCard from '../components/CourseCard/CourseCard';

// --- TYPESCRIPT INTERFACES ---
interface CourseItem {
  id: string | number;
  Course_Name: string;
  Course_Duration: string;
  Course_Thumbnail: string;
  Course_Price: string | number;
  Course_Technologies: string;
  [key: string]: any;
}

export default function Courses() {
  const { courses, loading, getCourses } = useApp();
  
  const { user } = useAuth();
  const myCourses = user?.courses || [];
  const router = useRouter();

  // Memoise the primary courses dataset sync pipeline
  const fetchCourses = useCallback(async () => {
    if (!courses || courses.length === 0) {
      try {
        await getCourses();
      } catch (err: any) {
        toast.error(err.message || 'Failed to pull updated syllabus catalog.');
        router.replace('/error');
      }
    }
  }, [courses, getCourses, router]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <main className="w-full min-h-screen bg-slate-50/50 flex flex-col select-none overflow-x-hidden box-border pb-16">
      
      {/* 1. HERO PAGE BANNER PROFILE */}
      <section className="relative w-full h-[220px] sm:h-[280px] lg:h-[340px] bg-slate-950 flex items-center justify-center overflow-hidden">
        {/* Next.js Highly Optimized Background Imagery Canvas */}
        <Image 
          src="/Assets/Illustrator/training-page.jpg" 
          alt="ATPLC Industrial Training Framework Studio"
          fill
          priority
          className="object-cover opacity-35 filter brightness-75 scale-105 pointer-events-none"
        />
        {/* Neon Ambient Fog Lighting */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 pointer-events-none" />
        
        {/* Centered Typography Headings Wrapper */}
        <div className="relative z-10 text-center space-y-2.5 px-4 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-bold tracking-widest text-blue-400 uppercase">
            <GraduationCap size={12} />
            <span>Upskill Program Matrix</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white m-0 tracking-tight drop-shadow-sm">
            Our Professional Courses
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-md mx-auto opacity-90">
            Explore industry-tailored tracks, master production stacks alongside experts, and achieve milestone internship credentials.
          </p>
        </div>
      </section>

      {/* 2. MAIN LAYOUT LOWER CANVAS BLOCK */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 box-border">
        
        {loading ? (
          /* Next.js Integrated Clean Loading Framework Placement */
          <div className="w-full min-h-[250px] flex flex-col items-center justify-center gap-3">
            <div className="w-9 h-9 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Syncing Courses...</span>
          </div>
        ) : !courses || courses.length === 0 ? (
          /* Empty Dataset Recovery UI */
          <div className="w-full text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400 font-medium text-sm">
            <BookOpen size={28} className="mx-auto text-slate-300 mb-2" />
            No active courses found in the training portal directory right now.
          </div>
        ) : (
          /* 3. RESPONSIVE COMPONENT COURSE CARDS GRID LAYOUT */
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 box-border animate-fadeIn">
            {courses.map((course) => {
              // Parse user context array mappings safely to evaluate real-time enrolment indicators
              const isEnrolled = myCourses.some(
                (myCourse) => myCourse?.Courses_id === course?.id
              );

              return (
                <div key={course.id} className="w-full flex items-stretch">
                  <CourseCard
                    id={course.id}
                    courseName={course.Course_Name}
                    courseDuration={course.Course_Duration}
                    coverImage={course.Course_Thumbnail}
                    couresPrice={course.Course_Price}
                    courseTechnologies={''}
                    enrolled={isEnrolled}
                  />
                </div>
              );
            })}
          </div>
        )}
        
      </section>
    </main>
  );
}