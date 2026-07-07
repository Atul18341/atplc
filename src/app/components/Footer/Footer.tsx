'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Home, Info, GraduationCap, Layers, MessageSquare, Mail, Phone } from 'lucide-react';


// 🔑 PERMANENT FIX: Inline production-ready SVG definitions matching your brand styles perfectly
const BRAND_LOGOS = {
  github: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  ),
  linkedin: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  telegram: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  ),
  facebook: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  youtube: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  )
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-900 text-slate-300 dark:bg-slate-950 transition-colors duration-300 border-t border-slate-800 select-none" id="footer">
      
      {/* --- MAIN ROOT CONTAINER GRID --- */}
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 box-border items-start">
        
        {/* SECTION 1: ADDRESS DISPATCH */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white font-black uppercase tracking-wider text-xs border-b border-slate-800 pb-2">
            <MapPin size={14} className="text-blue-500" />
            <span>Corporate Address</span>
          </div>
          <div className="text-xs font-medium text-slate-400 leading-relaxed space-y-1 font-sans">
            <p className="m-0">3/365, Aryan Bhawan</p>
            <p className="m-0">Lakho Binda Campus, Santunagar,</p>
            <p className="m-0">Madhubani (Bihar) - India</p>
            <p className="m-0 font-mono tracking-tight text-slate-500">Pin - 847211</p>
          </div>
        </div>

        {/* SECTION 2: NEXT.JS ROUTE NAVIGATION LINKS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white font-black uppercase tracking-wider text-xs border-b border-slate-800 pb-2">
            <Layers size={14} className="text-blue-500" />
            <span>Quick Links</span>
          </div>
          <nav className="flex flex-col gap-2.5">
            <Link href="/" className="inline-flex items-center gap-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors group">
              <Home size={13} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
              <span>Home</span>
            </Link>
            <Link href="/#about" className="inline-flex items-center gap-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors group">
              <Info size={13} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
              <span>About Us</span>
            </Link>
            <Link href="/courses" className="inline-flex items-center gap-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors group">
              <GraduationCap size={13} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
              <span>Courses Catalog</span>
            </Link>
            <Link href="/gallery" className="inline-flex items-center gap-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors group">
              <Layers size={13} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
              <span>Gallery Matrix</span>
            </Link>
            <Link href="/#feedback" className="inline-flex items-center gap-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors group">
              <MessageSquare size={13} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
              <span>Trainee Feedback</span>
            </Link>
          </nav>
        </div>

        {/* SECTION 3: SOCIAL LINKS */}
        <div className="space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2 text-white font-black uppercase tracking-wider text-xs border-b border-slate-800 pb-2">
            <Layers size={14} className="text-blue-500" />
            <span>Communication Rails</span>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            <a href="mailto:contact2atplc@gmail.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors group truncate">
              <Mail size={13} className="text-slate-500 group-hover:text-blue-400 flex-shrink-0" />
              <span className="truncate">contact2atplc@gmail.com</span>
            </a>
            <a href="tel:+916205695667" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors group">
              <Phone size={13} className="text-slate-500 group-hover:text-blue-400" />
              <span className="font-mono tracking-tight">+91-9122461780</span>
            </a>
            
            {/* Clean, custom brand social elements layout row wrapper */}
            <div className="flex items-center gap-3 pt-2">
              <a href="https://github.com/atplc" target="_blank" rel="noopener noreferrer" title="GitHub" className="w-8 h-8 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all">
                <BRAND_LOGOS.github className="w-3.5 h-3.5" />
              </a>
              <a href="https://in.linkedin.com/company/atplc" target="_blank" rel="noopener noreferrer" title="LinkedIn" className="w-8 h-8 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all">
                <BRAND_LOGOS.linkedin className="w-3.5 h-3.5" />
              </a>
              <a href="https://telegram.me/atplc" target="_blank" rel="noopener noreferrer" title="Telegram" className="w-8 h-8 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all">
                <BRAND_LOGOS.telegram className="w-3.5 h-3.5" />
              </a>
              <a href="https://www.facebook.com/people/ATPLC/100063604494243/" target="_blank" rel="noopener noreferrer" title="Facebook" className="w-8 h-8 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all">
                <BRAND_LOGOS.facebook className="w-3.5 h-3.5" />
              </a>
              <a href="https://www.youtube.com/channel/UCMb7k6Re-zCo1M4HjptvG6g" target="_blank" rel="noopener noreferrer" title="YouTube" className="w-8 h-8 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-slate-800 hover:border-slate-700 transition-all">
                <BRAND_LOGOS.youtube className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* SECTION 4: HIGH-FIDELITY VECTOR ILLUSTRATION FRAME */}
        <div className="relative w-full h-[140px] flex items-center justify-center lg:justify-end">
          <Image 
            src="/Assets/Illustrator/footer-character.png" 
            alt="ATPLC training advisor vector layout character asset"
            width={120}
            height={140}
            priority
            className="object-contain opacity-70 hover:opacity-100 transition-opacity duration-300 pointer-events-none select-none"
          />
        </div>

      </div>

      {/* --- INTELLECTUAL COPYRIGHT METADATA ROW --- */}
      <div className="w-full bg-slate-950/60 border-t border-slate-800/60 py-5 text-center px-4 box-border">
        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-600 uppercase tracking-widest m-0 leading-normal">
          <span>Copyright &copy; ATPLC (2020-{currentYear})</span>
          <span className="mx-2 font-light">|</span>
          <a 
            href="https://lyss.in" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-blue-400 transition-colors underline decoration-slate-700 hover:decoration-blue-500 underline-offset-4"
          >
            Powered by LYSS Technology, Madhubani.
          </a>
        </p>
      </div>

    </footer>
  );
}