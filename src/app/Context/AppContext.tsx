'use client';

import React, { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";
import { convertToUrlSlug } from "../lib/utils";

// --- TYPESCRIPT INTERFACES ---

export interface Course {
  id: string | number;
  Course_Name: string;
  Course_Duration?: string;
  Course_Thumbnail?: string;
  Course_Price?: number;
  Course_Technologies?: string;
  Tasks?: DashboardTask[];
  Submissions?: DashboardSubmission[];
  [key: string]: any; 
}

export interface DashboardTask {
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

export interface DashboardSubmission {
  Task_No_id: string | number;
  Username?: string | number;
  Task_Status: string;
  Code_Link?: string;
  Output_Link?: string;
  Remarks?: string;
}

export interface Feedback {
  id: string | number;
  [key: string]: any;
}

export interface TaskData {
  courseId: string | number;
  Task_No: number;
  Task_Id?: string | number;
  Task_Topic: string;
  Task_Content?: string;
  Task_Status?: string;
  Code_Link?: string;
  Output_Link?: string;
  Topic_Completed?: boolean;
  Remarks?: string;
}

interface AppContextType {
  courses: Course[] | null;
  feedbacks: Feedback[] | null;
  selectedTask: TaskData | null;
  setSelectedTask: (task: TaskData | null) => void;
  getCourses: () => Promise<Course[]>;
  getCourse: (title: string) => Promise<Course | undefined>;
  getDashboardTasks: (courseId: string, username: string) => Promise<{ tasks: DashboardTask[]; submissions: DashboardSubmission[] }>;
  getFeedbacks: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const BACKEND_PATH = process.env.NEXT_PUBLIC_REACT_APP_BACKEND_PATH || 
                     process.env.NEXT_PUBLIC_BACKEND_PATH || 
                     process.env.REACT_APP_BACKEND_PATH || "";

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [feedbacks, setFeedback] = useState<Feedback[] | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getCourses = async (): Promise<Course[]> => {
    try {
      setLoading(true);
      setError(null);

       const { data } = await axios.get(`${BACKEND_PATH}/courses?format=json`);
            setCourses(data?.courses);
            return data?.courses;
    } catch (err: unknown) {
      const axiosError = err as any;
      const errorMessage =
        axiosError.response?.data?.response || 
        axiosError.response?.data?.message || 
        axiosError.message || 
        "An unexpected error occurred while fetching courses.";
      
      setError(errorMessage);
      throw new Error(errorMessage);
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
    } catch (err: unknown) {
      const axiosError = err as any;
      const errorMessage =
        axiosError.response?.data?.response || 
        axiosError.response?.data?.message || 
        axiosError.message || 
        "An error occurred while looking up the target course specification criteria.";
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getDashboardTasks = async (
    courseId: string, 
    username: string
  ): Promise<{ tasks: DashboardTask[]; submissions: DashboardSubmission[] }> => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.post(`${BACKEND_PATH}/dashboard`, {
        course: courseId,
        Username: username,
      });

      const submissions: DashboardSubmission[] = data?.Submissions || [];
      const tasks: DashboardTask[] = data?.Tasks || [];

      const uniqueSubmissions = Object.values(
        submissions.reduce<Record<string | number, DashboardSubmission>>((acc, sub) => {
          acc[sub.Task_No_id] = sub;
          return acc;
        }, {})
      );

      // 🔑 LIVE MIRROR SYNC: Safely attach task metrics into the core state catalog
      setCourses((prevCourses) => {
        const structuralCatalog = prevCourses || [];
        
        // Check if the current course shell exists in memory yet
        const exists = structuralCatalog.some(c => String(c.id) === String(courseId));
        
        if (!exists) {
          // Add a baseline layout entry if it hasn't been fetched via getCourses yet
          return [
            ...structuralCatalog,
            { id: courseId, Course_Name: "", Tasks: tasks, Submissions: uniqueSubmissions }
          ];
        }

        return structuralCatalog.map(course => {
          if (String(course.id) === String(courseId)) {
            return {
              ...course,
              Tasks: tasks,
              Submissions: uniqueSubmissions
            };
          }
          return course;
        });
      });

      return { tasks, submissions: uniqueSubmissions };

    } catch (err: unknown) {
      const axiosError = err as any;
      const errorMessage =
        axiosError.response?.data?.response || 
        axiosError.response?.data?.message || 
        axiosError.message || 
        "An unexpected exception occurred syncing laboratory work metrics.";
      
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
    } catch (err: unknown) {
      const axiosError = err as any;
      const errorMessage =
        axiosError.response?.data?.response || 
        axiosError.response?.data?.message || 
        axiosError.message || 
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
    selectedTask,
    setSelectedTask,
    getCourses,
    getCourse,
    getDashboardTasks,
    getFeedbacks,
    loading,
    error,
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