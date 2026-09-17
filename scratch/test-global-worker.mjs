import * as pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.mjs";
import { PDFParse } from "pdf-parse";

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
  console.log("Setting globalThis.pdfjsWorker...");
  globalThis.pdfjsWorker = pdfWorker;
  console.log("WorkerMessageHandler present:", !!globalThis.pdfjsWorker.WorkerMessageHandler);

  const parser = new PDFParse({ data: Buffer.from(samplePdf) });
  const text = await parser.getText();
  console.log("Extracted text successfully:", text.text);
  await parser.destroy();
  console.log("SUCCESS!");
}

main().catch(console.error);
