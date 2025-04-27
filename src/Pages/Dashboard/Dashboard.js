import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../CommonPage.css";
import "./Dashboard.css";
import TaskCard from "../../Components/TaskCard/TaskCard";
import Card from "../../Components/ProgressCard/ProgressCard";
import Loader from "../../Components/Loader/Loader";
import Error from "../Error/Error";
import CourseFeedback from "../../Components/Feedback/CouseFeedback/CourseFeedback";
import Certificate from "../../Components/Certificate/Certificate";
import {
  WhatsappShareButton,
  WhatsappIcon,
  LinkedinShareButton,
  LinkedinIcon,
} from "react-share";
import CopyToClipboard from "react-copy-to-clipboard";
import { useAuth } from "../../context/authContext";
import { convertUrlToText } from "../../lib/utils";

export default function Dashboard() {
  const params = useParams();
  const { user, loading } = useAuth();

  const navigate = useNavigate();
  const [error, setError] = useState("");

  const [isLoading, setIsloading] = useState(true);
  const [taskData, setTaskData] = useState([]);
  const [completedTask, setCompletedTask] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      console.log(user);
      navigate("/login", { replace: true });
    }
  }, [user, navigate, loading]);

  useEffect(() => {
    document.title = `Dashboard | ${convertUrlToText(params?.courseName)}`;
    document.getElementsByTagName("META")[2].content =
      "All things at one place for your selected course.";
    window.scrollTo(0, 0);
  }, [params?.courseName]);

  useEffect(() => {
    async function getTasks() {
      try {
        setIsloading(true);
        const { data } = await axios.post(
          `${process.env.REACT_APP_BACKEND_PATH}/dashboard`,
          {
            course: params?.id,
            Username: user?.id,
          }
        );
        const submissions = data?.Submissions || [];
        const tasks = data?.Tasks || [];
        const uniqueSubmissions = Object.values(
          submissions.reduce((acc, task) => {
            // Use Task_No_id as the key
            acc[task.Task_No_id] = task; // This will replace older entries with newer ones
            return acc;
          }, {})
        );
        // console.log(tasks, uniqueSubmissions);
        setCompletedTask(
          uniqueSubmissions.filter((sub) => {
            return sub.Task_Status === "Approved";
          })
        );

        const newTasks = tasks.map((task) => {
          const submission = uniqueSubmissions.find(
            (sub) => sub.Task_No_id === task.id
          );
          return {
            ...task,
            Task_Status: submission?.Task_Status || "",
            Code_Link: submission?.Code_Link || "",
            Output_Link: submission?.Output_Link || "",
            Remarks: submission?.Remarks || "",
          };
        });
        console.log(newTasks);
        setTaskData(newTasks);
      } catch (e) {
        setError(e);
      } finally {
        setIsloading(false);
      }
    }
    user?.id && getTasks();
  }, [params?.id, user?.id]);

  function copyLink() {
    const tooltip = document.querySelector(".tooltip");
    tooltip.innerText = "copied";
    tooltip.addEventListener("mouseleave", () => (tooltip.innerText = "copy"));
  }

  return isLoading ? (
    <Loader />
  ) : (
    <section className="page dashboard-page">
      <div className="page-heading">
        <h3>{convertUrlToText(params?.courseName)}</h3>
      </div>
      {error === "" ? (
        <div className="page-body">
          <div className="score-card-container grid">
            <Card
              heading="Verified Submission"
              icon="fi fi-rr-list-check"
              obtainedScore={completedTask.length}
              totalScore={taskData.length}
            />
            <Card
              heading="Pending Tasks"
              icon="fi fi-rr-info"
              obtainedScore={taskData.length - completedTask.length}
              totalScore={taskData.length}
            />
          </div>
          <div className="page-body-heading">
            <h4>Course Tasks</h4>
            <div className="share-work">
              <WhatsappShareButton
                title={`My ${params.courseName} Work at ATPLC`}
                url={`https://www.atplc.in/dashboard/${user?.id}/${params.id}`}
              >
                <WhatsappIcon
                  round={true}
                  size={40}
                  iconFillColor="var(--bg)"
                />
              </WhatsappShareButton>
              <LinkedinShareButton
                title={`My ${params.courseName} Work at ATPLC`}
                summary="My all tasks and projects done during Training at @ATPLC"
                source="atplc.in"
                url={`https://www.atplc.in/dashboard/${user?.id}/${params.id}`}
              >
                <LinkedinIcon
                  round={true}
                  size={40}
                  iconFillColor="var(--bg)"
                />
              </LinkedinShareButton>
              <CopyToClipboard
                text={`https://www.atplc.in/dashboard/${user?.id}/${params.id}`}
                onCopy={(e) => console.log(e)}
              >
                <button className="copy-link" onClick={copyLink}>
                  <i className="fi fi-rr-copy-alt"></i>
                  <div className="tooltip">copy</div>
                </button>
              </CopyToClipboard>
            </div>
          </div>

          <div className="task-list-container grid">
            {taskData?.map((task) => {
              return (
                <TaskCard
                  key={task.Task_No}
                  courseId={params?.id}
                  Task_No={task.Task_No}
                  Task_Id={task.id}
                  Task_Topic={task.Task_Topic}
                  Task_Content={task.Task_Content}
                  Task_Status={task.Task_Status || ""}
                  Code_Link={task.Code_Link || ""}
                  Output_Link={task.Output_Link || ""}
                  Remarks={task.Remarks || ""}
                />
              );
            })}
          </div>

          <CourseFeedback />

          <Certificate
            completedTask={completedTask.length}
            totalTask={taskData.length}
            courseName={params?.courseName}
            courseId={params?.id}
          />
        </div>
      ) : (
        <Error error={error} />
      )}
    </section>
  );
}
