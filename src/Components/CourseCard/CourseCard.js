import { Link } from "react-router-dom";
import "./CourseCard.css";
import { convertToUrlSlug } from "../../lib/utils";

export default function CourseCard({
  enrolled = false,
  id,
  courseName,
  courseDuration,
  coverImage,
  courseCompletionStatus,
  couresPrice,
  courseTechnologies,
}) {
  const url = enrolled
    ? `/my-courses/${id}/${convertToUrlSlug(courseName)}`
    : `/course/${convertToUrlSlug(courseName)}`;

  return (
    <Link to={url} className="course-card">
      <div className="course-cover">
        <div className="cover-image">
          {coverImage && coverImage !== "/media/" ? (
            <img
              src={`${process.env.REACT_APP_BACKEND_PATH}${coverImage}`}
              alt={courseName}
            />
          ) : (
            <div className="cover-default-image"> {"</>"}</div>
          )}
        </div>
        <div className="course-name">{courseName}</div>
      </div>
      <div className="course-content">
        <div className="course-price-duration">
          {courseDuration !== 0 ? (
            <div className="course-duration">
              <div className="icon">
                <i className="fi fi-rr-hourglass-start"></i>
              </div>
              <div className="text">{courseDuration} Month</div>
            </div>
          ) : null}
          {couresPrice !== null && !enrolled ? (
            <div className="course-price">
              <div className="icon">
                <i className="fi fi-rr-indian-rupee-sign"></i>
              </div>
              <div className="text">₹ {course?.Course_Price}+18% GST</div>
            </div>
          ) : null}
        </div>
        {courseTechnologies !== null && (
          <div className="techs">
            {courseTechnologies.split(",").map((tech, index) => {
              return (
                <span className="tech" key={index}>
                  {tech}
                </span>
              );
            })}
          </div>
        )}

        {/* <div className="course-card-buttons">
                    {
                        enrolled ?
                            <Link tabIndex={0} to={`/my-courses/${id}/${courseName}`} className="course-card-btn">
                                <div className="icon">
                                    <i className="fi fi-rr-dashboard"></i>
                                </div>
                                <div className="text">Continue to Dashboard</div>
                            </Link>
                            ://to={`/enroll/${courseName}`}
                            <Link tabIndex={0} className="course-card-btn">
                                <div className="icon">
                                    <i className="fi fi-rr-file-signature"></i>
                                </div>
                                <div className="text" onClick={(e) => window.location.href = "https://lyss.in/payment"}>Proceed to Pay</div>
                            </Link>

                    }
                </div> */}
      </div>
      {courseCompletionStatus && <div className="course-status">Completed</div>}
    </Link>
  );
}
