import React from "react";
import { ResumeData } from "@/src/types/resume";
import { TEMPLATES_REGISTRY, TemplateCategory } from "@/src/lib/templates-registry";
import DynamicTemplateRenderer from "./DynamicTemplateRenderer";
import ClassicTemplate from "./ClassicTemplate";
import ModernTemplate from "./ModernTemplate";
import MinimalTemplate from "./MinimalTemplate";
import ProfessionalTemplate from "./ProfessionalTemplate";
import TechnicalTemplate from "./TechnicalTemplate";

export interface TemplateInfo {
  id: string;
  name: string;
  category?: TemplateCategory;
  tagline: string;
  description: string;
  badge: string;
  bestFor: string;
  recommendedColor: string;
}

export const AVAILABLE_TEMPLATES: TemplateInfo[] = TEMPLATES_REGISTRY.map((t) => ({
  id: t.id,
  name: t.name,
  category: t.category,
  tagline: t.tagline,
  description: t.description,
  badge: t.badge,
  bestFor: t.bestFor,
  recommendedColor: t.recommendedColor,
}));

export default function TemplateRenderer({ data }: { data: ResumeData }) {
  const template = data.template || "classic";

  // If in strict ATS mode or if it's one of the 50 registry templates, use DynamicTemplateRenderer
  if (data.isAtsMode) {
    return <DynamicTemplateRenderer data={data} />;
  }

  // Check if it's one of the original 5 base templates and has no newly added extended sections
  const hasExtendedSections =
    (data.publications && data.publications.length > 0) ||
    (data.volunteer && data.volunteer.length > 0) ||
    (data.coursework && data.coursework.length > 0) ||
    (data.awards && data.awards.length > 0) ||
    (data.interests && data.interests.length > 0);

  if (!hasExtendedSections) {
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
        return <ClassicTemplate data={data} />;
    }
  }

  // Universal dynamic renderer for all 50 templates
  return <DynamicTemplateRenderer data={data} />;
}
