import assert from "node:assert/strict";
import { parseResumeText, mergeAiParsedData, isGroundedInSource } from "../src/lib/resume-parser.ts";
import { normalizeResume } from "../src/lib/resume-normalizer.ts";
import { createDocxDocument } from "../src/lib/docx-generator.ts";
import { Packer } from "docx";
import mammoth from "mammoth";
import { TEMPLATES_REGISTRY, getTemplateById } from "../src/lib/templates-registry.ts";

console.log("=================================================");
console.log("  RESUME BUILDER FORENSIC TEST CORPUS (A - G)");
console.log("=================================================\n");

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}:`, err.message);
    throw err;
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}:`, err.message);
    throw err;
  }
}

// -------------------------------------------------------------------
// Resume A: 0-Project Candidate (Accountant / Operations)
// -------------------------------------------------------------------
runTest("Resume A: 0-project candidate produces exactly 0 projects with pass validation", () => {
  const resumeText = `
Jane Doe
Senior Financial Analyst
jane.doe@example.com | (555) 234-5678 | Chicago, IL
linkedin.com/in/janedoe

PROFESSIONAL SUMMARY
Experienced Financial Analyst with 7+ years of expertise in FP&A, budget variance analysis, and GAAP compliance.

PROFESSIONAL EXPERIENCE
Senior Financial Analyst
Horizon Capital | Chicago, IL | Jan 2021 – Present
• Spearheaded quarterly budget forecasting across 4 operating business units totaling $85M.
• Reduced financial close cycle by 3 days through automation of ledger reconciliation scripts.

Staff Accountant
Apex Advisory Group | Chicago, IL | Jun 2017 – Dec 2020
• Prepared monthly balance sheets, income statements, and cash flow reports.
• Audited 40+ corporate tax filings ensuring 100% compliance with federal tax guidelines.

EDUCATION
Bachelor of Science in Accounting
University of Illinois Urbana-Champaign | Urbana, IL | 2013 – 2017
GPA: 3.8/4.0

SKILLS
Financial Modeling, FP&A, QuickBooks, Microsoft Excel, SAP ERP, GAAP, Variance Analysis

CERTIFICATIONS
Certified Public Accountant (CPA) | AICPA | 2019
`;

  const parsed = parseResumeText(resumeText);

  // Exact counts
  assert.equal(parsed.projects.length, 0, "Must have exactly 0 projects");
  assert.equal(parsed.experience.length, 2, "Must have exactly 2 experience entries");
  assert.equal(parsed.education.length, 1, "Must have exactly 1 education entry");
  assert.equal(parsed.certifications.length, 1, "Must have exactly 1 certification");
  assert.ok(parsed.skills.length >= 5, "Must extract skills");

  // Reconciled validation
  assert.ok(parsed.validation, "Validation object must be present");
  const getSec = (name) => parsed.validation.sections.find((s) => s.section.toLowerCase() === name.toLowerCase());
  assert.equal(getSec("Projects").parsedCount, 0);
  assert.equal(getSec("Projects").status, "PASS");
  assert.equal(getSec("Experience").parsedCount, 2);
  assert.equal(getSec("Experience").status, "PASS");

  // Zero placeholder contamination
  for (const exp of parsed.experience) {
    assert.notEqual(exp.company, "Company");
    assert.notEqual(exp.position, "Role");
  }
});

// -------------------------------------------------------------------
// Resume B: Multi-Project Software Engineer (3 distinct projects)
// -------------------------------------------------------------------
runTest("Resume B: 3 distinct software projects with tech stacks and zero phantom splitting", () => {
  const resumeText = `
Alex Chen
Full Stack Software Engineer
alex.chen@dev.io | (415) 890-1234 | San Francisco, CA | github.com/alexchen
linkedin.com/in/alexchen

SUMMARY
Full Stack Engineer specializing in scalable web systems, distributed caching, and TypeScript microservices.

WORK EXPERIENCE
Software Engineer
TechFlow Systems | San Francisco, CA | Mar 2022 – Present
• Built high-throughput payment microservice processing $12M monthly volume.
• Improved system reliability from 99.4% to 99.99% by implementing Redis cache tiers.

PROJECTS
CloudMetrics Dashboard | https://github.com/alexchen/cloudmetrics
Technologies: Next.js, React, Tailwind CSS, Go, PostgreSQL
• Real-time cloud infrastructure monitoring dashboard deployed across 50+ Kubernetes nodes.
• Reduced mean time to detection (MTTD) by 45% using automated anomaly alerts.

DevCanvas Collaborative Whiteboard | https://canvas.alexchen.dev
Technologies: TypeScript, WebSockets, Canvas API, Redis
• Multiplayer interactive whiteboard supporting 100 simultaneous concurrent editors with zero lag.
• Architected conflict-free replicated data types (CRDT) for state convergence.

FastRoute API Gateway | https://github.com/alexchen/fastroute
Technologies: Rust, Tokio, Docker
• Ultra-low latency reverse proxy capable of handling 85,000 req/sec with under 2ms P99 latency.

EDUCATION
BS in Computer Science
UC Berkeley | Berkeley, CA | 2018 – 2022

SKILLS
TypeScript, React, Node.js, Go, Rust, PostgreSQL, Redis, Docker, Kubernetes
`;

  const parsed = parseResumeText(resumeText);

  assert.equal(parsed.projects.length, 3, "Must extract exactly 3 projects");
  assert.equal(parsed.projects[0].title, "CloudMetrics Dashboard");
  assert.ok(parsed.projects[0].technologies.length >= 3, "CloudMetrics must have technologies");
  assert.equal(parsed.projects[1].title, "DevCanvas Collaborative Whiteboard");
  assert.equal(parsed.projects[2].title, "FastRoute API Gateway");

  const getSec = (name) => parsed.validation.sections.find((s) => s.section.toLowerCase() === name.toLowerCase());
  assert.equal(getSec("Projects").parsedCount, 3);
  assert.equal(getSec("Projects").status, "PASS");
});

