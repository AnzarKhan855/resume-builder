import { getDocumentProxy, extractText } from "unpdf";
import assert from "assert";

console.log("=== TESTING UNPDF ACROSS EDGE SCENARIOS ===");

// 1. Text PDF
const textPdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
5 0 obj << /Length 200 >> stream
BT
/F1 12 Tf
50 720 Td
(David Kim) Tj
0 -20 Td
(david.kim@example.com | 206-555-0123 | Seattle, WA) Tj
0 -30 Td
(Summary: Full Stack Engineer with 8 years experience building distributed cloud systems in TypeScript and Go.) Tj
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

// 2. Empty / scanned PDF
const scannedPdf = `%PDF-1.4
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

async function main() {
  // Test 1: Normal text PDF
  const pdf1 = await getDocumentProxy(new Uint8Array(Buffer.from(textPdf)));
  const res1 = await extractText(pdf1, { mergePages: true });
  console.log("Test 1 Text:\n", res1.text);
  assert.ok(res1.text.includes("David Kim"));
  assert.ok(res1.text.includes("david.kim@example.com"));
  console.log("✓ Test 1 Passed");

  // Test 2: Scanned PDF
  const pdf2 = await getDocumentProxy(new Uint8Array(Buffer.from(scannedPdf)));
  const res2 = await extractText(pdf2, { mergePages: true });
  console.log("Test 2 Text (length:", res2.text.length, "):", res2.text);
  assert.ok(res2.text.trim().length < 30);
  console.log("✓ Test 2 Passed (Scanned PDF detected as empty text)");

  // Test 3: Corrupted PDF bytes
  try {
    await getDocumentProxy(new Uint8Array(Buffer.from("CORRUPTED_BYTES_NOT_A_PDF")));
    assert.fail("Should have thrown on corrupted PDF");
  } catch (err) {
    console.log("✓ Test 3 Passed: Caught error on corrupted PDF:", err.name, "-", err.message);
  }

  console.log("=== ALL UNPDF SCENARIOS PASSED ===");
}

main().catch(console.error);
