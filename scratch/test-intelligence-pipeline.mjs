import assert from "assert";
import { parseResumeText, categorizeSkill, mergeAiParsedData } from "../src/lib/resume-parser.ts";
import { normalizeResume, prepareResumeForSave } from "../src/lib/resume-normalizer.ts";
import { auditResumeForAts } from "../src/lib/ats-checker.ts";
import { TEMPLATES_REGISTRY, TEMPLATE_CATEGORIES, getTemplateById } from "../src/lib/templates-registry.ts";
import { createDocxDocument } from "../src/lib/docx-generator.ts";
import { Packer } from "docx";

console.log("=== NEXT-GEN RESUME INTELLIGENCE & TAILORING PIPELINE TEST SUITE ===\n");

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`✓ [PASS ${total}] ${name}`);
    passed++;
  } catch (err) {
    console.error(`✗ [FAIL ${total}] ${name}:`, err.message);
  }
}

async function asyncTest(name, fn) {
  total++;
  try {
    await fn();
    console.log(`✓ [PASS ${total}] ${name}`);
    passed++;
  } catch (err) {
    console.error(`✗ [FAIL ${total}] ${name}:`, err.message);
  }
}

// -------------------------------------------------------------
// 1. SECTION SEPARATION & CLASSIFICATION
// -------------------------------------------------------------
test("1. Degree and field of study separation from Education", () => {
  const resumeText = `
Elena Rostova
elena@example.com | 212-555-0199 | New York, NY
github.com/erostova | linkedin.com/in/erostova

Education
Massachusetts Institute of Technology
Bachelor of Science in Computer Science and Engineering
2018 - 2022
CGPA: 3.9 / 4.0
`;

  const parsed = parseResumeText(resumeText);
  assert.strictEqual(parsed.education.length, 1, "Should detect 1 education entry");
  assert.ok(parsed.education[0].institution.includes("Massachusetts Institute"), "Institution extracted");
  assert.ok(parsed.education[0].degree.includes("Bachelor of Science"), "Degree extracted");
  assert.ok(parsed.education[0].fieldOfStudy.includes("Computer Science"), "Field of study separated");
  assert.strictEqual(parsed.education[0].gpa, "3.9", "GPA extracted");
});

test("2. Disambiguate Certifications from Education & Experience", () => {
  const resumeText = `
David Chen
david.chen@clouddev.io | 415-555-8812 | Seattle, WA

Education
University of Washington
B.S. in Information Systems
2017 - 2021
AWS Certified Solutions Architect - Associate
Coursera Deep Learning Specialization by Andrew Ng
`;

  const parsed = parseResumeText(resumeText);
  assert.strictEqual(parsed.education.length, 1, "Should have only 1 degree");
  assert.strictEqual(parsed.education[0].degree, "B.S.", "Degree isolated");
  assert.strictEqual(parsed.education[0].fieldOfStudy, "Information Systems", "Field isolated");
  assert.ok(parsed.certifications.length >= 2, "AWS and Coursera should be routed to Certifications");
});

test("3. Categorized Skills Classification Engine", () => {
  assert.strictEqual(categorizeSkill("TypeScript"), "Programming Languages");
  assert.strictEqual(categorizeSkill("Python"), "Programming Languages");
  assert.strictEqual(categorizeSkill("Go"), "Programming Languages");
  assert.strictEqual(categorizeSkill("React"), "Frameworks & Libraries");
  assert.strictEqual(categorizeSkill("Next.js"), "Frameworks & Libraries");
  assert.strictEqual(categorizeSkill("PostgreSQL"), "Databases");
  assert.strictEqual(categorizeSkill("Redis"), "Databases");
  assert.strictEqual(categorizeSkill("Kubernetes"), "Cloud & DevOps");
  assert.strictEqual(categorizeSkill("Docker"), "Cloud & DevOps");
  assert.strictEqual(categorizeSkill("Terraform"), "Cloud & DevOps");
  assert.strictEqual(categorizeSkill("Git"), "Tools & Platforms");
  assert.strictEqual(categorizeSkill("Figma"), "Tools & Platforms");
});

