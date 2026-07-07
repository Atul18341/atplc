'use client';

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Loader2, MessageSquare } from "lucide-react";

// --- MODERN SWIPER COMPONENT & CORE MODULES IMPORTS ---
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay, Keyboard, EffectCoverflow } from "swiper/modules";

// Modern Swiper Base CSS Bundle Imports
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";

import { useApp } from "../../../Context/AppContext";
import FeedbackCard, { FeedbackCardProps } from "../FeedbackCard/FeedbackCard";

export default function TestimonialsCarousel() {
  const router = useRouter();
  
  // 🔑 Extract parameters out of global context securely with strict type mappings
  const { feedbacks, getFeedbacks, loading } = useApp() as {
    feedbacks: any;
    getFeedbacks: () => Promise<void>;
    loading: boolean;
  };

  const [pickedFeedbacks, setPickedFeedbacks] = useState<FeedbackCardProps[]>([]);

  // Fetch feedbacks list array securely if not initialized in state memory rows
  const fetchFeedbacksCatalog = useCallback(async () => {
    if (!feedbacks) {
      try {
        await getFeedbacks();
      } catch (err: any) {
        const errorMessage = err.message || "Failed to sync testimonials.";
        toast.error(errorMessage);
        router.replace("/error");
      }
    }
  }, [feedbacks, getFeedbacks, router]);

  useEffect(() => {
    fetchFeedbacksCatalog();
  }, [fetchFeedbacksCatalog]);

  // 🧠 CACHE-RESILIENT NORMALIZATION & MIX ENGINE:
  // Extracts and interleaves Trainee and Intern reviews cleanly to match legacy mixing logic safely
  useEffect(() => {
    if (!feedbacks) return;

    try {
      // Direct array extractions matching legacy API responses or fallback normalization filters
      const traineeList: FeedbackCardProps[] = (feedbacks?.Trainee_Feedbacks || 
        (Array.isArray(feedbacks) ? feedbacks.filter((f: any) => f.Feedback_Type === "Trainee") : [])).slice(0, 5);
      
      const internList: FeedbackCardProps[] = (feedbacks?.Interns_Feedbacks || 
        (Array.isArray(feedbacks) ? feedbacks.filter((f: any) => f.Feedback_Type === "Intern") : [])).slice(0, 5);

      const mixedFeedbacks: FeedbackCardProps[] = [];
      const maxLength = Math.max(traineeList.length, internList.length);

      for (let i = 0; i < maxLength; i++) {
        if (traineeList[i]) mixedFeedbacks.push(traineeList[i]);
        if (internList[i]) mixedFeedbacks.push(internList[i]);
      }

      setPickedFeedbacks(mixedFeedbacks);
    } catch (err: any) {
      console.error("Testimonials state compiling mismatch exception:", err);
    }
  }, [feedbacks]);

  return (
    <section className="w-full bg-slate-50/50 dark:bg-slate-950/40 py-16 px-4 md:px-8 select-none box-border overflow-hidden" id="feedback">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* --- PREMIUM CONTENT HEADER PANEL --- */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/10">
            <MessageSquare size={12} />
            <span>Success Stories</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight m-0">
            Our Testimonials
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed m-0">
            Read real feedback left by active student trainees and engineering interns across corporate programs.
          </p>
        </div>

        {/* --- SLIDER CAROUSEL BODY PANEL FRAME --- */}
        {loading && pickedFeedbacks.length === 0 ? (
          <div className="w-full min-h-[300px] flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-xs">
            <Loader2 className="animate-spin text-blue-600 dark:text-blue-500" size={32} />
            <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase animate-pulse">
              Mounting Review Slider...
            </span>
          </div>
        ) : pickedFeedbacks.length === 0 ? (
          <div className="w-full text-center py-12 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 dark:text-slate-500 text-xs font-semibold italic shadow-xs">
            No testimonial items currently flagged for landing display preview.
          </div>
        ) : (
          <div className="w-full relative px-2 md:px-6 box-border">
            <Swiper
              spaceBetween={24}
              slidesPerView={1}
              centeredSlides={true}
              loop={pickedFeedbacks.length > 2} // Safe fallback loop execution guard checks
              initialSlide={0}
              effect={"coverflow"}
              grabCursor={true}
              keyboard={{ enabled: true }}
              coverflowEffect={{
                rotate: 15,
                stretch: 0,
                depth: 80,
                modifier: 1.2,
                slideShadows: false,
              }}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
              }}
              pagination={{
                clickable: true,
                dynamicBullets: true
              }}
              navigation={true}
              breakpoints={{
                0: {
                  slidesPerView: 1,
                  ...({
                        coverflowEffect: { rotate: 0, depth: 0 }
                        } as any)
                    },
                768: {
                  slidesPerView: 1.6
                },
                1024: {
                  slidesPerView: 2
                }
              }}
              modules={[EffectCoverflow, Keyboard, Autoplay, Pagination, Navigation]}
              className="!pb-14 !px-4 premium-swiper-wrapper" // Leaves clean breathing room below for pagination dots
            >
              {pickedFeedbacks.map((feed) => (
                <SwiperSlide key={feed.id} className="transition-all duration-300 transform rounded-2xl">
                  {/* Pulls in the updated, sanitized Tailwind components seamlessly */}
                  <FeedbackCard {...feed} full={false} />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Tailwind overrides applied cleanly to Swiper injected buttons directly */}
            <style jsx global>{`
              .premium-swiper-wrapper .swiper-button-next,
              .premium-swiper-wrapper .swiper-button-prev {
                color: #2563eb !important;
                background: rgba(255, 255, 255, 0.85);
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: 1px solid rgba(226, 232, 240, 0.8);
                box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                transition: all 0.2s ease;
              }
              .dark .premium-swiper-wrapper .swiper-button-next,
              .dark .premium-swiper-wrapper .swiper-button-prev {
                background: rgba(15, 23, 42, 0.85);
                border: 1px solid rgba(51, 65, 85, 0.5);
              }
              .premium-swiper-wrapper .swiper-button-next:after,
              .premium-swiper-wrapper .swiper-button-prev:after {
                font-size: 16px !important;
                font-weight: 900;
              }
              .premium-swiper-wrapper .swiper-button-next:hover,
              .premium-swiper-wrapper .swiper-button-prev:hover {
                transform: scale(1.05);
                background: #ffffff;
              }
              .dark .premium-swiper-wrapper .swiper-button-next:hover,
              .dark .premium-swiper-wrapper .swiper-button-prev:hover {
                background: #1e293b;
              }
              .premium-swiper-wrapper .swiper-pagination-bullet-active {
                background: #2563eb !important;
                width: 18px;
                border-radius: 4px;
              }
            `}</style>
          </div>
        )}

      </div>
    </section>
  );
}