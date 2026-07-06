'use client';

import React, { useCallback, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Loader2, BookOpen } from "lucide-react";

import { useApp, Course } from "../Context/AppContext";
import { useAuth } from "../Context/AuthContext";
import CourseCard from "../components/CourseCard/CourseCard";
import CourseCardSkeleton from "../components/CourseCard/CourseCardSkeleton";

// --- TYPESCRIPT INTERFACES ---
interface UserCourseEnrollment {
  Courses_id: string | number;
  [key: string]: any;
}

export default function CoursesPage() {
  const router = useRouter();
  
  // 🔑 Extract course layout states and fetch pipelines out of your core AppContext
  const { courses, loading, getCourses } = useApp() as {
    courses: Course[] | null;
    loading: boolean;
    getCourses: () => Promise<Course[]>;
  };
  
  const { user } = useAuth();
  
  // Safely cast user enrollment structures to track baseline permission checks
  const myCourses = (user?.courses as UserCourseEnrollment[]) || [];

  // Metadata assignment hook matching standard layout constraints natively
  useEffect(() => {
    document.title = "ATPLC | Courses";
    const metaTags = document.getElementsByTagName("meta");
    if (metaTags[2]) {
      metaTags[2].content = `Explore ATPLC's expert-led courses in web development, frontend, backend, Python, AI, and more. Gain hands-on experience, industry certifications, and career-ready skills. Enroll now!`;
    }
    window.scrollTo(0, 0);
  }, []);

  // Fetch course metadata list catalogs securely if not loaded in memory state arrays
  const fetchCoursesCatalog = useCallback(async () => {
    if (!courses || courses.length === 0) {
      try {
        await getCourses();
      } catch (err: any) {
        const errorMessage = err.message || "Failed to load engineering course tracks.";
        toast.error(errorMessage);
        // Clean Next.js route substitution replaces state push metrics
        //router.replace("/error");
      }
    }
  }, [courses, getCourses, router]);

  useEffect(() => {
    fetchCoursesCatalog();
  }, [fetchCoursesCatalog]);

  return (
    <section className="w-full min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300 box-border pb-12 select-none">
      
      {/* --- HERO IMAGE BANNER PARALLAX ROW --- */}
      <div className="relative w-full h-[240px] md:h-[320px] bg-slate-900 overflow-hidden flex items-center justify-center">
        <Image 
          src="/Assets/Illustrator/training-page.jpg" 
          alt="ATPLC Professional Training Programs illustration banner layout" 
          fill
          priority
          className="object-cover opacity-60 pointer-events-none select-none"
          sizes="100vw"
        />
        {/* Blended premium drop glass layer title plate */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent z-10" />
        <div className="relative z-20 text-center space-y-2 px-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md m-0 font-sans">
            Our Courses
          </h1>
          <p className="text-xs md:text-sm text-slate-200 font-medium tracking-wide max-w-xl mx-auto drop-shadow-xs">
            Accelerate your professional technical capability with enterprise production tracks.
          </p>
        </div>
      </div>

      {/* --- CONTENT CARD RENDERING MATRIX --- */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-10 box-border">
        {loading && (!courses || courses.length === 0) ? (
          /* Premium custom skeleton loader array layout mesh wrapper fallback */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
            {[1, 2, 3].map((idx) => (
              <CourseCardSkeleton key={idx} />
            ))}
          </div>
        ) : courses && courses.length === 0 ? (
          /* Empty Catalog Layout state fallback tracking */
          <div className="w-full text-center py-16 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 font-medium text-sm max-w-md mx-auto shadow-xs">
            <BookOpen size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3 animate-pulse" />
            <span className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Catalog Empty</span>
            No syllabus instruction streams are currently mapped to the registry.
          </div>
        ) : (
          /* Active Production Grid Render Track */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full animate-fadeIn">
            {courses?.map((course) => {
              // cross-examine course status vectors with active array index checks
              const isEnrolled = myCourses.some(
                (myCourse) => String(myCourse?.Courses_id) === String(course?.id)
              ); 
              return (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  courseName={course.Course_Name}
                  courseDuration={course.Course_Duration || ""}
                  coverImage={course.Course_Thumbnail || ""}
                  coursePrice={course.Course_Price || 0}
                  courseTechnologies={course.Course_Technologies}
                  enrolled={isEnrolled}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}