import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { convertUrlToText } from "../../lib/utils";
import { useApp } from "../../context/appContext";

const CourseDetails = () => {

    const params = useParams();
    const [course, setCourse] = useState({});

    const { getCourse } = useApp();

    const fetchCourse = useCallback(async () => {
        if (!course) {
            const CourseDetail = await getCourse(params?.courseName);
            console.log(CourseDetail)
            setCourse(CourseDetail);
        }
    }, [course, getCourse, params?.courseName]);

    useEffect(() => {
        document.title = `ATPLC | ${convertUrlToText(params?.courseName)}`
        document.getElementsByTagName("META")[2].content = `Master ${convertUrlToText(params?.courseName)} with our expert-led course. Gain hands-on experience, real-world projects, and certification. Enroll now to boost your career!`
        window.scrollTo(0, 0);

        fetchCourse();

    }, [params?.courseName, fetchCourse])

    return (
        <section className='page courses-page'>
            <div className="page-thumbnail">
                <img src="/Assets/Illustrator/training-page.jpg" alt="training" />
            </div>
            <div className="page-heading">
                <h3>Courses</h3>
            </div>
        </section>
    )
}

export default CourseDetails