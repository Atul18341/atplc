import React, { useCallback, useEffect, useState } from 'react'
import Loader from '../../Components/Loader/Loader';
import '../CommonPage.css'
import './Feedback.css'
import FeedbackCard from '../../Components/Feedback/FeedbackCard/FeedbackCard';
import { useApp } from '../../context/appContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function Feedback() {

    const [filter, setFilter] = useState('');

    const { feedbacks, getFeedbacks, loading } = useApp()
    const navigate = useNavigate();


    // Fetch feedbacks if they are not available
    const fetchFeedbacks = useCallback(async () => {
        if (!feedbacks || feedbacks.length === 0) {
            await getFeedbacks();
        }
    }, [feedbacks, getFeedbacks]);

    useEffect(() => {
        try {
            fetchFeedbacks();
        } catch (err) {
            const errorMessage = err.message;
            toast.error(errorMessage);
            navigate('/error', { replace: true, state: { error: err } });
        }
    }, [navigate, fetchFeedbacks]);

    useEffect(() => {
        const url = new URL(window.location.href);
        const tab = url.searchParams.get('tab');
        if (tab) {
            setFilter(tab);
        }

    }, [filter])


    const handelClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setFilter(e.target.value);
        navigate(`/feedbacks?tab=${e.target.value}`);
        window.scrollTo(0, 0);
    }

    return (

        loading
            ?
            <Loader />
            :
            <section className='page feedback-page'>
                <div className="page-heading">
                    <h3>Feedbacks</h3>
                </div>
                <div className="feedback-navigation">
                    <button onClick={handelClick} value="Trainee" className={`${filter === 'Trainee' ? 'active' : ''}`}>
                        <div className="icon">
                            <i className="fi fi-rr-gym"></i>
                        </div>
                        <div className="icon">Trainee</div>
                    </button>
                    <button onClick={handelClick} value="Intern" className={`${filter === 'Intern' ? 'active' : ''}`}>
                        <div className="icon">
                            <i className="fi fi-rr-house-laptop"></i>
                        </div>
                        <div className="text">
                            Intern
                        </div>
                    </button>
                </div>
                <div className="feedback-container">
                    {

                        feedbacks && Object.values(feedbacks).map(e => {
                            return e.filter(filterFeed => {
                                if (filter !== '')
                                    return filterFeed.Feedback_Type === filter
                                else return true;
                            }).map((feed) => {
                                return <FeedbackCard key={feed.id} {...feed} full={true} />
                            })
                        })
                    }
                </div>
            </section>

    )
}
