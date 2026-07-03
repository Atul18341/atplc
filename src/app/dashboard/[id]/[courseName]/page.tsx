'use client';

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Copy, Info, Award, FileText, ArrowLeft, Video, LayoutDashboard } from 'lucide-react';
import {
  WhatsappShareButton as OriginalWhatsappShareButton,
  WhatsappIcon,
  LinkedinShareButton,
  LinkedinIcon,
} from "react-share";

import { useAuth } from "../../../Context/AuthContext";
import { convertUrlToText } from "../../../lib/utils";
import TaskCard from "../../../components/TaskCard/TaskCard";
import Card from "../../../components/ProgressCard/ProgressCard";
import CourseFeedback from "../../../components/Feedback/CourseFeedbackForm/CourseFeedbackForm";
import Certificate from "../../../components/Certificate/Certificate";
import CourseCardSkeleton from "../../../components/CourseCard/CourseCardSkeleton";
import Account from "@/app/components/Account/Account";
import ErrorBox from "../../../components/ErrorBox/ErrorBox";

// 🔑 IMPORT YOUR LIVE STREAM MENTORSHIP CALL WORKSPACE
import VideoWorkspace from "../../../components/Dashboard/VideoWorkspace";

// --- INTERFACES ---
interface Task {
  id: string | number;
  Task_No: string | number;
  Task_Topic: string;
  Task_Content: string;
  Topic_Completed?: boolean;
  Task_Status?: string;
  Code_Link?: string;
  Output_Link?: string;
  Remarks?: string;
}

interface Submission {
  Task_No_id: string | number;
  Task_Status: string;
  Code_Link?: string;
  Output_Link?: string;
  Remarks?: string;
}

