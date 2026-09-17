import {
  ResumeData,
  INITIAL_RESUME_DATA,
  DEFAULT_SECTION_ORDER,
  DEFAULT_CUSTOMIZATION,
  ExperienceItem,
  EducationItem,
  ProjectItem,
  SkillItem,
  TemplateId,
} from "@/src/types/resume";
import { categorizeSkill } from "./skill-categorizer";

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

/**
 * Normalizes any raw resume object (legacy flat string schema or V2 structured) into a strict ResumeData object.
 */
export function normalizeResume(raw: any): ResumeData {
  if (!raw) {
    return { ...INITIAL_RESUME_DATA };
  }

  // Check if legacy flat fields exist
  const legacyName = raw.name || "";
  const legacyEmail = raw.email || "";
  const legacyPhone = raw.phone || "";
  const legacyLinkedin = raw.linkedin || "";
  const legacySkills = raw.skills;
  const legacyEducation = raw.education;
  const legacyProjects = raw.projects;
  const legacyExperience = raw.experience;

  // Personal Info
  const personalInfo = {
    fullName: raw.personalInfo?.fullName || legacyName || "",
    email: raw.personalInfo?.email || legacyEmail || "",
    phone: raw.personalInfo?.phone || legacyPhone || "",
    location: raw.personalInfo?.location || "",
    jobTitle: raw.personalInfo?.jobTitle || "",
    website: raw.personalInfo?.website || "",
    linkedin: raw.personalInfo?.linkedin || legacyLinkedin || "",
    github: raw.personalInfo?.github || "",
  };

  // Experience
  let experience: ExperienceItem[] = [];
  if (Array.isArray(raw.experience)) {
    experience = raw.experience.map((item: any) => ({
      id: item.id || generateId(),
      company: item.company || "",
      position: item.position || "",
      location: item.location || "",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      current: Boolean(item.current),
      description: item.description || "",
      highlights: Array.isArray(item.highlights) ? item.highlights : [],
    }));
  } else if (typeof legacyExperience === "string" && legacyExperience.trim()) {
    // Convert legacy raw string into a structured experience item
    experience = [
      {
        id: generateId(),
        company: "Work History",
        position: personalInfo.jobTitle || "Professional",
        location: "",
        startDate: "",
        endDate: "Present",
        current: true,
        description: legacyExperience,
        highlights: [],
      },
    ];
  }

  // Education
  let education: EducationItem[] = [];
  if (Array.isArray(raw.education)) {
    education = raw.education.map((item: any) => ({
      id: item.id || generateId(),
      institution: item.institution || "",
      degree: item.degree || "",
      fieldOfStudy: item.fieldOfStudy || "",
      location: item.location || "",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      current: Boolean(item.current),
      gpa: item.gpa || "",
      achievements: Array.isArray(item.achievements) ? item.achievements : [],
    }));
  } else if (typeof legacyEducation === "string" && legacyEducation.trim()) {
    education = [
      {
        id: generateId(),
        institution: legacyEducation.split("\n")[0] || "University",
        degree: "Degree",
        fieldOfStudy: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        gpa: "",
        achievements: [],
      },
    ];
  }

  // Projects
  let projects: ProjectItem[] = [];
  if (Array.isArray(raw.projects)) {
    projects = raw.projects.map((item: any) => ({
      id: item.id || generateId(),
      title: item.title || "",
      subtitle: item.subtitle || "",
      link: item.link || "",
      github: item.github || "",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      technologies: Array.isArray(item.technologies) ? item.technologies : [],
      description: item.description || "",
    }));
  } else if (typeof legacyProjects === "string" && legacyProjects.trim()) {
    projects = [
      {
        id: generateId(),
        title: "Featured Projects",
        subtitle: "",
        description: legacyProjects,
        technologies: [],
      },
    ];
  }

  // Skills
  let skills: SkillItem[] = [];
  if (Array.isArray(raw.skills)) {
    skills = raw.skills.map((item: any) => {
      if (typeof item === "string") {
        return { id: generateId(), name: item, category: categorizeSkill(item) };
      }
      return {
        id: item.id || generateId(),
        name: item.name || "",
        category: item.category && item.category !== "General" ? item.category : categorizeSkill(item.name || ""),
        level: item.level || "Intermediate",
      };
    });
  } else if (typeof legacySkills === "string" && legacySkills.trim()) {
    skills = legacySkills
      .split(/[,;\n•|]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({
        id: generateId(),
        name,
        category: categorizeSkill(name),
        level: "Intermediate",
      }));
  }

  // Template mapping
  let template: TemplateId = raw.template || "classic";
  if (template === "blue" || template === "dark" || template === "green") {
    // Map legacy color templates to modern template themes
    template = "modern";
  }

  // Customization
  const customization = {
    ...DEFAULT_CUSTOMIZATION,
    ...(raw.customization || {}),
  };

  // If old template was blue/dark/green, adapt accent color
  if (raw.template === "blue") customization.accentColor = "#2563eb";
  if (raw.template === "dark") customization.accentColor = "#111827";
  if (raw.template === "green") customization.accentColor = "#047857";

  return {
    _id: raw._id?.toString() || raw.id,
    id: raw._id?.toString() || raw.id,
    userId: raw.userId?.toString(),
    title: raw.title || personalInfo.fullName ? `${personalInfo.fullName}'s Resume` : "Untitled Resume",
    template,
    personalInfo,
    summary: raw.summary || "",
    experience,
    education,
    projects,
    skills,
    certifications: Array.isArray(raw.certifications) ? raw.certifications : [],
    achievements: Array.isArray(raw.achievements) ? raw.achievements : [],
    languages: Array.isArray(raw.languages) ? raw.languages : [],
    publications: Array.isArray(raw.publications) ? raw.publications : [],
    volunteer: Array.isArray(raw.volunteer) ? raw.volunteer : [],
    coursework: Array.isArray(raw.coursework) ? raw.coursework : [],
    customSections: Array.isArray(raw.customSections) ? raw.customSections : [],
    sectionOrder: Array.isArray(raw.sectionOrder) && raw.sectionOrder.length > 0
      ? raw.sectionOrder
      : DEFAULT_SECTION_ORDER,
    customization,
    isAtsMode: Boolean(raw.isAtsMode),
    targetRole: raw.targetRole || "",
    jobDescription: raw.jobDescription || "",
    baseResumeId: raw.baseResumeId || undefined,
    tailoredFromId: raw.tailoredFromId || undefined,
    isDraftFallback: Boolean(raw.isDraftFallback),
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toISOString() : new Date().toISOString(),

    // Backwards-compatible string projections
    name: personalInfo.fullName,
    email: personalInfo.email,
    phone: personalInfo.phone,
    linkedin: personalInfo.linkedin,
    legacySkills: skills.map((s) => s.name).join(", "),
    legacyEducation: education.map((e) => `${e.degree} - ${e.institution}`).join("\n"),
    legacyProjects: projects.map((p) => `${p.title}: ${p.description}`).join("\n"),
    legacyExperience: experience.map((e) => `${e.position} at ${e.company}: ${e.description}`).join("\n"),
  };
}

/**
 * Prepares a ResumeData object for MongoDB storage, preserving both V2 structured documents
 * and legacy flat fields for backwards compatibility.
 */
export function prepareResumeForSave(data: Partial<ResumeData>): ResumeData {
  const normalized = normalizeResume(data);

  return {
    ...normalized,
    name: normalized.personalInfo.fullName,
    email: normalized.personalInfo.email,
    phone: normalized.personalInfo.phone,
    linkedin: normalized.personalInfo.linkedin,
  };
}
