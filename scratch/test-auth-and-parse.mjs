import assert from "assert";

const BASE_URL = "http://localhost:3005";

const samplePdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
5 0 obj << /Length 120 >> stream
BT
/F1 12 Tf
50 720 Td
(David Kim) Tj
0 -20 Td
(david.kim@example.com | 206-555-0123 | Seattle, WA) Tj
0 -20 Td
(Full Stack Engineer with React and Node.js expertise.) Tj
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
480
%%EOF`;

async function testAuthAndParse() {
  console.log("=== VERIFYING AUTH & PARSE INTEGRATION ===");

  // 1. Guest parse (logged out)
  const guestBlob = new Blob([samplePdf], { type: "application/pdf" });
  const guestFormData = new FormData();
  guestFormData.append("file", guestBlob, "guest_resume.pdf");

  const guestRes = await fetch(`${BASE_URL}/api/resumes/parse`, {
    method: "POST",
    body: guestFormData,
  });
  assert.strictEqual(guestRes.status, 200, "Guest upload should succeed");
  const guestData = await guestRes.json();
  assert.strictEqual(guestData.data.personalInfo.fullName, "David Kim");
  console.log("✓ Guest user upload succeeded with HTTP 200");

  // 2. Register a new user
  const email = `testuser_${Date.now()}@example.com`;
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test Engineer",
      email,
      password: "StrongPassword123!",
    }),
  });
  assert.strictEqual(regRes.status, 201, "Registration should return 201");
  const cookie = regRes.headers.get("set-cookie");
  console.log("✓ Registration succeeded with session cookie");

  // 3. Logged-in parse
  const authBlob = new Blob([samplePdf], { type: "application/pdf" });
  const authFormData = new FormData();
  authFormData.append("file", authBlob, "auth_resume.pdf");

  const authRes = await fetch(`${BASE_URL}/api/resumes/parse`, {
    method: "POST",
    headers: cookie ? { Cookie: cookie } : {},
    body: authFormData,
  });
  assert.strictEqual(authRes.status, 200, "Authenticated upload should succeed");
  const authData = await authRes.json();
  assert.strictEqual(authData.data.personalInfo.fullName, "David Kim");
  console.log("✓ Authenticated user upload succeeded with HTTP 200");

  console.log("=== AUTH & PARSE VERIFICATION PASSED ===");
}

testAuthAndParse().catch((err) => {
  console.error("Auth & Parse test failed:", err);
  process.exit(1);
});
