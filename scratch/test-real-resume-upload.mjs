import assert from "assert";

const BASE_URL = "http://localhost:3005";

// Realistic multi-section resume PDF fixture
const comprehensiveResumePdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
5 0 obj << /Length 750 >> stream
BT
/F1 12 Tf
50 720 Td
(Marcus Vance) Tj
0 -18 Td
(marcus.vance@cloudscale.net | (415) 890-1234 | San Francisco, CA) Tj
0 -18 Td
(linkedin.com/in/marcusvance | github.com/marcusvance) Tj
0 -26 Td
(Summary) Tj
0 -14 Td
(Principal Systems Engineer with 12+ years designing mission-critical distributed infrastructures, achieving 99.999% SLA.) Tj
0 -26 Td
(Experience) Tj
0 -14 Td
(Principal Engineer - CloudScale Inc. - 2020 - Present) Tj
0 -14 Td
(Architected multi-tenant Kubernetes platform supporting 50 million daily active requests.) Tj
0 -14 Td
(Senior Infrastructure Engineer - Nexus Networks - 2016 - 2020) Tj
0 -14 Td
(Engineered automated disaster recovery systems reducing recovery time by 80%.) Tj
0 -26 Td
(Education) Tj
0 -14 Td
(University of California, Berkeley - B.S. in Electrical Engineering & Computer Science - 2012 - 2016) Tj
0 -26 Td
(Skills) Tj
0 -14 Td
(Kubernetes, Go, Rust, TypeScript, AWS, Terraform, Docker, CI/CD, Distributed Systems, Linux) Tj
0 -26 Td
(Certifications) Tj
0 -14 Td
(AWS Certified Solutions Architect Professional - Amazon Web Services - 2023) Tj
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
1110
%%EOF`;

async function testRealUpload() {
  console.log("=== TESTING FULL REAL RESUME PDF UPLOAD OVER HTTP ===");
  const blob = new Blob([comprehensiveResumePdf], { type: "application/pdf" });
  const formData = new FormData();
  formData.append("file", blob, "marcus_vance_resume.pdf");

  const res = await fetch(`${BASE_URL}/api/resumes/parse`, {
    method: "POST",
    body: formData,
  });

  assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
  const data = await res.json();

  console.log("Status:", res.status);
  console.log("Candidate Name:", data.data.personalInfo.fullName);
  console.log("Email:", data.data.personalInfo.email);
  console.log("Phone:", data.data.personalInfo.phone);
  console.log("Location:", data.data.personalInfo.location);
  console.log("Summary:", data.data.summary);
  console.log("Experience Count:", data.data.experience.length);
  console.log("Education Count:", data.data.education.length);
  console.log("Skills Count:", data.data.skills.length);
  console.log("Overall Confidence:", data.confidence.overall);

  assert.strictEqual(data.data.personalInfo.fullName, "Marcus Vance");
  assert.strictEqual(data.data.personalInfo.email, "marcus.vance@cloudscale.net");
  assert.ok(data.data.experience.length >= 1, "Should have parsed experience");
  assert.ok(data.data.education.length >= 1, "Should have parsed education");
  assert.ok(data.data.skills.length >= 6, "Should have parsed multiple skills");
  assert.ok(data.confidence.overall >= 70, "Confidence should be >= 70");

  console.log("\n✓ REAL RESUME PDF UPLOAD TEST PASSED WITH 100% SUCCESS!");
}

testRealUpload().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
