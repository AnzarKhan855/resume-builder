import { NextRequest, NextResponse } from "next/server";
import { parseResumeText } from "@/src/lib/resume-parser";
import mammoth from "mammoth";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded. Please select a PDF or DOCX resume to import." },
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

    const fileName = (file.name || "").toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";

    // 1. PDF Parsing
    if (fileName.endsWith(".pdf") || file.type === "application/pdf") {
      try {
        const { PDFParse } = await import("pdf-parse");
        const parser = new PDFParse({ data: buffer });
        try {
          const textResult = await parser.getText();
          extractedText = (textResult?.text || "").trim();
        } finally {
          await parser.destroy();
        }

        // Strip page marker artifacts like "-- 1 of 2 --" to accurately assess real text content
        const cleanedText = extractedText.replace(/--\s*\d+\s*of\s*\d+\s*--/gi, "").trim();

        if (!cleanedText || cleanedText.length < 30) {
          return NextResponse.json(
            {
              isScanned: true,
              message:
                "This PDF appears to be an image scan or flattened graphical document without selectable text. Antigravity requires text-based PDFs or Word documents to accurately extract your data.",
              suggestion: "You can upload a Word (.docx) file or start with one of our ATS-optimized templates from scratch.",
            },
            { status: 422 }
          );
        }

        extractedText = cleanedText;
      } catch (pdfErr: any) {
        console.error("PDF_PARSE_ERROR:", pdfErr);
        return NextResponse.json(
          {
            isScanned: false,
            message:
              "Could not read this PDF document. The file may be password-protected or corrupted. Please try saving it again or upload a DOCX file.",
            errorDetail: pdfErr?.message || "PDF decoding failed",
          },
          { status: 422 }
        );
      }
    }
    // 2. DOCX Parsing
    else if (
      fileName.endsWith(".docx") ||
      fileName.endsWith(".doc") ||
      file.type.includes("wordprocessingml")
    ) {
      // Validate DOCX Magic Bytes (PK\x03\x04 = 0x50, 0x4b, 0x03, 0x04)
      if (
        buffer.length < 4 ||
        buffer[0] !== 0x50 ||
        buffer[1] !== 0x4b ||
        buffer[2] !== 0x03 ||
        buffer[3] !== 0x04
      ) {
        return NextResponse.json(
          {
            message: "The uploaded file does not have valid DOCX format headers. It may be an unsupported legacy binary DOC or corrupted file.",
          },
          { status: 422 }
        );
      }

      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = (result.value || "").trim();

        if (!extractedText || extractedText.length < 30) {
          return NextResponse.json(
            {
              isScanned: true,
              message:
                "We could not extract readable text from this Word document. It may contain embedded images rather than text.",
              suggestion: "Please check the document content or create your resume using our ATS templates.",
            },
            { status: 422 }
          );
        }
      } catch (docxErr: any) {
        console.error("DOCX_PARSE_ERROR:", docxErr);
        return NextResponse.json(
          {
            message: "Failed to extract text from DOCX file. Please verify the document integrity.",
            errorDetail: docxErr?.message,
          },
          { status: 422 }
        );
      }
    } else {
      return NextResponse.json(
        { message: "Unsupported file format. Please upload a .pdf or .docx document." },
        { status: 400 }
      );
    }

    // 3. Layered parsing and confidence scoring
    const parsedData = parseResumeText(extractedText);

    return NextResponse.json({
      message: "Resume imported and parsed successfully",
      data: parsedData,
      confidence: parsedData.confidence,
      sectionsDetected: parsedData.sectionsDetected,
      rawTextPreview: extractedText.substring(0, 350) + "...",
    });
  } catch (error: any) {
    console.error("PARSE_API_ERROR:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to process resume file" },
      { status: 500 }
    );
  }
}
