'use client';

import axios, { AxiosResponse } from "axios";
import React, { useState, useRef, useEffect } from "react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Button from "./Button";
import "./Certificate.css";
import { useAuth } from "../Context/AuthContext";
import { toast } from "react-toastify";
import { useApp } from "../Context/AppContext";
import { convertUrlToText } from "../lib/utils";

// Define strict prop validations for the component
interface CertificateProps {
  completedTask: number;
  totalTask: number;
  courseName: string;
  courseId: string | number;
}

// Define shapes for the API verification response layers
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
  const [certificateURI, setCertificateURI] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [certScale, setCertScale] = useState<number>(1);
  const [isCanvasReady, setIsCanvasReady] = useState<boolean>(false); // Safety Lock State
  const { user } = useAuth();
  const { getCourses } = useApp();
  const [isPerformer, setIsPerformer] = useState<boolean>(false);
 
  const certificateRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Compute tasks validation eligibility metrics (75% threshold constraint)
  const executionPercentage = totalTask > 0 ? (completedTask / totalTask) * 100 : 0;
  const isEligible = executionPercentage >= 75;
  
  // Calculate dynamic scaling fractions so preview adapts flawlessly to small screens
  useEffect(() => {
    if (!certificateURI || !containerRef.current) return;
    
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const baseA4Width = 1123;
        if (containerWidth < baseA4Width) {
          setCertScale((containerWidth - 24) / baseA4Width);
        } else {
          setCertScale(1);
        }
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [certificateURI]);

  // ASYNC ASSET WATCHER: Tracks resource loading states to unleash the download lock safely
  useEffect(() => {
    if (!certificateURI || !certificateRef.current) {
      setIsCanvasReady(false);
      return;
    }

    let isMounted = true;

    const verifyCanvasAssets = async () => {
      try {
        // 1. Wait until web fonts are completely parsed and active in the DOM layout
        if (typeof document !== 'undefined' && document.fonts) {
          await document.fonts.ready;
        }

        // 2. Locate and check the completion status of all interior image files safely
        if (certificateRef.current) {
          const images = certificateRef.current.querySelectorAll('img');
          const imagePromises = Array.from(images).map((img: HTMLImageElement) => {
            if (img.complete) return Promise.resolve();
            return new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => resolve(); // Fail-safes fallback blocks smoothly
            });
          });
          await Promise.all(imagePromises);
        }

        // 3. A 200ms settling delay giving the style engine time to calculate font layout boxes
        await new Promise((resolve) => setTimeout(resolve, 200));

        if (isMounted) {
          setIsCanvasReady(true);
        }
      } catch (err) {
        console.error("Resource pipeline verification fault:", err);
      }
    };

    verifyCanvasAssets();
    return () => { isMounted = false; };
  }, [certificateURI, isPerformer]); // Re-evaluates tracking loops if the performer badge loads late
  
  useEffect(() => {
    if (loading || !user?.id) return;
    checkPerformerStatus(user.id);
  }, [user?.id]);

  const checkPerformerStatus = async (userId: string | number): Promise<void> => {
    try {
      const response = await axios.post<TopPerformerResponse>('https://atplc20.pythonanywhere.com/top-performers-check/', {
        Username: userId
      });
      if (response.status === 200 && response.data?.Response?.[0]) {
        setIsPerformer(response.data.Response[0].top_performer);
      }
    } catch (error) {
      console.error("Failed to authenticate performer metrics baseline:", error);
    }
  };

  const generateCertificate = async (): Promise<void> => {
    try {
      setLoading(true);
      if (!user?.id) {
        setLoading(false);
        toast.error("User authentication context not found.");
        return;
      }

      const College_Name = user?.College_Name;
      if (!College_Name) {
        setLoading(false);
        toast.error("Please update your college name in the profile section to generate your certificate.");
        return;
      }

      if (!user?.courses) await getCourses();
      await checkPerformerStatus(user.id);

      setTimeout(() => {
        setCertificateURI("active");
        setLoading(false);
        toast.success("Certificate viewport loaded successfully.");
      }, 300);

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Exception processing certification parameters");
      setLoading(false);
    }
  };

  const downloadPDF = async (): Promise<void> => {
    const element = certificateRef.current;
    if (!element || !isCanvasReady) return; 

    setLoading(true);

    try {
      // html2canvas uses the pre-warmed cache instantly
      const canvas = await html2canvas(element, {
        scale: 2, // 2x density factor preserves vector-equivalent clarity on text strings
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.85);
      
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
      console.error("PDF Compiling Fault:", error);
      toast.error("An error occurred during high-res file compiling rendering.");
    } finally {
      setLoading(false);
    }
  };

  const adjustedCertBoxHeight = 794 * certScale;
  const issueDateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <section className="certificate-section">
      <div className="section-heading">
        <h4>Training Certificate Workspace</h4>
      </div>
      
      <div className="section-body">
        <div className="certificate-criteria">
          <p>You must submit at least <span>75%</span> of tasks to be eligible for your verified completion certificate.</p>
          <p>Once met, your institutional credentials will build automatically with secure verification features enabled.</p>
        </div>

        <div className="current-percentage">
          <p>
            Current Progress Evaluation ={" "}
            <span style={{ 
              backgroundColor: isEligible ? "#d1fae5" : "#ffe4e6", 
              color: isEligible ? "#065f46" : "#9f1239" 
            }}>
              {executionPercentage.toFixed(2)}%
            </span>
          </p>
        </div>

        {/* OPERATIONS CONTROLLER TRIGGER BAR */}
        <div className="certificate-download">
          {!certificateURI ? (
            <Button
              icon="fi fi-rr-template"
              label={isEligible ? "Generate Verified Certificate" : "Generate Dummy Preview Certificate"}
              onClick={generateCertificate}
              isLoading={loading}
            />
          ) : (
            <Button
              icon={isCanvasReady ? "fi fi-rr-download" : "fi fi-rr-spinner animation-spin"}
              label={!isCanvasReady ? "Baking Assets..." : isEligible ? "Download Official PDF" : "Download Dummy Blueprint Sample"}
              onClick={downloadPDF}
              isLoading={loading || !isCanvasReady} // Disables interaction until fully loaded
            />
          )}
        </div>

        {/* --- EXPANDED LIVE RENDER SUCCESS LAYER VIEWPORT --- */}
        {certificateURI && (
          <div style={{ marginTop: "1.5rem", textAlign: "center", display: "flex", flexDirection: "column", gap: "1rem" }}>
            
            <div style={{ 
              padding: "0.75rem", 
              border: "1px solid", 
              borderRadius: "0.75rem", 
              fontSize: "0.75rem", 
              fontWeight: "600", 
              maxWidth: "42rem", 
              margin: "0 auto",
              backgroundColor: isEligible ? "#ecfdf5" : "#fffbeb",
              borderColor: isEligible ? "#a7f3d0" : "#fde68a",
              color: isEligible ? "#065f46" : "#92400e"
            }}>
              {isEligible 
                ? "🎉 Secure Verification Match Verified! Your high-res document structure has compiled cleanly." 
                : "⚠️ Sample Blueprint Mode: Document will lock signatures and display cross-watermarks until the 75% goal post is hit."}
            </div>

            {/* THE AUTO-SCALE PREVIEW ENGINE BOX */}
            <div 
              ref={containerRef}
              style={{ 
                width: "100%", 
                backgroundColor: "rgba(226, 232, 240, 0.6)", 
                border: "1px solid rgba(203, 213, 225, 0.4)", 
                borderRadius: "1rem", 
                padding: "0.75rem", 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                overflow: "hidden", 
                boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
                transition: "all 0.3s ease",
                height: `${adjustedCertBoxHeight + 24}px`
              }}
            >
              <div 
                style={{
                  position: "relative",
                  flexShrink: 0,
                  transformOrigin: "top",
                  userSelect: "none",
                  width: "1123px",
                  height: "794px",
                  transform: `scale(${certScale})`,
                  transition: "transform 0.05s linear"
                }}
              >
                
                {/* --- COMPONENT CANVAS AREA --- */}
                <div 
                  ref={certificateRef}
                  style={{ 
                    position: "relative",
                    width: "1123px", 
                    height: "794px", 
                    padding: "4rem", 
                    display: "flex", 
                    flexDirection: "column", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    backgroundColor: "#ffffff",
                    fontFamily: "serif", 
                    color: "#1e293b" 
                  }}
                >
                  {/* Outer Frame Borders */}
                  <div style={{ position: "absolute", top: "1rem", bottom: "1rem", left: "1rem", right: "1rem", border: "4px solid #1e3a8a", pointerEvents: "none" }} />
                  <div style={{ position: "absolute", top: "1.5rem", bottom: "1.5rem", left: "1.5rem", right: "1.5rem", border: "1px solid rgba(30, 58, 138, 0.2)", pointerEvents: "none" }} />
                  
                  {/* Dynamic Adaptive Watermark Layer */}
                  <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.02, pointerEvents: "none", zIndex: 0 }}>
                    <span style={{ fontSize: "120px", fontWeight: "900", letterSpacing: "0.1em", border: "8px solid #1e3a8a", padding: "0.5rem 2rem", transform: "rotate(12deg)", whiteSpace: "nowrap" }}>
                      {isEligible ? "ATPLC VERIFIED" : "UNOFFICIAL BLANK SAMPLE"}
                    </span>
                  </div>

                  {/* HEADER BLOCK */}
                  <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.5rem", padding: "0 1.5rem", zIndex: 10 }}>
                    <div style={{ width: "10rem", height: "10rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0.25rem", borderRadius: "0.5rem", flexShrink: 0 }}>
                      <img 
                        src="/images/atplc_logo.png"
                        alt="ATPLC Logo" 
                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                      />
                    </div>
                    <div style={{ textAlign: "center", flex: 1 }}>
                      <h1 style={{ fontSize: "2.8rem", fontWeight: "900", letterSpacing: "0.025em", textTransform: "uppercase", color: "#1e3a8a", marginBottom: 5 }}>
                        A TECHNICAL & PRACTICAL LEARNING CLUB 
                      </h1>
                      <p style={{ fontSize: "1.3rem", letterSpacing: "0.05em", fontFamily: "sans-serif", fontWeight: "700", textTransform: "uppercase", color: "#FF0000", marginTop: "1rem", marginBottom: 0 }}>
                        (MSME registered & AICTE official Internship partner platform) 
                      </p>
                      <div style={{ width: "100%", height: "2px", marginTop: "0.5rem", backgroundColor: "#1e3a8a" }} />
                    </div>

                    {/* Branding Emblems */}
                    <div style={{ width: "8rem", height: "8rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0.25rem", borderRadius: "0.5rem", flexShrink: 0 }}>
                      <img 
                        src="/images/msme.png" 
                        alt="MSME Seal" 
                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                      />
                    </div>
                    <div style={{ width: "8rem", height: "8rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0.25rem", borderRadius: "0.5rem", flexShrink: 0 }}>
                      <img 
                        src="/images/aicte.png" 
                        alt="AICTE Seal" 
                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                      />
                    </div>
                  </div>

                  {/* STATEMENT BODY INTRO LAYOUT */}
                  <div style={{ textAlign: "center", maxWidth: "82rem", zIndex: 10, marginTop: "0.5rem", width: "100%" }}>
                    <h2 style={{ fontSize: "3rem", fontFamily: "serif", fontStyle: "italic", fontWeight: "700", margin: "2rem 0", letterSpacing: "0.025em", textTransform: "uppercase", color: "#1e3a8a" }}>
                      Certificate of Completion
                    </h2>
                    
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", position: "relative" }}>
                      <p style={{ fontSize: "2rem", fontFamily: "sans-serif", letterSpacing: "0.025em", fontWeight: "500", color: "#64748b", margin: 0 }}>
                        This is to officially certify that
                      </p>

                      {isPerformer && (
                        <div style={{ position: "relative", width: "0px", height: "0px" }}>
                          <div style={{
                            position: "absolute",
                            top: "-3.75rem",
                            left: "20rem",
                            width: "12rem",
                            height: "12rem",
                            filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.12))",
                            zIndex: 40
                          }}>
                            <img 
                              src="/images/top-performer-seal.png" 
                              alt="Top Performer Gold Seal" 
                              style={{ width: "100%", height: "100%", objectFit: "contain" }} 
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ padding: "0.5rem 0", borderBottom: "2px dotted rgba(30, 58, 138, 0.3)", maxWidth: "42rem", margin: "1.5rem auto 0 auto" }}>
                      <span style={{ fontSize: "3rem", fontWeight: "900", letterSpacing: "0.025em", fontFamily: "serif", color: "#0f172a" }}>
                        {user?.Name || "Student Learner"}
                      </span>
                    </div>
                    
                    <p style={{ fontSize: "2rem", fontFamily: "sans-serif", letterSpacing: "0.025em", fontWeight: "500", color: "#64748b", marginTop: "1rem", marginBottom: 0 }}>
                      of <span style={{ fontWeight: "700", color: "#0f172a" }}>{user?.College_Name || "Registered Institution"}</span>
                    </p>

                    <p style={{ fontSize: "1.5rem", fontFamily: "sans-serif", lineHeight: "2", textAlign: "justify", fontWeight: "500", color: "#334155", padding: "0 1.5rem", marginTop: "1.5rem" }}>
                      has successfully completed the mandatory <b>20 days (120 hours)</b> industrial training curriculum program focusing on <b style={{ fontSize: "2rem", color: "#1e3a8a", fontStyle: "italic" }}>"{convertUrlToText(courseName)}"</b> by achieving criteria of <b>minimum 75%</b> verified work assigned during internship period.
                    </p>
                    
                    {isPerformer ? (
                      <p style={{ fontSize: "1.5rem", fontFamily: "sans-serif", lineHeight: "2", textAlign: "justify", fontWeight: "500", color: "#334155", padding: "0 1.5rem", marginTop: "1rem" }}>
                        Also, the student has earned recognition as a <b>"Top Performer student"</b> showing dedication in the course by timely joining the internship sessions, showing active participation in lab environments, and confidently answering questions during evaluation checkpoints.
                      </p>
                    ) : (
                      <div style={{ height: "4rem" }}></div>
                    )}
                  </div>

                  {/* DATA RECORD MATRICES AND SIGNATURE FOOTER */}
                  <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 1.5rem", marginBottom: "1rem", zIndex: 10, fontFamily: "sans-serif", fontSize: "1.2rem", fontWeight: "600", color: "#64748b" }}>
                    
                    <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: "0.25rem", fontFamily: "monospace", border: "1px solid #e2e8f0", padding: "0.75rem", borderRadius: "0.75rem", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", backgroundColor: "#f8fafc" }}>
                      <p><span style={{ color: '#94a3b8' }}>REGISTRATION NO:</span> <span style={{ color: '#0f172a', fontWeight: "700" }}>{user?.Username || "N/A"}</span></p>
                      <p><span style={{ color: '#94a3b8' }}>CERTIFICATE GENERATED ON:</span> <span style={{ color: '#0f172a', fontWeight: "700" }}>{issueDateStr}</span></p>
                      <p><span style={{ color: '#94a3b8' }}>CREDIT VERDICT:</span> <span style={{ fontWeight: "700", color: isEligible ? "#059669" : "#b45309" }}>{isEligible ? "CRITERIA MET (PASSED)" : "DUMMY PREVIEW MODAL"}</span></p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.25rem" }}>
                      {isEligible ? (
                        <div style={{ width: "8rem", height: "8rem", backgroundColor: "#ffffff", padding: "0.25rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <img 
                            src={`https://quickchart.io/qr?text=https%3A%2F%2Fatplc.in%2Fdashboard%2F${user?.id || 'verify'}%2F${courseId}&dark=1e3a8a&ecLevel=H&margin=0&size=80`} 
                            alt="Verification QR"
                            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                          />
                        </div>
                      ) : (
                        <div style={{ width: "5rem", height: "5rem", backgroundColor: "#f1f5f9", border: "1px dashed #cbd5e1", borderRadius: "0.5rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0.25rem", fontSize: "8px", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", lineHeight: "1.2", userSelect: "none" }}>
                          <span>QR Code</span>
                          <span>Locked</span>
                        </div>
                      )}
                      <p style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", fontWeight: "700", fontFamily: "monospace", marginTop: "0.125rem", marginBottom: 0 }}>Scan to Verify work</p>
                    </div>

                    <div style={{ display: "flex", gap: "3rem", textAlign: "center" }}>
                      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                        {isEligible && (
                          <div style={{ width: "10rem", height: "5rem", position: "absolute", top: "-2rem", pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20 }}>
                            <img 
                              src="/images/sign.png" 
                              alt="Authorized Signature" 
                              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", mixBlendMode: "multiply" }}
                            />
                          </div>
                        )}
                        <div style={{ width: "9rem", borderBottom: "1px solid #cbd5e1", height: "2.5rem", display: "flex", alignItems: "flex-end", justifyContent: "center", fontFamily: "serif", fontWeight: "700", fontSize: "0.75rem", paddingBottom: "0.25rem" }}>
                          {!isEligible && <span style={{ fontSize: "10px", color: "#f43f5e", fontFamily: "sans-serif", textTransform: "uppercase", fontWeight: "900", letterSpacing: "-0.05em", opacity: 0.6 }}>Locked Blueprint</span>}
                        </div>
                        <p style={{ fontSize: "15px", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: "900", color: "#1e3a8a", margin: 0 }}>Authorized Signatory</p>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            </div>

          </div>
        )}
      </div>
    </section>
  );
}