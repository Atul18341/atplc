'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Edit2, MessageSquare } from "lucide-react";

import { useAuth } from "../../../Context/AuthContext";
import Button from "../../Button";
import Input from "../../../Controller/Input";

interface CourseFeedbackProps {
  feedback: string;
  setFeedback: React.Dispatch<React.SetStateAction<string>>;
}

export default function CourseFeedback({ feedback, setFeedback }: CourseFeedbackProps) {
  const { user } = useAuth();
  
  // 🔑 Step 1: Add a component mount state flag to eliminate SSR differences
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inputFeedback, setInputFeedback] = useState<string>(feedback || "");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(
    feedback !== undefined && feedback.length > 10
  );

  // 🔑 Step 2: Trigger flag inversion only once the browser takes over live execution
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sendFeedback = async () => {
    try {
      setIsLoading(true);
      
      if (!inputFeedback.trim() || inputFeedback.trim().length < 10) {
        toast.error("Feedback must be at least 10 characters long.");
        return;
      }

      const BACKEND_PATH = process.env.NEXT_PUBLIC_BACKEND_PATH || "";
      const { data } = await axios.post(`${BACKEND_PATH}/submit-feedback`, {
        Username: user?.id,
        Feedback: inputFeedback,
      });

      toast.success(data?.Response || "Feedback submitted successfully!");
      
      if (typeof window !== "undefined") {
        localStorage.setItem("feedback", inputFeedback);
      }
      
      setFeedback(inputFeedback);
      setFeedbackSubmitted(true);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.Response ||
          error.message ||
          "Failed to submit feedback."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputFeedback(e.target.value);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendFeedback();
  };

  // 🔑 Step 3: Serve the precise layout match to next.js server pre-renders
  if (!isMounted) {
    return (
      <section className="w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <MessageSquare size={18} className="text-blue-600" />
          <h4 className="text-base font-bold text-slate-800 tracking-tight">Your Feedback</h4>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
          ATPLC would be delighted to hear about your experience during this
          course and any suggestions you may have to improve it. Your submission is required to process automated completion certifications.
        </p>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4 max-w-3xl">
          <div className="w-full">
            <Input
              type="textarea"
              label="Share your learning experience..."
              name="feedback"
              value={inputFeedback}
              onChange={handleChange}
              disabled={true}
            />
          </div>
        </form>
      </section>
    );
  }

  // --- STANDARD INTERACTIVE CLIENT RENDERING ---
  return (
    <section className="w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      {/* --- SECTION HEADER --- */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <MessageSquare size={18} className="text-blue-600" />
        <h4 className="text-base font-bold text-slate-800 tracking-tight">Your Feedback</h4>
      </div>

      {/* --- SECTION BODY PANEL --- */}
      {feedbackSubmitted ? (
        <>
          <p className="text-sm text-slate-600 leading-relaxed font-sans italic whitespace-pre-wrap">
            "{feedback}"
          </p>
          <button 
            type="button"
            onClick={() => setFeedbackSubmitted(false)}
            className="flex-shrink-0 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg transition-all"
            title="Edit Feedback"
          >
            <Edit2 size={15} />
          </button>
        </>
      ) : (
        <>
          <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
            ATPLC would be delighted to hear about your experience during this
            course and any suggestions you may have to improve it. Your submission is required to process automated completion certifications.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
            <div className="w-full">
              <Input
                type="textarea"
                label="Share your learning experience..."
                name="feedback"
                value={inputFeedback}
                onChange={handleChange}
              />
            </div>
            
            {inputFeedback !== feedback && (
              <div className="flex justify-end">
                <Button
                  icon="fi fi-rr-arrow-up-from-square"
                  type="submit"
                  label="Submit Feedback"
                  isLoading={isLoading}
                  className="w-full sm:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
                />
              </div>
            )}
          </form>
        </>
      )}
    </section>
  );
}