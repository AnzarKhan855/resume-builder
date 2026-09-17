import { getDocumentProxy, extractText } from "unpdf";

const samplePdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
5 0 obj << /Length 55 >> stream
BT
/F1 14 Tf
100 700 Td
(John Doe Developer Resume With Enough Characters Here) Tj
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

async function main() {
  console.log("=== TESTING UNPDF ===");
  const buffer = Buffer.from(samplePdf, "utf-8");
  const result = await extractText(new Uint8Array(buffer), { mergePages: true });
  console.log("Direct extractText - total pages:", result.totalPages);
  console.log("Direct extractText - text:\n", result.text);
  console.log("=== SUCCESS ===");
}

main().catch(console.error);
