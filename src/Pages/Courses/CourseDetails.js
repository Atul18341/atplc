import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { convertUrlToText } from "../../lib/utils";
import { useApp } from "../../context/appContext";
import Loader from "../../Components/Loader/Loader";

const CourseDetails = () => {
  const params = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const { getCourse } = useApp();

  const fetchCourse = useCallback(async () => {
    if (!course) {
      const CourseDetail = await getCourse(params?.courseName);
      setCourse(CourseDetail);
    }
    setLoading(false);
  }, [course, getCourse, params?.courseName]);

  useEffect(() => {
    document.title = `ATPLC | ${convertUrlToText(params?.courseName)}`;
    document.getElementsByTagName(
      "META"
    )[2].content = `Master ${convertUrlToText(
      params?.courseName
    )} with our expert-led course. Gain hands-on experience, real-world projects, and certification. Enroll now to boost your career!`;
    window.scrollTo(0, 0);

    fetchCourse();
  }, [params?.courseName, fetchCourse]);

  console.log(course);

  return loading ? (
    <Loader />
  ) : (
    <>
      <section className="page course-page">
        <div className="page-thumbnail">
          {course?.Course_Thumbnail &&
          course?.Course_Thumbnail !== "/media/" ? (
            <img
              src={`${process.env.REACT_APP_BACKEND_PATH}${course.Course_Thumbnail}`}
              alt={course.Course_Name}
            />
          ) : (
            <div className="cover-default-image"> {"</>"}</div>
          )}
          <div className="page-heading">
            <h3>{course?.Course_Name}</h3>
          </div>
        </div>
        <div className="course-details">
          <div className="technologies">
            <h3>Tools & Technologies :</h3>
            <div className="tecs">
              {course?.Course_Technologies &&
                course.Course_Technologies.split(",").map((tech, index) => {
                  return (
                    <span className="tech" key={index}>
                      {tech}
                    </span>
                  );
                })}
            </div>
          </div>

          <div className="duration">
            <h3>Duration :</h3>
            {course?.Course_Duration && (
              <span className="tech">
                {course.Course_Duration} Month
                {course.Course_Duration > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="price">
            <h3>Price :</h3>
            <div className="icon">
              <i className="fi fi-rr-indian-rupee-sign"></i>
            </div>
            <div className="text">{course?.Course_Price}</div>
          </div>
          <div className="content">
            <h3>Course Contents:</h3>
            {course?.Course_Contents ? (
              <iframe
                src={course.Course_Contents}
                title={course.Course_Name}
                frameborder="0"
              />
            ) : (
              <p>Course content is not available</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default CourseDetails;
