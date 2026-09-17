import { POST } from "../app/api/resumes/parse/route.ts";
import { NextRequest } from "next/server";

const samplePdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
5 0 obj << /Length 55 >> stream
BT
/F1 14 Tf
100 700 Td
(John Doe Developer Resume) Tj
ET
endstream endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000107 00000 n 
0000000227 00000 n 
0000000305 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
412
%%EOF`;

async function test() {
  const blob = new Blob([samplePdf], { type: "application/pdf" });
  const file = new File([blob], "resume.pdf", { type: "application/pdf" });
  const formData = new FormData();
  formData.append("file", file);

  const req = new NextRequest("http://localhost:3000/api/resumes/parse", {
    method: "POST",
    body: formData,
  });

  try {
    const res = await POST(req);
    console.log("Status:", res.status);
    const json = await res.json();
    console.log("Response JSON:", json);
  } catch (err) {
    console.error("Handler error:", err);
  }
}

test();
