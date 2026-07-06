'use client';

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Loader2, 
  Clock, 
  CreditCard, 
  Cpu, 
  HelpCircle, 
  BookOpen, 
  Zap, 
  ArrowLeft,
  ChevronRight
} from "lucide-react";

import { convertUrlToText } from "../../lib/utils";
import { useApp, Course } from "../../Context/AppContext";

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { getCourse } = useApp();

  const courseNameParam = (params?.courseName as string) || "";

  // --- LOCAL COMPONENT STATES ---
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Synchronize detailed target course metadata safely out of app state context
  const fetchCourseData = useCallback(async () => {
    if (!courseNameParam) return;
    try {
      setLoading(true);
      const courseDetail = await getCourse(courseNameParam);
      setCourse(courseDetail || null);
    } catch (error) {
      console.error("Failed to fetch course details metrics:", error);
    } finally {
      setLoading(false);
    }
  }, [getCourse, courseNameParam]);

  useEffect(() => {
    if (courseNameParam) {
      document.title = `ATPLC | ${convertUrlToText(courseNameParam)}`;

      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
       /* metaDescription.content = `Master ${convertUrlToText(
          courseNameParam
        )} with our expert-led course. Gain hands-on experience, real-world projects, and certification. Enroll now to boost your career!`;*/
      }
    }

    window.scrollTo(0, 0);
    fetchCourseData();
  }, [courseNameParam, fetchCourseData]);

  // Clean Loader Spinner State Fallback
  if (loading) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950">
        <Loader2 size={40} className="animate-spin text-blue-600 dark:text-blue-500" />
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest animate-pulse">
          Loading Course Blueprints...
        </p>
      </div>
    );
  }

  // Missing Catalog Match Fallback Block
  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500">
            <HelpCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white m-0">Course Not Found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-normal m-0">
            The curriculum module you are looking for cannot be located in our track records.
          </p>
          <button 
            onClick={() => router.push("/courses")} 
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white border-none rounded-xl cursor-pointer transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Return to Catalog</span>
          </button>
        </div>
      </div>
    );
  }

  // Dynamic calculations for durations safely handles state array conversions
  const durationMonths = Number(course?.Course_Duration) || 0;
  
  // 🔑 Safe rendering handling: checks if global state has parsed technologies into an array or string array
  const techStack: string[] = Array.isArray(course?.Course_Technologies) 
    ? course.Course_Technologies 
    : typeof course?.Course_Technologies === 'string'
      ? (course.Course_Technologies as string).split(",").map(t => t.trim()).filter(Boolean)
      : [];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans pb-32">
      
      {/* Dynamic Header Path Navigation */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 tracking-wide select-none">
          <span className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => router.push("/courses")}>Courses</span>
          <ChevronRight size={12} />
          <span className="text-slate-600 dark:text-slate-300 line-clamp-1">{course.Course_Name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        
        {/* --- LEFT HAND SECTION COLUMN (MEDIA & COPY CONTENT) --- */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Hero Banner Plate */}
          <div className="relative w-full h-[240px] md:h-[380px] rounded-3xl overflow-hidden border border-slate-200/60 dark:border-slate-800 bg-slate-900 shadow-sm group">
            {course.Course_Thumbnail && course.Course_Thumbnail !== "/media/" ? (
              <Image
                src={
                  course.Course_Thumbnail.startsWith("http")
                    ? course.Course_Thumbnail
                    : `https://atplc20.pythonanywhere.com/${course.Course_Thumbnail}`
                }
                alt={`${course.Course_Name} visual course path showcase`}
                fill
                priority
                className="object-cover group-hover:scale-101 transition-transform duration-500 select-none pointer-events-none"
                sizes="(max-w-7xl) 100vw, 700px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center font-mono text-3xl font-black text-slate-700 select-none">
                {"</>"}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Heading Content Block */}
          <div className="space-y-3 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs">
            <span className="text-[10px] font-black tracking-widest text-blue-600 dark:text-blue-400 uppercase">Interactive Training Track</span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white m-0 leading-tight">
              {course.Course_Name}
            </h2>
            
            {course.Course_Description && (
              <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed font-medium pt-3 m-0 border-t border-slate-100 dark:border-slate-800/60">
                {course.Course_Description}
              </p>
            )}
          </div>

          {/* Core Contents Dynamic Embed Window Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500">
              <BookOpen size={18} />
              <h4 className="text-[11px] font-black tracking-widest uppercase m-0">Syllabus Curriculum Blueprint</h4>
            </div>

            <div className="w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shadow-inner">
              {course.Course_Contents ? (
                <iframe
                  src={course.Course_Contents}
                  title={`${course.Course_Name} detailed syllabus outline document map`}
                  className="w-full h-[500px] md:h-[600px] border-none block"
                />
              ) : (
                <div className="w-full py-16 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 italic">
                  Complete program outline syllabus metrics file currently being initialized.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* --- RIGHT HAND SECTION COLUMN (INTERACTIVE DETAIL GRID CARDS) --- */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6 self-start">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
            <h3 className="text-sm font-black tracking-wider uppercase text-slate-400 dark:text-slate-500 m-0">
              Track Parameters
            </h3>

            {/* Tools List Grid Row */}
            {techStack.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Cpu size={14} className="text-slate-400" />
                  <span>Tools & Stack Focus</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech, index) => (
                    <span 
                      key={index} 
                      className="px-2.5 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl shadow-xs transition-colors hover:bg-slate-200/60"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Course Duration Parameters */}
            {durationMonths > 0 && (
              <div className="flex items-center justify-between py-3.5 border-t border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Clock size={14} className="text-slate-400" />
                  <span>Training Timeline</span>
                </div>
                <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                  {durationMonths} Month{durationMonths > 1 ? "s" : ""}
                </span>
              </div>
            )}

            {/* Investment Meta Block */}
            <div className="flex items-start justify-between py-4 border-t border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                <CreditCard size={14} className="text-slate-400" />
                <span>Base Enrollment Fee</span>
              </div>
              <div className="text-right space-y-0.5">
                <span className="text-xl font-black font-mono text-slate-900 dark:text-white block tracking-tight">
                  ₹ {Number(course.Course_Price || 0).toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
                  + 18% GST Corporate Surcharge
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* --- PREMIUM FLOATING CONVERSION ACTION DESK --- */}
      <div className="fixed bottom-0 inset-x-0 bg-white/80 dark:bg-slate-900/80 border-t border-slate-200/80 dark:border-slate-800/80 shadow-2xl backdrop-blur-xl z-50 py-4 select-none box-border animate-slideUp">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between gap-6">
          
          <div className="hidden sm:block space-y-0.5">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Course Investment</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                ₹ {Number(course.Course_Price || 0).toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Gross Fees</span>
            </div>
          </div>

          <button
            onClick={() => {
              window.location.href = `https://lyss.in/checkout-page/atplc/${course.id}`;
            }}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-blue-500/10 cursor-pointer border-none transform transition-all active:scale-98"
            type="button"
          >
            <Zap size={14} fill="currentColor" />
            <span>Secure Spot & Enroll Now</span>
          </button>

        </div>
      </div>

    </div>
  );
}