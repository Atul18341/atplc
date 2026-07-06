'use client';

import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { toast } from "react-toastify";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../Context/AuthContext";

import CourseCard from "../components/CourseCard/CourseCard";
//import Loader from "../components/Loader/";
import Button from "../components/Button";

// Import your raw Base64 static text string assets natively
import { LETTERHEAD_BANNER_PURE_BASE64, STAMP_PURE_BASE64 } from "./assetsData";

// --- STRUCTURAL TYPING SCHEMAS ---

interface Course {
  Courses_id: string | number;
  Courses__Course_Name: string;
  Courses_Completed: boolean;
  Courses__Course_Thumbnail: string;
}

interface LetterPayload {
  letterNo?: string;
  date?: string;
  studentName?: string;
  registrationNumber?: string;
  institution?: string;
  courseName?: string;
  durationHours?: string;
  mode?: string;
  stipend?: string;
  startDate?: string;
}

const BACKEND_PATH = process.env.NEXT_PUBLIC_BACKEND_PATH || "";

// =========================================================================
// 💡 ZERO-FETCH INSTANT VECTOR PDF GENERATOR
// =========================================================================
const executeBackgroundPdfDownload = async (letterData: LetterPayload): Promise<void> => {
  const toastId = toast.loading("Compiling industry-standard vector PDF document...");

  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.27, 841.89]); // Standard A4 Dimensions (Points)
    const { width, height } = page.getSize();

    const TimesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const TimesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    let bannerFinalHeight = 0;

    // EMBED LETTERHEAD BANNER
    try {
      const cleanBannerBase64 = LETTERHEAD_BANNER_PURE_BASE64.replace(/\s/g, "");
      const letterheadImage = await pdfDoc.embedPng(cleanBannerBase64);
      const imageWidth = width; 
      bannerFinalHeight = (letterheadImage.height / letterheadImage.width) * imageWidth;

      page.drawImage(letterheadImage, {
        x: 0,                  
        y: height - bannerFinalHeight, 
        width: imageWidth,              
        height: bannerFinalHeight,
      });
    } catch (imgError) {
      console.warn("Letterhead header processing bypassed. Standard baseline fallback enabled.", imgError);
      bannerFinalHeight = 100; 
    }

    // DOCUMENT CONTENT LAYOUT
    const contentTopY = height - bannerFinalHeight - 35;
    const marginX = 54; // Standard professional 0.75 in margins
    const contentWidth = width - (marginX * 2);

    // Document Title Heading
    page.drawText('INTERNSHIP ACCEPTANCE LETTER', { 
      x: width / 2 - 120, 
      y: contentTopY, 
      size: 14, 
      font: TimesRomanBold, 
      color: rgb(0.12, 0.23, 0.43)
    });

    // Reference Details Meta Row
    page.drawText(`Letter Ref. No.: ${letterData.letterNo || "LYSS/INT/2026/U13044"}`, { x: marginX, y: contentTopY - 35, size: 10, font: TimesRomanBold, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(`Application Date: ${letterData.date || "27 May 2026"}`, { x: width - marginX - 160, y: contentTopY - 35, size: 10, font: TimesRomanBold, color: rgb(0.2, 0.2, 0.2) });

    // Recipient Meta Address
    page.drawText('To,', { x: marginX, y: contentTopY - 70, size: 10, font: TimesRoman });
    
    const clientNameStr = (letterData.studentName || "Candidate Learner").toUpperCase();
    page.drawText(clientNameStr, { x: marginX, y: contentTopY - 85, size: 11, font: TimesRomanBold });
    page.drawText(`Registration No.: ${letterData.registrationNumber || "N/A"}`, { x: marginX, y: contentTopY - 100, size: 10, font: TimesRoman, color: rgb(0.3, 0.3, 0.3) });
    
    const formattedInstitution = (letterData.institution || "Registered Institution").replace(/_/g, " ");
    page.drawText(`College / Institution: ${formattedInstitution}`, { x: marginX, y: contentTopY - 115, size: 10, font: TimesRoman });

    // Salutation
    page.drawText('Dear Candidate,', { x: marginX, y: contentTopY - 150, size: 11, font: TimesRoman });

    // Introductory Content Paragraph
    const openingParagraphText = `We are pleased to accept your application and formally offer you an internship engagement at our organization. Our organization satisfies all core developmental requirements framework provisions aligned in accordance with the university's standard Internship Guidelines for Undergraduate Programmes.`;

    const drawWrappedTextParagraph = (text: string, startY: number, font: any, size: number, lineGap = 16) => {
      const words = text.split(' ');
      let currentLine = '';
      let currentY = startY;

      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine + words[i] + ' ';
        const textWidth = font.widthOfTextAtSize(testLine, size);
        if (textWidth > contentWidth && i > 0) {
          page.drawText(currentLine.trim(), { x: marginX, y: currentY, size: size, font: font, color: rgb(0.15, 0.15, 0.15) });
          currentLine = words[i] + ' ';
          currentY -= lineGap;
        } else {
          currentLine = testLine;
        }
      }
      page.drawText(currentLine.trim(), { x: marginX, y: currentY, size: size, font: font, color: rgb(0.15, 0.15, 0.15) });
      return currentY - (lineGap * 1.5);
    };

    let postParaY = drawWrappedTextParagraph(openingParagraphText, contentTopY - 175, TimesRoman, 10.5, 17);

    // PARAMETERS SPECIFICATION TABLE
    const tableTopY = postParaY - 10;
    const tableHeight = 110;
    const rowHeight = 22;

    page.drawRectangle({
      x: marginX,
      y: tableTopY - tableHeight,
      width: contentWidth,
      height: tableHeight,
      color: rgb(0.97, 0.98, 1.0), 
      borderColor: rgb(0.85, 0.88, 0.93),
      borderWidth: 1,
    });

    const metricsPayload = [
      { field: "• Internship Domain", val: `: ${letterData.courseName || "Software Engineering & IT Solutions"}` },
      { field: "• Expected Duration", val: `: ${letterData.durationHours || "120 Hours Total Engagement"}` },
      { field: "• Engagement Mode", val: `: ${letterData.mode || "Online / Remote Platform"}` },
      { field: "• Stipend Provisions", val: `: ${letterData.stipend || "Unpaid / Academic Credit Aligned"}` },
      { field: "• Scheduled Commencement", val: `: ${letterData.startDate || "1 June 2026"}` }
    ];

    metricsPayload.forEach((row, idx) => {
      const rowY = tableTopY - 20 - (idx * rowHeight);
      page.drawText(row.field, { x: marginX + 15, y: rowY, size: 10, font: TimesRomanBold, color: rgb(0.2, 0.25, 0.35) });
      page.drawText(row.val, { x: marginX + 180, y: rowY, size: 10, font: TimesRoman, color: rgb(0.1, 0.1, 0.1) });
    });

    const closingParaText = `During this program, you will be expected to maintain professional consistency, adherence to timeline parameters, and submit comprehensive execution updates as directed by your technical mentor. We appreciate your focus and look forward to a mutually productive learning engagement.`;
    
    let baseClosingY = tableTopY - tableHeight - 25;
    let finalBodyTextY = drawWrappedTextParagraph(closingParaText, baseClosingY, TimesRoman, 10.5, 17);

    page.drawText('Thank you.', { x: marginX, y: finalBodyTextY - 10, size: 10.5, font: TimesRoman });
    page.drawText('Yours faithfully,', { x: marginX, y: finalBodyTextY - 25, size: 10.5, font: TimesRoman });

    // AUTHORIZED SIGNATURE SEAL STAMP BLOCK
    const legalFooterY = 120; 

    try {
      const cleanStampBase64 = STAMP_PURE_BASE64.replace(/\s/g, "");
      const signatureImage = await pdfDoc.embedPng(cleanStampBase64);
      const stampWidth = 90;
      const stampHeight = (signatureImage.height / signatureImage.width) * stampWidth;

      page.drawImage(signatureImage, {
        x: marginX + 20,
        y: legalFooterY + 15, 
        width: stampWidth,
        height: stampHeight,
      });
    } catch (sigImgError) {
      console.warn("Graphic authorized execution seal rendering fallback active.", sigImgError);
    }

    page.drawLine({
      start: { x: marginX, y: legalFooterY + 10 },
      end: { x: marginX + 180, y: legalFooterY + 10 },
      thickness: 1,
      color: rgb(0.12, 0.23, 0.43)
    });

    page.drawText('Authorized Signatory', { x: marginX, y: legalFooterY - 5, size: 11, font: TimesRomanBold, color: rgb(0.1, 0.1, 0.1) });
    page.drawText('LYSS Technology Private Limited', { x: marginX, y: legalFooterY - 18, size: 10, font: TimesRoman, color: rgb(0.3, 0.3, 0.3) });

    // GLOBAL COMPLIANCE INFRASTRUCTURE FOOTER
    const footerTextString = 'Regd. Office: H. No. 3/365, Lakho Binda Campus, Santu Nagar, Madhubani, Bihar - 847211, India';
    const bottomDividerY = 55;
    
    page.drawLine({ 
      start: { x: marginX, y: bottomDividerY }, 
      end: { x: width - marginX, y: bottomDividerY }, 
      thickness: 0.5, 
      color: rgb(0.8, 0.82, 0.86) 
    });
    
    page.drawText(footerTextString, {
      x: width / 2 - (TimesRomanBold.widthOfTextAtSize(footerTextString, 8.5) / 2), 
      y: bottomDividerY - 15, 
      size: 8.5, 
      font: TimesRomanBold, 
      color: rgb(0.4, 0.45, 0.5)
    });

    const pdfBytes = await pdfDoc.save();

    const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
    const downloadUrl = URL.createObjectURL(blob);
    const linkAnchor = document.createElement('a');
    linkAnchor.href = downloadUrl;
    linkAnchor.download = `Acceptance_Letter_${letterData.studentName || "Candidate"}.pdf`;
    
    document.body.appendChild(linkAnchor);
    linkAnchor.click();
    
    document.body.removeChild(linkAnchor);
    URL.revokeObjectURL(downloadUrl);

    toast.update(toastId, { render: "Professional PDF generated and downloaded!", type: "success", isLoading: false, autoClose: 3000 });
  } catch (error) {
    console.error("PDF generation compilation issue:", error);
    toast.update(toastId, { render: "Error building crisp vector document.", type: "error", isLoading: false, autoClose: 3000 });
  }
};

