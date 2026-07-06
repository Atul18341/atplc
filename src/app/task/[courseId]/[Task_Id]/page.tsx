"use client";

import React, { useEffect, useState, Suspense, useCallback } from "react";
import { useParams, useRouter } from "next/navigation"; 
import axios from "axios";
import { 
  Loader2, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  XCircle, 
  Code2, 
  ExternalLink, 
  MessageSquare, 
  ArrowLeft,
  FileText,
  Send
} from "lucide-react";
import Button from "../../../components/Button"; 
import Input from "../../../Controller/Input";   
import { useAuth } from "../../../Context/AuthContext";
import { useApp, DashboardTask, DashboardSubmission } from "../../../Context/AppContext";

// --- SUB-COMPONENT: STATUS BADGE LAYER ---
interface StatusLabelProps {
  taskStatus?: string;
  topicCompleted?: boolean;
}

function StatusLabel({ taskStatus, topicCompleted }: StatusLabelProps) {
  const baseClasses = "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-300 shadow-xs";

  if (taskStatus === "Under Review") {
    return (
      <div className={`${baseClasses} bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 animate-pulse`}>
        <Clock size={14} />
        <span>Under Review</span>
      </div>
    );
  } 
  
  if (taskStatus === "Rejected") {
    return (
      <div className={`${baseClasses} bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20`}>
        <XCircle size={14} />
        <span>Rejected</span>
      </div>
    );
  } 
  
  if (taskStatus === "Approved" || taskStatus === "Verified") {
    return (
      <div className={`${baseClasses} bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20`}>
        <CheckCircle2 size={14} />
        <span>Verified</span>
      </div>
    );
  } 

  if (topicCompleted) {
    return (
      <div className={`${baseClasses} bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20`}>
        <AlertCircle size={14} />
        <span>Missed</span>
      </div>
    );
  } 

  return (
    <div className={`${baseClasses} bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700`}>
      <AlertCircle size={14} />
      <span>Not Submitted</span>
    </div>
  );
}

