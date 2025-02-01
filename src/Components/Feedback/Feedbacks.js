import React, { useCallback, useEffect, useState } from 'react'
import './Feedbacks.css'
import FeedbackCard from '../Feedback/FeedbackCard/FeedbackCard';
import Loader from '../Loader/Loader'

// Swiper JS
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";


// import required modules
import { Pagination, Navigation, Autoplay, Keyboard, EffectCoverflow } from "swiper";
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/appContext';
import { toast } from 'react-toastify';



export default function Feedback() {

    const [pickedFeedbacks, setPickedFeedbacks] = useState([]);

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
            const trainee = feedbacks?.Trainee_Feedbacks?.slice(0, 5);
            const intern = feedbacks?.Interns_Feedbacks?.slice(0, 5);

            const mixedFeedbacks = [];
            const maxLength = Math.max(trainee?.length || 0, intern?.length || 0);

            for (let i = 0; i < maxLength; i++) {
                if (trainee[i]) mixedFeedbacks.push(trainee[i]);
                if (intern[i]) mixedFeedbacks.push(intern[i]);
            }

            setPickedFeedbacks(mixedFeedbacks);

        } catch (err) {
            const errorMessage = err.message;
            toast.error(errorMessage);
            navigate('/error', { replace: true, state: { error: err } });
        }
    }, [navigate, fetchFeedbacks, feedbacks]);



    return (
        <section className='feedback-section' id='feedback'>
            <div className="section-heading">
                <h2>Our Testimonials</h2>
            </div>
            {
                loading
                    ?
                    <Loader />
                    :
                    <div className="section-body">
                        <Swiper
                            spaceBetween={10}
                            slidesPerView={1}
                            centeredSlides={true}
                            loop={true}
                            initialSlide={0}
                            effect={"coverflow"}
                            fadeEffect={true}
                            grabCursor={true}
                            keyboard={{
                                enabled: true,
                            }}
                            coverflowEffect={{
                                rotate: 50,
                                stretch: 0,
                                depth: 5,
                                modifier: 1,
                                slideShadows: false,
                            }}
                            autoplay={{
                                delay: 5000,
                                disableOnInteraction: false
                            }}
                            pagination={{
                                clickable: true,
                            }}
                            breakpoints={
                                {
                                    0: {
                                        slidesPerView: 1
                                    },
                                    950: {
                                        slidesPerView: 2
                                    }
                                }
                            }
                            navigation={true}
                            modules={[EffectCoverflow, Keyboard, Autoplay, Pagination, Navigation]}
                            className="feedback-container"
                        >
                            {
                                pickedFeedbacks?.map((feed, index) =>
                                    <SwiperSlide key={feed.id}>
                                        <FeedbackCard {...feed} index={index} />
                                    </SwiperSlide>
                                )
                            }
                        </Swiper>
                    </div>
            }
        </section >
    )
}