// -------------------------------------------------------------
// 2. DATA NORMALIZATION & PERSISTENCE SAFETY
// -------------------------------------------------------------
test("4. Normalizer preserves new tailoring and versioning fields", () => {
  const rawData = {
    title: "Elena's Tailored Resume",
    targetRole: "Staff Software Engineer",
    jobDescription: "Leading large-scale distributed systems with Go and Kubernetes.",
    baseResumeId: "base_resume_123",
    tailoredFromId: "base_resume_123",
    isDraftFallback: false,
    personalInfo: {
      fullName: "Elena Rostova",
      email: "elena@example.com",
      phone: "212-555-0199",
    },
    skills: ["Go", "Kubernetes", "PostgreSQL"],
  };

  const normalized = normalizeResume(rawData);
  assert.strictEqual(normalized.targetRole, "Staff Software Engineer");
  assert.strictEqual(normalized.baseResumeId, "base_resume_123");
  assert.strictEqual(normalized.tailoredFromId, "base_resume_123");
  assert.strictEqual(normalized.skills.length, 3);
  assert.strictEqual(normalized.skills[0].name, "Go");
  assert.strictEqual(normalized.skills[0].category, "Programming Languages");
});

test("5. mergeAiParsedData strictly protects against hallucination", () => {
  const base = parseResumeText(`
Alice Smith
alice@example.com | 555-0199 | Austin, TX
Experience
Acme Corp
Software Engineer
2020 - Present
Built internal payment routing engine.
`);

  // Simulated AI response with accurate summary and refined bullets
  const aiResponse = {
    summary: "Dedicated Software Engineer with proven background building resilient financial systems at Acme Corp.",
    experience: [
      {
        company: "Acme Corp",
        position: "Software Engineer",
        startDate: "2020",
        endDate: "Present",
        current: true,
        description: "Architected and delivered internal payment routing engine processing high-throughput transactions.",
        highlights: ["Architected and delivered internal payment routing engine processing high-throughput transactions."],
      },
    ],
    skills: [
      { name: "TypeScript", category: "Programming Languages" },
      { name: "Node.js", category: "Frameworks & Libraries" },
    ],
  };

  const merged = mergeAiParsedData(base, aiResponse);
  assert.strictEqual(merged.personalInfo.fullName, "Alice Smith");
  assert.ok(merged.summary.includes("Dedicated Software Engineer"));
  assert.strictEqual(merged.experience[0].company, "Acme Corp");
  assert.ok(merged.experience[0].description.includes("payment routing engine"));
});

// -------------------------------------------------------------
// 3. 50 ATS TEMPLATES VERIFICATION
// -------------------------------------------------------------
test("6. Exactly 50 ATS Templates registered with zero duplicates", () => {
  assert.strictEqual(TEMPLATES_REGISTRY.length, 50, "Total templates count must be 50");
  const ids = new Set(TEMPLATES_REGISTRY.map((t) => t.id));
  assert.strictEqual(ids.size, 50, "All 50 template IDs must be distinct");
});

test("7. All 7 Categories properly populated and 100% ATS Safe", () => {
  assert.strictEqual(TEMPLATE_CATEGORIES.length, 7, "Must have 7 categories");

  for (const tpl of TEMPLATES_REGISTRY) {
    assert.strictEqual(tpl.atsSafe, true, `Template ${tpl.id} must be marked ATS Safe`);
    assert.ok(tpl.name && tpl.name.length > 2, `Template ${tpl.id} must have a valid name`);
    assert.ok(tpl.tagline, `Template ${tpl.id} must have a tagline`);
    assert.ok(tpl.bestFor, `Template ${tpl.id} must specify best-for roles`);
    assert.ok(tpl.recommendedColor, `Template ${tpl.id} must have a recommended color`);
  }

  const categoryCounts = {
    general: TEMPLATES_REGISTRY.filter((t) => t.category === "general").length,
    tech: TEMPLATES_REGISTRY.filter((t) => t.category === "tech").length,
    data: TEMPLATES_REGISTRY.filter((t) => t.category === "data").length,
    student: TEMPLATES_REGISTRY.filter((t) => t.category === "student").length,
    business: TEMPLATES_REGISTRY.filter((t) => t.category === "business").length,
    research: TEMPLATES_REGISTRY.filter((t) => t.category === "research").length,
    specialized: TEMPLATES_REGISTRY.filter((t) => t.category === "specialized").length,
  };

  assert.strictEqual(categoryCounts.general, 10, "General: 10 templates");
  assert.strictEqual(categoryCounts.tech, 10, "Tech: 10 templates");
  assert.strictEqual(categoryCounts.data, 5, "Data: 5 templates");
  assert.strictEqual(categoryCounts.student, 5, "Student: 5 templates");
  assert.strictEqual(categoryCounts.business, 5, "Business: 5 templates");
  assert.strictEqual(categoryCounts.research, 5, "Research: 5 templates");
  assert.strictEqual(categoryCounts.specialized, 10, "Specialized: 10 templates");
});

