import {
  ResumeData,
  DEFAULT_SECTION_ORDER,
  DEFAULT_CUSTOMIZATION,
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
} from "@/src/types/resume";
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
}

/**
 * Intelligent Rule-Based Resume Text Parser (2026 Production Grade)
 */
export function parseResumeText(rawText: string): ParsedResumeResult {
  const text = (rawText || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

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

  // Section Heading Patterns (Extensive variations)
  const sectionKeywords: { [key: string]: RegExp } = {
    summary: /^(summary|professional summary|executive summary|career summary|about me|profile|personal profile|objective|career objective|personal statement)$/i,
    experience: /^(experience|work experience|employment history|work history|professional experience|career history|relevant experience|internship experience|work background)$/i,
    education: /^(education|academic background|academics|educational qualifications|qualifications|degrees|academic history|academic credentials)$/i,
    skills: /^(skills|technical skills|technologies|core competencies|areas of expertise|tech stack|tools & technologies|proficiencies|technical expertise|key skills)$/i,
    projects: /^(projects|personal projects|key projects|featured projects|portfolio|academic projects|notable projects|selected projects)$/i,
    certifications: /^(certifications|certificates|professional certifications|licenses & certifications|licenses|credentials|certifications & licenses)$/i,
    achievements: /^(achievements|honors|awards|honors & awards|accomplishments|key accomplishments|recognitions)$/i,
    languages: /^(languages|spoken languages|language proficiency)$/i,
    publications: /^(publications|research papers|articles|scholarly works|conference papers)$/i,
    volunteer: /^(volunteer experience|volunteering|community involvement|leadership & volunteer|volunteer work)$/i,
    coursework: /^(coursework|relevant coursework|key courses|academic coursework|course work)$/i,
  };

  // Group lines into sections
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
    const normalizedLine = line.replace(/[:_#\-*]/g, "").trim();
    let matchedHeading = false;

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

    if (matchedHeading) continue;

    if (currentSection && sections[currentSection]) {
      sections[currentSection].push(line);
    } else {
      sections.other.push(line);
    }
  }

  // 2. Parse Summary
  const summary = sections.summary.join(" ").trim();

  // 3. Parse Skills
  const rawSkillsText = sections.skills.join("\n");
  const skillTokens = rawSkillsText
    .split(/[,;\n•|·\t]+/)
    .map((s) => s.replace(/^[•\-\*]\s*/, "").replace(/^[-:]\s*/, "").trim())
    .filter((s) => s.length > 1 && s.length < 45 && !s.includes("http") && !/^(skills|technologies|proficiencies):?$/i.test(s));

  const uniqueSkills = Array.from(new Set(skillTokens));
  const skills: SkillItem[] = uniqueSkills.map((name) => ({
    id: generateId(),
    name,
    category: categorizeSkill(name),
    level: "Intermediate",
  }));

  // 4. Parse Experience
  const experience: ExperienceItem[] = [];
  const expLines = sections.experience;
  let currentExp: Partial<ExperienceItem> | null = null;

  const dateRangeRegex = /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|\d{4}|\d{1,2}\/\d{4})\s*(?:-|–|—|to)\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|\d{4}|\d{1,2}\/\d{4}|Present|Current)/i;

  for (let i = 0; i < expLines.length; i++) {
    const line = expLines[i];
    const dateMatch = line.match(dateRangeRegex);

    if (dateMatch) {
      if (currentExp && currentExp.company) {
        experience.push(finishExperience(currentExp));
      }

      const lineWithoutDates = line
        .replace(dateMatch[0], "")
        .replace(/^[|·•,\-–—]\s*/, "")
        .replace(/[|·•,\-–—]\s*$/, "")
        .trim();
      const prevLine = i > 0 ? expLines[i - 1] : "";

      currentExp = {
        id: generateId(),
        startDate: dateMatch[1].trim(),
        endDate: dateMatch[2].trim(),
        current: /present|current/i.test(dateMatch[2]),
        company: lineWithoutDates || prevLine || "Company",
        position: prevLine && lineWithoutDates ? prevLine : lineWithoutDates || "Position",
        description: "",
        highlights: [],
      };
    } else if (currentExp) {
      if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
        currentExp.highlights = currentExp.highlights || [];
        currentExp.highlights.push(line.replace(/^[•\-\*]\s*/, "").trim());
      } else {
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

  // 5. Parse Education
  const education: EducationItem[] = [];
  const eduLines = sections.education;
  let currentEdu: Partial<EducationItem> | null = null;

  for (let i = 0; i < eduLines.length; i++) {
    const line = eduLines[i];
    const dateMatch =
      line.match(/\b(19\d\d|20\d\d)\s*(?:-|–|—|to)\s*(19\d\d|20\d\d|Present)\b/i) ||
      line.match(/\b(19\d\d|20\d\d)\b/);

    // If certification line accidentally ended up in education section, route to certifications
    const isCertInEdu = /aws certified|certified kubernetes|comptia|cisco|pmp|scrum master|udemy|coursera|google cloud certified|meta certified|hashicorp/i.test(line);
    if (isCertInEdu) {
      sections.certifications.push(line);
      continue;
    }

    const isDegree = /\b(?:bachelor|master|ph\.?d|doctorate|associate|b\.?s\.?|b\.?a\.?|m\.?s\.?|m\.?a\.?|b\.?tech|b\.?e\.?|m\.?tech|b\.?sc|m\.?sc|bca|mca|b\.?com|m\.?com|bba|mba|diploma|degree)\b/i.test(line);
    const isInst = /university|college|institute|school|academy|polytechnic/i.test(line);
    const gpaMatch = line.match(/(?:GPA|CGPA|Grade):?\s*([0-9.]+)(?:\s*\/\s*[0-9.]+)?/i);

    if (gpaMatch) {
      if (currentEdu) {
        currentEdu.gpa = gpaMatch[1];
      }
      continue;
    }

    if (isInst) {
      if (currentEdu && (currentEdu.institution || currentEdu.degree)) {
        education.push(finishEducation(currentEdu));
      }
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
      continue;
    }

    if (isDegree) {
      const lineWithoutDates = line
        .replace(dateMatch ? dateMatch[0] : "", "")
        .replace(/^[|·•,\-–—]\s*/, "")
        .replace(/[|·•,\-–—]\s*$/, "")
        .trim();

      // Split degree and field of study (e.g. "Bachelor of Science in Computer Science")
      const splitDegree = lineWithoutDates.split(/\s+in\s+/i);
      const degreePart = splitDegree[0]?.trim() || lineWithoutDates;
      const fieldPart = splitDegree.length > 1 ? splitDegree.slice(1).join(" in ").trim() : "";

      if (!currentEdu) {
        const prevLine = i > 0 && !eduLines[i - 1].includes("@") ? eduLines[i - 1] : "";
        currentEdu = {
          id: generateId(),
          institution: prevLine || "",
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
        }
      }
      continue;
    }

    if (dateMatch && !currentEdu) {
      currentEdu = {
        id: generateId(),
        institution: line.replace(dateMatch[0], "").trim() || "Institution",
        degree: "Degree",
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

  // 6. Parse Projects
  const projects: ProjectItem[] = [];
  const projLines = sections.projects;
  let currentProj: Partial<ProjectItem> | null = null;

  for (const line of projLines) {
    if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
      if (currentProj) {
        currentProj.description =
          (currentProj.description ? currentProj.description + "\n• " : "• ") +
          line.replace(/^[•\-\*]\s*/, "").trim();
      }
    } else if (line.length < 80 && !line.includes(". ")) {
      if (currentProj && currentProj.title) {
        projects.push(finishProject(currentProj));
      }
      // Check for link inside title line
      const urlInLine = line.match(/(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/);
      currentProj = {
        id: generateId(),
        title: line.replace(urlInLine ? urlInLine[0] : "", "").replace(/[|·•\-]/g, "").trim(),
        link: urlInLine ? urlInLine[0] : "",
        description: "",
        technologies: [],
      };
    } else if (currentProj) {
      currentProj.description =
        (currentProj.description ? currentProj.description + " " : "") + line;
    }
  }
  if (currentProj && currentProj.title) {
    projects.push(finishProject(currentProj));
  }

  // 7. Parse Certifications
  const certifications: CertificationItem[] = sections.certifications
    .filter((c) => c.trim().length > 2)
    .map((c) => {
      const clean = c.replace(/^[•\-\*]\s*/, "").trim();
      const parts = clean.split(/[-–|]/).map((p) => p.trim());
      return {
        id: generateId(),
        name: parts[0] || clean,
        issuer: parts[1] || "",
        date: parts[2] || "",
      };
    });

  // 8. Parse Achievements
  const achievements: AchievementItem[] = sections.achievements
    .filter((a) => a.trim().length > 2)
    .map((a) => ({
      id: generateId(),
      title: a.replace(/^[•\-\*]\s*/, "").trim(),
      description: "",
    }));

  // 9. Parse Languages
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

  // 10. Parse Publications
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

  // 11. Parse Volunteer Experience
  const volunteer: VolunteerItem[] = [];
  const volLines = sections.volunteer;
  let currentVol: Partial<VolunteerItem> | null = null;

  for (const line of volLines) {
    const isBullet = line.startsWith("•") || line.startsWith("-") || line.startsWith("*");
    const cleanLine = line.replace(/^[•\-\*]\s*/, "").trim();
    const hasDelimiter = cleanLine.includes("—") || cleanLine.includes(" - ") || cleanLine.includes("|");

    if (isBullet && currentVol && !hasDelimiter) {
      currentVol.highlights = currentVol.highlights || [];
      currentVol.highlights.push(cleanLine);
      currentVol.description = (currentVol.description ? currentVol.description + "\n" : "") + cleanLine;
    } else {
      if (currentVol && currentVol.organization) {
        volunteer.push({
          id: currentVol.id || generateId(),
          organization: currentVol.organization,
          role: currentVol.role || "Volunteer",
          location: currentVol.location || "",
          startDate: currentVol.startDate || "",
          endDate: currentVol.endDate || "",
          current: Boolean(currentVol.current),
          description: currentVol.description || "",
          highlights: currentVol.highlights || [],
        });
      }
      const parts = cleanLine.split(/[-–—|]/).map((p) => p.trim());
      currentVol = {
        id: generateId(),
        organization: parts[0] || cleanLine,
        role: parts[1] || "Volunteer",
        startDate: parts[2] || "",
        endDate: parts[3] || "",
        current: /present|current/i.test(cleanLine),
        description: cleanLine,
        highlights: [],
      };
    }
  }
  if (currentVol && currentVol.organization) {
    volunteer.push({
      id: currentVol.id || generateId(),
      organization: currentVol.organization,
      role: currentVol.role || "Volunteer",
      location: currentVol.location || "",
      startDate: currentVol.startDate || "",
      endDate: currentVol.endDate || "",
      current: Boolean(currentVol.current),
      description: currentVol.description || "",
      highlights: currentVol.highlights || [],
    });
  }

  // 12. Parse Coursework
  const coursework: CourseworkItem[] = sections.coursework
    .filter((c) => c.trim().length > 2)
    .flatMap((c) =>
      c
        .split(/[,;•|]+/)
        .map((x) => x.trim())
        .filter((x) => x.length > 2)
        .map((name) => ({
          id: generateId(),
          name,
        }))
    );

  // Job title inference
  const candidateJobTitle =
    experience[0]?.position ||
    (sections.other.length > 0 && sections.other[0].length < 40 && !sections.other[0].includes("@")
      ? sections.other[0]
      : "");

  // Calculate Confidence Metrics
  const emailConfidence: ConfidenceLevel = email ? "high" : "low";
  const phoneConfidence: ConfidenceLevel = phone ? "high" : "low";
  const nameConfidence: ConfidenceLevel =
    fullName && fullName.split(" ").length >= 2 ? "high" : fullName ? "medium" : "low";
  const locationConfidence: ConfidenceLevel = location ? "medium" : "low";
  const jobTitleConfidence: ConfidenceLevel = candidateJobTitle ? "high" : "low";

  const expConfidence: ConfidenceLevel =
    experience.length >= 2 ? "high" : experience.length === 1 ? "medium" : "low";
  const eduConfidence: ConfidenceLevel =
    education.length >= 1 ? "high" : "low";
  const skillsConfidence: ConfidenceLevel =
    skills.length >= 5 ? "high" : skills.length >= 1 ? "medium" : "low";
  const projConfidence: ConfidenceLevel =
    projects.length >= 1 ? "high" : "low";
  const certConfidence: ConfidenceLevel =
    certifications.length >= 1 ? "high" : "low";

  // Weighted overall confidence (0 - 100)
  let score = 0;
  if (nameConfidence === "high") score += 20; else if (nameConfidence === "medium") score += 10;
  if (emailConfidence === "high") score += 20;
  if (phoneConfidence === "high") score += 10;
  if (locationConfidence === "medium") score += 5;
  if (expConfidence === "high") score += 20; else if (expConfidence === "medium") score += 12;
  if (eduConfidence === "high") score += 15;
  if (skillsConfidence === "high") score += 10; else if (skillsConfidence === "medium") score += 5;

  const confidence: ParserConfidence = {
    overall: Math.min(100, Math.max(10, score)),
    fields: {
      fullName: {
        confidence: nameConfidence,
        value: fullName,
        reason: fullName ? "Found prominent candidate name header" : "Could not identify primary name",
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
        value: candidateJobTitle,
        reason: candidateJobTitle ? "Derived from most recent career role" : "No title detected",
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

  const parsedResume: ParsedResumeResult = {
    title: fullName ? `${fullName} — Resume` : "Imported Resume",
    template: "modern",
    personalInfo: {
      fullName: fullName || "Candidate Name",
      email: email || "",
      phone: phone || "",
      location: location || "",
      jobTitle: candidateJobTitle,
      website: website || "",
      linkedin: linkedin || "",
      github: github || "",
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
  };

  return parsedResume;
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

export { categorizeSkill } from "./skill-categorizer";

/**
 * Merges AI semantic extraction into the baseline heuristic result.
 * Strictly avoids hallucination by only accepting fields that are non-empty and valid.
 */
export function mergeAiParsedData(base: ParsedResumeResult, ai: any): ParsedResumeResult {
  if (!ai || typeof ai !== "object") return base;

  // Personal Info
  if (ai.personalInfo) {
    if (ai.personalInfo.fullName && typeof ai.personalInfo.fullName === "string") {
      base.personalInfo.fullName = ai.personalInfo.fullName.trim();
      base.title = `${base.personalInfo.fullName} — Resume`;
    }
    if (ai.personalInfo.email && typeof ai.personalInfo.email === "string") {
      base.personalInfo.email = ai.personalInfo.email.trim();
    }
    if (ai.personalInfo.phone && typeof ai.personalInfo.phone === "string") {
      base.personalInfo.phone = ai.personalInfo.phone.trim();
    }
    if (ai.personalInfo.location && typeof ai.personalInfo.location === "string") {
      base.personalInfo.location = ai.personalInfo.location.trim();
    }
    if (ai.personalInfo.jobTitle && typeof ai.personalInfo.jobTitle === "string") {
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

  // Experience
  if (Array.isArray(ai.experience) && ai.experience.length > 0) {
    const aiExp: ExperienceItem[] = ai.experience.map((item: any) => ({
      id: generateId(),
      company: item.company || "Company",
      position: item.position || "Role",
      location: item.location || "",
      startDate: item.startDate || "",
      endDate: item.endDate || "Present",
      current: Boolean(item.current || /present|current/i.test(item.endDate || "")),
      description: item.description || (Array.isArray(item.highlights) ? item.highlights.join("\n• ") : ""),
      highlights: Array.isArray(item.highlights) ? item.highlights : [],
    }));
    if (aiExp.length >= base.experience.length) {
      base.experience = aiExp;
    }
  }

  // Education
  if (Array.isArray(ai.education) && ai.education.length > 0) {
    const aiEdu: EducationItem[] = ai.education.map((item: any) => ({
      id: generateId(),
      institution: item.institution || "Institution",
      degree: item.degree || "Degree",
      fieldOfStudy: item.fieldOfStudy || "",
      location: item.location || "",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      current: Boolean(item.current || /present|current/i.test(item.endDate || "")),
      gpa: item.gpa || "",
      achievements: Array.isArray(item.achievements) ? item.achievements : [],
    }));
    if (aiEdu.length >= base.education.length) {
      base.education = aiEdu;
    }
  }

  // Projects
  if (Array.isArray(ai.projects) && ai.projects.length > 0) {
    const aiProj: ProjectItem[] = ai.projects.map((item: any) => ({
      id: generateId(),
      title: item.title || "Project",
      subtitle: item.subtitle || "",
      link: item.link || "",
      github: item.github || "",
      description: item.description || "",
      technologies: Array.isArray(item.technologies) ? item.technologies : [],
    }));
    if (aiProj.length >= base.projects.length) {
      base.projects = aiProj;
    }
  }

  // Skills
  if (Array.isArray(ai.skills) && ai.skills.length > 0) {
    const aiSkills: SkillItem[] = ai.skills
      .filter((s: any) => s && (typeof s === "string" || typeof s.name === "string"))
      .map((s: any) => {
        const name = (typeof s === "string" ? s : s.name).trim();
        return {
          id: generateId(),
          name,
          category: s.category || categorizeSkill(name),
          level: "Intermediate" as const,
        };
      });
    if (aiSkills.length > 0) {
      const existingNames = new Set(base.skills.map((s) => s.name.toLowerCase()));
      for (const s of aiSkills) {
        if (!existingNames.has(s.name.toLowerCase())) {
          base.skills.push(s);
          existingNames.add(s.name.toLowerCase());
        }
      }
    }
  }

  // Certifications
  if (Array.isArray(ai.certifications) && ai.certifications.length > 0) {
    const aiCerts: CertificationItem[] = ai.certifications.map((item: any) => ({
      id: generateId(),
      name: item.name || "Certification",
      issuer: item.issuer || "",
      date: item.date || "",
      url: item.url || "",
    }));
    if (aiCerts.length >= base.certifications.length) {
      base.certifications = aiCerts;
    }
  }

  return base;
}