// -------------------------------------------------------------------
// Resume C: Date in Bullet Points (Anti-Splitting Regression)
// -------------------------------------------------------------------
runTest("Resume C: Dates mentioned within bullet text never cause false job entry splitting", () => {
  const resumeText = `
Maria Rodriguez
Senior Product Designer
maria@design.co | New York, NY

EXPERIENCE
Lead UX Designer
PixelCraft Studio | New York, NY | Jan 2021 – Present
• Orchestrated redesign of global banking mobile app in Summer 2022, boosting mobile DAU by 34%.
• Authored comprehensive design system in Q1 2023 adopted by 60+ engineers.
• Led sprint retrospectives throughout 2024 to accelerate delivery velocity by 18%.

UI Designer
CreativeCore Agency | New York, NY | Aug 2018 – Dec 2020
• Designed e-commerce checkout flow in October 2019 that reduced cart abandonment by 12%.
• Partnered with front-end team in Spring 2020 on accessible design standards.

EDUCATION
BFA in Graphic Design
Rhode Island School of Design | Providence, RI | 2014 – 2018
`;

  const parsed = parseResumeText(resumeText);

  // Despite "Summer 2022", "Q1 2023", "2024", "October 2019", "Spring 2020" in bullets,
  // there are exactly 2 distinct positions!
  assert.equal(parsed.experience.length, 2, "Must remain exactly 2 jobs despite dates in bullets");
  assert.equal(parsed.experience[0].company, "PixelCraft Studio");
  assert.equal(parsed.experience[1].company, "CreativeCore Agency");
  assert.equal(parsed.projects.length, 0, "No projects in this design resume");
});

// -------------------------------------------------------------------
// Resume D: Grounding Filter Anti-Hallucination on AI Merge
// -------------------------------------------------------------------
runTest("Resume D: Grounding Filter strips hallucinated AI entities not in source document", () => {
  const sourceText = `
John Smith
john.smith@gmail.com | (555) 123-4567 | Boston, MA
Senior Operations Manager with 10 years experience leading logistics teams.
`;

  // True heuristic extraction has 0 projects
  const base = parseResumeText(sourceText);
  assert.equal(base.projects.length, 0);

  // Simulated rogue AI output that invents fake projects and fake jobs
  const hallucinatedAi = {
    personalInfo: {
      fullName: "John Smith",
      email: "john.smith@gmail.com",
    },
    experience: [
      {
        company: "Fabricated Tech Corp Inc", // NOT in source!
        position: "Lead Blockchain Architect", // NOT in source!
        highlights: ["Invented new consensus mechanism"],
      },
    ],
    projects: [
      {
        title: "Hallucinated NFT Marketplace", // NOT in source!
        description: "Built smart contracts",
        technologies: ["Solidity", "Web3.js"],
      },
    ],
    skills: [
      { name: "Logistics" }, // IN source
      { name: "Superconducting Quantum Computing" }, // NOT in source
    ],
  };

  // Merge with Grounding Filter enforcement
  const merged = mergeAiParsedData(base, hallucinatedAi, sourceText);

  // Grounding filter must discard the hallucinated project
  assert.equal(merged.projects.length, 0, "Hallucinated project must be rejected by Grounding Filter");

  // Grounding filter must reject fabricated company not in source
  assert.equal(merged.experience.length, 0, "Fabricated experience must be rejected");

  // Grounding filter test helper
  assert.equal(isGroundedInSource("Logistics", sourceText), true);
  assert.equal(isGroundedInSource("Superconducting Quantum Computing", sourceText), false);
  assert.equal(isGroundedInSource("Hallucinated NFT Marketplace", sourceText), false);
});

