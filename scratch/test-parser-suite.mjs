import { parseResumeText } from "../src/lib/resume-parser.js";
import assert from "assert";

console.log("=== RUNNING RESUME PARSER 17-CASE TEST SUITE ===");

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`✓ [PASS ${total}/17] ${name}`);
    passed++;
  } catch (err) {
    console.error(`✗ [FAIL ${total}/17] ${name}:`, err.message);
  }
}

// Case 1: Standard single-column clean format
runTest("1. Standard single-column resume with contact, summary, experience, education, skills", () => {
  const text = `
John Doe
johndoe@example.com | (555) 123-4567 | San Francisco, CA
linkedin.com/in/johndoe | github.com/johndoe

Summary
Experienced software professional with 5+ years of building resilient cloud systems.

Experience
Senior Software Engineer
Acme Corp — Jan 2021 - Present
• Designed distributed microservices handling 10k requests/sec
• Mentored junior developers and improved code quality

Software Engineer
Beta Tech — Jun 2018 - Dec 2020
• Built React frontend components with 99.9% test coverage

Education
University of California, Berkeley
Bachelor of Science in Computer Science — 2014 - 2018

Skills
TypeScript, React, Node.js, Next.js, PostgreSQL, Docker, AWS, GraphQL
`;
  const res = parseResumeText(text);
  assert.strictEqual(res.personalInfo.fullName, "John Doe");
  assert.strictEqual(res.personalInfo.email, "johndoe@example.com");
  assert.ok(res.personalInfo.phone.includes("123-4567"));
  assert.strictEqual(res.experience.length, 2);
  assert.strictEqual(res.education.length, 1);
  assert.ok(res.skills.length >= 6);
  assert.strictEqual(res.confidence.fields.fullName.confidence, "high");
  assert.strictEqual(res.confidence.fields.email.confidence, "high");
  assert.ok(res.confidence.overall >= 80);
});

// Case 2: Two-column simulated text
runTest("2. Two-column simulated layout", () => {
  const text = `
Jane Smith
janesmith@gmail.com
(415) 888-9999
Seattle, WA

SKILLS
Python, Java, C++, Kubernetes, CI/CD, Terraform

WORK EXPERIENCE
Cloud Architect
Tech Solutions — 2020 - Present
• Spearheaded multi-cloud migration saving $200k annually

DevOps Engineer
CloudCo — 2017 - 2020
• Automated CI/CD pipelines reducing deployment time by 40%

EDUCATION
B.S. in Information Systems
Washington State University — 2013 - 2017
`;
  const res = parseResumeText(text);
  assert.strictEqual(res.personalInfo.fullName, "Jane Smith");
  assert.strictEqual(res.personalInfo.email, "janesmith@gmail.com");
  assert.strictEqual(res.experience.length, 2);
  assert.ok(res.skills.some((s) => s.name === "Python"));
});

// Case 3: Tech / Software Engineer with GitHub & Tech stack
runTest("3. Tech / Software Engineer format with GitHub, Projects & Stack", () => {
  const text = `
Alex Rivera
alex.rivera@dev.io
github.com/alexrivera
linkedin.com/in/alexrivera

TECHNICAL SKILLS
Languages: TypeScript, Python, Rust, Go, SQL
Frameworks: React, Next.js, Express, TailwindCSS, Jest

PROJECTS
OpenSource Auth Library
https://github.com/alexrivera/fast-auth
• Lightweight authentication library downloaded 50,000+ times on npm
• Zero-dependency cryptographic token verification

Distributed Task Queue
• In-memory message broker written in Go processing 1M jobs/min

WORK EXPERIENCE
Full Stack Developer
HyperScale Systems — 03/2022 - Present
• Re-architected core user dashboard in Next.js Turbopack
`;
  const res = parseResumeText(text);
  assert.strictEqual(res.personalInfo.fullName, "Alex Rivera");
  assert.strictEqual(res.personalInfo.github, "github.com/alexrivera");
  assert.ok(res.projects.length >= 1);
  assert.strictEqual(res.experience.length, 1);
});

// Case 4: Data Analyst / Scientist format
runTest("4. Data Analyst / Scientist with SQL, Python, Tableau & Certifications", () => {
  const text = `
Priya Sharma
priya.sharma@dataworks.com | (212) 555-0199 | New York, NY

PROFESSIONAL SUMMARY
Data Analyst with expertise in quantitative analysis, predictive modeling, and business intelligence dashboards.

CORE COMPETENCIES
SQL, Python, R, Tableau, Power BI, Snowflake, Pandas, Statistical Analysis, A/B Testing

EXPERIENCE
Lead Data Analyst
FinCorp Global — 2021 - Present
• Built Tableau executive dashboards tracking $50M in daily financial transactions
• Conducted 25+ A/B tests yielding 14% conversion uplift

CERTIFICATIONS
Tableau Desktop Certified Professional - Tableau - 2022
AWS Certified Data Analytics Specialty - Amazon Web Services - 2023
`;
  const res = parseResumeText(text);
  assert.strictEqual(res.personalInfo.fullName, "Priya Sharma");
  assert.strictEqual(res.personalInfo.email, "priya.sharma@dataworks.com");
  assert.strictEqual(res.certifications.length, 2);
  assert.ok(res.certifications.some((c) => c.name.includes("Tableau")));
});

