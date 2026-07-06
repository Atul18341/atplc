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

interface StatusLabelProps {
  taskStatus: string;
  topicCompleted?: boolean;
}

interface TaskCardProps {
  courseId: string | number;
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

function StatusLabel({ taskStatus, topicCompleted = false }: StatusLabelProps) {
  const baseClasses = "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold uppercase tracking-wider border shadow-xs backdrop-blur-sm";

  if (taskStatus === "Under Review") {
    return (
      <div className={`${baseClasses} bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 animate-pulse`}>
        <Clock size={12} />
        <span>Under Review</span>
      </div>
    );
  }
  
  if (taskStatus === "Rejected") {
    return (
      <div className={`${baseClasses} bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20`}>
        <Ban size={12} />
        <span>Rejected</span>
      </div>
    );
  }
  
  if (taskStatus === "Approved" || taskStatus === "Verified") {
    return (
      <div className={`${baseClasses} bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20`}>
        <CheckCircle2 size={12} />
        <span>Verified</span>
      </div>
    );
  }

  if (topicCompleted) {
    return (
      <div className={`${baseClasses} bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20`}>
        <AlertTriangle size={12} />
        <span>Missed</span>
      </div>
    );
  }

  return (
    <div className={`${baseClasses} bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700`}>
      <XCircle size={12} />
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

  const cardBaseStyles = `group relative flex flex-col justify-between p-6 bg-white dark:bg-slate-900 border rounded-2xl shadow-xs transition-all duration-300 hover:-translate-y-0.5 transform ${
    Topic_Completed && Task_Id !== undefined 
      ? "border-amber-500/20 bg-amber-500/5" 
      : "border-slate-200/80 dark:border-slate-800/80 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700"
  }`;

  if (Task_Id !== undefined) {
    return (
      <Link 
        href={`/task/${courseId}/${Task_Id}`}
        className={cardBaseStyles}
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span className="text-2xl font-black font-mono text-slate-300 dark:text-slate-700 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors select-none tracking-tighter">
                {formattedTaskNumber}
              </span>
              <h4 className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight line-clamp-2 m-0 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {Task_Topic}
              </h4>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed m-0 font-medium pl-1">
            {Task_Content}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/60 pl-1">
          <StatusLabel taskStatus={Task_Status} topicCompleted={Topic_Completed} />
          <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 transition-transform flex items-center gap-1 uppercase tracking-wider group-hover:translate-x-0.5">
            <span>Workspace</span>
            <span>&rarr;</span>
          </span>
        </div>
      </Link>
    );
  }

  return (
    <div className={cardBaseStyles}>
      <div className="space-y-3">
        <div className="flex items-center gap-3.5">
          <span className="text-2xl font-black font-mono text-slate-300 dark:text-slate-700 select-none tracking-tighter">
            {formattedTaskNumber}
          </span>
          <h4 className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight line-clamp-1 m-0">
            {Task_Topic}
          </h4>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed m-0 font-medium">
          {Task_Content}
        </p>
        <div className="pt-1">
          <StatusLabel taskStatus={Task_Status} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4 mt-5 border-t border-slate-100 dark:border-slate-800/60">
        {Output_Link ? (
          <a
            href={Output_Link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 py-2.5 rounded-xl transition-all shadow-xs"
          >
            <ExternalLink size={13} />
            <span>Output</span>
          </a>
        ) : (
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600 bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 py-2.5 rounded-xl cursor-not-allowed select-none">
            <ExternalLink size={13} className="opacity-40" />
            <span>Output</span>
          </div>
        )}

        {Code_Link ? (
          <a
            href={Code_Link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 py-2.5 rounded-xl transition-all shadow-xs"
          >
            <Code size={13} />
            <span>Code</span>
          </a>
        ) : (
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600 bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 py-2.5 rounded-xl cursor-not-allowed select-none">
            <Code size={13} className="opacity-40" />
            <span>Code</span>
          </div>
        )}
      </div>
    </div>
  );
}