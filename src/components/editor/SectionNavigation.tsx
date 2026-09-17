"use client";

import React from "react";
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Code2,
  Award,
  Globe,
  PlusSquare,
  ArrowUpDown,
  Trophy,
  BookOpen,
  HeartHandshake,
  BookCheck,
} from "lucide-react";

export type SectionTabId =
  | "personalInfo"
  | "summary"
  | "experience"
  | "education"
  | "projects"
  | "skills"
  | "certifications"
  | "achievements"
  | "languages"
  | "publications"
  | "volunteer"
  | "coursework"
  | "customSections"
  | "reorder";

interface SectionNavigationProps {
  activeTab: SectionTabId;
  onSelectTab: (tab: SectionTabId) => void;
  counts: { [key in SectionTabId]?: number };
}

export const SECTIONS_CONFIG: { id: SectionTabId; label: string; icon: any }[] = [
  { id: "personalInfo", label: "Personal Info", icon: User },
  { id: "summary", label: "Summary", icon: FileText },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "skills", label: "Skills", icon: Code2 },
  { id: "certifications", label: "Certifications", icon: Award },
  { id: "achievements", label: "Achievements", icon: Trophy },
  { id: "languages", label: "Languages", icon: Globe },
  { id: "publications", label: "Publications", icon: BookOpen },
  { id: "volunteer", label: "Volunteer", icon: HeartHandshake },
  { id: "coursework", label: "Coursework", icon: BookCheck },
  { id: "customSections", label: "Custom Section", icon: PlusSquare },
  { id: "reorder", label: "Reorder Sections", icon: ArrowUpDown },
];

export default function SectionNavigation({
  activeTab,
  onSelectTab,
  counts,
}: SectionNavigationProps) {
  return (
    <div className="flex border-b border-slate-200 bg-white overflow-x-auto no-scrollbar px-2">
      {SECTIONS_CONFIG.map((sec) => {
        const Icon = sec.icon;
        const isActive = activeTab === sec.id;
        const count = counts[sec.id];

        return (
          <button
            key={sec.id}
            type="button"
            onClick={() => onSelectTab(sec.id)}
            className={`flex items-center gap-1.5 py-3 px-3.5 text-xs font-semibold border-b-2 transition whitespace-nowrap shrink-0 ${
              isActive
                ? "border-blue-600 text-blue-600 bg-blue-50/20"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span>{sec.label}</span>
            {typeof count === "number" && count > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