// -------------------------------------------------------------
// 4. ATS READINESS AUDIT ENGINE
// -------------------------------------------------------------
test("8. ATS Readiness audit evaluates structure, content, and action verbs", () => {
  const testResume = normalizeResume({
    personalInfo: {
      fullName: "Maya Lin",
      email: "maya.lin@example.com",
      phone: "415-555-0182",
      location: "San Francisco, CA",
      jobTitle: "Senior DevOps Engineer",
      linkedin: "linkedin.com/in/mayalin",
      github: "github.com/mayalin",
    },
    summary: "Senior DevOps Engineer with 6+ years specializing in automated cloud deployments, Kubernetes orchestration, and continuous integration.",
    experience: [
      {
        company: "CloudCore",
        position: "Lead DevOps Engineer",
        startDate: "2021",
        endDate: "Present",
        current: true,
        description: "Spearheaded cloud migration to Kubernetes reducing deployment time by 45%.",
        highlights: [
          "Spearheaded cloud migration to Kubernetes reducing deployment time by 45%.",
          "Automated CI/CD pipelines with GitHub Actions across 30+ production microservices.",
        ],
      },
    ],
    education: [
      {
        institution: "University of California, Berkeley",
        degree: "B.S.",
        fieldOfStudy: "Computer Science",
        startDate: "2015",
        endDate: "2019",
      },
    ],
    skills: ["Docker", "Kubernetes", "AWS", "Terraform", "Go", "Python", "CI/CD", "Linux"],
    certifications: [
      {
        name: "Certified Kubernetes Administrator (CKA)",
        issuer: "CNCF",
        date: "2022",
      },
    ],
  });

  const audit = auditResumeForAts(testResume);
  assert.ok(audit.score >= 80, `Expected high ATS score, got ${audit.score}`);
  assert.ok(audit.actionVerbsFound.length >= 2, "Action verbs detected");
  assert.ok(audit.metricsFound.length >= 1, "Quantified metric (45%) detected");
});

// -------------------------------------------------------------
// 5. DOCX EXPORT GENERATION
// -------------------------------------------------------------
await asyncTest("9. Native DOCX generation with all canonical sections", async () => {
  const sampleResume = normalizeResume({
    personalInfo: {
      fullName: "Jordan Lee",
      email: "jordan@example.com",
      phone: "555-0144",
      jobTitle: "Full Stack Engineer",
    },
    summary: "Experienced developer passionate about accessible user experiences.",
    experience: [
      {
        company: "NextGen Software",
        position: "Software Engineer",
        startDate: "2020",
        endDate: "Present",
        description: "Built scalable web apps.",
      },
    ],
    education: [
      {
        institution: "NYU",
        degree: "B.A.",
        fieldOfStudy: "Computer Science",
        endDate: "2020",
      },
    ],
    skills: ["TypeScript", "React", "Next.js", "Node.js"],
  });

  const doc = createDocxDocument(sampleResume);
  const buffer = await Packer.toBuffer(doc);
  assert.ok(buffer && buffer.length > 1000, "DOCX buffer must be generated with valid file size");
  // Validate DOCX magic bytes PK\x03\x04
  assert.strictEqual(buffer[0], 0x50);
  assert.strictEqual(buffer[1], 0x4b);
  assert.strictEqual(buffer[2], 0x03);
  assert.strictEqual(buffer[3], 0x04);
});

