'use client';

import axios from "axios";
import { createContext, useContext, useState, ReactNode } from "react";
import { convertToUrlSlug } from "../lib/utils";

// --- TYPES & INTERFACES ---

export interface Course {
  id: string | number;
  Course_Name: string;
  Course_Duration?: string;     // 🔑 Added properties
  Course_Thumbnail?: string;    // 🔑 Added properties
  Course_Price?: string | number; // 🔑 Added properties
  Course_Technologies?: string[];
  [key: string]: any; // Allows for dynamic backend fields
}

export interface Feedback {
  id: string | number;
  [key: string]: any;
}

interface AppContextType {
  courses: Course[] | null;
  feedbacks: Feedback[] | null;
  getCourses: () => Promise<Course[]>;
  getCourse: (title: string) => Promise<Course | undefined>;
  getFeedbacks: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

// --- CONTEXT INITIALIZATION ---

const AppContext = createContext<AppContextType>({
  courses: null,
  feedbacks: null,
  getCourses: async () => [],
  getCourse: async () => undefined,
  getFeedbacks: async () => {},
  loading: false,
  error: null
});

const BACKEND_PATH = process.env.NEXT_PUBLIC_BACKEND_PATH || "";

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [feedbacks, setFeedback] = useState<Feedback[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getCourses = async (): Promise<Course[]> => {
  try {
    setLoading(true);
    setError(null);

    // 🔑 Connect directly to your local Next.js API endpoint profile
    const { data } = await axios.get(`${BACKEND_PATH}/courses?format=json`);
    
    if (data.success) {
      setCourses(data.courses);
      return data.courses;
    } else {
      throw new Error(data.error);
    }
  } catch (err: any) {
    const msg = err.message || "Could not resolve course catalog array listings.";
    setError(msg);
    throw new Error(msg);
  } finally {
    setLoading(false);
  }
};

  const getCourse = async (title: string): Promise<Course | undefined> => {
    try {
      setLoading(true);
      setError(null);

      if (courses) {
        return courses.find((c) => convertToUrlSlug(c.Course_Name) === title);
      } else {
        const activeCourses = await getCourses();
        return activeCourses?.find((c) => convertToUrlSlug(c.Course_Name) === title);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.response ||
        err.response?.data?.message ||
        err.message ||
        "An error occurred while processing course matching targets.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getFeedbacks = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.get(`${BACKEND_PATH}/all-feedbacks`);
      setFeedback(data || []);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.response ||
        err.response?.data?.message ||
        err.message ||
        "An exception occurred during client data sync processing.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const value: AppContextType = {
    courses,
    feedbacks,
    getCourses,
    getCourse,
    getFeedbacks,
    loading,
    error
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used explicitly within an AppContextProvider root boundary.');
  }
  return context;
};