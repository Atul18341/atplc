'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { deleteCookie, getCookie, setCookie } from "../lib/utils";
import axios from "axios";

// --- TYPES & INTERFACES ---

export interface User {
  id: string;
  Username: string;
  Name?: string;
  College_Name?: string;
  Branch?: string;
  Batch?: string;
  Hometown?: string;
  Contact_No?: number;
  Profile_Pic?: string;
  Profile_Preview?: string;
  courses?: any[];
}

interface UpdateProfileParams {
  Name: string;
  College_Name: string;
  Branch: string;
  Batch: string;
  Hometown: string;
  Contact_No: string | number;
  Profile_Pic?: string;
  Profile_Preview?: string;
}

interface AuthResponse {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  success: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<AuthResponse>;
  updateProfile: (params: UpdateProfileParams) => Promise<AuthResponse>;
  //getCourses: () => Promise<void>; 
  getEnrolledCourses: () => Promise<void>; 
  loading: boolean;
  error: string | null;
}

// --- CONTEXT INITIALIZATION ---

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => ({ message: "", type: "error", success: false }),
  logout: async () => ({ message: "", type: "error", success: false }),
  updateProfile: async () => ({ message: "", type: "error", success: false }),
  //getCourses: async () => {},
  getEnrolledCourses: async () => {},
  loading: true,
  error: null,
});

// Using Next.js compatible runtime environment variables
const BACKEND_PATH = process.env.NEXT_PUBLIC_BACKEND_PATH || "";

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load user from cookie on initial client mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const savedUser = getCookie("user");
        if (savedUser) {
          // If cookies store stringified JSON data, pass parsing verification safely
          const parsedUser = typeof savedUser === "string" ? JSON.parse(savedUser) : savedUser;
          setUser(parsedUser as User);
        }
      } catch (err) {
        console.error("Error loading user from cookie:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (username: string, password: string): Promise<AuthResponse> => {
    try {
      setLoading(true);
      setError(null);

      const formattedUsername = username.toUpperCase();
      console.log("Backend-path:",BACKEND_PATH)
      const { data } = await axios.post(`${BACKEND_PATH}/login`, {
        Username: formattedUsername,
        Password: password,
      });
       console.log("Id:",data.id)
      // Get profile details
      const profile = await axios.post(`${BACKEND_PATH}/profile`, {
        Username: data.id,
      });

      if (profile.data?.response?.[0]) {
        const userData: User = {
          ...profile.data.response[0],
          id: profile.data.response[0].Username,
          Username: formattedUsername,
        };

        setUser(userData);

        setCookie("user", userData, {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Strict",
        });

        return {
          message: "Login Successful.",
          type: "success",
          success: true,
        };
      } else {
        return {
          message: profile.data?.response || "Failed to retrieve profile credentials.",
          type: "error",
          success: false,
        };
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.response ||
        err.response?.data?.message ||
        err.message ||
        "An error occurred during authentication.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<AuthResponse> => {
    try {
      setLoading(true);
      setError(null);

      setUser(null);
      deleteCookie("user");

      return {
        message: "Successfully Logged Out.",
        type: "success",
        success: true,
      };
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.response ||
        err.response?.data?.message ||
        err.message ||
        "An exception occurred during logout lifecycle.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getEnrolledCourses = async (): Promise<void> => {
    try {
      setError(null);
      if (!user?.id) return;

      const { data } = await axios.post(`${BACKEND_PATH}/my-courses`, {
        Username: user.id,
      });
      
      setUser((prev) => (prev ? { ...prev, courses: data || [] } : null));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.response ||
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch enrolled course matrix arrays.";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateProfile = async ({
    Name,
    College_Name,
    Branch,
    Batch,
    Hometown,
    Contact_No,
    Profile_Pic,
    Profile_Preview,
  }: UpdateProfileParams): Promise<AuthResponse> => {
    try {
      setError(null);
      if (!user?.id) throw new Error("No active user session context detected.");

      const contactNumber = typeof Contact_No === "string" ? parseInt(Contact_No, 10) : Contact_No;

      const profilePayload = {
        Username: user.id,
        Name,
        College_Name,
        Branch,
        Batch,
        Hometown,
        Contact_No: contactNumber,
        Profile_Pic,
        Profile_Preview,
      };

      const { data } = await axios.put(`${BACKEND_PATH}/profile`, profilePayload);

      const { Username, ...updatedData } = profilePayload;
      const newData: User = { ...user, ...updatedData };

      setUser(newData);
      setCookie("user", newData, {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      });

      return {
        message: data.response || "Profile Updated Successfully",
        type: "success",
        success: true,
      };
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.response ||
        err.response?.data?.message ||
        err.message ||
        "An exception occurred during profile data synchronizations.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    updateProfile,
    login,
    logout,
    loading,
    //getCourses,
    getEnrolledCourses,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be executed securely within an AuthContextProvider payload boundary.");
  }
  return context;
};