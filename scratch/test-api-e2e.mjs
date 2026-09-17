import assert from "assert";
import { Document, Paragraph, TextRun, Packer } from "docx";

const BASE_URL = "http://localhost:3005";

console.log("=== RUNNING E2E API ROUTE FORENSIC SUITE (/api/resumes/parse) ===");

// 1. Valid rich text PDF fixture
const validPdfSource = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
5 0 obj << /Length 450 >> stream
BT
/F1 14 Tf
50 720 Td
(Alex Mercer) Tj
0 -20 Td
(alex.mercer@techinnovate.io | 415-555-0142 | San Francisco, CA) Tj
0 -20 Td
(linkedin.com/in/alexmercer | github.com/alexmercer) Tj
0 -30 Td
(Summary) Tj
0 -15 Td
(Senior Cloud Architect with 10+ years specializing in distributed systems, Kubernetes, and Golang.) Tj
0 -30 Td
(Experience) Tj
0 -15 Td
(Lead Architect - Apex Cloud Systems - 2021 - Present) Tj
0 -15 Td
(Architected multi-region failover handling 100k queries per second.) Tj
0 -30 Td
(Education) Tj
0 -15 Td
(Stanford University - M.S. in Computer Science - 2018) Tj
0 -30 Td
(Skills) Tj
0 -15 Td
(Go, Rust, TypeScript, Kubernetes, AWS, PostgreSQL, Kafka, Terraform, Docker) Tj
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
810
%%EOF`;

// 2. Scanned / image-only PDF (minimal or empty text stream)
const scannedPdfSource = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
5 0 obj << /Length 12 >> stream
BT
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
372
%%EOF`;

let passed = 0;
let total = 0;

async function runTest(name, fn) {
  total++;
  try {
    await fn();
    console.log(`✓ [PASS ${total}] ${name}`);
    passed++;
  } catch (err) {
    console.error(`✗ [FAIL ${total}] ${name}:`, err.message);
  }
}

