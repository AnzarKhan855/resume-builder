import { ResumeData } from "@/src/types/resume";
import { normalizeResume, generateId } from "./resume-normalizer";

// In-memory store for development/demo environments when MongoDB is not connected
const globalStore = (global as any).__resumeStore || {
  resumes: [] as ResumeData[],
};
if (!(global as any).__resumeStore) {
  (global as any).__resumeStore = globalStore;

  // Pre-seed with a high quality demo resume
  globalStore.resumes.push(
    normalizeResume({
      _id: "demo-sample-resume",
      title: "Senior Full-Stack Engineer",
      template: "modern",
      personalInfo: {
        fullName: "Alex Morgan",
        email: "alex.morgan@example.com",
        phone: "+1 (555) 234-5678",
        location: "San Francisco, CA",
        jobTitle: "Senior Full-Stack Engineer",
        website: "https://alexmorgan.dev",
        linkedin: "linkedin.com/in/alexmorgan",
        github: "github.com/alexmorgan",
      },
      summary:
        "Results-driven Senior Full-Stack Engineer with 6+ years of experience architecting high-scale distributed systems, microservices, and reactive web applications. Passionate about engineering velocity, clean code, and scalable web architectures.",
      experience: [
        {
          id: generateId(),
          company: "CloudScale Technologies",
          position: "Lead Software Engineer",
          location: "San Francisco, CA",
          startDate: "2022-03",
          endDate: "Present",
          current: true,
          description:
            "Led a team of 8 engineers delivering enterprise cloud migration solutions serving 1.2M monthly active users.",
          highlights: [
            "Reduced API latency by 42% through Redis caching layers and edge optimization.",
            "Architected real-time WebSocket pipeline processing 80,000 events/sec with 99.99% uptime.",
            "Mentored junior engineers and spearheaded adoption of TypeScript and Next.js across the engineering org.",
          ],
        },
        {
          id: generateId(),
          company: "Apex Digital Labs",
          position: "Full-Stack Developer",
          location: "Austin, TX",
          startDate: "2019-06",
          endDate: "2022-02",
          current: false,
          description:
            "Engineered scalable customer-facing SaaS portals using React, Node.js, and PostgreSQL.",
          highlights: [
            "Implemented end-to-end OAuth2 and role-based access control (RBAC).",
            "Built automated CI/CD pipelines in GitHub Actions reducing deployment cycle from hours to 8 minutes.",
          ],
        },
      ],
      education: [
        {
          id: generateId(),
          institution: "University of California, Berkeley",
          degree: "Bachelor of Science",
          fieldOfStudy: "Computer Science",
          location: "Berkeley, CA",
          startDate: "2015-09",
          endDate: "2019-05",
          current: false,
          gpa: "3.85 / 4.0",
          achievements: ["Dean's Honors List (6 semesters)", "Lead Organizer: CalHacks 2018"],
        },
      ],
      projects: [
        {
          id: generateId(),
          title: "PulseAnalytics — Realtime Metrics Dashboard",
          subtitle: "Open Source Project",
          link: "https://pulseanalytics.dev",
          github: "https://github.com/alexmorgan/pulse",
          startDate: "2023",
          endDate: "2024",
          technologies: ["Next.js", "Go", "ClickHouse", "Tailwind CSS"],
          description:
            "Engineered an open-source analytics platform capable of streaming 100k events/sec with sub-second dashboard rendering.",
        },
        {
          id: generateId(),
          title: "AI Resume Scanner & Parser",
          subtitle: "Side Project",
          link: "https://airesume.demo",
          technologies: ["React", "Python", "FastAPI", "Docker"],
          description:
            "Built an ATS optimization scanner that cross-references candidate resumes with job postings using vector embeddings.",
        },
      ],
      skills: [
        { id: generateId(), name: "TypeScript", category: "Languages", level: "Expert" },
        { id: generateId(), name: "React / Next.js", category: "Frameworks", level: "Expert" },
        { id: generateId(), name: "Node.js", category: "Languages", level: "Advanced" },
        { id: generateId(), name: "Go / Golang", category: "Languages", level: "Intermediate" },
        { id: generateId(), name: "PostgreSQL & MongoDB", category: "Databases", level: "Advanced" },
        { id: generateId(), name: "Docker & Kubernetes", category: "DevOps", level: "Intermediate" },
        { id: generateId(), name: "AWS & Vercel", category: "Cloud", level: "Advanced" },
        { id: generateId(), name: "System Design", category: "Architecture", level: "Advanced" },
      ],
      certifications: [
        {
          id: generateId(),
          name: "AWS Certified Solutions Architect",
          issuer: "Amazon Web Services",
          date: "2023-08",
        },
      ],
      languages: [
        { id: generateId(), language: "English", proficiency: "Native" },
        { id: generateId(), language: "Spanish", proficiency: "Professional" },
      ],
      achievements: [
        {
          id: generateId(),
          title: "TechCrunch Disrupt Hackathon Winner (2021)",
          description: "Ranked 1st out of 180 teams for building collaborative developer tools.",
        },
      ],
      customSections: [],
      sectionOrder: [
        "personalInfo",
        "summary",
        "experience",
        "projects",
        "skills",
        "education",
        "certifications",
        "languages",
      ],
      customization: {
        themeId: "navy",
        accentColor: "#1e3a8a",
        fontFamily: "var(--font-geist-sans), sans-serif",
        fontSize: "md",
        spacing: "normal",
        headingStyle: "uppercase",
      },
    })
  );
}

export const memoryStore = {
  getAll: (userId?: string): ResumeData[] => {
    const nonDemo = globalStore.resumes.filter(
      (r: ResumeData) => r._id !== "demo-sample-resume" && r.id !== "demo-sample-resume"
    );
    if (userId) {
      return nonDemo.filter((r: ResumeData) => r.userId === userId);
    }
    return nonDemo;
  },
  getById: (id: string): ResumeData | undefined => {
    return globalStore.resumes.find((r: ResumeData) => r._id === id || r.id === id);
  },
  create: (data: Partial<ResumeData>): ResumeData => {
    const id = generateId();
    const resume = normalizeResume({ ...data, _id: id, id });
    globalStore.resumes.unshift(resume);
    return resume;
  },
  update: (id: string, data: Partial<ResumeData>): ResumeData | null => {
    const idx = globalStore.resumes.findIndex((r: ResumeData) => r._id === id || r.id === id);
    if (idx === -1) return null;
    const updated = normalizeResume({ ...globalStore.resumes[idx], ...data, _id: id, id, updatedAt: new Date().toISOString() });
    globalStore.resumes[idx] = updated;
    return updated;
  },
  delete: (id: string): boolean => {
    const idx = globalStore.resumes.findIndex((r: ResumeData) => r._id === id || r.id === id);
    if (idx === -1) return false;
    globalStore.resumes.splice(idx, 1);
    return true;
  },
};
