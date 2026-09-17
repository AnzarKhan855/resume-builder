import {
  ResumeData,
  INITIAL_RESUME_DATA,
  DEFAULT_SECTION_ORDER,
  DEFAULT_CUSTOMIZATION,
  ExperienceItem,
  EducationItem,
  ProjectItem,
  SkillItem,
} from "@/src/types/resume";
import { generateId } from "./resume-normalizer";

/**
 * Intelligent Rule-Based Resume Text Parser
 */
export function parseResumeText(rawText: string): ResumeData {
  const text = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // 1. Extract Contact Info
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : "";

  const phoneMatch = text.match(
    /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?/i
  ) || text.match(/\+?\d[\d\s\-().]{8,}\d/);
  const phone = phoneMatch ? phoneMatch[0].trim() : "";

  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  const linkedin = linkedinMatch ? linkedinMatch[0] : "";

  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  const github = githubMatch ? githubMatch[0] : "";

  const websiteMatch = text.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.(?:com|dev|io|me|org|net|app)(?:\/[^\s]*)?)/i);
  const website = websiteMatch && !websiteMatch[0].includes("linkedin") && !websiteMatch[0].includes("github")
    ? websiteMatch[0]
    : "";

  // Extract candidate name: typically the first prominent line that isn't a header or email
  let fullName = "";
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    if (
      line.includes("@") ||
      line.includes("http") ||
      line.includes("www.") ||
      line.includes("linkedin") ||
      /resume|curriculum vitae|cv/i.test(line) ||
      /\d{3}/.test(line)
    ) {
      continue;
    }
    if (line.length > 2 && line.length < 50 && !line.includes(":")) {
      fullName = line;
      break;
    }
  }

  // Section heading patterns
  const sectionKeywords: { [key: string]: RegExp } = {
    summary: /^(summary|professional summary|executive summary|about me|profile|objective|career objective)$/i,
    experience: /^(experience|work experience|employment history|work history|professional experience|career history)$/i,
    education: /^(education|academic background|academics|qualifications|degrees)$/i,
    skills: /^(skills|technical skills|technologies|core competencies|areas of expertise|tech stack)$/i,
    projects: /^(projects|personal projects|key projects|featured projects|portfolio)$/i,
    certifications: /^(certifications|licenses|courses|certifications & licenses)$/i,
    languages: /^(languages|spoken languages)$/i,
    achievements: /^(achievements|honors|awards|honors & awards|accomplishments)$/i,
  };

  // Group lines into sections
  const sections: { [key: string]: string[] } = {
    summary: [],
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    achievements: [],
    other: [],
  };

  let currentSection: string | null = null;

  for (const line of lines) {
    let matchedHeading = false;
    for (const [secKey, pattern] of Object.entries(sectionKeywords)) {
      if (pattern.test(line.replace(/[:_#-]/g, "").trim())) {
        currentSection = secKey;
        matchedHeading = true;
        break;
      }
    }

    if (matchedHeading) continue;

    if (currentSection && sections[currentSection]) {
      sections[currentSection].push(line);
    } else {
      sections.other.push(line);
    }
  }

  // 2. Parse Summary
  const summary = sections.summary.join(" ");

  // 3. Parse Skills
  const rawSkillsText = sections.skills.join("\n");
  const skillTokens = rawSkillsText
    .split(/[,;\n•|·\t]+/)
    .map((s) => s.replace(/^[•\-\*]\s*/, "").trim())
    .filter((s) => s.length > 1 && s.length < 40 && !s.includes(":"));

  const uniqueSkills = Array.from(new Set(skillTokens));
  const skills: SkillItem[] = uniqueSkills.map((name) => ({
    id: generateId(),
    name,
    category: "General",
    level: "Intermediate",
  }));

  // 4. Parse Experience
  const experience: ExperienceItem[] = [];
  const expLines = sections.experience;
  let currentExp: Partial<ExperienceItem> | null = null;

  for (let i = 0; i < expLines.length; i++) {
    const line = expLines[i];
    // Date matcher: e.g. 2020 - Present, Jan 2019 – Mar 2022, 05/2020 - 08/2021
    const dateMatch = line.match(
      /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|\d{4}|\d{1,2}\/\d{4})\s*(?:-|–|—|to)\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|\d{4}|\d{1,2}\/\d{4}|Present|Current)/i
    );

    if (dateMatch) {
      if (currentExp && currentExp.company) {
        experience.push(finishExperience(currentExp));
      }

      // Check if title or company is in this line or previous line
      const lineWithoutDates = line.replace(dateMatch[0], "").replace(/^[|·•,-]\s*/, "").trim();
      const prevLine = i > 0 ? expLines[i - 1] : "";

      currentExp = {
        id: generateId(),
        startDate: dateMatch[1].trim(),
        endDate: dateMatch[2].trim(),
        current: /present|current/i.test(dateMatch[2]),
        company: lineWithoutDates || prevLine || "Company",
        position: prevLine && lineWithoutDates ? prevLine : lineWithoutDates || "Role",
        description: "",
        highlights: [],
      };
    } else if (currentExp) {
      if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
        currentExp.highlights = currentExp.highlights || [];
        currentExp.highlights.push(line.replace(/^[•\-\*]\s*/, ""));
      } else {
        if (!currentExp.description) {
          currentExp.description = line;
        } else {
          currentExp.description += " " + line;
        }
      }
    }
  }
  if (currentExp && currentExp.company) {
    experience.push(finishExperience(currentExp));
  }

  // 5. Parse Education
  const education: EducationItem[] = [];
  const eduLines = sections.education;
  let currentEdu: Partial<EducationItem> | null = null;

  for (const line of eduLines) {
    const dateMatch = line.match(/\b(19\d\d|20\d\d)\s*(?:-|–|—|to)\s*(19\d\d|20\d\d|Present)\b/i) ||
      line.match(/\b(19\d\d|20\d\d)\b/);

    const isDegreeLine = /bachelor|master|phd|doctor|associate|b\.s\.|b\.a\.|m\.s\.|m\.a\.|btech|degree|diploma/i.test(line);

    if (isDegreeLine || dateMatch) {
      if (currentEdu && currentEdu.institution) {
        education.push(finishEducation(currentEdu));
      }
      currentEdu = {
        id: generateId(),
        institution: isDegreeLine ? "" : line.replace(/^[|·•,-]\s*/, ""),
        degree: isDegreeLine ? line : "Degree",
        fieldOfStudy: "",
        startDate: dateMatch ? (dateMatch[1] || "") : "",
        endDate: dateMatch ? (dateMatch[2] || dateMatch[0]) : "",
        current: dateMatch ? /present/i.test(dateMatch[0]) : false,
        achievements: [],
      };
    } else if (currentEdu) {
      if (!currentEdu.institution) {
        currentEdu.institution = line;
      } else if (!currentEdu.fieldOfStudy) {
        currentEdu.fieldOfStudy = line;
      }
    }
  }
  if (currentEdu && (currentEdu.institution || currentEdu.degree)) {
    education.push(finishEducation(currentEdu));
  }

  // 6. Parse Projects
  const projects: ProjectItem[] = [];
  const projLines = sections.projects;
  let currentProj: Partial<ProjectItem> | null = null;

  for (const line of projLines) {
    if (line.startsWith("•") || line.startsWith("-")) {
      if (currentProj) {
        currentProj.description = (currentProj.description ? currentProj.description + " " : "") + line.replace(/^[•\-]\s*/, "");
      }
    } else if (line.length < 80 && !line.includes(". ")) {
      if (currentProj && currentProj.title) {
        projects.push(finishProject(currentProj));
      }
      currentProj = {
        id: generateId(),
        title: line,
        description: "",
        technologies: [],
      };
    } else if (currentProj) {
      currentProj.description = (currentProj.description ? currentProj.description + " " : "") + line;
    }
  }
  if (currentProj && currentProj.title) {
    projects.push(finishProject(currentProj));
  }

  return {
    title: fullName ? `${fullName} — Resume` : "Imported Resume",
    template: "modern",
    personalInfo: {
      fullName: fullName || "Full Name",
      email: email || "",
      phone: phone || "",
      location: "",
      jobTitle: experience[0]?.position || "",
      website: website || "",
      linkedin: linkedin || "",
      github: github || "",
    },
    summary,
    experience,
    education,
    projects,
    skills,
    certifications: sections.certifications.map((c) => ({
      id: generateId(),
      name: c.replace(/^[•\-]\s*/, ""),
      issuer: "",
      date: "",
    })),
    achievements: sections.achievements.map((a) => ({
      id: generateId(),
      title: a.replace(/^[•\-]\s*/, ""),
      description: "",
    })),
    languages: sections.languages.map((l) => ({
      id: generateId(),
      language: l.replace(/^[•\-]\s*/, ""),
      proficiency: "Professional",
    })),
    customSections: [],
    sectionOrder: DEFAULT_SECTION_ORDER,
    customization: DEFAULT_CUSTOMIZATION,
  };
}

function finishExperience(item: Partial<ExperienceItem>): ExperienceItem {
  return {
    id: item.id || generateId(),
    company: item.company || "Company",
    position: item.position || "Role",
    location: item.location || "",
    startDate: item.startDate || "",
    endDate: item.endDate || "",
    current: Boolean(item.current),
    description: item.description || (item.highlights ? item.highlights.join("\n• ") : ""),
    highlights: item.highlights || [],
  };
}

function finishEducation(item: Partial<EducationItem>): EducationItem {
  return {
    id: item.id || generateId(),
    institution: item.institution || "Institution",
    degree: item.degree || "Degree",
    fieldOfStudy: item.fieldOfStudy || "",
    location: item.location || "",
    startDate: item.startDate || "",
    endDate: item.endDate || "",
    current: Boolean(item.current),
    gpa: item.gpa || "",
    achievements: item.achievements || [],
  };
}

function finishProject(item: Partial<ProjectItem>): ProjectItem {
  return {
    id: item.id || generateId(),
    title: item.title || "Project",
    subtitle: item.subtitle || "",
    link: item.link || "",
    github: item.github || "",
    description: item.description || "",
    technologies: item.technologies || [],
  };
}
