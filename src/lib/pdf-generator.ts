/**
 * Enhanced PDF and Print Generation Engine
 */

export async function downloadResumePDF(
  elementId: string = "resume-preview",
  filename: string = "resume.pdf"
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id '${elementId}' not found.`);
    alert("Resume preview element not found. Please ensure the preview is visible.");
    return false;
  }

  try {
    const html2pdf = (await import("html2pdf.js")).default;

    const cleanFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;

    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number], // mm
      filename: cleanFilename,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: {
        scale: 2, // High-DPI crisp rendering
        useCORS: true,
        letterRendering: true,
        scrollY: 0,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait" as const,
      },
      pagebreak: {
        mode: ["avoid-all", "css", "legacy"],
      },
    };

    await html2pdf().set(opt).from(element).save();
    return true;
  } catch (error) {
    console.error("PDF_EXPORT_ERROR:", error);
    alert("An error occurred while generating your PDF. You can also try 'Print Resume' -> 'Save as PDF'.");
    return false;
  }
}

export function printResume(): void {
  if (typeof window !== "undefined") {
    window.print();
  }
}
