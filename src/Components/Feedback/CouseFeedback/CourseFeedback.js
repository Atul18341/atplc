import { useState } from "react";
import Button from "../../Button/Button";
import "./CourseFeedback.css";
import Input from "../../../Controller/Input/Input";
import axios from "axios";
import { useAuth } from "../../../context/authContext";
import { toast } from "react-toastify";

export default function CourseFeedback({ feedback, setFeedback }) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const [inputFeedback, setInputFeedback] = useState(feedback || "");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(
    feedback && feedback.length > 10
  );

  const sendFeedback = async () => {
    try {
      setIsLoading(true);
      if (!inputFeedback || inputFeedback.length < 10) {
        toast.error("Feedback must be at least 10 characters long.");
        setIsLoading(false);
        return;
      }
      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_PATH}/submit-feedback`,
        {
          Username: user.id,
          Feedback: feedback,
        }
      );

      toast.success(data?.Response || "Feedback submitted successfully!");
      localStorage.setItem("feedback", inputFeedback);
      setFeedback(inputFeedback);
      setFeedbackSubmitted(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.Response ||
          error.message ||
          "Failed to submit feedback."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setInputFeedback(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendFeedback();
  };

  return (
    <section className="course-feedback-section">
      <div className="section-heading">
        <h4>Your Feedback</h4>
      </div>
      {feedbackSubmitted ? (
        <div className="section-body">
          <div className="feedback-content">
            <p>{feedback}</p>
            <button onClick={() => setFeedbackSubmitted(false)}>
              <i className="fi fi-rr-edit"></i>
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="section-body">
            <p>
              ATPLC would be delighted to hear about your experience during this
              course and any suggestions you may have to improve it.
            </p>
            {
              <div className="feedback-popup">
                <form onSubmit={handleSubmit}>
                  <Input
                    type={"textarea"}
                    label="Feedback"
                    value={inputFeedback}
                    onChange={handleChange}
                  />
                  {inputFeedback !== feedback && (
                    <Button
                      icon="fi fi-rr-arrow-up-from-square"
                      type="submit"
                      label={"Submit"}
                      isLoading={isLoading}
                      className="submit-feedback"
                    />
                  )}
                </form>
              </div>
            }
          </div>
        </>
      )}
    </section>
  );
}
