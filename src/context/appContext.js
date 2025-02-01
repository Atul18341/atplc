import axios from "axios";
import { createContext, useContext, useState } from "react";
import { convertToUrlSlug } from "../lib/utils";

const AppContext = createContext({
    courses: null,
    feedbacks: null,
    getCourses: async () => { },
    getCourse: async () => { },
    getFeedbacks: async () => { },
    loading: false,
    error: null
});

export const AppContextProvider = ({ children }) => {

    const [courses, setCources] = useState(null);
    const [feedbacks, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getCourses = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_PATH}/courses?format=json`);
            setCources(data?.courses);

        } catch (err) {
            const errorMessage = err.response?.data?.response || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }
    const getCourse = async (title) => {
        try {
            setLoading(true);
            setError(null);
            console.log(courses)
            if (courses) {
                const course = courses.find(course => convertToUrlSlug(course.Course_Name) === title);
                return course;
            }
            else {
                await getCourses();
                const course = courses.find(course => convertToUrlSlug(course.Course_Name) === title);
                return course;
            }

        } catch (err) {
            const errorMessage = err.response?.data?.response || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    const getFeedbacks = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_PATH}/all-feedbacks`);
            setFeedback(data);

        } catch (err) {
            const errorMessage = err.response?.data?.response || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }


    const value = {
        courses,
        feedbacks,
        getCourses,
        getCourse,
        getFeedbacks,
        loading,
        error,
    }

    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}


export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useCourses must be used within a CoursesProvider');
    }
    return context;
}