async function main() {
  // Test 1: Valid text PDF
  await runTest("Test 1: Valid text PDF upload returns HTTP 200 with extracted resume data", async () => {
    const blob = new Blob([validPdfSource], { type: "application/pdf" });
    const formData = new FormData();
    formData.append("file", blob, "alex_mercer_resume.pdf");

    const res = await fetch(`${BASE_URL}/api/resumes/parse`, {
      method: "POST",
      body: formData,
    });

    assert.strictEqual(res.status, 200, `Expected 200 but got ${res.status}`);
    const body = await res.json();
    assert.strictEqual(body.data.personalInfo.fullName, "Alex Mercer");
    assert.strictEqual(body.data.personalInfo.email, "alex.mercer@techinnovate.io");
    assert.ok(body.data.skills.length >= 5, "Expected skills to be parsed");
    assert.ok(body.confidence.overall >= 50, "Expected good overall confidence");
  });

  // Test 2: Valid DOCX
  await runTest("Test 2: Valid DOCX upload returns HTTP 200 with extracted resume data", async () => {
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [new TextRun("Sarah Connor\nsarah.c@skynet-defense.org | 555-0199 | Los Angeles, CA\n\nExperience\nSecurity Architect at Cyberdyne (2020 - Present)\nBuilt automated threat response systems.\n\nEducation\nMIT - B.S. Computer Science\n\nSkills\nPython, C++, CyberSecurity, Network Forensics, Linux")],
            }),
          ],
        },
      ],
    });
    const docxBuffer = await Packer.toBuffer(doc);
    const blob = new Blob([docxBuffer], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const formData = new FormData();
    formData.append("file", blob, "sarah_resume.docx");

    const res = await fetch(`${BASE_URL}/api/resumes/parse`, {
      method: "POST",
      body: formData,
    });

    assert.strictEqual(res.status, 200, `Expected 200 but got ${res.status}`);
    const body = await res.json();
    assert.strictEqual(body.data.personalInfo.fullName, "Sarah Connor");
    assert.strictEqual(body.data.personalInfo.email, "sarah.c@skynet-defense.org");
    assert.ok(body.data.skills.length >= 3, "Expected skills to be parsed");
  });

  // Test 3: Corrupted PDF
  await runTest("Test 3: Corrupted PDF file returns HTTP 422 with PDF_CORRUPTED", async () => {
    // Bad bytes with .pdf extension
    const badPdf = Buffer.from("NOT_A_VALID_PDF_HEADER_1234567890_CORRUPTED");
    const blob = new Blob([badPdf], { type: "application/pdf" });
    const formData = new FormData();
    formData.append("file", blob, "corrupted.pdf");

    const res = await fetch(`${BASE_URL}/api/resumes/parse`, {
      method: "POST",
      body: formData,
    });

    assert.strictEqual(res.status, 422, `Expected 422 but got ${res.status}`);
    const body = await res.json();
    assert.strictEqual(body.error, "PDF_CORRUPTED");
    assert.strictEqual(body.isScanned, false);
  });

  // Test 4: Empty file
  await runTest("Test 4: Empty file (0 bytes) returns HTTP 400 with EMPTY_FILE", async () => {
    const blob = new Blob([], { type: "application/pdf" });
    const formData = new FormData();
    formData.append("file", blob, "empty.pdf");

    const res = await fetch(`${BASE_URL}/api/resumes/parse`, {
      method: "POST",
      body: formData,
    });

    assert.strictEqual(res.status, 400, `Expected 400 but got ${res.status}`);
    const body = await res.json();
    assert.strictEqual(body.error, "EMPTY_FILE");
  });

  // Test 5: Unsupported file
  await runTest("Test 5: Unsupported file format returns HTTP 415 with UNSUPPORTED_FILE_TYPE", async () => {
    const blob = new Blob(["const x = 1;"], { type: "text/javascript" });
    const formData = new FormData();
    formData.append("file", blob, "script.js");

    const res = await fetch(`${BASE_URL}/api/resumes/parse`, {
      method: "POST",
      body: formData,
    });

    assert.strictEqual(res.status, 415, `Expected 415 but got ${res.status}`);
    const body = await res.json();
    assert.strictEqual(body.error, "UNSUPPORTED_FILE_TYPE");
  });

  // Test 6: Scanned / image-only PDF
  await runTest("Test 6: Scanned / image PDF returns HTTP 422 with isScanned: true and PDF_SCANNED", async () => {
    const blob = new Blob([scannedPdfSource], { type: "application/pdf" });
    const formData = new FormData();
    formData.append("file", blob, "scanned_invoice.pdf");

    const res = await fetch(`${BASE_URL}/api/resumes/parse`, {
      method: "POST",
      body: formData,
    });

    assert.strictEqual(res.status, 422, `Expected 422 but got ${res.status}`);
    const body = await res.json();
    assert.strictEqual(body.isScanned, true);
    assert.strictEqual(body.error, "PDF_SCANNED");
  });

  // Test 7: Missing file in multipart form
  await runTest("Test 7: Missing file in payload returns HTTP 400 with MISSING_FILE", async () => {
    const formData = new FormData();
    formData.append("other_field", "some_data");

    const res = await fetch(`${BASE_URL}/api/resumes/parse`, {
      method: "POST",
      body: formData,
    });

    assert.strictEqual(res.status, 400, `Expected 400 but got ${res.status}`);
    const body = await res.json();
    assert.strictEqual(body.error, "MISSING_FILE");
  });

  // Test 8: Non-multipart / malformed body
  await runTest("Test 8: Non-multipart JSON payload returns HTTP 400 with INVALID_FILE", async () => {
    const res = await fetch(`${BASE_URL}/api/resumes/parse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file: "invalid" }),
    });

    assert.strictEqual(res.status, 400, `Expected 400 but got ${res.status}`);
    const body = await res.json();
    assert.strictEqual(body.error, "INVALID_FILE");
  });

  console.log(`\n=== E2E TEST RESULTS: ${passed}/${total} TESTS PASSED ===`);
  if (passed === total) {
    console.log("ALL E2E API ROUTE TESTS PASSED PERFECTLY!");
  } else {
    process.exit(1);
  }
}

main().catch(console.error);
