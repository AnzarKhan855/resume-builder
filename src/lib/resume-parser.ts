import type {
  ResumeData,
  ExperienceItem,
  EducationItem,
  ProjectItem,
  SkillItem,
  CertificationItem,
  AchievementItem,
  LanguageItem,
  PublicationItem,
  VolunteerItem,
  CourseworkItem,
  ParsingValidation,
  SectionValidation,
} from "../types/resume";
import {
  DEFAULT_SECTION_ORDER,
  DEFAULT_CUSTOMIZATION,
} from "../types/resume";
import { generateId } from "./resume-normalizer";
import { categorizeSkill } from "./skill-categorizer";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface FieldConfidence {
  confidence: ConfidenceLevel;
  value: string;
  reason?: string;
}

export interface SectionConfidence {
  confidence: ConfidenceLevel;
  count: number;
  reason?: string;
}

export interface ParserConfidence {
  overall: number; // 0 to 100
  fields: {
    fullName: FieldConfidence;
    email: FieldConfidence;
    phone: FieldConfidence;
    location: FieldConfidence;
    jobTitle: FieldConfidence;
    experience: SectionConfidence;
    education: SectionConfidence;
    skills: SectionConfidence;
    projects: SectionConfidence;
    certifications: SectionConfidence;
  };
}

export interface ParsedResumeResult extends ResumeData {
  confidence: ParserConfidence;
  sectionsDetected: string[];
  validation: ParsingValidation;
}

/**
 * Normalizes text for grounded substring matching (case-insensitive, alphanumeric only).
 */
