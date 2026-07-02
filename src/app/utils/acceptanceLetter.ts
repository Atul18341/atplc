import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { toast } from "react-toastify";

// Import raw Base64 assets safely
import { LETTERHEAD_BANNER_PURE_BASE64, STAMP_PURE_BASE64 } from "./assetsData";

export interface LetterData {
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

export const executeBackgroundPdfDownload = async (letterData: LetterData): Promise<void> => {
  const toastId = toast.loading("Compiling industry-standard vector PDF document...");

  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.27, 841.89]); 
    const { width, height } = page.getSize();

    const TimesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const TimesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    let bannerFinalHeight = 0;

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
      console.warn("Letterhead processing bypassed. Baseline fallback enabled.", imgError);
      bannerFinalHeight = 100; 
    }

    const contentTopY = height - bannerFinalHeight - 35;
    const marginX = 54; 
    const contentWidth = width - (marginX * 2);

    page.drawText('INTERNSHIP ACCEPTANCE LETTER', { 
      x: width / 2 - 120, 
      y: contentTopY, 
      size: 14, 
      font: TimesRomanBold, 
      color: rgb(0.12, 0.23, 0.43)
    });

    page.drawText(`Letter Ref. No.: ${letterData.letterNo || "LYSS/INT/2026/U13044"}`, { x: marginX, y: contentTopY - 35, size: 10, font: TimesRomanBold, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(`Application Date: ${letterData.date || "27 May 2026"}`, { x: width - marginX - 160, y: contentTopY - 35, size: 10, font: TimesRomanBold, color: rgb(0.2, 0.2, 0.2) });

    page.drawText('To,', { x: marginX, y: contentTopY - 70, size: 10, font: TimesRoman });
    const clientNameStr = (letterData.studentName || "Candidate").toUpperCase();
    page.drawText(clientNameStr, { x: marginX, y: contentTopY - 85, size: 11, font: TimesRomanBold });
    page.drawText(`Registration No.: ${letterData.registrationNumber || "N/A"}`, { x: marginX, y: contentTopY - 100, size: 10, font: TimesRoman, color: rgb(0.3, 0.3, 0.3) });
    const formattedInstitution = (letterData.institution || "Institution Matrix").replace(/_/g, " ");
    page.drawText(`College / Institution: ${formattedInstitution}`, { x: marginX, y: contentTopY - 115, size: 10, font: TimesRoman });

    page.drawText('Dear Candidate,', { x: marginX, y: contentTopY - 150, size: 11, font: TimesRoman });

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
      { field: "• Internship Domain", val: `: ${letterData.courseName || "Software Engineering & Cloud Architecture"}` },
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
      console.warn("Graphic seal fallback active.", sigImgError);
    }

    page.drawLine({ start: { x: marginX, y: legalFooterY + 10 }, end: { x: marginX + 180, y: legalFooterY + 10 }, thickness: 1, color: rgb(0.12, 0.23, 0.43) });
    page.drawText('Authorized Signatory', { x: marginX, y: legalFooterY - 5, size: 11, font: TimesRomanBold, color: rgb(0.1, 0.1, 0.1) });
    page.drawText('LYSS Technology Private Limited', { x: marginX, y: legalFooterY - 18, size: 10, font: TimesRoman, color: rgb(0.3, 0.3, 0.3) });

    const footerTextString = 'Regd. Office: H. No. 3/365, Lakho Binda Campus, Santu Nagar, Madhubani, Bihar - 847211, India';
    const bottomDividerY = 55;
    
    page.drawLine({ start: { x: marginX, y: bottomDividerY }, end: { x: width - marginX, y: bottomDividerY }, thickness: 0.5, color: rgb(0.8, 0.82, 0.86) });
    page.drawText(footerTextString, {
      x: width / 2 - (TimesRomanBold.widthOfTextAtSize(footerTextString, 8.5) / 2), 
      y: bottomDividerY - 15, 
      size: 8.5, 
      font: TimesRomanBold, 
      color: rgb(0.4, 0.45, 0.5)
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
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