import { createContext, useContext, useEffect, useState } from "react";
import { deleteCookie, getCookie, setCookie } from "../lib/utils";
import axios from "axios";


// Create context with default values
export const AuthContext = createContext({
    user: null,
    login: async () => { },
    logout: async () => { },
    isLoading: false,
    error: null
});

export const AuthContextProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);


    // Load user from cookie on mount
    useEffect(() => {
        const loadUser = () => {
            try {
                const savedUser = getCookie('user');
                if (savedUser) {
                    setUser(savedUser);
                }
            } catch (err) {
                console.error('Error loading user from cookie:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (username, password) => {
        try {
            setIsLoading(true);
            setError(null);

            const { data } = await axios.post(`${process.env.REACT_APP_BACKEND_PATH}/login`, {
                Username: username.toUpperCase(),
                Password: password,
            });

            // getting profile
            const profile = await axios.post(`${process.env.REACT_APP_BACKEND_PATH}/profile`, {
                Username: data.id,
            });

            const userData = {
                userId: data.id,
                username: username?.toUpperCase(),
                fullName: profile.data?.response?.[0]?.Name || "",
                college: profile.data?.response?.[0]?.College_Name || ""
            };

            setUser(userData);

            // Set cookie after user state is updated
            setCookie('user', userData, {
                expires: 7,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict'
            });

            return {
                message: "Login Successfull.",
                type: "success",
                success: true
            };
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    const logout = async () => {
        try {
            setIsLoading(true);

            setUser(null);
            deleteCookie('user');

            return {
                message: "Successfully Logged Out.",
                type: "success",
                success: true
            };
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        user,
        login,
        logout,
        loading: isLoading,
        error
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}


export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthContextProvider');
    }
    return context;
};