'use client';

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Copy, Info, Award, FileText, Loader2, BookOpen } from 'lucide-react';
import {
  WhatsappShareButton as OriginalWhatsappShareButton,
  WhatsappIcon,
  LinkedinShareButton,
  LinkedinIcon,
} from "react-share";

import { useAuth } from "../../../Context/AuthContext";
import { useApp } from "../../../Context/AppContext";
import { convertUrlToText } from "../../../lib/utils";
import TaskCard from "../../../components/TaskCard/TaskCard";
import Card from "../../../components/ProgressCard/ProgressCard";
import CourseFeedback from "../../../components/Feedback/CourseFeedbackForm/CourseFeedbackForm";
import Certificate from "../../../components/Certificate/Certificate";
import CourseCardSkeleton from "../../../components/CourseCard/CourseCardSkeleton";
import Account from "@/app/components/Account/Account";
import ErrorBox from "../../../components/ErrorBox/ErrorBox";
import VideoWorkspace from "../../../components/Dashboard/VideoWorkspace";

// --- INTERFACES ---
interface Task {
  id: string | number;
  Task_No: number;
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
  const { user, loading: authLoading } = useAuth();
  
  const { loading: contextLoading, error: contextError, getDashboardTasks } = useApp() as {
    loading: boolean;
    error: string | null;
    getDashboardTasks: (courseId: string, username: string) => Promise<{ tasks: any[]; submissions: any[] }>;
  };

  const [hamburgerStatus, setHamburgerStatus] = useState(false);
  
  const courseIdStr = params?.id as string || "";
  const courseNameUrl = params?.courseName as string || "";
  const decodedCourseName = convertUrlToText(courseNameUrl);

  const [localError, setLocalError] = useState<string>("");
  const [taskData, setTaskData] = useState<Task[]>([]);
  const [completedTask, setCompletedTask] = useState<Submission[]>([]);
  const [tooltipText, setTooltipText] = useState<string>("copy");
  
  const [viewMeeting, setViewMeeting] = useState<boolean>(false);
  const [showCertificatePreview, setShowCertificatePreview] = useState<boolean>(false);
  const [activateCertGeneration, setActivateCertGeneration] = useState<boolean>(false);
  
  // 🔑 FIX: Initialize to an empty string on the server to prevent initial DOM mismatch errors
  const [feedback, setFeedback] = useState<string>("");

  // 🔑 FIX: Populate feedback safely out of localStorage only after successful browser mounting
  useEffect(() => {
    const savedFeedback = localStorage.getItem("feedback");
    if (savedFeedback) {
      setFeedback(savedFeedback);
    }
  }, []);

  // Client Session Route Guard Rail
  useEffect(() => {
    if (!authLoading && !user?.id) {
      router.replace("/login");
    }
  }, [user, router, authLoading]);

  // Synchronize Metadata Fields Natively
  useEffect(() => {
    if (decodedCourseName) {
      document.title = `Dashboard | ${decodedCourseName}`;
    }
  }, [decodedCourseName]);

  useEffect(() => {
    async function syncDashboardData() {
      if (!user?.id || !courseIdStr) return;

      try {
        setLocalError("");
        
        const { tasks, submissions } = await getDashboardTasks(courseIdStr, user.id);

        const approvedFilter = submissions.filter((sub: any) => sub.Task_Status === "Approved");
        setCompletedTask(approvedFilter);

        const structuralTasksMapping = tasks.map((task: any) => {
          const matchingSubmission = submissions.find((sub: any) => String(sub.Task_No_id) === String(task.id));
          return {
            ...task,
            Task_No: Number(task.Task_No),
            Task_Status: matchingSubmission?.Task_Status || "",
            Code_Link: matchingSubmission?.Code_Link || "",
            Output_Link: matchingSubmission?.Output_Link || "",
            Remarks: matchingSubmission?.Remarks || "",
          };
        });

        setTaskData(structuralTasksMapping);
      } catch (err: any) {
        setLocalError(err.message || "Failed to load dashboard tasks tracking context matrix.");
      }
    }

    if (!authLoading && user?.id) {
      syncDashboardData();
    }
  }, [courseIdStr, user?.id, authLoading, getDashboardTasks]);

  const executionPercentage = taskData.length > 0 ? (completedTask.length / taskData.length) * 100 : 0;
  const isEligible = executionPercentage >= 75;

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

  const activeDisplayError = localError || contextError || "";
  const isCurrentlyLoading = contextLoading && taskData.length === 0;

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
    <section className="w-full min-h-screen bg-slate-50/50 p-6 md:p-10 space-y-8 select-none font-sans text-slate-900 box-border">
      
      {/* --- HEADER TITLE BAR --- */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs box-border">
        <div className="space-y-1">
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight m-0">
            {decodedCourseName}
          </h3>
          <p className="text-xs text-slate-500 font-medium m-0">
            Track syllabus tasks, submit implementations, or connect with video-mentors.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-center">
          <Account setHamburgerStatus={setHamburgerStatus} />
        </div>
      </div>

      <VideoWorkspace roomId={courseIdStr} roomName={decodedCourseName}/>

      {!viewMeeting && (
        <div className="space-y-6 animate-fadeIn w-full box-border">
          
          {/* --- METRIC CARD PROGRESS CONTAINER --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full box-border">
            <Card
              heading="Verified Submission"
              icon="fi fi-rr-list-check"
              obtainedScore={completedTask.length}
              totalScore={taskData.length}
            />
            <Card
              heading="Pending Tasks"
              icon="fi fi-rr-info"
              obtainedScore={Math.max(0, taskData.length - completedTask.length)}
              totalScore={taskData.length}
            />
          </div>

          {/* --- ACTIONS & SHARE CONTROL TOOLBAR --- */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-sm box-border">
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
                <span className="absolute -top-8 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity capitalize whitespace-nowrap z-20">
                  {tooltipText}
                </span>
              </button>
            </div>
          </div>

          {/* --- DYNAMIC TASK RENDERING PORTION CONTROLLER --- */}
          {isCurrentlyLoading ? (
            dashboardSkeletons
          ) : activeDisplayError !== "" ? (
            <div className="py-6 border border-dashed border-slate-200 rounded-2xl bg-white p-6 box-border">
              <ErrorBox error={activeDisplayError} />
            </div>
          ) : taskData.length === 0 ? (
            <div className="w-full text-center py-12 bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400 font-medium text-sm shadow-xs box-border">
              <BookOpen size={32} className="mx-auto text-slate-300 mb-2" />
              No syllabus lab items registered under this technical division.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full box-border">
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

          {/* --- UNIFIED DYNAMIC CERTIFICATE EXTRACTION --- */}
          <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm space-y-3 box-border">
            <CourseFeedback feedback={feedback} setFeedback={setFeedback} />
          </div>
          
          <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm space-y-6 pt-4 flex flex-col items-center min-h-[150px] w-full gap-6 box-border">
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