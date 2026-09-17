const samplePdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
5 0 obj << /Length 200 >> stream
BT
/F1 12 Tf
50 720 Td
(Jane Doe) Tj
0 -20 Td
(jane.doe@example.com | 555-0199 | Seattle, WA) Tj
0 -30 Td
(Professional Summary: Senior Software Engineer with 8 years of experience building distributed systems in TypeScript and Go.) Tj
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
560
%%EOF`;

async function main() {
  const blob = new Blob([samplePdf], { type: "application/pdf" });
  const formData = new FormData();
  formData.append("file", blob, "jane_doe_resume.pdf");

  console.log("Sending HTTP POST to http://localhost:3005/api/resumes/parse ...");
  try {
    const res = await fetch("http://localhost:3005/api/resumes/parse", {
      method: "POST",
      body: formData,
    });

    console.log("HTTP Status:", res.status);
    const json = await res.json();
    console.log("Response Body:", JSON.stringify(json, null, 2));
  } catch (err) {
    console.error("HTTP request error:", err);
  }
}

main();
