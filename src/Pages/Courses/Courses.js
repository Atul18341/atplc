import React, { useCallback, useEffect } from "react";
import "./Courses.css";
import CourseCard from "../../Components/CourseCard/CourseCard";
import Loader from "../../Components/Loader/Loader";
import { useApp } from "../../context/appContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";

export default function Courses() {
  const { courses, loading, getCourses } = useApp();
  const { user } = useAuth();
  const myCourses = user?.courses;

  const navigate = useNavigate();

  useEffect(() => {
    document.title = "ATPLC | Courses";
    document.getElementsByTagName(
      "META"
    )[2].content = `Explore ATPLC's expert-led courses in web development, frontend, backend, Python, AI, and more. Gain hands-on experience, industry certifications, and career-ready skills. Enroll now!`;
    window.scrollTo(0, 0);
  }, []);

  // Fetch feedbacks if they are not available
  const fetchCourses = useCallback(async () => {
    if (!courses || courses.length === 0) {
      await getCourses();
    }
  }, [courses, getCourses]);

  useEffect(() => {
    try {
      fetchCourses();
    } catch (err) {
      const errorMessage = err.message;
      toast.error(errorMessage);
      navigate("/error", { replace: true, state: { error: err } });
    }
  }, [navigate, fetchCourses]);

  return (
    <section className="page courses-page">
      <div className="page-thumbnail">
        <img src="/Assets/Illustrator/training-page.jpg" alt="training" />
        <div className="page-heading">
          <h3>Our Courses</h3>
        </div>
      </div>
      {loading ? (
        <Loader />
      ) : (
        <div className="courses-grid">
          {courses?.map((course) => {
            const isEnrolled = myCourses?.some(
              (myCourse) => myCourse?.Courses_id === course?.id
            );
            return (
              <CourseCard
                key={course.id}
                id={course.id}
                courseName={course.Course_Name}
                courseDuration={course.Course_Duration}
                coverImage={course.Course_Thumbnail}
                couresPrice={course.Course_Price}
                courseTechnologies={course.Course_Technologies}
                enrolled={isEnrolled}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
