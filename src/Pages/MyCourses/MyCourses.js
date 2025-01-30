import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import './MyCourses.css';
import CourseCard from '../../Components/CourseCard/CourseCard';
import Loader from '../../Components/Loader/Loader';
import { Link, useNavigate } from 'react-router-dom';
import Error from '../Error/Error'
import { useAuth } from '../../context/authContext';
import Button from '../../Components/Button/Button';

export default function Courses() {
    const [isLoading, setIsLoading] = useState(true);
    const [myCourses, setMyCourses] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { user } = useAuth();

    useEffect(() => {
        document.title = "ATPLC | My Courses"
        document.getElementsByTagName("META")[2].content = 'All Your Courses at one place'
        window.scrollTo(0, 0);
    }, [])

    const fetchCourses = useCallback(async () => {
        try {
            const { data } = await axios.post(`${process.env.REACT_APP_BACKEND_PATH}/my-courses`, {
                Username: user?.id,
            });
            setMyCourses(data);
        } catch (error) {
            setError(error);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (!user) {
            navigate('/login', { replace: true });
        }
        fetchCourses();
    }, [fetchCourses, navigate, user]);

    const courseCards = useMemo(() => {
        if (myCourses.length) {
            return myCourses.map((course) => (
                <CourseCard
                    key={course.Courses_id}
                    id={course.Courses_id}
                    courseName={course.Courses__Course_Name}
                    courseDuration={0}
                    courseCompletionStatus={course.Courses_Completed}
                    coverImage={
                        course.Courses__Course_Thumbnail.startsWith('/media')
                            ? course.Courses__Course_Thumbnail
                            : '/media/' + course.Courses__Course_Thumbnail
                    }
                    couresPrice={null}
                    courseTechnologies={null}
                />
            ));
        }
        else {
            return <div className="not-found">
                <h2>No Courses Found</h2>
                <p>Please enroll in a course to view it here.</p>
                <Link to='/courses'>
                    <Button label={'Enroll Now'} />
                </Link>
            </div>
        }

    }, [myCourses]);

    return (
        <section className='page my-courses-page'>
            <div className='page-heading'>
                <h3>My Courses</h3>
            </div>

            {error === '' ? (
                isLoading ? (
                    <Loader />
                ) : (
                    <div className='courses-grid'>{courseCards}</div>
                )
            ) : (
                <Error error={error} />
            )}
        </section>
    );
}
