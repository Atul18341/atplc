import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { convertUrlToText } from "../../lib/utils";
import { useApp } from "../../context/appContext";
import Loader from "../../Components/Loader/Loader";
import scanner from "./Scanner/Java-scanner.jpg";

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

  return loading ? (
    <Loader />
  ) : (
    <>
      <section className="page course-page">
        <div className="page-thumbnail">
          {course?.Course_Thumbnail &&
          course?.Course_Thumbnail !== "/media/" ? (
            <img
              src={`https://atplc20.pythonanywhere.com/${course.Course_Thumbnail}`}
              alt={course.Course_Name}
            />
          ) : (
            <div className="cover-default-image"> {"</>"}</div>
          )}
        </div>

        <div className="page-heading">
          <h3>{course?.Course_Name}</h3>
        </div>

        <div className="course-details-container">
          <div className="course-details">
            <div className="">
              <h4 className="desc-title">Tools & Technologies :</h4>
              <div className="techs-list">
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
            <div className="">
              <h4 className="desc-title">Duration :</h4>
              {course?.Course_Duration && (
                <span>
                  {course.Course_Duration} Month
                  {course.Course_Duration > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="">
              <h4 className="desc-title">Price :</h4>
              <span>₹ {course?.Course_Price}+18% GST</span>
            </div>
          </div>

          <div className="enroll-qr">
            <h4 className="desc-title">Course Enrollment:</h4>
            <img src={scanner} width="200" height="200" alt="UPI Scanner" />
          </div>

          <div className="payment-message">
            <h3>
              To enroll into the course, scan and pay using above scanner and
              fill <a href="https://forms.gle/C8VfVfv3mFPJFpHc8">this form.</a>{" "}
            </h3>
            <p className="payment-note">
              (Keep patience after payment. You will receive login credentials
              and WhatsApp group link on registered mail before course starts.)
            </p>
          </div>
        </div>

        <div className="content-preview">
          <h4 className="desc-title">Course Contents:</h4>
          {course?.Course_Contents ? (
            <iframe
              src={course.Course_Contents}
              title={course.Course_Name}
              frameborder="0"
              width="95%"
              height="500"
            />
          ) : (
            <p>Course content is not available</p>
          )}
        </div>
      </section>
    </>
  );
};

export default CourseDetails;