export default function Courses() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeProcessingId, setActiveProcessingId] = useState<string | number | null>(null); 
  const router = useRouter();
  const { user, loading, getEnrolledCourses } = useAuth(); // Retained your context typo specification hook match 

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    try {
      setIsLoading(true);
      if (!loading && !user?.id) {
        router.replace("/login");
      }
      if (!loading && user?.id && !user?.courses) {
        getEnrolledCourses();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.response || err.response?.data?.message || err.message;
      toast.error(errorMessage);
      router.replace("/error");
    } finally {
      setIsLoading(false);
    }
  }, [router, user?.id, loading, user?.courses, getEnrolledCourses]);

  const handleInitiateDownloadFlow = useCallback(async (course: Course) => {
    if (!user?.id || activeProcessingId) return;
    
    setActiveProcessingId(course.Courses_id); 
    try {
      const token = localStorage.getItem('student_auth_token');
      
      const response = await axios.get(`${BACKEND_PATH}/acceptance-letter/`, {
        params: { user_id: user.id },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data && response.data.success) {
        const payloadData: LetterPayload = response.data.data;
        payloadData.courseName = course.Courses__Course_Name || payloadData.courseName;

        await executeBackgroundPdfDownload(payloadData);
      } else {
        throw new Error("Target validation sequence rejected by server registry mappings.");
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Failed to pull document authorizations.";
      toast.error(errorMessage);
    } finally {
      setActiveProcessingId(null); 
    }
  }, [user?.id, activeProcessingId]);

  const courseCards = useMemo(() => {
    if (user?.courses?.length) {
      return user.courses.map((course: Course) => {
        const isThisCardCompiling = activeProcessingId === course.Courses_id;
        
        return (
          <div key={course.Courses_id} className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
            <CourseCard
              enrolled={true}
              id={course.Courses_id}
              courseName={course.Courses__Course_Name}
              courseDuration={''}
              courseCompletionStatus={course.Courses_Completed}
              coverImage={
                course.Courses__Course_Thumbnail.startsWith("/media")
                  ? course.Courses__Course_Thumbnail
                  : "/media/" + course.Courses__Course_Thumbnail
              }
              coursePrice={null}
              courseTechnologies={null}
            />
            
            <div className="p-4 pt-0 mt-auto">
              <button 
                onClick={() => handleInitiateDownloadFlow(course)}
                disabled={activeProcessingId !== null}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
                style={{ 
                  backgroundColor: isThisCardCompiling ? '#64748b' : activeProcessingId !== null ? '#cbd5e1' : '#10b981',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {isThisCardCompiling ? "Compiling PDF..." : "Download Acceptance Letter"}
              </button>
            </div>
          </div>
        );
      });
    } else {
      return (
        <div className="col-span-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-dashed border-slate-300">
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Courses Found</h2>
          <p className="text-sm text-slate-500 mb-6">Please enroll in a training curriculum course program to view your workspace here.</p>
          <Link href="/courses">
            <Button label="Enroll Now" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 py-2.5" />
          </Link>
        </div>
      );
    }
  }, [user?.courses, activeProcessingId, handleInitiateDownloadFlow]);

  return (
    <section className="min-h-screen w-full bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">
            My Courses
          </h3>
        </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courseCards}
          </div>
      
      </div>
    </section>
  );
}