'use client';

import React, { useRef, useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import axios from "axios";
import html2canvas from 'html2canvas-pro';
import { convertUrlToText } from "../../lib/utils";

import { useAuth } from "../../Context/AuthContext";

interface CertificateProps {
  completedTask: number;
  totalTask: number;
  courseName: string;
  courseId: string;
}
interface TopPerformerRecord {
  top_performer: boolean;
}

interface TopPerformerResponse {
  Response: TopPerformerRecord[];
}
export default function Certificate({
  completedTask,
  totalTask,
  courseName,
  courseId,
}: CertificateProps) {
  
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isPerformer, setIsPerformer] = useState<boolean>(false); 
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const { user } = useAuth();

  const executionPercentage = totalTask > 0 ? (completedTask / totalTask) * 100 : 0;
  const isEligible = executionPercentage >= 75;

  const issueDateStr = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  useEffect(() => {
    const verifyCanvasResources = async () => {
      try {
        if (typeof document !== 'undefined' && document.fonts) {
          await document.fonts.ready;
        }

        const assetImages = certificateRef.current?.querySelectorAll('img') || [];
        const loadingPromises = Array.from(assetImages).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
        });
        
        await Promise.all(loadingPromises);
        await new Promise((resolve) => setTimeout(resolve, 300)); 
        setIsCanvasReady(true);
      } catch (err) {
        console.error("Canvas resource pipeline optimization fault: ", err);
      }
    };

    verifyCanvasResources();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    checkPerformerStatus(user.id);
  }, [user?.id]);

  const checkPerformerStatus = async (userId: string) => {
    try {
      const response = await axios.post('https://atplc20.pythonanywhere.com/top-performers-check/', {
        Username: userId
      });
      if (response.status === 200 && response.data?.Response?.[0]) {
        setIsPerformer(response.data.Response[0].top_performer);
      }
    } catch (error) {
      console.error("Failed to authenticate performer metrics baseline:", error);
    }
  };

  const downloadPDF = async () => {
    const element = certificateRef.current;
    if (!element) return;

    setIsDownloading(true);

    try {
      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true, 
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.75);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); 
      const pdfHeight = pdf.internal.pageSize.getHeight(); 

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`ATPLC_${convertUrlToText(courseName || 'Course')}_Certificate.pdf`);
    } catch (error) {
      console.error("PDF Generation Fault:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Reusable core graphic frame
  const renderCertificateContent = () => (
    <>
      <div className="absolute inset-4 border-4 pointer-events-none" style={{ borderColor: '#1e3a8a' }} />
      <div className="absolute inset-6 border pointer-events-none" style={{ borderColor: 'rgba(217, 119, 6, 0.4)', borderStyle: 'dashed' }} />
      
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none z-0">
        <span className="text-[130px] font-black tracking-widest border-8 px-10 py-4 rotate-12" style={{ borderColor: '#1e3a8a' }}>LNMU</span>
      </div>

      <div className="w-full flex items-center justify-between gap-2 z-10 pt-2 box-border">
        <div className="w-24 h-24 flex items-center justify-center flex-shrink-0">
          <img src="/images/atplc_logo.png" alt="ATPLC Logo" className="max-w-full max-h-full object-contain" />
        </div>
        
        <div className="text-center flex-1 px-4">
          <h1 className="text-[30px] font-bold tracking-wide text-blue-800 m-0 leading-tight">
            A TECHNICAL & PRACTICAL LEARNING CLUB 
          </h1>
          <p className="text-[15px] font-bold tracking-wider text-red-600 uppercase mt-1 m-0">
            (MSME REGISTERED & AICTE OFFICIAL INTERNSHIP PARTNER PLATFORM)
          </p>
          <div className="w-full h-[2px] bg-blue-800 mt-3" />
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-[72px] h-[72px] flex items-center justify-center">
            <img src="/images/msme.png" alt="MSME Seal" className="max-w-full max-h-full object-contain" />
          </div>
          <div className="w-[72px] h-[72px] flex items-center justify-center">
            <img src="/images/aicte.png" alt="AICTE Seal" className="max-w-full max-h-full object-contain" />
          </div>
        </div>
      </div>

      <div className="text-center max-w-[880px] z-10 w-full space-y-7 -mt-2">
        <h2 className="text-[36px] font-semibold italic tracking-wide uppercase text-blue-900 m-0">
          CERTIFICATE OF COMPLETION
        </h2>
        
        <div className="space-y-4">
          <p className="text-[18px] text-slate-500 font-medium mt-7">
            This is to officially certify that
          </p>
         {isPerformer && (
            <div className="relative w-0 h-0">
              <div className="absolute -top-[3.75rem] left-[45rem] w-36 h-36 drop-shadow-[0_4px_6px_rgba(0,0,0,0.12)] z-40">
                <img 
                  src="/images/top-performer-seal.png" 
                  alt="Top Performer Gold Seal" 
                  className="w-full h-full object-contain" 
                />
              </div>
            </div>
          )}
          <div className="max-w-[460px] mx-auto border-b border-dotted border-slate-400 pb-1 mt-1">
            <span className="text-[30px] font-bold tracking-wide text-slate-900 uppercase">
              {user?.Name || "Your Name"}
            </span>
          </div>
          
          <p className="text-[18px] text-slate-800 font-medium pt-1 m-0">
            of <span className="font-bold uppercase tracking-wide text-slate-900">{user?.College_Name || "RK_COLLEGE"}</span>
          </p>
        </div>

        <p className="text-[18px] leading-relaxed text-slate-700 px-6 max-w-[840px] mx-auto text-justify font-normal m-0">
          has successfully completed the mandatory <b className="text-slate-900 font-bold">20 days (120 hours)</b> industrial training curriculum program focusing on{" "}
          <span className="text-[20px] text-blue-900 font-bold italic">
            "{convertUrlToText(courseName)}"
          </span>{" "}
          by achieving criteria of <b className="text-slate-900 font-bold">minimum 75%</b> verified work assigned during internship period.
        </p>
        
        {isPerformer && (
          <p className="text-[18px] leading-relaxed text-slate-600 px-6 max-w-[840px] mx-auto mt-2 m-0 text-justify">
            Also, the student has earned recognition as a <b className="text-slate-900 font-semibold">"Top Performer student"</b> showing dedication in the course by timely joining the internship sessions and demonstrating active participation.
          </p>
        )}
      </div>

      <div className="w-full flex justify-between items-end px-2 z-10 text-slate-500 box-border mb-12">
        {/* --- SYSTEM METADATA BLOCK (Styled with Monospace Font) --- */}
        <div className="text-left flex flex-col gap-1 border border-slate-200/80 p-3 px-4 rounded-xl shadow-sm bg-slate-50/40 text-[13px] min-w-[290px] box-border" style={{ fontFamily: 'monospace, Courier, monospace' }}>
          <p className="flex justify-between gap-2 m-0">
            <span className="text-slate-400">REGISTRATION NO:</span> 
            <span className="text-slate-900 font-bold">{user?.Username || "233112010048"}</span>
          </p>
          <p className="flex justify-between gap-2 m-0">
            <span className="text-slate-400">CERTIFICATE GENERATED ON:</span> 
            <span className="text-slate-900 font-bold">{issueDateStr}</span>
          </p>
          <p className="flex justify-between gap-2 m-0">
            <span className="text-slate-400">CREDIT VERDICT:</span> 
            <span className="font-bold text-emerald-600">{isEligible ? "CRITERIA MET (PASSED)" : "INCOMPLETE / AUDIT"}</span>
          </p>
        </div>

        {/* --- QR ASSIGNMENT CAPTION BLOCK (Styled with Monospace Font) --- */}
        <div className="flex flex-col items-center justify-center gap-1.5 translate-y-2">
          <div className="w-[98px] h-[98px] bg-white p-0.5 border border-slate-200 rounded shadow-sm flex items-center justify-center box-border">
            <img 
              src={`https://quickchart.io/qr?text=https%3A%2F%2Fatplc.in%2Fdashboard%2F${user?.id || 'verify'}%2F${courseId}&dark=1e3a8a&ecLevel=H&margin=0&size=100`} 
              alt="Verification QR"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold text-center m-0" style={{ fontFamily: 'monospace, Courier, monospace' }}>
            SCAN TO VERIFY WORK & CERTIFICATE
          </p>
        </div>

        <div className="flex text-center min-w-[240px] justify-end">
          <div className="relative flex flex-col items-center">
            <div className="w-32 h-12 absolute top-[-2rem] pointer-events-none flex items-center justify-center z-20">
              <img 
                src="/images/sign.png" 
                alt="Authorized Signature" 
                className="max-w-full max-h-full object-contain mix-blend-multiply" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <div className="w-48 border-none h-6 flex items-end justify-center font-bold text-xs pb-1" />
            <p className="text-[14px] font-black tracking-wider uppercase text-blue-950 m-0">
              AUTHORIZED SIGNATORY
            </p>
          </div>
        </div>
      </div>
      <div className="absolute bottom-6 left-6 right-6 h-12 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between px-6 z-10 box-border shadow-sm">
        
        {/* Left Side Logo: LYSS Technology */}
        <div className="w-20 h-12 flex items-center justify-center z-20 mb-2">
          <img 
            src="/images/lyss.png" 
            alt="LYSS Technology Logo" 
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Center Structured Attribution Message */}
        <div className="text-center px-4 flex-1">
          <p className="text-[14px] text-red-600 m-0 font-medium tracking-wide">
            ATPLC is an official training platform of{" "}
            <span className="text-blue-900 font-bold">LYSS Technology Pvt. Ltd., Madhubani</span>{" "}
            <span className="text-red-500 font-normal">(A DPIIT recognized startup)</span>
          </p>
        </div>

        {/* Right Side Logo: DPIIT */}
        <div className="w-36 h-24 flex items-center justify-center z-20">
          <img 
            src="/images/DPIIT-1.png" 
            alt="DPIIT Logo" 
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </div>
    </>
  );

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      
      {/* 1. VISUAL LIVE PREVIEW COMPONENT ON THE DASHBOARD (Styled explicitly with Times New Roman) */}
      <div className="w-full overflow-x-auto flex justify-start lg:justify-center p-1">
        <div className="origin-center scale-[1] my-[-40px] transition-transform duration-200">
          <div 
            ref={certificateRef}
            className="relative w-[1123px] h-[794px] p-12 select-none flex flex-col justify-between items-center flex-shrink-0 bg-white"
            style={{ fontFamily: '"Times New Roman", Times, serif', color: '#1e293b', aspectRatio: '1123 / 794' }}
          >
            {renderCertificateContent()}
          </div>
        </div>
      </div>
      
      {/* 2. DOWNLOAD ACTIONS AREA */}
      <button
        type="button"
        onClick={downloadPDF}
        disabled={isDownloading || !isCanvasReady}
        className="px-8 py-3.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 disabled:from-slate-300 disabled:to-slate-400 text-white font-bold rounded-xl text-xs tracking-wider uppercase shadow-md transition-all transform active:scale-95 flex items-center gap-2.5 border-none cursor-pointer"
      >
        {isDownloading || !isCanvasReady ? (
          <>
            <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            {!isCanvasReady ? "Baking Image Assets..." : "Compiling High-Res PDF..."}
          </>
        ) : (
          <>📥 Download Verified Certificate</>
        )}
      </button>

    </div>
  );
}