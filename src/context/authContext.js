import { createContext, useContext, useEffect, useState } from "react";
import { deleteCookie, getCookie, setCookie } from "../lib/utils";
import axios from "axios";

// Create context with default values
export const AuthContext = createContext({
  user: null,
  login: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
  getCources: async () => {},
  loading: false,
  error: null,
});

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from cookie on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const savedUser = getCookie("user");
        if (savedUser) {
          setUser(savedUser);
        }
      } catch (err) {
        console.error("Error loading user from cookie:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_PATH}/login`,
        {
          Username: username.toUpperCase(),
          Password: password,
        }
      );

      // getting profile
      const profile = await axios.post(
        `${process.env.REACT_APP_BACKEND_PATH}/profile`,
        {
          Username: data.id,
        }
      );

      if (profile.data?.response?.[0]) {
        const userData = {
          ...profile.data?.response?.[0],
          Username: username?.toUpperCase(),
        };

        setUser(userData);

        // Set cookie after user state is updated
        setCookie("user", userData, {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Strict",
        });
        return {
          message: "Login Successfull.",
          type: "success",
          success: true,
        };
      } else {
        return {
          message: profile.data.response || "Failed to get your Profile",
          type: "error",
          success: false,
        };
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.response ||
        err.response?.data?.message ||
        err.message;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
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
    } catch (err) {
      const errorMessage =
        err.response?.data?.response ||
        err.response?.data?.message ||
        err.message;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getCources = async () => {
    try {
      setError(null);
      if (!user?.id) return;

      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_PATH}/my-courses`,
        {
          Username: user.id,
        }
      );
      setUser((prev) => ({ ...prev, courses: data }));
    } catch (err) {
      const errorMessage =
        err.response?.data?.response ||
        err.response?.data?.message ||
        err.message;
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
  }) => {
    try {
      setError(null);
      const profile = {
        Username: user.id,
        Name,
        College_Name,
        Branch,
        Batch,
        Hometown,
        Contact_No: parseInt(Contact_No),
        Profile_Pic,
        Profile_Preview,
      };

      const { data } = await axios.put(
        `${process.env.REACT_APP_BACKEND_PATH}/profile`,
        profile
      );

      const { Username, ...updatedData } = profile;
      const newData = { ...user, ...updatedData };

      setUser(newData);
      setCookie("user", newData);

      return {
        message: data.response || "Profile Updated Successfully",
        type: "success",
        success: true,
      };
    } catch (err) {
      const errorMessage =
        err.response?.data?.response ||
        err.response?.data?.message ||
        err.message;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    updateProfile,
    login,
    logout,
    loading: loading,
    getCources,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};
