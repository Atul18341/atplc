import React from 'react';
import type { Metadata } from 'next';

// --- COMPONENT IMPORTS ---
import Hero from './components/Hero/Hero';
import PageStatics from './components/PageStatstics/PageStatstics';
import TestimonialsCarousel from './components/Feedback/TestimonialsCarousel/TestimonialsCarousel';

export const metadata: Metadata = {
  title: 'ATPLC Portal | Home',
  description: 'ATPLC is a Technical and Practical Learning Club. It provides a variety of courses with one-on-one doubt resolution and internships under the guidance of experts.',
  openGraph: {
    title: 'ATPLC Portal | Home',
    description: 'Technical and Practical Learning Club providing expert-guided courses and internships.',
    type: 'website',
  },
};

export default function LandingPage() {
  return (
    <main className="w-full min-h-screen bg-slate-50/50 flex flex-col overflow-x-hidden select-none scroll-smooth">
      {/* 1. Hero Dynamic Entrance Section */}
      <div className="w-full relative bg-white border-b border-slate-200/60 shadow-xs">
        <Hero />
      </div>

      {/* 2. Core Operational Modules Splitter (Tighter spacing applied here) */}
      <div className="w-full space-y-8 md:space-y-6 py-6 md:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 box-border">
        
        {/* Expertise Grid Section Area */}
        <section className="w-full transition-all duration-300 transform hover:translate-y-[-2px]">
          {/*<OurExperties />*/}
        </section>

        {/* Separator Accent Line */}
        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-auto" />

        {/* Analytical Numerical Metrics Section */}
        <section className="w-full bg-white border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-100/40">
          <PageStatics />
        </section>

        {/* Separator Accent Line */}
        <div className="w-24 h-[0.5px] bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-auto" />
        
        {/* Social Proof Peer Feedbacks Canvas Carousel */}
        <section className="w-full">
         <TestimonialsCarousel/>
        </section>

      </div>
    </main>
  );
}