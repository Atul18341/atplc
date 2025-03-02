import React, { useEffect, useState, useMemo } from "react";
import "./MyCourses.css";
import CourseCard from "../../Components/CourseCard/CourseCard";
import Loader from "../../Components/Loader/Loader";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import Button from "../../Components/Button/Button";
import { toast } from "react-toastify";

export default function Courses() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { user, loading, getCources } = useAuth();

  useEffect(() => {
    document.title = "ATPLC | My Courses";
    document.getElementsByTagName("META")[2].content =
      "All Your Courses at one place";
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    try {
      setIsLoading(true);
      window.scrollTo(0, 0);
      if (!loading && !user?.id) {
        navigate("/login", { replace: true });
      }
      if (!loading && user?.id && !user?.courses) {
        getCources();
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.response ||
        err.response?.data?.message ||
        err.message;
      toast.error(errorMessage);
      navigate("/error", { replace: true, state: { error: err } });
    } finally {
      setIsLoading(false);
    }
  }, [navigate, user?.id, loading, user?.courses, getCources]);

  const courseCards = useMemo(() => {
    if (user?.courses?.length) {
      return user?.courses?.map((course) => (
        <CourseCard
          enrolled={true}
          key={course.Courses_id}
          id={course.Courses_id}
          courseName={course.Courses__Course_Name}
          courseDuration={0}
          courseCompletionStatus={course.Courses_Completed}
          coverImage={
            course.Courses__Course_Thumbnail.startsWith("/media")
              ? course.Courses__Course_Thumbnail
              : "/media/" + course.Courses__Course_Thumbnail
          }
          couresPrice={null}
          courseTechnologies={null}
        />
      ));
    } else {
      return (
        <div className="not-found">
          <h2>No Courses Found</h2>
          <p>Please enroll in a course to view it here.</p>
          <Link to="/courses">
            <Button label={"Enroll Now"} />
          </Link>
        </div>
      );
    }
  }, [user?.courses]);

  return (
    <section className="page my-courses-page">
      <div className="page-heading">
        <h3>My Courses</h3>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <div className="courses-grid">{courseCards}</div>
      )}
    </section>
  );
}
