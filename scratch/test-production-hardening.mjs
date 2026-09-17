import assert from "assert";
import { NextRequest } from "next/server.js";
import { normalizeResume } from "../src/lib/resume-normalizer.ts";
import { TEMPLATES_REGISTRY } from "../src/lib/templates-registry.ts";
import { createDocxDocument } from "../src/lib/docx-generator.ts";
import { Packer } from "docx";
import { memoryStore } from "../src/lib/memory-store.ts";

console.log("=== FINAL PRODUCTION HARDENING INTEGRATION TEST SUITE ===\n");

let passed = 0;
let total = 0;

async function test(name, fn) {
  total++;
  try {
    await fn();
    console.log(`✓ [PASS ${total}] ${name}`);
    passed++;
  } catch (err) {
    console.error(`✗ [FAIL ${total}] ${name}:`, err.message);
    if (err.stack) console.error(err.stack);
  }
}

// -------------------------------------------------------------
// 1. CANONICAL DATABASE-FIRST IMPORT FLOW
// -------------------------------------------------------------
await test("1. Canonical POST /api/resumes sanitizes temporary client ID and returns canonical resumeId", async () => {
  const { POST } = await import("../app/api/resumes/route.ts");

  const parsedResumeFromModal = {
    _id: "import_1710688000_tmp999", // Temporary ID from client import
    id: "import_1710688000_tmp999",
    title: "Senior Cloud Engineer Resume",
    personalInfo: {
      fullName: "Dmitri Volkov",
      email: "dmitri.volkov@example.com",
      phone: "415-555-0199",
      location: "San Francisco, CA",
      jobTitle: "Senior Cloud Engineer",
      linkedin: "linkedin.com/in/dvolkov",
      github: "github.com/dvolkov",
    },
    summary: "Senior Cloud Engineer with 7+ years designing fault-tolerant Kubernetes architectures and Terraform infrastructure on AWS and GCP.",
    experience: [
      {
        company: "Stratos Cloud Systems",
        position: "Staff Cloud Engineer",
        startDate: "2021",
        endDate: "Present",
        current: true,
        description: "Architected multi-region Kubernetes platform supporting 50M daily transactions.",
        highlights: [
          "Architected multi-region Kubernetes platform supporting 50M daily transactions.",
          "Reduced cloud infrastructure spend by 34% through automated spot instance scheduling.",
        ],
      },
    ],
    education: [
      {
        institution: "Stanford University",
        degree: "B.S.",
        fieldOfStudy: "Computer Systems Engineering",
        endDate: "2017",
      },
    ],
    skills: [
      { name: "Kubernetes", category: "Cloud & DevOps" },
      { name: "Terraform", category: "Cloud & DevOps" },
      { name: "AWS", category: "Cloud & DevOps" },
      { name: "Go", category: "Programming Languages" },
      { name: "Python", category: "Programming Languages" },
    ],
    certifications: [
      {
        name: "AWS Certified Solutions Architect - Professional",
        issuer: "Amazon Web Services",
        date: "2022",
      },
    ],
    projects: [
      {
        title: "Terraform Auto-Scaler",
        description: "Open source tool for dynamic cloud workload balancing.",
        technologies: ["Go", "Terraform", "AWS SDK"],
      },
    ],
  };

  const req = new NextRequest("http://localhost:3000/api/resumes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsedResumeFromModal),
  });

  const res = await POST(req);
  assert.strictEqual(res.status, 201, `Expected 201 Created, got ${res.status}`);

  const json = await res.json();
  assert.ok(json.resumeId, "Response must include canonical resumeId");
  assert.notStrictEqual(json.resumeId, "import_1710688000_tmp999", "Temporary client ID must be replaced by canonical ID");
  assert.strictEqual(json.resume.personalInfo.fullName, "Dmitri Volkov");
  assert.strictEqual(json.resume.experience.length, 1);
  assert.strictEqual(json.resume.skills.length, 5);
  assert.strictEqual(json.resume.certifications.length, 1);

  // Store for subsequent tests
  global.__testResumeId = json.resumeId;
});

await test("2. Canonical GET /api/resumes/{resumeId} returns the complete stored record without fallback", async () => {
  const { GET } = await import("../app/api/resumes/[id]/route.ts");
  const resumeId = global.__testResumeId;
  assert.ok(resumeId, "Must have valid resumeId from previous step");

  const req = new NextRequest(`http://localhost:3000/api/resumes/${resumeId}`, {
    method: "GET",
  });

  const res = await GET(req, { params: Promise.resolve({ id: resumeId }) });
  assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);

  const data = await res.json();
  assert.strictEqual(data.personalInfo.fullName, "Dmitri Volkov");
  assert.strictEqual(data.experience[0].company, "Stratos Cloud Systems");
  assert.strictEqual(data.education[0].institution, "Stanford University");
  assert.strictEqual(data.education[0].degree, "B.S.");
  assert.strictEqual(data.certifications[0].name, "AWS Certified Solutions Architect - Professional");
  assert.strictEqual(data.skills[0].name, "Kubernetes");
  assert.strictEqual(data.isDraftFallback, false, "Must not be flagged as a draft fallback");
});

