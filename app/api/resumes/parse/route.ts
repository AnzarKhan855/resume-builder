import { NextRequest, NextResponse } from "next/server";
import { parseResumeText } from "@/src/lib/resume-parser";
import mammoth from "mammoth";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded. Please upload a PDF or DOCX file." },
        { status: 400 }
      );
    }

    // 5MB limit
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { message: "File exceeds 5MB size limit. Please upload a smaller file." },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";

    if (fileName.endsWith(".pdf") || file.type === "application/pdf") {
      try {
        // Dynamic import pdf-parse
        const pdfModule = await import("pdf-parse");
        const pdfParse = (pdfModule as any).default || pdfModule;
        const pdfData = await (pdfParse as any)(buffer);
        extractedText = pdfData.text || "";
      } catch (pdfErr: any) {
        console.error("PDF_PARSE_ERROR:", pdfErr);
        return NextResponse.json(
          {
            message:
              "Could not extract text from this PDF file. It may be password-protected or image-scanned. Please try another file or DOCX.",
          },
          { status: 422 }
        );
      }
    } else if (
      fileName.endsWith(".docx") ||
      fileName.endsWith(".doc") ||
      file.type.includes("wordprocessingml")
    ) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || "";
      } catch (docxErr: any) {
        console.error("DOCX_PARSE_ERROR:", docxErr);
        return NextResponse.json(
          { message: "Failed to extract text from DOCX file. Please verify file integrity." },
          { status: 422 }
        );
      }
    } else {
      return NextResponse.json(
        { message: "Unsupported file format. Please upload a .pdf or .docx document." },
        { status: 400 }
      );
    }

    if (!extractedText.trim() || extractedText.trim().length < 30) {
      return NextResponse.json(
        {
          message:
            "We couldn't extract enough readable text from this document. It might be an image scan. You can create a resume from scratch or try another file.",
        },
        { status: 422 }
      );
    }

    const parsedData = parseResumeText(extractedText);

    return NextResponse.json({
      message: "Resume imported and parsed successfully",
      data: parsedData,
      rawTextPreview: extractedText.substring(0, 300) + "...",
    });
  } catch (error: any) {
    console.error("PARSE_API_ERROR:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to process resume file" },
      { status: 500 }
    );
  }
}
