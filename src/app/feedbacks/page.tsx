'use client';

import React, { useCallback, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { Loader2, MessageSquare, GraduationCap, Briefcase, BookOpen } from "lucide-react";

import { useApp } from "../Context/AppContext";
import FeedbackCard, { FeedbackCardProps } from "../components/Feedback/FeedbackCard/FeedbackCard";

// --- DYNAMIC CORE WORKSPACE ---
function FeedbackWorkspaceCore() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 🔑 Extract parameters out of global context securely
  const { feedbacks, getFeedbacks, loading } = useApp() as {
    feedbacks: FeedbackCardProps[] | Record<string, FeedbackCardProps[]> | null;
    getFeedbacks: () => Promise<void>;
    loading: boolean;
  };

  // Safe tab synchronization straight out of the Next.js route query parameter stream
  const activeTabQuery = searchParams.get("tab") || "";
  const [filter, setFilter] = useState<string>(activeTabQuery);

  // Sync tab internal state instantly whenever query paths update
  useEffect(() => {
    setFilter(searchParams.get("tab") || "");
  }, [searchParams]);

  // Fetch feedbacks list array securely if not initialized in state memory rows
  const fetchFeedbacksCatalog = useCallback(async () => {
    if (!feedbacks || (Array.isArray(feedbacks) && feedbacks.length === 0)) {
      try {
        await getFeedbacks();
      } catch (err: any) {
        const errorMessage = err.message || "Failed to load community feedback tracking logs.";
        toast.error(errorMessage);
        router.replace("/error");
      }
    }
  }, [feedbacks, getFeedbacks, router]);

  useEffect(() => {
    fetchFeedbacksCatalog();
  }, [fetchFeedbacksCatalog]);

  const handleTabToggle = (targetValue: string) => {
    // Clean, standard Next.js path router mutation replacement
    router.push(`/feedbacks?tab=${targetValue}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🧠 CACHE-RESILIENT NORMALIZATION MAP:
  // Converts standard Arrays or backend Object groups cleanly into flat lists
  const flattenedFeedbacksList = React.useMemo<FeedbackCardProps[]>(() => {
    if (!feedbacks) return [];
    if (Array.isArray(feedbacks)) return feedbacks;
    return Object.values(feedbacks).flat();
  }, [feedbacks]);

  // Filter evaluation matrix checking
  const filteredFeedbacks = React.useMemo(() => {
    return flattenedFeedbacksList.filter((item) => {
      if (filter !== "") {
        return item.Feedback_Type === filter;
      }
      return true;
    });
  }, [flattenedFeedbacksList, filter]);

  if (loading && flattenedFeedbacksList.length === 0) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-slate-50/50 dark:bg-slate-950">
        <Loader2 size={40} className="animate-spin text-blue-600 dark:text-blue-500" />
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest animate-pulse">
          Syncing Community Reviews...
        </p>
      </div>
    );
  }

  return (
    <section className="w-full min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 md:p-8 lg:p-12 text-slate-900 dark:text-slate-100 transition-colors duration-300 select-none box-border">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- RECONSTRUCTED PRESTIGE TITLE RIBBON --- */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <MessageSquare size={20} />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-xl font-black tracking-tight m-0 text-slate-900 dark:text-white">
                Feedbacks
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium m-0">
                Explore hand-on verification reviews left by active program graduates.
              </p>
            </div>
          </div>
        </div>

        {/* --- PREMIUM INTERACTIVE TAB BAR NAVIGATION CONTROLLERS --- */}
        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-2 rounded-2xl shadow-xs max-w-sm">
          <button
            type="button"
            onClick={() => handleTabToggle("Trainee")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer border-none transition-all duration-300 ${
              filter === "Trainee"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <GraduationCap size={15} />
            <span>Trainee</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabToggle("Intern")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer border-none transition-all duration-300 ${
              filter === "Intern"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Briefcase size={14} />
            <span>Intern</span>
          </button>
        </div>

        {/* --- LIST RESPONSIVE CONTAINER ELEMENT --- */}
        {filteredFeedbacks.length === 0 ? (
          <div className="w-full text-center py-16 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 font-medium text-sm shadow-xs">
            <BookOpen size={36} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <span>No feedback records submitted under this tab category filter yet.</span>
          </div>
        ) : (
          /* 🔑 UPDATED: Grid expanded to 3 columns on desktop to balance card layout proportions */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full animate-fadeIn">
            {filteredFeedbacks.map((feed) => (
              <FeedbackCard key={feed.id} {...feed} full={true} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

// --- GLOBAL ROOT ROUTE COMPONENT BOUNDARY ---
export default function FeedbackPage() {
  return (
    // 🔑 Next.js Rule Requirement: useSearchParams must always be wrapped inside a Suspense fallback block
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-blue-600 dark:text-blue-500" size={36} />
      </div>
    }>
      <FeedbackWorkspaceCore />
    </Suspense>
  );
}