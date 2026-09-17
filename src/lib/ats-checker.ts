import { ResumeData } from "@/src/types/resume";

export interface AtsCheckItem {
  id: string;
  category: "structure" | "content" | "impact" | "skills";
  label: string;
  passed: boolean;
  score: number;
  maxScore: number;
  tip?: string;
}

export interface AtsAuditResult {
  score: number; // 0 - 100
  grade: "A+" | "A" | "B" | "C" | "Needs Improvement";
  passedChecksCount: number;
  totalChecksCount: number;
  checks: AtsCheckItem[];
  actionVerbsFound: string[];
  metricsFound: string[];
  recommendations: string[];
}

const ACTION_VERBS = [
  "architected",
  "spearheaded",
  "optimized",
  "accelerated",
  "orchestrated",
  "engineered",
  "designed",
  "delivered",
  "implemented",
  "developed",
  "automated",
  "streamlined",
  "scaled",
  "reduced",
  "increased",
  "generated",
  "championed",
  "led",
  "managed",
  "resolved",
  "mentored",
  "transformed",
  "built",
  "established",
  "executed",
  "launched",
  "pioneered",
  "restructured",
];

export function auditResumeForAts(data: ResumeData): AtsAuditResult {
  const checks: AtsCheckItem[] = [];
  const recommendations: string[] = [];

  // --- 1. Structure & Contact (25 pts) ---
  const hasName = Boolean(data.personalInfo?.fullName?.trim());
  checks.push({
    id: "name",
    category: "structure",
    label: "Candidate Full Name provided",
    passed: hasName,
    score: hasName ? 5 : 0,
    maxScore: 5,
    tip: hasName ? undefined : "Add your legal first and last name to the top header.",
  });

  const hasEmail = Boolean(
    data.personalInfo?.email &&
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(data.personalInfo.email)
  );
  checks.push({
    id: "email",
    category: "structure",
    label: "Valid professional email address",
    passed: hasEmail,
    score: hasEmail ? 5 : 0,
    maxScore: 5,
    tip: hasEmail ? undefined : "Include an email address (e.g. name@gmail.com).",
  });

  const hasPhone = Boolean(data.personalInfo?.phone?.trim());
  checks.push({
    id: "phone",
    category: "structure",
    label: "Telephone contact number",
    passed: hasPhone,
    score: hasPhone ? 5 : 0,
    maxScore: 5,
    tip: hasPhone ? undefined : "Provide a contact phone number.",
  });

  const hasLocation = Boolean(data.personalInfo?.location?.trim());
  checks.push({
    id: "location",
    category: "structure",
    label: "Location (City, State / Country)",
    passed: hasLocation,
    score: hasLocation ? 5 : 0,
    maxScore: 5,
    tip: hasLocation ? undefined : "Recruiters and ATS filter candidates by City, State.",
  });

  const hasTitle = Boolean(data.personalInfo?.jobTitle?.trim());
  checks.push({
    id: "title",
    category: "structure",
    label: "Target professional headline / role title",
    passed: hasTitle,
    score: hasTitle ? 5 : 0,
    maxScore: 5,
    tip: hasTitle ? undefined : "Add a clear job headline matching your target role.",
  });

  // --- 2. Content & Experience (30 pts) ---
  const hasSummary = Boolean(data.summary && data.summary.trim().length >= 40);
  checks.push({
    id: "summary",
    category: "content",
    label: "Professional summary statement (40+ characters)",
    passed: hasSummary,
    score: hasSummary ? 10 : 0,
    maxScore: 10,
    tip: hasSummary ? undefined : "Write a 2-3 sentence executive summary highlighting your career impact.",
  });

  const hasExperience = Boolean(data.experience && data.experience.length >= 1);
  checks.push({
    id: "experience-present",
    category: "content",
    label: "Work experience section with roles",
    passed: hasExperience,
    score: hasExperience ? 10 : 0,
    maxScore: 10,
    tip: hasExperience ? undefined : "Add at least one professional work experience or internship entry.",
  });

  const hasDates = Boolean(
    data.experience &&
      data.experience.length > 0 &&
      data.experience.every((e) => e.startDate && (e.endDate || e.current))
  );
  checks.push({
    id: "dates",
    category: "content",
    label: "Consistent employment date ranges",
    passed: hasDates,
    score: hasDates ? 10 : 0,
    maxScore: 10,
    tip: hasDates ? undefined : "Ensure every work experience role has start and end dates.",
  });

  // --- 3. Action Verbs & Measurable Metrics (25 pts) ---
  const allText = [
    data.summary || "",
    ...(data.experience || []).map((e) => `${e.description} ${(e.highlights || []).join(" ")}`),
    ...(data.projects || []).map((p) => p.description || ""),
  ].join(" ").toLowerCase();

  const actionVerbsFound = Array.from(
    new Set(ACTION_VERBS.filter((verb) => new RegExp(`\\b${verb}\\b`, "i").test(allText)))
  );

  const hasStrongVerbs = actionVerbsFound.length >= 4;
  checks.push({
    id: "action-verbs",
    category: "impact",
    label: `Action verbs found (${actionVerbsFound.length} of 4+ recommended)`,
    passed: hasStrongVerbs,
    score: Math.min(15, actionVerbsFound.length * 3),
    maxScore: 15,
    tip: hasStrongVerbs
      ? undefined
      : "Start your bullet points with powerful action verbs like 'Architected', 'Spearheaded', 'Optimized'.",
  });

  // Quantifiable metrics: numbers with %, $, k, M, or standalone numbers
  const metricRegex = /(?:\$\s*\d+(?:\.\d+)?|\b\d+%\b|\b\d+(?:,\d{3})+\b|\b\d+\s*(?:k|m|million|billion)\b)/gi;
  const metricsFound = Array.from(new Set(allText.match(metricRegex) || []));
  const hasMetrics = metricsFound.length >= 2;
  checks.push({
    id: "metrics",
    category: "impact",
    label: `Quantifiable metrics & numbers (${metricsFound.length} found)`,
    passed: hasMetrics,
    score: hasMetrics ? 10 : metricsFound.length > 0 ? 5 : 0,
    maxScore: 10,
    tip: hasMetrics
      ? undefined
      : "Quantify your impact using numbers, percentages, or dollar amounts (e.g. 'boosted retention by 24%').",
  });

  // --- 4. Skills & Education (20 pts) ---
  const skillCount = (data.skills || []).length;
  const hasSufficientSkills = skillCount >= 5;
  checks.push({
    id: "skills-count",
    category: "skills",
    label: `Technical / Core Skills (${skillCount} of 5+ recommended)`,
    passed: hasSufficientSkills,
    score: hasSufficientSkills ? 10 : Math.min(10, skillCount * 2),
    maxScore: 10,
    tip: hasSufficientSkills
      ? undefined
      : "Include at least 5 relevant technical or industry skills.",
  });

  const hasEducation = Boolean(data.education && data.education.length >= 1);
  checks.push({
    id: "education-present",
    category: "skills",
    label: "Formal education or academic credential",
    passed: hasEducation,
    score: hasEducation ? 10 : 0,
    maxScore: 10,
    tip: hasEducation ? undefined : "Add your degree, university, or certificate.",
  });

  // Calculate total score
  const totalScore = checks.reduce((sum, c) => sum + c.score, 0);
  const passedChecksCount = checks.filter((c) => c.passed).length;

  let grade: AtsAuditResult["grade"] = "Needs Improvement";
  if (totalScore >= 90) grade = "A+";
  else if (totalScore >= 80) grade = "A";
  else if (totalScore >= 70) grade = "B";
  else if (totalScore >= 55) grade = "C";

  // Build recommendations
  checks.forEach((c) => {
    if (!c.passed && c.tip) {
      recommendations.push(c.tip);
    }
  });

  return {
    score: totalScore,
    grade,
    passedChecksCount,
    totalChecksCount: checks.length,
    checks,
    actionVerbsFound,
    metricsFound,
    recommendations,
  };
}