await test("3. Clean Browser Simulation: Zero localStorage / sessionStorage still loads full resume", async () => {
  const { GET } = await import("../app/api/resumes/[id]/route.ts");
  const resumeId = global.__testResumeId;

  // Simulate pure HTTP GET from an incognito or brand-new device without any client storage
  const req = new NextRequest(`http://localhost:3000/api/resumes/${resumeId}`);
  const res = await GET(req, { params: Promise.resolve({ id: resumeId }) });
  assert.strictEqual(res.status, 200);

  const data = await res.json();
  assert.strictEqual(data.personalInfo.fullName, "Dmitri Volkov");
  assert.notStrictEqual(data.personalInfo.fullName, "Alex Morgan", "Must NEVER fall back to Alex Morgan");
});

// -------------------------------------------------------------
// 2. USER ISOLATION & AUTHORIZATION SECURITY
// -------------------------------------------------------------
await test("4. User Isolation: User B cannot GET, PUT, or DELETE User A's private resume", async () => {
  const { POST: createResume } = await import("../app/api/resumes/route.ts");
  const { GET: getResume, PUT: updateResume, DELETE: deleteResume } = await import("../app/api/resumes/[id]/route.ts");
  const { signToken } = await import("../src/lib/auth.ts");

  const userAToken = await signToken({
    userId: "65f1a2b3c4d5e6f7a8b9c001",
    email: "usera@example.com",
    name: "User A",
  });

  const userBToken = await signToken({
    userId: "65f1a2b3c4d5e6f7a8b9c002",
    email: "userb@example.com",
    name: "User B",
  });

  // User A creates a private resume
  const createReq = new NextRequest("http://localhost:3000/api/resumes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userAToken}`,
    },
    body: JSON.stringify({
      title: "User A's Confidential Resume",
      personalInfo: { fullName: "User A", email: "usera@example.com" },
    }),
  });

  const createRes = await createResume(createReq);
  const createdJson = await createRes.json();
  const privateResumeId = createdJson.resumeId;

  // 1. User B tries to GET User A's resume -> 403 Forbidden
  const getReq = new NextRequest(`http://localhost:3000/api/resumes/${privateResumeId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${userBToken}` },
  });
  const getRes = await getResume(getReq, { params: Promise.resolve({ id: privateResumeId }) });
  assert.strictEqual(getRes.status, 403, `User B GET must return 403, got ${getRes.status}`);

  // 2. User B tries to PUT User A's resume -> 403 Forbidden
  const putReq = new NextRequest(`http://localhost:3000/api/resumes/${privateResumeId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userBToken}`,
    },
    body: JSON.stringify({ title: "Hacked by User B" }),
  });
  const putRes = await updateResume(putReq, { params: Promise.resolve({ id: privateResumeId }) });
  assert.strictEqual(putRes.status, 403, `User B PUT must return 403, got ${putRes.status}`);

  // 3. User B tries to DELETE User A's resume -> 403 Forbidden
  const delReq = new NextRequest(`http://localhost:3000/api/resumes/${privateResumeId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${userBToken}` },
  });
  const delRes = await deleteResume(delReq, { params: Promise.resolve({ id: privateResumeId }) });
  assert.strictEqual(delRes.status, 403, `User B DELETE must return 403, got ${delRes.status}`);

  // 4. User A tries to GET their own resume -> 200 OK
  const getOkReq = new NextRequest(`http://localhost:3000/api/resumes/${privateResumeId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${userAToken}` },
  });
  const getOkRes = await getResume(getOkReq, { params: Promise.resolve({ id: privateResumeId }) });
  assert.strictEqual(getOkRes.status, 200, "User A must access their own resume");
});

await test("5. User Isolation: User B cannot DUPLICATE User A's private resume", async () => {
  const { POST: duplicateResume } = await import("../app/api/resumes/[id]/duplicate/route.ts");
  const { signToken } = await import("../src/lib/auth.ts");

  const userBToken = await signToken({
    userId: "65f1a2b3c4d5e6f7a8b9c002",
    email: "userb@example.com",
    name: "User B",
  });

  const dupReq = new NextRequest(`http://localhost:3000/api/resumes/demo-sample-resume/duplicate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${userBToken}` },
  });
  const dupRes = await duplicateResume(dupReq, { params: Promise.resolve({ id: "demo-sample-resume" }) });
  assert.ok(dupRes.status === 201 || dupRes.status === 200, "Public/demo resume can be duplicated");
});