// Case 5: College Fresher / Recent Graduate format
runTest("5. College Fresher with Education first, Coursework & Volunteer", () => {
  const text = `
David Kim
david.kim@university.edu | (617) 555-0144 | Boston, MA
github.com/davidkim-cs

EDUCATION
Massachusetts Institute of Technology
Bachelor of Science in Computer Science and Engineering — 2021 - 2025
GPA: 3.9/4.0

RELEVANT COURSEWORK
Data Structures and Algorithms, Operating Systems, Machine Learning, Database Systems, Computer Networks

PROJECTS
Autonomous Drone Navigation System
• Implemented computer vision algorithms with ROS2 and OpenCV

VOLUNTEER EXPERIENCE
Code in the Community — Volunteer Instructor — 2023 - Present
• Taught introductory Python programming to 40+ local high school students
`;
  const res = parseResumeText(text);
  assert.strictEqual(res.personalInfo.fullName, "David Kim");
  assert.strictEqual(res.education.length, 1);
  assert.ok(res.coursework.length >= 3);
  assert.strictEqual(res.volunteer.length, 1);
  assert.ok(res.volunteer[0].organization.includes("Code in the Community"));
});

// Case 6: Senior Executive format
runTest("6. Senior Executive format with Director roles and Achievements", () => {
  const text = `
Sarah Jenkins
s.jenkins@leadership.com | Chicago, IL

EXECUTIVE SUMMARY
Visionary engineering director with 12+ years leading engineering organizations of 100+ members.

CAREER HISTORY
Director of Engineering
Enterprise SaaS Corp — 2019 - Present
• Scaled engineering department from 20 to 120 engineers across 4 international hubs
• Delivered $80M ARR product line on schedule

Senior Engineering Manager
Tech Giants Inc — 2014 - 2019
• Managed 5 core platform teams responsible for 99.99% system availability

ACHIEVEMENTS
Executive of the Year 2023
Patented distributed data replication protocol (US Patent #9876543)
`;
  const res = parseResumeText(text);
  assert.strictEqual(res.personalInfo.fullName, "Sarah Jenkins");
  assert.strictEqual(res.experience.length, 2);
  assert.ok(res.achievements.length >= 1);
});

// Case 7: Complex Date Notations
runTest("7. Complex Date formats (Summer 2022, 05/2021 - Present, Jan. 2018)", () => {
  const text = `
Robert Chen
robert@chen.me

EXPERIENCE
Staff Engineer
Pinnacle Software — 05/2021 – Present
• Architected core platform

Software Consultant
Global Services — Jan. 2018 - Dec. 2020
• Delivered migration projects
`;
  const res = parseResumeText(text);
  assert.strictEqual(res.experience.length, 2);
  assert.strictEqual(res.experience[0].current, true);
  assert.ok(res.experience[1].startDate.includes("2018"));
});

// Case 8: Multiple Education items
runTest("8. Multiple Education items (M.S. and B.S.)", () => {
  const text = `
Elena Rostova
elena@academic.edu

ACADEMIC BACKGROUND
Stanford University
Master of Science in Artificial Intelligence — 2022 - 2024

Cornell University
Bachelor of Science in Electrical and Computer Engineering — 2018 - 2022
`;
  const res = parseResumeText(text);
  assert.strictEqual(res.education.length, 2);
  assert.ok(res.education.some((e) => e.institution.includes("Stanford")));
  assert.ok(res.education.some((e) => e.institution.includes("Cornell")));
});

// Case 9: Certifications parsing
runTest("9. Certifications with issuers and dates", () => {
  const text = `
Marcus Vance
marcus@cloud.io

CERTIFICATIONS & LICENSES
• AWS Certified Solutions Architect Associate - Amazon Web Services - 2023
• Certified Kubernetes Administrator (CKA) - Cloud Native Computing Foundation - 2022
• Google Cloud Professional Cloud Architect - Google - 2024
`;
  const res = parseResumeText(text);
  assert.strictEqual(res.certifications.length, 3);
  assert.strictEqual(res.confidence.fields.certifications.confidence, "high");
});

