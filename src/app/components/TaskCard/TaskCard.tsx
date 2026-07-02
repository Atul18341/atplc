'use client';

import React from "react";
import Link from "next/link";
import { 
  Clock, 
  Ban, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ExternalLink, 
  Code 
} from 'lucide-react';

// --- INTERFACES ---
interface StatusLabelProps {
  taskStatus: string;
  topicCompleted?: boolean;
}

interface TaskCardProps {
  courseId: string;
  Task_No: number | string;
  Task_Id?: string | number;
  Task_Topic: string;
  Task_Content: string;
  Task_Status: string;
  Code_Link: string;
  Output_Link: string;
  Topic_Completed?: boolean;
  Remarks: string;
}

// Reusable localized Status Pill with explicit styling maps
function StatusLabel({ taskStatus, topicCompleted = false }: StatusLabelProps) {
  if (taskStatus === "Under Review") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
        <Clock size={13} className="animate-pulse" />
        <span>Under Review</span>
      </div>
    );
  }
  
  if (taskStatus === "Rejected") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold">
        <Ban size={13} />
        <span>Rejected</span>
      </div>
    );
  }
  
  if (taskStatus === "Approved" || taskStatus === "Verified") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold">
        <CheckCircle2 size={13} />
        <span>Verified</span>
      </div>
    );
  }

  if (topicCompleted) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 text-xs font-semibold">
        <AlertTriangle size={13} />
        <span>Missed</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold">
      <XCircle size={13} />
      <span>Not Submitted</span>
    </div>
  );
}

export default function TaskCard({
  courseId,
  Task_No,
  Task_Id,
  Task_Topic,
  Task_Content,
  Task_Status,
  Code_Link,
  Output_Link,
  Topic_Completed = false,
  Remarks,
}: TaskCardProps) {
  
  const numericTaskNo = typeof Task_No === 'string' ? parseInt(Task_No, 10) : Task_No;
  const formattedTaskNumber = numericTaskNo < 10 ? `0${numericTaskNo}` : numericTaskNo.toString();

  // Next.js Architecture Optimization: Serialize parameters securely into query strings
  const queryParams = new URLSearchParams({
    courseId,
    taskId: Task_Id?.toString() || "",
    taskNo: numericTaskNo.toString(),
    taskTopic: Task_Topic,
    taskContent: Task_Content,
    taskStatus: Task_Status,
    codeLink: Code_Link,
    outputLink: Output_Link,
    remarks: Remarks,
    topicCompleted: Topic_Completed.toString(),
  }).toString();

  const cardBaseStyles = `group relative flex flex-col justify-between p-5 bg-white border rounded-2xl shadow-sm transition-all duration-300 ${
    Topic_Completed && Task_Id !== undefined 
      ? "border-amber-200/70 bg-amber-50/10" 
      : "border-slate-200 hover:shadow-md hover:border-slate-300"
  }`;

  // CONDITION A: Task is clickable and routable to workspace view
  if (Task_Id !== undefined) {
    return (
      <Link 
        href={`/dashboard/task?${queryParams}`}
        className={cardBaseStyles}
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xl font-mono font-black text-slate-400 group-hover:text-blue-600 transition-colors">
                {formattedTaskNumber}
              </span>
              <h4 className="text-base font-bold text-slate-800 tracking-tight line-clamp-2 group-hover:text-slate-900">
                {Task_Topic}
              </h4>
            </div>
          </div>
          <p className="text-xs text-slate-500 line-clamp-4 leading-relaxed">
            {Task_Content}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
          <StatusLabel taskStatus={Task_Status} topicCompleted={Topic_Completed} />
          <span className="text-[11px] font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
            Open Workspace &rarr;
          </span>
        </div>
      </Link>
    );
  }

  // CONDITION B: Static non-routable dashboard block view with absolute URLs
  return (
    <div className={cardBaseStyles}>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-xl font-mono font-black text-slate-400">
            {formattedTaskNumber}
          </span>
          <h4 className="text-base font-bold text-slate-800 tracking-tight line-clamp-1">
            {Task_Topic}
          </h4>
        </div>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {Task_Content}
        </p>
        <div className="pt-1">
          <StatusLabel taskStatus={Task_Status} />
        </div>
      </div>

      {/* Action Links container block */}
      <div className="grid grid-cols-2 gap-3 pt-4 mt-5 border-t border-slate-100">
        {Output_Link ? (
          <a
            href={Output_Link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 py-2 rounded-xl transition-colors"
          >
            <ExternalLink size={14} className="text-slate-500" />
            <span>Output</span>
          </a>
        ) : (
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 bg-slate-50/50 border border-slate-100 py-2 rounded-xl cursor-not-allowed select-none">
            <ExternalLink size={14} className="opacity-40" />
            <span>Output</span>
          </div>
        )}

        {Code_Link ? (
          <a
            href={Code_Link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 py-2 rounded-xl transition-colors"
          >
            <Code size={14} className="text-slate-500" />
            <span>Code</span>
          </a>
        ) : (
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 bg-slate-50/50 border border-slate-100 py-2 rounded-xl cursor-not-allowed select-none">
            <Code size={14} className="opacity-40" />
            <span>Code</span>
          </div>
        )}
      </div>
    </div>
  );
}