// -------------------------------------------------------------------
// Resume E: Canonical Normalizer Fallback Discard
// -------------------------------------------------------------------
runTest("Resume E: Normalizer discards demo data fallback when partial imported data is provided", () => {
  const importedData = {
    personalInfo: {
      fullName: "Zara Khan",
      email: "zara@cloud.io",
      phone: "555-0199",
      location: "Seattle, WA",
      jobTitle: "Cloud Solutions Architect",
    },
    summary: "Cloud architect with AWS and Azure certs.",
    experience: [],
    education: [],
    skills: [{ id: "1", name: "AWS", category: "Cloud" }],
    projects: [], // user genuinely has 0 projects
  };

  const normalized = normalizeResume(importedData);

  // Must preserve candidate name, never substitute Alex Morgan
  assert.equal(normalized.personalInfo.fullName, "Zara Khan");
  assert.equal(normalized.projects.length, 0, "Must stay 0 projects, not fall back to demo projects");
  assert.equal(normalized.skills.length, 1);
  assert.equal(normalized.skills[0].name, "AWS");
});

// -------------------------------------------------------------------
// Resume F: DOCX Generation & Text Content Verification
// -------------------------------------------------------------------
await runAsyncTest("Resume F: DOCX document contains all canonical text sections including awards & interests", async () => {
  const testData = {
    personalInfo: {
      fullName: "Elena Rostova",
      email: "elena@quantum.org",
      phone: "+1 (555) 777-8888",
      location: "Boston, MA",
      jobTitle: "Quantum Computing Researcher",
    },
    summary: "Pioneering research in topological qubits and quantum error correction.",
    experience: [
      {
        id: "exp1",
        company: "MIT Quantum Labs",
        position: "Postdoctoral Research Fellow",
        location: "Cambridge, MA",
        startDate: "2022",
        endDate: "Present",
        current: true,
        description: "Designing surface code error correction protocols on 64-qubit processors.",
        highlights: ["Published 3 papers in Physical Review Letters", "Achieved 99.8% two-qubit gate fidelity"],
      },
    ],
    education: [
      {
        id: "edu1",
        institution: "Harvard University",
        degree: "Ph.D.",
        fieldOfStudy: "Applied Physics",
        startDate: "2017",
        endDate: "2022",
        gpa: "3.95",
      },
    ],
    projects: [
      {
        id: "proj1",
        title: "Q-Sim Quantum Circuit Simulator",
        technologies: ["Python", "Rust", "Qiskit"],
        description: "Open-source state-vector simulator supporting 36 qubits on commodity RAM.",
      },
    ],
    skills: [
      { id: "s1", name: "Quantum Error Correction", category: "Core" },
      { id: "s2", name: "Python", category: "Tech" },
      { id: "s3", name: "Qiskit", category: "Tech" },
    ],
    certifications: [
      { id: "c1", name: "IBM Certified Quantum Developer", issuer: "IBM", date: "2023" },
    ],
    awards: [
      { id: "a1", title: "National Science Foundation Graduate Research Fellowship", issuer: "NSF", date: "2019" },
    ],
    interests: [
      { id: "i1", name: "Astrophotography" },
      { id: "i2", name: "Violin" },
    ],
  };

  const doc = createDocxDocument(testData);
  const buffer = await Packer.toBuffer(doc);
  assert.ok(buffer.length > 5000, "DOCX buffer must be generated and non-empty");

  // Read raw text back from DOCX to verify zero section loss
  const extracted = await mammoth.extractRawText({ buffer });
  const rawText = extracted.value;

  assert.ok(rawText.includes("ELENA ROSTOVA"), "DOCX must contain candidate name");
  assert.ok(rawText.includes("MIT Quantum Labs"), "DOCX must contain company name");
  assert.ok(rawText.includes("Harvard University"), "DOCX must contain university");
  assert.ok(rawText.includes("Q-Sim Quantum Circuit Simulator"), "DOCX must contain project title");
  assert.ok(rawText.includes("IBM Certified Quantum Developer"), "DOCX must contain certification");
  assert.ok(rawText.includes("National Science Foundation"), "DOCX must contain awards");
  assert.ok(rawText.includes("Astrophotography"), "DOCX must contain interests");
});

// -------------------------------------------------------------------
// Resume G: 50-Template Switching Zero Data Loss
// -------------------------------------------------------------------
runTest("Resume G: All 50 registered templates resolve validly with zero exceptions", () => {
  assert.equal(TEMPLATES_REGISTRY.length, 50, "Registry must contain exactly 50 professional templates");

  for (const t of TEMPLATES_REGISTRY) {
    const resolved = getTemplateById(t.id);
    assert.equal(resolved.id, t.id, `Template ${t.id} must resolve properly`);
    assert.ok(resolved.name, `Template ${t.id} must have a name`);
    assert.ok(resolved.category, `Template ${t.id} must have a category`);
    assert.ok(resolved.layoutStyle, `Template ${t.id} must specify layoutStyle`);
    assert.ok(resolved.headingStyle, `Template ${t.id} must specify headingStyle`);
    assert.ok(resolved.headerStyle, `Template ${t.id} must specify headerStyle`);
  }
});

console.log(`\n=================================================`);
console.log(`  ALL ${passedTests}/${totalTests} FORENSIC TESTS PASSED!`);
console.log(`=================================================\n`);
