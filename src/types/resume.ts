export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location?: string;
  jobTitle?: string;
  website?: string;
  linkedin?: string;
  github?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  highlights?: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa?: string;
  achievements?: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  subtitle?: string;
  link?: string;
  github?: string;
  startDate?: string;
  endDate?: string;
  technologies?: string[];
  description: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category?: string; // e.g., "Languages", "Frameworks", "Tools", "Soft Skills"
  level?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  date?: string;
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: "Native" | "Fluent" | "Professional" | "Conversational" | "Basic";
}

export interface PublicationItem {
  id: string;
  title: string;
  publisher?: string;
  date?: string;
  url?: string;
  description?: string;
}

export interface VolunteerItem {
  id: string;
  organization: string;
  role: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  highlights?: string[];
}

export interface CourseworkItem {
  id: string;
  name: string;
  institution?: string;
  date?: string;
  skills?: string[];
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  description: string;
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomSectionItem[];
}

export type TemplateId =
  | "classic"
  | "modern"
  | "minimal"
  | "professional"
  | "technical"
  | "blue"
  | "dark"
  | "green"
  | string;

export interface ResumeCustomization {
  themeId: string;
  accentColor: string;
  fontFamily: string;
  fontSize: "sm" | "md" | "lg";
  spacing: "compact" | "normal" | "spacious";
  lineSpacing?: "tight" | "normal" | "relaxed";
  margins?: "compact" | "normal" | "spacious";
  headingStyle?: "uppercase" | "capitalize" | "standard";
}

export interface ResumeData {
  _id?: string;
  id?: string;
  userId?: string;
  title: string;
  template: TemplateId;
  personalInfo: PersonalInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  skills: SkillItem[];
  certifications: CertificationItem[];
  achievements: AchievementItem[];
  languages: LanguageItem[];
  publications?: PublicationItem[];
  volunteer?: VolunteerItem[];
  coursework?: CourseworkItem[];
  customSections: CustomSection[];
  sectionOrder: string[];
  customization: ResumeCustomization;
  isAtsMode?: boolean;
  createdAt?: string;
  updatedAt?: string;

  // Legacy flat fields for backward compatibility
  name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  legacySkills?: string;
  legacyEducation?: string;
  legacyProjects?: string;
  legacyExperience?: string;
}

export const DEFAULT_SECTION_ORDER = [
  "personalInfo",
  "summary",
  "experience",
  "education",
  "projects",
  "skills",
  "certifications",
  "achievements",
  "languages",
  "publications",
  "volunteer",
  "coursework",
  "customSections",
];

export const DEFAULT_CUSTOMIZATION: ResumeCustomization = {
  themeId: "navy",
  accentColor: "#1e3a8a",
  fontFamily: "var(--font-geist-sans), sans-serif",
  fontSize: "md",
  spacing: "normal",
  lineSpacing: "normal",
  margins: "normal",
  headingStyle: "uppercase",
};

export const INITIAL_RESUME_DATA: ResumeData = {
  title: "Untitled Resume",
  template: "classic",
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    jobTitle: "",
    website: "",
    linkedin: "",
    github: "",
  },
  summary: "",
  experience: [],
  education: [],
  projects: [],
  skills: [],
  certifications: [],
  achievements: [],
  languages: [],
  publications: [],
  volunteer: [],
  coursework: [],
  customSections: [],
  sectionOrder: DEFAULT_SECTION_ORDER,
  customization: DEFAULT_CUSTOMIZATION,
  isAtsMode: false,
};