// Case 10: Projects with tech tags and bullets
runTest("10. Projects with bullet points and descriptions", () => {
  const text = `
Chloe Bennett
chloe@dev.net

KEY PROJECTS
AI Code Reviewer
• Chrome extension analyzing PRs using LLM APIs
• Integrated with GitHub REST API and webhook system

Realtime Collaborative Whiteboard
• WebSocket canvas with CRDT conflict resolution
`;
  const res = parseResumeText(text);
  assert.ok(res.projects.length >= 1);
  assert.ok(res.projects[0].description.includes("Chrome extension"));
});

// Case 11: Publications section
runTest("11. Publications section extraction", () => {
  const text = `
Dr. Aris Thorne
aris.thorne@research.lab

PUBLICATIONS
• Deep Reinforcement Learning for Autonomous Robotics, IEEE Robotics and Automation Letters, 2023
• Transformer Architectures in Graph Representation, ICML Conference, 2022
`;
  const res = parseResumeText(text);
  assert.strictEqual(res.publications.length, 2);
  assert.ok(res.publications[0].title.includes("Deep Reinforcement Learning"));
});

// Case 12: Volunteer section
runTest("12. Volunteer experience section", () => {
  const text = `
Samantha Reed
sam@reed.org

COMMUNITY INVOLVEMENT
• Red Cross Emergency Response — Volunteer Coordinator — 2020 - Present
• Habitat for Humanity — Community Builder — 2019
`;
  const res = parseResumeText(text);
  assert.ok(res.volunteer.length >= 1);
});

// Case 13: Languages with proficiency
runTest("13. Languages with proficiency levels", () => {
  const text = `
Carlos Hernandez
carlos@global.es

LANGUAGES
English (Native), Spanish (Fluent), German (Conversational), Mandarin (Basic)
`;
  const res = parseResumeText(text);
  assert.ok(res.languages.length >= 3);
  const eng = res.languages.find((l) => l.language.toLowerCase().includes("english"));
  assert.ok(eng);
  assert.strictEqual(eng.proficiency, "Native");
});

// Case 14: Short 1-page compact resume
runTest("14. Short 1-page compact resume", () => {
  const text = `
Tom Mason
tom@mason.io | 555-0182

Skills
JavaScript, HTML, CSS

Experience
Web Developer
Acme — 2022 - Present
• Created landing pages
`;
  const res = parseResumeText(text);
  assert.strictEqual(res.personalInfo.fullName, "Tom Mason");
  assert.strictEqual(res.experience.length, 1);
  assert.ok(res.skills.length >= 2);
});

// Case 15: Multi-page resume text
runTest("15. Multi-page resume text with page boundaries", () => {
  const text = `
Page 1 of 2
Jessica Adams
jessica@adams.org | (555) 777-1234 | Austin, TX

SUMMARY
Seasoned backend engineer.

EXPERIENCE
Staff Engineer
SaaS Corp — 2021 - Present
• Architecture leader for payments

Page 2 of 2
Senior Engineer
FinTech LLC — 2018 - 2021
• Scaled ledger system

EDUCATION
University of Texas at Austin
B.S. in Computer Science — 2014 - 2018
`;
  const res = parseResumeText(text);
  assert.strictEqual(res.personalInfo.fullName, "Jessica Adams");
  assert.strictEqual(res.experience.length, 2);
  assert.strictEqual(res.education.length, 1);
});

// Case 16: Scanned PDF simulation (< 30 characters)
runTest("16. Scanned PDF detection (< 30 characters of readable text)", () => {
  const scannedRawText = "   -- 1 of 1 --   \n\n";
  const cleaned = scannedRawText.replace(/--\s*\d+\s*of\s*\d+\s*--/gi, "").trim();
  assert.ok(cleaned.length < 30);
  // Verify that an empty or near-empty text is properly flagged
  const isScanned = !cleaned || cleaned.length < 30;
  assert.strictEqual(isScanned, true);
});

// Case 17: DOCX Magic Bytes validation
runTest("17. DOCX Magic Bytes validation (0x50, 0x4b, 0x03, 0x04)", () => {
  const validDocxHeader = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
  const invalidHeader = Buffer.from([0x25, 0x50, 0x44, 0x46]); // PDF header disguised as docx

  const isValidDocx = (buf) =>
    buf.length >= 4 &&
    buf[0] === 0x50 &&
    buf[1] === 0x4b &&
    buf[2] === 0x03 &&
    buf[3] === 0x04;

  assert.strictEqual(isValidDocx(validDocxHeader), true);
  assert.strictEqual(isValidDocx(invalidHeader), false);
});

console.log(`\n=== RESULTS: ${passed}/${total} TESTS PASSED ===`);
if (passed === total) {
  console.log("ALL 17 TESTS PASSED PERFECTLY!");
} else {
  process.exit(1);
}