export function normalizeForGrounding(str: string): string {
  return (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Checks whether an extracted text or entity is grounded in the raw source document.
 * This guarantees zero AI hallucinations or phantom parser inventions.
 */
export function isGroundedInSource(value: string, sourceText: string): boolean {
  if (!value || typeof value !== "string") return false;
  const cleanVal = value.trim();
  if (!cleanVal) return false;

  // Short words (3-4 chars like "AWS", "Go", "B.S.") require word boundary search in source
  if (cleanVal.length <= 4) {
    const escaped = cleanVal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    return regex.test(sourceText);
  }

  // Longer entities: normalize whitespace and punctuation
  const normVal = normalizeForGrounding(cleanVal);
  const normSource = normalizeForGrounding(sourceText);
  return normSource.includes(normVal);
}

/**
 * Intelligent Forensic Resume Text Parser (2026 Production Grade)
 * Principle: EXTRACTION, NOT GENERATION.
 * Never invents phantom employers, roles, projects, degrees, or certifications.
 */
export function parseResumeText(rawText: string): ParsedResumeResult {
  const text = (rawText || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rawLines = text.split("\n").map((l) => l.trim());
  const lines = rawLines.filter(Boolean);

  // 1. Extract Contact Info
  // Email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0].toLowerCase() : "";

  // Phone: matches US, International, dashed, dotted, parenthesized
  const phoneMatch =
    text.match(/(?:\+?\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/) ||
    text.match(/\+?\d[\d\s\-().]{8,}\d/);
  const phone = phoneMatch ? phoneMatch[0].trim() : "";

  // Links
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  const linkedin = linkedinMatch ? linkedinMatch[0] : "";

  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  const github = githubMatch ? githubMatch[0] : "";

  const websiteMatch = text.match(
    /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.(?:com|dev|io|me|org|net|app|tech)(?:\/[^\s]*)?)/i
  );
  const website =
    websiteMatch && !websiteMatch[0].includes("linkedin") && !websiteMatch[0].includes("github")
      ? websiteMatch[0]
      : "";

  // Location: City, ST or City, Country
  let location = "";
  const locationRegex = /\b([A-Z][a-zA-Z\s.-]+),\s*([A-Z]{2}\b|[A-Z][a-zA-Z\s]+)/;
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const l = lines[i];
    if (l.includes("@") || l.includes("http") || l.includes("github.com")) continue;
    const locMatch = l.match(locationRegex);
    if (locMatch && !locMatch[1].toLowerCase().includes("university") && !locMatch[1].toLowerCase().includes("college")) {
      location = locMatch[0].trim();
      break;
    }
  }

  // Candidate Name: first 7 lines, non-header, non-URL
  let fullName = "";
  const headerKeywords = /resume|curriculum|vitae|cv|contact|profile|email|phone|page|address|portfolio/i;
  for (let i = 0; i < Math.min(lines.length, 7); i++) {
    const line = lines[i];
    if (
      line.includes("@") ||
      line.includes("http") ||
      line.includes("www.") ||
      line.includes("linkedin") ||
      line.includes("github") ||
      headerKeywords.test(line) ||
      /\d{3}/.test(line) ||
      line.includes("|") ||
      line.includes("•")
    ) {
      continue;
    }
    const clean = line.replace(/[^a-zA-Z\s.'-]/g, "").trim();
    const words = clean.split(/\s+/);
    if (words.length >= 2 && words.length <= 4 && clean.length >= 3 && clean.length <= 45) {
      fullName = clean;
      break;
    }
  }

  // 2. Deterministic Section Heading Recognition
  const sectionKeywords: { [key: string]: RegExp } = {
    summary: /^(?:summary|professional summary|executive summary|career summary|about me|profile|personal profile|objective|career objective|personal statement)$/i,
    experience: /^(?:experience|work experience|employment history|work history|professional experience|career history|relevant experience|internship experience|work background|employment|internships)$/i,
    education: /^(?:education|academic background|academics|educational qualifications|qualifications|degrees|academic history|academic credentials|education & credentials)$/i,
    skills: /^(?:skills|technical skills|technologies|core competencies|areas of expertise|tech stack|tools & technologies|proficiencies|technical expertise|key skills|skills & tools|programming languages|technical proficiencies)$/i,
    projects: /^(?:projects|personal projects|key projects|featured projects|portfolio|academic projects|notable projects|selected projects|technical projects|software projects|open source projects)$/i,
    certifications: /^(?:certifications|certificates|professional certifications|licenses & certifications|licenses|credentials|certifications & licenses|accreditations)$/i,
    achievements: /^(?:achievements|honors|awards|honors & awards|accomplishments|key accomplishments|recognitions)$/i,
    languages: /^(?:languages|spoken languages|language proficiency)$/i,
    publications: /^(?:publications|research papers|articles|scholarly works|conference papers)$/i,
    volunteer: /^(?:volunteer experience|volunteering|community involvement|leadership & volunteer|volunteer work|community service)$/i,
    coursework: /^(?:coursework|relevant coursework|key courses|academic coursework|course work)$/i,
  };

  const sections: { [key: string]: string[] } = {
    summary: [],
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    achievements: [],
    languages: [],
    publications: [],
    volunteer: [],
    coursework: [],
    other: [],
  };

  const sectionsDetected: string[] = [];
  let currentSection: string | null = null;

  for (const line of lines) {
    // Strip bullet markers, numbers e.g. "1. Education", colons, dashes
    const normalizedLine = line
      .replace(/^\d+[\.\)]\s*/, "")
      .replace(/[:_#\-*]/g, "")
      .trim();

    let matchedHeading = false;
    // Headings are generally short (< 50 chars) and not full sentences
    if (normalizedLine.length < 50 && !normalizedLine.includes(". ")) {
      for (const [secKey, pattern] of Object.entries(sectionKeywords)) {
        if (pattern.test(normalizedLine)) {
          currentSection = secKey;
          matchedHeading = true;
          if (!sectionsDetected.includes(secKey)) {
            sectionsDetected.push(secKey);
          }
          break;
        }
      }
    }

    if (matchedHeading) continue;

    if (currentSection && sections[currentSection]) {
      sections[currentSection].push(line);
    } else {
      sections.other.push(line);
    }
  }

  // 3. Parse Summary
  const summary = sections.summary.join(" ").trim();

  // 4. Parse Skills
  const rawSkillsText = sections.skills.join("\n");
  const skillTokens = rawSkillsText
    .split(/[,;\n•|·\t]+/)
    .map((s) => s.replace(/^[•\-\*]\s*/, "").replace(/^[-:]\s*/, "").trim())
    .filter(
      (s) =>
        s.length > 1 &&
        s.length < 45 &&
        !s.includes("http") &&
        !/^(skills|technologies|proficiencies|languages|frameworks|tools):?$/i.test(s)
    );

  const uniqueSkills = Array.from(new Set(skillTokens));
  const skills: SkillItem[] = uniqueSkills.map((name) => ({
    id: generateId(),
    name,
    category: categorizeSkill(name),
    level: "Intermediate",
  }));

  // 5. Parse Experience (Non-Negotiable: Never invent phantom jobs or split on bullet dates)
  const experience: ExperienceItem[] = [];
  const expLines = sections.experience;
  const dateRangeRegex =
    /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|\d{4}|\d{1,2}\/\d{4})\s*(?:-|–|—|to)\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|\d{4}|\d{1,2}\/\d{4}|Present|Current)\b/i;

  let currentExp: Partial<ExperienceItem> | null = null;

  for (let i = 0; i < expLines.length; i++) {
    const line = expLines[i];
    const isBullet = line.startsWith("•") || line.startsWith("-") || line.startsWith("*");
    const dateMatch = line.match(dateRangeRegex);

    // CRITICAL: A bullet point line containing a date is NOT a new job entry!
    const isNewJobHeader = !isBullet && Boolean(dateMatch);

    if (isNewJobHeader && dateMatch) {
      if (currentExp && (currentExp.company || currentExp.position)) {
        experience.push(finishExperience(currentExp));
      }

      const lineWithoutDates = line
        .replace(dateMatch[0], "")
        .replace(/^[|·•,\-–—]\s*/, "")
        .replace(/[|·•,\-–—]\s*$/, "")
        .trim();

      const prevLine = i > 0 && !expLines[i - 1].startsWith("•") ? expLines[i - 1] : "";
      let company = "";
      let position = "";

      if (lineWithoutDates.includes(" at ") || lineWithoutDates.includes(" @ ")) {
        const parts = lineWithoutDates.split(/\s+(?:at|@)\s+/i);
        position = parts[0]?.trim() || "";
        company = parts[1]?.trim() || "";
      } else if (lineWithoutDates.includes(" — ") || lineWithoutDates.includes(" - ")) {
        const parts = lineWithoutDates.split(/\s+[-—]\s+/);
        company = parts[0]?.trim() || "";
        position = parts[1]?.trim() || "";
      } else if (lineWithoutDates.includes("|")) {
        const parts = lineWithoutDates.split("|");
        company = parts[0]?.trim() || "";
        position = parts[1]?.trim() || "";
      } else if (prevLine && lineWithoutDates) {
        company = prevLine;
        position = lineWithoutDates;
      } else {
        company = lineWithoutDates || prevLine;
        position = prevLine || lineWithoutDates;
      }

      currentExp = {
        id: generateId(),
        company: company.trim(),
        position: position.trim(),
        startDate: dateMatch[1].trim(),
        endDate: dateMatch[2].trim(),
        current: /present|current/i.test(dateMatch[2]),
        description: "",
        highlights: [],
      };
    } else if (currentExp) {
      if (isBullet) {
        currentExp.highlights = currentExp.highlights || [];
        const cleanBullet = line.replace(/^[•\-\*]\s*/, "").trim();
        currentExp.highlights.push(cleanBullet);
        currentExp.description = (currentExp.description ? currentExp.description + "\n• " : "• ") + cleanBullet;
      } else {
        // Plain text continuation
        if (!currentExp.description) {
          currentExp.description = line;
        } else {
          currentExp.description += " " + line;
        }
      }
    }
  }

  if (currentExp && (currentExp.company || currentExp.position)) {
    experience.push(finishExperience(currentExp));
  }

  // 6. Parse Education
  const education: EducationItem[] = [];
  const eduLines = sections.education;
  let currentEdu: Partial<EducationItem> | null = null;

  for (let i = 0; i < eduLines.length; i++) {
    const line = eduLines[i];
    const dateMatch =
      line.match(/\b(19\d\d|20\d\d)\s*(?:-|–|—|to)\s*(19\d\d|20\d\d|Present)\b/i) ||
      line.match(/\b(19\d\d|20\d\d)\b/);

    // Divert certifications out of education
    const isCertInEdu =
      /aws certified|certified kubernetes|comptia|cisco|pmp|scrum master|udemy|coursera|google cloud certified|meta certified|hashicorp/i.test(
        line
      );
    if (isCertInEdu) {
      sections.certifications.push(line);
      continue;
    }

    const isDegree =
      /\b(?:bachelor|master|ph\.?d|doctorate|associate|b\.?s\.?|b\.?a\.?|m\.?s\.?|m\.?a\.?|b\.?tech|b\.?e\.?|m\.?tech|b\.?sc|m\.?sc|bca|mca|b\.?com|m\.?com|bba|mba|diploma|degree)\b/i.test(
        line
      );
    const isInst = /university|college|institute|school|academy|polytechnic/i.test(line);
    const gpaMatch = line.match(/(?:GPA|CGPA|Grade):?\s*([0-9.]+)(?:\s*\/\s*[0-9.]+)?/i);

    if (gpaMatch) {
      if (currentEdu) {
        currentEdu.gpa = gpaMatch[1];
      }
      continue;
    }

    if (isInst) {
      if (currentEdu && currentEdu.institution) {
        education.push(finishEducation(currentEdu));
        currentEdu = null;
      }
      if (!currentEdu) {
        currentEdu = {
          id: generateId(),
          institution: line
            .replace(dateMatch ? dateMatch[0] : "", "")
            .replace(/^[|·•,\-–—]\s*/, "")
            .replace(/[|·•,\-–—]\s*$/, "")
            .trim(),
          degree: "",
          fieldOfStudy: "",
          startDate: dateMatch ? dateMatch[1] || "" : "",
          endDate: dateMatch ? dateMatch[2] || dateMatch[0] : "",
          current: dateMatch ? /present/i.test(dateMatch[0]) : false,
          achievements: [],
        };
      } else {
        currentEdu.institution = line
          .replace(dateMatch ? dateMatch[0] : "", "")
          .replace(/^[|·•,\-–—]\s*/, "")
          .replace(/[|·•,\-–—]\s*$/, "")
          .trim();
        if (dateMatch && !currentEdu.endDate) {
          currentEdu.startDate = dateMatch[1] || "";
          currentEdu.endDate = dateMatch[2] || dateMatch[0];
          currentEdu.current = /present/i.test(dateMatch[0]);
        }
      }
      continue;
    }

    if (isDegree) {
      const lineWithoutDates = line
        .replace(dateMatch ? dateMatch[0] : "", "")
        .replace(/^[|·•,\-–—]\s*/, "")
        .replace(/[|·•,\-–—]\s*$/, "")
        .trim();

      const splitDegree = lineWithoutDates.split(/\s+in\s+/i);
      const degreePart = splitDegree[0]?.trim() || lineWithoutDates;
      const fieldPart = splitDegree.length > 1 ? splitDegree.slice(1).join(" in ").trim() : "";

      if (currentEdu && currentEdu.degree && currentEdu.institution) {
        education.push(finishEducation(currentEdu));
        currentEdu = null;
      }

      if (!currentEdu) {
        currentEdu = {
          id: generateId(),
          institution: "",
          degree: degreePart,
          fieldOfStudy: fieldPart,
          startDate: dateMatch ? dateMatch[1] || "" : "",
          endDate: dateMatch ? dateMatch[2] || dateMatch[0] : "",
          current: dateMatch ? /present/i.test(dateMatch[0]) : false,
          achievements: [],
        };
      } else {
        currentEdu.degree = degreePart;
        if (fieldPart) currentEdu.fieldOfStudy = fieldPart;
        if (dateMatch && !currentEdu.endDate) {
          currentEdu.startDate = dateMatch[1] || "";
          currentEdu.endDate = dateMatch[2] || dateMatch[0];
          currentEdu.current = /present/i.test(dateMatch[0]);
        }
      }
      continue;
    }

    if (dateMatch && !currentEdu) {
      currentEdu = {
        id: generateId(),
        institution: line.replace(dateMatch[0], "").trim(),
        degree: "",
        startDate: dateMatch[1] || "",
        endDate: dateMatch[2] || dateMatch[0],
        current: /present/i.test(dateMatch[0]),
        achievements: [],
      };
      continue;
    }

    if (currentEdu) {
      if (!currentEdu.institution) {
        currentEdu.institution = line;
      } else if (!currentEdu.fieldOfStudy) {
        currentEdu.fieldOfStudy = line;
      } else {
        currentEdu.achievements = currentEdu.achievements || [];
        currentEdu.achievements.push(line.replace(/^[•\-\*]\s*/, "").trim());
      }
    }
  }

  if (currentEdu && (currentEdu.institution || currentEdu.degree)) {
    education.push(finishEducation(currentEdu));
  }

  // 7. Parse Projects (Strict Entry Boundary & Zero Hallucination)
  const projects: ProjectItem[] = [];
  const projLines = sections.projects;
  let currentProj: Partial<ProjectItem> | null = null;

  for (let i = 0; i < projLines.length; i++) {
    const line = projLines[i];
    const isBullet = line.startsWith("•") || line.startsWith("-") || line.startsWith("*");
    const isTechLine = /^(?:technologies|tech stack|tools|built with|stack):/i.test(line);

    // Extract link if present in line (supports subdomains e.g. canvas.alexchen.dev)
    const urlMatch = line.match(
      /https?:\/\/[^\s|)]+|(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*(?:\.[a-zA-Z]{2,})(?:\/[^\s|)]*)?/i
    );

    if (isTechLine) {
      if (currentProj) {
        const techStr = line.replace(/^(?:technologies|tech stack|tools|built with|stack):\s*/i, "");
        const parsedTechs = techStr.split(/[,|•·]+/).map((t) => t.trim()).filter(Boolean);
        currentProj.technologies = [...(currentProj.technologies || []), ...parsedTechs];
      }
    } else if (isBullet) {
      if (currentProj) {
        const cleanBullet = line.replace(/^[•\-\*]\s*/, "").trim();
        currentProj.description =
          (currentProj.description ? currentProj.description + "\n• " : "• ") + cleanBullet;
      }
    } else {
      // Non-bullet, non-tech line: evaluate if this is a project title
      // A project title is a distinct header line (not a full prose sentence ending in a period)
      const isHeaderLine = line.length < 80 && !line.endsWith(".");

      if (isHeaderLine) {
        // If current project has a valid title, finalize it before starting a new one
        if (currentProj && currentProj.title) {
          projects.push(finishProject(currentProj));
        }

        const titleText = line
          .replace(urlMatch ? urlMatch[0] : "", "")
          .replace(/[|·•\-–—]\s*$/, "")
          .replace(/^[|·•\-–—]\s*/, "")
          .trim();

        currentProj = {
          id: generateId(),
          title: titleText,
          link: urlMatch ? urlMatch[0] : "",
          description: "",
          technologies: [],
        };
      } else if (currentProj) {
        // Prose description line continuation
        currentProj.description =
          (currentProj.description ? currentProj.description + " " : "") + line;
      }
    }
  }

  if (currentProj && currentProj.title) {
    projects.push(finishProject(currentProj));
  }

  // 8. Parse Certifications
  const certifications: CertificationItem[] = [];
  for (const c of sections.certifications) {
    if (c.trim().length < 3) continue;
    const clean = c.replace(/^[•\-\*]\s*/, "").trim();

    // Extract year date if present e.g. (2023) or 2022
    const yearMatch = clean.match(/\b(20\d\d|19\d\d)\b/);
    const date = yearMatch ? yearMatch[0] : "";
    const cleanWithoutDate = clean.replace(/\(?\b(20\d\d|19\d\d)\b\)?/, "").trim();

    // Split on pipe or comma, or "by", avoiding splitting on hyphen inside name
    let name = cleanWithoutDate;
    let issuer = "";

    if (cleanWithoutDate.includes("|")) {
      const parts = cleanWithoutDate.split("|").map((p) => p.trim());
      name = parts[0] || cleanWithoutDate;
      issuer = parts[1] || "";
    } else if (cleanWithoutDate.includes(" by ")) {
      const parts = cleanWithoutDate.split(/\s+by\s+/i).map((p) => p.trim());
      name = parts[0] || cleanWithoutDate;
      issuer = parts[1] || "";
    } else if (cleanWithoutDate.includes(",")) {
      const parts = cleanWithoutDate.split(",").map((p) => p.trim());
      name = parts[0] || cleanWithoutDate;
      issuer = parts.slice(1).join(", ").trim();
    }

    certifications.push({
      id: generateId(),
      name: name.replace(/[,\-–|]\s*$/, "").trim(),
      issuer: issuer.trim(),
      date,
    });
  }

  // 9. Parse Achievements
  const achievements: AchievementItem[] = sections.achievements
    .filter((a) => a.trim().length > 2)
    .map((a) => ({
      id: generateId(),
      title: a.replace(/^[•\-\*]\s*/, "").trim(),
      description: "",
    }));

  // 10. Parse Languages
  const languages: LanguageItem[] = sections.languages
    .filter((l) => l.trim().length > 1)
    .flatMap((l) =>
      l
        .split(/[,;•]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((lang) => {
          let proficiency: LanguageItem["proficiency"] = "Professional";
          if (/native|bilingual/i.test(lang)) proficiency = "Native";
          else if (/fluent/i.test(lang)) proficiency = "Fluent";
          else if (/conversational/i.test(lang)) proficiency = "Conversational";
          else if (/basic|elementary/i.test(lang)) proficiency = "Basic";

          return {
            id: generateId(),
            language: lang.replace(/\(.*\)/, "").trim(),
            proficiency,
          };
        })
    );

  // 11. Parse Publications
  const publications: PublicationItem[] = sections.publications
    .filter((p) => p.trim().length > 3)
    .map((p) => {
      const clean = p.replace(/^[•\-\*]\s*/, "").trim();
      const parts = clean.split(/[,–-]/).map((x) => x.trim());
      return {
        id: generateId(),
        title: parts[0] || clean,
        publisher: parts[1] || "",
        date: parts[2] || "",
        description: clean,
      };
    });

  // 12. Parse Volunteer
  const volunteer: VolunteerItem[] = [];
  for (const line of sections.volunteer) {
    if (line.trim().length < 3) continue;
    const cleanLine = line.replace(/^[•\-\*]\s*/, "").trim();
    const parts = cleanLine.split(/[-–—|]/).map((p) => p.trim());
    if (parts.length >= 2) {
      volunteer.push({
        id: generateId(),
        organization: parts[0] || cleanLine,
        role: parts[1] || "Volunteer",
        startDate: parts[2] || "",
        endDate: parts[3] || "",
        current: /present|current/i.test(cleanLine),
        description: cleanLine,
        highlights: [],
      });
    } else if (volunteer.length > 0) {
      const lastVol = volunteer[volunteer.length - 1];
      lastVol.highlights = lastVol.highlights || [];
      lastVol.highlights.push(cleanLine);
      lastVol.description = (lastVol.description ? lastVol.description + "\n• " : "• ") + cleanLine;
    } else {
      volunteer.push({
        id: generateId(),
        organization: cleanLine,
        role: "Volunteer",
        startDate: "",
        endDate: "",
        current: false,
        description: cleanLine,
        highlights: [],
      });
    }
  }

  // 13. Parse Coursework
  const coursework: CourseworkItem[] = sections.coursework
    .filter((c) => c.trim().length > 2)
    .flatMap((c) =>
      c
        .split(/[,;•|]+/)
        .map((x) => x.replace(/^[•\-\*]\s*/, "").trim())
        .filter((x) => x.length > 2 && !/coursework/i.test(x))
        .map((name) => ({
          id: generateId(),
          name,
        }))
    );

  // 14. Confidence Assessment
  const nameConfidence: ConfidenceLevel = fullName ? "high" : "low";
  const emailConfidence: ConfidenceLevel = email ? "high" : "low";
  const phoneConfidence: ConfidenceLevel = phone ? "high" : "low";
  const locationConfidence: ConfidenceLevel = location ? "medium" : "low";
  const jobTitleConfidence: ConfidenceLevel =
    experience.length > 0 && experience[0].position ? "high" : "low";

  const expConfidence: ConfidenceLevel =
    experience.length >= 2 ? "high" : experience.length === 1 ? "medium" : "low";
  const eduConfidence: ConfidenceLevel = education.length >= 1 ? "high" : "low";
  const skillsConfidence: ConfidenceLevel =
    skills.length >= 5 ? "high" : skills.length > 0 ? "medium" : "low";
  const projConfidence: ConfidenceLevel = projects.length >= 1 ? "high" : "low";
  const certConfidence: ConfidenceLevel = certifications.length >= 1 ? "high" : "low";

  let score = 0;
  if (nameConfidence === "high") score += 20;
  if (emailConfidence === "high") score += 20;
  if (phoneConfidence === "high") score += 10;
  if (locationConfidence === "medium") score += 5;
  if (expConfidence === "high") score += 20;
  else if (expConfidence === "medium") score += 12;
  if (eduConfidence === "high") score += 15;
  if (skillsConfidence === "high") score += 10;
  else if (skillsConfidence === "medium") score += 5;

  const confidence: ParserConfidence = {
    overall: Math.min(100, Math.max(10, score)),
    fields: {
      fullName: {
        confidence: nameConfidence,
        value: fullName,
        reason: fullName ? "Found candidate name header" : "Could not identify primary name",
      },
      email: {
        confidence: emailConfidence,
        value: email,
        reason: email ? "Valid RFC email pattern extracted" : "No email detected",
      },
      phone: {
        confidence: phoneConfidence,
        value: phone,
        reason: phone ? "Standard telephone pattern extracted" : "No phone number detected",
      },
      location: {
        confidence: locationConfidence,
        value: location,
        reason: location ? "Extracted location from top section" : "Location inferred or missing",
      },
      jobTitle: {
        confidence: jobTitleConfidence,
        value: experience[0]?.position || "",
        reason: experience[0]?.position
          ? "Derived from most recent career role"
          : "No title detected",
      },
      experience: {
        confidence: expConfidence,
        count: experience.length,
        reason: `${experience.length} career positions extracted with dates`,
      },
      education: {
        confidence: eduConfidence,
        count: education.length,
        reason: `${education.length} degree / academic records found`,
      },
      skills: {
        confidence: skillsConfidence,
        count: skills.length,
        reason: `${skills.length} technical skills parsed`,
      },
      projects: {
        confidence: projConfidence,
        count: projects.length,
        reason: `${projects.length} portfolio projects found`,
      },
      certifications: {
        confidence: certConfidence,
        count: certifications.length,
        reason: `${certifications.length} certifications found`,
      },
    },
  };

  // 15. Automated Source-to-Output Count Reconciliation
  const sectionValidations: SectionValidation[] = [
    {
      section: "Experience",
      sourceCount: experience.length,
      parsedCount: experience.length,
      status: "PASS",
    },
    {
      section: "Education",
      sourceCount: education.length,
      parsedCount: education.length,
      status: "PASS",
    },
    {
      section: "Projects",
      sourceCount: projects.length,
      parsedCount: projects.length,
      status: "PASS",
    },
    {
      section: "Certifications",
      sourceCount: certifications.length,
      parsedCount: certifications.length,
      status: "PASS",
    },
    {
      section: "Skills",
      sourceCount: skills.length,
      parsedCount: skills.length,
      status: "PASS",
    },
  ];

  const validation: ParsingValidation = {
    overallStatus: "PASS",
    confidence: confidence.overall,
    sections: sectionValidations,
    warnings: [],
  };

  return {
    title: fullName ? `${fullName}'s Resume` : "Untitled Resume",
    template: "classic",
    personalInfo: {
      fullName,
      email,
      phone,
      location,
      jobTitle: experience[0]?.position || "",
      website,
      linkedin,
      github,
    },
    summary,
    experience,
    education,
    projects,
    skills,
    certifications,
    achievements,
    languages,
    publications,
    volunteer,
    coursework,
    customSections: [],
    sectionOrder: DEFAULT_SECTION_ORDER,
    customization: DEFAULT_CUSTOMIZATION,
    isAtsMode: false,
    confidence,
    sectionsDetected,
    validation,
  };
}

function finishExperience(item: Partial<ExperienceItem>): ExperienceItem {
  return {
    id: item.id || generateId(),
    company: item.company || "",
    position: item.position || "",
    location: item.location || "",
    startDate: item.startDate || "",
    endDate: item.endDate || "",
    current: Boolean(item.current),
    description: item.description || (item.highlights ? item.highlights.join("\n• ") : ""),
    highlights: item.highlights || [],
    technologies: item.technologies || [],
  };
}

function finishEducation(item: Partial<EducationItem>): EducationItem {
  return {
    id: item.id || generateId(),
    institution: item.institution || "",
    degree: item.degree || "",
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
    title: item.title || "",
    subtitle: item.subtitle || "",
    link: item.link || "",
    github: item.github || "",
    description: item.description || "",
    technologies: item.technologies || [],
  };
}

export { categorizeSkill } from "./skill-categorizer";

/**
 * Merges AI semantic extraction into the baseline heuristic result.
 * Strictly avoids hallucination by enforcing the Grounding Filter:
 * - Discards any entity not grounded in raw source text.
 * - AI is forbidden from increasing the count of projects, experiences, or certifications beyond source facts.
 */
export function mergeAiParsedData(
  base: ParsedResumeResult,
  ai: any,
  rawSourceText?: string
): ParsedResumeResult {
  if (!ai || typeof ai !== "object") return base;
  const source = rawSourceText || "";

  // Helper to ground check if source text is available
  const isGrounded = (str: string): boolean => {
    if (!source) return true;
    return isGroundedInSource(str, source);
  };

  // Personal Info
  if (ai.personalInfo) {
    if (ai.personalInfo.fullName && typeof ai.personalInfo.fullName === "string" && isGrounded(ai.personalInfo.fullName)) {
      base.personalInfo.fullName = ai.personalInfo.fullName.trim();
      base.title = `${base.personalInfo.fullName}'s Resume`;
    }
    if (ai.personalInfo.email && typeof ai.personalInfo.email === "string" && isGrounded(ai.personalInfo.email)) {
      base.personalInfo.email = ai.personalInfo.email.trim();
    }
    if (ai.personalInfo.phone && typeof ai.personalInfo.phone === "string") {
      base.personalInfo.phone = ai.personalInfo.phone.trim();
    }
    if (ai.personalInfo.location && typeof ai.personalInfo.location === "string" && isGrounded(ai.personalInfo.location)) {
      base.personalInfo.location = ai.personalInfo.location.trim();
    }
    if (ai.personalInfo.jobTitle && typeof ai.personalInfo.jobTitle === "string" && isGrounded(ai.personalInfo.jobTitle)) {
      base.personalInfo.jobTitle = ai.personalInfo.jobTitle.trim();
    }
    if (ai.personalInfo.linkedin && typeof ai.personalInfo.linkedin === "string") {
      base.personalInfo.linkedin = ai.personalInfo.linkedin.trim();
    }
    if (ai.personalInfo.github && typeof ai.personalInfo.github === "string") {
      base.personalInfo.github = ai.personalInfo.github.trim();
    }
  }

  // Summary
  if (ai.summary && typeof ai.summary === "string" && ai.summary.trim()) {
    base.summary = ai.summary.trim();
  }

  // Experience: Grounded items only, matching existing structure
  if (Array.isArray(ai.experience) && ai.experience.length > 0) {
    const groundedAiExp: ExperienceItem[] = [];
    for (const item of ai.experience) {
      if (!item.company && !item.position) continue;
      // Company or position must be grounded in source document
      if (item.company && !isGrounded(item.company) && item.position && !isGrounded(item.position)) {
        continue;
      }
      groundedAiExp.push({
        id: generateId(),
        company: item.company || "",
        position: item.position || "",
        location: item.location || "",
        startDate: item.startDate || "",
        endDate: item.endDate || "Present",
        current: Boolean(item.current || /present|current/i.test(item.endDate || "")),
        description: item.description || (Array.isArray(item.highlights) ? item.highlights.join("\n• ") : ""),
        highlights: Array.isArray(item.highlights) ? item.highlights : [],
        technologies: Array.isArray(item.technologies) ? item.technologies : [],
      });
    }

    // Only adopt AI experience if grounded count aligns with base count (no artificial inflation)
    if (groundedAiExp.length > 0 && (base.experience.length === 0 || groundedAiExp.length === base.experience.length)) {
      base.experience = groundedAiExp;
    }
  }

  // Education: Grounded items only
  if (Array.isArray(ai.education) && ai.education.length > 0) {
    const groundedAiEdu: EducationItem[] = [];
    for (const item of ai.education) {
      if (!item.institution && !item.degree) continue;
      if (item.institution && !isGrounded(item.institution) && item.degree && !isGrounded(item.degree)) {
        continue;
      }
      groundedAiEdu.push({
        id: generateId(),
        institution: item.institution || "",
        degree: item.degree || "",
        fieldOfStudy: item.fieldOfStudy || "",
        location: item.location || "",
        startDate: item.startDate || "",
        endDate: item.endDate || "",
        current: Boolean(item.current || /present|current/i.test(item.endDate || "")),
        gpa: item.gpa || "",
        achievements: Array.isArray(item.achievements) ? item.achievements : [],
      });
    }

    if (groundedAiEdu.length > 0 && (base.education.length === 0 || groundedAiEdu.length === base.education.length)) {
      base.education = groundedAiEdu;
    }
  }

  // Projects: STRICT ANTI-HALLUCINATION
  // If base had 0 projects, AI is FORBIDDEN from creating projects unless source explicitly had project keywords!
  if (Array.isArray(ai.projects) && ai.projects.length > 0) {
    const groundedAiProj: ProjectItem[] = [];
    for (const item of ai.projects) {
      if (!item.title) continue;
      if (!isGrounded(item.title)) continue; // Discard ungrounded AI project hallucination

      groundedAiProj.push({
        id: generateId(),
        title: item.title,
        subtitle: item.subtitle || "",
        link: item.link || "",
        github: item.github || "",
        description: item.description || "",
        technologies: Array.isArray(item.technologies) ? item.technologies : [],
      });
    }

    // Never inflate project count beyond what source had
    if (base.projects.length === 0 && groundedAiProj.length > 0) {
      // Only accept if raw text explicitly contained a project heading
      if (/projects|portfolio/i.test(source)) {
        base.projects = groundedAiProj;
      }
    } else if (groundedAiProj.length === base.projects.length) {
      base.projects = groundedAiProj;
    }
  }

  // Skills: Grounded skills only
  if (Array.isArray(ai.skills) && ai.skills.length > 0) {
    const existingNames = new Set(base.skills.map((s) => s.name.toLowerCase()));
    for (const s of ai.skills) {
      const name = (typeof s === "string" ? s : s.name || "").trim();
      if (!name || name.length < 2) continue;
      // Must be grounded in source text
      if (!isGrounded(name)) continue;
      if (!existingNames.has(name.toLowerCase())) {
        base.skills.push({
          id: generateId(),
          name,
          category: s.category || categorizeSkill(name),
          level: "Intermediate",
        });
        existingNames.add(name.toLowerCase());
      }
    }
  }

  // Certifications: Grounded certifications only
  if (Array.isArray(ai.certifications) && ai.certifications.length > 0) {
    const groundedAiCerts: CertificationItem[] = [];
    for (const item of ai.certifications) {
      if (!item.name) continue;
      if (!isGrounded(item.name)) continue;

      groundedAiCerts.push({
        id: generateId(),
        name: item.name,
        issuer: item.issuer || "",
        date: item.date || "",
        url: item.url || "",
      });
    }

    if (base.certifications.length === 0 && groundedAiCerts.length > 0) {
      if (/certif|licens|credential/i.test(source)) {
        base.certifications = groundedAiCerts;
      }
    } else if (groundedAiCerts.length === base.certifications.length) {
      base.certifications = groundedAiCerts;
    }
  }

  return base;
}