// --- MAIN WORKSPACE CONTEXT CONTROLLER ---
export function TaskWorkspaceCore() {
  const params = useParams(); 
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { courses, getDashboardTasks, loading: contextLoading } = useApp();

  const courseId = (params?.courseId as string) || "";
  const taskId = (params?.Task_Id as string) || "";
  
  const [topicCompleted, setTopicCompleted] = useState<boolean>(false);

  // --- LOCAL WORKSPACE COMPONENT STATES ---
  const [taskStatus, setTaskStatus] = useState<string>("Unsubmitted");
  const [remarks, setRemarks] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [link, setLink] = useState({ codeLink: "", outputLink: "" });
  const [localError, setLocalError] = useState<string>("");

  const [activeTask, setActiveTask] = useState<DashboardTask | null>(null);
  const [activeSubmission, setActiveSubmission] = useState<DashboardSubmission | null>(null);

  const syncWorkspaceDetails = useCallback(async () => {
    const currentUserId = user?.id || user?.Username || "";
    if (!currentUserId || !courseId || !taskId) return;

    try {
      setLocalError("");
      let currentCourseMatch = courses?.find(c => String(c.id) === String(courseId));

      if (!currentCourseMatch || !currentCourseMatch.Tasks || !currentCourseMatch.Submissions) {
        const fetched = await getDashboardTasks(courseId, String(currentUserId));
        
        const targetedTask = fetched.tasks.find(t => String(t.id) === String(taskId));
        const targetedSub = fetched.submissions.find(s => String(s.Task_No_id) === String(taskId));
        
        handleDataPopulation(targetedTask || null, targetedSub || null);
        return;
      }

      const targetedTask = currentCourseMatch.Tasks.find(t => String(t.id) === String(taskId));
      const targetedSub = currentCourseMatch.Submissions.find(s => String(s.Task_No_id) === String(taskId));

      if (targetedTask) {
        handleDataPopulation(targetedTask, targetedSub || null);
      } else {
        setLocalError("Task reference ID could not be resolved from local registry maps.");
      }
    } catch (err: any) {
      setLocalError(err.message || "Failed to load dashboard tracking elements.");
    }
  }, [courses, courseId, taskId, user, getDashboardTasks]);

  const handleDataPopulation = (task: DashboardTask | null, submission: DashboardSubmission | null) => {
    if (!task) return;
    setActiveTask(task);
    setActiveSubmission(submission);

    const currentStatus = submission?.Task_Status || "Unsubmitted";
    setTaskStatus(currentStatus);
    setRemarks(currentStatus === "Under Review" ? "" : submission?.Remarks || "");
    setLink({
      codeLink: submission?.Code_Link || "",
      outputLink: submission?.Output_Link || "",
    });

    if (task.Topic_Completed !== undefined) {
      setTopicCompleted(task.Topic_Completed);
    }

    document.title = `Task | ${task.Task_Topic}`;
    const metaTags = document.getElementsByTagName("meta");
    if (metaTags[2]) {
      metaTags[2].content = task.Task_Content;
    }
  };

  useEffect(() => {
    if (!authLoading && user?.id) {
      syncWorkspaceDetails();
    }
  }, [authLoading, user, syncWorkspaceDetails]);

  const submitLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    const initialCodeLink = activeSubmission?.Code_Link || "";
    const initialOutputLink = activeSubmission?.Output_Link || "";

    if (link.codeLink.trim() === "" && link.outputLink.trim() === "") {
      setMessage("Enter your link to proceed");
      return;
    } 
    if (link.codeLink === initialCodeLink && link.outputLink === initialOutputLink) {
      setMessage("Submission link is already updated");
      return;
    } 
    if (topicCompleted && taskStatus !== "Rejected") {
      setMessage("Task Completion date is already passed");
      return;
    } 
    if (taskStatus === "Verified" || taskStatus === "Approved") {
      setMessage("Task is already verified");
      return;
    } 

    try {
      setIsLoading(true);
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_PATH}/task-submission`,
        {
          course: courseId,
          Username: user?.id || user?.Username,
          Task_Id: taskId,
          Code_Link: link.codeLink,
          Output_Link: link.outputLink,
        }
      );
      setMessage(data.response || "Submitted successfully!");
      setTaskStatus("Under Review");
      setRemarks("");
      
      await syncWorkspaceDetails();
    } catch (error: any) {
      setMessage(error.message || "An error occurred during submission.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLink({ ...link, [e.target.name]: e.target.value });
  };

  const isDisabled = 
    (topicCompleted && taskStatus !== "Rejected" && taskStatus !== "Under Review") || 
    taskStatus === "Verified" || 
    taskStatus === "Approved";

  const initialCodeLink = activeSubmission?.Code_Link || "";
  const initialOutputLink = activeSubmission?.Output_Link || "";
  const hasFormChanged = link.codeLink !== initialCodeLink || link.outputLink !== initialOutputLink;

  if (contextLoading && !activeTask) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950">
        <Loader2 size={40} className="animate-spin text-blue-600 dark:text-blue-500" />
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest animate-pulse">Syncing Lab Workspace...</p>
      </div>
    );
  }

  if (localError || !activeTask) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500">
            <HelpCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white m-0">Laboratory Missing</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-normal m-0">
            {localError || "Unable to match current workspace settings with your active catalog."}
          </p>
          <button 
            onClick={() => router.back()} 
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white border-none rounded-xl cursor-pointer transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Return to Workspace Hub</span>
          </button>
        </div>
      </div>
    );
  }

  const numericTaskNo = Number(activeTask.Task_No) || 0;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 md:p-8 lg:p-12 transition-colors duration-300 text-slate-900 dark:text-slate-100 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb Action */}
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-transparent border-none cursor-pointer transition-colors group"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Course Track</span>
        </button>

        {/* Core Workspace Board Shell */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden backdrop-blur-md">
          
          {/* Top Panel Ribbon */}
          <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800/60 bg-gradient-to-r from-slate-50/60 via-transparent to-transparent dark:from-slate-800/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-black text-slate-300 dark:text-slate-700 font-mono tracking-tighter select-none">
                {numericTaskNo < 10 ? `0${numericTaskNo}` : numericTaskNo}
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-black tracking-widest text-blue-600 dark:text-blue-400 uppercase">Assignment Node</span>
                <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white m-0">
                  {activeTask.Task_Topic}
                </h1>
              </div>
            </div>
            <div className="self-start sm:self-auto">
              <StatusLabel taskStatus={taskStatus} topicCompleted={topicCompleted} />
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            
            {/* Project Objectives Description Block */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                <FileText size={16} />
                <h3 className="text-[11px] font-black tracking-widest uppercase m-0">Task Specifications</h3>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-5 text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium space-y-3">
                {activeTask.Task_Content ? (
                  activeTask.Task_Content.split("\r\n").map((element, index) => {
                    return element.trim() === "" ? null : <p key={index} className="m-0">{element}</p>;
                  })
                ) : (
                  <p className="italic text-slate-400 dark:text-slate-500">No content descriptions provided for this assignment matrix entry.</p>
                )}
              </div>
            </div>

            {/* Evaluation & Form Columns Split Panel Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 border-t border-slate-100 dark:border-slate-800/60">
              
              {/* Evaluator Feedback Segment Meta Box */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-1">
                  <MessageSquare size={16} />
                  <h3 className="text-[11px] font-black tracking-widest uppercase m-0">Evaluation Stream</h3>
                </div>

                {remarks ? (
                  <div className="p-5 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 shadow-xs space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 m-0">Reviewer Remarks</h4>
                    <p className="text-sm text-amber-900 dark:text-amber-300 font-medium leading-relaxed m-0">{remarks}</p>
                  </div>
                ) : (
                  <div className="p-5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs font-medium text-slate-400 dark:text-slate-500">
                    No evaluations or feedback tracks committed yet.
                  </div>
                )}
              </div>

              {/* Interaction Form Action Box Container */}
              <form className="lg:col-span-7 space-y-6" onSubmit={submitLink}>
                {message && (
                  <div className={`p-4 text-xs font-bold rounded-xl border transition-all shadow-xs ${
                    message.toLowerCase().includes('success') 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                      : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                  }`}>
                    {message}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="codeLink" className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    <Code2 size={14} className="text-slate-400" />
                    <span>Task Code Repository Link</span>
                  </label>
                  <Input
                    disabled={isDisabled || isLoading}
                    icon="fi fi-rr-display-code"
                    type="url"
                    label="Code Link"
                    name="codeLink"
                    value={link.codeLink}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="outputLink" className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    <ExternalLink size={14} className="text-slate-400" />
                    <span>Live Deployment Showcase Link</span>
                  </label>
                  <Input
                    disabled={isDisabled || isLoading}
                    icon="fi fi-rr-pulse"
                    type="url"
                    label="Output Link"
                    name="outputLink"
                    value={link.outputLink}
                    onChange={handleChange}
                  />
                </div>

                {!isDisabled && hasFormChanged && (
                  <div className="pt-2 flex justify-end">
                    <Button
                      disabled={isLoading}
                      type="submit"
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl py-3 px-6 shadow-sm shadow-blue-500/10 transform transition-all active:scale-98"
                      icon="fi fi-rr-arrow-up-from-square"
                      label={isLoading ? "Updating..." : "Commit Submission"}
                      isLoading={isLoading}
                    />
                  </div>
                )}
              </form>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- GLOBAL ROOT ROUTE COMPONENT BOUNDARY ---
export default function Task() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-blue-600 dark:text-blue-500" size={36} />
      </div>
    }>
      <TaskWorkspaceCore />
    </Suspense>
  );
}