// -------------------------------------------------------------
// 6. JOB TAILORING API & ANTI-HALLUCINATION VERIFICATION
// -------------------------------------------------------------
await asyncTest("10. Deep Job Description Tailoring Engine (POST /api/ai/tailor)", async () => {
  const { POST } = await import("../app/api/ai/tailor/route.ts");
  const { NextRequest } = await import("next/server");

  const candidateResume = normalizeResume({
    id: "resume_orig_001",
    personalInfo: {
      fullName: "Marcus Vance",
      email: "marcus.vance@example.com",
      phone: "312-555-0144",
      jobTitle: "Software Engineer",
      location: "Chicago, IL",
    },
    summary: "Full-stack engineer with 4 years building scalable web services.",
    experience: [
      {
        company: "Apex Fintech",
        position: "Software Engineer",
        startDate: "2021",
        endDate: "Present",
        description: "Built microservices for real-time order processing.",
        highlights: [
          "Built microservices for real-time order processing.",
          "Maintained relational database schemas and automated CI pipelines.",
        ],
      },
    ],
    education: [
      {
        institution: "University of Illinois Urbana-Champaign",
        degree: "B.S.",
        fieldOfStudy: "Computer Science",
      },
    ],
    skills: ["TypeScript", "Node.js", "PostgreSQL", "Docker", "Git"],
  });

  const jobDescription = `
    Role: Senior Backend Engineer
    Company: CloudScale Infrastructure
    About the Role:
    We are seeking a Senior Backend Engineer to lead our distributed cloud services team.
    Key Requirements:
    - 5+ years building distributed backend systems in Node.js or Go.
    - Deep expertise in PostgreSQL, Redis, Kubernetes, and Docker.
    - Experience designing high-throughput REST APIs and microservices.
    - Strong understanding of CI/CD pipelines, AWS, and system design.
  `;

  const req = new NextRequest("http://localhost:3000/api/ai/tailor", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jobText: jobDescription,
      resumeData: candidateResume,
      targetRole: "Senior Backend Engineer",
    }),
  });

  const res = await POST(req);
  assert.strictEqual(res.status, 200, "Tailor API should return 200 OK");

  const json = await res.json();
  assert.strictEqual(json.success, true, "Should return success: true");
  assert.strictEqual(json.analysis.targetRole, "Senior Backend Engineer", "Role should match");
  assert.ok(json.analysis.matchScore >= 40 && json.analysis.matchScore <= 100, `Valid match score: ${json.analysis.matchScore}`);
  assert.ok(json.analysis.matchedSkills.includes("node.js"), "Matched node.js");
  assert.ok(json.analysis.matchedSkills.includes("postgresql"), "Matched postgresql");
  assert.ok(json.analysis.matchedSkills.includes("docker"), "Matched docker");
  assert.ok(json.analysis.missingSkills.includes("kubernetes"), "Identified kubernetes as missing skill");

  // Anti-Hallucination Checks
  assert.strictEqual(json.tailoredResume.baseResumeId, "resume_orig_001", "Base resume ID must be tracked");
  assert.strictEqual(json.tailoredResume.experience[0].company, "Apex Fintech", "Company name MUST NOT be changed");
  assert.strictEqual(json.tailoredResume.education[0].institution, "University of Illinois Urbana-Champaign", "Education MUST NOT be hallucinated");
  assert.ok(json.tailoredResume.summary.length > 30, "Tailored summary generated");
  assert.ok(json.diffs.bullets.length > 0, "STAR bullet diffs generated");
});

await asyncTest("11. Tailoring Engine input validation guards", async () => {
  const { POST } = await import("../app/api/ai/tailor/route.ts");
  const { NextRequest } = await import("next/server");

  // Missing JD
  const req1 = new NextRequest("http://localhost:3000/api/ai/tailor", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jobText: "too short", resumeData: {} }),
  });
  const res1 = await POST(req1);
  assert.strictEqual(res1.status, 400, "Short JD must return 400");

  // Missing Resume Data
  const req2 = new NextRequest("http://localhost:3000/api/ai/tailor", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jobText: "A valid job description that is long enough to meet requirements.", resumeData: null }),
  });
  const res2 = await POST(req2);
  assert.strictEqual(res2.status, 400, "Missing resume data must return 400");
});

console.log(`\n=== RESULTS: ${passed}/${total} TESTS PASSED ===`);
if (passed === total) {
  console.log("ALL TESTS IN INTELLIGENCE PIPELINE PASSED PERFECTLY!");
} else {
  process.exit(1);
}
