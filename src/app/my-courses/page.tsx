'use client';

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import { Calendar, ChevronDown, ChevronUp, Download, RefreshCw } from 'lucide-react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

import { useAuth } from "../Context/AuthContext";
import CourseCard from "../components/CourseCard/CourseCard";
import Button from "../components/Button";
//import StudentAttendanceReport from "@/components/AttendanceReport/AttendanceReport";
import PWAInstallBanner from "../components/PWAInstallBanner/PWAInstallBanner";
// Import our decoupled PDF component utility
import { executeBackgroundPdfDownload } from "../utils/acceptanceLetter";

interface Course {
  Courses_id: string;
  Courses__Course_Name: string;
  Courses_Completed: boolean;
  Courses__Course_Thumbnail: string;
}

export default function Courses() {
  const [isSyncingCourses, setIsSyncingCourses] = useState<boolean>(false);
  const [activeProcessingId, setActiveProcessingId] = useState<string | null>(null); 
  const [showReport, setShowReport] = useState<boolean>(false);
  
  const router = useRouter();
  const { user, loading, getCourses } = useAuth();

  useEffect(() => {
    if (!loading && !user?.id) {
      router.replace("/login");
    }
  }, [user?.id, loading, router]);

  const handleSyncData = useCallback(async () => {
    if (!user?.id || isSyncingCourses) return;
    try {
      setIsSyncingCourses(true);
      await getCourses();
    } catch (err: any) {
      toast.error(err.message || "Failed to synchronize course records.");
    } finally {
      setIsSyncingCourses(false);
    }
  }, [user?.id, getCourses, isSyncingCourses]);

  useEffect(() => {
    if (user?.id && !user?.courses && !isSyncingCourses) {
      handleSyncData();
    }
  }, [user?.id, user?.courses, isSyncingCourses, handleSyncData]);

  const handleInitiateDownloadFlow = useCallback(async (course: Course) => {
    if (!user?.id || activeProcessingId) return;
    
    setActiveProcessingId(course.Courses_id); 
    try {
      const token = localStorage.getItem('student_auth_token');
      
      const response = await axios.get('https://atplc20.pythonanywhere.com/acceptance-letter/', {
        params: { user_id: user.id },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data && response.data.success) {
        const payloadData = response.data.data;
        payloadData.courseName = course.Courses__Course_Name || payloadData.courseName;

        // Execute background call smoothly via the standalone component layer
        await executeBackgroundPdfDownload(payloadData);
      } else {
        throw new Error("Target validation sequence rejected by server registry mappings.");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Failed to pull documents.";
      toast.error(errorMessage);
    } finally {
      setActiveProcessingId(null); 
    }
  }, [user?.id, activeProcessingId]);

  const courseCards = useMemo(() => {
    if (isSyncingCourses) {
      return Array.from({ length: 3 }).map((_, idx) => (
        <div key={`skeleton-${idx}`} className="flex flex-col bg-white border border-slate-200 rounded-2xl p-5 space-y-4 animate-pulse">
          <div className="w-full h-40 bg-slate-200 rounded-xl" />
          <div className="h-5 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-slate-200 rounded w-1/2" />
          <div className="flex gap-3 pt-2">
            <div className="flex-1 h-10 bg-slate-200 rounded-xl" />
            <div className="w-24 h-10 bg-slate-200 rounded-xl" />
          </div>
        </div>
      ));
    }

    if (user?.courses?.length) {
      return user?.courses.map((course: Course) => {
        const isThisCardCompiling = activeProcessingId === course.Courses_id;
        const thumbnailSrc = course.Courses__Course_Thumbnail.startsWith("/media")
          ? course.Courses__Course_Thumbnail
          : "/media/" + course.Courses__Course_Thumbnail;
        
        return (
          <div key={course.Courses_id} className="flex flex-col bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow relative">
            
            {isThisCardCompiling && (
              <div className="absolute inset-0 bg-white/60 rounded-2xl backdrop-blur-[1px] flex items-center justify-center z-10 animate-fadeIn">
                <div className="bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-md">
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Generating Acceptance PDF...
                </div>
              </div>
            )}

            <CourseCard
              enrolled={true}
              id={course.Courses_id}
              courseName={course.Courses__Course_Name}
              courseDuration={''}
              courseCompletionStatus={course.Courses_Completed}
              coverImage={thumbnailSrc}
              couresPrice={null}
              courseTechnologies={null}
            />
            
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button 
                onClick={() => handleInitiateDownloadFlow(course)}
                disabled={activeProcessingId !== null}
                className="flex-1 flex items-center justify-center gap-2 font-semibold text-sm text-white px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-500 hover:bg-emerald-600"
                type="button"
              >
                <Download size={16} />
                Download Acceptance Letter
              </button>

              <button
                onClick={() => setShowReport((prev) => !prev)}
                disabled={activeProcessingId !== null}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
                type="button"
              >
                <Calendar size={16} />
                {showReport ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>
        );
      });
    }

    return (
      <div className="col-span-full flex flex-col items-center justify-center text-center p-12 bg-white border border-slate-200 rounded-2xl space-y-4">
        <h2 className="text-xl font-bold text-slate-800">No Enrolled Courses Found</h2>
        <p className="text-sm text-slate-500 max-w-sm">Please enroll in an active educational curriculum pathway to unlock your dashboard.</p>
        <Link href="/courses">
          <Button label={"Enroll Now"} />
        </Link>
      </div>
    );
  }, [user?.courses, activeProcessingId, showReport, isSyncingCourses, handleInitiateDownloadFlow]);

  return (
    <section className="w-full min-h-screen bg-slate-50/50 p-6 md:p-10 space-y-8">
      <PWAInstallBanner />
      <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Active Courses</h3>
        
        <button
          onClick={handleSyncData}
          disabled={isSyncingCourses}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          type="button"
        >
          <RefreshCw size={12} className={isSyncingCourses ? "animate-spin" : ""} />
          {isSyncingCourses ? "Syncing..." : "Sync Records"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courseCards}
      </div>

      {showReport && (
        <div className="mt-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm transition-all animate-fadeIn">
        
        </div>
      )}
    </section>
  );
}