export default function CourseDashboard() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [hamburgerStatus, setHamburgerStatus] = useState(false);
  
  // Route parameters type sanitization 
  const courseIdStr = params?.id as string || "";
  const courseNameUrl = params?.courseName as string || "";
  const decodedCourseName = convertUrlToText(courseNameUrl);

  const [error, setError] = useState<any>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [taskData, setTaskData] = useState<Task[]>([]);
  const [completedTask, setCompletedTask] = useState<Submission[]>([]);
  const [tooltipText, setTooltipText] = useState<string>("copy");
  
  // 🔑 State pointer managing active live video classroom view overlays
  const [viewMeeting, setViewMeeting] = useState<boolean>(false);
  
  // State locks managing the inline dynamic certificate view box toggles
  const [showCertificatePreview, setShowCertificatePreview] = useState<boolean>(false);
  const [activateCertGeneration, setActivateCertGeneration] = useState<boolean>(false);
  
  const [feedback, setFeedback] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("feedback") || "";
    }
    return "";
  });

  // Calculate dynamic completion ratios for enforcement rules
  const executionPercentage = taskData.length > 0 ? (completedTask.length / taskData.length) * 100 : 0;
  const isEligible = executionPercentage >= 75;

  // Client Session Route Guard Rail
  useEffect(() => {
    if (!loading && !user?.id) {
      router.replace("/login");
    }
  }, [user, router, loading]);

  // Synchronize Metadata Fields Natively
  useEffect(() => {
    if (decodedCourseName) {
      document.title = `Dashboard | ${decodedCourseName}`;
    }
  }, [decodedCourseName]);

  // Execute Task Payload API Synchronizations
  useEffect(() => {
    async function getTasks() {
      try {
        setIsLoading(true);
        setError(""); 
        const BACKEND_PATH = process.env.NEXT_PUBLIC_BACKEND_PATH || "";
        
        const { data } = await axios.post(`${BACKEND_PATH}/dashboard`, {
          course: courseIdStr,
          Username: user?.id,
        });

        const submissions: Submission[] = data?.Submissions || [];
        const tasks: Task[] = data?.Tasks || [];

        // Deduplicate submissions map tracking matching Task_No_id rows
        const uniqueSubmissions = Object.values(
          submissions.reduce<Record<string | number, Submission>>((acc, task) => {
            acc[task.Task_No_id] = task;
            return acc;
          }, {})
        );

        const approvedFilter = uniqueSubmissions.filter((sub) => sub.Task_Status === "Approved");
        setCompletedTask(approvedFilter);

        // Hydrate configuration records matrix mappings
        const structuralTasksMapping = tasks.map((task) => {
          const matchingSubmission = uniqueSubmissions.find((sub) => sub.Task_No_id === task.id);
          return {
            ...task,
            Task_Status: matchingSubmission?.Task_Status || "",
            Code_Link: matchingSubmission?.Code_Link || "",
            Output_Link: matchingSubmission?.Output_Link || "",
            Remarks: matchingSubmission?.Remarks || "",
          };
        });

        setTaskData(structuralTasksMapping);
      } catch (e: any) {
        setError(e);
      } finally {
        setIsLoading(false);
      }
    }

    if (user?.id) {
      getTasks();
    }
  }, [courseIdStr, user?.id]);

  const handleNativeCopyAction = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setTooltipText("copied");
    } catch (err) {
      console.error("Failed to copy text string securely: ", err);
    }
  };

  const shareUrl = `https://www.atplc.in/dashboard/${user?.id}/${courseIdStr}`;
  const shareTitle = `My ${decodedCourseName} Work at ATPLC`;

  const dashboardSkeletons = useMemo(() => {
    return (
      <div className="w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CourseCardSkeleton />
        </div>
      </div>
    );
  }, []);

  return (
    <section className="w-full min-h-screen bg-slate-50/50 p-6 md:p-10 space-y-8 select-none">
      
      {/* --- HEADER TITLE BAR --- */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight m-0">
            {decodedCourseName}
          </h3>
          <p className="text-xs text-slate-500 font-medium m-0">
            Track syllabus tasks, submit implementations, or connect with video-mentors.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-center">
          {/* 🔑 Dynamic overlay button back control link */}
          {viewMeeting && (
            <button
              type="button"
              onClick={() => setViewMeeting(false)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Exit Classroom</span>
            </button>
          )}
          <Account setHamburgerStatus={setHamburgerStatus} />
        </div>
      </div>

      {/* --- 🔑 INTERACTIVE LIVE VIDEO CONFERENCING ROW WRAPPER --- */}
      <div className="w-full">
        {viewMeeting ? (
          /* Active Interactive Workspace Window Canvas View */
          <div className="bg-slate-950 p-4 rounded-3xl border border-slate-900 shadow-xl animate-fadeIn">
            <VideoWorkspace />
          </div>
        ) : (
          /* Informative Launcher CTA Card interface layer */
          <div className="w-full bg-white border border-slate-200/80 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs transition-all">
            <div className="flex items-start gap-4 text-left">
              <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl hidden sm:block">
                <LayoutDashboard size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 m-0">Live Technical Mentorship Room</h3>
                <p className="text-xs text-slate-500 max-w-xl leading-normal font-medium m-0">
                  Join the automated real-time engineering code review laboratory channel. Interact with project leads, stream your terminal output, and ask context questions live.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setViewMeeting(true)}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/10 transition-all transform active:scale-98 tracking-wide uppercase cursor-pointer whitespace-nowrap border-none"
            >
              <Video size={14} strokeWidth={2.5} />
              <span>Launch Interactive Classroom</span>
            </button>
          </div>
        )}
      </div>

      {/* HIDE BASE SYLLABUS LIST TRACKS LOGS IF STUDENT IS ENGAGED IN CALL CANVASES */}
      {!viewMeeting && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* --- METRIC CARD PROGRESS CONTAINER --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card
              heading="Verified Submission"
              icon="fi fi-rr-list-check"
              obtainedScore={completedTask.length}
              totalScore={taskData.length}
            />
            <Card
              heading="Pending Tasks"
              icon="fi fi-rr-info"
              obtainedScore={taskData.length - completedTask.length}
              totalScore={taskData.length}
            />
          </div>

          {/* --- ACTIONS & SHARE CONTROL TOOLBAR --- */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider m-0">Course Tasks</h4>
            
            <div className="flex items-center gap-2.5">
              <OriginalWhatsappShareButton title={shareTitle} url={shareUrl}>
                <WhatsappIcon round size={36} />
              </OriginalWhatsappShareButton>
              
              <LinkedinShareButton title={shareTitle} summary="My training tracking logs at @ATPLC" source="atplc.in" url={shareUrl}>
                <LinkedinIcon round size={36} />
              </LinkedinShareButton>

              <button 
                type="button"
                onClick={handleNativeCopyAction}
                onMouseLeave={() => setTooltipText("copy")}
                className="group relative flex items-center justify-center p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-full transition-colors cursor-pointer"
              >
                <Copy size={16} className="text-slate-600" />
                <span className="absolute -top-8 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity capitalize font-sans whitespace-nowrap z-20">
                  {tooltipText}
                </span>
              </button>
            </div>
          </div>

          {/* --- DYNAMIC TASK VIEW PORTION AND LOCALIZED IN-LINE ERROR HANDLING --- */}
          {isLoading ? (
            dashboardSkeletons
          ) : error !== "" ? (
            <div className="py-6 border border-dashed border-slate-200 rounded-2xl bg-white p-6">
              <ErrorBox error={error} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {taskData.map((task) => (
                <TaskCard
                  key={task.Task_No}
                  courseId={courseIdStr}
                  Task_No={task.Task_No}
                  Task_Id={task.id}
                  Task_Topic={task.Task_Topic}
                  Task_Content={task.Task_Content}
                  Task_Status={task.Task_Status || ""}
                  Code_Link={task.Code_Link || ""}
                  Output_Link={task.Output_Link || ""}
                  Remarks={task.Remarks || ""}
                  Topic_Completed={task.Topic_Completed || false}
                />
              ))}
            </div>
          )}

          {/* --- UNIFIED DYNAMIC CERTIFICATE EXTRACTION WITH LAZY PREVIEW WORKFLOW --- */}
          <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm space-y-3">
            <CourseFeedback feedback={feedback} setFeedback={setFeedback} />
          </div>
          
          <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm space-y-6 pt-4 flex flex-col items-center min-h-[150px] w-full gap-6">
            <section className="w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 box-border">
              {feedback && feedback.length > 10 ? (
                <div className="space-y-4 w-full">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider m-0">Course Certificate</h3>
                  </div>
                  
                  {isEligible ? (
                    <div className="flex flex-col items-center gap-4 w-full">
                      <div className="flex items-center justify-center gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            setActivateCertGeneration(true);
                            setShowCertificatePreview(true);
                          }}
                          className={`flex items-center gap-2 px-5 py-2.5 font-bold text-xs rounded-xl shadow-sm transition-colors border-none cursor-pointer ${
                            activateCertGeneration 
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                        >
                          <Award size={14} />
                          <span>{activateCertGeneration ? "✓ Certificate Ready" : "Generate Certificate"}</span>
                        </button>
                      </div>

                      {/* PREVIEW WORKSPACE FRAME CONTAINER */}
                      {(showCertificatePreview || activateCertGeneration) && (
                        <div className="w-full text-left bg-slate-50 border border-slate-200/60 rounded-2xl p-4 md:p-6 mt-2 space-y-4 animate-fadeIn shadow-inner box-border">
                          <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">100% Full Scale Print Proof Document</span>
                            <button 
                              type="button"
                              onClick={() => {
                                setShowCertificatePreview(false);
                                setActivateCertGeneration(false);
                              }}
                              className="text-[11px] font-bold text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
                            >
                              Dismiss Workspace
                            </button>
                          </div>
                          
                          <div className="w-full overflow-x-auto rounded-xl bg-neutral-900/5 p-2 md:p-4 flex justify-start lg:justify-center">
                            <Certificate
                              completedTask={completedTask.length}
                              totalTask={taskData.length}
                              courseName={courseNameUrl}
                              courseId={courseIdStr}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4 max-w-2xl mx-auto flex flex-col items-center">
                      <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-950 text-xs font-semibold leading-relaxed text-left">
                        <Info size={16} className="text-rose-600 mt-0.5 flex-shrink-0" />
                        <p className="m-0">
                          You are not eligible to get completion certificate. Just download your attendance report.
                        </p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors border-none cursor-pointer"
                      >
                        <FileText size={14} />
                        <span>Download Attendance Report</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-start text-left gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-xs font-semibold leading-relaxed max-w-2xl mx-auto">
                  <Info size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="m-0">Please provide your comprehensive feedback verification logs for this track line to securely generate your certified course completion credentials document.</p>
                </div>
              )}
            </section>
          </div>

        </div>
      )}
    </section>
  );
}