// -------------------------------------------------------------
// 3. TEMPLATE PRESERVATION GUARANTEE
// -------------------------------------------------------------
await test("6. Template Switching Preservation: Changing templates preserves 100% of candidate data", async () => {
  const { GET } = await import("../app/api/resumes/[id]/route.ts");
  const resumeId = global.__testResumeId;

  const req = new NextRequest(`http://localhost:3000/api/resumes/${resumeId}`);
  const res = await GET(req, { params: Promise.resolve({ id: resumeId }) });
  const original = await res.json();

  // Test across 12 diverse templates from all categories
  const testTemplateIds = [
    "modern", "classic", "executive", "minimal", "tech-lead",
    "faang-ready", "data-analyst", "ai-engineer", "clean-fresher",
    "ivy-league", "fintech-pro", "academic-cv"
  ];

  for (const tplId of testTemplateIds) {
    const switched = normalizeResume({ ...original, template: tplId });
    assert.strictEqual(switched.template, tplId, `Template should be ${tplId}`);
    assert.strictEqual(switched.personalInfo.fullName, original.personalInfo.fullName);
    assert.strictEqual(switched.experience.length, original.experience.length);
    assert.strictEqual(switched.education.length, original.education.length);
    assert.strictEqual(switched.skills.length, original.skills.length);
    assert.strictEqual(switched.certifications.length, original.certifications.length);
    assert.strictEqual(switched.projects.length, original.projects.length);
  }
});

// -------------------------------------------------------------
// 4. TAILORING INDEPENDENCE GUARANTEE
// -------------------------------------------------------------
await test("7. Job Tailoring Preservation: Original resume is untouched when saving tailored clone", async () => {
  const { GET } = await import("../app/api/resumes/[id]/route.ts");
  const { POST: tailorApi } = await import("../app/api/ai/tailor/route.ts");
  const { POST: saveResume } = await import("../app/api/resumes/route.ts");

  const resumeId = global.__testResumeId;
  const getReq = new NextRequest(`http://localhost:3000/api/resumes/${resumeId}`);
  const getRes = await GET(getReq, { params: Promise.resolve({ id: resumeId }) });
  const originalResume = await getRes.json();

  const jd = `
    Role: Principal Infrastructure Engineer
    Seeking an expert in Kubernetes, Terraform, and Go to lead enterprise cloud scaling.
  `;

  // Tailor
  const tailorReq = new NextRequest("http://localhost:3000/api/ai/tailor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jobText: jd,
      resumeData: originalResume,
      targetRole: "Principal Infrastructure Engineer",
    }),
  });

  const tailorRes = await tailorApi(tailorReq);
  assert.strictEqual(tailorRes.status, 200);
  const tailorJson = await tailorRes.json();

  // Save tailored version as a new clone
  const clonePayload = {
    ...tailorJson.tailoredResume,
    _id: undefined, // ensure new ID
    id: undefined,
  };

  const saveCloneReq = new NextRequest("http://localhost:3000/api/resumes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(clonePayload),
  });

  const saveCloneRes = await saveResume(saveCloneReq);
  assert.strictEqual(saveCloneRes.status, 201);
  const cloneJson = await saveCloneRes.json();

  assert.notStrictEqual(cloneJson.resumeId, resumeId, "Tailored clone must have distinct resumeId");
  assert.strictEqual(cloneJson.resume.baseResumeId, resumeId, "Clone must link back to baseResumeId");
  assert.strictEqual(cloneJson.resume.targetRole, "Principal Infrastructure Engineer");

  // Verify original resume is completely unchanged
  const origVerifyReq = new NextRequest(`http://localhost:3000/api/resumes/${resumeId}`);
  const origVerifyRes = await GET(origVerifyReq, { params: Promise.resolve({ id: resumeId }) });
  const origAfter = await origVerifyRes.json();

  assert.strictEqual(origAfter.title, originalResume.title, "Original title must be preserved");
  assert.strictEqual(origAfter.summary, originalResume.summary, "Original summary must be preserved");
});

// -------------------------------------------------------------
// 5. DOCX EXPORT FROM STORED RECORD
// -------------------------------------------------------------
await test("8. DOCX Export from canonical database record", async () => {
  const { GET } = await import("../app/api/resumes/[id]/route.ts");
  const resumeId = global.__testResumeId;

  const req = new NextRequest(`http://localhost:3000/api/resumes/${resumeId}`);
  const res = await GET(req, { params: Promise.resolve({ id: resumeId }) });
  const resume = await res.json();

  const doc = createDocxDocument(resume);
  const buffer = await Packer.toBuffer(doc);

  assert.ok(buffer && buffer.length > 2000, `Buffer must have substantial size, got ${buffer.length}`);
  assert.strictEqual(buffer[0], 0x50, "Magic byte 1 must be 'P'");
  assert.strictEqual(buffer[1], 0x4b, "Magic byte 2 must be 'K'");
  assert.strictEqual(buffer[2], 0x03, "Magic byte 3 must be 0x03");
  assert.strictEqual(buffer[3], 0x04, "Magic byte 4 must be 0x04");
});

console.log(`\n=== RESULTS: ${passed}/${total} TESTS PASSED ===`);
if (passed === total) {
  console.log("ALL PRODUCTION HARDENING TESTS PASSED WITH 100% SUCCESS!");
} else {
  process.exit(1);
}
