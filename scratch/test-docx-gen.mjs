import { createDocxDocument } from "../src/lib/docx-generator.js";
import { INITIAL_RESUME_DATA } from "../src/types/resume.js";
import { Packer } from "docx";

const testData = {
  ...INITIAL_RESUME_DATA,
  personalInfo: {
    fullName: "Jane Doe",
    email: "jane@example.com",
    phone: "555-123-4567",
    jobTitle: "Senior Software Engineer",
    location: "Austin, TX",
  },
  summary: "Experienced software engineer with strong technical skills.",
  experience: [
    {
      id: "1",
      company: "Tech Corp",
      position: "Staff Engineer",
      startDate: "2021",
      endDate: "Present",
      current: true,
      description: "Led core backend team",
      highlights: ["Improved throughput by 45%", "Mentored 6 engineers"],
    },
  ],
  education: [
    {
      id: "e1",
      institution: "MIT",
      degree: "B.S. in Computer Science",
      startDate: "2016",
      endDate: "2020",
    },
  ],
  skills: [
    { id: "s1", name: "TypeScript" },
    { id: "s2", name: "Go" },
    { id: "s3", name: "Kubernetes" },
  ],
  publications: [
    {
      id: "p1",
      title: "Scalable Microservices",
      publisher: "ACM",
      date: "2023",
    },
  ],
  volunteer: [
    {
      id: "v1",
      organization: "Code.org",
      role: "Mentor",
      startDate: "2022",
    },
  ],
  coursework: [
    { id: "c1", name: "Distributed Systems" },
  ],
};

const doc = createDocxDocument(testData);
const buf = await Packer.toBuffer(doc);
console.log("DOCX generated successfully! Size:", buf.length, "bytes");
