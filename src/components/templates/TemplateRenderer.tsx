import React from "react";
import { ResumeData } from "@/src/types/resume";
import ClassicTemplate from "./ClassicTemplate";
import ModernTemplate from "./ModernTemplate";
import MinimalTemplate from "./MinimalTemplate";
import ProfessionalTemplate from "./ProfessionalTemplate";
import TechnicalTemplate from "./TechnicalTemplate";

export interface TemplateInfo {
  id: string;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  bestFor: string;
  recommendedColor: string;
}

export const AVAILABLE_TEMPLATES: TemplateInfo[] = [
  {
    id: "classic",
    name: "Classic",
    tagline: "The timeless ATS standard",
    description: "Traditional serif layout with centered headers and clean horizontal rules. High pass rate through ATS screening.",
    badge: "ATS Gold Standard",
    bestFor: "Corporate, Academia, Law, Healthcare, Banking",
    recommendedColor: "#1e3a8a",
  },
  {
    id: "modern",
    name: "Modern",
    tagline: "Sleek and well-structured",
    description: "Contemporary sans-serif typography with vertical accent border lines and date badges.",
    badge: "Most Popular",
    bestFor: "Product Managers, Marketers, Designers, Sales",
    recommendedColor: "#2563eb",
  },
  {
    id: "minimal",
    name: "Minimal",
    tagline: "Whitespace and typographic clarity",
    description: "Ultra-clean two-column structure with subtle labels and generous breathing room.",
    badge: "Recruiter Favorite",
    bestFor: "Executives, Writers, Analysts, Creatives",
    recommendedColor: "#0f172a",
  },
  {
    id: "professional",
    name: "Professional",
    tagline: "Executive presence and authority",
    description: "Prominent top header band with grid layout for competencies and leadership achievements.",
    badge: "Executive Pick",
    bestFor: "Consultants, Directors, Executives, Finance",
    recommendedColor: "#065f46",
  },
  {
    id: "technical",
    name: "Technical",
    tagline: "Engineered for developers",
    description: "Monospace highlights, categorized tech stacks, GitHub callouts, and project architecture summaries.",
    badge: "Software / IT",
    bestFor: "Software Engineers, DevOps, Data Scientists, Architects",
    recommendedColor: "#0284c7",
  },
];

export default function TemplateRenderer({ data }: { data: ResumeData }) {
  const template = data.template || "classic";

  switch (template) {
    case "modern":
    case "blue":
      return <ModernTemplate data={data} />;
    case "minimal":
      return <MinimalTemplate data={data} />;
    case "professional":
    case "dark":
    case "green":
      return <ProfessionalTemplate data={data} />;
    case "technical":
      return <TechnicalTemplate data={data} />;
    case "classic":
    default:
      return <ClassicTemplate data={data} />;
  }
}
