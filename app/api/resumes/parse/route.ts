import { NextRequest, NextResponse } from "next/server";
import { parseResumeText, mergeAiParsedData } from "@/src/lib/resume-parser";
import mammoth from "mammoth";

export const runtime = "nodejs";

function isPdfBuffer(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  // Check within first 1024 bytes for %PDF (PDF 1.0-2.0 spec)
  const headerSlice = buffer.subarray(0, Math.min(buffer.length, 1024));
  return headerSlice.includes(Buffer.from("%PDF"));
}

function isDocxBuffer(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  // PK\x03\x04 zip archive header
  return (
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04
  );
}

export async function POST(req: NextRequest) {
  try {
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        {
          error: "INVALID_FILE",
          message: "Malformed request. Please upload a multipart/form-data payload with a 'file' field.",
        },
        { status: 400 }
      );
    }

    const file = formData.get("file") as File | null;

    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        {
          error: !file ? "MISSING_FILE" : "EMPTY_FILE",
          message: !file
            ? "No file uploaded. Please select a PDF or DOCX resume to import."
            : "The uploaded file is empty. Please upload a valid resume.",
        },
        { status: 400 }
      );
    }

    // 5MB limit
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          error: "FILE_TOO_LARGE",
          message: "File exceeds 5MB size limit. Please upload a smaller file.",
        },
        { status: 400 }
      );
    }

    const fileName = (file.name || "").toLowerCase();
    const fileType = (file.type || "").toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      return NextResponse.json(
        {
          error: "EMPTY_FILE",
          message: "The uploaded file contains no data.",
        },
        { status: 400 }
      );
    }

    let extractedText = "";

    const isPdf =
      fileName.endsWith(".pdf") ||
      fileType === "application/pdf" ||
      fileType === "application/x-pdf" ||
      isPdfBuffer(buffer);

    const isDocx =
      fileName.endsWith(".docx") ||
      fileName.endsWith(".doc") ||
      fileType.includes("wordprocessingml") ||
      isDocxBuffer(buffer);

    // 1. PDF Parsing (Server-Safe via unpdf)
    if (isPdf) {
      // Validate magic bytes
      if (!isPdfBuffer(buffer)) {
        return NextResponse.json(
          {
            error: "PDF_CORRUPTED",
            isScanned: false,
            message: "This PDF appears to be corrupted or is not a valid PDF document.",
          },
          { status: 422 }
        );
      }

      try {
        const { extractText } = await import("unpdf");
        const result = await extractText(new Uint8Array(buffer), { mergePages: true });
        extractedText = (result?.text || "").trim();

        // Strip page marker artifacts like "-- 1 of 2 --" to accurately assess real text content
        const cleanedText = extractedText.replace(/--\s*\d+\s*of\s*\d+\s*--/gi, "").trim();

        if (!cleanedText || cleanedText.length < 30) {
          return NextResponse.json(
            {
              error: "PDF_SCANNED",
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
        console.error("PDF_PARSE_ERROR:", pdfErr?.message || pdfErr);

        const errMsg = String(pdfErr?.message || "").toLowerCase();
        const errName = String(pdfErr?.name || "");

        // Distinguish password protected / encrypted
        if (
          errName === "PasswordException" ||
          errMsg.includes("password") ||
          errMsg.includes("encrypted") ||
          pdfErr?.code === 1
        ) {
          return NextResponse.json(
            {
              error: "PDF_PASSWORD_PROTECTED",
              isScanned: false,
              message: "This PDF is password-protected. Please remove the password and try again.",
            },
            { status: 422 }
          );
        }

        // Distinguish corrupted / invalid PDF
        if (
          errName === "InvalidPDFException" ||
          errName === "FormatError" ||
          errMsg.includes("invalid pdf") ||
          errMsg.includes("corrupt")
        ) {
          return NextResponse.json(
            {
              error: "PDF_CORRUPTED",
              isScanned: false,
              message: "This PDF appears to be corrupted. Try opening and re-saving it before uploading.",
              details: pdfErr?.message || "PDF decoding failed",
            },
            { status: 422 }
          );
        }

        // General parser / runtime failure
        return NextResponse.json(
          {
            error: "PDF_PARSE_FAILED",
            isScanned: false,
            message: "We couldn't process this PDF right now. Please try again or upload a DOCX file.",
            details: pdfErr?.message || "PDF processing failed",
          },
          { status: 422 }
        );
      }
    }
    // 2. DOCX Parsing
    else if (isDocx) {
      // Validate DOCX Magic Bytes (PK\x03\x04 = 0x50, 0x4b, 0x03, 0x04)
      if (!isDocxBuffer(buffer)) {
        return NextResponse.json(
          {
            error: "DOCX_CORRUPTED",
            isScanned: false,
            message:
              "The uploaded file does not have valid DOCX format headers. It may be an unsupported legacy binary DOC or corrupted file.",
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
              error: "DOCX_NO_TEXT",
              isScanned: true,
              message:
                "We could not extract readable text from this Word document. It may contain embedded images rather than text.",
              suggestion: "Please check the document content or create your resume using our ATS templates.",
            },
            { status: 422 }
          );
        }
      } catch (docxErr: any) {
        console.error("DOCX_PARSE_ERROR:", docxErr?.message || docxErr);
        return NextResponse.json(
          {
            error: "DOCX_PARSE_FAILED",
            isScanned: false,
            message: "Failed to extract text from DOCX file. Please verify the document integrity.",
            details: docxErr?.message || "DOCX processing failed",
          },
          { status: 422 }
        );
      }
    } else {
      return NextResponse.json(
        {
          error: "UNSUPPORTED_FILE_TYPE",
          message: "Unsupported file format. Please upload a .pdf or .docx document.",
        },
        { status: 415 }
      );
    }

    // 3. Layered parsing and confidence scoring
    const parsedData = parseResumeText(extractedText);

    // 4. Optional Groq AI Semantic Refinement Pass (High Accuracy & Anti-Hallucination)
    const groqApiKey = process.env.GROQ_API_KEY;
    if (groqApiKey && extractedText.length >= 60) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const aiPrompt = `You are a world-class ATS resume parser and information extraction specialist.
Analyze this raw resume text and extract the structured resume data as a JSON object matching this schema:
{
  "personalInfo": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "jobTitle": "string",
    "website": "string",
    "linkedin": "string",
    "github": "string"
  },
  "summary": "string",
  "experience": [
    {
      "company": "string",
      "position": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "current": false,
      "description": "string",
      "highlights": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "fieldOfStudy": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "current": false,
      "gpa": "string",
      "achievements": ["string"]
    }
  ],
  "projects": [
    {
      "title": "string",
      "link": "string",
      "github": "string",
      "technologies": ["string"],
      "description": "string"
    }
  ],
  "skills": [
    {
      "name": "string",
      "category": "string"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string"
    }
  ]
}

CRITICAL RULES:
1. NEVER hallucinate or invent any information. Only extract facts explicitly stated in the text.
2. If a field is not present in the resume, use empty string "" or empty array [].
3. Separate Education (university degrees) from Certifications (AWS, Coursera, licenses) and Projects (software, hardware, academic projects).
4. Return ONLY valid JSON.`;

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqApiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content: "You extract structured resume JSON. You NEVER invent facts. Return valid JSON only.",
              },
              {
                role: "user",
                content: `${aiPrompt}\n\nRAW RESUME TEXT:\n${extractedText.slice(0, 8000)}`,
              },
            ],
            temperature: 0.1,
            max_tokens: 3000,
            response_format: { type: "json_object" },
          }),
        });

        clearTimeout(timeoutId);

        if (groqRes.ok) {
          const aiJson = await groqRes.json();
          const content = aiJson.choices?.[0]?.message?.content;
          if (content) {
            const aiParsed = JSON.parse(content);
            mergeAiParsedData(parsedData, aiParsed);
          }
        }
      } catch (aiErr: any) {
        console.warn("Groq AI parsing pass encountered an issue, preserving heuristic parse:", aiErr?.message || aiErr);
      }
    }

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
      {
        error: "INTERNAL_SERVER_ERROR",
        message: error?.message || "Failed to process resume file",
      },
      { status: 500 }
    );
  }
}
